'use client';

import { ScormUploadForm } from '@/components/scorm/ScormUploadForm';
import { use } from 'react';

interface PageProps {
  params: Promise<{
    id: string; // Corrigido para 'id'
    moduleId: string;
    lessonId: string;
    institutionId: string;
  }>;
}

export default function ScormUploadPage({ params }: PageProps) {
  const { id: courseId, moduleId, lessonId, institutionId } = use(params); // Renomeado para clareza

  return (
    <div className="container mx-auto py-10">
      <ScormUploadForm
        courseId={courseId}
        moduleId={moduleId}
        lessonId={lessonId}
        institutionId={institutionId}
      />
    </div>
  );
}
