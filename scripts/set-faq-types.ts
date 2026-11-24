import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';
import { FAQType, FAQ_TYPES } from '@/_core/modules/faq/core/entities/FAQType';

/**
 * Define o tipo (público-alvo) das FAQs que ainda não têm tipo.
 *
 * Uso:
 *   yarn db:set-faq-types            -> SIMULAÇÃO: só mostra o que seria alterado
 *   yarn db:set-faq-types --apply    -> grava no Firestore
 *
 * Preencha FAQ_TYPE_BY_ID com { id_da_faq: FAQType.X } após revisar cada FAQ
 * (use `yarn db:list-faqs` para ver id, título e resposta de todas).
 * FAQs sem tipo e fora deste mapa continuam sendo tratadas como GENERAL (todos).
 */
const FAQ_TYPE_BY_ID: Record<string, FAQType> = {
  // 'faq_xxxxxxxxxx': FAQType.STUDENT,
};

initializeFirebaseAdmin();
const db = getAdminFirestore();

async function run() {
  const apply = process.argv.includes('--apply');

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Modo: ${apply ? '✍️  GRAVANDO no Firestore' : '🔍 SIMULAÇÃO (nada será gravado)'}`);
  console.log('══════════════════════════════════════════════════════\n');

  const invalid = Object.entries(FAQ_TYPE_BY_ID).filter(([, t]) => !FAQ_TYPES.includes(t));
  if (invalid.length > 0) {
    throw new Error(`Tipos inválidos no mapa: ${invalid.map(([id]) => id).join(', ')}`);
  }

  const snap = await db.collection('faqs').get();
  const batch = db.batch();
  let toUpdate = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const target = FAQ_TYPE_BY_ID[doc.id];

    if (data.type) {
      console.log(`  = ${doc.id} já tem tipo ${data.type} — "${data.title}"`);
      continue;
    }
    if (!target) {
      console.log(`  ? ${doc.id} SEM TIPO e fora do mapa (fica como GENERAL) — "${data.title}"`);
      continue;
    }

    console.log(`  → ${doc.id} recebe ${target} — "${data.title}"`);
    batch.update(doc.ref, { type: target });
    toUpdate++;
  }

  const unknownIds = Object.keys(FAQ_TYPE_BY_ID).filter(id => !snap.docs.some(d => d.id === id));
  unknownIds.forEach(id => console.log(`  ⚠️  ${id} está no mapa mas não existe no banco`));

  console.log(`\n  ${toUpdate} FAQ(s) a atualizar.`);

  if (apply && toUpdate > 0) {
    await batch.commit();
    console.log('  ✅ Gravado.');
  } else if (!apply) {
    console.log('  Rode com --apply para gravar.');
  }
}

run().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
