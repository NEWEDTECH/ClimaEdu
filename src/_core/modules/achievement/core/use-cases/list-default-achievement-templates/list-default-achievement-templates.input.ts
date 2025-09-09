/**
 * Input for listing available default achievement templates
 */
export interface ListDefaultAchievementTemplatesInput {
  /**
   * Optional category filter
   */
  category?: string;

  /**
   * Optional criteria type filter
   */
  criteriaType?: string;

  /**
   * Whether to include only globally enabled templates (default: true)
   */
  onlyEnabled?: boolean;

  /**
   * Maximum number of templates to return
   */
  limit?: number;

  /**
   * Offset for pagination
   */
  offset?: number;
}