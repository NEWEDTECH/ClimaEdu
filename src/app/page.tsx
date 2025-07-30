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
import { ListPodcastsUseCase } from '@/_core/modules/podcast/core/use-cases/list-podcasts/list-podcasts.use-case';
import { LoadingSpinner } from '@/components/loader'
import { SearchComponent } from '@/components/search'
import { Play, BookOpen, Headphones, Star, TrendingUp, Clock } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';


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

type PodcastDisplayData = {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
  isBlocked: boolean;
}

export default function Home() {
  const { infoUser } = useProfile();
  const { isDarkMode } = useTheme();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDisplayData[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseDisplayData[]>([]);
  const [enrolledTrails, setEnrolledTrails] = useState<TrailDisplayData[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastDisplayData[]>([]);
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

        console.log({ notEnrolledCourses })

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
              imageUrl: trail.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
              isBlocked: false
            });
          }
        }

        setEnrolledTrails(enrolledTrailsData);

        // Carregar podcasts da instituição
        const listPodcastsUseCase = container.get<ListPodcastsUseCase>(
          Register.podcast.useCase.ListPodcastsUseCase
        );

        const podcastsResult = await listPodcastsUseCase.execute({
          institutionId: infoUser.currentIdInstitution,
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        const podcastsData: PodcastDisplayData[] = podcastsResult.podcasts.map(podcast => ({
          id: podcast.id,
          title: podcast.title,
          href: `/podcast/${podcast.id}`,
          imageUrl: podcast.coverImageUrl || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
          isBlocked: false
        }));

        setPodcasts(podcastsData);
        setIsLoading(false);

        console.log('✅ Home: Course and podcast data loaded successfully');

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
        <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          isDarkMode ? 'bg-black' : 'bg-gray-100'
        }`}>
          <div className="text-center space-y-4">
            <LoadingSpinner />
            <div className={`text-lg font-medium animate-pulse ${isDarkMode ? 'text-white/80' : 'text-gray-700'
              }`}>
              Carregando seu universo de aprendizado...
            </div>
          </div>
        </div>
      ) : (
        <div className={`min-h-screen transition-all duration-300 ${
          isDarkMode ? 'bg-black' : 'bg-gray-100'
        }`}>
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className={`absolute inset-0 backdrop-blur-3xl ${
              isDarkMode ? 'bg-black' : 'bg-gray-200/30'
            }`}></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

              <div className="flex flex-col text-center space-y-6">

                <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                  Continue sua jornada de aprendizado com conteúdos personalizados e experiências imersivas
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center gap-6 mt-8">

                  <div className={`backdrop-blur-sm rounded-lg px-6 py-3 ${isDarkMode
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/80 border border-gray-200/50 shadow-sm'
                    }`}>
                    <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold">{enrolledCourses.length}</span>
                      <span className={isDarkMode ? 'text-white/80' : 'text-gray-600'}>Cursos</span>
                    </div>
                  </div>

                  <div className={`backdrop-blur-sm rounded-lg px-6 py-3 ${isDarkMode
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/80 border border-gray-200/50 shadow-sm'
                    }`}>
                    <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">{enrolledTrails.length}</span>
                      <span className={isDarkMode ? 'text-white/80' : 'text-gray-600'}>Trilhas</span>
                    </div>
                  </div>

                  <div className={`backdrop-blur-sm rounded-lg px-6 py-3 ${isDarkMode
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/80 border border-gray-200/50 shadow-sm'
                    }`}>
                    <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                      <Headphones className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold">{podcasts.length}</span>
                      <span className={isDarkMode ? 'text-white/80' : 'text-gray-600'}>Podcasts</span>
                    </div>
                  </div>

                </div>

                {/* Search Section */}
                <div className="px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
                  <div className="max-w-2xl mx-auto">
                    <SearchComponent
                      placeholder="Buscar cursos, trilhas ou podcasts..."
                      className={`w-full backdrop-blur-sm ${isDarkMode
                          ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                          : 'bg-white/80 border-gray-200/50 text-gray-800 placeholder:text-gray-500'
                        }`}
                      showFilters={true}
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>



          {/* Error Message */}
          {error && (
            <div className="px-4 sm:px-6 lg:px-8 mt-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-center font-medium">{error}</p>
                </div>
              </div>
            </div> 
          )}

          {/* Content Sections */}
          <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            {/* Continue Watching / My Courses */}
            {enrolledCourses.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                  <h2 className={`text-2xl sm:text-3xl font-bold flex items-center space-x-3 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    <Play className="w-8 h-8 text-blue-400" />
                    <span>Continue Aprendendo</span>
                  </h2>
                </div>
                <ContentCarousel
                  items={enrolledCourses}
                  title=""
                  emptyMessage=""
                  className="bg-transparent shadow-none p-0"
                />
              </section>
            )}

            {/* My Trails */}
            {enrolledTrails.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-blue-400 rounded-full"></div>
                  <h2 className={`text-2xl sm:text-3xl font-bold flex items-center space-x-3 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span>Minhas Trilhas</span>
                  </h2>
                </div>
                <ContentCarousel
                  items={enrolledTrails}
                  title=""
                  emptyMessage=""
                  className="bg-transparent shadow-none p-0"
                />
              </section>
            )}

            {/* Podcasts */}
            {podcasts.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                  <h2 className={`text-2xl sm:text-3xl font-bold flex items-center space-x-3 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    <Headphones className="w-8 h-8 text-purple-400" />
                    <span>Podcasts Disponíveis</span>
                  </h2>
                </div>
                <ContentCarousel
                  items={podcasts}
                  title=""
                  emptyMessage=""
                  className="bg-transparent shadow-none p-0"
                />
              </section>
            )}

            {/* Available Courses */}
            {availableCourses.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
                  <h2 className={`text-2xl sm:text-3xl font-bold flex items-center space-x-3 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    <BookOpen className="w-8 h-8 text-orange-400" />
                    <span>Explore Novos Cursos</span>
                  </h2>
                </div>
                <ContentCarousel
                  items={availableCourses}
                  title=""
                  emptyMessage=""
                  className="bg-transparent shadow-none p-0"
                  itemClassName="cursor-not-allowed opacity-75 hover:opacity-90 transition-opacity"
                  singleItemClassName="w-[400px] cursor-not-allowed opacity-75"
                />
              </section>
            )}

            {/* Empty State */}
            {enrolledCourses.length === 0 && enrolledTrails.length === 0 && podcasts.length === 0 && availableCourses.length === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto space-y-6">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                    }`}>
                    <BookOpen className={`w-12 h-12 ${isDarkMode ? 'text-white/60' : 'text-gray-400'
                      }`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>Nenhum conteúdo disponível</h3>
                  <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                    Parece que ainda não há conteúdo disponível em sua instituição.
                    Entre em contato com seu administrador para mais informações.
                  </p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}
    </DashboardLayout>
  );
}
