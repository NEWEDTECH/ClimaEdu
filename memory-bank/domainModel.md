# Domain Model

This document describes the domain model of the ClimaEdu platform, organized by bounded contexts.

## User Bounded Context

### User Entity
- **Purpose**: Represents a user in the system
- **Properties**:
  - `id: string` (readonly)
  - `institutionId: string` (readonly)
  - `name: string`
  - `email: Email` (value object)
  - `role: UserRole`
  - `createdAt: Date` (readonly)
  - `updatedAt: Date`
  - `profile?: Profile` (value object)
- **Methods**:
  - `static create(params): User`
  - `updateName(newName): void`
  - `updateEmail(newEmail): void`
  - `updateRole(newRole): void`
  - `attachProfile(profile): void`
  - `touch(): void`

### Email Value Object
- **Purpose**: Represents a valid email address
- **Properties**:
  - `value: string`
- **Methods**:
  - `static create(value): Email`
  - `isValid(): boolean`
  - `normalize(): void`

### Profile Value Object
- **Purpose**: Contains additional user information
- **Properties**:
  - `bio?: string`
  - `avatarUrl?: string`
  - `linkedinUrl?: string`
- **Methods**:
  - `static create(params): Profile`
  - `updateBio(newBio): void`
  - `updateAvatar(newAvatarUrl): void`
  - `updateLinkedin(newLinkedinUrl): void`

### UserRole Enum
- **Values**:
  - `STUDENT`
  - `TUTOR`
  - `ADMINISTRATOR`

## Content Bounded Context

### Content Entity
- **Purpose**: Represents educational content
- **Properties**:
  - `id: string` (readonly)
  - `lessonId: string` (readonly)
  - `type: ContentType`
  - `title: string`
  - `url: string`
- **Methods**:
  - `static create(params): Content`
  - `updateTitle(newTitle): void`
  - `updateUrl(newUrl): void`

### ContentType Enum
- **Values**:
  - `VIDEO`
  - `PDF`
  - `PODCAST`

### Course Entity
- **Purpose**: Represents a course in the system
- **Properties**:
  - `id: string` (readonly)
  - `institutionId: string` (readonly)
  - `title: string`
  - `description: string`
  - `modules: Module[]`
  - `createdAt: Date` (readonly)
  - `updatedAt: Date`
- **Methods**:
  - `static create(params): Course`
  - `addModule(module): void`
  - `updateTitle(newTitle): void`
  - `updateDescription(newDescription): void`
  - `touch(): void`

### Module Entity
- **Purpose**: Represents a module within a course
- **Properties**:
  - `id: string` (readonly)
  - `courseId: string` (readonly)
  - `title: string`
  - `lessons: Lesson[]`
  - `order: number`
- **Methods**:
  - `static create(params): Module`
  - `addLesson(lesson): void`
  - `updateTitle(newTitle): void`
  - `reorderLesson(lessonId, newOrder): void`

### Lesson Entity
- **Purpose**: Represents a lesson within a module
- **Properties**:
  - `id: string` (readonly)
  - `moduleId: string` (readonly)
  - `title: string`
  - `contents: Content[]`
  - `order: number`
  - `activity?: Activity`
  - `questionnaire?: Questionnaire`
- **Methods**:
  - `static create(params): Lesson`
  - `addContent(content): void`
  - `attachActivity(activity): void`
  - `attachQuestionnaire(questionnaire): void`
  - `updateTitle(newTitle): void`

### Activity Entity
- **Purpose**: Represents a learning activity for a lesson
- **Properties**:
  - `description: string`
  - `instructions: string`
  - `resourceUrl?: string`
- **Methods**:
  - `static create(params): Activity`
  - `updateDescription(newDescription): void`
  - `updateInstructions(newInstructions): void`
  - `updateResourceUrl(newUrl): void`

### Questionnaire Entity
- **Purpose**: Represents a set of questions for a lesson
- **Properties**:
  - `id: string` (readonly)
  - `lessonId: string` (readonly)
  - `title: string`
  - `questions: Question[]`
  - `maxAttempts: number`
  - `passingScore: number`
- **Methods**:
  - `static create(params): Questionnaire`
  - `addQuestion(question): void`
  - `updateTitle(newTitle): void`
  - `updateMaxAttempts(maxAttempts): void`
  - `updatePassingScore(passingScore): void`
  - `hasAttemptsRemaining(currentAttempt): boolean`

### Question Entity
- **Purpose**: Represents a question in a questionnaire
- **Properties**:
  - `id: string` (readonly)
  - `questionText: string`
  - `options: string[]`
  - `correctAnswerIndex: number`
