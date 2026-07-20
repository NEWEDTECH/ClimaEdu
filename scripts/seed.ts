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
import { Trail } from '@/_core/modules/content/core/entities/Trail';
import { InstitutionAchievement } from '@/_core/modules/achievement/core/entities/InstitutionAchievement';
import { Badge } from '@/_core/modules/badge/core/entities/Badge';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';
import { Post } from '@/_core/modules/social/core/entities/Post';
import { ChatRoom } from '@/_core/modules/chat/core/entities/ChatRoom';
import { Podcast } from '@/_core/modules/podcast/core/entities/Podcast';
import { PodcastMediaType } from '@/_core/modules/podcast/core/entities/PodcastMediaType';
import { TutoringSession, SessionPriority } from '@/_core/modules/tutoring/core/entities/TutoringSession';
import { Note } from '@/_core/modules/notes/core/entities/Note';
import { Notification } from '@/_core/modules/notification/core/entities/Notification';
import { FAQ } from '@/_core/modules/faq/core/entities/FAQ';
import { NSScoreQuestion } from '@/_core/modules/nsscore/core/entities/NSScoreQuestion';

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
  TRAILS: 'trails',
  FAQS: 'faqs',
  PODCASTS: 'podcasts',
  NOTES: 'notes',
  NOTIFICATIONS: 'notifications',
  NSSCORE_QUESTIONS: 'nsscore_questions',
  BADGES: 'badges',
  INSTITUTION_ACHIEVEMENTS: 'institution_achievements',
  TUTORING_SESSIONS: 'tutoring_sessions',
  POSTS: 'posts',
  CHAT_ROOMS: 'chat_rooms',
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
];

// --- Conexão com Firebase ---
initializeFirebaseAdmin();
const auth = getAdminAuth();
const firestore = getAdminFirestore();

