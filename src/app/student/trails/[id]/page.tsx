'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { CardSubject } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { GetTrailUseCase } from '@/_core/modules/content/core/use-cases/get-trail/get-trail.use-case';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { Trail } from '@/_core/modules/content/core/entities/Trail';

type CourseDisplayData = {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
  isBlocked: boolean;
}

export default function TrailDetailPage() {
  const params = useParams();
  const trailId = params.id as string;
  
  const [trail, setTrail] = useState<Trail | null>(null);
  const [courses, setCourses] = useState<CourseDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrailData = async () => {
      try {
        setIsLoading(true);

        // Buscar a trilha pelo ID
        const getTrailUseCase = container.get<GetTrailUseCase>(
          Register.content.useCase.GetTrailUseCase
        );

        const trailResult = await getTrailUseCase.execute({ id: trailId });
        
        if (!trailResult.trail) {
          setError('Trilha não encontrada');
          setIsLoading(false);
          return;
        }

        setTrail(trailResult.trail);

        // Buscar os cursos da trilha
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );

        const coursesData: CourseDisplayData[] = [];

        for (const courseId of trailResult.trail.courseIds) {
          const course = await courseRepository.findById(courseId);
          
          if (course) {
            coursesData.push({
              id: course.id,
              title: course.title,
              href: `/student/courses/${course.id}`,
              imageUrl: course.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
              isBlocked: false
            });
          }
        }

        setCourses(coursesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading trail data:', error);
        setError('Falha ao carregar dados da trilha');
        setIsLoading(false);
      }
    };

    if (trailId) {
      loadTrailData();
    }
  }, [trailId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-center">Carregando trilha...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !trail) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-center text-red-500">{error || 'Trilha não encontrada'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        {/* Trail Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {trail.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {trail.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {courses.length} curso{courses.length !== 1 ? 's' : ''} nesta trilha
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Descrição
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {trail.description}
            </p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">Cursos da Trilha</h2>
          
          {courses.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum curso encontrado nesta trilha.</p>
          ) : (
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
                className='w-[400px]'
                title={courses[0].title}
                href={courses[0].href}
                imageUrl={courses[0].imageUrl}
                isBlocked={courses[0].isBlocked}
              />
            )
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
