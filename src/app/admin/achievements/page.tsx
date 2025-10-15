'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { LoadingSpinner } from '@/components/loader';
import { SelectComponent } from '@/components/select/select';
import { showToast } from '@/components/toast';
import { useProfile } from '@/context/zustand/useProfile';
import { InstitutionAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/InstitutionAchievementRepository';
import { DeleteInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/delete-institution-achievement/delete-institution-achievement.use-case';
import { InstitutionAchievement } from '@/_core/modules/achievement/core/entities/InstitutionAchievement';
import { AchievementsList } from '@/components/achievements';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<InstitutionAchievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<InstitutionAchievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const { infoUser } = useProfile();
  const institutionId = infoUser.currentIdInstitution;

  // Redirect if no institution selected
  useEffect(() => {
    if (!institutionId) {
      showToast.error('Por favor, selecione uma instituição');
      return;
    }
  }, [institutionId]);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);

      const achievementRepository = container.get<InstitutionAchievementRepository>(
        Register.achievement.repository.InstitutionAchievementRepository
      );

      const achievementsList = await achievementRepository.listByInstitution(institutionId, {
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      setAchievements(achievementsList);
      setFilteredAchievements(achievementsList);
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Falha ao carregar conquistas. Tente novamente.');
      showToast.error('Erro ao carregar conquistas');
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    if (institutionId) {
      fetchAchievements();
    }
  }, [institutionId, fetchAchievements]);

  useEffect(() => {
    let filtered = achievements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(achievement =>
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(achievement =>
        statusFilter === 'active' ? achievement.isActive : !achievement.isActive
      );
    }

    setFilteredAchievements(filtered);
  }, [achievements, searchTerm, statusFilter]);

  const toggleAchievementStatus = async (achievementId: string, currentStatus: boolean) => {
    try {
      const achievementRepository = container.get<InstitutionAchievementRepository>(
        Register.achievement.repository.InstitutionAchievementRepository
      );

      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) return;

      if (currentStatus) {
        achievement.deactivate();
      } else {
        achievement.activate();
      }

      await achievementRepository.update(achievement);
      
      // Update local state
      setAchievements(prev => 
        prev.map(a => a.id === achievementId ? achievement : a)
      );

      showToast.success(`Conquista ${currentStatus ? 'desativada' : 'ativada'} com sucesso`);
    } catch (err) {
      console.error('Error toggling achievement status:', err);
      showToast.error('Erro ao alterar status da conquista');
    }
  };

  const deleteAchievement = async (achievementId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta conquista? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const deleteAchievementUseCase = container.get<DeleteInstitutionAchievementUseCase>(
        Register.achievement.useCase.DeleteInstitutionAchievementUseCase
      );

      const result = await deleteAchievementUseCase.execute({
        achievementId,
        institutionId
      });

      if (result.success) {
        // Remove from local state
        setAchievements(prev => prev.filter(a => a.id !== achievementId));
        showToast.success('Conquista deletada com sucesso');
      } else {
        showToast.error(result.message);
      }
    } catch (err) {
      console.error('Error deleting achievement:', err);
      showToast.error('Erro ao deletar conquista');
    }
  };

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Conquistas da Instituição</h1>
            <Link href="/admin/achievements/create">
              <Button className="flex items-center gap-2">
                Nova Conquista
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-64">
              <InputText
                id="search-achievements"
                placeholder="Buscar conquistas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <SelectComponent
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'active', label: 'Ativas' },
                { value: 'inactive', label: 'Inativas' }
              ]}
              placeholder="Selecione o status"
              className="w-48"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Achievements List */}
          <AchievementsList
            achievements={filteredAchievements}
            onToggleStatus={toggleAchievementStatus}
            onDelete={deleteAchievement}
            emptyMessage={
              achievements.length === 0 
                ? 'Nenhuma conquista criada ainda.' 
                : 'Nenhuma conquista encontrada com os filtros aplicados.'
            }
            showCreateButton={achievements.length === 0}
          />
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
