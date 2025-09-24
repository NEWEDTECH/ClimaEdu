"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { showToast } from '@/components/toast';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ListTutorCoursesWithStudentsUseCase } from '@/_core/modules/content/core/use-cases/list-tutor-courses-with-students/list-tutor-courses-with-students.use-case';
import { ListActivityFilesUseCase } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.use-case';
import type { CourseWithStudents } from '@/_core/modules/content/core/use-cases/list-tutor-courses-with-students/list-tutor-courses-with-students.output';
import type { ActivityFile } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.output';
import type { Activity } from '@/_core/modules/content/core/entities/Activity';

interface ActivityWithFiles {
  activity: Activity;
  course: {
    id: string;
    title: string;
  };
  module: {
    title: string;
  };
  lesson: {
    title: string;
  };
  files: ActivityFile[];
  submissionText?: string;
  feedback?: string;
  grade?: number;
}

export default function StudentActivitiesCompletedPage() {
  const params = useParams();
  const studentId = params.id as string;
  
  const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  const fetchActivities = useCallback(async () => {
    if (!tutorId || !institutionId || !studentId) {
      setError('Informações necessárias não encontradas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 DEBUG: Iniciando busca de atividades');
      console.log('📋 Parâmetros:', { tutorId, institutionId, studentId });

      // Buscar cursos do tutor com estudantes
      const coursesUseCase = container.get<ListTutorCoursesWithStudentsUseCase>(
        Register.content.useCase.ListTutorCoursesWithStudentsUseCase
      );

      const coursesResult = await coursesUseCase.execute({
        tutorId,
        institutionId
      });

      console.log('📚 Cursos encontrados:', coursesResult.coursesWithStudents.length);
      console.log('📚 Detalhes dos cursos:', coursesResult.coursesWithStudents.map(c => ({
        courseId: c.course.id,
        courseTitle: c.course.title,
        studentsCount: c.students.length,
        studentIds: c.students.map(s => s.id)
      })));

      // Buscar atividades que tenham arquivos enviados pelo estudante
      const activitiesWithFiles: ActivityWithFiles[] = [];
      const listFilesUseCase = container.get<ListActivityFilesUseCase>(
        Register.content.useCase.ListActivityFilesUseCase
      );

      for (const courseWithStudents of coursesResult.coursesWithStudents) {
        console.log(`🎓 Verificando curso: ${courseWithStudents.course.title}`);
        
        // Verificar se o estudante está matriculado neste curso
        const isStudentInCourse = courseWithStudents.students.some(s => s.id === studentId);
        console.log(`👨‍🎓 Estudante ${studentId} está no curso ${courseWithStudents.course.title}:`, isStudentInCourse);
        
        if (!isStudentInCourse) continue;

        console.log(`📖 Módulos no curso ${courseWithStudents.course.title}:`, courseWithStudents.course.modules.length);

        for (const module of courseWithStudents.course.modules) {
          console.log(`📝 Verificando módulo: ${module.title} (${module.lessons.length} lições)`);
          
          for (const lesson of module.lessons) {
            console.log(`📄 Lição: ${lesson.title}, tem atividade:`, !!lesson.activity);
            
            if (lesson.activity) {
              try {
                console.log(`🎯 Buscando arquivos para atividade ${lesson.activity.id} do estudante ${studentId}`);
                
                // Buscar arquivos da atividade para este estudante
                const filesResult = await listFilesUseCase.execute({
                  activityId: lesson.activity.id,
                  studentId,
                  institutionId
                });

                console.log(`📁 Arquivos encontrados para atividade ${lesson.activity.id}:`, filesResult.files.length);
                if (filesResult.files.length > 0) {
                  console.log('📁 Detalhes dos arquivos:', filesResult.files.map(f => ({
                    name: f.name,
                    size: f.sizeBytes,
                    uploadedAt: f.uploadedAt
                  })));
                }

                // Se há arquivos, significa que o estudante completou a atividade
                if (filesResult.files.length > 0) {
                  activitiesWithFiles.push({
                    activity: lesson.activity,
                    course: {
                      id: courseWithStudents.course.id,
                      title: courseWithStudents.course.title
                    },
                    module: {
                      title: module.title
                    },
                    lesson: {
                      title: lesson.title
                    },
                    files: filesResult.files,
                    // TODO: Buscar texto de submissão e feedback de um repositório específico
                    submissionText: undefined,
                    feedback: undefined,
                    grade: undefined
                  });
                  console.log('✅ Atividade adicionada à lista');
                }
              } catch (fileError) {
                console.warn(`❌ Failed to load files for activity ${lesson.activity.id}:`, fileError);
              }
            }
          }
        }
      }

      console.log('🎯 Total de atividades encontradas:', activitiesWithFiles.length);
      setActivities(activitiesWithFiles);
    } catch (err) {
      console.error('❌ Error fetching student activities:', err);
      setError('Falha ao carregar atividades do aluno. Tente novamente.');
      showToast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [tutorId, institutionId, studentId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
  };

  const handleBackToStudents = () => {
    window.location.href = '/tutor/student-activities';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('javascript')) return '📄';
    if (type.includes('html')) return '🌐';
    if (type.includes('css')) return '🎨';
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    return '📎';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) return 'javascript';
    if (['html', 'htm'].includes(extension)) return 'html';
    if (['css', 'scss', 'sass'].includes(extension)) return 'css';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'other';
  };

  const renderFilePreview = (file: ActivityFile) => {
    const fileType = getFileType(file.name);
    
    if (fileType === 'image') {
      return (
        <div className="mt-2">
          <img 
            src={file.downloadUrl} 
            alt={file.name}
            className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
            style={{ maxHeight: '300px' }}
          />
        </div>
      );
    }
    
    if (fileType === 'javascript' || fileType === 'html' || fileType === 'css') {
      return (
        <div className="mt-2">
          <iframe
            src={file.downloadUrl}
            className="w-full h-64 border border-gray-200 dark:border-gray-700 rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    return null;
  };

  const renderActivityList = () => (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackToStudents}
          className="mb-4"
        >
          ← Voltar para Atividades dos Alunos
        </Button>
        <h1 className="text-2xl font-bold mb-2">Atividades Completadas do Aluno</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize as atividades completadas e os materiais enviados pelo aluno
        </p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
              📝
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Nenhuma atividade encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Este aluno ainda não completou nenhuma atividade.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activityWithFiles) => (
            <Card key={activityWithFiles.activity.id} className="hover:shadow-md transition-shadow border-green-500 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg 
                    className="w-5 h-5 text-green-500 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  {activityWithFiles.activity.description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p><strong>Curso:</strong> {activityWithFiles.course.title}</p>
                  <p><strong>Módulo:</strong> {activityWithFiles.module.title}</p>
                  <p><strong>Lição:</strong> {activityWithFiles.lesson.title}</p>
                  <p><strong>Data de envio:</strong> {activityWithFiles.files.length > 0 ? new Date(activityWithFiles.files[0].uploadedAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  {activityWithFiles.grade && (
                    <p><strong>Nota:</strong> <span className="text-green-600 dark:text-green-400 font-semibold">{activityWithFiles.grade}/100</span></p>
                  )}
                </div>
                <p className="mb-4">{activityWithFiles.activity.instructions}</p>
                
                {activityWithFiles.files && activityWithFiles.files.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Arquivos enviados ({activityWithFiles.files.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activityWithFiles.files.map((file: ActivityFile, index: number) => (
                        <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
                          <span className="mr-2">{getFileIcon(getFileType(file.name))}</span>
                          <span className="mr-2">{file.name}</span>
                          <span className="text-gray-500 text-xs">({formatFileSize(file.sizeBytes)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleActivitySelect(activityWithFiles.activity.id)}
                  variant="primary"
                >
                  Ver detalhes e materiais
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  const renderActivityDetail = () => {
    const activityWithFiles = activities.find(a => a.activity.id === selectedActivity);
    if (!activityWithFiles) return null;

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Voltar para lista de atividades
          </Button>
          <h1 className="text-2xl font-bold mb-2">{activityWithFiles.activity.description}</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p><strong>Curso:</strong> {activityWithFiles.course.title}</p>
            <p><strong>Módulo:</strong> {activityWithFiles.module.title}</p>
            <p><strong>Lição:</strong> {activityWithFiles.lesson.title}</p>
            <p><strong>Data de envio:</strong> {activityWithFiles.files.length > 0 ? new Date(activityWithFiles.files[0].uploadedAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
            {activityWithFiles.grade && (
              <p><strong>Nota:</strong> <span className="text-green-600 dark:text-green-400 font-semibold">{activityWithFiles.grade}/100</span></p>
            )}
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Descrição da Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{activityWithFiles.activity.description}</p>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line mb-4">{activityWithFiles.activity.instructions}</div>
            {activityWithFiles.activity.resourceUrl && (
              <div className="mt-4">
                <a 
                  href={activityWithFiles.activity.resourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Material de apoio
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4 border-blue-500 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">Resposta do Aluno</CardTitle>
          </CardHeader>
          <CardContent>
            {activityWithFiles.submissionText && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Texto da submissão:</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm">{activityWithFiles.submissionText}</pre>
                </div>
              </div>
            )}

            {activityWithFiles.files && activityWithFiles.files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Arquivos enviados:
                </h4>
                <div className="space-y-4">
                  {activityWithFiles.files.map((file: ActivityFile, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getFileIcon(getFileType(file.name))}</span>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {getFileType(file.name)} • {formatFileSize(file.sizeBytes)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => window.open(file.downloadUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <svg 
                            className="w-4 h-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          Download
                        </Button>
                      </div>
                      {renderFilePreview(file)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {activityWithFiles.feedback && (
          <Card className="border-green-500 dark:border-green-700">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">Feedback do Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{activityWithFiles.feedback}</p>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
            <Button onClick={handleBackToStudents}>
              Voltar para Atividades dos Alunos
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {selectedActivity ? renderActivityDetail() : renderActivityList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
