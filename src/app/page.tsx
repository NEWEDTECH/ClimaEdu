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

export default function Home() {
  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="flex items-center justify-center text-2xl  font-semibold mb-4">Bem-vindo à Plataforma ClimaEdu EAD</h2>
          </div>
          
          {/* Featured Courses Carousel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Cursos em Destaque</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {mockSubjects.slice(0, 5).map((subject) => (
                  <CarouselItem key={subject.id} className="md:basis-1/2 lg:basis-1/3">
                    <CardSubject
                      title={subject.title}
                      href={subject.href}
                      imageUrl={subject.imageUrl}
                      isBlocked={subject.isBlocked}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
          
          {/* All Subjects Grid */}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Matérias Disponíveis</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {mockSubjects.map((subject) => (
                  <CarouselItem key={subject.id} className="md:basis-1/2 lg:basis-1/3">
                    <CardSubject
                      title={subject.title}
                      href={subject.href}
                      imageUrl={subject.imageUrl}
                      isBlocked={subject.isBlocked}
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
