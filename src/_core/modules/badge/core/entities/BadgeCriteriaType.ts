/**
 * BadgeCriteriaType
 * 
 * Defines the types of criteria that can award a badge.
 * Each badge is linked to one of these criteria types.
 * 
 * Values:
 * - COURSE_COMPLETION: Awarded when a student completes a course
 * - QUESTIONNAIRE_COMPLETION: Awarded when a student completes a questionnaire
 * - DAILY_LOGIN: Awarded when a student logs in for consecutive days
 * - LESSON_COMPLETION: Awarded when a student completes a certain number of lessons
 * - CERTIFICATE_ACHIEVED: Awarded when a student earns a certificate
 */
export enum BadgeCriteriaType {
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  QUESTIONNAIRE_COMPLETION = 'QUESTIONNAIRE_COMPLETION',
  DAILY_LOGIN = 'DAILY_LOGIN',
  LESSON_COMPLETION = 'LESSON_COMPLETION',
  CERTIFICATE_ACHIEVED = 'CERTIFICATE_ACHIEVED',
}
