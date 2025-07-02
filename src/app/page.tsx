'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { ContentCarousel } from '@/components/ui/carousel';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ListEnrollmentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.use-case';
import { EnrollmentStatus } from '@/_core/modules/enrollment/core/entities/EnrollmentStatus';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { ListTrailsUseCase } from '@/_core/modules/content/core/use-cases/list-trails/list-trails.use-case';
import { LoadingSpinner } from '@/components/loader'
import mockCourses from '@/data/mock-courses.json';


type CourseDisplayData = {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
  isBlocked: boolean;
}

type TrailDisplayData = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  isBlocked: boolean;
}

export default function Home() {
  const { infoUser } = useProfile();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDisplayData[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseDisplayData[]>([]);
  const [enrolledTrails, setEnrolledTrails] = useState<TrailDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      // Só carregar dados se o usuário estiver autenticado e tiver uma instituição
      if (!infoUser.id || !infoUser.currentIdInstitution) {
        console.log('📋 Home: Waiting for user data from AuthGuard...');
        return;
      }

      try {
        console.log('📋 Home: Loading course data for user:', infoUser.name);
        setIsLoading(true);
        setError(null);

        // Carregar cursos matriculados
        const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
          Register.enrollment.useCase.ListEnrollmentsUseCase
        );

        const enrollmentsResult = await listEnrollmentsUseCase.execute({
          userId: infoUser.id,
          status: EnrollmentStatus.ENROLLED,
          institutionId: infoUser.currentIdInstitution
        });

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );

        const enrolledCoursesData: CourseDisplayData[] = [];

        // Processar cursos matriculados
        for (const enrollment of enrollmentsResult.enrollments) {
          const course = await courseRepository.findById(enrollment.courseId);

          if (course && course.institutionId === infoUser.currentIdInstitution) {
            enrolledCoursesData.push({
              id: course.id,
              title: course.title,
              href: `/student/courses/${course.id}`,
              imageUrl: course.coverImageUrl || '',
              isBlocked: false
            });
          }
        }

        setEnrolledCourses(enrolledCoursesData);

        // Carregar cursos disponíveis (não matriculados)
        const allInstitutionCourses = await courseRepository.listByInstitution(infoUser.currentIdInstitution);
        const enrolledCourseIds = enrolledCoursesData.map(course => course.id);
        const notEnrolledCourses = allInstitutionCourses.filter((course: Course) =>
          !enrolledCourseIds.includes(course.id)
        );

        const availableCoursesData: CourseDisplayData[] = notEnrolledCourses.map((course: Course) => ({
          id: course.id,
          title: course.title,
          href: '#',
          imageUrl: course.coverImageUrl || '',
          isBlocked: true
        }));

        setAvailableCourses(availableCoursesData);

        // Carregar trilhas
        const listTrailsUseCase = container.get<ListTrailsUseCase>(
          Register.content.useCase.ListTrailsUseCase
        );

        const trailsResult = await listTrailsUseCase.execute({
          institutionId: infoUser.currentIdInstitution
        });

        const enrolledTrailsData: TrailDisplayData[] = [];

        // Para cada trilha, verificar se o usuário está matriculado em TODOS os cursos da trilha
        for (const trail of trailsResult.trails) {
          const isEnrolledInAllCourses = trail.courseIds.every(courseId =>
            enrolledCourseIds.includes(courseId)
          );

          if (isEnrolledInAllCourses && trail.courseIds.length > 0) {
            enrolledTrailsData.push({
              id: trail.id,
              title: trail.title,
              description: trail.description,
              href: `/student/trails/${trail.id}`,
              imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
              isBlocked: false
            });
          }
        }

        setEnrolledTrails(enrolledTrailsData);
        setIsLoading(false);

        console.log('✅ Home: Course data loaded successfully');

      } catch (error) {
        console.error('❌ Home: Error loading course data:', error);
        setError('Falha ao carregar dados dos cursos');
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [infoUser.name, infoUser.id, infoUser.currentIdInstitution]);

  return (

    <DashboardLayout>

      {isLoading ? (
        < LoadingSpinner />
      ) : (
        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="flex items-center justify-center text-2xl font-semibold mb-4">Bem-vindo à Plataforma ClimaEdu EAD</h2>
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}
          </div>

          <ContentCarousel
            items={enrolledTrails}
            title="Trilhas Disponíveis"
            emptyMessage="Você não está matriculado em nenhuma trilha ainda."
          />

          <ContentCarousel
            items={enrolledCourses}
            title="Meus Cursos"
            emptyMessage="Você não está matriculado em nenhum curso ainda."
          />

          <ContentCarousel
            items={availableCourses}
            title="Cursos Disponíveis na Instituição"
            emptyMessage="Não há outros cursos disponíveis nesta instituição."
            itemClassName="cursor-not-allowed"
            singleItemClassName="w-[400px] cursor-not-allowed"
          />

          <ContentCarousel
            items={mockCourses.map(course => ({
              id: course.id,
              title: course.name,
              href: course.url,
              imageUrl: course.coverImage,
              isBlocked: false
            }))}
            title="Podcasts"
            emptyMessage="Nenhum podcast disponível no momento."
          />

        </div>
      )}

    </DashboardLayout>

  );
}
