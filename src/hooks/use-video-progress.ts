import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoProgressTracker, VideoProgressData, WatchedInterval } from '@/lib/videoProgressTracker';

interface UseVideoProgressProps {
  videoId: string;
  duration?: number;
  onProgressUpdate?: (data: VideoProgressData) => void;
}

interface UseVideoProgressReturn {
  progressPercentage: number;
  lastPosition: number;
  watchedIntervals: WatchedInterval[];
  startTracking: (currentTime: number) => void;
  stopTracking: (currentTime: number) => void;
  handleSeek: (currentTime: number) => void;
  updatePosition: (currentTime: number) => void;
  reset: () => void;
  exportProgressData: () => string;
  importProgressData: (jsonData: string) => boolean;
}

/**
 * Custom hook for tracking video progress in React components
 * 
 * @param videoId - Unique identifier for the video
 * @param duration - Duration of the video in seconds
 * @param onProgressUpdate - Optional callback function called when progress is updated
 * @returns Object with progress data and utility functions
 */
export function useVideoProgress({ 
  videoId, 
  duration = 0,
  onProgressUpdate 
}: UseVideoProgressProps): UseVideoProgressReturn {
  const trackerRef = useRef<VideoProgressTracker | null>(null);
  const [progressData, setProgressData] = useState<VideoProgressData>({
    intervals: [],
    lastPosition: 0,
    totalProgress: 0,
    videoId,
    updatedAt: new Date().toISOString()
  });

  // Initialize the tracker on mount
  useEffect(() => {
    const handleProgressUpdate = (data: VideoProgressData) => {
      setProgressData(data);
      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    };

    trackerRef.current = new VideoProgressTracker(videoId, duration, handleProgressUpdate);
    
    // Set initial progress data
    setProgressData(trackerRef.current.getProgressData());

    // Update the duration when it changes
    if (duration > 0 && trackerRef.current) {
      trackerRef.current.setDuration(duration);
    }

    return () => {
      // Any cleanup if needed
    };
  }, [videoId]);

  // Update duration when it changes
  useEffect(() => {
    if (duration > 0 && trackerRef.current) {
      trackerRef.current.setDuration(duration);
    }
  }, [duration]);

  // Start tracking a new segment
  const startTracking = useCallback((currentTime: number) => {
    if (trackerRef.current) {
      trackerRef.current.startTracking(currentTime);
    }
  }, []);

  // Stop tracking the current segment
  const stopTracking = useCallback((currentTime: number) => {
    if (trackerRef.current) {
      trackerRef.current.stopTracking(currentTime);
    }
  }, []);

  // Handle seeking/jumping in the video
  const handleSeek = useCallback((currentTime: number) => {
    if (trackerRef.current) {
      trackerRef.current.handleSeek(currentTime);
    }
  }, []);

  // Update position without adding to watched intervals
  const updatePosition = useCallback((currentTime: number) => {
    if (trackerRef.current) {
      trackerRef.current.updatePosition(currentTime);
    }
  }, []);

  // Reset all progress data
  const reset = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.reset();
    }
  }, []);

  // Export progress data as JSON
  const exportProgressData = useCallback((): string => {
    if (trackerRef.current) {
      return trackerRef.current.exportProgressData();
    }
    return '';
  }, []);

  // Import progress data from JSON
  const importProgressData = useCallback((jsonData: string): boolean => {
    if (trackerRef.current) {
      return trackerRef.current.importProgressData(jsonData);
    }
    return false;
  }, []);

  return {
    progressPercentage: progressData.totalProgress,
    lastPosition: progressData.lastPosition,
    watchedIntervals: progressData.intervals,
    startTracking,
    stopTracking,
    handleSeek,
    updatePosition,
    reset,
    exportProgressData,
    importProgressData
  };
} 