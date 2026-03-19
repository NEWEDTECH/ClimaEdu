import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';
import { DefaultAchievement } from '@/_core/modules/achievement/core/entities/DefaultAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

// --- Configuração ---
const COLLECTION_NAME = 'achievements/default/items';
const BATCH_LIMIT = 499;

// --- Conexão com Firebase ---
initializeFirebaseAdmin();
const firestore = getAdminFirestore();

// --- Dados das Conquistas Padrão ---
const DEFAULT_ACHIEVEMENTS = [
  // === CATEGORIA: Primeiros Passos ===
  {
    id: 'default_achievement_first_lesson',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira unidade e inicie sua jornada de aprendizado!',
    iconUrl: '/icons/achievements/first-step.svg',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 1,
    category: 'Primeiros Passos'
  },
  {
    id: 'default_achievement_first_questionnaire',
    name: 'Primeiro Teste',
    description: 'Complete seu primeiro questionário e teste seus conhecimentos!',
    iconUrl: '/icons/achievements/first-test.svg',
    criteriaType: BadgeCriteriaType.QUESTIONNAIRE_COMPLETION,
    criteriaValue: 1,
    category: 'Primeiros Passos'
  },
  {
    id: 'default_achievement_first_login',
    name: 'Bem-vindo(a)!',
    description: 'Faça seu primeiro login na plataforma de aprendizado.',
    iconUrl: '/icons/achievements/welcome.svg',
    criteriaType: BadgeCriteriaType.DAILY_LOGIN,
    criteriaValue: 1,
    category: 'Primeiros Passos'
  },
  {
    id: 'default_achievement_profile_complete',
    name: 'Perfil Completo',
    description: 'Complete 100% do seu perfil com todas as informações necessárias.',
    iconUrl: '/icons/achievements/profile-complete.svg',
    criteriaType: BadgeCriteriaType.PROFILE_COMPLETION,
    criteriaValue: 100,
    category: 'Primeiros Passos'
  },

  // === CATEGORIA: Progresso ===
  {
    id: 'default_achievement_lesson_milestone_5',
    name: 'Aprendiz',
    description: 'Complete 5 lições e demonstre seu comprometimento com o aprendizado.',
    iconUrl: '/icons/achievements/apprentice.svg',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 5,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_lesson_milestone_10',
    name: 'Estudante Dedicado',
    description: 'Complete 10 lições e mostre sua dedicação aos estudos.',
    iconUrl: '/icons/achievements/dedicated-student.svg',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 10,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_lesson_milestone_25',
    name: 'Leitor Assíduo',
    description: 'Complete 25 lições e torne-se um leitor verdadeiramente assíduo.',
    iconUrl: '/icons/achievements/avid-reader.svg',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 25,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_lesson_milestone_50',
    name: 'Mestre do Conhecimento',
    description: 'Complete 50 lições e alcance o nível de mestre em aprendizado.',
    iconUrl: '/icons/achievements/knowledge-master.svg',
    criteriaType: BadgeCriteriaType.LESSON_COMPLETION,
    criteriaValue: 50,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_first_course',
    name: 'Graduado',
    description: 'Complete seu primeiro curso completo e celebre essa conquista!',
    iconUrl: '/icons/achievements/graduate.svg',
    criteriaType: BadgeCriteriaType.COURSE_COMPLETION,
    criteriaValue: 1,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_course_milestone_3',
    name: 'Especialista',
    description: 'Complete 3 cursos e torne-se um especialista em múltiplas áreas.',
    iconUrl: '/icons/achievements/specialist.svg',
    criteriaType: BadgeCriteriaType.COURSE_COMPLETION,
    criteriaValue: 3,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_course_milestone_5',
    name: 'Expert Multidisciplinar',
    description: 'Complete 5 cursos e demonstre expertise em diversas disciplinas.',
    iconUrl: '/icons/achievements/expert.svg',
    criteriaType: BadgeCriteriaType.COURSE_COMPLETION,
    criteriaValue: 5,
    category: 'Progresso'
  },
  {
    id: 'default_achievement_first_certificate',
    name: 'Certificado de Mérito',
    description: 'Obtenha seu primeiro certificado e comprove sua competência.',
    iconUrl: '/icons/achievements/first-certificate.svg',
    criteriaType: BadgeCriteriaType.CERTIFICATE_ACHIEVED,
    criteriaValue: 1,
    category: 'Progresso'
  },

  // === CATEGORIA: Engajamento ===
  {
    id: 'default_achievement_weekly_login',
    name: 'Estudante Consistente',
    description: 'Faça login por 7 dias consecutivos e mantenha a consistência.',
    iconUrl: '/icons/achievements/consistent-student.svg',
    criteriaType: BadgeCriteriaType.DAILY_LOGIN,
    criteriaValue: 7,
    category: 'Engajamento'
  },
  {
    id: 'default_achievement_monthly_login',
    name: 'Maratonista do Saber',
    description: 'Faça login por 30 dias consecutivos e prove sua resistência.',
    iconUrl: '/icons/achievements/knowledge-marathoner.svg',
    criteriaType: BadgeCriteriaType.DAILY_LOGIN,
    criteriaValue: 30,
    category: 'Engajamento'
  },
  {
    id: 'default_achievement_study_streak_7',
    name: 'Ritmo de Estudo',
    description: 'Mantenha uma sequência de 7 dias estudando regularmente.',
    iconUrl: '/icons/achievements/study-rhythm.svg',
    criteriaType: BadgeCriteriaType.STUDY_STREAK,
    criteriaValue: 7,
    category: 'Engajamento'
  },
  {
    id: 'default_achievement_study_streak_21',
    name: 'Hábito Formado',
    description: 'Estude por 21 dias consecutivos e forme um hábito duradouro.',
    iconUrl: '/icons/achievements/habit-formed.svg',
    criteriaType: BadgeCriteriaType.STUDY_STREAK,
    criteriaValue: 21,
    category: 'Engajamento'
  },
  {
    id: 'default_achievement_study_time_10h',
    name: 'Explorador do Conhecimento',
    description: 'Acumule 10 horas de estudo e explore novos horizontes.',
    iconUrl: '/icons/achievements/knowledge-explorer.svg',
    criteriaType: BadgeCriteriaType.STUDY_TIME,
    criteriaValue: 600, // 10 horas em minutos
    category: 'Engajamento'
  },
  {
    id: 'default_achievement_study_time_50h',
    name: 'Estudioso Dedicado',
    description: 'Acumule 50 horas de estudo e demonstre dedicação exemplar.',
    iconUrl: '/icons/achievements/dedicated-scholar.svg',
    criteriaType: BadgeCriteriaType.STUDY_TIME,
    criteriaValue: 3000, // 50 horas em minutos
    category: 'Engajamento'
  },
  {
    id: 'default_achievement_study_time_100h',
    name: 'Acadêmico Incansável',
    description: 'Acumule 100 horas de estudo e torne-se um acadêmico incansável.',
    iconUrl: '/icons/achievements/tireless-academic.svg',
    criteriaType: BadgeCriteriaType.STUDY_TIME,
    criteriaValue: 6000, // 100 horas em minutos
    category: 'Engajamento'
  },

  // === CATEGORIA: Excelência ===
  {
    id: 'default_achievement_perfect_score',
    name: 'Nota Mil',
    description: 'Obtenha sua primeira nota perfeita (100 pontos) em um questionário.',
    iconUrl: '/icons/achievements/perfect-score.svg',
    criteriaType: BadgeCriteriaType.PERFECT_SCORE,
    criteriaValue: 1,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_perfect_score_5',
    name: 'Perfeccionista',
    description: 'Obtenha 5 notas perfeitas e demonstre excelência constante.',
    iconUrl: '/icons/achievements/perfectionist.svg',
    criteriaType: BadgeCriteriaType.PERFECT_SCORE,
    criteriaValue: 5,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_perfect_score_10',
    name: 'Mestre da Precisão',
    description: 'Obtenha 10 notas perfeitas e torne-se um mestre da precisão.',
    iconUrl: '/icons/achievements/precision-master.svg',
    criteriaType: BadgeCriteriaType.PERFECT_SCORE,
    criteriaValue: 10,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_questionnaire_milestone_10',
    name: 'Respondedor Experiente',
    description: 'Complete 10 questionários e torne-se um respondedor experiente.',
    iconUrl: '/icons/achievements/experienced-responder.svg',
    criteriaType: BadgeCriteriaType.QUESTIONNAIRE_COMPLETION,
    criteriaValue: 10,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_questionnaire_milestone_25',
    name: 'Mestre dos Testes',
    description: 'Complete 25 questionários e domine a arte dos testes.',
    iconUrl: '/icons/achievements/test-master.svg',
    criteriaType: BadgeCriteriaType.QUESTIONNAIRE_COMPLETION,
    criteriaValue: 25,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_certificate_milestone_3',
    name: 'Colecionador de Certificados',
    description: 'Obtenha 3 certificados e forme uma coleção de conquistas.',
    iconUrl: '/icons/achievements/certificate-collector.svg',
    criteriaType: BadgeCriteriaType.CERTIFICATE_ACHIEVED,
    criteriaValue: 3,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_certificate_milestone_5',
    name: 'Profissional Certificado',
    description: 'Obtenha 5 certificados e torne-se um profissional altamente certificado.',
    iconUrl: '/icons/achievements/certified-professional.svg',
    criteriaType: BadgeCriteriaType.CERTIFICATE_ACHIEVED,
    criteriaValue: 5,
    category: 'Excelência'
  },
  {
    id: 'default_achievement_trail_completion',
    name: 'Explorador de Trilhas',
    description: 'Complete uma trilha de aprendizado completa.',
    iconUrl: '/icons/achievements/trail-explorer.svg',
    criteriaType: BadgeCriteriaType.TRAIL_COMPLETION,
    criteriaValue: 1,
    category: 'Excelência'
  }
];

