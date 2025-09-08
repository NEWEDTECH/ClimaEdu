"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress';

const mockBadges = [
  {
    id: 'b1',
    name: 'Primeiro Curso Concluído',
    description: 'Concluiu seu primeiro curso na plataforma.',
    iconUrl: 'https://img.icons8.com/fluency/96/medal.png',
    criteriaType: 'COURSE_COMPLETION',
    criteriaValue: 1,
    currentCount: 1,
    awardedAt: '2025-03-15T10:30:00',
    isAwarded: true
  },
  {
    id: 'b2',
    name: 'Mestre dos Questionários',
    description: 'Completou 5 questionários com nota acima de 80%.',
    iconUrl: 'https://img.icons8.com/fluency/96/test-passed.png',
    criteriaType: 'QUESTIONNAIRE_COMPLETION',
    criteriaValue: 5,
    currentCount: 3,
    isAwarded: false
  },
  {
    id: 'b3',
    name: 'Estudante Dedicado',
    description: 'Acessou a plataforma por 10 dias consecutivos.',
    iconUrl: 'https://img.icons8.com/fluency/96/calendar.png',
    criteriaType: 'DAILY_LOGIN',
    criteriaValue: 10,
    currentCount: 7,
    isAwarded: false
  },
  {
    id: 'b4',
    name: 'Explorador de Conteúdo',
    description: 'Completou 20 lições em qualquer curso.',
    iconUrl: 'https://img.icons8.com/fluency/96/compass.png',
    criteriaType: 'LESSON_COMPLETION',
    criteriaValue: 20,
    currentCount: 12,
    isAwarded: false
  },
  {
    id: 'b5',
    name: 'Certificado de Excelência',
    description: 'Obteve seu primeiro certificado de conclusão de curso.',
    iconUrl: 'https://img.icons8.com/fluency/96/certificate.png',
    criteriaType: 'CERTIFICATE_ACHIEVED',
    criteriaValue: 1,
    currentCount: 1,
    awardedAt: '2025-03-20T14:45:00',
    isAwarded: true
  },
  {
    id: 'b6',
    name: 'Participante Ativo',
    description: 'Participou de 5 discussões nos fóruns.',
    iconUrl: 'https://img.icons8.com/fluency/96/communication.png',
    criteriaType: 'DISCUSSION_PARTICIPATION',
    criteriaValue: 5,
    currentCount: 2,
    isAwarded: false
  },
  {
    id: 'b7',
    name: 'Maratonista de Estudos',
    description: 'Completou 3 cursos em um mês.',
    iconUrl: 'https://img.icons8.com/fluency/96/running.png',
    criteriaType: 'COURSE_COMPLETION',
    criteriaValue: 3,
    currentCount: 1,
    isAwarded: false
  },
  {
    id: 'b8',
    name: 'Nota Máxima',
    description: 'Obteve 100% em um questionário.',
    iconUrl: 'https://img.icons8.com/fluency/96/prize.png',
    criteriaType: 'QUESTIONNAIRE_COMPLETION',
    criteriaValue: 1,
    currentCount: 0,
    isAwarded: false
  }
];

const awardedBadges = mockBadges.filter(badge => badge.isAwarded);

export default function ConquistasPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredBadges = selectedFilter 
    ? mockBadges.filter(badge => badge.criteriaType === selectedFilter)
    : mockBadges;

  const handleFilterChange = (filter: string | null) => {
    setSelectedFilter(filter);
  };

  const criteriaTypeLabels: Record<string, string> = {
    'COURSE_COMPLETION': 'Conclusão de Cursos',
    'QUESTIONNAIRE_COMPLETION': 'Questionários',
    'DAILY_LOGIN': 'Login Diário',
    'LESSON_COMPLETION': 'Conclusão de Lições',
    'CERTIFICATE_ACHIEVED': 'Certificados',
    'DISCUSSION_PARTICIPATION': 'Participação em Discussões'
  };

  const criteriaTypes = Array.from(new Set(mockBadges.map(badge => badge.criteriaType)));

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Minhas Conquistas</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Acompanhe seu progresso e desbloqueie conquistas à medida que avança em seus estudos
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedFilter === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleFilterChange(null)}
              >
                Todas
              </Button>
              {criteriaTypes.map(type => (
                <Button
                  key={type}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedFilter === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleFilterChange(type)}
                >
                  {criteriaTypeLabels[type] || type}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total de Conquistas</p>
                      <p className="text-3xl font-bold">{mockBadges.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <svg 
                        className="w-6 h-6 text-blue-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Conquistas Desbloqueadas</p>
                      <p className="text-3xl font-bold">{awardedBadges.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg 
                        className="w-6 h-6 text-green-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Progresso Geral</p>
                      <p className="text-3xl font-bold">{Math.round((awardedBadges.length / mockBadges.length) * 100)}%</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <svg 
                        className="w-6 h-6 text-yellow-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 10V3L4 14h7v7l9-11h-7z" 
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {filteredBadges.some(badge => badge.isAwarded) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Conquistas Desbloqueadas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBadges
                    .filter(badge => badge.isAwarded)
                    .map(badge => (
                      <Card key={badge.id} className="border-green-500 dark:border-green-700 hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <svg 
                              className="w-5 h-5 text-green-500 mr-2" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                              />
                            </svg>
                            {badge.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center mb-4">
                            <img 
                              src={badge.iconUrl} 
                              alt={badge.name} 
                              className="w-16 h-16 mr-4"
                            />
                            <div>
                              <p className="mb-2">{badge.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Conquistado em: {new Date(badge.awardedAt!).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md text-sm text-green-800 dark:text-green-200 flex items-center">
                            <svg 
                              className="w-4 h-4 mr-1" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                            Concluído: {badge.currentCount}/{badge.criteriaValue} {criteriaTypeLabels[badge.criteriaType]}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {filteredBadges.some(badge => !badge.isAwarded) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Conquistas em Progresso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBadges
                    .filter(badge => !badge.isAwarded)
                    .map(badge => (
                      <Card key={badge.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle>{badge.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center mb-4">
                            <div className="relative mr-4">
                              <img 
                                src={badge.iconUrl} 
                                alt={badge.name} 
                                className="w-16 h-16 grayscale opacity-50"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg 
                                  className="w-8 h-8 text-gray-400" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                                  />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <p className="mb-2">{badge.description}</p>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progresso</span>
                              <span>{Math.round((badge.currentCount / badge.criteriaValue) * 100)}%</span>
                            </div>
                            <Progress value={(badge.currentCount / badge.criteriaValue) * 100} />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {badge.currentCount}/{badge.criteriaValue} {criteriaTypeLabels[badge.criteriaType]}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
