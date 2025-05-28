import { useRef } from "react";
import ReactPlayer from "react-player";

type VideoPlayerProps = {
  url: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  handleProgress?: ({ played, playedSeconds, loadedSeconds }: { played: number; playedSeconds: number; loadedSeconds: number }) => void;
}

const VideoPlayer = ({ 
  url, 
  autoPlay = true, 
  showControls = true,
  onReady,
  onEnded,
  handleProgress,
}: VideoPlayerProps) => {
  const playerRef = useRef<ReactPlayer>(null);

  const handleOnReady = () => {
    if (autoPlay) {
      unMute();
    }
    if (onReady) {
      onReady();
    }
  };

  const unMute = () => {
    const player = playerRef.current?.getInternalPlayer();
    if (player?.unMute) {
      player.unMute();
    }
  };

  return (
    <div className="relative w-full h-[400px]">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={autoPlay}
        muted={autoPlay}
        controls={showControls}
        onReady={handleOnReady}
        onEnded={onEnded}
        onProgress={handleProgress}
        progressInterval={100}
        width="100%"
        height="400px"
        className="absolute top-0 left-0"
      />
    </div>
  );
};

export default VideoPlayer;
