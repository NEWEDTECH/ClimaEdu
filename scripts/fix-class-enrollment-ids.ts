import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

initializeFirebaseAdmin();
const db = getAdminFirestore();

const APPLY = process.argv.includes('--apply');

/**
 * Reparo de dados: Class.enrollmentIds deve conter IDs de enrollment (enr_*),
 * mas o fluxo antigo do admin gravava o userId do estudante.
 *
 * Para cada turma:
 *   - ID que resolve para um enrollment existente → mantém
 *   - ID órfão que corresponde a um userId com enrollment no curso da turma → substitui pelo enrollment.id
 *   - ID órfão sem enrollment correspondente → reporta (mantido; remova manualmente se necessário)
 *
 * Uso:
 *   dry-run (padrão): apenas mostra o que seria alterado
 *   --apply         : grava as correções
 */
async function run() {
  console.log(`\n════════ REPARO Class.enrollmentIds — modo: ${APPLY ? '✍️  APPLY' : '🔍 DRY-RUN'} ════════\n`);

  const classesSnap = await db.collection('classes').get();

  for (const classDoc of classesSnap.docs) {
    const cls = classDoc.data() as {
      name: string;
      institutionId: string;
      courseId: string | null;
      enrollmentIds: string[];
    };
    const enrollmentIds = cls.enrollmentIds || [];
    if (enrollmentIds.length === 0) continue;

    console.log(`▸ Turma "${cls.name}" (${classDoc.id}) — ${enrollmentIds.length} id(s)`);

    const fixedIds: string[] = [];
    let changed = false;

    for (const id of enrollmentIds) {
      const enrollmentDoc = await db.collection('enrollments').doc(id).get();

      if (enrollmentDoc.exists) {
        fixedIds.push(id);
        console.log(`    ✓ ${id} — enrollment válido`);
        continue;
      }

      // Órfão: tentar resolver como userId com enrollment no curso da turma
      if (!cls.courseId) {
        fixedIds.push(id);
        console.log(`    ⚠️  ${id} — órfão e turma sem courseId, mantido`);
        continue;
      }

      const enrollmentByUserSnap = await db.collection('enrollments')
        .where('userId', '==', id)
        .where('courseId', '==', cls.courseId)
        .limit(1)
        .get();

      if (!enrollmentByUserSnap.empty) {
        const resolvedId = enrollmentByUserSnap.docs[0].id;
        fixedIds.push(resolvedId);
        changed = true;
        console.log(`    🔧 ${id} (userId) → ${resolvedId} (enrollment)`);
      } else {
        fixedIds.push(id);
        console.log(`    ⚠️  ${id} — órfão sem enrollment no curso ${cls.courseId}, mantido (verificar manualmente)`);
      }
    }

    if (changed) {
      if (APPLY) {
        await classDoc.ref.update({ enrollmentIds: fixedIds, updatedAt: new Date() });
        console.log(`    ✍️  Turma atualizada: [${fixedIds.join(', ')}]`);
      } else {
        console.log(`    → DRY-RUN: enrollmentIds ficaria: [${fixedIds.join(', ')}]`);
      }
    } else {
      console.log('    Nada a corrigir.');
    }
  }

  console.log(`\n════════ FIM ${APPLY ? '(alterações aplicadas)' : '(nenhuma alteração feita — use --apply para gravar)'} ════════\n`);
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro no reparo:', err);
    process.exit(1);
  });
