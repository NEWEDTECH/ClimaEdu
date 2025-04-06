import { EmailLinkHandler } from '@/components/auth';

export default function ConfirmAuthPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">ClimaEdu</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* This component will handle the email link authentication */}
        <EmailLinkHandler />
      </div>
    </div>
  );
}
