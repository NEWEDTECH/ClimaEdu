import { Badge } from '../../entities/Badge';
import { StudentBadge } from '../../entities/StudentBadge';

/**
 * Output data for viewing earned badges
 */
export interface ViewEarnedBadgesOutput {
  /**
   * Array of earned badges with their details
   */
  earnedBadges: {
    /**
     * The student badge record
     */
    studentBadge: StudentBadge;
    
    /**
     * The badge details
     */
    badge: Badge;
  }[];
  
  /**
   * Total number of badges earned
   */
  totalEarned: number;
  
  /**
   * Number of badges earned recently (within the last 7 days)
   */
  recentlyEarned: number;
}
