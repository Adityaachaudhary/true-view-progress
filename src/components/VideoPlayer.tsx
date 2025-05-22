
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

interface WatchedInterval {
  start: number;
  end: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, description }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedIntervals, setWatchedIntervals] = useState<WatchedInterval[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const trackingStartTime = useRef<number>(0);
  const localStorageKey = `videoProgress-${videoUrl.split('/').pop()}`;

  // Load saved progress on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(localStorageKey);
    if (savedData) {
      const { intervals, lastPos } = JSON.parse(savedData);
      setWatchedIntervals(intervals || []);
      setLastPosition(lastPos || 0);
      
      if (lastPos > 0) {
        toast({
          title: "Progress Restored",
          description: `Resuming from ${formatTime(lastPos)}`,
        });
      }
    }
  }, [localStorageKey]);

  // Save progress to localStorage whenever intervals change
  useEffect(() => {
    if (watchedIntervals.length > 0) {
      const dataToSave = {
        intervals: watchedIntervals,
        lastPos: currentTime
      };
      localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
    }
  }, [watchedIntervals, currentTime, localStorageKey]);

  // Calculate progress percentage
  useEffect(() => {
    if (duration > 0) {
      const totalWatched = calculateUniqueWatchedTime(watchedIntervals);
      const percentage = (totalWatched / duration) * 100;
      setProgressPercentage(Math.min(percentage, 100));
    }
  }, [watchedIntervals, duration]);

  // Resume video at last position when duration is loaded
  useEffect(() => {
    if (videoRef.current && duration > 0 && lastPosition > 0) {
      videoRef.current.currentTime = lastPosition;
      setCurrentTime(lastPosition);
    }
  }, [duration, lastPosition]);

  const mergeIntervals = (intervals: WatchedInterval[]): WatchedInterval[] => {
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
  };

  const calculateUniqueWatchedTime = (intervals: WatchedInterval[]): number => {
    const merged = mergeIntervals(intervals);
    return merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        stopTracking();
      } else {
        videoRef.current.play()
          .catch(error => {
            toast({
              title: "Playback Failed",
              description: "Unable to play video. Please try again.",
              variant: "destructive",
            });
            console.error("Video playback error:", error);
          });
        startTracking();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startTracking = () => {
    if (!isTracking) {
      trackingStartTime.current = currentTime;
      setIsTracking(true);
    }
  };

  const stopTracking = () => {
    if (isTracking && trackingStartTime.current !== currentTime) {
      // Only add interval if at least 1 second was watched
      if (Math.abs(trackingStartTime.current - currentTime) >= 1) {
        const newInterval: WatchedInterval = {
          start: Math.min(trackingStartTime.current, currentTime),
          end: Math.max(trackingStartTime.current, currentTime)
        };
        
        setWatchedIntervals(prev => {
          const updated = [...prev, newInterval];
          return mergeIntervals(updated);
        });
      }
      setIsTracking(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeeking) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Check for seeking (jumping around)
      if (isTracking && Math.abs(time - currentTime) > 1) {
        // User seeked, stop current tracking and start new
        stopTracking();
        trackingStartTime.current = time;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    stopTracking();
    setIsPlaying(false);
  };

  const handleSeek = (newValue: number[]) => {
    if (videoRef.current) {
      setIsSeeking(true);
      
      // Stop current tracking
      if (isTracking) {
        stopTracking();
      }
      
      const seekTime = (newValue[0] / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      
      // Start new tracking after seeking
      trackingStartTime.current = seekTime;
      
      // Reset seeking state after a short delay
      setTimeout(() => {
        setIsSeeking(false);
        if (isPlaying) {
          setIsTracking(true);
        }
      }, 100);
    }
  };

  const resetProgress = () => {
    setWatchedIntervals([]);
    setProgressPercentage(0);
    setLastPosition(0);
    localStorage.removeItem(localStorageKey);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    toast({
      title: "Progress Reset",
      description: "Your viewing progress has been reset.",
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatProgress = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-xl bg-card">
      {/* Video Container */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => startTracking()}
          onPause={() => stopTracking()}
          onEnded={handleVideoEnded}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-col gap-2">
            {/* Progress bar */}
            <div className="flex items-center gap-2 text-white">
              <span className="text-xs font-mono">{formatTime(currentTime)}</span>
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                min={0}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1 cursor-pointer"
              />
              <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4 text-white">
              <Button
                onClick={handlePlayPause}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {formatProgress(progressPercentage)} watched
                </span>
              </div>
              
              <div className="flex-1" />
              
              <Button
                onClick={resetProgress}
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Progress
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      {(title || description) && (
        <div className="p-4">
          {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
