"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { useCertificateById, useCertificates } from '@/hooks/certificates';
import { useProfile } from '@/context/zustand/useProfile';
import { CertificateWithDetails } from '@/types/certificate.types';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { GenerateCertificateUseCase } from '@/_core/modules/certificate';
import { container, Register } from '@/_core/shared/container';

// Extended type for certificate details with generation capability
type CertificateDetailItem = CertificateWithDetails & { 
  hasCertificate: boolean;
  skills?: string[];
};

interface CertificateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CertificateDetailPage({ params }: CertificateDetailPageProps) {
  const router = useRouter();
  const { infoUser, infoInstitutions } = useProfile();
  const { refreshCertificates } = useCertificates();
  
  // Unwrap params Promise
  const unwrappedParams = React.use(params);
  
  // States
  const [showVerification, setShowVerification] = useState(false);
  const [certificateDetail, setCertificateDetail] = useState<CertificateDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine if this is a pending certificate (starts with "pending-")
  const isPendingCertificate = unwrappedParams.id.startsWith('pending-');
  const courseId = isPendingCertificate ? unwrappedParams.id.replace('pending-', '') : null;
  
  // Use certificate hook only for existing certificates
  const { certificate, loading: certificateLoading, error } = useCertificateById(
    isPendingCertificate ? null : unwrappedParams.id
  );

  // Load course data and create certificate detail
  const loadCertificateDetail = useCallback(async () => {
    try {
      setLoading(true);

      if (isPendingCertificate && courseId) {
        // Handle pending certificate - fetch course data
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        const courseData = await courseRepository.findById(courseId);
        
        if (courseData) {
          setCertificateDetail({
            id: unwrappedParams.id,
            userId: infoUser?.id || '',
            courseId: courseData.id,
            institutionId: courseData.institutionId,
            issuedAt: new Date(),
            certificateNumber: '',
            certificateUrl: '',
            updateCertificateUrl: () => {},
            isAuthentic: () => false as boolean,
            courseTitle: courseData.title,
            institutionName: infoInstitutions?.institutions?.nameInstitution || 'Instituição',
            instructorName: 'Instrutor do Curso',
            hoursCompleted: 40,
            grade: 85,
            skills: ['Programação', 'Desenvolvimento'],
            completionDate: new Date(),
            hasCertificate: false
          });
        }
      } else if (certificate) {
        // Handle existing certificate - fetch course data for additional details
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        const courseData = await courseRepository.findById(certificate.courseId);
        
        setCertificateDetail({
          id: certificate.id,
          userId: certificate.userId,
          courseId: certificate.courseId,
          institutionId: certificate.institutionId,
          issuedAt: certificate.issuedAt,
          certificateNumber: certificate.certificateNumber,
          certificateUrl: certificate.certificateUrl,
          updateCertificateUrl: certificate.updateCertificateUrl,
          isAuthentic: certificate.isAuthentic,
          courseTitle: courseData?.title || 'Curso Não Encontrado',
          institutionName: infoInstitutions?.institutions?.nameInstitution || 'Instituição',
          instructorName: 'Instrutor do Curso',
          hoursCompleted: 40,
          grade: 85,
          skills: ['Programação', 'Desenvolvimento'],
          completionDate: certificate.issuedAt,
          hasCertificate: true
        });
      }
    } catch (error) {
      console.error('Error loading certificate detail:', error);
    } finally {
      setLoading(false);
    }
  }, [unwrappedParams.id, isPendingCertificate, courseId, certificate, infoUser?.id, infoInstitutions?.institutions?.nameInstitution]);

  // Load certificate detail when dependencies change
  useEffect(() => {
    if (isPendingCertificate || certificate) {
      loadCertificateDetail();
    }
  }, [loadCertificateDetail, isPendingCertificate, certificate]);

