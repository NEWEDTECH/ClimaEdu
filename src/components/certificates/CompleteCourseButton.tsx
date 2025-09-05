"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { useCompleteCourse } from '@/hooks/enrollment/useCompleteCourse';
import { useProfile } from '@/context/zustand/useProfile';

interface CompleteCourseButtonProps {
  courseId: string;
  courseName: string;
  institutionId: string;
  instructorName?: string;
  hoursCompleted?: number;
  grade?: number;
  onCourseCompleted?: () => void;
}

/**
 * Component for testing course completion and certificate generation
 * This is a temporary component for testing purposes
 */
export function CompleteCourseButton({ 
  courseId, 
  courseName, 
  institutionId, 
  instructorName,
  hoursCompleted,
  grade,
  onCourseCompleted 
}: CompleteCourseButtonProps) {
  const { infoUser } = useProfile();
  const { completeCourse, loading, error } = useCompleteCourse();
  const [success, setSuccess] = useState<string | null>(null);

  const handleCompleteCourse = async () => {
    if (!infoUser?.id) {
      alert('Usuário não autenticado');
      return;
    }

    const result = await completeCourse({
      userId: infoUser.id,
      courseId,
      institutionId,
      courseName,
      instructorName,
      hoursCompleted,
      grade
    });

    if (result) {
      const message = result.wasAlreadyCompleted 
        ? 'Curso já estava concluído. Certificado existente retornado.'
        : 'Curso concluído com sucesso! Certificado gerado.';
      
      setSuccess(message);
      onCourseCompleted?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCompleteCourse}
        disabled={loading || !infoUser}
        className="w-full"
      >
        {loading ? 'Concluindo Curso...' : 'Concluir Curso e Gerar Certificado'}
      </Button>
      
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          Erro: {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
          {success}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <strong>Dados do teste:</strong><br/>
        Curso: {courseName}<br/>
        ID: {courseId}<br/>
        Instituição: {institutionId}<br/>
        {instructorName && <>Instrutor: {instructorName}<br/></>}
        {grade && <>Nota: {grade}%<br/></>}
        {hoursCompleted && <>Horas: {hoursCompleted}h<br/></>}
      </div>
    </div>
  );
}