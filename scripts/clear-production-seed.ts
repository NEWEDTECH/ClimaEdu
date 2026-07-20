import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminAuth, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

// ─── Configuração ────────────────────────────────────────────────────────────
// Hora local do sistema (ajuste se necessário para o horário exato do seed)
const FILTER_FROM = new Date('2026-05-22T23:00:00');
// ─────────────────────────────────────────────────────────────────────────────

initializeFirebaseAdmin();
const auth = getAdminAuth();
const db = getAdminFirestore();

// ─── Contagens esperadas pelo seed ───────────────────────────────────────────
const EXPECTED: Record<string, number | string> = {
  'institutions':             1,
  'auth (total users)':       23,  // 1 admin + 2 tutors + 20 students
  'users (LOCAL_ADMIN)':      1,
  'users (TUTOR)':            2,
  'users (STUDENT)':          20,
  'user_institutions':        23,  // todos os perfis
  'courses':                  3,
  'course_tutors':            3,   // 1 por curso
  'classes':                  6,   // 2 por curso × 3 cursos
  'trails':                   1,
  'faqs':                     5,
  'podcasts':                 4,
  'badges':                   4,
  'institution_achievements': 3,
  'nsscore_questions':        9,   // 3 por curso × 3 cursos
  'notes':                    40,  // 2 por aluno × 20 alunos
  'posts':                    6,
  'chat_rooms':               6,   // 1 por turma (6 turmas)
  'tutoring_sessions':        8,
  'notifications':            8,   // 1 por sessão de tutoria
  'enrollments':              '~30 (1–3 por aluno × 20 alunos)',
  'modules':                  '9–15 (3–5 por curso × 3 cursos)',
  'lessons':                  '135–600 (5–8 por módulo)',
  'contents':                 '2 por lesson',
  'activities':               '1 por lesson',
  'questionnaires':           '1 por lesson',
  'questionnaire_submissions':'variável (por progresso simulado)',
  'lesson_progresses':        'variável (por progresso simulado)',
  'certificates':             'variável (cursos concluídos)',
};

