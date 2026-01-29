export interface LevelProgress {
    levelId: number;
    stars: number; // 0, 1, 2, 3
    highScore: number;
    unlocked: boolean;
}

export interface PlayerProgress {
    levels: Record<number, LevelProgress>;
    totalStars: number;
    currentLevelId: number;
}

const STORAGE_KEY = 'dragon_drop_progress_v1';

export class ProgressManager {
    private static instance: ProgressManager;
    private progress: PlayerProgress;

    private constructor() {
        this.progress = this.load();
    }

    public static getInstance(): ProgressManager {
        if (!ProgressManager.instance) {
            ProgressManager.instance = new ProgressManager();
        }
        return ProgressManager.instance;
    }

    private load(): PlayerProgress {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load progress', e);
        }

        // Default state
        return {
            levels: {
                1: { levelId: 1, stars: 0, highScore: 0, unlocked: true }
            },
            totalStars: 0,
            currentLevelId: 1
        };
    }

    public save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    }

    public completeLevel(levelId: number, score: number, stars: number) {
        if (!this.progress.levels[levelId]) {
            this.progress.levels[levelId] = { levelId, stars: 0, highScore: 0, unlocked: true };
        }

        const levelStats = this.progress.levels[levelId];

        // Update high score/stars only if better
        if (score > levelStats.highScore) levelStats.highScore = score;
        if (stars > levelStats.stars) levelStats.stars = stars;

        this.progress.currentLevelId = levelId;

        // Unlock next level
        const nextLevelId = levelId + 1;
        if (!this.progress.levels[nextLevelId]) {
            this.progress.levels[nextLevelId] = {
                levelId: nextLevelId,
                stars: 0,
                highScore: 0,
                unlocked: true
            };
        }

        this.recalculateTotalStars();
        this.save();
    }

    private recalculateTotalStars() {
        this.progress.totalStars = Object.values(this.progress.levels).reduce((acc, lvl) => acc + lvl.stars, 0);
    }

    public getLevelProgress(levelId: number): LevelProgress | null {
        return this.progress.levels[levelId] || null;
    }

    public isLevelUnlocked(levelId: number): boolean {
        // Level 1 always unlocked
        if (levelId === 1) return true;
        return !!this.progress.levels[levelId]?.unlocked;
    }

    public resetProgress() {
        localStorage.removeItem(STORAGE_KEY);
        this.progress = this.load();
    }
}
