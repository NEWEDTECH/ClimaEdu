import { Ability, AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';

// Define the possible actions
export enum Action {
  MANAGE = 'manage', // wildcard for any action
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  CONFIGURE = 'configure',
  WATCH = 'watch',
  ASSIGN = 'assign',
  REPORT = 'report',
}

// Define the subject types as string literals
export type SubjectType = 
  | 'all'
  | 'institution'
  | 'course'
  | 'lesson'
  | 'student'
  | 'tutor'
  | 'admin'
  | 'content'
  | 'enrollment'
  | 'certificate'
  | 'badge'
  | 'report'
  | 'forum'
  | 'questionnaire'
  | 'activity'
  | 'profile';

// Define subject constants for easier reference
export const Subject = {
  ALL: 'all' as const,
  INSTITUTION: 'institution' as const,
  COURSE: 'course' as const,
  LESSON: 'lesson' as const,
  STUDENT: 'student' as const,
  TUTOR: 'tutor' as const,
  ADMIN: 'admin' as const,
  CONTENT: 'content' as const,
  ENROLLMENT: 'enrollment' as const,
  CERTIFICATE: 'certificate' as const,
  BADGE: 'badge' as const,
  REPORT: 'report' as const,
  FORUM: 'forum' as const,
  QUESTIONNAIRE: 'questionnaire' as const,
  ACTIVITY: 'activity' as const,
  PROFILE: 'profile' as const,
};

// Define the user roles
export enum Role {
  ROOT = 'root',
  ADMIN = 'admin',
  TUTOR = 'tutor',
  STUDENT = 'student',
}

// Define the AppAbility type
export type AppAbility = PureAbility<[Action, SubjectType]>;

export type DefinePermissions = (
  user: { role: Role; institutionId?: string },
  builder: AbilityBuilder<AppAbility>
) => void;

// Helper function to create the ability instance
export function createAppAbility(user: { role: Role; institutionId?: string }) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    Ability as AbilityClass<AppAbility>
  );

  switch (user.role) {
    case Role.ROOT:
      // Root can do everything
      can(Action.MANAGE, Subject.ALL);
      break;

    case Role.ADMIN:
      // Admin can manage everything within their institution
      if (user.institutionId) {
        can(Action.MANAGE, Subject.ALL);
      }
      cannot(Action.MANAGE, Subject.INSTITUTION);
      can(Action.READ, Subject.INSTITUTION);
      can(Action.UPDATE, Subject.INSTITUTION);
      break;

    case Role.TUTOR:
      // Tutor can configure courses, lessons, and students
      if (user.institutionId) {
        can(Action.READ, Subject.INSTITUTION);
        can([Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.CONFIGURE], Subject.COURSE);
        can([Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.CONFIGURE], Subject.LESSON);
        can([Action.READ, Action.UPDATE, Action.ASSIGN], Subject.STUDENT);
        can([Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE], Subject.CONTENT);
        can([Action.READ, Action.CREATE], Subject.REPORT);
        can([Action.READ, Action.UPDATE], Subject.FORUM);
        can([Action.READ, Action.UPDATE], Subject.QUESTIONNAIRE);
        can([Action.READ, Action.UPDATE], Subject.ACTIVITY);
        can(Action.READ, Subject.ENROLLMENT);
      }
      break;

    case Role.STUDENT:
      // Student can only watch courses and related content
      if (user.institutionId) {
        can(Action.WATCH, Subject.COURSE);
        can(Action.WATCH, Subject.LESSON);
        can(Action.WATCH, Subject.CONTENT);
        can(Action.READ, Subject.CERTIFICATE);
        can(Action.READ, Subject.BADGE);
        can([Action.READ, Action.CREATE], Subject.FORUM);
        can(Action.READ, Subject.QUESTIONNAIRE);
        can([Action.READ, Action.UPDATE], Subject.ACTIVITY);
        can(Action.READ, Subject.PROFILE);
        can(Action.UPDATE, Subject.PROFILE);
      }
      break;

    default:
      // No permissions by default
      break;
  }

  return build();
}
