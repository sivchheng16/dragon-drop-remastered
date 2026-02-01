// Achievement System for Dragon Drop

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji or icon identifier
    unlocked: boolean;
    unlockedAt?: number; // Timestamp
    progress?: number; // For progressive achievements (0-100)
    target?: number; // Target value for progressive achievements
}

export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    checkCondition: (stats: PlayerStats) => boolean;
    isProgressive?: boolean;
    target?: number;
    getProgress?: (stats: PlayerStats) => number;
}

export interface PlayerStats {
    levelsCompleted: number;
    totalStars: number;
    perfectLevels: number; // 3-star completions
    totalDeaths: number;
    fastestTime: number;
    worldsCompleted: number[];
    consecutiveWins: number;
    buttonsPressed: number;
    gatesOpened: number;
}

const STORAGE_KEY = 'dragon_drop_achievements_v1';

export class AchievementManager {
    private static instance: AchievementManager;
    private achievements: Map<string, Achievement> = new Map();
    private stats: PlayerStats;
    private listeners: ((achievement: Achievement) => void)[] = [];

    private constructor() {
        this.stats = this.loadStats();
        this.initializeAchievements();
        this.loadProgress();
    }

    public static getInstance(): AchievementManager {
        if (!AchievementManager.instance) {
            AchievementManager.instance = new AchievementManager();
        }
        return AchievementManager.instance;
    }

    private initializeAchievements() {
        const definitions: AchievementDefinition[] = [
            // Beginner Achievements
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first level',
                icon: '👣',
                checkCondition: (stats) => stats.levelsCompleted >= 1
            },
            {
                id: 'getting_started',
                name: 'Getting Started',
                description: 'Complete 5 levels',
                icon: '🎯',
                checkCondition: (stats) => stats.levelsCompleted >= 5
            },
            {
                id: 'dedicated',
                name: 'Dedicated Player',
                description: 'Complete 20 levels',
                icon: '🏆',
                checkCondition: (stats) => stats.levelsCompleted >= 20
            },

            // World Completion
            {
                id: 'meadow_master',
                name: 'Meadow Master',
                description: 'Complete all Meadow levels (1-20)',
                icon: '🌿',
                checkCondition: (stats) => stats.worldsCompleted.includes(1)
            },
            {
                id: 'castle_conqueror',
                name: 'Castle Conqueror',
                description: 'Complete all Castle levels (21-40)',
                icon: '🏰',
                checkCondition: (stats) => stats.worldsCompleted.includes(2)
            },
            {
                id: 'world_traveler',
                name: 'World Traveler',
                description: 'Complete all 5 worlds',
                icon: '🌍',
                checkCondition: (stats) => stats.worldsCompleted.length >= 5
            },

            // Perfection
            {
                id: 'perfectionist',
                name: 'Perfectionist',
                description: 'Get 3 stars on 10 levels',
                icon: '⭐',
                checkCondition: (stats) => stats.perfectLevels >= 10
            },
            {
                id: 'flawless',
                name: 'Flawless Victory',
                description: 'Complete a level without dying',
                icon: '💎',
                checkCondition: (stats) => stats.consecutiveWins >= 1
            },

            // Speed
            {
                id: 'speedrunner',
                name: 'Speedrunner',
                description: 'Complete any level in under 10 seconds',
                icon: '⚡',
                checkCondition: (stats) => stats.fastestTime > 0 && stats.fastestTime <= 10
            },

            // Exploration
            {
                id: 'button_masher',
                name: 'Button Masher',
                description: 'Press 50 buttons',
                icon: '🔘',
                checkCondition: (stats) => stats.buttonsPressed >= 50,
                isProgressive: true,
                target: 50,
                getProgress: (stats) => stats.buttonsPressed
            },
            {
                id: 'gate_keeper',
                name: 'Gate Keeper',
                description: 'Open 100 gates',
                icon: '🚪',
                checkCondition: (stats) => stats.gatesOpened >= 100,
                isProgressive: true,
                target: 100,
                getProgress: (stats) => stats.gatesOpened
            },

            // Challenge
            {
                id: 'survivor',
                name: 'Survivor',
                description: 'Complete 5 levels in a row without dying',
                icon: '🛡️',
                checkCondition: (stats) => stats.consecutiveWins >= 5
            },

            // Completion
            {
                id: 'completionist',
                name: 'Completionist',
                description: 'Complete all 100 levels',
                icon: '🎊',
                checkCondition: (stats) => stats.levelsCompleted >= 100
            },
            {
                id: 'master_dragon',
                name: 'Master Dragon',
                description: 'Get 3 stars on all 100 levels',
                icon: '🐉',
                checkCondition: (stats) => stats.perfectLevels >= 100
            }
        ];

