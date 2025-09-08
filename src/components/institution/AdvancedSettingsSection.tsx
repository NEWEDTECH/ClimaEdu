'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { ThresholdSlider } from './ThresholdSlider';
import { NumericInput } from './NumericInput';
import { ToggleSettings } from './ToggleSettings';
import { Button } from "@/components/ui/button/button";
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { InstitutionSettings as GlobalSettings } from '@/_core/shared/config/settings.config';
import { defaultInstitutionSettings } from '@/_core/shared/config/settings.config';

interface AdvancedSettingsSectionProps {
  settings?: Partial<GlobalSettings['settings']>;
  onChange: (settings: Partial<GlobalSettings['settings']>) => void;
}

export function AdvancedSettingsSection({ settings = {}, onChange }: AdvancedSettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<Partial<GlobalSettings['settings']>>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleResetAll = () => {
    setCurrentSettings({});
    onChange({});
  };

  const updateSetting = <T extends keyof GlobalSettings['settings']>(
    key: T,
    value: GlobalSettings['settings'][T]
  ) => {
    const updated = {
      ...currentSettings,
      [key]: value
    };
    setCurrentSettings(updated);
    onChange(updated);
  };

  const updateNestedSetting = <
    T extends keyof GlobalSettings['settings'],
    K extends keyof GlobalSettings['settings'][T]
  >(
    parentKey: T,
    childKey: K,
    value: GlobalSettings['settings'][T][K]
  ) => {
    const updated = {
      ...currentSettings,
      [parentKey]: {
        ...(currentSettings[parentKey] as Record<string, unknown> || {}),
        [childKey]: value
      }
    };
    setCurrentSettings(updated);
    onChange(updated);
  };

  const getRiskLevel = (level: 'high' | 'medium') => 
    currentSettings.riskLevels?.[level] ?? defaultInstitutionSettings.settings.riskLevels[level];
  
  const getParticipationLevel = (level: 'high' | 'medium') => 
    currentSettings.participationLevels?.[level] ?? defaultInstitutionSettings.settings.participationLevels[level];
  
  const getPerformanceRating = (rating: keyof GlobalSettings['settings']['performanceRatings']) => 
    currentSettings.performanceRatings?.[rating] ?? defaultInstitutionSettings.settings.performanceRatings[rating];

  const getInactivityThreshold = () => 
    currentSettings.inactivityThreshold ?? defaultInstitutionSettings.settings.inactivityThreshold;
  
  const getProfileCompleteness = () => 
    currentSettings.profileCompleteness ?? defaultInstitutionSettings.settings.profileCompleteness;
  
  const getCourseNavigation = (setting: keyof GlobalSettings['settings']['courseNavigation']) => 
    currentSettings.courseNavigation?.[setting] ?? defaultInstitutionSettings.settings.courseNavigation[setting];

  if (!isExpanded) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-2"
            >
              <span>Expandir</span>
              <ChevronDown size={16} />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="flex items-center space-x-2 text-blue-600"
            >
              <RotateCcw size={14} />
              <span>Reset All</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="flex items-center space-x-2"
            >
              <span>Colapsar</span>
              <ChevronUp size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Risk Analysis */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Análise de Risco
          </h3>
          <p className="text-sm text-gray-600">
            Configure os thresholds para classificação de risco dos estudantes baseado na performance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThresholdSlider
              label="Alto Risco"
              description="Estudantes com performance abaixo deste valor são classificados como alto risco"
              value={getRiskLevel('high')}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateNestedSetting('riskLevels', 'high', value)}
              defaultValue={defaultInstitutionSettings.settings.riskLevels.high}
              onReset={() => updateNestedSetting('riskLevels', 'high', defaultInstitutionSettings.settings.riskLevels.high)}
            />
            
            <ThresholdSlider
              label="Risco Médio"
              description="Estudantes com performance abaixo deste valor são classificados como risco médio"
              value={getRiskLevel('medium')}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateNestedSetting('riskLevels', 'medium', value)}
              defaultValue={defaultInstitutionSettings.settings.riskLevels.medium}
              onReset={() => updateNestedSetting('riskLevels', 'medium', defaultInstitutionSettings.settings.riskLevels.medium)}
            />
          </div>
        </div>

        {/* Participation Levels */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Níveis de Participação
          </h3>
          <p className="text-sm text-gray-600">
            Configure os thresholds para classificação da participação dos estudantes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThresholdSlider
              label="Alta Participação"
              description="Número de atividades para considerar alta participação"
              value={getParticipationLevel('high')}
              min={0}
              max={50}
              onChange={(value) => updateNestedSetting('participationLevels', 'high', value)}
              defaultValue={defaultInstitutionSettings.settings.participationLevels.high}
              onReset={() => updateNestedSetting('participationLevels', 'high', defaultInstitutionSettings.settings.participationLevels.high)}
            />
            
            <ThresholdSlider
              label="Participação Média"
              description="Número de atividades para considerar participação média"
              value={getParticipationLevel('medium')}
              min={0}
              max={30}
              onChange={(value) => updateNestedSetting('participationLevels', 'medium', value)}
              defaultValue={defaultInstitutionSettings.settings.participationLevels.medium}
              onReset={() => updateNestedSetting('participationLevels', 'medium', defaultInstitutionSettings.settings.participationLevels.medium)}
            />
          </div>
        </div>

        {/* Performance Ratings */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Avaliações de Performance
          </h3>
          <p className="text-sm text-gray-600">
            Configure os thresholds para classificação da performance dos estudantes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThresholdSlider
              label="Excelente"
              description="Performance mínima para classificação excelente"
              value={getPerformanceRating('excellent')}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateNestedSetting('performanceRatings', 'excellent', value)}
              defaultValue={defaultInstitutionSettings.settings.performanceRatings.excellent}
              onReset={() => updateNestedSetting('performanceRatings', 'excellent', defaultInstitutionSettings.settings.performanceRatings.excellent)}
            />
            
            <ThresholdSlider
              label="Bom"
              description="Performance mínima para classificação boa"
              value={getPerformanceRating('good')}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateNestedSetting('performanceRatings', 'good', value)}
              defaultValue={defaultInstitutionSettings.settings.performanceRatings.good}
              onReset={() => updateNestedSetting('performanceRatings', 'good', defaultInstitutionSettings.settings.performanceRatings.good)}
            />
            
            <ThresholdSlider
              label="Médio"
              description="Performance mínima para classificação média"
              value={getPerformanceRating('average')}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateNestedSetting('performanceRatings', 'average', value)}
              defaultValue={defaultInstitutionSettings.settings.performanceRatings.average}
              onReset={() => updateNestedSetting('performanceRatings', 'average', defaultInstitutionSettings.settings.performanceRatings.average)}
            />
            
            <ThresholdSlider
              label="Abaixo da Média"
              description="Performance mínima para classificação abaixo da média"
              value={getPerformanceRating('belowAverage')}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateNestedSetting('performanceRatings', 'belowAverage', value)}
              defaultValue={defaultInstitutionSettings.settings.performanceRatings.belowAverage}
              onReset={() => updateNestedSetting('performanceRatings', 'belowAverage', defaultInstitutionSettings.settings.performanceRatings.belowAverage)}
            />
          </div>
        </div>

        {/* Behavior Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Configurações Comportamentais
          </h3>
          <p className="text-sm text-gray-600">
            Configure thresholds para comportamento e engajamento dos estudantes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumericInput
              label="Threshold de Inatividade"
              description="Número de dias sem acesso para considerar o estudante inativo"
              value={getInactivityThreshold()}
              min={1}
              max={365}
              unit="dias"
              onChange={(value) => updateSetting('inactivityThreshold', value)}
              defaultValue={defaultInstitutionSettings.settings.inactivityThreshold}
              onReset={() => updateSetting('inactivityThreshold', defaultInstitutionSettings.settings.inactivityThreshold)}
            />
            
            <NumericInput
              label="Completude do Perfil"
              description="Percentual mínimo de completude do perfil do estudante"
              value={getProfileCompleteness()}
              min={0}
              max={100}
              unit="%"
              onChange={(value) => updateSetting('profileCompleteness', value)}
              defaultValue={defaultInstitutionSettings.settings.profileCompleteness}
              onReset={() => updateSetting('profileCompleteness', defaultInstitutionSettings.settings.profileCompleteness)}
            />
          </div>
        </div>

        {/* Course Navigation */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Navegação do Curso
          </h3>
          <p className="text-sm text-gray-600">
            Configure como os estudantes podem navegar pelos cursos e lições.
          </p>
          
          <div className="space-y-4">
            <ToggleSettings
              label="Progresso Sequencial Obrigatório"
              description="Os estudantes devem completar as lições em ordem sequencial"
              enabled={getCourseNavigation('requireSequentialProgress')}
              onChange={(value) => updateNestedSetting('courseNavigation', 'requireSequentialProgress', value)}
              defaultValue={defaultInstitutionSettings.settings.courseNavigation.requireSequentialProgress}
              onReset={() => updateNestedSetting('courseNavigation', 'requireSequentialProgress', defaultInstitutionSettings.settings.courseNavigation.requireSequentialProgress)}
            />
            
            <ToggleSettings
              label="Permitir Pular Lições"
              description="Os estudantes podem pular lições sem completá-las"
              enabled={getCourseNavigation('allowSkipLesson')}
              onChange={(value) => updateNestedSetting('courseNavigation', 'allowSkipLesson', value)}
              defaultValue={defaultInstitutionSettings.settings.courseNavigation.allowSkipLesson}
              onReset={() => updateNestedSetting('courseNavigation', 'allowSkipLesson', defaultInstitutionSettings.settings.courseNavigation.allowSkipLesson)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}