import { useEffect, useState } from 'react';
import { container, ContentSymbols } from '../../_core/shared/container';
import { IScormContentClientRepository } from '../../_core/modules/content/infrastructure/repositories/ScormContentClientRepository';
import { ScormContent } from '../../_core/modules/content/core/entities';

export function useScormContent(contentId: string | null) {
  const [content, setContent] = useState<ScormContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) {
      setIsLoading(false);
      return;
    }

    const repository = container.get<IScormContentClientRepository>(
      ContentSymbols.repositories.ScormContentClientRepository
    );

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const scormContent = await repository.findById(contentId);
        setContent(scormContent);
      } catch (err) {
        setError('Failed to load SCORM content.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  return { content, isLoading, error };
}
