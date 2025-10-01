/**
 * BadgeCriteriaType
 * 
 * Defines the types of criteria that can award a badge or achievement.
 * Each badge/achievement is linked to one of these criteria types.
 * 
 * Existing Values:
 * - COURSE_COMPLETION: Awarded when a student completes a course
 * - QUESTIONNAIRE_COMPLETION: Awarded when a student completes a questionnaire
 * - DAILY_LOGIN: Awarded when a student logs in for consecutive days
 * - LESSON_COMPLETION: Awarded when a student completes a certain number of lessons
 * - CERTIFICATE_ACHIEVED: Awarded when a student earns a certificate
 * 
 * New Achievement Values:
 * - STUDY_STREAK: Awarded for consecutive days studying
 * - STUDY_TIME: Awarded for total study time accumulated
 * - PERFECT_SCORE: Awarded for achieving perfect scores
 * - RETRY_PERSISTENCE: Awarded for retrying assessments until success
 * - CONTENT_TYPE_DIVERSITY: Awarded for accessing different types of content
 * - TRAIL_COMPLETION: Awarded for completing learning trails
 * - FIRST_TIME_ACTIVITIES: Awarded for first-time activities
 * - TIME_BASED_ACCESS: Awarded for accessing platform at specific times
 * - PROFILE_COMPLETION: Awarded for completing user profile
 */
export enum BadgeCriteriaType {
  // Existing criteria
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  QUESTIONNAIRE_COMPLETION = 'QUESTIONNAIRE_COMPLETION',
  DAILY_LOGIN = 'DAILY_LOGIN',
  LESSON_COMPLETION = 'LESSON_COMPLETION',
  CERTIFICATE_ACHIEVED = 'CERTIFICATE_ACHIEVED',
  
  // New achievement criteria
  STUDY_STREAK = 'STUDY_STREAK',
  STUDY_TIME = 'STUDY_TIME',
  PERFECT_SCORE = 'PERFECT_SCORE',
  RETRY_PERSISTENCE = 'RETRY_PERSISTENCE',
  CONTENT_TYPE_DIVERSITY = 'CONTENT_TYPE_DIVERSITY',
  TRAIL_COMPLETION = 'TRAIL_COMPLETION',
  FIRST_TIME_ACTIVITIES = 'FIRST_TIME_ACTIVITIES',
  TIME_BASED_ACCESS = 'TIME_BASED_ACCESS',
  PROFILE_COMPLETION = 'PROFILE_COMPLETION',
}
