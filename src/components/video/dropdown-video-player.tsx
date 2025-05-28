import { Typography } from "../typography";
import React from "react";

import VideoPlayer from "./VideoPlayer";
import { DropdownModal } from "../Modal";

type DropdownVideoPlayerProps = {
  children: React.ReactNode;
  videoUrl: string;
  videoTitle?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  handleProgress?: ({ played, playedSeconds, loadedSeconds }: { played: number; playedSeconds: number; loadedSeconds: number }) => void;
}

const VideoContent: React.FC<{
  videoUrl: string;
  videoTitle?: string;
  autoPlay: boolean;
  showControls: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  handleProgress?: ({ played, playedSeconds, loadedSeconds }: { played: number; playedSeconds: number; loadedSeconds: number }) => void;
}> = ({ videoUrl, videoTitle, autoPlay, showControls, onReady, onEnded, handleProgress }) => (
  <div>
    <VideoPlayer
      url={videoUrl}
      autoPlay={autoPlay}
      showControls={showControls}
      onReady={onReady}
      onEnded={onEnded}
      handleProgress={handleProgress}
    />
    {videoTitle && (
      <Typography variant="h3" className="mt-4">
        {videoTitle}
      </Typography>
    )}
  </div>
);

export function DropdownVideoPlayer({
  children,
  videoUrl,
  videoTitle,
  autoPlay = false,
  showControls = true,
  onReady,
  onEnded,
  handleProgress,
}: DropdownVideoPlayerProps) {
  const videoContent = (
    <VideoContent 
      videoUrl={videoUrl}
      videoTitle={videoTitle}
      autoPlay={autoPlay}
      showControls={showControls}
      onReady={onReady}
      onEnded={onEnded}
      handleProgress={handleProgress}
    />
  );

  return (
    <DropdownModal content={videoContent}>
      {children}
    </DropdownModal>
  );
}
