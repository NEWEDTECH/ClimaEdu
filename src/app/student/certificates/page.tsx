"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { useCertificates } from '@/hooks/certificates';
import { useProfile } from '@/context/zustand/useProfile';
import { CertificateWithDetails } from '@/types/certificate.types';

// Extended type for unified certificate list
type CertificateListItem = CertificateWithDetails & { hasCertificate: boolean };
import type { Course } from '@/_core/modules/content';
import type { Enrollment } from '@/_core/modules/enrollment';
import { EnrollmentStatus, ListEnrollmentsUseCase } from '@/_core/modules/enrollment';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { GenerateCertificateUseCase } from '@/_core/modules/certificate';
import { container, Register } from '@/_core/shared/container';

export default function CertificadosPage() {
  const { infoUser, infoInstitutions } = useProfile();
  const { certificates, loading, error, refreshCertificates } = useCertificates();
  
  // States for enrollments and courses
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Function to fetch courses data based on enrollments
  const fetchCoursesData = useCallback(async (enrollmentsList: Enrollment[]) => {
    try {
      const courseRepository = container.get<CourseRepository>(
        Register.content.repository.CourseRepository
      );

      const courseIds = enrollmentsList.map(enrollment => enrollment.courseId);
      const uniqueCourseIds = [...new Set(courseIds)];
      
      const coursesData: Course[] = [];
      
      // Fetch each course individually
      for (const courseId of uniqueCourseIds) {
        const course = await courseRepository.findById(courseId);
        if (course) {
          coursesData.push(course);
        }
      }
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses data:', error);
      // Don't set error state, just log it as courses are optional enhancement data
    }
  }, []);

  // Function to fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!infoUser?.id) {
      return;
    }

    try {
      const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
        Register.enrollment.useCase.ListEnrollmentsUseCase
      );

      const enrollmentsResult = await listEnrollmentsUseCase.execute({
        userId: infoUser.id,
        status: [EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED],
        institutionId: infoUser.currentIdInstitution
      });

      setEnrollments(enrollmentsResult.enrollments);
      
      // Fetch course data for each enrollment
      await fetchCoursesData(enrollmentsResult.enrollments);
      
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  }, [infoUser?.id, infoUser?.currentIdInstitution, fetchCoursesData]);

  // Effect to fetch enrollments on component mount
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Create unified list: existing certificates + completed courses without certificates
  const existingCertificates: CertificateListItem[] = certificates.map(cert => {
    const course = courses.find((c: Course) => c.id === cert.courseId);
    return {
      id: cert.id,
      userId: cert.userId,
      courseId: cert.courseId,
      institutionId: cert.institutionId,
      issuedAt: cert.issuedAt,
      certificateNumber: cert.certificateNumber,
      certificateUrl: cert.certificateUrl,
      updateCertificateUrl: cert.updateCertificateUrl,
      isAuthentic: cert.isAuthentic,
      courseTitle: course?.title || 'Curso Não Encontrado',
      institutionName: infoInstitutions?.institutions?.nameInstitution || 'Instituição',
      instructorName: 'Instrutor do Curso', // TODO: Get from course or instructor data
      hoursCompleted: 40, // TODO: Get from course metadata
      grade: 85, // TODO: Get from enrollment/progress data
      completionDate: cert.issuedAt, // Use issuedAt as completion date for now
      hasCertificate: true
    };
  });

  const pendingCertificates: CertificateListItem[] = enrollments
    .filter(enrollment => {
      const hasCertificate = certificates.some(cert => cert.courseId === enrollment.courseId);
      return enrollment.status === EnrollmentStatus.COMPLETED && !hasCertificate;
    })
    .reduce<CertificateListItem[]>((acc, enrollment) => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (course) {
        acc.push({
          id: `pending-${course.id}`, // Special ID for pending certificates
          userId: infoUser?.id || '',
          courseId: course.id,
          institutionId: course.institutionId,
          issuedAt: new Date(), // Current date as placeholder
          certificateNumber: '',
          certificateUrl: '',
          updateCertificateUrl: () => {},
          isAuthentic: () => false as boolean,
          courseTitle: course.title,
          institutionName: infoInstitutions?.institutions?.nameInstitution || 'Instituição',
          instructorName: 'Instrutor do Curso', // TODO: Get from course or instructor data
          hoursCompleted: 40, // TODO: Get from course metadata
          grade: 85, // TODO: Get from enrollment/progress data
          completionDate: new Date(), // TODO: Get actual completion date from enrollment
          hasCertificate: false
        });
      }
      return acc;
    }, []);

  const unifiedCertificatesList: CertificateListItem[] = [...existingCertificates, ...pendingCertificates];

  const handleCertificateSelect = (certificateId: string) => {
    setSelectedCertificate(certificateId);
    setShowVerification(false);
  };

  const handleBackToList = () => {
    setSelectedCertificate(null);
    setShowVerification(false);
  };

  const handleShowVerification = () => {
    setShowVerification(true);
  };

  const handleDownloadCertificate = (certificateUrl: string) => {
    window.open(certificateUrl, '_blank');
  };

  const handleShareCertificate = (certificateId: string) => {
    const shareUrl = `https://example.com/verify-certificate/${certificateId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado',
        text: 'Confira meu certificado de conclusão de curso!',
        url: shareUrl,
      })
      .catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
      alert(`Link para compartilhamento: ${shareUrl}`);
    }
  };

  const renderCertificateList = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Certificados</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Certificados emitidos para os cursos que você concluiu
        </p>


        {/* Existing Certificates Section */}
        <h2 className="text-xl font-semibold mb-4">Meus Certificados</h2>
        
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-2">Carregando certificados...</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Aguarde enquanto buscamos seus certificados.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <svg 
                  className="w-16 h-16 text-red-400 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2 text-red-600">Erro ao carregar certificados</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {error}
                </p>
                <Button onClick={refreshCertificates}>
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : unifiedCertificatesList.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <svg 
                  className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2">Nenhum certificado encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Você ainda não concluiu nenhum curso para receber certificados.
                </p>
                <Button>
                  Explorar Cursos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unifiedCertificatesList.map((certificate) => (
              <>
                {certificate && (
                  <Card 
                    key={certificate.id} 
                    className={`hover:shadow-md transition-shadow ${
                      certificate.hasCertificate 
                        ? 'border-blue-200 dark:border-blue-800'
                        : 'border-dashed border-2 border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10'
                    }`}
                  >
                    <CardHeader className={`border-b ${
                      certificate.hasCertificate 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    }`}>
                      <CardTitle className="flex items-center justify-between">
                        {certificate.courseTitle}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          certificate.hasCertificate
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                        }`}>
                          {certificate.hasCertificate ? 'Certificado Emitido' : 'Pronto para Certificar'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                          <svg 
                            className="w-8 h-8 text-blue-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1.5} 
                              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" 
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Instituição</p>
                          <p className="font-medium">{certificate.institutionName}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Data de Emissão:</span>
                          <span>{certificate.issuedAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Carga Horária:</span>
                          <span>{certificate.hoursCompleted} horas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nota Final:</span>
                          <span>{certificate.grade}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCertificateSelect(certificate.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderCertificateDetail = () => {
    // Find certificate in unified list
    const certificate = unifiedCertificatesList.find(c => c?.id === selectedCertificate);
    if (!certificate) return null;
    
    // Handle certificate generation for pending certificates
    const handleGenerateCertificate = async () => {
      try {
        const generateCertificateUseCase = container.get<GenerateCertificateUseCase>(Register.certificate.useCase.GenerateCertificateUseCase);
        
        const executeParams = {
          userId: infoUser!.id,
          courseId: certificate.courseId,
          institutionId: infoUser!.currentIdInstitution || '',
          courseName: certificate.courseTitle || 'Curso',
          instructorName: certificate.instructorName || 'Instrutor do Curso',
          hoursCompleted: certificate.hoursCompleted || 40,
          grade: certificate.grade || 85,
        };
        
        await generateCertificateUseCase.execute(executeParams);
        
        // Refresh certificates list
        await refreshCertificates();
        
        // Go back to certificates list to see the new certificate
        setSelectedCertificate(null);
      } catch (error) {
        console.error('Error generating certificate:', error);
        alert('Erro ao gerar certificado. Tente novamente.');
      }
    };

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Voltar para lista de certificados
          </Button>
          <h1 className="text-2xl font-bold mb-2">Certificado: {certificate.courseTitle}</h1>
        </div>

        {!showVerification ? (
          <>
            <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-8 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <svg 
                  className="w-96 h-96 text-blue-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" 
                  />
                </svg>
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {certificate.institutionName}
                </h2>
                <h1 className="text-3xl font-bold mb-2">Certificado de Conclusão</h1>
                <p className="text-lg">Este certificado é concedido a</p>
                <p className="text-2xl font-bold my-4">{infoUser?.name || 'Nome do Usuário'}</p>
                <p className="text-lg mb-4">
                  por concluir com sucesso o curso de
                </p>
                <p className="text-2xl font-bold mb-6">{certificate.courseTitle}</p>
                <p className="text-lg">
                  com carga horária de {certificate.hoursCompleted} horas e nota final de {certificate.grade}%
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="font-medium">{certificate.instructorName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instrutor</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{certificate.issuedAt.toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data de Emissão</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{certificate.certificateNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Número do Certificado</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes do Certificado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Curso:</span>
                      <span className="font-medium">{certificate.courseTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Instituição:</span>
                      <span className="font-medium">{certificate.institutionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Data de Conclusão:</span>
                      <span className="font-medium">{certificate.completionDate?.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Data de Emissão:</span>
                      <span className="font-medium">{certificate.issuedAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Carga Horária:</span>
                      <span className="font-medium">{certificate.hoursCompleted} horas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nota Final:</span>
                      <span className="font-medium">{certificate.grade}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Instrutor:</span>
                      <span className="font-medium">{certificate.instructorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Número do Certificado:</span>
                      <span className="font-medium">{certificate.certificateNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {certificate.hasCertificate ? (
                <>
                  <Button 
                    className="flex-1"
                    onClick={() => handleDownloadCertificate(certificate.certificateUrl)}
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                      />
                    </svg>
                    Baixar Certificado
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShareCertificate(certificate.id)}
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                      />
                    </svg>
                    Compartilhar
                  </Button>
                  <Button 
                    variant="secondary"
                    className="flex-1"
                    onClick={handleShowVerification}
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                    Verificar Autenticidade
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="flex-1"
                    onClick={handleGenerateCertificate}
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Gerar Certificado
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToList}
                  >
                    Voltar
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <Card>
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
                Verificação de Autenticidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <svg 
                    className="w-6 h-6 text-green-500 mr-3 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">Certificado Autêntico</h3>
                    <p className="text-green-700 dark:text-green-300">
                      Este certificado foi verificado e é autêntico. Emitido por {certificate.institutionName} em {certificate.issuedAt.toLocaleDateString('pt-BR')}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Informações do Certificado</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Número do Certificado:</span>
                      <span className="font-medium">{certificate.certificateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Curso:</span>
                      <span className="font-medium">{certificate.courseTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Instituição:</span>
                      <span className="font-medium">{certificate.institutionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Data de Emissão:</span>
                      <span className="font-medium">{certificate.issuedAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Como Verificar a Autenticidade</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Qualquer pessoa pode verificar a autenticidade deste certificado usando o número do certificado no site oficial da instituição ou através do link abaixo:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono break-all">
                    https://example.com/verify-certificate/{certificate.certificateNumber}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowVerification(false)}
                className="w-full"
              >
                Voltar para Detalhes do Certificado
              </Button>
            </CardFooter>
          </Card>
        )}
      </>
    );
  };


  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          {selectedCertificate ? renderCertificateDetail() : renderCertificateList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
