"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ListTutorCoursesWithStudentsUseCase } from '@/_core/modules/content/core/use-cases/list-tutor-courses-with-students/list-tutor-courses-with-students.use-case';
import { ListQuestionnaireSubmissionsForTutorUseCase } from '@/_core/modules/content/core/use-cases/list-questionnaire-submissions-for-tutor/list-questionnaire-submissions-for-tutor.use-case';
import { ListActivityFilesUseCase } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.use-case';

export default function TutorDebugPage() {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  const runDebug = async () => {
    if (!tutorId || !institutionId) {
      alert('Informações do tutor não encontradas');
      return;
    }

    setLoading(true);
    const debug: any = {
      tutorId,
      institutionId,
      courses: [],
      questionnaires: [],
      activities: []
    };

    try {
      // 1. Buscar cursos do tutor
      console.log('🔍 Buscando cursos do tutor...');
      const coursesUseCase = container.get<ListTutorCoursesWithStudentsUseCase>(
        Register.content.useCase.ListTutorCoursesWithStudentsUseCase
      );

      const coursesResult = await coursesUseCase.execute({
        tutorId,
        institutionId
      });

      debug.courses = coursesResult.coursesWithStudents.map(c => ({
        courseId: c.course.id,
        courseTitle: c.course.title,
        studentsCount: c.students.length,
        students: c.students.map(s => ({ id: s.id, name: s.name })),
        modulesCount: c.course.modules.length,
        modules: c.course.modules.map(m => ({
          moduleId: m.id,
          moduleTitle: m.title,
          lessonsCount: m.lessons.length,
          lessons: m.lessons.map(l => ({
            lessonId: l.id,
            lessonTitle: l.title,
            hasActivity: !!l.activity,
            hasQuestionnaire: !!l.questionnaire,
            activityId: l.activity?.id,
            questionnaireId: l.questionnaire?.id
          }))
        }))
      }));

      // 2. Buscar questionários respondidos
      console.log('🔍 Buscando questionários respondidos...');
      const questionnaireUseCase = container.get<ListQuestionnaireSubmissionsForTutorUseCase>(
        Register.content.useCase.ListQuestionnaireSubmissionsForTutorUseCase
      );

      const questionnaireResult = await questionnaireUseCase.execute({
        tutorId,
        institutionId
      });

      debug.questionnaires = questionnaireResult.submissions.map(s => ({
        submissionId: s.submission.id,
        studentId: s.submission.userId,
        studentName: s.student.name,
        questionnaireId: s.questionnaire.id,
        questionnaireTitle: s.questionnaire.title,
        courseId: s.course.id,
        courseTitle: s.course.title,
        lessonTitle: s.lessonTitle,
        score: s.submission.score,
        passed: s.submission.passed,
        completedAt: s.submission.completedAt.toISOString()
      }));

      // 3. Para cada atividade, verificar se há arquivos
      console.log('🔍 Verificando atividades com arquivos...');
      const listFilesUseCase = container.get<ListActivityFilesUseCase>(
        Register.content.useCase.ListActivityFilesUseCase
      );

      for (const courseWithStudents of coursesResult.coursesWithStudents) {
        for (const student of courseWithStudents.students) {
          for (const module of courseWithStudents.course.modules) {
            for (const lesson of module.lessons) {
              if (lesson.activity) {
                try {
                  const filesResult = await listFilesUseCase.execute({
                    activityId: lesson.activity.id,
                    studentId: student.id,
                    institutionId
                  });

                  if (filesResult.files.length > 0) {
                    debug.activities.push({
                      activityId: lesson.activity.id,
                      studentId: student.id,
                      studentName: student.name,
                      courseId: courseWithStudents.course.id,
                      courseTitle: courseWithStudents.course.title,
                      moduleTitle: module.title,
                      lessonTitle: lesson.title,
                      filesCount: filesResult.files.length,
                      files: filesResult.files.map(f => ({
                        name: f.name,
                        size: f.sizeBytes,
                        uploadedAt: f.uploadedAt.toISOString()
                      }))
                    });
                  }
                } catch (error) {
                  console.warn(`Erro ao buscar arquivos para atividade ${lesson.activity.id}:`, error);
                }
              }
            }
          }
        }
      }

      setDebugInfo(debug);
      console.log('🎯 Debug completo:', debug);

    } catch (error) {
      console.error('❌ Erro no debug:', error);
      alert('Erro ao executar debug: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Debug - Dados do Tutor</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Página para verificar se os dados estão sendo buscados corretamente
            </p>
          </div>

          <div className="mb-6">
            <Button 
              onClick={runDebug}
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Executando Debug...' : 'Executar Debug'}
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          )}

          {debugInfo && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Tutor ID:</strong> {debugInfo.tutorId}</div>
                    <div><strong>Institution ID:</strong> {debugInfo.institutionId}</div>
                    <div><strong>Cursos encontrados:</strong> {debugInfo.courses.length}</div>
                    <div><strong>Questionários respondidos:</strong> {debugInfo.questionnaires.length}</div>
                    <div><strong>Atividades com arquivos:</strong> {debugInfo.activities.length}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Cursos */}
              <Card>
                <CardHeader>
                  <CardTitle>Cursos do Tutor ({debugInfo.courses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {debugInfo.courses.map((course: any, index: number) => (
                      <div key={index} className="border rounded p-4">
                        <h4 className="font-semibold">{course.courseTitle}</h4>
                        <div className="text-sm text-gray-600 mt-2">
                          <p><strong>ID:</strong> {course.courseId}</p>
                          <p><strong>Estudantes:</strong> {course.studentsCount}</p>
                          <p><strong>Módulos:</strong> {course.modulesCount}</p>
                        </div>
                        
                        {course.students.length > 0 && (
                          <div className="mt-2">
                            <strong>Estudantes:</strong>
                            <ul className="list-disc list-inside ml-4 text-sm">
                              {course.students.map((student: any) => (
                                <li key={student.id}>{student.name} ({student.id})</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {course.modules.length > 0 && (
                          <div className="mt-2">
                            <strong>Módulos e Lições:</strong>
                            {course.modules.map((module: any) => (
                              <div key={module.moduleId} className="ml-4 mt-1">
                                <p className="font-medium">{module.moduleTitle}</p>
                                <ul className="list-disc list-inside ml-4 text-sm">
                                  {module.lessons.map((lesson: any) => (
                                    <li key={lesson.lessonId}>
                                      {lesson.lessonTitle} 
                                      {lesson.hasActivity && <span className="text-green-600"> [Atividade]</span>}
                                      {lesson.hasQuestionnaire && <span className="text-blue-600"> [Questionário]</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Questionários */}
              <Card>
                <CardHeader>
                  <CardTitle>Questionários Respondidos ({debugInfo.questionnaires.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debugInfo.questionnaires.map((q: any, index: number) => (
                      <div key={index} className="border rounded p-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div><strong>Estudante:</strong> {q.studentName}</div>
                          <div><strong>Curso:</strong> {q.courseTitle}</div>
                          <div><strong>Questionário:</strong> {q.questionnaireTitle}</div>
                          <div><strong>Nota:</strong> {q.score}% ({q.passed ? 'Aprovado' : 'Reprovado'})</div>
                          <div><strong>Data:</strong> {new Date(q.completedAt).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades com Arquivos ({debugInfo.activities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debugInfo.activities.map((a: any, index: number) => (
                      <div key={index} className="border rounded p-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div><strong>Estudante:</strong> {a.studentName}</div>
                          <div><strong>Curso:</strong> {a.courseTitle}</div>
                          <div><strong>Módulo:</strong> {a.moduleTitle}</div>
                          <div><strong>Lição:</strong> {a.lessonTitle}</div>
                          <div><strong>Arquivos:</strong> {a.filesCount}</div>
                        </div>
                        <div className="mt-2">
                          <strong>Arquivos:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {a.files.map((file: any, fileIndex: number) => (
                              <li key={fileIndex}>
                                {file.name} ({(file.size / 1024).toFixed(1)} KB) - {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* JSON Raw */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Raw (JSON)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
