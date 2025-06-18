'use client';

import { useState, useEffect } from 'react';
//import { ProtectedContent } from '@/components/auth';
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
import { useInstitutionStorage } from '@/context/zustand/useInstitutionStorage';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ListEnrollmentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.use-case';
import { EnrollmentStatus } from '@/_core/modules/enrollment/core/entities/EnrollmentStatus';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { GetUserAssociationsUseCase } from '@/_core/modules/user/core/use-cases/get-user-associations/get-user-associations.use-case';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
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
  const {
    infoUser,
    setInfoUser,
    //infoInstitutions,
    setInfoInstitutions,
    setInfoInstitutionsRole
  } = useProfile();
  const { getLastInstitutionId, setLastInstitutionId } = useInstitutionStorage();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDisplayData[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseDisplayData[]>([]);
  const [enrolledTrails, setEnrolledTrails] = useState<TrailDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        setIsLoading(true);

        const email = localStorage.getItem('emailForSignIn');
        if (!email) {
          setError('Email não encontrado no localStorage');
          setIsLoading(false);
          return;
        }

        const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
        const user = await userRepository.findByEmail(email);
        if (!user) {
          setError('Usuário não encontrado');
          setIsLoading(false);
          return;
        }

        //Passo 3: Através do ID do usuário, listar todas as instituições que ele pertence
        const getUserAssociationsUseCase = container.get<GetUserAssociationsUseCase>(
          Register.user.useCase.GetUserAssociationsUseCase
        );

        const userAssociations = await getUserAssociationsUseCase.execute({
          userId: user.id
        });

        const institutionsRoleData = userAssociations.map(association => ({
          idInstitution: association.id,
          nameInstitution: association.name,
          roleInstitution: null
        }));


        // Salvar no context/zustand: infoInstitutionsRole
        setInfoInstitutionsRole(institutionsRoleData);

        // Passo 4: Buscar no localStorage o último ID da instituição que está salvo
        let currentInstitutionId = getLastInstitutionId();

        // Se não tiver nenhum, pegar qualquer ID de instituição que foi obtido no passo 3
        if (institutionsRoleData.length > 0) {
          currentInstitutionId = institutionsRoleData[0].idInstitution;
        }

        if (!currentInstitutionId) {
          setError('Nenhuma instituição encontrada para o usuário');
          setIsLoading(false);
          return;
        }

        // Passo 5: Através desse ID da instituição, trazer os dados: id, nome, urlImage
        const institutionRepository = container.get<InstitutionRepository>(Register.institution.repository.InstitutionRepository);
        const institution = await institutionRepository.findById(currentInstitutionId);

        if (!institution) {
          setError('Instituição não encontrada');
          setIsLoading(false);
          return;
        }

        // Passo 6: Salvar os dados dessa instituição
        setInfoInstitutions({
          institutions: {
            idInstitution: institution.id,
            nameInstitution: institution.name,
            urlImage: institution.settings.logoUrl || '',
            roleInstitution: user.role//institutionsRoleData.find(inst => inst.idInstitution === institution.id)?.roleInstitution!
          }
        });

        // Encontrar o role atual do usuário na instituição
        const currentRole = user.role//institutionsRoleData.find(inst => inst.idInstitution === currentInstitutionId)?.roleInstitution || user.role;

        // Passo 7: Salvar os dados do usuário
        setInfoUser({
          ...infoUser,
          id: user.id,
          name: user.name,
          currentRole: currentRole,
          currentIdInstitution: currentInstitutionId
        });

        // Passo 8: Salvar esse ID da instituição no localStorage
        setLastInstitutionId(currentInstitutionId);

        // Passo 9: Trazer os cursos que esse usuário está matriculado dentro da instituição
        const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
          Register.enrollment.useCase.ListEnrollmentsUseCase
        );

        const enrollmentsResult = await listEnrollmentsUseCase.execute({
          userId: user.id,
          status: EnrollmentStatus.ENROLLED,
          institutionId: currentInstitutionId
        });


        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );

        const enrolledCoursesData: CourseDisplayData[] = [];

        // Processar cursos matriculados
        for (const enrollment of enrollmentsResult.enrollments) {
          const course = await courseRepository.findById(enrollment.courseId);

          if (course && course.institutionId === currentInstitutionId) {
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

        // Passo 10: Trazer os cursos que esse usuário não está matriculado dentro da instituição
        const allInstitutionCourses = await courseRepository.listByInstitution(currentInstitutionId);

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

        // Passo 11: Buscar trilhas que o usuário está matriculado
        const listTrailsUseCase = container.get<ListTrailsUseCase>(
          Register.content.useCase.ListTrailsUseCase
        );

        const trailsResult = await listTrailsUseCase.execute({
          institutionId: currentInstitutionId
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
              imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', // Placeholder image
              isBlocked: false
            });
          }
        }

        setEnrolledTrails(enrolledTrailsData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing user data:', error);
        setError('Falha ao carregar dados do usuário');
        setIsLoading(false);
      }
    };

    initializeUserData();
  }, [getLastInstitutionId, setInfoInstitutions, setInfoInstitutionsRole, setInfoUser, setLastInstitutionId, infoUser.id]);

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
