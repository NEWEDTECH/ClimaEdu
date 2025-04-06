/**
 * User entity representing a user in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enum representing the types of users in the system
 */
export enum UserType {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
}
