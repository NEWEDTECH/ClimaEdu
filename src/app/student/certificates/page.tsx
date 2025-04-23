"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';

const mockCertificates = [
  {
    id: 'cert1',
    courseId: 'c1',
    courseTitle: 'Introdução à Programação',
    institutionId: 'inst1',
    institutionName: 'ClimaEdu',
    issuedAt: '2025-03-15T10:30:00',
    certificateNumber: 'CERT-1ABCD2EF-3GHI4JKL',
    certificateUrl: 'https://example.com/certificates/cert1.pdf',
    completionDate: '2025-03-14T16:45:00',
    grade: 92,
    instructorName: 'Dr. Maria Oliveira',
    hoursCompleted: 40,
    skills: ['JavaScript', 'Algoritmos', 'Lógica de Programação']
  },
  {
    id: 'cert2',
    courseId: 'c2',
    courseTitle: 'Desenvolvimento Web Básico',
    institutionId: 'inst1',
    institutionName: 'ClimaEdu',
    issuedAt: '2025-03-20T14:45:00',
    certificateNumber: 'CERT-5MNOP6QR-7STU8VWX',
    certificateUrl: 'https://example.com/certificates/cert2.pdf',
    completionDate: '2025-03-19T11:30:00',
    grade: 88,
    instructorName: 'Prof. Carlos Santos',
    hoursCompleted: 60,
    skills: ['HTML', 'CSS', 'JavaScript Básico', 'Responsividade']
  }
];

export default function CertificadosPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

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

        {mockCertificates.length === 0 ? (
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
            {mockCertificates.map((certificate) => (
              <Card 
                key={certificate.id} 
                className="hover:shadow-md transition-shadow border-blue-200 dark:border-blue-800"
              >
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                  <CardTitle>{certificate.courseTitle}</CardTitle>
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
                      <span>{new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}</span>
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
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {certificate.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => handleCertificateSelect(certificate.id)}
                  >
                    Ver Detalhes
                  </Button>
                  <Button
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
                    Baixar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderCertificateDetail = () => {
    const certificate = mockCertificates.find(c => c.id === selectedCertificate);
    if (!certificate) return null;

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
                <p className="text-2xl font-bold my-4">João da Silva</p>
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
                  <p className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}</p>
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
                      <span className="font-medium">{new Date(certificate.completionDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Data de Emissão:</span>
                      <span className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}</span>
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

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-lg">Competências Adquiridas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill, index) => (
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
                      Este certificado foi verificado e é autêntico. Emitido por {certificate.institutionName} em {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}.
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
                      <span className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}</span>
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
        <div className="max-w-4xl mx-auto">
          {selectedCertificate ? renderCertificateDetail() : renderCertificateList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
