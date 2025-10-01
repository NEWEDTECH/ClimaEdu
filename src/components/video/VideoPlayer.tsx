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
    <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
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
        height="100%"
      />
    </div>
  );
};

export default VideoPlayer;
