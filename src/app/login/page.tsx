import { LoginForm, EmulatorAuthLinks, EmulatorStatus } from '@/components/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">

      <LoginForm />
      
      {/* Only shown in development mode with emulator */}
      <EmulatorAuthLinks />
      <EmulatorStatus />
    </div>
  );
}
