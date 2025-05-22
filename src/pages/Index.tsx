
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WatchedInterval {
  start: number;
  end: number;
}

const Index = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedIntervals, setWatchedIntervals] = useState<WatchedInterval[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const trackingStartTime = useRef<number>(0);

  // Sample video URL - using a Big Buck Bunny sample video
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Load saved progress on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('videoProgress');
    if (savedData) {
      const { intervals, lastPos } = JSON.parse(savedData);
      setWatchedIntervals(intervals || []);
      setLastPosition(lastPos || 0);
    }
  }, []);

  // Save progress to localStorage whenever intervals change
  useEffect(() => {
    if (watchedIntervals.length > 0) {
      const dataToSave = {
        intervals: watchedIntervals,
        lastPos: currentTime
      };
      localStorage.setItem('videoProgress', JSON.stringify(dataToSave));
    }
  }, [watchedIntervals, currentTime]);

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
        videoRef.current.play();
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
      const newInterval: WatchedInterval = {
        start: trackingStartTime.current,
        end: currentTime
      };
      
      setWatchedIntervals(prev => {
        const updated = [...prev, newInterval];
        return mergeIntervals(updated);
      });
      setIsTracking(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Check for seeking (jumping around)
      const timeDiff = Math.abs(time - trackingStartTime.current);
      if (isTracking && timeDiff > 2) {
        // User seeked, stop current tracking and start new
        stopTracking();
        startTracking();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const resetProgress = () => {
    setWatchedIntervals([]);
    setProgressPercentage(0);
    setLastPosition(0);
    localStorage.removeItem('videoProgress');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Smart Video Learning Platform
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Advanced progress tracking that measures actual learning engagement.
            Only unique video segments count toward your progress.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={startTracking}
                    onPause={stopTracking}
                    onSeeking={() => {
                      if (isTracking) {
                        stopTracking();
                      }
                    }}
                    onSeeked={startTracking}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Custom Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white">
                      <Button
                        onClick={handlePlayPause}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <span className="text-sm font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      
                      <div className="flex-1" />
                      
                      <Button
                        onClick={resetProgress}
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Dashboard */}
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="border-l-4 border-l-blue-600 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatProgress(progressPercentage)}
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-3 bg-blue-100"
                    />
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Unique time watched:</span>
                      <span className="font-mono">
                        {formatTime(calculateUniqueWatchedTime(watchedIntervals))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total duration:</span>
                      <span className="font-mono">{formatTime(duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Watched segments:</span>
                      <span className="font-semibold">{watchedIntervals.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Watched Intervals */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-800">Watched Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {watchedIntervals.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                      No segments watched yet. Start watching to see your progress!
                    </p>
                  ) : (
                    watchedIntervals.map((interval, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 bg-blue-50 rounded border-l-2 border-l-blue-400"
                      >
                        <span className="text-sm font-mono text-slate-700">
                          {formatTime(interval.start)} - {formatTime(interval.end)}
                        </span>
                        <span className="text-xs text-blue-600 font-semibold">
                          {formatTime(interval.end - interval.start)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-amber-50 border-amber-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-800 text-sm">How it Works</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-amber-700 space-y-2">
                <p>• Only <strong>unique</strong> video segments count toward progress</p>
                <p>• Rewatching sections doesn't increase progress</p>
                <p>• Skipping ahead doesn't count as progress</p>
                <p>• Your position is automatically saved and restored</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
