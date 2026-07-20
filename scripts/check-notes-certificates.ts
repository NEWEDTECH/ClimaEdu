import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

const FILTER_FROM = new Date('2026-05-22T23:00:00');

initializeFirebaseAdmin();
const db = getAdminFirestore();

async function deleteInBatches(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const BATCH_LIMIT = 499;
  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    docs.slice(i, i + BATCH_LIMIT).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function checkAndDeleteCertificates() {
  console.log('\n─── Certificates ──────────────────────────────────────');
  const snap = await db.collection('certificates')
    .where('issuedAt', '>=', FILTER_FROM)
    .get();

  console.log(`  Total encontrado: ${snap.size}`);
  snap.docs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}`);
    console.log(`       userId=${d.userId}`);
    console.log(`       courseId=${d.courseId}`);
    console.log(`       institutionId=${d.institutionId}`);
    console.log(`       issuedAt=${d.issuedAt?.toDate?.()?.toLocaleString('pt-BR') ?? d.issuedAt}`);
    console.log(`       certificateNumber=${d.certificateNumber}`);
  });

  if (snap.size > 0) {
    await deleteInBatches(snap.docs);
    console.log(`  ✅ ${snap.size} documento(s) deletado(s)`);
  }
}

async function checkAndDeleteNotes() {
  console.log('\n─── Notes ─────────────────────────────────────────────');
  const snap = await db.collection('notes')
    .where('createdAt', '>=', FILTER_FROM)
    .get();

  console.log(`  Total encontrado: ${snap.size}`);
  snap.docs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`  [${i + 1}] id=${doc.id}`);
    console.log(`       userId=${d.userId}`);
    console.log(`       title=${d.title}`);
    console.log(`       createdAt=${d.createdAt?.toDate?.()?.toLocaleString('pt-BR') ?? d.createdAt}`);
  });

  if (snap.size > 0) {
    await deleteInBatches(snap.docs);
    console.log(`  ✅ ${snap.size} documento(s) deletado(s)`);
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Filtro : registros criados após ${FILTER_FROM.toLocaleString('pt-BR')}`);
  console.log('  Modo   : 🔍 SOMENTE LEITURA');
  console.log('══════════════════════════════════════════════════════');

  await checkAndDeleteCertificates();
  await checkAndDeleteNotes();

  console.log('\n══════════════════════════════════════════════════════\n');
}

run().catch(console.error);
