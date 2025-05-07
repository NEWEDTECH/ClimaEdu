'use client';

import { useState, useEffect } from 'react';
import { ProtectedContent } from '@/components/auth';
import { DashboardLayout } from '@/components/layout';
import { CardSubject, mockSubjects } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';


type CourseDisplayData = {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
  isBlocked: boolean;
}

export default function Home() {
  const [courses, setCourses] = useState<CourseDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );

        const institutionId = 'ins_REKG0wdpIc';

        const fetchedCourses = await courseRepository.listByInstitution(institutionId);

        const mappedCourses: CourseDisplayData[] = fetchedCourses.map(course => ({
          id: course.id,
          title: course.title,
          href: `/student/courses/${course.id}`,
          imageUrl: '/vercel.svg',
          isBlocked: false 
        }));

        setCourses(mappedCourses);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses');
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
              <p className="text-center">Carregando cursos...</p>
            )}
          </div>

          {/* Featured Courses Carousel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Cursos Disponíveis</h2>
            {
              courses.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {courses.slice(0, 5).map((course) => (
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
                  title={courses[0]?.title}
                  href={'teste'}
                  imageUrl={courses[0]?.imageUrl}
                  isBlocked={courses[0]?.isBlocked}
                />
              )
            }


          </div>

          {/* All Courses */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Todos os Cursos</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {mockSubjects.map((course) => (
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
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
