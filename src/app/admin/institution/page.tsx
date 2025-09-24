'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { InstitutionRepository } from '@/_core/modules/institution';
import { Register } from '@/_core/shared/container';
import { Institution } from '@/_core/modules/institution';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { InputText } from '@/components/input';


const NAME_COLUMNS = [
  'Nome',
  'Domínio',
  'Criado em',
  'Atualizado em',
  'Ações'
]

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = 
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.domain.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Instituições</h1>
            <Link href="/admin/institution/create-edit">
              <Button variant='primary'>
                Criar nova instituição
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Instituições Existentes</CardTitle>
              <CardDescription>
                Gerencie todas as instituições em sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search"
                    type="text"
                    placeholder="Pesquise por nome ou domínio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
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

              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        {NAME_COLUMNS.map(item => (
                          <th className="text-left py-3 px-4" key={item}>{item}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInstitutions.map((institution) => (
                        <tr key={institution.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-4 font-medium">{institution.name}</td>
                          <td className="py-3 px-4">{institution.domain}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(institution.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(institution.updatedAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2">
                              <Link href={'/admin/courses'}>
                                <Button variant='primary'>
                                  Cursos
                                </Button>
                              </Link>
                              <Link href={`/admin/institution/create-edit/${institution.id}`}>
                                <Button variant='secondary'>
                                  Editar
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredInstitutions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma instituição encontrada
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
