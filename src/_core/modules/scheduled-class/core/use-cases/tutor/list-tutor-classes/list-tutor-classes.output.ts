/**
 * A class (turma) option available for the tutor to schedule a class
 */
export interface TutorClassOption {
  classId: string;
  className: string;
  courseId: string;
  courseTitle: string;
}

/**
 * Output for ListTutorClassesUseCase
 */
export interface ListTutorClassesOutput {
  classes: TutorClassOption[];
}
