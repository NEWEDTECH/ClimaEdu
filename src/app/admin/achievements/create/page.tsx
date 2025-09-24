'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { showToast } from '@/components/toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/context/zustand/useProfile';
import { CreateInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/create-institution-achievement/create-institution-achievement.use-case';
import { CreateInstitutionAchievementInput } from '@/_core/modules/achievement/core/use-cases/create-institution-achievement/create-institution-achievement.input';
import { CopyDefaultAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/copy-default-achievement/copy-default-achievement.use-case';
import { ListDefaultAchievementTemplatesUseCase } from '@/_core/modules/achievement/core/use-cases/list-default-achievement-templates/list-default-achievement-templates.use-case';
import type { DefaultAchievement } from '@/_core/modules/achievement/core/entities/DefaultAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';
import { useEffect } from 'react';

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

export default function CreateAchievementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templates, setTemplates] = useState<DefaultAchievement[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
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
  const userId = infoUser.id;

  // Redirect if no institution selected
  useEffect(() => {
    if (!institutionId) {
      showToast.error('Por favor, selecione uma instituição');
      router.push('/admin');
      return;
    }
  }, [institutionId, router]);

  // Load available templates
  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);

      const listTemplatesUseCase = container.get<ListDefaultAchievementTemplatesUseCase>(
        Register.achievement.useCase.ListDefaultAchievementTemplatesUseCase
      );

      const result = await listTemplatesUseCase.execute();
      setTemplates(result.templates);
      setShowTemplates(true);

    } catch (error) {
      console.error('Error loading templates:', error);
      showToast.error('Erro ao carregar templates de conquistas');
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Copy a template to form
  const copyTemplate = async (template: DefaultAchievement) => {
    try {
      setLoading(true);

      const copyUseCase = container.get<CopyDefaultAchievementUseCase>(
        Register.achievement.useCase.CopyDefaultAchievementUseCase
      );

      await copyUseCase.execute({
        defaultAchievementId: template.id,
        institutionId,
        createdBy: userId
      });

      showToast.success(`Template "${template.name}" copiado com sucesso!`);
      router.push('/admin/achievements');

    } catch (error) {
      console.error('Error copying template:', error);
      showToast.error('Erro ao copiar template');
    } finally {
      setLoading(false);
    }
  };

  // Fill form with template data (for preview/editing)
  const fillFormWithTemplate = (template: DefaultAchievement) => {
    setFormData({
      name: template.name,
      description: template.description,
      criteriaType: template.criteriaType,
      criteriaValue: template.criteriaValue,
      iconUrl: template.iconUrl,
      isActive: true,
    });
    setShowTemplates(false);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      setLoading(true);

      const createAchievementUseCase = container.get<CreateInstitutionAchievementUseCase>(
        Register.achievement.useCase.CreateInstitutionAchievementUseCase
      );

      const input: CreateInstitutionAchievementInput = {
        institutionId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        criteriaType: formData.criteriaType,
        criteriaValue: formData.criteriaValue,
        iconUrl: formData.iconUrl.trim() || '/icons/achievements/default.svg',
        isActive: formData.isActive,
        createdBy: userId,
      };

      const result = await createAchievementUseCase.execute(input);

      if (result.success) {
        showToast.success('Conquista criada com sucesso!');
        router.push('/admin/achievements');
      } else {
        showToast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating achievement:', error);
      showToast.error('Erro ao criar conquista. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold">Nova Conquista</h1>
          </div>

          {/* Templates Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Templates de Conquistas</CardTitle>
              <p className="text-sm text-gray-600">
                Use templates pré-definidos para criar conquistas rapidamente ou como base para personalização
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={loadTemplates}
                  disabled={templatesLoading}
                >
                  {templatesLoading ? 'Carregando...' : 'Ver Templates Disponíveis'}
                </Button>
                
                {showTemplates && (
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setShowTemplates(false)}
                  >
                    Ocultar Templates
                  </Button>
                )}
              </div>

              {/* Templates Grid */}
              {showTemplates && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        <span className="inline-block bg-gray-200 px-2 py-1 rounded">
                          {template.category}
                        </span>
                        <span className="ml-2">
                          {criteriaTypeOptions.find(opt => opt.value === template.criteriaType)?.label}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => copyTemplate(template)}
                          disabled={loading}
                          className="flex-1"
                        >
                          Usar Template
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fillFormWithTemplate(template)}
                          className="flex-1"
                        >
                          Personalizar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showTemplates && templates.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Nenhum template disponível no momento.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Criar Conquista Personalizada</CardTitle>
              <p className="text-sm text-gray-600">
                Ou crie uma conquista completamente personalizada
              </p>
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
                    Deixe em branco para usar ícone padrão
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

                {/* Ações */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Criando...' : 'Criar Conquista'}
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