/**
 * Video Progress Tracker Tool
 * 
 * A utility for tracking unique segments of video that have been watched
 * and calculating accurate viewing progress.
 */

export interface WatchedInterval {
  start: number;
  end: number;
}

export interface VideoProgressData {
  intervals: WatchedInterval[];
  lastPosition: number;
  totalProgress: number;
  videoId: string;
  updatedAt: string;
}

export class VideoProgressTracker {
  private videoId: string;
  private watchedIntervals: WatchedInterval[] = [];
  private lastPosition: number = 0;
  private duration: number = 0;
  private trackingStartTime: number = 0;
  private isTracking: boolean = false;
  private storageKey: string;
  private totalProgress: number = 0;
  private onProgressUpdate?: (data: VideoProgressData) => void;

  /**
   * Creates a new VideoProgressTracker instance
   * 
   * @param videoId - Unique identifier for the video
   * @param duration - Duration of the video in seconds
   * @param onProgressUpdate - Optional callback function called when progress is updated
   */
  constructor(
    videoId: string, 
    duration: number = 0, 
    onProgressUpdate?: (data: VideoProgressData) => void
  ) {
    this.videoId = videoId;
    this.duration = duration;
    this.storageKey = `videoProgress-${videoId}`;
    this.onProgressUpdate = onProgressUpdate;
    this.loadSavedProgress();
  }

  /**
   * Loads saved progress from localStorage
   */
  private loadSavedProgress(): void {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const { intervals, lastPos } = JSON.parse(savedData);
        this.watchedIntervals = intervals || [];
        this.lastPosition = lastPos || 0;
        this.calculateProgress();
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }

  /**
   * Saves current progress to localStorage
   */
  private saveProgress(): void {
    try {
      const dataToSave = {
        intervals: this.watchedIntervals,
        lastPos: this.lastPosition
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      
      if (this.onProgressUpdate) {
        this.onProgressUpdate(this.getProgressData());
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Sets the duration of the video
   * 
   * @param duration - Duration in seconds
   */
  public setDuration(duration: number): void {
    this.duration = duration;
    this.calculateProgress();
  }

  /**
   * Starts tracking a new segment from the current position
   * 
   * @param currentPosition - The current playback position in seconds
   */
  public startTracking(currentPosition: number): void {
    if (!this.isTracking) {
      this.trackingStartTime = currentPosition;
      this.isTracking = true;
    }
  }

  /**
   * Stops tracking the current segment and adds it to watched intervals
   * 
   * @param currentPosition - The current playback position in seconds
   */
  public stopTracking(currentPosition: number): void {
    if (this.isTracking && this.trackingStartTime !== currentPosition) {
      // Only add interval if at least 1 second was watched
      if (Math.abs(this.trackingStartTime - currentPosition) >= 1) {
        const newInterval: WatchedInterval = {
          start: Math.min(this.trackingStartTime, currentPosition),
          end: Math.max(this.trackingStartTime, currentPosition)
        };
        
        this.watchedIntervals.push(newInterval);
        this.watchedIntervals = this.mergeIntervals(this.watchedIntervals);
        this.lastPosition = currentPosition;
        this.calculateProgress();
        this.saveProgress();
      }
      this.isTracking = false;
    }
  }

  /**
   * Updates the current position without adding to watched intervals
   * This is useful for seeking/jumping around in the video
   * 
   * @param currentPosition - The current playback position in seconds
   */
  public updatePosition(currentPosition: number): void {
    this.lastPosition = currentPosition;
    this.saveProgress();
  }

  /**
   * Handle seeking/jumping in the video
   * 
   * @param currentPosition - The new position after seeking
   */
  public handleSeek(currentPosition: number): void {
    if (this.isTracking) {
      this.stopTracking(this.lastPosition);
    }
    this.lastPosition = currentPosition;
    if (this.isTracking) {
      this.trackingStartTime = currentPosition;
    }
  }

  /**
   * Calculate the total progress percentage based on unique watched intervals
   */
  private calculateProgress(): void {
    if (this.duration > 0) {
      const totalWatched = this.calculateUniqueWatchedTime();
      this.totalProgress = Math.min((totalWatched / this.duration) * 100, 100);
    }
  }

  /**
   * Merge overlapping intervals to avoid counting the same segment twice
   * 
   * @param intervals - Array of watched intervals
   * @returns Merged intervals with no overlaps
   */
  private mergeIntervals(intervals: WatchedInterval[]): WatchedInterval[] {
    if (intervals.length === 0) return [];
    
    const sorted = [...intervals].sort((a, b) => a.start - b.start);
    const merged: WatchedInterval[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const lastMerged = merged[merged.length - 1];
      
      if (current.start <= lastMerged.end) {
        lastMerged.end = Math.max(lastMerged.end, current.end);
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }

  /**
   * Calculate the total time watched after merging overlapping intervals
   * 
   * @returns Total unique time watched in seconds
   */
  private calculateUniqueWatchedTime(): number {
    const merged = this.mergeIntervals(this.watchedIntervals);
    return merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
  }

  /**
   * Get the current progress data
   * 
   * @returns The current progress data
   */
  public getProgressData(): VideoProgressData {
    return {
      intervals: this.getMergedIntervals(),
      lastPosition: this.lastPosition,
      totalProgress: this.totalProgress,
      videoId: this.videoId,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get the merged intervals (with no overlaps)
   * 
   * @returns Array of merged intervals
   */
  public getMergedIntervals(): WatchedInterval[] {
    return this.mergeIntervals(this.watchedIntervals);
  }

  /**
   * Get the current progress percentage
   * 
   * @returns Progress percentage (0-100)
   */
  public getProgressPercentage(): number {
    return this.totalProgress;
  }

  /**
   * Get the last watched position
   * 
   * @returns Last position in seconds
   */
  public getLastPosition(): number {
    return this.lastPosition;
  }

  /**
   * Reset all progress data
   */
  public reset(): void {
    this.watchedIntervals = [];
    this.lastPosition = 0;
    this.totalProgress = 0;
    localStorage.removeItem(this.storageKey);
    if (this.onProgressUpdate) {
      this.onProgressUpdate(this.getProgressData());
    }
  }

  /**
   * Export progress data as a JSON string
   * 
   * @returns JSON string of progress data
   */
  public exportProgressData(): string {
    const data = {
      videoId: this.videoId,
      intervals: this.watchedIntervals,
      lastPosition: this.lastPosition,
      totalProgress: this.totalProgress,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import progress data from a JSON string
   * 
   * @param jsonData - JSON string of progress data
   * @returns Success status
   */
  public importProgressData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.videoId === this.videoId) {
        this.watchedIntervals = data.intervals || [];
        this.lastPosition = data.lastPosition || 0;
        this.calculateProgress();
        this.saveProgress();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing progress data:', error);
      return false;
    }
  }
} 