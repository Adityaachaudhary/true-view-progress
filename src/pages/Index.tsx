
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import VideoPlayer from '@/components/VideoPlayer';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  // Sample video URLs - using Big Buck Bunny sample video
  const lectureVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Smart Video Learning Progress Tracker
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Advanced progress tracking that measures actual learning engagement.
            Only unique video segments count toward your progress.
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Video Player Section */}
          <div className="w-full">
            <VideoPlayer 
              videoUrl={lectureVideoUrl} 
              title="Introduction to Smart Learning"
              description="This lecture covers the fundamentals of effective learning techniques."
            />
          </div>
          
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">How This Video Tracker Works</h3>
            <div className="space-y-4 text-sm text-slate-600">
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
