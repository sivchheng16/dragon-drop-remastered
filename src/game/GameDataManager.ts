// Game Data Manager for Dragon Drop Remastered
// Centralized utility for managing all game data across managers

import { SettingsManager } from './SettingsManager';
import { ProgressManager } from './ProgressManager';
import { AchievementManager } from './AchievementManager';
import { LeaderboardManager } from './LeaderboardManager';
import { TutorialManager } from './TutorialManager';

/**
 * GameDataManager - Utility class for centralized game data operations
 * 
 * This class provides high-level operations that affect multiple managers,
 * such as resetting all game data at once.
 */
export class GameDataManager {
    /**
     * Reset ALL game data to defaults
     * This includes:
     * - Settings (accessibility, audio)
     * - Progress (levels, deaths, coins, gems)
     * - Achievements
     * - Leaderboards
     * - Tutorials
     * 
     * Note: Skins are not reset as they are unlocked through achievements
     * 
     * WARNING: This action cannot be undone!
     */
    public static resetAllData(): void {
        try {
            // Reset all managers to their default states
            SettingsManager.getInstance().resetToDefaults();
            ProgressManager.getInstance().resetProgress();
            LeaderboardManager.getInstance().resetLeaderboard();
            TutorialManager.getInstance().resetTutorials();

            // Clear localStorage for managers that don't have reset methods
            localStorage.removeItem('dragon_drop_achievements_v1');
            localStorage.removeItem('dragon_drop_achievements_v1_stats');
            localStorage.removeItem('dragon_drop_skins_v1');

            // Clear tutorial completion flag so "HOW TO PLAY" modal shows again
            localStorage.removeItem('dragon_drop_tutorial_completed');

            // Clear unlocked levels so only Level 1 remains available
            localStorage.removeItem('dragon_drop_completed_levels');

            console.log('✅ All game data has been reset to defaults');
        } catch (error) {
            console.error('❌ Error resetting game data:', error);
            throw error;
        }
    }

    /**
     * Get a summary of all game statistics
     * Useful for displaying in UI or debugging
     */
    public static getGameStatistics() {
        const progressManager = ProgressManager.getInstance();
        const achievementManager = AchievementManager.getInstance();
        const leaderboardManager = LeaderboardManager.getInstance();
        const settingsManager = SettingsManager.getInstance();

        return {
            progress: {
                levelsCompleted: leaderboardManager.getCompletedLevels(),
                totalStars: leaderboardManager.getTotalStars(),
                totalDeaths: progressManager.getTotalDeaths(),
                totalCoins: progressManager.getTotalCoins(),
                totalGems: progressManager.getTotalGems()
            },
            achievements: {
                unlocked: achievementManager.getUnlockedCount(),
                total: 14 // Total number of achievements
            },
            settings: settingsManager.getSettings()
        };
    }

    /**
     * Export all game data as JSON
     * Useful for backup or sharing progress
     */
    public static exportGameData(): string {
        const data = {
            settings: SettingsManager.getInstance().getSettings(),
            progress: Array.from(ProgressManager.getInstance().getAllProgress().entries()),
            leaderboard: LeaderboardManager.getInstance().getAllRecords(),
            timestamp: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Check if any game data exists
     * Returns true if the player has made any progress
     */
    public static hasGameData(): boolean {
        const leaderboardManager = LeaderboardManager.getInstance();
        const achievementManager = AchievementManager.getInstance();

        return (
            leaderboardManager.getCompletedLevels() > 0 ||
            achievementManager.getUnlockedCount() > 0
        );
    }
}
