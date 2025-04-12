import { ProtectedContent } from '@/components/auth';
import { DashboardLayout } from '@/components/layout';

export default function Home() {
  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Bem-vindo à Plataforma EAD</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilize o menu lateral para navegar entre as diferentes áreas da plataforma.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Aulas Recentes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acesse suas aulas mais recentes diretamente por aqui.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Próximas Avaliações</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualize as próximas provas e trabalhos agendados.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Progresso</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acompanhe seu progresso nos cursos matriculados.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
