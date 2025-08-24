'use client';

import { Content } from '@/_core/modules/content/core/entities/Content';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { VideoPlayer } from '@/components/video';
import { ScormPlayer } from '@/components/scorm/ScormPlayer';

interface ContentRendererProps {
  content: Content;
  onEnded?: () => void;
  handleProgress?: (progress: { played: number; playedSeconds: number; loadedSeconds: number }) => void;
}

export function ContentRenderer({ content, onEnded, handleProgress }: ContentRendererProps) {
  switch (content.type) {
    case ContentType.VIDEO:
      return (
        <div className="aspect-video">
          <VideoPlayer
            url={content.url}
            autoPlay={true}
            showControls={true}
            onEnded={onEnded}
            handleProgress={handleProgress}
          />
        </div>
      );
    case ContentType.SCORM:
      return (
        <div className="aspect-video">
          <ScormPlayer contentId={content.url} />
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