// --- Funções Auxiliares ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const futureDateDays = (minDays: number, maxDays: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + randomInt(minDays, maxDays));
  return date;
};

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
        id: user.id, name: user.name, email: { value: user.email.value }, role: user.role,
        createdAt: user.createdAt, updatedAt: user.updatedAt, currentInstitutionId: institutionId,
      };
      if (user.profile) userPlain.profile = user.profile;
      await firestore.collection(C.USERS).doc(user.id).set(userPlain);

      // Todos os perfis (inclusive STUDENT) recebem UserInstitution
      const userInstitution = UserInstitution.create({
        id: `user-inst_${faker.string.uuid()}`, userId: user.id, institutionId, userRole: role,
      });
      await firestore.collection(C.USER_INSTITUTIONS).doc(userInstitution.id).set({
        id: userInstitution.id, userId: userInstitution.userId, institutionId: userInstitution.institutionId,
        userRole: userInstitution.userRole, createdAt: userInstitution.createdAt, updatedAt: userInstitution.updatedAt,
      });

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
    await firestore.collection(C.COURSES).doc(course.id).set({
      id: course.id, institutionId: course.institutionId, title: course.title,
      description: course.description, coverImageUrl: course.coverImageUrl,
      isActive: course.isActive, createdAt: course.createdAt, updatedAt: course.updatedAt,
    });
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
      batch.set(firestore.collection(C.CLASSES).doc(classEntity.id), {
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
  console.log('Criando módulos, unidades, conteúdos e questionários...');
  let batch = firestore.batch();
  let operationCount = 0;

  for (const course of courses) {
    const numModules = randomInt(3, 5);
    for (let i = 0; i < numModules; i++) {
      const moduleId = `mod_${faker.string.uuid()}`;
      const courseModule = Module.create({ id: moduleId, courseId: course.id, title: faker.lorem.sentence(3), order: i });

      batch.set(firestore.collection(C.MODULES).doc(courseModule.id), {
        id: courseModule.id, courseId: courseModule.courseId,
        title: courseModule.title, order: courseModule.order,
      });
      operationCount++;

      const numLessons = randomInt(5, 8);
      for (let j = 0; j < numLessons; j++) {
        const lessonId = `les_${faker.string.uuid()}`;
        const lesson = Lesson.create({
          id: lessonId, moduleId: courseModule.id, title: faker.lorem.sentence(5),
          order: j, description: faker.lorem.paragraphs(30), coverImageUrl: faker.image.url(),
        });

        const contentVideo = Content.create({ id: `cont_${faker.string.uuid()}`, lessonId, type: ContentType.VIDEO, title: 'Vídeo Aula', url: VIDEOS[randomInt(0, VIDEOS.length - 1)] });
        const contentPdf = Content.create({ id: `cont_${faker.string.uuid()}`, lessonId, type: ContentType.PDF, title: 'Material de Apoio', url: faker.internet.url() });

        batch.set(firestore.collection(C.CONTENTS).doc(contentVideo.id), { ...contentVideo });
        batch.set(firestore.collection(C.CONTENTS).doc(contentPdf.id), { ...contentPdf });
        operationCount += 2;

        lesson.addContent(contentVideo);
        lesson.addContent(contentPdf);

        const activity = Activity.create({
          id: `act_${faker.string.uuid()}`, lessonId: lesson.id,
          description: `Atividade para: ${lesson.title}`,
          instructions: faker.lorem.paragraphs(4), resourceUrl: faker.internet.url(),
        });
        lesson.attachActivity(activity);
        batch.set(firestore.collection(C.ACTIVITIES).doc(activity.id), {
          id: activity.id, lessonId: activity.lessonId, description: activity.description,
          instructions: activity.instructions, resourceUrl: activity.resourceUrl,
        });
        operationCount++;

        // Questionnaire criado ANTES do lessonPlain para poder ser embutido na lesson
        const questions = Array.from({ length: 5 }, () => Question.create({
          id: `q_${faker.string.uuid()}`, questionText: faker.lorem.sentence() + '?',
          options: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
          correctAnswerIndex: randomInt(0, 3),
        }));
        const questionnaire = Questionnaire.create({
          id: `qt_${faker.string.uuid()}`, lessonId, title: 'Questionário da Unidade', questions,
        });
        lesson.attachQuestionnaire(questionnaire);

        batch.set(firestore.collection(C.QUESTIONNAIRES).doc(questionnaire.id), {
          id: questionnaire.id, lessonId: questionnaire.lessonId, title: questionnaire.title,
          maxAttempts: questionnaire.maxAttempts, passingScore: questionnaire.passingScore,
          questions: questionnaire.questions.map((q: Question) => ({
            id: q.id, questionText: q.questionText, options: q.options, correctAnswerIndex: q.correctAnswerIndex,
          })),
        });
        operationCount++;

        const lessonPlain: { [key: string]: unknown } = {
          id: lesson.id, moduleId: lesson.moduleId, title: lesson.title,
          description: lesson.description, coverImageUrl: lesson.coverImageUrl,
          order: lesson.order, contentSectionsOrder: lesson.contentSectionsOrder,
          contents: lesson.contents.map((c: Content) => ({ ...c })),
        };

        if (lesson.activity) {
          lessonPlain.activity = {
            id: lesson.activity.id, lessonId: lesson.activity.lessonId,
            description: lesson.activity.description, instructions: lesson.activity.instructions,
            resourceUrl: lesson.activity.resourceUrl,
          };
        }

        if (lesson.questionnaire) {
          lessonPlain.questionnaire = {
            id: lesson.questionnaire.id, lessonId: lesson.questionnaire.lessonId,
            title: lesson.questionnaire.title, maxAttempts: lesson.questionnaire.maxAttempts,
            passingScore: lesson.questionnaire.passingScore,
            questions: lesson.questionnaire.questions.map(q => ({
              id: q.id, questionText: q.questionText, options: q.options, correctAnswerIndex: q.correctAnswerIndex,
            })),
          };
        }

        batch.set(firestore.collection(C.LESSONS).doc(lesson.id), lessonPlain);
        operationCount++;
      }
    }
    console.log(`- ${numModules} módulos e suas unidades criados para o curso "${course.title}"`);

    if (operationCount > BATCH_LIMIT - 100) {
      await batch.commit();
      batch = firestore.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) await batch.commit();
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
      if (enrollment.completedAt) enrollmentPlain.completedAt = enrollment.completedAt;
      batch.set(firestore.collection(C.ENROLLMENTS).doc(enrollment.id), enrollmentPlain);
      operationCount++;
      enrollments.push(enrollment);

      const classesForCourse = courseClassesMap.get(course.id);
      if (classesForCourse && classesForCourse.length > 0) {
        const randomClass = classesForCourse[randomInt(0, classesForCourse.length - 1)];
        randomClass.addEnrollment(enrollment.id);
        batch.update(firestore.collection(C.CLASSES).doc(randomClass.id), { enrollmentIds: randomClass.enrollmentIds });
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
    const modulesSnap = await firestore.collection(C.MODULES).where('courseId', '==', enrollment.courseId).get();
    if (modulesSnap.empty) continue;

    let totalLessonsCompleted = 0;
    const shouldCompleteCourse = Math.random() > 0.5;

    for (const moduleDoc of modulesSnap.docs) {
      const lessonsSnap = await firestore.collection(C.LESSONS).where('moduleId', '==', moduleDoc.data().id).get();
      if (lessonsSnap.empty) continue;

      for (const lessonDoc of lessonsSnap.docs) {
        const lesson = lessonDoc.data();
        const shouldCompleteLesson = shouldCompleteCourse || Math.random() > 0.3;
        if (!shouldCompleteLesson) continue;

        const contentIds = lesson.contents?.map((c: { id: string }) => c.id) || [];
        if (contentIds.length === 0) {
          console.warn(` ${lesson.id} sem conteúdo, pulando progresso.`);
          continue;
        }

        const lessonProgress = LessonProgress.create({
          userId: enrollment.userId, lessonId: lesson.id, institutionId: enrollment.institutionId, contentIds,
        });
        lessonProgress.forceComplete();

        batch.set(firestore.collection(C.LESSON_PROGRESS).doc(lessonProgress.id), {
          id: lessonProgress.id, userId: lessonProgress.userId, lessonId: lessonProgress.lessonId,
          institutionId: lessonProgress.institutionId, status: lessonProgress.status,
          startedAt: lessonProgress.startedAt, completedAt: lessonProgress.completedAt,
          lastAccessedAt: lessonProgress.lastAccessedAt, updatedAt: lessonProgress.updatedAt,
          contentProgresses: lessonProgress.contentProgresses.map(cp => ({
            contentId: cp.contentId, status: cp.status, progressPercentage: cp.progressPercentage,
            startedAt: cp.startedAt, completedAt: cp.completedAt, timeSpent: cp.timeSpent, lastPosition: cp.lastPosition,
          })),
        });
        operationCount++;
        totalLessonsCompleted++;

        const questionnairesSnap = await firestore.collection(C.QUESTIONNAIRES).where('lessonId', '==', lesson.id).get();
        for (const qDoc of questionnairesSnap.docs) {
          const questionnaire = qDoc.data() as Questionnaire;
          const questions = questionnaire.questions.map((q: { id: string; correctAnswerIndex: number; options: unknown[] }) => {
            const isCorrect = Math.random() > 0.3;
            return QuestionSubmission.create({
              id: `qs_${faker.string.uuid()}`, questionId: q.id,
              selectedOptionIndex: isCorrect ? q.correctAnswerIndex : randomInt(0, q.options.length - 1),
              isCorrect,
            });
          });
          const submission = QuestionnaireSubmission.create({
            id: `sub_${faker.string.uuid()}`, questionnaireId: questionnaire.id, userId: enrollment.userId,
            institutionId: enrollment.institutionId, courseId: enrollment.courseId,
            startedAt: faker.date.past({ years: 1 }), attempt: 1, questions,
          });
          // Corrigido: salva na coleção correta questionnaire_submissions
          batch.set(firestore.collection(C.QUESTIONNAIRE_SUBMISSIONS).doc(submission.id), {
            id: submission.id, questionnaireId: submission.questionnaireId, userId: submission.userId,
            institutionId: submission.institutionId, courseId: submission.courseId,
            startedAt: submission.startedAt, completedAt: submission.completedAt,
            score: submission.score, passed: submission.passed, attempt: submission.attempt,
            questions: submission.questions.map((q: QuestionSubmission) => ({
              id: q.id, questionId: q.questionId, selectedOptionIndex: q.selectedOptionIndex, isCorrect: q.isCorrect,
            })),
          });
          operationCount++;
        }
      }
    }

    if (shouldCompleteCourse && totalLessonsCompleted > 0) {
      batch.update(firestore.collection(C.ENROLLMENTS).doc(enrollment.id), {
        status: EnrollmentStatus.COMPLETED, completedAt: new Date(),
      });
      operationCount++;

      const certificate = Certificate.create({
        id: `cert_${faker.string.uuid()}`, userId: enrollment.userId, courseId: enrollment.courseId,
        institutionId: enrollment.institutionId, certificateUrl: faker.internet.url(),
      });
      const { ...certPlain } = certificate;
      batch.set(firestore.collection(C.CERTIFICATES).doc(certificate.id), { ...certPlain });
      operationCount++;
    }
    console.log(`- Progresso simulado para matrícula no curso ${enrollment.courseId}`);

    if (operationCount > BATCH_LIMIT) {
      await batch.commit();
      batch = firestore.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) await batch.commit();
};

// --- Novos Módulos ---

const createTrails = async (institutionId: string, courses: Course[]) => {
  if (courses.length < 2) return;
  console.log('Criando trilhas...');
  const batch = firestore.batch();

  const trail = Trail.create({
    institutionId,
    title: `Trilha ${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
    description: faker.lorem.paragraph(),
    courseIds: courses.map(c => c.id),
    coverImageUrl: faker.image.url(),
  });
  batch.set(firestore.collection(C.TRAILS).doc(trail.id), {
    id: trail.id, institutionId: trail.institutionId, title: trail.title,
    description: trail.description, courseIds: trail.courseIds,
    coverImageUrl: trail.coverImageUrl, createdAt: trail.createdAt, updatedAt: trail.updatedAt,
  });

  await batch.commit();
  console.log('- 1 trilha criada');
};

const createFAQs = async (institutionId: string) => {
  console.log('Criando FAQs...');
  const batch = firestore.batch();
  const NUM_FAQS = 5;

  for (let i = 0; i < NUM_FAQS; i++) {
    const faq = FAQ.create({
      id: `faq_${faker.string.uuid()}`, institutionId,
      title: faker.lorem.sentence() + '?',
      content: faker.lorem.paragraph(),
    });
    batch.set(firestore.collection(C.FAQS).doc(faq.id), {
      id: faq.id, institutionId: faq.institutionId, title: faq.title,
      content: faq.content, createdAt: faq.createdAt, updatedAt: faq.updatedAt,
    });
  }

  await batch.commit();
  console.log(`- ${NUM_FAQS} FAQs criadas`);
};

const createPodcasts = async (institutionId: string) => {
  console.log('Criando podcasts...');
  const batch = firestore.batch();
  const mediaTypes = [PodcastMediaType.AUDIO, PodcastMediaType.VIDEO];

  for (let i = 0; i < 4; i++) {
    const podcast = Podcast.create({
      id: `pod_${faker.string.uuid()}`, institutionId,
      title: faker.lorem.sentence(4), description: faker.lorem.paragraph(),
      coverImageUrl: faker.image.url(), mediaUrl: faker.internet.url(),
      mediaType: mediaTypes[i % 2], tags: [faker.lorem.word(), faker.lorem.word()],
    });
    batch.set(firestore.collection(C.PODCASTS).doc(podcast.id), {
      id: podcast.id, institutionId: podcast.institutionId, title: podcast.title,
      description: podcast.description, coverImageUrl: podcast.coverImageUrl,
      mediaUrl: podcast.mediaUrl, mediaType: podcast.mediaType, tags: podcast.tags,
      isActive: podcast.isActive, createdAt: podcast.createdAt, updatedAt: podcast.updatedAt,
    });
  }

  await batch.commit();
  console.log('- 4 podcasts criados');
};

const createBadges = async () => {
  console.log('Criando badges...');
  const batch = firestore.batch();
  const badgeData = [
    { criteriaType: BadgeCriteriaType.COURSE_COMPLETION, criteriaValue: 1, name: 'Primeiro Curso Concluído' },
    { criteriaType: BadgeCriteriaType.LESSON_COMPLETION, criteriaValue: 10, name: '10 Aulas Concluídas' },
    { criteriaType: BadgeCriteriaType.CERTIFICATE_ACHIEVED, criteriaValue: 1, name: 'Primeiro Certificado' },
    { criteriaType: BadgeCriteriaType.DAILY_LOGIN, criteriaValue: 7, name: '7 Dias Consecutivos' },
  ];

  for (const data of badgeData) {
    const badge = Badge.create({
      id: `badge_${faker.string.uuid()}`, name: data.name,
      description: faker.lorem.sentence(), iconUrl: faker.image.url(),
      criteriaType: data.criteriaType, criteriaValue: data.criteriaValue,
    });
    batch.set(firestore.collection(C.BADGES).doc(badge.id), {
      id: badge.id, name: badge.name, description: badge.description,
      iconUrl: badge.iconUrl, criteriaType: badge.criteriaType, criteriaValue: badge.criteriaValue,
    });
  }

  await batch.commit();
  console.log(`- ${badgeData.length} badges criados`);
};

const createInstitutionAchievements = async (institutionId: string, createdBy: string) => {
  console.log('Criando conquistas da instituição...');
  const batch = firestore.batch();
  const achievementData = [
    { criteriaType: BadgeCriteriaType.COURSE_COMPLETION, criteriaValue: 1, name: 'Mestre do Conhecimento' },
    { criteriaType: BadgeCriteriaType.STUDY_STREAK, criteriaValue: 5, name: 'Maratonista do Estudo' },
    { criteriaType: BadgeCriteriaType.PROFILE_COMPLETION, criteriaValue: 100, name: 'Perfil Completo' },
  ];

  for (const data of achievementData) {
    const achievement = InstitutionAchievement.create({
      id: `ach_${faker.string.uuid()}`, institutionId, name: data.name,
      description: faker.lorem.sentence(), iconUrl: faker.image.url(),
      criteriaType: data.criteriaType, criteriaValue: data.criteriaValue, createdBy,
    });
    batch.set(firestore.collection(C.INSTITUTION_ACHIEVEMENTS).doc(achievement.id), {
      id: achievement.id, institutionId: achievement.institutionId, name: achievement.name,
      description: achievement.description, iconUrl: achievement.iconUrl,
      criteriaType: achievement.criteriaType, criteriaValue: achievement.criteriaValue,
      isActive: achievement.isActive, createdBy: achievement.createdBy,
      createdAt: achievement.createdAt, updatedAt: achievement.updatedAt,
    });
  }

  await batch.commit();
  console.log(`- ${achievementData.length} conquistas da instituição criadas`);
};

const createNSScoreQuestions = async (institutionId: string, courses: Course[]) => {
  console.log('Criando perguntas NSScore...');
  const batch = firestore.batch();
  const questionTexts = [
    'Em uma escala de 0 a 10, o quanto você recomendaria este curso para um amigo ou colega?',
    'Como você avalia a qualidade do conteúdo apresentado neste curso?',
    'O curso atendeu às suas expectativas de aprendizado?',
  ];

  for (const course of courses) {
    questionTexts.forEach((text, index) => {
      const question = NSScoreQuestion.create({
        id: `ns_${faker.string.uuid()}`, courseId: course.id, institutionId, text, order: index,
      });
      batch.set(firestore.collection(C.NSSCORE_QUESTIONS).doc(question.id), {
        id: question.id, courseId: question.courseId, institutionId: question.institutionId,
        text: question.text, order: question.order, createdAt: question.createdAt,
      });
    });
  }

  await batch.commit();
  console.log(`- ${questionTexts.length * courses.length} perguntas NSScore criadas`);
};

const createNotes = async (students: User[]) => {
  console.log('Criando notas dos estudantes...');
  const batch = firestore.batch();

  for (const student of students) {
    for (let i = 0; i < 2; i++) {
      const note = Note.create({
        userId: student.id,
        title: faker.lorem.sentence(4),
        content: faker.lorem.paragraphs(2),
      });
      batch.set(firestore.collection(C.NOTES).doc(note.id), {
        id: note.id, userId: note.userId, title: note.title,
        content: note.content, createdAt: note.createdAt, updatedAt: note.updatedAt,
      });
    }
  }

  await batch.commit();
  console.log(`- ${students.length * 2} notas criadas`);
};

const createPosts = async (institutionId: string, authors: User[]) => {
  console.log('Criando posts...');
  const batch = firestore.batch();

  for (let i = 0; i < 6; i++) {
    const author = authors[i % authors.length];
    const post = Post.create({
      id: `post_${faker.string.uuid()}`, authorId: author.id, institutionId,
      title: faker.lorem.sentence(5), content: faker.lorem.paragraphs(3),
    });
    post.publish();
    batch.set(firestore.collection(C.POSTS).doc(post.id), post.toPlainObject());
  }

  await batch.commit();
  console.log('- 6 posts criados');
};

const createChatRooms = async (courseClassesMap: Map<string, Class[]>) => {
  console.log('Criando salas de chat para as classes...');
  const batch = firestore.batch();
  let count = 0;

  for (const [courseId, classes] of courseClassesMap.entries()) {
    for (const classEntity of classes) {
      const chatRoom = ChatRoom.create({ classId: classEntity.id, courseId });
      batch.set(firestore.collection(C.CHAT_ROOMS).doc(chatRoom.id), {
        id: chatRoom.id, classId: chatRoom.classId, courseId: chatRoom.courseId,
        createdAt: chatRoom.createdAt, updatedAt: chatRoom.updatedAt,
      });
      count++;
    }
  }

  await batch.commit();
  console.log(`- ${count} salas de chat criadas`);
};

const createTutoringSessions = async (students: User[], tutors: User[], courses: Course[]) => {
  console.log('Criando sessões de tutoria...');
  const batch = firestore.batch();
  const priorities = [SessionPriority.LOW, SessionPriority.MEDIUM, SessionPriority.HIGH];
  const NUM_SESSIONS = Math.min(8, students.length);

  for (let i = 0; i < NUM_SESSIONS; i++) {
    const student = students[i];
    const tutor = tutors[i % tutors.length];
    const course = courses[i % courses.length];

    // Data mínima de 2 dias no futuro para respeitar validação de 1h de antecedência
    const scheduledDate = futureDateDays(2, 30);

    const session = TutoringSession.create({
      id: `ts_${faker.string.uuid()}`, studentId: student.id, tutorId: tutor.id,
      courseId: course.id, scheduledDate, duration: randomInt(15, 90),
      studentQuestion: faker.lorem.sentence().slice(0, 200),
      priority: priorities[i % 3],
    });
    batch.set(firestore.collection(C.TUTORING_SESSIONS).doc(session.id), {
      id: session.id, studentId: session.studentId, tutorId: session.tutorId,
      courseId: session.courseId, scheduledDate: session.scheduledDate,
      duration: session.duration, status: session.status,
      studentQuestion: session.studentQuestion, priority: session.priority,
      createdAt: session.createdAt, updatedAt: session.updatedAt,
    });

    const notification = Notification.create({
      id: `notif_${faker.string.uuid()}`, recipientId: student.id,
      senderId: tutor.id, senderName: tutor.name, type: 'TUTORING_SCHEDULED',
      title: 'Sessão de tutoria agendada',
      message: `Sua sessão de tutoria com ${tutor.name} foi agendada.`,
      relatedEntityId: session.id,
    });
    batch.set(firestore.collection(C.NOTIFICATIONS).doc(notification.id), {
      id: notification.id, recipientId: notification.recipientId,
      senderId: notification.senderId, senderName: notification.senderName,
      type: notification.type, title: notification.title, message: notification.message,
      read: notification.read, relatedEntityId: notification.relatedEntityId,
      response: notification.response, createdAt: notification.createdAt,
    });
  }

  await batch.commit();
  console.log(`- ${NUM_SESSIONS} sessões de tutoria criadas (com notificações)`);
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

    // Novos módulos
    await createTrails(institutionId, courses);
    await createFAQs(institutionId);
    await createPodcasts(institutionId);
    await createBadges();
    await createInstitutionAchievements(institutionId, localAdmins[0].id);
    await createNSScoreQuestions(institutionId, courses);
    await createNotes(students);
    await createPosts(institutionId, [...tutors, ...localAdmins]);
    await createChatRooms(courseClassesMap);
    await createTutoringSessions(students, tutors, courses);

    console.log('\n--- Seeding concluído com sucesso! ---');
    console.log(`- 1 Instituição criada`);
    console.log(`- ${localAdmins.length} Administradores Locais criados`);
    console.log(`- ${tutors.length} Tutores criados`);
    console.log(`- ${students.length} Estudantes criados`);
    console.log(`- ${courses.length} Cursos criados`);
    console.log(`- 1 Trilha criada`);
    console.log(`- 5 FAQs criadas`);
    console.log(`- 4 Podcasts criados`);
    console.log(`- 4 Badges criados`);
    console.log(`- 3 Conquistas da instituição criadas`);
    console.log(`- ${3 * courses.length} Perguntas NSScore criadas`);
    console.log(`- ${students.length * 2} Notas criadas`);
    console.log(`- 6 Posts criados`);
    console.log(`- ${NUM_COURSES * CLASSES_PER_COURSE} Salas de chat criadas`);
    console.log(`- ${Math.min(8, NUM_STUDENTS)} Sessões de tutoria criadas`);
  } catch (error) {
    console.error('\n--- Ocorreu um erro durante o seeding ---', error);
  }
};

seed();
