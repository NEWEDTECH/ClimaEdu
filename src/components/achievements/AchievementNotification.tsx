'use client';

import React, { useEffect, useState } from 'react';
import { showToast } from '@/components/toast';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/button'

export interface AchievementNotificationData {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: string;
}

// Global notification queue
const notificationQueue: AchievementNotificationData[] = [];
let isProcessing = false;

/**
 * Add achievement notification to queue
 * @param achievement Achievement data to show
 */
export function showAchievementNotification(achievement: AchievementNotificationData): void {
  notificationQueue.push(achievement);
  processNotificationQueue();
}

/**
 * Process notification queue to show one at a time
 */
async function processNotificationQueue(): Promise<void> {
  if (isProcessing || notificationQueue.length === 0) return;
  
  isProcessing = true;
  
  while (notificationQueue.length > 0) {
    const achievement = notificationQueue.shift();
    if (achievement) {
      await showSingleAchievementNotification(achievement);
      // Wait a bit between notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  isProcessing = false;
}

/**
 * Show a single achievement notification using the existing toast system
 */
async function showSingleAchievementNotification(achievement: AchievementNotificationData): Promise<void> {
  // const icon = getCategoryIcon(achievement.category);
  
  // Create simplified content for the toast
  const content = (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
        <Trophy className="h-6 w-6" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 mb-1">
          <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
            🏆 Nova Conquista!
          </span>
        </div>
        
        <h4 className="text-base font-bold text-gray-900 dark:text-white">
          {achievement.name}
        </h4>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {achievement.description}
        </p>
      </div>
    </div>
  );

  // Show as success toast with longer duration
  showToast.success(content, {
    autoClose: 6000,
    position: 'top-right',
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    containerId: 'main-toast-container'
  });
  
  // Also log for debugging
  console.log('🏆 Achievement unlocked:', achievement.name);
}

/**
 * Get icon based on achievement category
 */
// function getCategoryIcon(category: string) {
//   switch (category.toLowerCase()) {
//     case 'primeiros passos':
//       return <Star className="h-6 w-6" />;
//     case 'progresso':
//       return <Trophy className="h-6 w-6" />;
//     case 'excelência':
//       return <Award className="h-6 w-6" />;
//     case 'engajamento':
//       return <Trophy className="h-6 w-6" />;
//     default:
//       return <Trophy className="h-6 w-6" />;
//   }
// }

/**
 * Hook to listen for achievement notifications
 * Can be used in components that need to trigger notifications
 */
export function useAchievementNotifications() {
  const [queueLength, setQueueLength] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueLength(notificationQueue.length);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    showNotification: showAchievementNotification,
    queueLength,
    isProcessing
  };
}

/**
 * Demo function for testing notifications
 */
export function showDemoAchievementNotification(): void {
  showAchievementNotification({
    id: 'demo_' + Date.now(),
    name: 'Primeira Lição',
    description: 'Parabéns! Você completou sua primeira lição na plataforma.',
    iconUrl: '/icons/achievements/first-lesson.svg',
    category: 'Primeiros Passos'
  });
}

// Component that can be rendered for testing purposes
export function AchievementNotificationDemo() {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Teste de Notificações de Conquistas</h3>
      <Button
        onClick={showDemoAchievementNotification}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Mostrar Notificação Demo
      </Button>
    </div>
  );
}