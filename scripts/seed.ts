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
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { Class } from '@/_core/modules/enrollment/core/entities/Class';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { LessonProgress } from '@/_core/modules/content/core/entities/LessonProgress';

// --- Configuração ---
const NUM_LOCAL_ADMINS = 1;
const NUM_TUTORS = 2;
const NUM_STUDENTS = 20;
const NUM_COURSES = 3;
const CLASSES_PER_COURSE = 2;
const INSTITUTION_NAME = 'EAD Tech';
const BATCH_LIMIT = 499;

// --- Nomes das Coleções ---
const C = {
  INSTITUTIONS: 'institutions',
  USERS: 'users',
  USER_INSTITUTIONS: 'user_institutions',
  COURSES: 'courses',
  COURSE_TUTORS: 'course_tutors',
  MODULES: 'modules',
  LESSONS: 'lessons',
  CONTENTS: 'contents',
  QUESTIONNAIRES: 'questionnaires',
  ENROLLMENTS: 'enrollments',
  LESSON_PROGRESS: 'lesson_progresses',
  QUESTIONNAIRE_SUBMISSIONS: 'questionnaire_submissions',
  CERTIFICATES: 'certificates',
  CLASSES: 'classes',
  ACTIVITIES: 'activities',
};

// --- Vídeos de exemplo ---
const VIDEOS = [
  'https://vimeo.com/347119375',
  'https://vimeo.com/701057180',
  'https://vimeo.com/358064547',
  'https://vimeo.com/897818060',
  'https://youtu.be/JGafRfs9cA0',
  'https://youtu.be/BEcQjIh_V-c',
  'https://youtu.be/gOJ_XJI4rms',
]

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
  const institutionRef = firestore.collection(C.INSTITUTIONS).doc(institutionId);
  await institutionRef.set({
    id: institutionId, name: INSTITUTION_NAME,
    domain: faker.internet.domainName().toLowerCase(), createdAt: new Date(),
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
      await firestore.collection(C.USERS).doc(user.id).set(userPlain);

      if (role !== UserRole.STUDENT) {
        const userInstitution = UserInstitution.create({
          id: `user-inst_${faker.string.uuid()}`, userId: user.id, institutionId, userRole: role,
        });
        const userInstPlain = {
          id: userInstitution.id, userId: userInstitution.userId, institutionId: userInstitution.institutionId,
          userRole: userInstitution.userRole, createdAt: userInstitution.createdAt, updatedAt: userInstitution.updatedAt,
        };
        await firestore.collection(C.USER_INSTITUTIONS).doc(userInstPlain.id).set(userInstPlain);
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
    await firestore.collection(C.COURSES).doc(course.id).set(coursePlain);
    const tutor = tutors[i % tutors.length];
    await firestore.collection(C.COURSE_TUTORS).add({ courseId: course.id, userId: tutor.id, institutionId });
    courses.push(course);
    console.log(`- Curso criado: "${course.title}" (Tutor: ${tutor.name})`);
  }
  return courses;
};

const createClasses = async (courses: Course[], institutionId: string): Promise<Map<string, Class[]>> => {
  console.log('Criando classes para os cursos...');
  const courseClassesMap = new Map<string, Class[]>();
  const batch = firestore.batch();

  for (const course of courses) {
    const classes: Class[] = [];
    for (let i = 0; i < CLASSES_PER_COURSE; i++) {
      const classEntity = Class.create({
        institutionId,
        name: `${course.title} - Turma ${i + 1}`,
        courseId: course.id,
        enrollmentIds: [],
      });
      classes.push(classEntity);
      const classRef = firestore.collection(C.CLASSES).doc(classEntity.id);
      batch.set(classRef, {
        id: classEntity.id, institutionId: classEntity.institutionId, name: classEntity.name,
        courseId: classEntity.courseId, trailId: classEntity.trailId, enrollmentIds: classEntity.enrollmentIds,
        createdAt: classEntity.createdAt, updatedAt: classEntity.updatedAt,
      });
    }
    courseClassesMap.set(course.id, classes);
    console.log(`- ${CLASSES_PER_COURSE} classes criadas para o curso "${course.title}"`);
  }
  await batch.commit();
  return courseClassesMap;
};

const createModulesAndLessons = async (courses: Course[]) => {
  console.log('Criando módulos, lições, conteúdos e questionários...');
  let batch = firestore.batch();
  let operationCount = 0;

  for (const course of courses) {
    const numModules = randomInt(3, 5);
    for (let i = 0; i < numModules; i++) {
      const moduleId = `mod_${faker.string.uuid()}`;
      const courseModule = Module.create({ id: moduleId, courseId: course.id, title: faker.lorem.sentence(3), order: i });
      
      const moduleRef = firestore.collection(C.MODULES).doc(courseModule.id);
      batch.set(moduleRef, { 
        id: courseModule.id, 
        courseId: courseModule.courseId,
        title: courseModule.title, 
        order: courseModule.order 
      });
      operationCount++;

      const numLessons = randomInt(5, 8);
      for (let j = 0; j < numLessons; j++) {
        const lessonId = `les_${faker.string.uuid()}`;
        const lesson = Lesson.create({ id: lessonId, moduleId: courseModule.id, title: faker.lorem.sentence(5), order: j, description: faker.lorem.paragraphs(30), coverImageUrl: faker.image.url() });
        
        const contentVideo = Content.create({ id: `cont_${faker.string.uuid()}`, lessonId, type: ContentType.VIDEO, title: 'Vídeo Aula', url: VIDEOS[randomInt(0, VIDEOS.length - 1)] });
        const contentPdf = Content.create({ id: `cont_${faker.string.uuid()}`, lessonId, type: ContentType.PDF, title: 'Material de Apoio', url: faker.internet.url() });
        
        batch.set(firestore.collection(C.CONTENTS).doc(contentVideo.id), { ...contentVideo });
        batch.set(firestore.collection(C.CONTENTS).doc(contentPdf.id), { ...contentPdf });
        operationCount += 2;
        
        lesson.addContent(contentVideo);
        lesson.addContent(contentPdf);

        const activityId = `act_${faker.string.uuid()}`;
        const activity = Activity.create({
          id: activityId,
          lessonId: lesson.id,
          description: `Atividade para: ${lesson.title}`,
          instructions: faker.lorem.paragraphs(4),
          resourceUrl: faker.internet.url(),
        });
        lesson.attachActivity(activity);

        const activityRef = firestore.collection(C.ACTIVITIES).doc(activity.id);
        batch.set(activityRef, {
          id: activity.id,
          lessonId: activity.lessonId,
          description: activity.description,
          instructions: activity.instructions,
          resourceUrl: activity.resourceUrl
        });
        operationCount++;
        
        const lessonPlain: { [key: string]: unknown } = {
          id: lesson.id,
          moduleId: lesson.moduleId,
          title: lesson.title,
          description: lesson.description,
          coverImageUrl: lesson.coverImageUrl,
          order: lesson.order,
          contents: lesson.contents.map((c: Content) => ({ ...c })),
        };
        
        if (lesson.activity) {
          lessonPlain.activity = {
            id: lesson.activity.id,
            lessonId: lesson.activity.lessonId,
            description: lesson.activity.description,
            instructions: lesson.activity.instructions,
            resourceUrl: lesson.activity.resourceUrl
          };
        }

        if (lesson.questionnaire) {
          lessonPlain.questionnaire = {
            id: lesson.questionnaire.id,
            lessonId: lesson.questionnaire.lessonId,
            title: lesson.questionnaire.title,
            maxAttempts: lesson.questionnaire.maxAttempts,
            passingScore: lesson.questionnaire.passingScore,
            questions: lesson.questionnaire.questions.map(q => ({
              id: q.id,
              questionText: q.questionText,
              options: q.options,
              correctAnswerIndex: q.correctAnswerIndex
            }))
          };
        }
        
        const lessonRef = firestore.collection(C.LESSONS).doc(lesson.id);
        batch.set(lessonRef, lessonPlain);
        operationCount++;

        for (let k = 0; k < 2; k++) {
          const questionnaireId = `qt_${faker.string.uuid()}`;
          const questions = Array.from({ length: 5 }, () => Question.create({
            id: `q_${faker.string.uuid()}`, questionText: faker.lorem.sentence() + '?',
            options: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
            correctAnswerIndex: randomInt(0, 3),
          }));
          const questionnaire = Questionnaire.create({ id: questionnaireId, lessonId, title: `Questionário ${k + 1}`, questions });
          const questionnairePlain = {
            id: questionnaire.id, lessonId: questionnaire.lessonId, title: questionnaire.title,
            maxAttempts: questionnaire.maxAttempts, passingScore: questionnaire.passingScore,
            questions: questionnaire.questions.map((q: Question) => ({
              id: q.id, questionText: q.questionText, options: q.options, correctAnswerIndex: q.correctAnswerIndex,
            })),
          };
          batch.set(firestore.collection(C.QUESTIONNAIRES).doc(questionnaire.id), questionnairePlain);
          operationCount++;
        }
      }
    }
    console.log(`- ${numModules} módulos e suas lições criados para o curso "${course.title}"`);

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

const enrollStudents = async (students: User[], courses: Course[], institutionId: string, courseClassesMap: Map<string, Class[]>) => {
  console.log('Matriculando estudantes e associando a classes...');
  const enrollments: Enrollment[] = [];
  const batch = firestore.batch();
  let operationCount = 0;

  for (const student of students) {
    const numEnrollments = randomInt(1, Math.min(courses.length, 3));
    const coursesToEnroll = faker.helpers.shuffle(courses).slice(0, numEnrollments);
    for (const course of coursesToEnroll) {
      const enrollmentId = `enr_${faker.string.uuid()}`;
      const enrollment = Enrollment.create({ id: enrollmentId, userId: student.id, courseId: course.id, institutionId });
      const enrollmentPlain: { [key: string]: unknown } = {
        id: enrollment.id, userId: enrollment.userId, courseId: enrollment.courseId,
        institutionId: enrollment.institutionId, status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      };
      if (enrollment.completedAt) {
        enrollmentPlain.completedAt = enrollment.completedAt;
      }
      const enrollmentRef = firestore.collection(C.ENROLLMENTS).doc(enrollment.id);
      batch.set(enrollmentRef, enrollmentPlain);
      operationCount++;
      enrollments.push(enrollment);

      const classesForCourse = courseClassesMap.get(course.id);
      if (classesForCourse && classesForCourse.length > 0) {
        const randomClass = classesForCourse[randomInt(0, classesForCourse.length - 1)];
        randomClass.addEnrollment(enrollment.id);
        const classRef = firestore.collection(C.CLASSES).doc(randomClass.id);
        batch.update(classRef, { enrollmentIds: randomClass.enrollmentIds });
        operationCount++;
      }
    }
    console.log(`- Estudante "${student.name}" matriculado em ${numEnrollments} cursos.`);
  }
  if (operationCount > 0) await batch.commit();
  return enrollments;
};

const simulateProgress = async (enrollments: Enrollment[]) => {
  console.log('Simulando progresso...');
  let batch = firestore.batch();
  let operationCount = 0;

  for (const enrollment of enrollments) {
    const modulesQuery = firestore.collection(C.MODULES).where('courseId', '==', enrollment.courseId);
    const modulesSnap = await modulesQuery.get();
    if (modulesSnap.empty) continue;

    let totalLessonsCompleted = 0;
    const shouldCompleteCourse = Math.random() > 0.5;

    for (const moduleDoc of modulesSnap.docs) {
      const moduleData = moduleDoc.data();
      const lessonsQuery = firestore.collection(C.LESSONS).where('moduleId', '==', moduleData.id);
      const lessonsSnap = await lessonsQuery.get();
      if (lessonsSnap.empty) continue;

      for (const lessonDoc of lessonsSnap.docs) {
        const lesson = lessonDoc.data();
        const shouldCompleteLesson = shouldCompleteCourse || Math.random() > 0.3;
        if (shouldCompleteLesson) {
          const contentIds = lesson.contents?.map((c: { id: string }) => c.id) || [];
          if (contentIds.length === 0) {
            console.warn(`Lição ${lesson.id} sem conteúdo, pulando progresso.`);
            continue;
          }

          const lessonProgress = LessonProgress.create({
            userId: enrollment.userId, lessonId: lesson.id, institutionId: enrollment.institutionId,
            contentIds,
          });
          lessonProgress.forceComplete();
          
          const progressPlain = {
            id: lessonProgress.id,
            userId: lessonProgress.userId,
            lessonId: lessonProgress.lessonId,
            institutionId: lessonProgress.institutionId,
            status: lessonProgress.status,
            startedAt: lessonProgress.startedAt,
            completedAt: lessonProgress.completedAt,
            lastAccessedAt: lessonProgress.lastAccessedAt,
            updatedAt: lessonProgress.updatedAt,
            contentProgresses: lessonProgress.contentProgresses.map(cp => ({
              contentId: cp.contentId,
              status: cp.status,
              progressPercentage: cp.progressPercentage,
              startedAt: cp.startedAt,
              completedAt: cp.completedAt,
              timeSpent: cp.timeSpent,
              lastPosition: cp.lastPosition,
            })),
          };
          const progressRef = firestore.collection(C.LESSON_PROGRESS).doc(lessonProgress.id);
          batch.set(progressRef, progressPlain);
          operationCount++;
          totalLessonsCompleted++;

          const questionnairesSnap = await firestore.collection(C.QUESTIONNAIRES).where('lessonId', '==', lesson.id).get();
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
            const subRef = firestore.collection(C.QUESTIONNAIRES).doc(submission.id);
            batch.set(subRef, submissionPlain);
            operationCount++;
          }
        }
      }
    }
    if (shouldCompleteCourse && totalLessonsCompleted > 0) {
      const enrollmentRef = firestore.collection(C.ENROLLMENTS).doc(enrollment.id);
      batch.update(enrollmentRef, { status: EnrollmentStatus.COMPLETED, completedAt: new Date() });
      operationCount++;

      const certificate = Certificate.create({
        id: `cert_${faker.string.uuid()}`, userId: enrollment.userId, courseId: enrollment.courseId,
        institutionId: enrollment.institutionId, certificateUrl: faker.internet.url(),
      });
      const { ...certPlain } = certificate;
      const certRef = firestore.collection(C.CERTIFICATES).doc(certificate.id);
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
    const courseClassesMap = await createClasses(courses, institutionId);
    await createModulesAndLessons(courses);
    const enrollments = await enrollStudents(students, courses, institutionId, courseClassesMap);
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
