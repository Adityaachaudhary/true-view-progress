# True View Progress

An advanced video progress tracking system that intelligently measures actual learning engagement through unique segment tracking.


## Overview

True View Progress is designed to provide accurate video learning progress by only counting unique segments watched, preventing inflation from rewatching the same content. The system implements smart tracking that ensures only genuinely watched content contributes to the progress percentage.


## Features

- **Accurate Progress Tracking**: Only counts unique segments of the video that have been viewed
- **Smart Skip Detection**: Skipping ahead or fast-forwarding is not counted as watched time
- **Visual Progress Indicator**: Shows which parts of the video have been watched
- **Analytics Dashboard**: Detailed breakdown of watched segments with time intervals
- **Export/Import Progress**: Save and restore viewing progress data
- **Auto-Save**: Progress is automatically saved between sessions
- **Resume Playback**: Automatically continues from where you left off

##Live Link
https://true-progress-tracker.vercel.app/


## Technical Stack

- **Frontend Framework**: React.js with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + CSS Modules
- **Video Player**: React Player
- **Data Persistence**: Browser LocalStorage
- **Build System**: Vite

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/true-view-progress.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Implementation Details

### Progress Tracking Mechanism

The system implements a sophisticated interval tracking mechanism:

1. **Interval Recording**: 
   - Captures start and end times of each watched video segment
   - Stores intervals as `{start: number, end: number}` pairs
   - Updates in real-time as user watches content

2. **Interval Merging**:
   ```typescript
   // Example: Initial intervals
   [{ start: 0, end: 20 }, { start: 15, end: 30 }]
   // Merged result
   [{ start: 0, end: 30 }]
   ```

3. **Progress Calculation**:
   - Sums up lengths of merged intervals
   - Divides by total video duration
   - Updates progress percentage in real-time

### Technical Architecture

The implementation is built on three core components:

1. **VideoProgressTracker Class**:
   - Manages interval tracking logic
   - Handles interval merging
   - Calculates progress percentage
   - Manages localStorage persistence

2. **useVideoProgress Hook**:
   - Provides React interface to tracker
   - Manages tracker lifecycle
   - Exposes tracking methods
   - Handles state updates

3. **VideoPlayer Component**:
   - Implements tracking UI
   - Displays progress visualization
   - Shows analytics interface

## Implementation Challenges & Solutions

1. **Accurate Progress Tracking**:
   - Challenge: Preventing progress inflation from rewatching
   - Solution: Implemented interval merging to count unique segments

2. **Performance Optimization**:
   - Challenge: Handling frequent interval updates
   - Solution: Optimized merge algorithm and debounced updates

3. **State Persistence**:
   - Challenge: Reliable progress saving
   - Solution: Implemented robust localStorage handling with error recovery

4. **User Experience**:
   - Challenge: Smooth progress visualization
   - Solution: Optimized progress bar updates and added visual feedback

## Usage Example

```typescript
// Import the hook
import { useVideoProgress } from '@/hooks/use-video-progress';

// In your component
const {
  progressPercentage,
  lastPosition,
  watchedIntervals,
  startTracking,
  stopTracking,
  handleSeek,
  reset
} = useVideoProgress({
  videoId: 'unique-video-id',
  duration: videoDurationInSeconds
});
```