- **Methods**:
  - `static create(params): Question`
  - `updateQuestionText(newText): void`
  - `updateOptions(newOptions): void`
  - `updateCorrectAnswer(index): void`

### QuestionSubmission Entity
- **Purpose**: Represents a student's answer to a question
- **Properties**:
  - `id: string` (readonly)
  - `questionId: string` (readonly)
  - `selectedOptionIndex: number` (readonly)
  - `isCorrect: boolean` (readonly)
- **Methods**:
  - `static create(params): QuestionSubmission`
  - `static evaluate(selectedOptionIndex, correctAnswerIndex): boolean`

### QuestionnaireSubmission Entity
- **Purpose**: Represents a student's submission for a questionnaire
- **Properties**:
  - `id: string` (readonly)
  - `questionnaireId: string` (readonly)
  - `userId: string` (readonly)
  - `institutionId: string` (readonly)
  - `startedAt: Date` (readonly)
  - `completedAt: Date` (readonly)
  - `score: number` (readonly)
  - `passed: boolean` (readonly)
  - `attempt: number` (readonly)
  - `questions: QuestionSubmission[]` (readonly)
- **Methods**:
  - `static create(params): QuestionnaireSubmission`
  - `static calculateScore(questions): number`
  - `static checkPass(score, passingScore): boolean`
  - `calculateScore(): number`
  - `checkPass(passingScore): boolean`

## Enrollment Bounded Context

### Enrollment Entity
- **Purpose**: Represents a user's enrollment in a course
- **Properties**:
  - `id: string` (readonly)
  - `userId: string` (readonly)
  - `courseId: string` (readonly)
  - `institutionId: string` (readonly)
  - `status: EnrollmentStatus`
  - `enrolledAt: Date` (readonly)
  - `completedAt?: Date`
- **Methods**:
  - `static create(params): Enrollment`
  - `complete(): void`
  - `cancel(): void`
  - `reactivate(): void`

### EnrollmentStatus Enum
- **Values**:
  - `ENROLLED`
  - `COMPLETED`
  - `CANCELLED`

## Institution Bounded Context

### Institution Entity
- **Purpose**: Represents an organization in the system
- **Properties**:
  - `id: string` (readonly)
  - `name: string`
  - `domain: string`
  - `settings: InstitutionSettings`
  - `createdAt: Date` (readonly)
  - `updatedAt: Date`
- **Methods**:
  - `static create(params): Institution`
  - `updateName(newName): void`
  - `updateDomain(newDomain): void`
  - `updateSettings(newSettings): void`
  - `touch(): void`

### InstitutionSettings Value Object
- **Purpose**: Represents customization settings for an institution
- **Properties**:
  - `logoUrl?: string`
  - `primaryColor?: string`
  - `secondaryColor?: string`
- **Methods**:
  - `static create(params): InstitutionSettings`
  - `updateLogoUrl(newLogoUrl): InstitutionSettings`
  - `updatePrimaryColor(newColor): InstitutionSettings`
  - `updateSecondaryColor(newColor): InstitutionSettings`

## Certificate Bounded Context

### Certificate Entity
- **Purpose**: Represents a formal document issued when a user completes a course
- **Properties**:
  - `id: string` (readonly)
  - `userId: string` (readonly)
  - `courseId: string` (readonly)
  - `institutionId: string` (readonly)
  - `issuedAt: Date` (readonly)
  - `certificateNumber: string` (readonly)
  - `certificateUrl: string`
- **Methods**:
  - `static create(params): Certificate`
  - `static generateCertificateNumber(): string`
  - `updateCertificateUrl(newUrl): void`
  - `isAuthentic(): boolean`

## Badge Bounded Context

### Badge Entity
- **Purpose**: Defines a badge that students can earn by achieving specific criteria
- **Properties**:
  - `id: string` (readonly)
  - `name: string` (readonly)
  - `description: string` (readonly)
  - `iconUrl: string` (readonly)
  - `criteriaType: BadgeCriteriaType` (readonly)
  - `criteriaValue: number` (readonly)
- **Methods**:
  - `static create(params): Badge`
  - `isCriteriaMet(count): boolean`
  - `getRemainingCount(currentCount): number`
  - `getProgressPercentage(currentCount): number`

### StudentBadge Entity
- **Purpose**: Records that a specific student has earned a specific badge
- **Properties**:
  - `id: string` (readonly)
  - `userId: string` (readonly)
  - `badgeId: string` (readonly)
  - `institutionId: string` (readonly)
  - `awardedAt: Date` (readonly)
- **Methods**:
  - `static create(params): StudentBadge`
  - `isRecentlyAwarded(daysThreshold): boolean`
  - `getDaysSinceAwarded(): number`

