import { Action, Subject, AppAbility, SubjectType } from './types';

/**
 * Utility class for permission-related operations
 */
export class PermissionUtils {
  /**
   * Check if the user has permission to perform an action on a subject
   * @param ability The user's ability instance
   * @param action The action to check
   * @param subject The subject to check
   * @returns True if the user has permission, false otherwise
   */
  static can(
    ability: AppAbility,
    action: Action,
    subject: SubjectType
  ): boolean {
    return ability.can(action, subject);
  }

  /**
   * Check if the user does not have permission to perform an action on a subject
   * @param ability The user's ability instance
   * @param action The action to check
   * @param subject The subject to check
   * @returns True if the user does not have permission, false otherwise
   */
  static cannot(
    ability: AppAbility,
    action: Action,
    subject: SubjectType
  ): boolean {
    return ability.cannot(action, subject);
  }

  /**
   * Get a list of all permissions for a given subject
   * @param ability The user's ability instance
   * @param subject The subject to check
   * @returns An array of actions that the user can perform on the subject
   */
  static getPermissionsForSubject(
    ability: AppAbility,
    subject: SubjectType
  ): Action[] {
    const actions = Object.values(Action);
    return actions.filter(action => ability.can(action, subject));
  }

  /**
   * Check if the user has admin permissions
   * @param ability The user's ability instance
   * @returns True if the user has admin permissions, false otherwise
   */
  static isAdmin(ability: AppAbility): boolean {
    return ability.can(Action.MANAGE, Subject.ALL);
  }

  /**
   * Check if the user has tutor permissions
   * @param ability The user's ability instance
   * @returns True if the user has tutor permissions, false otherwise
   */
  static isTutor(ability: AppAbility): boolean {
    return ability.can(Action.CONFIGURE, Subject.COURSE);
  }

  /**
   * Check if the user has student permissions
   * @param ability The user's ability instance
   * @returns True if the user has student permissions, false otherwise
   */
  static isStudent(ability: AppAbility): boolean {
    return ability.can(Action.WATCH, Subject.COURSE) && !this.isTutor(ability);
  }
}
