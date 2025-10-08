/**
 * Enum representing the status of an activity submission
 * Following Clean Architecture principles, this enum is pure and has no dependencies
 */
export enum ActivitySubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
