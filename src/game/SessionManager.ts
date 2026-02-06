// Session Manager for Classroom Mode
// Manages temporary progress that resets when tab closes

export class SessionManager {
    private static instance: SessionManager;
    private isRefresh: boolean = false;

    private constructor() {
        this.setupCloseDetection();
    }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    /**
     * Setup detection for tab close vs refresh
     */
    private setupCloseDetection() {
        // Mark as refresh when page starts loading
        window.addEventListener('beforeunload', (e) => {
            // Set flag to detect if this is a refresh or close
            sessionStorage.setItem('isRefreshing', 'true');

            // Show confirmation dialog
            const message = 'Are you sure you want to close? Your progress will be lost!';
            e.preventDefault();
            e.returnValue = message;
            return message;
        });

        // On page load, check if it was a refresh
        window.addEventListener('load', () => {
            const wasRefreshing = sessionStorage.getItem('isRefreshing');

            if (wasRefreshing === 'true') {
                // This was a refresh, keep the data
                sessionStorage.removeItem('isRefreshing');
                this.isRefresh = true;
            } else {
                // This was a new session (tab was closed), clear all data
                this.clearAllSessionData();
            }
        });
    }

    /**
     * Clear all game data for new session
     */
    private clearAllSessionData() {
        // Clear all localStorage keys
        const keysToRemove = [
            'dragon_drop_progress_v2',
            'dragon_drop_stats_v1',
            'dragon_drop_tutorials_v1',
            'dragon_drop_tutorial_completed',
            'dragon_drop_achievements_v1',
            'dragon_drop_achievements_v1_stats',
            'dragon_drop_skins_v1',
            'dragon_drop_leaderboard_v1',
            'dragon_drop_settings_v1'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log('🎓 New classroom session started - all progress cleared');
    }

    /**
     * Check if this is a refresh (vs new session)
     */
    public isRefreshSession(): boolean {
        return this.isRefresh;
    }

    /**
     * Manually clear session (for testing)
     */
    public clearSession() {
        this.clearAllSessionData();
    }
}