        // Initialize achievement objects
        definitions.forEach(def => {
            this.achievements.set(def.id, {
                id: def.id,
                name: def.name,
                description: def.description,
                icon: def.icon,
                unlocked: false,
                progress: def.isProgressive ? 0 : undefined,
                target: def.target
            });
        });
    }

    private loadStats(): PlayerStats {
        try {
            const data = localStorage.getItem(STORAGE_KEY + '_stats');
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load achievement stats', e);
        }

        return {
            levelsCompleted: 0,
            totalStars: 0,
            perfectLevels: 0,
            totalDeaths: 0,
            fastestTime: 0,
            worldsCompleted: [],
            consecutiveWins: 0,
            buttonsPressed: 0,
            gatesOpened: 0
        };
    }

    private loadProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const saved: Achievement[] = JSON.parse(data);
                saved.forEach(ach => {
                    if (this.achievements.has(ach.id)) {
                        this.achievements.set(ach.id, ach);
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load achievements', e);
        }
    }

    private save() {
        try {
            const achievements = Array.from(this.achievements.values());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
            localStorage.setItem(STORAGE_KEY + '_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Failed to save achievements', e);
        }
    }

    public updateStats(updates: Partial<PlayerStats>) {
        this.stats = { ...this.stats, ...updates };
        this.checkAchievements();
        this.save();
    }

    public incrementStat(stat: keyof PlayerStats, amount: number = 1) {
        if (typeof this.stats[stat] === 'number') {
            (this.stats[stat] as number) += amount;
            this.checkAchievements();
            this.save();
        }
    }

    private checkAchievements() {
        const definitions: AchievementDefinition[] = this.getDefinitions();

        definitions.forEach(def => {
            const achievement = this.achievements.get(def.id);
            if (!achievement || achievement.unlocked) return;

            // Update progress for progressive achievements
            if (def.isProgressive && def.getProgress) {
                const progress = def.getProgress(this.stats);
                achievement.progress = progress;
            }

            // Check if condition is met
            if (def.checkCondition(this.stats)) {
                achievement.unlocked = true;
                achievement.unlockedAt = Date.now();

                // Notify listeners
                this.listeners.forEach(callback => callback(achievement));
            }
        });
    }

    private getDefinitions(): AchievementDefinition[] {
        return [
            // Beginner Achievements
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first level',
                icon: '👣',
                checkCondition: (stats) => stats.levelsCompleted >= 1
            },
            {
                id: 'getting_started',
                name: 'Getting Started',
                description: 'Complete 5 levels',
                icon: '🎯',
                checkCondition: (stats) => stats.levelsCompleted >= 5
            },
            {
                id: 'dedicated',
                name: 'Dedicated Player',
                description: 'Complete 20 levels',
                icon: '🏆',
                checkCondition: (stats) => stats.levelsCompleted >= 20
            },

            // World Completion
            {
                id: 'meadow_master',
                name: 'Meadow Master',
                description: 'Complete all Meadow levels (1-20)',
                icon: '🌿',
                checkCondition: (stats) => stats.worldsCompleted.includes(1)
            },
            {
                id: 'castle_conqueror',
                name: 'Castle Conqueror',
                description: 'Complete all Castle levels (21-40)',
                icon: '🏰',
                checkCondition: (stats) => stats.worldsCompleted.includes(2)
            },
            {
                id: 'world_traveler',
                name: 'World Traveler',
                description: 'Complete all 5 worlds',
                icon: '🌍',
                checkCondition: (stats) => stats.worldsCompleted.length >= 5
            },

            // Perfection
            {
                id: 'perfectionist',
                name: 'Perfectionist',
                description: 'Get 3 stars on 10 levels',
                icon: '⭐',
                checkCondition: (stats) => stats.perfectLevels >= 10
            },
            {
                id: 'flawless',
                name: 'Flawless Victory',
                description: 'Complete a level without dying',
                icon: '💎',
                checkCondition: (stats) => stats.consecutiveWins >= 1
            },

            // Speed
            {
                id: 'speedrunner',
                name: 'Speedrunner',
                description: 'Complete any level in under 10 seconds',
                icon: '⚡',
                checkCondition: (stats) => stats.fastestTime > 0 && stats.fastestTime <= 10
            },

            // Exploration
            {
                id: 'button_masher',
                name: 'Button Masher',
                description: 'Press 50 buttons',
                icon: '🔘',
                checkCondition: (stats) => stats.buttonsPressed >= 50,
                isProgressive: true,
                target: 50,
                getProgress: (stats) => stats.buttonsPressed
            },
            {
                id: 'gate_keeper',
                name: 'Gate Keeper',
                description: 'Open 100 gates',
                icon: '🚪',
                checkCondition: (stats) => stats.gatesOpened >= 100,
                isProgressive: true,
                target: 100,
                getProgress: (stats) => stats.gatesOpened
            },

            // Challenge
            {
                id: 'survivor',
                name: 'Survivor',
                description: 'Complete 5 levels in a row without dying',
                icon: '🛡️',
                checkCondition: (stats) => stats.consecutiveWins >= 5
            },

            // Completion
            {
                id: 'completionist',
                name: 'Completionist',
                description: 'Complete all 100 levels',
                icon: '🎊',
                checkCondition: (stats) => stats.levelsCompleted >= 100
            },
            {
                id: 'master_dragon',
                name: 'Master Dragon',
                description: 'Get 3 stars on all 100 levels',
                icon: '🐉',
                checkCondition: (stats) => stats.perfectLevels >= 100
            }
        ];
    }

    public onAchievementUnlocked(callback: (achievement: Achievement) => void) {
        this.listeners.push(callback);
    }

    public getAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }

    public getUnlockedCount(): number {
        return Array.from(this.achievements.values()).filter(a => a.unlocked).length;
    }

    public getTotalCount(): number {
        return this.achievements.size;
    }
}
