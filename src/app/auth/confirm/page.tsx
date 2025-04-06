import { EmailLinkHandler } from '@/components/auth';

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">ClimaEdu</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Authentication Confirmation
        </p>
      </header>

      <EmailLinkHandler />
    </div>
  );
}
