"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { useCertificates } from '@/hooks/certificates';
import { useProfile } from '@/context/zustand/useProfile';
import { CertificateWithDetails } from '@/types/certificate.types';
import type { Course } from '@/_core/modules/content';
import { EnrollmentStatus, ListEnrollmentsUseCase, type Enrollment } from '@/_core/modules/enrollment';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { container, Register } from '@/_core/shared/container';

// Extended type for unified certificate list
type CertificateListItem = CertificateWithDetails & { 
  hasCertificate: boolean;
};

export default function CertificadosPage() {
  const { infoUser, infoInstitutions } = useProfile();
  const { certificates, loading, error, refreshCertificates } = useCertificates();
  const router = useRouter();
  
  // States for enrollments and courses
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

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
    router.push(`/student/certificates/${certificateId}`);
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
                              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 717.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" 
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

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          {renderCertificateList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}