import { LoginForm, EmulatorAuthLinks, EmulatorStatus } from '@/components/auth';

export default function LoginPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">ClimaEdu</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Login form for sending the sign-in link */}
        <LoginForm />
        
        {/* Check if the Firebase emulator is running */}
        <EmulatorStatus />
        
        {/* Display emulator auth links in development mode */}
        <EmulatorAuthLinks />
      </div>
    </div>
  );
}
