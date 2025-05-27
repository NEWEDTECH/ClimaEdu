'use client';

import { useState, useEffect } from 'react';
import { ProtectedContent } from '@/components/auth';
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


type CourseDisplayData = {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
  isBlocked: boolean;
}

export default function Home() {
  const { id } = useProfile();
  const [courses, setCourses] = useState<CourseDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEnrolledCourses = async () => {
      try {
        setIsLoading(true);

        const currentUserId = id;
        console.log('Current user ID from profile state:', currentUserId);

        if (!currentUserId) {
          setIsLoading(false);
          return;
        }

        const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
          Register.enrollment.useCase.ListEnrollmentsUseCase
        );

        const enrollmentsResult = await listEnrollmentsUseCase.execute({
          userId: currentUserId,
          status: EnrollmentStatus.ENROLLED
        });

        if (enrollmentsResult.enrollments.length === 0) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );

        const enrolledCourses: CourseDisplayData[] = [];

        for (const enrollment of enrollmentsResult.enrollments) {
          const course = await courseRepository.findById(enrollment.courseId);

          if (course) {
            enrolledCourses.push({
              id: course.id,
              title: course.title,
              href: `/student/courses/${course.id}`,
              imageUrl: course.coverImageUrl!,
              isBlocked: false
            });
          }
        }

        setCourses(enrolledCourses);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setError('Failed to load your courses');
        setIsLoading(false);
      }
    };

    fetchUserEnrolledCourses();
  }, [id]); 

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="flex items-center justify-center text-2xl font-semibold mb-4">Bem-vindo à Plataforma ClimaEdu EAD</h2>
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}
            {isLoading && (
              <p className="text-center">Carregando seus cursos...</p>
            )}
          </div>

          {/* User's Enrolled Courses Carousel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Seus Cursos</h2>
            {courses.length === 0 && !isLoading && !error && (
              <p className="text-center text-gray-500">Você não está matriculado em nenhum curso ainda.</p>
            )}
            {
              courses.length > 0 && (
                courses.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {courses.map((course) => (
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
                    className='w-[800px]'
                    title={courses[0].title}
                    href={courses[0].href || '#'}
                    imageUrl={courses[0].imageUrl}
                    isBlocked={courses[0].isBlocked}
                  />
                )
              )
            }


          </div>


        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
