import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

const FILTER_FROM = new Date('2026-05-22T23:00:00');

initializeFirebaseAdmin();
const db = getAdminFirestore();

// Firestore `in` suporta até 30 valores por query
function chunks<T>(arr: T[], size = 30): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

async function queryByFieldIn(
  collection: string,
  field: string,
  values: string[]
): Promise<FirebaseFirestore.QueryDocumentSnapshot[]> {
  if (values.length === 0) return [];
  const allDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  for (const chunk of chunks(values)) {
    const snap = await db.collection(collection).where(field, 'in', chunk).get();
    allDocs.push(...snap.docs);
  }
  return allDocs;
}

async function deleteInBatches(
  label: string,
  docs: FirebaseFirestore.QueryDocumentSnapshot[]
) {
  if (docs.length === 0) return;
  const BATCH_LIMIT = 499;
  for (const chunk of chunks(docs, BATCH_LIMIT)) {
    const batch = db.batch();
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  console.log(`  🗑️  ${docs.length} documento(s) deletado(s) de [${label}]`);
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Filtro : criados após ${FILTER_FROM.toLocaleString('pt-BR')}`);
  console.log('  Modo   : 🔍 SOMENTE LEITURA');
  console.log('══════════════════════════════════════════════════════\n');

  // ── 1. Courses ──────────────────────────────────────────────────────────────
  console.log('─── Courses ───────────────────────────────────────────');
  const coursesSnap = await db.collection('courses')
    .where('createdAt', '>=', FILTER_FROM)
    .get();

  const courseIds = coursesSnap.docs.map(d => d.id);
  console.log(`  Total: ${coursesSnap.size}`);
  coursesSnap.docs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  title="${d.title}"  createdAt=${d.createdAt?.toDate?.()?.toLocaleString('pt-BR') ?? d.createdAt}`);
  });

  if (courseIds.length === 0) {
    console.log('\nNenhum curso encontrado. Encerrando.\n');
    return;
  }

  // ── 2. Modules (via courseId) ───────────────────────────────────────────────
  console.log('\n─── Modules ───────────────────────────────────────────');
  const moduleDocs = await queryByFieldIn('modules', 'courseId', courseIds);
  const moduleIds = moduleDocs.map(d => d.id);
  console.log(`  Total: ${moduleDocs.length}`);
  moduleDocs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  title="${d.title}"  courseId=${d.courseId}`);
  });

  // ── 3. Lessons (via moduleId) ───────────────────────────────────────────────
  console.log('\n─── Lessons ───────────────────────────────────────────');
  const lessonDocs = await queryByFieldIn('lessons', 'moduleId', moduleIds);
  const lessonIds = lessonDocs.map(d => d.id);
  console.log(`  Total: ${lessonDocs.length}`);
  lessonDocs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  title="${d.title}"  moduleId=${d.moduleId}`);
  });

  // ── 4. Enrollments (via courseId) ───────────────────────────────────────────
  console.log('\n─── Enrollments ───────────────────────────────────────');
  const enrollmentDocs = await queryByFieldIn('enrollments', 'courseId', courseIds);
  console.log(`  Total: ${enrollmentDocs.length}`);
  enrollmentDocs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  userId=${d.userId}  courseId=${d.courseId}  status=${d.status}`);
  });

  // ── 5. LessonProgresses (via lessonId) ─────────────────────────────────────
  console.log('\n─── LessonProgresses ──────────────────────────────────');
  const progressDocs = await queryByFieldIn('lesson_progresses', 'lessonId', lessonIds);
  console.log(`  Total: ${progressDocs.length}`);

  // ── 6. Activities (via lessonId) ────────────────────────────────────────────
  console.log('\n─── Activities ────────────────────────────────────────');
  const activityDocs = await queryByFieldIn('activities', 'lessonId', lessonIds);
  console.log(`  Total: ${activityDocs.length}`);
  activityDocs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  lessonId=${d.lessonId}`);
  });

  // ── 7. Contents (via lessonId) ──────────────────────────────────────────────
  console.log('\n─── Contents ──────────────────────────────────────────');
  const contentDocs = await queryByFieldIn('contents', 'lessonId', lessonIds);
  console.log(`  Total: ${contentDocs.length}`);
  contentDocs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  lessonId=${d.lessonId}  type=${d.type}`);
  });

  // ── 8. Questionnaires (via lessonId) ────────────────────────────────────────
  console.log('\n─── Questionnaires ────────────────────────────────────');
  const questionnaireDocs = await queryByFieldIn('questionnaires', 'lessonId', lessonIds);
  console.log(`  Total: ${questionnaireDocs.length}`);
  questionnaireDocs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}  lessonId=${d.lessonId}  title="${d.title}"`);
  });

  // ── Resumo ──────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Resumo:');
  console.log(`    courses:           ${coursesSnap.size}`);
  console.log(`    modules:           ${moduleDocs.length}`);
  console.log(`    lessons:           ${lessonDocs.length}`);
  console.log(`    enrollments:       ${enrollmentDocs.length}`);
  console.log(`    lesson_progresses: ${progressDocs.length}`);
  console.log(`    activities:        ${activityDocs.length}`);
  console.log(`    contents:          ${contentDocs.length}`);
  console.log(`    questionnaires:    ${questionnaireDocs.length}`);
  console.log('══════════════════════════════════════════════════════');

  // ── Deleção (filhos antes dos pais) ─────────────────────────────────────────
  console.log('\n  Deletando...');
  await deleteInBatches('lesson_progresses', progressDocs);
  await deleteInBatches('activities',        activityDocs);
  await deleteInBatches('contents',          contentDocs);
  await deleteInBatches('questionnaires',    questionnaireDocs);
  await deleteInBatches('lessons',           lessonDocs);
  await deleteInBatches('enrollments',       enrollmentDocs);
  await deleteInBatches('modules',           moduleDocs);
  await deleteInBatches('courses',           coursesSnap.docs);
  console.log('\n  ✅ Deleção concluída.');
  console.log('══════════════════════════════════════════════════════\n');
}

run().catch(console.error);
