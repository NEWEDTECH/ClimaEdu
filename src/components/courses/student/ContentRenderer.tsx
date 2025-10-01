'use client';

import { Content } from '@/_core/modules/content/core/entities/Content';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { VideoPlayer } from '@/components/video';
import { ScormPlayer } from '@/components/scorm/ScormPlayer';
import { PdfPlayer } from '@/components/pdf/PdfPlayer';

interface ContentRendererProps {
  content: Content;
  onEnded?: () => void;
  handleProgress?: (progress: { played: number; playedSeconds: number; loadedSeconds: number; contentId?: string }) => void;
}

export function ContentRenderer({ content, onEnded, handleProgress }: ContentRendererProps) {
  const enhancedHandleProgress = (progress: { played: number; playedSeconds: number; loadedSeconds: number }) => {
    if (handleProgress) {
      handleProgress({
        ...progress,
        contentId: content.id
      });
    }
  };

  switch (content.type) {
    case ContentType.VIDEO:
      return (
        // <div className="aspect-video">
          <VideoPlayer
            url={content.url}
            autoPlay={true}
            showControls={true}
            onEnded={onEnded}
            handleProgress={enhancedHandleProgress}
          />
        // </div>
      );
    case ContentType.SCORM:
      return (
        // <div className="aspect-video">
          <ScormPlayer contentId={content.url} />
        // </div>
      );
    case ContentType.PDF:
      return <PdfPlayer url={content.url} />;
    case ContentType.AUDIO:
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <audio
            controls
            className="w-full"
            src={content.url.split('#storagePath=')[0]}
            onEnded={onEnded}
          >
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      );
    // Adicionar outros tipos de conteúdo aqui (PDF, etc.)
    default:
      return (
        <div className="p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p>Conteúdo do tipo `&apos;{content.type}`&apos; não suportado.</p>
        </div>
      );
  }
}