// --- Funções Auxiliares ---

/**
 * Cria as conquistas padrão no Firestore
 */
const createDefaultAchievements = async (): Promise<void> => {
  console.log(`Criando ${DEFAULT_ACHIEVEMENTS.length} conquistas padrão...`);
  
  const batch = firestore.batch();
  let operationCount = 0;

  for (const achievementData of DEFAULT_ACHIEVEMENTS) {
    try {
      // Criar instância da entidade para validação
      const achievement = DefaultAchievement.create({
        id: achievementData.id,
        name: achievementData.name,
        description: achievementData.description,
        iconUrl: achievementData.iconUrl,
        criteriaType: achievementData.criteriaType,
        criteriaValue: achievementData.criteriaValue,
        category: achievementData.category,
        isGloballyEnabled: true,
        version: 1
      });

      // Converter para objeto simples para Firestore
      const achievementDoc = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        criteriaType: achievement.criteriaType,
        criteriaValue: achievement.criteriaValue,
        category: achievement.category,
        isGloballyEnabled: achievement.isGloballyEnabled,
        version: achievement.version,
        createdAt: achievement.createdAt,
        updatedAt: achievement.updatedAt
      };

      const docRef = firestore.collection(COLLECTION_NAME).doc(achievement.id);
      batch.set(docRef, achievementDoc);
      operationCount++;

      console.log(`- Conquista criada: "${achievement.name}" (${achievement.category})`);

      // Commit do batch se atingir o limite
      if (operationCount >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`Batch de ${operationCount} conquistas commitado.`);
        operationCount = 0;
      }

    } catch (error) {
      console.error(`Erro ao criar conquista ${achievementData.id}:`, error);
      throw error;
    }
  }

  // Commit final se houver operações restantes
  if (operationCount > 0) {
    await batch.commit();
    console.log(`Batch final de ${operationCount} conquistas commitado.`);
  }
};