function expected(key: string): string {
  const val = EXPECTED[key];
  return val !== undefined ? `  (esperado: ${val})` : '';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function status(found: number, key: string): string {
  const exp = EXPECTED[key];
  if (typeof exp !== 'number') return '';
  return found === exp ? ' ✅' : ` ❌ (esperado ${exp})`;
}

async function countByDate(collection: string, dateField = 'createdAt'): Promise<number> {
  const snap = await db.collection(collection).where(dateField, '>=', FILTER_FROM).get();
  const key = collection;
  console.log(`  [${collection}]  ${snap.size} encontrado(s)${expected(key)}${status(snap.size, key)}`);
  // await deleteSnapshot(snap); // ← DELETE COMENTADO
  return snap.size;
}

async function countByIdPrefix(collection: string, prefix: string): Promise<number> {
  const snap = await db.collection(collection)
    .where('id', '>=', prefix)
    .where('id', '<', prefix + '')
    .get();
  const key = collection;
  console.log(`  [${collection}]  ${snap.size} encontrado(s)${expected(key)}${status(snap.size, key)}`);
  // await deleteSnapshot(snap); // ← DELETE COMENTADO
  return snap.size;
}

async function countByFieldValue(collection: string, field: string, value: string): Promise<number> {
  const snap = await db.collection(collection).where(field, '==', value).get();
  const key = collection;
  console.log(`  [${collection}]  ${snap.size} encontrado(s)${expected(key)}${status(snap.size, key)}`);
  // await deleteSnapshot(snap); // ← DELETE COMENTADO
  return snap.size;
}

// ─── Auth Users ───────────────────────────────────────────────────────────────

async function countAuthUsers(): Promise<number> {
  const found: { uid: string; email: string; role: string; createdAt: string }[] = [];
  let pageToken: string | undefined;

  do {
    const result = await auth.listUsers(1000, pageToken);
    result.users.forEach(u => {
      if (new Date(u.metadata.creationTime) >= FILTER_FROM) {
        found.push({
          uid: u.uid,
          email: u.email ?? '—',
          role: '(verificar no Firestore)',
          createdAt: u.metadata.creationTime,
        });
      }
    });
    pageToken = result.pageToken;
  } while (pageToken);

  const expTotal = EXPECTED['auth (total users)'];
  console.log(`  [auth]  ${found.length} usuário(s) encontrado(s)  (esperado: ${expTotal})${found.length === expTotal ? ' ✅' : ' ❌'}`);

  // ─── Detalhamento por role (lido do Firestore/users) ─────────────────────
  const uids = found.map(u => u.uid);
  if (uids.length > 0) {
    const usersSnap = await db.collection('users').where('createdAt', '>=', FILTER_FROM).get();
    const byRole: Record<string, number> = {};
    usersSnap.docs.forEach(doc => {
      const role = doc.data().role ?? 'desconhecido';
      byRole[role] = (byRole[role] ?? 0) + 1;
    });
    Object.entries(byRole).forEach(([role, count]) => {
      const key = `users (${role})`;
      console.log(`    ↳ ${role}: ${count}${expected(key)}${status(count, key)}`);
    });
  }

  // await deleteAuthUsers(found.map(u => u.uid)); // ← DELETE COMENTADO
  return found.length;
}

// ─── Lógica Principal ─────────────────────────────────────────────────────────

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Filtro : documentos criados após ${FILTER_FROM.toLocaleString('pt-BR')}`);
  console.log('  Modo   : 🔍 SOMENTE LEITURA — nenhum dado será deletado');
  console.log('══════════════════════════════════════════════════════\n');

  let total = 0;

  // ── 1. Institutions ────────────────────────────────────────────────────────
  console.log('─── Instituição ───────────────────────────────────────');
  const instSnap = await db.collection('institutions').where('createdAt', '>=', FILTER_FROM).get();
  const institutionIds = instSnap.docs.map(d => d.id);
  console.log(`  [institutions]  ${instSnap.size} encontrada(s)${expected('institutions')}${status(instSnap.size, 'institutions')}`);
  if (institutionIds.length) console.log(`    ↳ IDs: ${institutionIds.join(', ')}`);
  // await deleteInstitutions(instSnap); // ← DELETE COMENTADO
  total += instSnap.size;

  if (institutionIds.length === 0) {
    console.log('\nNenhuma instituição encontrada no período. Encerrando.\n');
    return;
  }

  // ── 2. Auth Users ──────────────────────────────────────────────────────────
  console.log('\n─── Usuários (Auth + Firestore) ───────────────────────');
  total += await countAuthUsers();

  // ── 3. Coleções com campo de data ──────────────────────────────────────────
  console.log('\n─── Coleções com createdAt ────────────────────────────');
  total += await countByDate('user_institutions');
  total += await countByDate('courses');
  total += await countByDate('classes');
  total += await countByDate('enrollments', 'enrolledAt');
  total += await countByDate('lesson_progresses', 'startedAt');
  total += await countByDate('trails');
  total += await countByDate('faqs');
  total += await countByDate('podcasts');
  total += await countByDate('institution_achievements');
  total += await countByDate('nsscore_questions');
  total += await countByDate('notes');
  total += await countByDate('posts');
  total += await countByDate('chat_rooms');
  total += await countByDate('tutoring_sessions');
  total += await countByDate('notifications');

  // ── 4. Coleções com prefixo de ID ──────────────────────────────────────────
  console.log('\n─── Coleções com prefixo de ID ────────────────────────');
  total += await countByIdPrefix('modules', 'mod_');
  total += await countByIdPrefix('lessons', 'les_');
  total += await countByIdPrefix('contents', 'cont_');
  total += await countByIdPrefix('activities', 'act_');
  total += await countByIdPrefix('questionnaires', 'qt_');
  total += await countByIdPrefix('questionnaire_submissions', 'sub_');
  total += await countByIdPrefix('certificates', 'cert_');
  total += await countByIdPrefix('badges', 'badge_');

  // ── 5. cascade por institutionId (course_tutors sem data e sem prefixo) ────
  console.log('\n─── Cascade por institutionId ─────────────────────────');
  for (const instId of institutionIds) {
    total += await countByFieldValue('course_tutors', 'institutionId', instId);
  }

  // ── Resumo ─────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Total encontrado: ${total} registro(s)`);
  console.log('\n  ✅ = contagem bate com o esperado');
  console.log('  ❌ = divergência — verifique antes de deletar');
  console.log('\n  Quando tudo estiver ✅, habilite a deleção:');
  console.log('  1. Descomente as linhas "// await delete..." no script');
  console.log('  2. Rode novamente com FORCE_PRODUCTION_FIREBASE=true');
  console.log('══════════════════════════════════════════════════════\n');
}

run().catch(console.error);
