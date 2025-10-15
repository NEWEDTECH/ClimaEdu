import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { AchievementCard } from './AchievementCard';
import { InstitutionAchievement } from '@/_core/modules/achievement/core/entities/InstitutionAchievement';

interface AchievementsListProps {
  achievements: InstitutionAchievement[];
  onToggleStatus: (achievementId: string, currentStatus: boolean) => void;
  onDelete: (achievementId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  showCreateButton?: boolean;
}

export function AchievementsList({
  achievements,
  onToggleStatus,
  onDelete,
  loading = false,
  emptyMessage = 'Nenhuma conquista encontrada.',
  showCreateButton = true
}: AchievementsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <p className="text-gray-500 text-lg mb-4">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}