// Skin System for Dragon Drop

export interface DragonSkin {
    id: string;
    name: string;
    description: string;
    color: string; // Primary color for the dragon
    unlocked: boolean;
    unlockCondition: string; // Description of how to unlock
    checkUnlock: (stats: any) => boolean; // Function to check if unlocked
}

const STORAGE_KEY = 'dragon_drop_skins_v1';

export class SkinManager {
    private static instance: SkinManager;
    private skins: Map<string, DragonSkin> = new Map();
    private selectedSkinId: string = 'default';

    private constructor() {
        this.initializeSkins();
        this.loadProgress();
    }

    public static getInstance(): SkinManager {
        if (!SkinManager.instance) {
            SkinManager.instance = new SkinManager();
        }
        return SkinManager.instance;
    }

    private initializeSkins() {
        const skinDefinitions: DragonSkin[] = [
            {
                id: 'default',
                name: 'Classic Dragon',
                description: 'The original dragon',
                color: '#4CAF50', // Green
                unlocked: true,
                unlockCondition: 'Available from start',
                checkUnlock: () => true
            },
            {
                id: 'golden',
                name: 'Golden Dragon',
                description: 'A majestic golden dragon',
                color: '#FFD700', // Gold
                unlocked: false,
                unlockCondition: 'Complete 20 levels',
                checkUnlock: (stats) => stats.levelsCompleted >= 20
            },
            {
                id: 'ruby',
                name: 'Ruby Dragon',
                description: 'A fiery red dragon',
                color: '#E74C3C', // Red
                unlocked: false,
                unlockCondition: 'Get 3 stars on 10 levels',
                checkUnlock: (stats) => stats.perfectLevels >= 10
            },
            {
                id: 'sapphire',
                name: 'Sapphire Dragon',
                description: 'A cool blue dragon',
                color: '#3498DB', // Blue
                unlocked: false,
                unlockCondition: 'Complete all Meadow levels (1-20)',
                checkUnlock: (stats) => stats.worldsCompleted?.includes(1)
            },
            {
                id: 'emerald',
                name: 'Emerald Dragon',
                description: 'A vibrant green dragon',
                color: '#2ECC71', // Bright Green
                unlocked: false,
                unlockCondition: 'Complete all Castle levels (21-40)',
                checkUnlock: (stats) => stats.worldsCompleted?.includes(2)
            },
            {
                id: 'amethyst',
                name: 'Amethyst Dragon',
                description: 'A mystical purple dragon',
                color: '#9B59B6', // Purple
                unlocked: false,
                unlockCondition: 'Complete 50 levels',
                checkUnlock: (stats) => stats.levelsCompleted >= 50
            },
            {
                id: 'shadow',
                name: 'Shadow Dragon',
                description: 'A mysterious dark dragon',
                color: '#34495E', // Dark Gray
                unlocked: false,
                unlockCondition: 'Complete 5 levels in a row without dying',
                checkUnlock: (stats) => stats.consecutiveWins >= 5
            },
            {
                id: 'rainbow',
                name: 'Rainbow Dragon',
                description: 'A colorful legendary dragon',
                color: '#FF69B4', // Pink (will use gradient)
                unlocked: false,
                unlockCondition: 'Unlock all other skins',
                checkUnlock: (stats) => {
                    // Check if all other skins are unlocked
                    const skinManager = SkinManager.getInstance();
                    const allSkins = skinManager.getSkins();
                    const otherSkins = allSkins.filter(s => s.id !== 'rainbow' && s.id !== 'default');
                    return otherSkins.every(s => s.unlocked);
                }
            },
            {
                id: 'crystal',
                name: 'Crystal Dragon',
                description: 'A transparent crystalline dragon',
                color: '#ECF0F1', // Light Gray/White
                unlocked: false,
                unlockCondition: 'Complete all 100 levels',
                checkUnlock: (stats) => stats.levelsCompleted >= 100
            }
        ];

        skinDefinitions.forEach(skin => {
            this.skins.set(skin.id, skin);
        });
    }

    private loadProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const saved = JSON.parse(data);
                this.selectedSkinId = saved.selectedSkinId || 'default';

                // Update unlock status
                if (saved.unlockedSkins) {
                    saved.unlockedSkins.forEach((skinId: string) => {
                        const skin = this.skins.get(skinId);
                        if (skin) {
                            skin.unlocked = true;
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load skin progress', e);
        }
    }

    private save() {
        try {
            const unlockedSkins = Array.from(this.skins.values())
                .filter(s => s.unlocked)
                .map(s => s.id);

            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                selectedSkinId: this.selectedSkinId,
                unlockedSkins
            }));
        } catch (e) {
            console.error('Failed to save skin progress', e);
        }
    }

    public checkUnlocks(stats: any) {
        let newUnlocks = false;
        this.skins.forEach(skin => {
            if (!skin.unlocked && skin.checkUnlock(stats)) {
                skin.unlocked = true;
                newUnlocks = true;
            }
        });

        if (newUnlocks) {
            this.save();
        }
    }

    public selectSkin(skinId: string) {
        const skin = this.skins.get(skinId);
        if (skin && skin.unlocked) {
            this.selectedSkinId = skinId;
            this.save();
            return true;
        }
        return false;
    }

    public getSelectedSkin(): DragonSkin {
        return this.skins.get(this.selectedSkinId) || this.skins.get('default')!;
    }

    public getSkinForLevel(levelId: number): string {
        // Tutorial (Levels 1-5): Green (Default)
        if (levelId <= 5) return 'default';

        // Chapter 1: Meadow (Levels 6-20): Orange / Golden
        if (levelId <= 20) return 'golden';

        // Chapter 2: Castle (Levels 21-40): Red / Ruby
        if (levelId <= 40) return 'ruby';

        // Chapter 3: Sky (Levels 41-60): Purple / Amethyst
        if (levelId <= 60) return 'amethyst';

        // Chapter 4: Hallow/Lava (Levels 61+): Gray / Shadow
        return 'shadow';
    }

    public getSkins(): DragonSkin[] {
        return Array.from(this.skins.values());
    }

    public getUnlockedCount(): number {
        return Array.from(this.skins.values()).filter(s => s.unlocked).length;
    }

    public getTotalCount(): number {
        return this.skins.size;
    }
}
