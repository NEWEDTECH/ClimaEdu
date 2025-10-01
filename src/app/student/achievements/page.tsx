"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress';
import { useProfile } from '@/context/zustand/useProfile';
import { useStudentAchievements } from '@/hooks/achievements/useStudentAchievements';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

export default function ConquistasPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { infoUser } = useProfile();
  
  const { 
    achievements, 
    awardedCount, 
    totalCount, 
    isLoading, 
    error,
    refresh
  } = useStudentAchievements(infoUser.id, infoUser.currentIdInstitution);

  const filteredAchievements = selectedFilter 
    ? achievements.filter(achievement => achievement.criteriaType === selectedFilter)
    : achievements;

  const handleFilterChange = (filter: string | null) => {
    setSelectedFilter(filter);
  };

  const criteriaTypeLabels: Record<string, string> = {
    [BadgeCriteriaType.STUDY_STREAK]: 'Sequência de Estudos',
    [BadgeCriteriaType.STUDY_TIME]: 'Tempo de Estudo',
    [BadgeCriteriaType.PERFECT_SCORE]: 'Nota Perfeita',
    [BadgeCriteriaType.COURSE_COMPLETION]: 'Conclusão de Cursos',
    [BadgeCriteriaType.LESSON_COMPLETION]: 'Conclusão de Lições',
    [BadgeCriteriaType.QUESTIONNAIRE_COMPLETION]: 'Desempenho em Questionários',
    [BadgeCriteriaType.DAILY_LOGIN]: 'Login Diário',
    [BadgeCriteriaType.CERTIFICATE_ACHIEVED]: 'Certificados Obtidos',
    [BadgeCriteriaType.PROFILE_COMPLETION]: 'Perfil Completo',
    [BadgeCriteriaType.RETRY_PERSISTENCE]: 'Persistência',
    [BadgeCriteriaType.CONTENT_TYPE_DIVERSITY]: 'Diversidade de Conteúdo',
    [BadgeCriteriaType.TRAIL_COMPLETION]: 'Trilhas Completas',
    [BadgeCriteriaType.FIRST_TIME_ACTIVITIES]: 'Primeiras Atividades',
    [BadgeCriteriaType.TIME_BASED_ACCESS]: 'Acesso por Horário'
  };

  const criteriaTypes = Array.from(new Set(achievements.map(achievement => achievement.criteriaType)));

  if (!infoUser.id || !infoUser.currentIdInstitution) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Por favor, complete seu perfil para visualizar suas conquistas.
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">Minhas Conquistas</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Acompanhe seu progresso e desbloqueie conquistas à medida que avança em seus estudos
                </p>
              </div>
              {!isLoading && (
                <Button 
                  onClick={refresh}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Atualizar
                </Button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">
                  Erro ao carregar conquistas: {error}
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando conquistas...</p>
              </div>
            ) : (
              <>
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Nenhuma conquista disponível no momento.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Entre em contato com sua instituição para configurar conquistas.
                    </p>
                  </div>
                ) : (
                  <div>
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
                              <p className="text-3xl font-bold">{totalCount}</p>
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
                              <p className="text-3xl font-bold">{awardedCount}</p>
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
                              <p className="text-3xl font-bold">{totalCount > 0 ? Math.round((awardedCount / totalCount) * 100) : 0}%</p>
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

                    {filteredAchievements.some(achievement => achievement.isAwarded) && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Conquistas Desbloqueadas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredAchievements
                            .filter(achievement => achievement.isAwarded)
                            .map(achievement => (
                              <Card key={achievement.id} className="border-green-500 dark:border-green-700 hover:shadow-md transition-shadow">
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
                                    {achievement.name}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center mb-4">
                                    <img 
                                      src={achievement.iconUrl} 
                                      alt={achievement.name} 
                                      className="w-16 h-16 mr-4"
                                    />
                                    <div>
                                      <p className="mb-2">{achievement.description}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Conquistado em: {achievement.awardedAt ? new Date(achievement.awardedAt).toLocaleDateString('pt-BR') : 'N/A'}
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
                                    Concluído: {achievement.currentCount}/{achievement.criteriaValue} {criteriaTypeLabels[achievement.criteriaType]}
                                  </div>
                                </CardContent>
                              </Card>
                    ))}
                </div>
              </div>
            )}

                    {filteredAchievements.some(achievement => !achievement.isAwarded) && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Conquistas em Progresso</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredAchievements
                            .filter(achievement => !achievement.isAwarded)
                            .map(achievement => (
                              <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                  <CardTitle>{achievement.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center mb-4">
                                    <div className="relative mr-4">
                                      <img 
                                        src={achievement.iconUrl} 
                                        alt={achievement.name} 
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
                                      <p className="mb-2">{achievement.description}</p>
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Progresso</span>
                                      <span>{achievement.progressPercentage}%</span>
                                    </div>
                                    <Progress value={achievement.progressPercentage} />
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {achievement.currentCount}/{achievement.criteriaValue} {criteriaTypeLabels[achievement.criteriaType]}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
