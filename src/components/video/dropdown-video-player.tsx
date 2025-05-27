import { Typography } from "../typography";
import { LoadingSpinner } from "../loader"
import { AlertTriangle } from "lucide-react";
import { GetVideoByKeyUseCase, VideoEntity } from "@/_core/modules/appVideos";
import { container, Register } from "@/_core/shared/container"
import React, { useState, useEffect } from "react";

import VideoPlayer from "./VideoPlayer";
import { DropdownModal } from "../Modal";

type DropdownVideoPlayerProps = {
  children: React.ReactNode;
  videoKey: string;
  autoPlay?: boolean;
  showControls?: boolean;
}


const LoadingContent: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
    <LoadingSpinner className="h-12 w-12 text-blue-500" />
    <Typography variant="h3" className="mt-4">
      Carregando vídeo...
    </Typography>
  </div>
);

const ErrorContent: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
    <AlertTriangle size={48} className="text-red-500" />
    <Typography variant="h3" className="mt-4 text-red-500">
      Erro ao carregar o vídeo
    </Typography>
    <Typography variant="p" className="mt-2 text-gray-700">
      {message}
    </Typography>
  </div>
);


const VideoContent: React.FC<{
  video: VideoEntity;
  autoPlay: boolean;
  showControls: boolean;
}> = ({ video, autoPlay, showControls }) => (
  <div>
    <VideoPlayer
      url={video.url}
      autoPlay={autoPlay}
      showControls={showControls}
    />
    {video.title && (
      <Typography variant="h3" className="mt-4">
        {video.title}
      </Typography>
    )}
  </div>
);

export function DropdownVideoPlayer({
  children,
  videoKey,
  autoPlay = true,
  showControls = true,
}: DropdownVideoPlayerProps) {

  const [video, setVideo] = useState<VideoEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getVideoByKeyUseCase = container.get<GetVideoByKeyUseCase>(
    Register.content.useCase.AddContentToLessonUseCase
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    getVideoByKeyUseCase
      .execute(videoKey)
      .then((video) => {
        if (video) {
          setVideo(video);
        } else {
          setError("Vídeo não encontrado");
        }
      })
      .catch((err) => {
        console.error("Error loading video:", err);
        setError("Ocorreu um erro ao carregar o vídeo. Por favor, tente novamente mais tarde.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [videoKey]);

  let videoContent;
  if (loading) {
    videoContent = <LoadingContent />;
  } else if (error) {
    videoContent = <ErrorContent message={error} />;
  } else if (video) {
    videoContent = <VideoContent video={video} autoPlay={autoPlay} showControls={showControls} />;
  } else {
    videoContent = <ErrorContent message="Vídeo não disponível" />;
  }


  return (
    <DropdownModal content={videoContent} id={videoKey}>
      {children}
    </DropdownModal>
  );
}
