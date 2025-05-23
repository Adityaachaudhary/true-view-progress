# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0fa50a63-35a5-48c7-8783-f72bf7008984

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0fa50a63-35a5-48c7-8783-f72bf7008984) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0fa50a63-35a5-48c7-8783-f72bf7008984) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# True View Progress

A video progress tracking tool that accurately measures how much of a video a viewer has actually watched. Unlike traditional video players that simply mark progress when a video finishes playing, this tool tracks each unique segment watched, preventing skipping or re-watching the same parts from counting toward progress.

## Features

- **Accurate Progress Tracking**: Only counts unique segments of the video that have been viewed.
- **Prevents Cheating**: Skipping ahead or fast-forwarding is not counted as watched time.
- **Visual Progress Indicator**: Shows which parts of the video have been watched with a colored overlay on the progress bar.
- **Analytics Dashboard**: Detailed breakdown of watched segments with time intervals.
- **Export/Import Progress**: Ability to save and restore viewing progress data.
- **Persistence**: Progress is automatically saved and restored between sessions.
- **Resumes Playback**: Automatically resumes from where the user left off.

## Technical Architecture

The system consists of three main components:

1. **VideoProgressTracker Class**: A standalone utility class that handles the core tracking functionality:
   - Tracks intervals of watched video segments
   - Merges overlapping segments to prevent double-counting
   - Calculates accurate progress percentage
   - Handles persistence to localStorage

2. **useVideoProgress Hook**: A React hook that provides a clean interface to the tracker:
   - Manages the tracker lifecycle
   - Exposes simple methods for components to use
   - Handles state updates and callbacks

3. **VideoPlayer Component**: A React component that demonstrates the tracking functionality:
   - Uses the hook to track progress
   - Provides visual indication of watched segments
   - Displays analytics and progress information

## How It Works

The system keeps track of each segment of the video that is watched. When a segment is watched, it is added to an array of "watched intervals." These intervals are then merged to eliminate any overlaps, ensuring that re-watching the same part of the video does not count toward progress multiple times.

```typescript
// Example watched intervals:
[
  { start: 0, end: 20 },  // User watched 0-20 seconds
  { start: 50, end: 60 }  // User watched 50-60 seconds
]

// If the user watches 15-25 seconds next, it merges with the first interval:
[
  { start: 0, end: 25 },  // Merged interval
  { start: 50, end: 60 }  // Unchanged
]
```

The total progress is calculated by summing up the duration of all merged intervals and dividing by the total video duration.

## Usage

To use the tracking tool in your own projects:

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

// Start tracking when video plays
const handlePlay = () => {
  startTracking(currentTimeInSeconds);
};

// Stop tracking when video pauses
const handlePause = () => {
  stopTracking(currentTimeInSeconds);
};

// Handle seeking/jumping in the video
const handleSeeking = (newPosition) => {
  handleSeek(newPosition);
};
```

## Demo

The included demo shows a video player with progress tracking. The watched segments are visualized on the progress bar, and a detailed breakdown is available in the analytics dialog.
