'use client';

import { ScormUploadForm } from '@/components/scorm/ScormUploadForm';

interface PageProps {
  params: {
    id: string; // Corrigido para 'id'
    moduleId: string;
    lessonId: string;
  };
}

// Supondo que o institutionId possa ser obtido de alguma forma,
// talvez da sessão do usuário ou de um fetch.
// Por agora, vamos usar um valor fixo para demonstração.
const MOCK_INSTITLUTION_ID = 'mock-institution-id';

export default function ScormUploadPage({ params }: PageProps) {
  const { id: courseId, moduleId, lessonId } = params; // Renomeado para clareza

  return (
    <div className="container mx-auto py-10">
      <ScormUploadForm
        courseId={courseId}
        moduleId={moduleId}
        lessonId={lessonId}
        institutionId={MOCK_INSTITLUTION_ID}
      />
    </div>
  );
}