### BadgeCriteriaType Enum
- **Values**:
  - `COURSE_COMPLETION`
  - `QUESTIONNAIRE_COMPLETION`
  - `DAILY_LOGIN`
  - `LESSON_COMPLETION`
  - `CERTIFICATE_ACHIEVED`

## Report Bounded Context

### MyCourseProgressReport Entity
- **Purpose**: Shows the student's progress in each enrolled course
- **Properties**:
  - `userId: string` (readonly)
  - `courseId: string` (readonly)
  - `institutionId: string` (readonly)
  - `completedLessons: number` (readonly)
  - `totalLessons: number` (readonly)
  - `progressPercentage: number` (readonly)
- **Methods**:
  - `static create(params): MyCourseProgressReport`

### MyAssessmentReport Entity
- **Purpose**: Displays the student's scores in each questionnaire
- **Properties**:
  - `userId: string` (readonly)
  - `questionnaireId: string` (readonly)
  - `institutionId: string` (readonly)
  - `score: number` (readonly)
  - `passed: boolean` (readonly)
  - `attemptNumber: number` (readonly)
- **Methods**:
  - `static create(params): MyAssessmentReport`

### StudentProgressReport Entity
- **Purpose**: View a student's overall course progress managed by a tutor
- **Properties**:
  - `tutorId: string` (readonly)
  - `studentId: string` (readonly)
  - `courseId: string` (readonly)
  - `institutionId: string` (readonly)
  - `progressPercentage: number` (readonly)
  - `lastActivityDate: Date` (readonly)
- **Methods**:
  - `static create(params): StudentProgressReport`

### ClassAssessmentReport Entity
- **Purpose**: Analyze average assessment results for a class
- **Properties**:
  - `tutorId: string` (readonly)
  - `courseId: string` (readonly)
  - `institutionId: string` (readonly)
  - `averageScore: number` (readonly)
  - `averageCompletionRate: number` (readonly)
  - `numberOfStudents: number` (readonly)
  - `numberOfPassedStudents: number` (readonly)
- **Methods**:
  - `static create(params): ClassAssessmentReport`
  - `getPassRate(): number`

### InstitutionUserReport Entity
- **Purpose**: Summarize the number of users by role in the institution
- **Properties**:
  - `institutionId: string` (readonly)
  - `totalUsers: number` (readonly)
  - `numberOfStudents: number` (readonly)
  - `numberOfTutors: number` (readonly)
  - `numberOfAdmins: number` (readonly)
- **Methods**:
  - `static create(params): InstitutionUserReport`
  - `getStudentPercentage(): number`
  - `getTutorPercentage(): number`
  - `getAdminPercentage(): number`

### InstitutionCourseReport Entity
- **Purpose**: List courses and general usage statistics
- **Properties**:
  - `institutionId: string` (readonly)
  - `totalCourses: number` (readonly)
  - `activeCourses: number` (readonly)
  - `archivedCourses: number` (readonly)
  - `totalEnrollments: number` (readonly)
- **Methods**:
  - `static create(params): InstitutionCourseReport`
  - `getAverageEnrollmentsPerCourse(): number`
  - `getActiveCoursesPercentage(): number`
  - `getArchivedCoursesPercentage(): number`

### InstitutionCompletionReport Entity
- **Purpose**: Show overall course completion rate across the institution
- **Properties**:
  - `institutionId: string` (readonly)
  - `averageCompletionRate: number` (readonly)
  - `numberOfCompletedEnrollments: number` (readonly)
  - `numberOfActiveEnrollments: number` (readonly)
- **Methods**:
  - `static create(params): InstitutionCompletionReport`
  - `getTotalEnrollments(): number`
  - `getCompletionRate(): number`

### InstitutionCertificateReport Entity
- **Purpose**: Track certificates issued per course and student
- **Properties**:
  - `institutionId: string` (readonly)
  - `courseId: string` (readonly)
  - `certificatesIssued: number` (readonly)
  - `studentsCertified: number` (readonly)
- **Methods**:
  - `static create(params): InstitutionCertificateReport`
  - `getAverageCertificatesPerStudent(): number`
  - `hasMultipleCertificatesPerStudent(): boolean`

### InstitutionPerformanceReport Entity
- **Purpose**: Measure average performance metrics across all students
- **Properties**:
  - `institutionId: string` (readonly)
  - `averageScore: number` (readonly)
  - `totalStudents: number` (readonly)
  - `activeStudents: number` (readonly)
  - `certifiedStudents: number` (readonly)
- **Methods**:
  - `static create(params): InstitutionPerformanceReport`
  - `getActiveStudentsPercentage(): number`
  - `getCertifiedStudentsPercentage(): number`
  - `getCertifiedActiveStudentsPercentage(): number`
