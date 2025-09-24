import { container } from '@/_core/shared/container/container';
import { AchievementSymbols } from '@/_core/shared/container/modules/achievement/symbols';
import { DefaultAchievement } from '@/_core/modules/achievement/core/entities/DefaultAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';
import type { DefaultAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/DefaultAchievementRepository';
import { nanoid } from 'nanoid';

const defaultAchievements = [
  // Categoria: Primeiros Passos
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Bem-vindo',
    description: 'Complete seu perfil pela primeira vez',
    iconUrl: '/icons/achievements/welcome.svg',
    criteriaType: BadgeCriteriaType.PROFILE_COMPLETION,
    criteriaValue: 1,
    category: 'Primeiros Passos'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Primeira Lição',
    description: 'Complete sua primeira lição',
    iconUrl: '/icons/achievements/first-lesson.svg',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 1,
    category: 'Primeiros Passos'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Primeira Nota',
    description: 'Complete seu primeiro questionário',
    iconUrl: '/icons/achievements/first-quiz.svg',
    criteriaType: BadgeCriteriaType.QUESTIONNAIRE_COMPLETION,
    criteriaValue: 1,
    category: 'Primeiros Passos'
  },

  // Categoria: Progresso
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Finalista',
    description: 'Complete um curso inteiro',
    iconUrl: '/icons/achievements/course-complete.svg',
    criteriaType: BadgeCriteriaType.COURSE_COMPLETION,
    criteriaValue: 1,
    category: 'Progresso'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Colecionador',
    description: 'Complete 3 cursos diferentes',
    iconUrl: '/icons/achievements/collector.svg',
    criteriaType: BadgeCriteriaType.COURSE_COMPLETION,
    criteriaValue: 3,
    category: 'Progresso'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Trilheiro',
    description: 'Complete uma trilha completa',
    iconUrl: '/icons/achievements/trail-complete.svg',
    criteriaType: BadgeCriteriaType.TRAIL_COMPLETION,
    criteriaValue: 1,
    category: 'Progresso'
  },

  // Categoria: Engajamento
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Visitante Assíduo',
    description: 'Acesse a plataforma 7 dias consecutivos',
    iconUrl: '/icons/achievements/daily-visitor.svg',
    criteriaType: BadgeCriteriaType.DAILY_LOGIN,
    criteriaValue: 7,
    category: 'Engajamento'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Estudante Dedicado',
    description: 'Estude por 2 horas ou mais em um único dia',
    iconUrl: '/icons/achievements/dedicated-student.svg',
    criteriaType: BadgeCriteriaType.STUDY_TIME,
    criteriaValue: 7200, // 2 hours in seconds
    category: 'Engajamento'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Sequência de Ouro',
    description: 'Mantenha uma sequência de estudos de 14 dias',
    iconUrl: '/icons/achievements/golden-streak.svg',
    criteriaType: BadgeCriteriaType.STUDY_STREAK,
    criteriaValue: 14,
    category: 'Engajamento'
  },

  // Categoria: Excelência
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Nota Máxima',
    description: 'Obtenha 100% de acertos em um questionário',
    iconUrl: '/icons/achievements/perfect-score.svg',
    criteriaType: BadgeCriteriaType.PERFECT_SCORE,
    criteriaValue: 1,
    category: 'Excelência'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Expert',
    description: 'Mantenha média acima de 90% em 5 questionários',
    iconUrl: '/icons/achievements/expert.svg',
    criteriaType: BadgeCriteriaType.QUESTIONNAIRE_COMPLETION,
    criteriaValue: 5,
    category: 'Excelência'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Certificado',
    description: 'Obtenha seu primeiro certificado',
    iconUrl: '/icons/achievements/certificate.svg',
    criteriaType: BadgeCriteriaType.CERTIFICATE_ACHIEVED,
    criteriaValue: 1,
    category: 'Excelência'
  },

  // Categoria: Persistência
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Determinado',
    description: 'Refaça um questionário até conseguir passar',
    iconUrl: '/icons/achievements/determined.svg',
    criteriaType: BadgeCriteriaType.RETRY_PERSISTENCE,
    criteriaValue: 1,
    category: 'Persistência'
  },
  {
    id: 'def_ach_' + nanoid(10),
    name: 'Explorador',
    description: 'Acesse 5 tipos diferentes de conteúdo',
    iconUrl: '/icons/achievements/explorer.svg',
    criteriaType: BadgeCriteriaType.CONTENT_TYPE_DIVERSITY,
    criteriaValue: 5,
    category: 'Exploração'
  }
];

/**
 * Seeds the database with default achievements
 * This script should be run during application initialization or as a migration
 */
export async function seedDefaultAchievements(): Promise<void> {
  try {
    const repository = container.get<DefaultAchievementRepository>(
      AchievementSymbols.repositories.DefaultAchievementRepository
    );

    console.log('🌱 Starting to seed default achievements...');

    // Check if achievements already exist to avoid duplicates
    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing achievements. Skipping seed.`);
      return;
    }

    // Create achievement entities
    const achievements: DefaultAchievement[] = [];
    
    for (const achData of defaultAchievements) {
      const achievement = DefaultAchievement.create({
        id: achData.id,
        name: achData.name,
        description: achData.description,
        iconUrl: achData.iconUrl,
        criteriaType: achData.criteriaType,
        criteriaValue: achData.criteriaValue,
        category: achData.category,
        isGloballyEnabled: true,
      });
      
      achievements.push(achievement);
    }

    // Bulk create all achievements
    await repository.bulkCreate(achievements);

    console.log(`✅ Successfully seeded ${achievements.length} default achievements`);
    
    // Log the achievements by category
    const categories = achievements.reduce((acc, ach) => {
      if (!acc[ach.category]) acc[ach.category] = 0;
      acc[ach.category]++;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Achievements by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} achievements`);
    });

  } catch (error) {
    console.error('❌ Error seeding default achievements:', error);
    throw error;
  }
}

/**
 * Run this script directly if called from command line
 */
if (require.main === module) {
  // Initialize container dependencies first
  import('@/_core/shared/container/containerRegister').then(({ registerDependencies }) => {
    registerDependencies();
    return seedDefaultAchievements();
  }).then(() => {
    console.log('🎉 Seed process completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Seed process failed:', error);
    process.exit(1);
  });
}