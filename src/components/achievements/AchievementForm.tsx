import React from 'react';
import { InputText } from '@/components/input';
import { Button } from '@/components/button';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

interface AchievementFormData {
  name: string;
  description: string;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number;
  iconUrl: string;
  isActive: boolean;
}

interface AchievementFormProps {
  formData: AchievementFormData;
  onInputChange: (field: keyof AchievementFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
  onCancel: () => void;
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

export function AchievementForm({
  formData,
  onInputChange,
  onSubmit,
  loading,
  submitLabel,
  onCancel
}: AchievementFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nome da Conquista *
        </label>
        <InputText
          id="achievement-name"
          placeholder="Ex: Leitor Dedicado"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
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
          onChange={(e) => onInputChange('description', e.target.value)}
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
          onChange={(e) => onInputChange('criteriaType', e.target.value as BadgeCriteriaType)}
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
          onChange={(e) => onInputChange('criteriaValue', parseInt(e.target.value) || 1)}
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
          onChange={(e) => onInputChange('iconUrl', e.target.value)}
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
          onChange={(e) => onInputChange('isActive', e.target.checked)}
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
          {loading ? 'Salvando...' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}