'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { CardSubject } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
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
  }, [infoUser.id, infoUser.currentIdInstitution]);

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

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Trilhas Disponíveis</h2>
            {enrolledTrails.length === 0 && !isLoading && !error && (
              <p className="text-center text-gray-500">Você não está matriculado em nenhuma trilha ainda.</p>
            )}
            {
              enrolledTrails.length > 0 && (
                enrolledTrails.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {enrolledTrails.map((trail) => (
                        <CarouselItem key={trail.id} className="md:basis-1/2 lg:basis-1/3">
                          <CardSubject
                            title={trail.title}
                            href={trail.href}
                            imageUrl={trail.imageUrl}
                            isBlocked={trail.isBlocked}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                ) : (
                  <CardSubject
                    className='w-[400px]'
                    title={enrolledTrails[0].title}
                    href={enrolledTrails[0].href || '#'}
                    imageUrl={enrolledTrails[0].imageUrl}
                    isBlocked={enrolledTrails[0].isBlocked}
                  />
                )
              )
            }


          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Meus Cursos</h2>
            {enrolledCourses.length === 0 && !isLoading && !error && (
              <p className="text-center text-gray-500">Você não está matriculado em nenhum curso ainda.</p>
            )}
            {
              enrolledCourses.length > 0 && (
                enrolledCourses.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {enrolledCourses.map((course) => (
                        <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                          <CardSubject
                            title={course.title}
                            href={course.href}
                            imageUrl={course.imageUrl}
                            isBlocked={course.isBlocked}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                ) : (
                  <CardSubject
                    className='w-[400px]'
                    title={enrolledCourses[0].title}
                    href={enrolledCourses[0].href || '#'}
                    imageUrl={enrolledCourses[0].imageUrl}
                    isBlocked={enrolledCourses[0].isBlocked}
                  />
                )
              )
            }
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Cursos Disponíveis na Instituição</h2>
            {availableCourses.length === 0 && !isLoading && !error && (
              <p className="text-center text-gray-500">Não há outros cursos disponíveis nesta instituição.</p>
            )}
            {
              availableCourses.length > 0 && (
                availableCourses.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {availableCourses.map((course) => (
                        <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3 cursor-not-allowed">
                          <CardSubject
                            title={course.title}
                            href={course.href}
                            imageUrl={course.imageUrl}
                            isBlocked={course.isBlocked}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                ) : (
                  <CardSubject
                    className='w-[400px] cursor-not-allowed'
                    title={availableCourses[0].title}
                    href={availableCourses[0].href || '#'}
                    imageUrl={availableCourses[0].imageUrl}
                    isBlocked={availableCourses[0].isBlocked}
                  />
                )
              )
            }
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Podcasts</h2>
            {mockCourses.length > 0 && (
              mockCourses.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {mockCourses.map((course) => (
                      <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                        <CardSubject
                          title={course.name}
                          href={course.url}
                          imageUrl={course.coverImage}
                          isBlocked={false}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <CardSubject
                  className='w-[400px]'
                  title={mockCourses[0].name}
                  href={mockCourses[0].url}
                  imageUrl={mockCourses[0].coverImage}
                  isBlocked={false}
                />
              )
            )}
          </div>

        </div>
      )}

    </DashboardLayout>

  );
}
