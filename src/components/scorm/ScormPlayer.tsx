'use client';

import { useEffect } from 'react';
import { useScormContent } from '../../hooks/content/useScormContent';
import { LoadingSpinner } from '../loader/loader';

// A nossa API SCORM simulada
class ScormAPI {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSInitialize(_: string): string {
    return 'true';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSFinish(_: string): string {
    return 'true';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSGetValue(key: string): string {
    console.log(key)
    // Em uma implementação real, você buscaria dados aqui
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSSetValue(key: string, value: unknown): string {
    console.log(key, value)
    // Em uma implementação real, você salvaria dados aqui
    return 'true';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSCommit(_: string): string {
    return 'true';
  }

  LMSGetLastError(): string {
    return '0';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSGetErrorString(_: string): string {
    return 'No error';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LMSGetDiagnostic(_: string): string {
    return 'No diagnostic';
  }
}

interface ScormPlayerProps {
  contentId: string;
}

export function ScormPlayer({ contentId }: ScormPlayerProps) {
  const { content, isLoading, error } = useScormContent(contentId);

  useEffect(() => {
    const scormAPI = new ScormAPI();
    (window as { API?: ScormAPI }).API = scormAPI;

    return () => {
      delete (window as { API?: ScormAPI }).API;
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !content) {
    return <div>Error loading SCORM content.</div>;
  }

  const launchUrl = `/api/scorm/courses/${content.id}/${content.launchUrl}`;

  return (
    <iframe
      src={launchUrl}
      style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }}
      title="SCORM Content"
      allowFullScreen
    />
  );
}
