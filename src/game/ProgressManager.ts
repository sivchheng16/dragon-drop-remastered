// Progress Manager for Dragon Drop Remastered
// Tracks level completion, stars, deaths, and hints

export interface LevelProgress {
    completed: boolean;
    stars: number;
    bestTime: number;
    deaths: number; // Track deaths per level
    skipped: boolean; // Track if level was skipped
}

const STORAGE_KEY = 'dragon_drop_progress_v2';
const STATS_KEY = 'dragon_drop_stats_v1';

export class ProgressManager {
    private static instance: ProgressManager;
    private progress: Map<number, LevelProgress> = new Map();
    private totalDeaths: number = 0;
    private totalCoins: number = 0;
    private totalGems: number = 0;
    private totalHearts: number = 0;

    private constructor() {
        this.loadProgress();
    }

    public static getInstance(): ProgressManager {
        if (!ProgressManager.instance) {
            ProgressManager.instance = new ProgressManager();
        }
        return ProgressManager.instance;
    }

    private loadProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.progress = new Map(Object.entries(data).map(([k, v]) => [parseInt(k), v as LevelProgress]));
            }

            const stats = localStorage.getItem(STATS_KEY);
            if (stats) {
                const data = JSON.parse(stats);
                this.totalDeaths = data.totalDeaths || 0;
                this.totalCoins = data.totalCoins || 0;
                this.totalGems = data.totalGems || 0;
                this.totalHearts = data.totalHearts || 0;
            }
        } catch (e) {
            console.error('Failed to load progress', e);
        }
    }

    private saveProgress() {
        try {
            const data: Record<number, LevelProgress> = {};
            this.progress.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            // Save stats
            localStorage.setItem(STATS_KEY, JSON.stringify({
                totalDeaths: this.totalDeaths,
                totalCoins: this.totalCoins,
                totalGems: this.totalGems,
                totalHearts: this.totalHearts
            }));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    }

    public completeLevel(levelId: number, stars: number, time: number) {
        const existing = this.progress.get(levelId);

        this.progress.set(levelId, {
            completed: true,
            stars: Math.max(stars, existing?.stars || 0),
            bestTime: existing ? Math.min(time, existing.bestTime) : time,
            deaths: existing?.deaths || 0,
            skipped: false
        });

        this.saveProgress();
    }

    public recordDeath(levelId: number): boolean {
        const existing = this.progress.get(levelId) || {
            completed: false,
            stars: 0,
            bestTime: 0,
            deaths: 0,
            skipped: false
        };

        existing.deaths += 1;
        this.totalDeaths += 1;
        this.progress.set(levelId, existing);
        this.saveProgress();

        // Return true if skip is now available (5+ deaths)
        return existing.deaths >= 5;
    }

    public getDeathCount(levelId: number): number {
        return this.progress.get(levelId)?.deaths || 0;
    }

    public shouldShowHint(levelId: number): boolean {
        const deaths = this.getDeathCount(levelId);
        return deaths >= 3 && deaths % 3 === 0; // Show hint every 3 deaths after first 3
    }

    public skipLevel(levelId: number) {
        this.progress.set(levelId, {
            completed: false,
            stars: 0,
            bestTime: 0,
            deaths: this.progress.get(levelId)?.deaths || 0,
            skipped: true
        });
        this.saveProgress();
    }

    public getLevelProgress(levelId: number): LevelProgress | undefined {
        return this.progress.get(levelId);
    }

    public isLevelCompleted(levelId: number): boolean {
        return this.progress.get(levelId)?.completed || false;
    }

    public isLevelSkipped(levelId: number): boolean {
        return this.progress.get(levelId)?.skipped || false;
    }

    public getTotalDeaths(): number {
        return this.totalDeaths;
    }

    public addCoins(count: number) {
        this.totalCoins += count;
        this.saveProgress();
    }

    public addGems(count: number) {
        this.totalGems += count;
        this.saveProgress();
    }

    public addHearts(count: number) {
        this.totalHearts += count;
        this.saveProgress();
    }

    public getTotalCoins(): number {
        return this.totalCoins;
    }

    public getTotalGems(): number {
        return this.totalGems;
    }

    public getTotalHearts(): number {
        return this.totalHearts;
    }

    public getAllProgress(): Map<number, LevelProgress> {
        return new Map(this.progress);
    }

    public resetProgress() {
        this.progress.clear();
        this.totalDeaths = 0;
        this.totalCoins = 0;
        this.totalGems = 0;
        this.totalHearts = 0;
        this.saveProgress();
    }
}
