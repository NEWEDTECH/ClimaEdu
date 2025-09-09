import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card/card';
import { PencilIcon, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { InstitutionAchievement } from '@/_core/modules/achievement/core/entities/InstitutionAchievement';

interface AchievementCardProps {
  achievement: InstitutionAchievement;
  onToggleStatus: (achievementId: string, currentStatus: boolean) => void;
  onDelete: (achievementId: string) => void;
}

export function AchievementCard({ achievement, onToggleStatus, onDelete }: AchievementCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold">{achievement.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                achievement.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {achievement.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{achievement.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                <strong>Critério:</strong> {achievement.criteriaType.replace(/_/g, ' ')}
              </span>
              <span>
                <strong>Valor:</strong> {achievement.criteriaValue}
              </span>
              <span>
                <strong>Criada em:</strong> {achievement.createdAt.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onToggleStatus(achievement.id, achievement.isActive)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title={achievement.isActive ? 'Desativar conquista' : 'Ativar conquista'}
            >
              {achievement.isActive ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
            </button>

            <Link href={`/admin/achievements/edit/${achievement.id}`}>
              <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors" title="Editar conquista">
                <PencilIcon className="h-5 w-5" />
              </button>
            </Link>

            <button
              onClick={() => onDelete(achievement.id)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Deletar conquista"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}