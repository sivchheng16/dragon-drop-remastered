// Leaderboard Manager for Dragon Drop Remastered

export interface LevelRecord {
    levelId: number;
    bestTime: number;
    stars: number;
    date: string;
    playerName?: string;
}

const STORAGE_KEY = 'dragon_drop_leaderboard_v1';

export class LeaderboardManager {
    private static instance: LeaderboardManager;
    private records: Map<number, LevelRecord> = new Map();

    private constructor() {
        this.loadRecords();
    }

    public static getInstance(): LeaderboardManager {
        if (!LeaderboardManager.instance) {
            LeaderboardManager.instance = new LeaderboardManager();
        }
        return LeaderboardManager.instance;
    }

    private loadRecords() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.records = new Map(Object.entries(data).map(([k, v]) => [parseInt(k), v as LevelRecord]));
            }
        } catch (e) {
            console.error('Failed to load leaderboard', e);
        }
    }

    private saveRecords() {
        try {
            const data: Record<number, LevelRecord> = {};
            this.records.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save leaderboard', e);
        }
    }

    public submitScore(levelId: number, time: number, stars: number): boolean {
        const existing = this.records.get(levelId);

        // New record if no existing record or better time
        if (!existing || time < existing.bestTime) {
            this.records.set(levelId, {
                levelId,
                bestTime: time,
                stars,
                date: new Date().toISOString()
            });
            this.saveRecords();
            return true; // New record!
        }

        return false; // Not a new record
    }

    public getRecord(levelId: number): LevelRecord | undefined {
        return this.records.get(levelId);
    }

    public getAllRecords(): LevelRecord[] {
        return Array.from(this.records.values()).sort((a, b) => a.levelId - b.levelId);
    }

    public getTotalStars(): number {
        let total = 0;
        this.records.forEach(record => {
            total += record.stars;
        });
        return total;
    }

    public getCompletedLevels(): number {
        return this.records.size;
    }

    public resetLeaderboard() {
        this.records.clear();
        this.saveRecords();
    }
}
