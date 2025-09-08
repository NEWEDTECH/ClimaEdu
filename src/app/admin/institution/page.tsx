'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { InstitutionRepository } from '@/_core/modules/institution';
import { Register } from '@/_core/shared/container';
import { Institution } from '@/_core/modules/institution';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { PlusIcon, PencilIcon, LibraryBig } from 'lucide-react';


export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        );

        const institutionsList = await institutionRepository.list();
        setInstitutions(institutionsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching institutions:', err);
        setError('Failed to load institutions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };


    fetchInstitutions();
  }, []);

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Instituições</h1>
            <Link href="/admin/institution/create-edit">
              <Button
              >
                Nova Instituição
              </Button>
            </Link>
          </div>

          {loading && (
            <LoadingSpinner />
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {!loading && !error && institutions.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">Nenhuma instituição encontrada</p>
              <Link href="/admin/institution/create-edit">
                <Button
                  className="cursor-pointer"
                  icon={<PlusIcon size={16} />}
                  iconPosition='start'
                >
                  Criar Instituição
                </Button>
              </Link>
            </div>
          )}

          {!loading && !error && institutions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution) => (
                <Card key={institution.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{institution.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Domínio:</span> {institution.domain}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Link href={'/admin/courses'}>
                        <Button
                          variant='primary'
                          icon={<LibraryBig size={16} />}
                          iconPosition='start'
                        >
                          Cursos
                        </Button>
                      </Link>
                      <Link href={`/admin/institution/create-edit/${institution.id}`}>
                        <Button
                          variant='secondary'
                          icon={<PencilIcon size={16} />}
                          iconPosition='start'
                        >
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
