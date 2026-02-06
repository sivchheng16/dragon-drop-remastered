// Daily Challenge Manager for Dragon Drop Remastered

import { LevelData } from './levels';

export interface DailyChallenge {
    date: string;
    seed: number;
    levelConfig: Partial<LevelData>;
    completed: boolean;
    reward: number;
    bestTime?: number;
}

const STORAGE_KEY = 'dragon_drop_daily_challenge_v1';

export class DailyChallengeManager {
    private static instance: DailyChallengeManager;
    private currentChallenge: DailyChallenge | null = null;

    private constructor() {
        this.loadChallenge();
    }

    public static getInstance(): DailyChallengeManager {
        if (!DailyChallengeManager.instance) {
            DailyChallengeManager.instance = new DailyChallengeManager();
        }
        return DailyChallengeManager.instance;
    }

    private getTodayString(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    private generateSeed(dateString: string): number {
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            const char = dateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    private seededRandom(seed: number): () => number {
        let state = seed;
        return () => {
            state = (state * 1664525 + 1013904223) % 4294967296;
            return state / 4294967296;
        };
    }

    private generateChallenge(dateString: string): DailyChallenge {
        const seed = this.generateSeed(dateString);
        const random = this.seededRandom(seed);

        // Generate a procedural challenge level
        const challenge: DailyChallenge = {
            date: dateString,
            seed,
            completed: false,
            reward: 100, // Bonus coins
            levelConfig: {
                id: 999, // Special daily challenge ID
                theme: ['meadow', 'castle', 'volcano', 'sky', 'dungeon'][Math.floor(random() * 5)] as any,
                start: { x: 100, y: 500 },
                goal: { x: 900, y: 500 },
                walls: [],
                timeLimit: 60 + Math.floor(random() * 60), // 60-120 seconds
                // Add random obstacles based on seed
                collectibles: []
            }
        };

        // Add random collectibles
        for (let i = 0; i < 5; i++) {
            const rand = random();
            let type: 'coin' | 'gem' | 'shield' | 'slow_mo' | 'time_freeze' = 'coin';

            if (rand > 0.95) type = 'shield';
            else if (rand > 0.9) type = 'time_freeze';
            else if (rand > 0.85) type = 'slow_mo';
            else if (rand > 0.6) type = 'gem';

            challenge.levelConfig.collectibles?.push({
                x: 200 + Math.floor(random() * 600),
                y: 200 + Math.floor(random() * 600),
                type
            });
        }

        return challenge;
    }

    private loadChallenge() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.currentChallenge = JSON.parse(saved);

                // Check if challenge is from today
                const today = this.getTodayString();
                if (this.currentChallenge && this.currentChallenge.date !== today) {
                    // Generate new challenge for today
                    this.currentChallenge = this.generateChallenge(today);
                    this.saveChallenge();
                }
            } else {
                // Generate first challenge
                this.currentChallenge = this.generateChallenge(this.getTodayString());
                this.saveChallenge();
            }
        } catch (e) {
            console.error('Failed to load daily challenge', e);
            this.currentChallenge = this.generateChallenge(this.getTodayString());
        }
    }

    private saveChallenge() {
        try {
            if (this.currentChallenge) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentChallenge));
            }
        } catch (e) {
            console.error('Failed to save daily challenge', e);
        }
    }

    public getTodayChallenge(): DailyChallenge | null {
        return this.currentChallenge;
    }

    public completeChallenge(time: number): number {
        if (this.currentChallenge && !this.currentChallenge.completed) {
            this.currentChallenge.completed = true;
            this.currentChallenge.bestTime = time;
            this.saveChallenge();
            return this.currentChallenge.reward;
        }
        return 0;
    }

    public isChallengeCompleted(): boolean {
        return this.currentChallenge?.completed || false;
    }
}
