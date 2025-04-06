import { LoginForm, EmulatorAuthLinks, EmulatorStatus } from '@/components/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">ClimaEdu</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Sign in to your account
        </p>
      </header>

      <LoginForm />
      
      {/* Only shown in development mode with emulator */}
      <EmulatorAuthLinks />
      <EmulatorStatus />
    </div>
  );
}
