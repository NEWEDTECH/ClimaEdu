import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'reflect-metadata';
import { initializeFirebaseAdmin, getAdminAuth, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';
import { faker } from '@faker-js/faker';
import { User, UserRole } from '@/_core/modules/user/core/entities/User';
import { Email } from '@/_core/modules/user/core/entities/Email';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { Enrollment } from '@/_core/modules/enrollment/core/entities/Enrollment';
import { EnrollmentStatus } from '@/_core/modules/enrollment/core/entities/EnrollmentStatus';
import { Certificate } from '@/_core/modules/certificate/core/entities/Certificate';
import { UserInstitution } from '@/_core/modules/institution/core/entities/UserInstitution';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Question } from '@/_core/modules/content/core/entities/Question';
import { QuestionSubmission } from '@/_core/modules/content/core/entities/QuestionSubmission';
import { QuestionnaireSubmission } from '@/_core/modules/content';

// --- Configuração ---
const NUM_LOCAL_ADMINS = 1;
const NUM_TUTORS = 5;
const NUM_STUDENTS = 20;
const NUM_COURSES = 10;
const INSTITUTION_NAME = 'ClimaEdu Tech';
const BATCH_LIMIT = 499;

// --- Conexão com Firebase ---
initializeFirebaseAdmin();
const auth = getAdminAuth();
const firestore = getAdminFirestore();

// --- Funções Auxiliares ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Funções de Geração de Dados ---

const createInstitution = async () => {
  console.log('Criando instituição...');
  const institutionId = `inst_${faker.string.uuid()}`;
  const institutionRef = firestore.collection('institutions').doc(institutionId);
  await institutionRef.set({
    id: institutionId,
    name: INSTITUTION_NAME,
    domain: faker.internet.domainName().toLowerCase(),
    createdAt: new Date(),
  });
  console.log(`Instituição "${INSTITUTION_NAME}" criada com ID: ${institutionId}`);
  return institutionId;
};

const createUsers = async (institutionId: string, role: UserRole, count: number): Promise<User[]> => {
  console.log(`Criando ${count} usuários com a role ${role}...`);
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const emailString = faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] });
    const password = 'password123';
    try {
      const userRecord = await auth.createUser({ email: emailString, password, displayName: name });
      const user = User.create({ id: userRecord.uid, name, email: Email.create(emailString), role });
      const userPlain: { [key: string]: unknown } = {
        id: user.id, name: user.name, email: {value: user.email.value}, role: user.role,
        createdAt: user.createdAt, updatedAt: user.updatedAt, currentInstitutionId: institutionId,
      };
      if (user.profile) userPlain.profile = user.profile;
      await firestore.collection('users').doc(user.id).set(userPlain);

      if (role !== UserRole.STUDENT) {
        const userInstitution = UserInstitution.create({
          id: `user-inst_${faker.string.uuid()}`, userId: user.id, institutionId, userRole: role,
        });
        const userInstPlain = {
          id: userInstitution.id, userId: userInstitution.userId, institutionId: userInstitution.institutionId,
          userRole: userInstitution.userRole, createdAt: userInstitution.createdAt, updatedAt: userInstitution.updatedAt,
        };
        await firestore.collection('user_institutions').doc(userInstPlain.id).set(userInstPlain);
      }
      users.push(user);
      console.log(`- Usuário criado: ${name} (${emailString})`);
    } catch (error) {
      console.error(`Erro ao criar usuário ${emailString}:`, error);
    }
  }
  return users;
};

const createCourses = async (institutionId: string, tutors: User[]): Promise<Course[]> => {
  console.log(`Criando ${NUM_COURSES} cursos...`);
  const courses: Course[] = [];
  for (let i = 0; i < NUM_COURSES; i++) {
    const courseId = `crs_${faker.string.uuid()}`;
    const course = Course.create({
      id: courseId, institutionId, title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(), coverImageUrl: faker.image.url(),
    });
    const coursePlain = {
      id: course.id, institutionId: course.institutionId, title: course.title,
      description: course.description, coverImageUrl: course.coverImageUrl,
      modules: [], createdAt: course.createdAt, updatedAt: course.updatedAt,
    };
    await firestore.collection('courses').doc(course.id).set(coursePlain);
    const tutor = tutors[i % tutors.length];
    await firestore.collection('course_tutors').add({ courseId: course.id, tutorId: tutor.id, institutionId });
    courses.push(course);
    console.log(`- Curso criado: "${course.title}" (Tutor: ${tutor.name})`);
  }
  return courses;
};