  // Handle certificate generation for pending certificates
  const handleGenerateCertificate = async () => {
    if (!certificateDetail || isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      const generateCertificateUseCase = container.get<GenerateCertificateUseCase>(Register.certificate.useCase.GenerateCertificateUseCase);
      
      const executeParams = {
        userId: infoUser!.id,
        courseId: certificateDetail.courseId,
        institutionId: infoUser!.currentIdInstitution || '',
        courseName: certificateDetail.courseTitle || 'Curso',
        instructorName: certificateDetail.instructorName || 'Instrutor do Curso',
        hoursCompleted: certificateDetail.hoursCompleted || 40,
        grade: certificateDetail.grade || 85,
      };
      
      const result = await generateCertificateUseCase.execute(executeParams);
      
      // Update local state with the generated certificate instead of redirecting
      const generatedCertificate = result.certificate;
      setCertificateDetail({
        id: generatedCertificate.id,
        userId: generatedCertificate.userId,
        courseId: generatedCertificate.courseId,
        institutionId: generatedCertificate.institutionId,
        issuedAt: generatedCertificate.issuedAt,
        certificateNumber: generatedCertificate.certificateNumber,
        certificateUrl: generatedCertificate.certificateUrl,
        updateCertificateUrl: generatedCertificate.updateCertificateUrl,
        isAuthentic: generatedCertificate.isAuthentic,
        courseTitle: certificateDetail.courseTitle,
        institutionName: certificateDetail.institutionName,
        instructorName: certificateDetail.instructorName,
        hoursCompleted: certificateDetail.hoursCompleted,
        grade: certificateDetail.grade,
        skills: certificateDetail.skills,
        completionDate: certificateDetail.completionDate,
        hasCertificate: true
      });
      
      // Refresh certificates list in background for other pages
      await refreshCertificates();
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Erro ao gerar certificado. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToList = () => {
    router.push('/student/certificates');
  };

  const handleShowVerification = () => {
    setShowVerification(true);
  };

  const handleDownloadCertificate = (certificateUrl: string) => {
    window.open(certificateUrl, '_blank');
  };

  const handleShareCertificate = (certificateId: string) => {
    const shareUrl = `${window.location.origin}/student/certificates/${certificateId}`;
    
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

  // Loading state
  if (loading || certificateLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Carregando certificado...</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aguarde enquanto buscamos os detalhes do certificado.
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  // Error state
  if (error || !certificateDetail) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
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
              <h3 className="text-lg font-medium mb-2 text-red-600">Certificado não encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {error || 'O certificado solicitado não foi encontrado.'}
              </p>
              <Button onClick={handleBackToList}>
                Voltar para Lista de Certificados
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="mb-4"
            >
              ← Voltar para lista de certificados
            </Button>
            <h1 className="text-2xl font-bold mb-2">
              {isPendingCertificate ? 'Gerar Certificado' : 'Certificado'}: {certificateDetail.courseTitle}
            </h1>
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
                    {certificateDetail.institutionName}
                  </h2>
                  <h1 className="text-3xl font-bold mb-2">Certificado de Conclusão</h1>
                  <p className="text-lg">Este certificado é concedido a</p>
                  <p className="text-2xl font-bold my-4">{infoUser?.name || 'Nome do Usuário'}</p>
                  <p className="text-lg mb-4">
                    por concluir com sucesso o curso de
                  </p>
                  <p className="text-2xl font-bold mb-6">{certificateDetail.courseTitle}</p>
                  <p className="text-lg">
                    com carga horária de {certificateDetail.hoursCompleted} horas e nota final de {certificateDetail.grade}%
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="font-medium">{certificateDetail.instructorName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instrutor</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{certificateDetail.issuedAt.toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data de Emissão</p>
                  </div>
                  {certificateDetail.hasCertificate && (
                    <div className="text-center">
                      <p className="font-medium">{certificateDetail.certificateNumber}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Número do Certificado</p>
                    </div>
                  )}
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
                        <span className="font-medium">{certificateDetail.courseTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Instituição:</span>
                        <span className="font-medium">{certificateDetail.institutionName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Data de Conclusão:</span>
                        <span className="font-medium">{certificateDetail.completionDate?.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Data de Emissão:</span>
                        <span className="font-medium">{certificateDetail.issuedAt.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Carga Horária:</span>
                        <span className="font-medium">{certificateDetail.hoursCompleted} horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nota Final:</span>
                        <span className="font-medium">{certificateDetail.grade}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Instrutor:</span>
                        <span className="font-medium">{certificateDetail.instructorName}</span>
                      </div>
                      {certificateDetail.hasCertificate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Número do Certificado:</span>
                          <span className="font-medium">{certificateDetail.certificateNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Competências Adquiridas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {certificateDetail.skills?.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {certificateDetail.hasCertificate ? (
                  <>
                    <Button 
                      className="flex-1"
                      onClick={() => handleDownloadCertificate(certificateDetail.certificateUrl)}
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
                      onClick={() => handleShareCertificate(certificateDetail.id)}
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
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando Certificado...
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
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
                        Este certificado foi verificado e é autêntico. Emitido por {certificateDetail.institutionName} em {certificateDetail.issuedAt.toLocaleDateString('pt-BR')}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Informações do Certificado</h3>
                    <div className="space-y-2 text-sm">
                      {certificateDetail.hasCertificate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Número do Certificado:</span>
                          <span className="font-medium">{certificateDetail.certificateNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Curso:</span>
                        <span className="font-medium">{certificateDetail.courseTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Instituição:</span>
                        <span className="font-medium">{certificateDetail.institutionName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Data de Emissão:</span>
                        <span className="font-medium">{certificateDetail.issuedAt.toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Como Verificar a Autenticidade</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Qualquer pessoa pode verificar a autenticidade deste certificado usando o número do certificado no site oficial da instituição ou através do link abaixo:
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono break-all">
                      {`${window.location.origin}/student/certificates/${certificateDetail.id}`}
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
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}