/**
 * Verifica se já existem conquistas padrão no banco
 */
const checkExistingAchievements = async (): Promise<boolean> => {
  const snapshot = await firestore.collection(COLLECTION_NAME).limit(1).get();
  return !snapshot.empty;
};

/**
 * Limpa conquistas padrão existentes (opcional)
 */
// const clearExistingAchievements = async (): Promise<void> => {
//   console.log('Removendo conquistas padrão existentes...');
  
//   const snapshot = await firestore.collection(COLLECTION_NAME).get();
  
//   if (snapshot.empty) {
//     console.log('Nenhuma conquista existente encontrada.');
//     return;
//   }

//   const batch = firestore.batch();
//   let operationCount = 0;

//   snapshot.docs.forEach((doc) => {
//     batch.delete(doc.ref);
//     operationCount++;
//   });

//   if (operationCount > 0) {
//     await batch.commit();
//     console.log(`${operationCount} conquistas existentes removidas.`);
//   }
// };

// --- Função Principal ---

const seedDefaultAchievements = async (): Promise<void> => {
  console.log('--- Iniciando o seed de Conquistas Padrão ---');
  
  try {
    // Verificar se já existem conquistas
    const hasExisting = await checkExistingAchievements();
    
    if (hasExisting) {
      console.log('⚠️  Conquistas padrão já existem no banco de dados.');
      console.log('Para sobrescrever, descomente a linha de limpeza no código.');
      
      // Descomente a linha abaixo se quiser limpar conquistas existentes
      // await clearExistingAchievements();
      
      // Para fins de demonstração, vamos parar aqui
      console.log('Execução interrompida. Nenhuma alteração foi feita.');
      return;
    }

    // Criar as conquistas padrão
    await createDefaultAchievements();

    // Resumo final
    console.log('\n--- Seed de Conquistas Padrão concluído com sucesso! ---');
    console.log(`✅ ${DEFAULT_ACHIEVEMENTS.length} conquistas padrão criadas`);
    
    // Estatísticas por categoria
    const categories = [...new Set(DEFAULT_ACHIEVEMENTS.map(a => a.category))];
    categories.forEach(category => {
      const count = DEFAULT_ACHIEVEMENTS.filter(a => a.category === category).length;
      console.log(`   • ${category}: ${count} conquistas`);
    });

    console.log('\n📋 As conquistas estão agora disponíveis como templates na interface administrativa.');

  } catch (error) {
    console.error('\n--- Erro durante o seed de conquistas padrão ---');
    console.error(error);
    throw error;
  }
};

// --- Execução ---
seedDefaultAchievements();