const createModulesAndLessons = async (courses: Course[]) => {
  console.log('Criando módulos e lições com questionários...');
  let batch = firestore.batch();
  let operationCount = 0;

  for (const course of courses) {
    const numModules = randomInt(3, 5);
    const courseModules = [];
    for (let i = 0; i < numModules; i++) {
      const moduleId = `mod_${faker.string.uuid()}`;
      const courseModule = Module.create({ id: moduleId, courseId: course.id, title: faker.lorem.sentence(3), order: i });
      const numLessons = randomInt(5, 8);
      const lessons = [];
      for (let j = 0; j < numLessons; j++) {
        const lessonId = `les_${faker.string.uuid()}`;
        const lesson = Lesson.create({ id: lessonId, moduleId: courseModule.id, title: faker.lorem.sentence(5), order: j });
        lessons.push({ id: lesson.id, title: lesson.title, order: lesson.order });

        for (let k = 0; k < 5; k++) {
          const questionnaireId = `qt_${faker.string.uuid()}`;
          const questions = Array.from({ length: 5 }, () => {
            const questionId = `q_${faker.string.uuid()}`;
            return Question.create({
              id: questionId, questionText: faker.lorem.sentence() + '?',
              options: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
              correctAnswerIndex: randomInt(0, 3),
            });
          });
          const questionnaire = Questionnaire.create({ id: questionnaireId, lessonId, title: `Questionário ${k + 1}`, questions });
          const questionnairePlain = {
            id: questionnaire.id, lessonId: questionnaire.lessonId, title: questionnaire.title,
            maxAttempts: questionnaire.maxAttempts, passingScore: questionnaire.passingScore,
            questions: questionnaire.questions.map((q: Question) => ({
              id: q.id, questionText: q.questionText, options: q.options, correctAnswerIndex: q.correctAnswerIndex,
            })),
          };
          const questionnaireRef = firestore.collection('questionnaires').doc(questionnaire.id);
          batch.set(questionnaireRef, questionnairePlain);
          operationCount++;
        }
      }
      const moduleRef = firestore.collection('courses').doc(course.id).collection('modules').doc(courseModule.id);
      batch.set(moduleRef, { id: courseModule.id, title: courseModule.title, order: courseModule.order, lessons });
      operationCount++;
      courseModules.push({ id: courseModule.id, title: courseModule.title, order: courseModule.order });
    }
    const courseRef = firestore.collection('courses').doc(course.id);
    batch.update(courseRef, { modules: courseModules });
    operationCount++;
    console.log(`- ${numModules} módulos e suas lições/questionários criados para o curso "${course.title}"`);

    if (operationCount > BATCH_LIMIT - 100) {
      await batch.commit();
      batch = firestore.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
};

const enrollStudents = async (students: User[], courses: Course[], institutionId: string): Promise<Enrollment[]> => {
  console.log('Matriculando estudantes...');
  const enrollments: Enrollment[] = [];
  const batch = firestore.batch();
  for (const student of students) {
    const numEnrollments = randomInt(1, 5);
    const coursesToEnroll = faker.helpers.shuffle(courses).slice(0, numEnrollments);
    for (const course of coursesToEnroll) {
      const enrollment = Enrollment.create({ userId: student.id, courseId: course.id, institutionId });
      const enrollmentPlain: { [key: string]: unknown } = {
        id: enrollment.id, userId: enrollment.userId, courseId: enrollment.courseId,
        institutionId: enrollment.institutionId, status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      };
      if (enrollment.completedAt) enrollmentPlain.completedAt = enrollment.completedAt;
      const enrollmentRef = firestore.collection('enrollments').doc(enrollment.id);
      batch.set(enrollmentRef, enrollmentPlain);
      enrollments.push(enrollment);
    }
    console.log(`- Estudante "${student.name}" matriculado em ${numEnrollments} cursos.`);
  }
  await batch.commit();
  return enrollments;
};

const simulateProgress = async (enrollments: Enrollment[]) => {
  console.log('Simulando progresso e respostas de questionários...');
  let batch = firestore.batch();
  let operationCount = 0;

  for (const enrollment of enrollments) {
    const courseRef = firestore.collection('courses').doc(enrollment.courseId);
    const modulesSnap = await courseRef.collection('modules').get();
    if (modulesSnap.empty) continue;
    let totalLessonsCompleted = 0;
    const shouldCompleteCourse = Math.random() > 0.5;
    for (const moduleDoc of modulesSnap.docs) {
      const moduleData = moduleDoc.data();
      const lessons = moduleData.lessons || [];
      for (const lesson of lessons) {
        const shouldCompleteLesson = shouldCompleteCourse || Math.random() > 0.3;
        if (shouldCompleteLesson) {
          const progressRef = firestore.collection('lessonProgress').doc();
          batch.set(progressRef, {
            userId: enrollment.userId, lessonId: lesson.id, courseId: enrollment.courseId,
            moduleId: moduleDoc.id, institutionId: enrollment.institutionId, status: 'COMPLETED',
            completedAt: faker.date.past({ years: 1 }),
          });
          operationCount++;
          totalLessonsCompleted++;

          const questionnairesSnap = await firestore.collection('questionnaires').where('lessonId', '==', lesson.id).get();
          for (const qDoc of questionnairesSnap.docs) {
            const questionnaire = qDoc.data() as Questionnaire;
            const questions = questionnaire.questions.map((q: {id: string, correctAnswerIndex: number, options: unknown[]}) => {
              const isCorrect = Math.random() > 0.3;
              return QuestionSubmission.create({
                id: `qs_${faker.string.uuid()}`, questionId: q.id,
                selectedOptionIndex: isCorrect ? q.correctAnswerIndex : randomInt(0, q.options.length - 1),
                isCorrect,
              });
            });
            const submission = QuestionnaireSubmission.create({
              id: `sub_${faker.string.uuid()}`, questionnaireId: questionnaire.id, userId: enrollment.userId,
              institutionId: enrollment.institutionId, startedAt: faker.date.past({ years: 1 }),
              attempt: 1, questions,
            });
            const submissionPlain = {
              id: submission.id, questionnaireId: submission.questionnaireId, userId: submission.userId,
              institutionId: submission.institutionId, startedAt: submission.startedAt,
              completedAt: submission.completedAt, score: submission.score, passed: submission.passed,
              attempt: submission.attempt,
              questions: submission.questions.map((q: QuestionSubmission) => ({
                id: q.id, questionId: q.questionId, selectedOptionIndex: q.selectedOptionIndex, isCorrect: q.isCorrect,
              })),
            };
            const subRef = firestore.collection('questionnaireSubmissions').doc(submission.id);
            batch.set(subRef, submissionPlain);
            operationCount++;
          }
        }
      }
    }
    if (shouldCompleteCourse && totalLessonsCompleted > 0) {
      const enrollmentRef = firestore.collection('enrollments').doc(enrollment.id);
      batch.update(enrollmentRef, { status: EnrollmentStatus.COMPLETED, completedAt: new Date() });
      operationCount++;

      const certificate = Certificate.create({
        id: `cert_${faker.string.uuid()}`, userId: enrollment.userId, courseId: enrollment.courseId,
        institutionId: enrollment.institutionId, certificateUrl: faker.internet.url(),
      });
      const { ...certPlain } = certificate;
      const certRef = firestore.collection('certificates').doc(certificate.id);
      batch.set(certRef, { ...certPlain });
      operationCount++;
    }
    console.log(`- Progresso simulado para matrícula no curso ${enrollment.courseId}`);

    if (operationCount > BATCH_LIMIT) {
      await batch.commit();
      batch = firestore.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
};

// --- Lógica Principal ---

const seed = async () => {
  console.log('--- Iniciando o script de seeding ---');
  try {
    const institutionId = await createInstitution();
    const localAdmins = await createUsers(institutionId, UserRole.LOCAL_ADMIN, NUM_LOCAL_ADMINS);
    const tutors = await createUsers(institutionId, UserRole.TUTOR, NUM_TUTORS);
    const students = await createUsers(institutionId, UserRole.STUDENT, NUM_STUDENTS);
    const courses = await createCourses(institutionId, tutors);
    await createModulesAndLessons(courses);
    const enrollments = await enrollStudents(students, courses, institutionId);
    await simulateProgress(enrollments);

    console.log('\n--- Seeding concluído com sucesso! ---');
    console.log(`- 1 Instituição criada`);
    console.log(`- ${localAdmins.length} Administradores Locais criados`);
    console.log(`- ${tutors.length} Tutores criados`);
    console.log(`- ${students.length} Estudantes criados`);
    console.log(`- ${courses.length} Cursos criados`);
  } catch (error) {
    console.error('\n--- Ocorreu um erro durante o seeding ---', error);
  }
};

seed();
