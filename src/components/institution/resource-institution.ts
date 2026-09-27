'use client';

import { container, Register } from '@/_core/shared/container';
import type { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import type { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository';
import type { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository';
import { GetClassUseCase } from '@/_core/modules/enrollment/core/use-cases/get-class/get-class.use-case';
import { GetClassInput } from '@/_core/modules/enrollment/core/use-cases/get-class/get-class.input';
import { GetTrailUseCase } from '@/_core/modules/content/core/use-cases/get-trail/get-trail.use-case';
import { GetTrailInput } from '@/_core/modules/content/core/use-cases/get-trail/get-trail.input';
import { GetPodcastUseCase } from '@/_core/modules/podcast/core/use-cases/get-podcast/get-podcast.use-case';

/*
 * Resolvem a(s) instituição(ões) de um registro para o InstitutionResourceGuard.
 * Retornam null quando o registro não existe (a própria página exibe o "não encontrado").
 */

export async function getCourseInstitutionIds(courseId: string): Promise<string[] | null> {
  const courseRepository = container.get<CourseRepository>(Register.content.repository.CourseRepository);
  const course = await courseRepository.findById(courseId);
  return course ? [course.institutionId] : null;
}

export async function getClassInstitutionIds(classId: string): Promise<string[] | null> {
  const getClassUseCase = container.get<GetClassUseCase>(Register.enrollment.useCase.GetClassUseCase);
  const { klass } = await getClassUseCase.execute(new GetClassInput(classId));
  return klass ? [klass.institutionId] : null;
}

export async function getTrailInstitutionIds(trailId: string): Promise<string[] | null> {
  const getTrailUseCase = container.get<GetTrailUseCase>(Register.content.useCase.GetTrailUseCase);
  const { trail } = await getTrailUseCase.execute(new GetTrailInput(trailId));
  return trail ? [trail.institutionId] : null;
}

export async function getPodcastInstitutionIds(podcastId: string): Promise<string[] | null> {
  const getPodcastUseCase = container.get<GetPodcastUseCase>(Register.podcast.useCase.GetPodcastUseCase);
  try {
    const { podcast } = await getPodcastUseCase.execute({ podcastId });
    return [podcast.institutionId];
  } catch {
    return null;
  }
}

/** Instituições às quais o usuário está vinculado (qualquer papel) */
export async function getUserInstitutionIds(userId: string): Promise<string[] | null> {
  const userInstitutionRepository = container.get<UserInstitutionRepository>(
    Register.institution.repository.UserInstitutionRepository
  );
  const associations = await userInstitutionRepository.findByUserId(userId);
  return associations.map(assoc => assoc.institutionId);
}

/** IDs dos usuários vinculados (qualquer papel) a uma instituição */
export async function getInstitutionUserIds(institutionId: string): Promise<Set<string>> {
  const userInstitutionRepository = container.get<UserInstitutionRepository>(
    Register.institution.repository.UserInstitutionRepository
  );
  const associations = await userInstitutionRepository.findByInstitutionId(institutionId);
  return new Set(associations.map(assoc => assoc.userId));
}

/**
 * A tela de matrícula de aluno aceita o ID do aluno ou o ID de uma matrícula:
 * usa as instituições do aluno e, se não houver, a instituição do curso da matrícula.
 */
export async function getStudentOrEnrollmentInstitutionIds(id: string): Promise<string[] | null> {
  const userInstitutionIds = await getUserInstitutionIds(id);
  if (userInstitutionIds && userInstitutionIds.length > 0) return userInstitutionIds;

  const enrollmentRepository = container.get<EnrollmentRepository>(Register.enrollment.repository.EnrollmentRepository);
  const enrollment = await enrollmentRepository.findById(id);
  if (enrollment) return getCourseInstitutionIds(enrollment.courseId);

  return userInstitutionIds;
}
