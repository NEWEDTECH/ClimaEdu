'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { LoadingSpinner } from '@/components/loader';
import { showToast } from '@/components/toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/context/zustand/useProfile';
import { UpdateInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/update-institution-achievement/update-institution-achievement.use-case';
import { UpdateInstitutionAchievementInput } from '@/_core/modules/achievement/core/use-cases/update-institution-achievement/update-institution-achievement.input';
import { InstitutionAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/InstitutionAchievementRepository';
import { InstitutionAchievement } from '@/_core/modules/achievement/core/entities/InstitutionAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

interface FormData {
  name: string;
  description: string;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number;
  iconUrl: string;
  isActive: boolean;
}

const criteriaTypeOptions = [
  { value: BadgeCriteriaType.COURSE_COMPLETION, label: 'Conclusão de Cursos' },
  { value: BadgeCriteriaType.LESSON_COMPLETION, label: 'Conclusão de Lições' },
  { value: BadgeCriteriaType.QUESTIONNAIRE_COMPLETION, label: 'Conclusão de Questionários' },
  { value: BadgeCriteriaType.CERTIFICATE_ACHIEVED, label: 'Certificados Obtidos' },
  { value: BadgeCriteriaType.DAILY_LOGIN, label: 'Login Diário' },
  { value: BadgeCriteriaType.STUDY_STREAK, label: 'Sequência de Estudo' },
  { value: BadgeCriteriaType.STUDY_TIME, label: 'Tempo de Estudo' },
  { value: BadgeCriteriaType.PERFECT_SCORE, label: 'Nota Perfeita' },
  { value: BadgeCriteriaType.TRAIL_COMPLETION, label: 'Conclusão de Trilhas' },
  { value: BadgeCriteriaType.PROFILE_COMPLETION, label: 'Perfil Completo' },
];

export default function EditAchievementPage() {
  const router = useRouter();
  const params = useParams();
  const achievementId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [achievement, setAchievement] = useState<InstitutionAchievement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 1,
    iconUrl: '',
    isActive: true,
  });

  const { infoUser } = useProfile();
  const institutionId = infoUser.currentIdInstitution;

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        setLoading(true);

        const achievementRepository = container.get<InstitutionAchievementRepository>(
          Register.achievement.repository.InstitutionAchievementRepository
        );

        const foundAchievement = await achievementRepository.findById(achievementId, institutionId);

        if (!foundAchievement) {
          showToast.error('Conquista não encontrada');
          router.push('/admin/achievements');
          return;
        }

        setAchievement(foundAchievement);
        setFormData({
          name: foundAchievement.name,
          description: foundAchievement.description,
          criteriaType: foundAchievement.criteriaType,
          criteriaValue: foundAchievement.criteriaValue,
          iconUrl: foundAchievement.iconUrl,
          isActive: foundAchievement.isActive,
        });

      } catch (error) {
        console.error('Error fetching achievement:', error);
        showToast.error('Erro ao carregar conquista');
        router.push('/admin/achievements');
      } finally {
        setLoading(false);
      }
    };

    if (achievementId) {
      fetchAchievement();
    }
  }, [achievementId, institutionId, router]);

  const handleInputChange = (field: keyof FormData, value: string | number | boolean | BadgeCriteriaType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!achievement) return;

    if (!formData.name.trim()) {
      showToast.error('Nome da conquista é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      showToast.error('Descrição da conquista é obrigatória');
      return;
    }

    if (formData.criteriaValue <= 0) {
      showToast.error('Valor do critério deve ser maior que zero');
      return;
    }

    try {
      setSaving(true);

      const updateAchievementUseCase = container.get<UpdateInstitutionAchievementUseCase>(
        Register.achievement.useCase.UpdateInstitutionAchievementUseCase
      );

      const input: UpdateInstitutionAchievementInput = {
        achievementId,
        institutionId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        criteriaType: formData.criteriaType,
        criteriaValue: formData.criteriaValue,
        iconUrl: formData.iconUrl.trim() || '/icons/achievements/default.svg',
        isActive: formData.isActive,
      };

      const result = await updateAchievementUseCase.execute(input);

      if (result.success) {
        showToast.success('Conquista atualizada com sucesso!');
        router.push('/admin/achievements');
      } else {
        showToast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating achievement:', error);
      showToast.error('Erro ao atualizar conquista. Tente novamente.');
    } finally {
      setSaving(false);
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

  if (!achievement) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Conquista não encontrada</h1>
              <Link href="/admin/achievements">
                <Button>Voltar para lista</Button>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/achievements">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Editar Conquista</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Editar &quot;{achievement.name}&quot;</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome da Conquista *
                  </label>
                  <InputText
                    id="achievement-name"
                    placeholder="Ex: Leitor Dedicado"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/100 caracteres
                  </p>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Descreva o que o aluno precisa fazer para conquistar..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 caracteres
                  </p>
                </div>

                {/* Critério */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Critério *
                  </label>
                  <select
                    value={formData.criteriaType}
                    onChange={(e) => handleInputChange('criteriaType', e.target.value as BadgeCriteriaType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {criteriaTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor do Critério */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor do Critério *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.criteriaValue}
                    onChange={(e) => handleInputChange('criteriaValue', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantas vezes a ação deve ser realizada para conquistar
                  </p>
                </div>

                {/* URL do Ícone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL do Ícone
                  </label>
                  <InputText
                    id="achievement-icon-url"
                    placeholder="https://exemplo.com/icone.png"
                    value={formData.iconUrl}
                    onChange={(e) => handleInputChange('iconUrl', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL da imagem para o ícone da conquista
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Conquista ativa (disponível para os alunos)
                  </label>
                </div>

                {/* Info sobre criação */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Criada em:</strong> {achievement.createdAt.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Última atualização:</strong> {achievement.updatedAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Link href="/admin/achievements">
                    <Button type="button" variant="ghost">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
