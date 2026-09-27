export function InstitutionNotFound({ domain }: { domain: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Instituição não encontrada
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Nenhuma instituição está configurada para o endereço <strong>{domain}</strong>.
        </p>
      </div>
    </div>
  );
}
