import { UserModule, ContentModule } from '@/components/ModuleComponents';

// Use a server component for the main page structure
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">ClimaEdu</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Learning Content Management Portal
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Architecture</h2>
          <p className="mb-4">
            This project follows Clean Architecture, SOLID, and Object Calisthenics principles,
            with a modular structure organized by domains.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <UserModule />
            <ContentModule />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Next.js 15
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              React 19
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              TypeScript
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              TailwindCSS
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Firebase
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              InversifyJS
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="mb-3 text-sm">
              The project is configured and ready for development. Some suggested next steps:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Implement complete authentication with Firebase Authentication</li>
              <li>Develop interface for content upload</li>
              <li>Create pages for viewing content by category</li>
              <li>Implement enrollment system to associate students with content</li>
              <li>Develop dashboard for administrators</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          Developed with Clean Architecture, SOLID, and Object Calisthenics.
        </p>
      </footer>
    </div>
  );
}
