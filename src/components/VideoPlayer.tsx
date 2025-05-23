import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, BarChart2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { WatchedInterval } from '@/lib/videoProgressTracker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, description }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  const videoId = videoUrl.split('/').pop() || '';
  
  // Use our custom hook for tracking progress
  const {
    progressPercentage,
    lastPosition,
    watchedIntervals,
    startTracking,
    stopTracking,
    handleSeek: handleProgressSeek,
    reset: resetProgress,
    exportProgressData,
    importProgressData
  } = useVideoProgress({
    videoId,
    duration,
    onProgressUpdate: (data) => {
      // Optional callback when progress is updated
      updateWatchedSegmentsVisual(data.intervals);
    }
  });

  // Resume video at last position when duration is loaded
  useEffect(() => {
    if (videoRef.current && duration > 0 && lastPosition > 0) {
      videoRef.current.currentTime = lastPosition;
      setCurrentTime(lastPosition);
    }
  }, [duration, lastPosition]);

  // Update the visual representation of watched segments
  useEffect(() => {
    updateWatchedSegmentsVisual(watchedIntervals);
  }, [watchedIntervals, duration]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        stopTracking(currentTime);
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
        startTracking(currentTime);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeeking) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Check for seeking (jumping around)
      if (isPlaying && Math.abs(time - currentTime) > 1) {
        // User seeked, stop current tracking and start new
        stopTracking(currentTime);
        startTracking(time);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    stopTracking(currentTime);
    setIsPlaying(false);
  };

  const handleSeek = (newValue: number[]) => {
    if (videoRef.current) {
      setIsSeeking(true);
      
      const seekTime = (newValue[0] / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      
      // Use our hook's handleSeek method
      handleProgressSeek(seekTime);
      
      // Reset seeking state after a short delay
      setTimeout(() => {
        setIsSeeking(false);
        if (isPlaying) {
          startTracking(seekTime);
        }
      }, 100);
    }
  };

  const handleReset = () => {
    resetProgress();
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

  // Handle mouse hover on progress bar
  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const time = position * duration;
      
      setHoverTime(time);
      setHoverPosition({ x: e.clientX, y: rect.top });
    }
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
    setHoverPosition(null);
  };

  // Check if a time position is within watched intervals
  const isTimeWatched = (time: number): boolean => {
    return watchedIntervals.some(interval => time >= interval.start && time <= interval.end);
  };

  // Update visual representation of watched segments
  const updateWatchedSegmentsVisual = (intervals: WatchedInterval[]) => {
    if (progressBarRef.current && duration > 0) {
      // Clear existing segments
      const existingSegments = progressBarRef.current.querySelectorAll('.watched-segment');
      existingSegments.forEach(segment => segment.remove());
      
      // Create new segments for each watched interval
      intervals.forEach(interval => {
        const startPercent = (interval.start / duration) * 100;
        const endPercent = (interval.end / duration) * 100;
        const width = endPercent - startPercent;
        
        const segment = document.createElement('div');
        segment.className = 'watched-segment absolute h-full bg-green-500 opacity-70 pointer-events-none';
        segment.style.left = `${startPercent}%`;
        segment.style.width = `${width}%`;
        
        // Add data attributes for tooltip content
        segment.dataset.start = formatTime(interval.start);
        segment.dataset.end = formatTime(interval.end);
        
        progressBarRef.current?.appendChild(segment);
      });
    }
  };

  // Export progress data as JSON file
  const handleExportProgress = () => {
    const dataStr = exportProgressData();
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `video-progress-${videoId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Progress Exported",
      description: "Your viewing progress has been exported as JSON.",
    });
  };

  // Import progress data from JSON file
  const handleImportProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const success = importProgressData(content);
          
          if (success) {
            toast({
              title: "Progress Imported",
              description: "Your viewing progress has been successfully imported.",
            });
          } else {
            toast({
              title: "Import Failed",
              description: "The imported data is not compatible with this video.",
              variant: "destructive",
            });
          }
        };
        
        reader.readAsText(file);
      }
    };
    
    input.click();
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
          onPlay={() => startTracking(currentTime)}
          onPause={() => stopTracking(currentTime)}
          onEnded={handleVideoEnded}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-col gap-2">
            {/* Progress bar with watched segments visualization */}
            <div className="flex items-center gap-2 text-white">
              <span className="text-xs font-mono">{formatTime(currentTime)}</span>
              <TooltipProvider>
                <div 
                  className="flex-1 relative h-2" 
                  ref={progressBarRef}
                  onMouseMove={handleProgressBarMouseMove}
                  onMouseLeave={handleProgressBarMouseLeave}
                >
                  <Slider
                    value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  {/* Watched segments will be added here dynamically */}
                  
                  {/* Hover tooltip */}
                  {hoverTime !== null && hoverPosition !== null && (
                    <div 
                      className="absolute bg-black/80 text-white text-xs py-1 px-2 rounded pointer-events-none transform -translate-x-1/2"
                      style={{ 
                        left: `${(hoverTime / duration) * 100}%`,
                        top: '-28px'
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span>{formatTime(hoverTime)}</span>
                        <span className="text-[10px]">
                          {isTimeWatched(hoverTime) ? "Watched" : "Not watched"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TooltipProvider>
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
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-black bg-white hover:bg-white/90 mr-2 [&:hover>*]:text-black [&>*]:text-black [&:hover]:text-black"
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Viewing Analytics</DialogTitle>
                    <DialogDescription>
                      Detailed breakdown of your viewing progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2">Watched Segments</h4>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {watchedIntervals.map((interval, index) => (
                        <div key={index} className="text-sm bg-muted p-2 rounded-md flex justify-between">
                          <span>{formatTime(interval.start)} - {formatTime(interval.end)}</span>
                          <span>{formatTime(interval.end - interval.start)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Unique Time:</span>
                        <span className="text-sm font-medium">
                          {formatTime(watchedIntervals.reduce((total, interval) => 
                            total + (interval.end - interval.start), 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Video Duration:</span>
                        <span className="text-sm font-medium">{formatTime(duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Progress:</span>
                        <span className="text-sm font-medium">{formatProgress(progressPercentage)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" onClick={handleExportProgress}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button className="flex-1" onClick={handleImportProgress} variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="border-white/30 text-black bg-white hover:bg-white/90 [&:hover>*]:text-black [&>*]:text-black [&:hover]:text-black"
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
