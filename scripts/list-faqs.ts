import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import * as fs from 'fs';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

/**
 * SOMENTE LEITURA: lista todas as FAQs (id, instituição, tipo, título e resposta em texto puro).
 * Uso: yarn db:list-faqs [arquivo-de-saida.json]
 */
initializeFirebaseAdmin();
const db = getAdminFirestore();

const stripHtml = (html: string) =>
  (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function run() {
  const [faqsSnap, institutionsSnap] = await Promise.all([
    db.collection('faqs').get(),
    db.collection('institutions').get(),
  ]);

  const institutionNames = new Map(institutionsSnap.docs.map(d => [d.id, (d.data().name as string) ?? d.id]));

  const faqs = faqsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      institution: institutionNames.get(data.institutionId) ?? data.institutionId,
      type: data.type ?? null,
      title: data.title,
      content: stripHtml(data.content),
    };
  });

  console.log(`Total de FAQs: ${faqs.length}`);
  console.log(`Sem tipo: ${faqs.filter(f => !f.type).length}`);

  const output = process.argv[2];
  if (output) {
    fs.writeFileSync(output, JSON.stringify(faqs, null, 2), 'utf-8');
    console.log(`Salvo em ${output}`);
  } else {
    console.log(JSON.stringify(faqs, null, 2));
  }
}

run().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
