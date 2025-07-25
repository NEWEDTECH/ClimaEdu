import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminAuth, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

// --- Conexão com Firebase ---
initializeFirebaseAdmin();
const auth = getAdminAuth();
const firestore = getAdminFirestore();

const BATCH_LIMIT = 499;

// --- Funções de Limpeza ---

const deleteAllUsers = async () => {
  console.log('Deletando todos os usuários do Auth...');
  try {
    const listUsersResult = await auth.listUsers(1000);
    const uids = listUsersResult.users.map(userRecord => userRecord.uid);
    
    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      console.log(`- ${uids.length} usuários deletados com sucesso.`);
    } else {
      console.log('- Nenhum usuário encontrado para deletar.');
    }
  } catch (error) {
    console.error('Erro ao deletar usuários do Auth:', error);
  }
};

const deleteCollection = async (collectionPath: string) => {
  console.log(`Deletando coleção: ${collectionPath}...`);
  const collectionRef = firestore.collection(collectionPath);
  const querySnapshot = await collectionRef.limit(BATCH_LIMIT).get();

  if (querySnapshot.empty) {
    console.log(`- Coleção "${collectionPath}" já está vazia.`);
    return;
  }

  const batch = firestore.batch();
  let count = 0;
  for (const doc of querySnapshot.docs) {
    batch.delete(doc.ref);
    count++;
  }
  await batch.commit();
  console.log(`- ${count} documentos deletados de "${collectionPath}".`);

  // Se a coleção ainda tiver documentos, chama a função recursivamente
  if (querySnapshot.size >= BATCH_LIMIT) {
    await deleteCollection(collectionPath);
  }
};

// --- Lógica Principal ---

const clear = async () => {
  console.log('--- Iniciando o script de limpeza ---');
  
  // Deleta todos os usuários do Auth
  await deleteAllUsers();

  // Lista de coleções para deletar
  const collections = [
    'users',
    'institutions',
    'courses',
    'course_tutors',
    'enrollments',
    'lesson_progresses',
    'questionnaires',
    'questionnaire_submissions',
    'certificates',
    'user_institutions',
    'classes',
    'modules',
    'activities',
    'contents',
  ];

  // Deleta todas as coleções do Firestore
  for (const collectionName of collections) {
    await deleteCollection(collectionName);
  }

  // Nota: Subcoleções (como 'modules' dentro de 'courses') são deletadas
  // automaticamente quando o documento pai é deletado.

  console.log('\n--- Limpeza concluída com sucesso! ---');
};

clear();
