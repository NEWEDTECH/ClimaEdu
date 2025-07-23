import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Badge data for a single badge (earned or not earned)
 */
export interface BadgeData {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeCategory: string; // e.g., 'COMPLETION', 'STREAK', 'PERFORMANCE', 'SPECIAL'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';
  iconUrl: string;
  
  // Earning status
  isEarned: boolean;
  earnedAt?: Date;
  
  // Progress information
  currentProgress: number; // Current value (e.g., 5 courses completed)
  requiredProgress: number; // Required value (e.g., 10 courses needed)
  progressPercentage: number; // 0-100
  
  // Requirements
  requirements: {
    type: string; // e.g., 'COMPLETE_COURSES', 'STUDY_STREAK', 'ASSESSMENT_SCORE'
    description: string;
    target: number;
    current: number;
  }[];
  
  // Reward information
  rewards: {
    points?: number;
    title?: string;
    specialAccess?: string;
  };
  
  // Rarity and stats
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedByPercentage: number; // What % of students have this badge
  estimatedTimeToEarn?: number; // in days, if not earned
}

/**
 * Badge category statistics
 */
export interface BadgeCategoryStats {
  category: string;
  totalBadges: number;
  earnedBadges: number;
  completionPercentage: number;
  nextBadgeToEarn?: {
    badgeId: string;
    badgeName: string;
    progressPercentage: number;
    estimatedDays: number;
  };
}

/**
 * Achievement milestones
 */
export interface AchievementMilestone {
  milestoneId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  requiredBadges: string[];
  earnedBadges: string[];
  progressPercentage: number;
  rewards: {
    specialTitle?: string;
    exclusiveContent?: string;
    certificateBonus?: boolean;
  };
}

/**
 * Badge earning timeline
 */
export interface BadgeTimeline {
  period: string; // e.g., "2024-01", "Week 1"
  badgesEarned: number;
  badgeDetails: Array<{
    badgeId: string;
    badgeName: string;
    earnedAt: Date;
    difficulty: string;
  }>;
}

/**
 * Leaderboard position
 */
export interface LeaderboardPosition {
  category: string;
  currentRank: number;
  totalParticipants: number;
  percentileRank: number;
  pointsToNextRank: number;
  nextRankUser?: {
    username: string;
    badgeCount: number;
  };
}

/**
 * Output DTO for student badges report
 * Following CQRS pattern - formatted data ready for presentation
 */
export interface GenerateStudentBadgesReportOutput extends BaseReportOutput {
  metadata: ReportMetadata;
  
  // Student info
  studentId: string;
  studentName: string;
  
  // Overall statistics
  overallStats: {
    totalBadges: number;
    earnedBadges: number;
    completionPercentage: number;
    totalPoints: number;
    currentLevel: number;
    pointsToNextLevel: number;
    raresBadgesEarned: number;
    legendaryBadgesEarned: number;
    averageBadgesPerMonth: number;
  };
  
  // Badge data
  badges: BadgeData[];
  
  // Category breakdown
  categoryStats: BadgeCategoryStats[];
  
  // Achievement milestones
  milestones: AchievementMilestone[];
  
  // Earning timeline
  timeline: BadgeTimeline[];
  
  // Leaderboard positions
  leaderboard: LeaderboardPosition[];
  
  // Recommendations and next goals
  recommendations: {
    nextEasyBadges: Array<{
      badgeId: string;
      badgeName: string;
      progressPercentage: number;
      estimatedDays: number;
      actionRequired: string;
    }>;
    streakOpportunities: Array<{
      type: string;
      currentStreak: number;
      nextBadgeAt: number;
      daysToNext: number;
    }>;
    performanceGoals: Array<{
      area: string;
      currentScore: number;
      targetScore: number;
      badgeReward: string;
    }>;
  };
  
  // Achievements showcase
  showcase: {
    featuredBadge?: BadgeData;
    recentEarnings: BadgeData[];
    rareCollections: Array<{
      collectionName: string;
      badges: BadgeData[];
      completionPercentage: number;
    }>;
  };
  
  // Gamification elements
  gamification: {
    currentTitle: string;
    availableTitles: string[];
    experiencePoints: number;
    level: number;
    levelProgress: number;
    specialAbilities: string[];
    unlockableContent: string[];
  };
  
  // Filter applied
  filtersApplied: {
    badgeCategory?: string;
    earnedOnly: boolean;
    dateRange?: {
      from: Date;
      to: Date;
    };
    sortBy: string;
    sortOrder: string;
    includeProgress: boolean;
  };
}
