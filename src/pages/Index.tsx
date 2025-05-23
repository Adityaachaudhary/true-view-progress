import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import VideoPlayer from '@/components/VideoPlayer';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';

const Index = () => {
  // Sample video URLs - using Big Buck Bunny sample video
  const lectureVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <Navbar />
      <div className="container py-6">
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
          Advanced progress tracking that measures actual learning engagement.
          Only unique video segments count toward your progress.
        </p>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Video Player Section */}
          <div className="w-full">
            <VideoPlayer 
              videoUrl={lectureVideoUrl} 
              title="Introduction to Smart Learning"
              description="This lecture covers the fundamentals of effective learning techniques."
            />
          </div>
          
          <Card className="p-6 bg-white dark:bg-slate-800 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">How This Video Tracker Works</h3>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-blue-500 text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <p>The system only counts <strong>unique segments</strong> you've watched. Re-watching the same section doesn't increase your progress.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-blue-500 text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <p><strong>Skipping ahead</strong> doesn't count as watching. You must actually view the content for it to count toward your progress.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-blue-500 text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <p>Your progress is <strong>automatically saved</strong> and will be there when you return, even after closing your browser.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-blue-500 text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <p>The video will <strong>resume from where you left off</strong> when you return to this page.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
