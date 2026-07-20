import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

initializeFirebaseAdmin();
const db = getAdminFirestore();

/**
 * Diagnóstico READ-ONLY do fluxo do relatório "Acompanhamento Individual do Aluno"
 * Simula cada etapa/guard do GenerateIndividualStudentReportUseCase:
 *   1. classes da instituição (courseId x trailId)
 *   2. enrollments da turma → users (alunos)
 *   3. lesson_progresses do aluno (janela de 30 dias!)
 *   4. questionnaire_submissions do aluno
 *   5. estrutura do course (modules/lessons embutidos?)
 */
async function run() {
  console.log('\n════════ DIAGNÓSTICO: Relatório Individual (READ-ONLY) ════════\n');

  const instSnap = await db.collection('institutions').get();
  console.log(`Instituições: ${instSnap.size}`);

  for (const instDoc of instSnap.docs) {
    const instId = instDoc.id;
    const instName = instDoc.data().name;
    console.log(`\n─── Instituição: ${instName} (${instId}) ───`);

    const classesSnap = await db.collection('classes').where('institutionId', '==', instId).get();
    const classes = classesSnap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as Array<{
      id: string; name: string; courseId: string | null; trailId: string | null; enrollmentIds: string[];
    }>;

    const withCourse = classes.filter(c => c.courseId);
    const withTrail = classes.filter(c => c.trailId);
    console.log(`  Turmas: ${classes.length} (com courseId: ${withCourse.length} | com trailId: ${withTrail.length})`);

    if (withTrail.length > 0) {
      console.log(`  ⚠️  Turmas SÓ com trilha (report lança "Class not found or not associated with a course"):`);
      withTrail.forEach(c => console.log(`     - ${c.name} (${c.id})`));
    }

    // Analisar até 3 turmas com curso
    for (const cls of withCourse.slice(0, 3)) {
      console.log(`\n  ▸ Turma "${cls.name}" (${cls.id}) — courseId: ${cls.courseId}`);
      const enrollmentIds = cls.enrollmentIds || [];
      console.log(`    enrollmentIds na turma: ${enrollmentIds.length}`);

      if (enrollmentIds.length === 0) {
        console.log('    ⚠️  Turma sem matrículas → dropdown de alunos vazio');
        continue;
      }

      // Curso: estrutura de modules/lessons (usada p/ progresso e totalAssessments)
      const courseDoc = await db.collection('courses').doc(cls.courseId as string).get();
      if (!courseDoc.exists) {
        console.log(`    ❌ Curso ${cls.courseId} NÃO existe`);
      } else {
        const modules = (courseDoc.data()?.modules as unknown[]) || [];
        console.log(`    Curso OK — campo "modules" embutido: ${Array.isArray(modules) ? modules.length : 'AUSENTE'}`);
      }

      // Comparar enrollmentIds da turma com enrollments reais do curso
      const courseEnrollmentsSnap = await db.collection('enrollments')
        .where('courseId', '==', cls.courseId)
        .where('institutionId', '==', instId)
        .get();
      const realEnrollmentIds = courseEnrollmentsSnap.docs.map(d => d.id);
      const staleIds = enrollmentIds.filter(id => !realEnrollmentIds.includes(id));
      const missingFromClass = realEnrollmentIds.filter(id => !enrollmentIds.includes(id));
      console.log(`    enrollments REAIS do curso na instituição: ${realEnrollmentIds.length}`);
      if (staleIds.length > 0) {
        console.log(`    ❌ IDs órfãos na turma (enrollment não existe): ${staleIds.join(', ')}`);
      }
      if (missingFromClass.length > 0) {
        console.log(`    ⚠️  enrollments do curso FORA da turma: ${missingFromClass.length}`);
        for (const enrId of missingFromClass.slice(0, 5)) {
          const enrData = courseEnrollmentsSnap.docs.find(d => d.id === enrId)?.data();
          const userDoc = await db.collection('users').doc(enrData?.userId).get();
          console.log(`       - ${enrId} → user: ${enrData?.userId} (${userDoc.exists ? userDoc.data()?.name : 'USER NÃO EXISTE'}) status: ${enrData?.status}`);
        }
      }

      // Resolver enrollments → users
      let enrollmentsFound = 0;
      let usersFound = 0;
      const studentIds: string[] = [];
      for (const enrId of enrollmentIds.slice(0, 10)) {
        const enrDoc = await db.collection('enrollments').doc(enrId).get();
        if (!enrDoc.exists) continue;
        enrollmentsFound++;
        const userId = enrDoc.data()?.userId as string;
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          usersFound++;
          studentIds.push(userId);
        }
      }
      console.log(`    enrollments encontrados: ${enrollmentsFound}/${Math.min(enrollmentIds.length, 10)} | users: ${usersFound}`);

      // Dados do primeiro aluno
      const studentId = studentIds[0];
      if (!studentId) {
        console.log('    ⚠️  Nenhum aluno resolvido → dropdown vazio');
        continue;
      }

      const progressSnap = await db.collection('lesson_progresses')
        .where('userId', '==', studentId)
        .where('institutionId', '==', instId)
        .get();

      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      let inWindow = 0;
      let newest: Date | null = null;
      progressSnap.docs.forEach(d => {
        const raw = d.data().lastAccessedAt;
        const date: Date = raw?.toDate ? raw.toDate() : new Date(raw);
        if (!newest || date > newest) newest = date;
        if (now - date.getTime() <= THIRTY_DAYS) inWindow++;
      });

      console.log(`    Aluno amostra: ${studentId}`);
      console.log(`      lesson_progresses (total): ${progressSnap.size}`);
      console.log(`      lesson_progresses (últimos 30 dias — janela do report): ${inWindow}`);
      if (newest) console.log(`      último acesso registrado: ${(newest as Date).toLocaleString('pt-BR')}`);

      const subsSnap = await db.collection('questionnaire_submissions')
        .where('userId', '==', studentId)
        .get();
      const subsInst = subsSnap.docs.filter(d => d.data().institutionId === instId);
      console.log(`      questionnaire_submissions: ${subsSnap.size} (da instituição: ${subsInst.length})`);
    }
  }

  console.log('\n════════ FIM DO DIAGNÓSTICO ════════\n');
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro no diagnóstico:', err);
    process.exit(1);
  });
