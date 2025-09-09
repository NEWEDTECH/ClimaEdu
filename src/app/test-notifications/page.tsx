'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { showAchievementNotification, AchievementNotificationDemo } from '@/components/achievements/AchievementNotification';
import { showToast } from '@/components/toast';

export default function TestNotificationsPage() {
  const testBasicToast = () => {
    showToast.success('Toast básico funcionando!');
  };

  const testWarningToast = () => {
    showToast.warning('Toast de aviso funcionando!');
  };

  const testErrorToast = () => {
    showToast.error('Toast de erro funcionando!');
  };

  const testAchievementNotification = () => {
    showAchievementNotification({
      id: 'test_achievement_' + Date.now(),
      name: 'Testador Experiente',
      description: 'Você testou com sucesso as notificações de conquistas!',
      iconUrl: '/icons/achievements/test.svg',
      category: 'Teste'
    });
  };

  const testMultipleAchievements = () => {
    const achievements = [
      {
        id: 'test_1_' + Date.now(),
        name: 'Primeira Conquista',
        description: 'Primeira conquista de teste.',
        iconUrl: '/icons/achievements/first.svg',
        category: 'Primeiros Passos'
      },
      {
        id: 'test_2_' + Date.now(),
        name: 'Segunda Conquista',
        description: 'Segunda conquista de teste.',
        iconUrl: '/icons/achievements/second.svg',
        category: 'Progresso'
      },
      {
        id: 'test_3_' + Date.now(),
        name: 'Terceira Conquista',
        description: 'Terceira conquista de teste.',
        iconUrl: '/icons/achievements/third.svg',
        category: 'Excelência'
      }
    ];

    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        showAchievementNotification(achievement);
      }, index * 500);
    });
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Teste de Notificações</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Testes de Toast Básico */}
            <Card>
              <CardHeader>
                <CardTitle>Toasts Básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testBasicToast}
                  className="w-full"
                >
                  Toast de Sucesso
                </Button>
                
                <Button 
                  onClick={testWarningToast}
                  variant="secondary"
                  className="w-full"
                >
                  Toast de Aviso
                </Button>
                
                <Button 
                  onClick={testErrorToast}
                  variant="ghost"
                  className="w-full"
                >
                  Toast de Erro
                </Button>
              </CardContent>
            </Card>

            {/* Testes de Notificação de Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações de Conquistas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testAchievementNotification}
                  className="w-full"
                >
                  Conquista Única
                </Button>
                
                <Button 
                  onClick={testMultipleAchievements}
                  variant="secondary"
                  className="w-full"
                >
                  Múltiplas Conquistas
                </Button>
              </CardContent>
            </Card>

            {/* Demo Component Existente */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Componente Demo Existente</CardTitle>
              </CardHeader>
              <CardContent>
                <AchievementNotificationDemo />
              </CardContent>
            </Card>

            {/* Instruções */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Instruções para Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>1. Toasts Básicos:</strong> Teste cada tipo de toast para verificar se aparecem e podem ser fechados sem erros.</p>
                  <p><strong>2. Conquista Única:</strong> Teste uma notificação de conquista individual.</p>
                  <p><strong>3. Múltiplas Conquistas:</strong> Teste a fila de notificações com múltiplas conquistas.</p>
                  <p><strong>4. Verificar Console:</strong> Abra o console do navegador para verificar se não há erros JavaScript.</p>
                  <p><strong>5. Fechar Notificações:</strong> Tente fechar as notificações clicando no X para verificar se o erro foi corrigido.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}