// Tutorial Manager for Dragon Drop Remastered

export interface Tutorial {
    id: string;
    title: string;
    message: string;
    triggerLevel?: number; // Show on specific level
    triggerMechanic?: 'gates' | 'buttons' | 'moving_walls' | 'hazards' | 'enemies' | 'crumbling_floors';
}

const STORAGE_KEY = 'dragon_drop_tutorials_v1';

export class TutorialManager {
    private static instance: TutorialManager;
    private completedTutorials: Set<string> = new Set();

    private tutorials: Tutorial[] = [
        {
            id: 'basic_movement',
            title: 'Welcome to Dragon Drop!',
            message: 'Drag the dragon to the food to complete each level. Avoid walls and obstacles!',
            triggerLevel: 1
        },
        {
            id: 'gates_intro',
            title: 'Gates & Buttons',
            message: 'Step on buttons to open gates. Some gates stay open, others close after you leave the button!',
            triggerMechanic: 'gates'
        },
        {
            id: 'moving_walls',
            title: 'Moving Obstacles',
            message: 'Watch out for moving walls! Time your movements carefully to avoid getting crushed.',
            triggerMechanic: 'moving_walls'
        },
        {
            id: 'hazards',
            title: 'Danger Zones',
            message: 'Red hazards will hurt you! Avoid them or lose a life.',
            triggerMechanic: 'hazards'
        },
        {
            id: 'crumbling_floors',
            title: 'Crumbling Floors',
            message: 'Some floors crumble after you step on them. Move quickly!',
            triggerMechanic: 'crumbling_floors'
        },
        {
            id: 'enemies',
            title: 'Enemies Ahead!',
            message: 'Enemies patrol their paths. Avoid them or time your movement to slip past!',
            triggerMechanic: 'enemies'
        },
        {
            id: 'time_limit',
            title: 'Beat the Clock',
            message: 'Complete levels quickly to earn more stars! 3 stars for fast times, 1 star for completion.',
            triggerLevel: 5
        },
        {
            id: 'collectibles',
            title: 'Collect Coins & Gems',
            message: 'Grab coins and gems for extra points! They don\'t affect level completion, but they\'re fun to collect.',
            triggerLevel: 1
        }
    ];

    private constructor() {
        this.loadProgress();
    }

    public static getInstance(): TutorialManager {
        if (!TutorialManager.instance) {
            TutorialManager.instance = new TutorialManager();
        }
        return TutorialManager.instance;
    }

    private loadProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.completedTutorials = new Set(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load tutorial progress', e);
        }
    }

    private saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.completedTutorials)));
        } catch (e) {
            console.error('Failed to save tutorial progress', e);
        }
    }

    public getTutorialForLevel(levelId: number, level: any): Tutorial | null {
        // Check for level-specific tutorials
        for (const tutorial of this.tutorials) {
            if (tutorial.triggerLevel === levelId && !this.completedTutorials.has(tutorial.id)) {
                return tutorial;
            }
        }

        // Check for mechanic-specific tutorials
        if (level.gates && level.gates.length > 0) {
            const tutorial = this.tutorials.find(t => t.triggerMechanic === 'gates');
            if (tutorial && !this.completedTutorials.has(tutorial.id)) {
                return tutorial;
            }
        }

        if (level.movingWalls && level.movingWalls.length > 0) {
            const tutorial = this.tutorials.find(t => t.triggerMechanic === 'moving_walls');
            if (tutorial && !this.completedTutorials.has(tutorial.id)) {
                return tutorial;
            }
        }

        if (level.hazards && level.hazards.length > 0) {
            const tutorial = this.tutorials.find(t => t.triggerMechanic === 'hazards');
            if (tutorial && !this.completedTutorials.has(tutorial.id)) {
                return tutorial;
            }
        }

        if (level.crumblingFloors && level.crumblingFloors.length > 0) {
            const tutorial = this.tutorials.find(t => t.triggerMechanic === 'crumbling_floors');
            if (tutorial && !this.completedTutorials.has(tutorial.id)) {
                return tutorial;
            }
        }

        if (level.enemies && level.enemies.length > 0) {
            const tutorial = this.tutorials.find(t => t.triggerMechanic === 'enemies');
            if (tutorial && !this.completedTutorials.has(tutorial.id)) {
                return tutorial;
            }
        }

        return null;
    }

    public completeTutorial(tutorialId: string) {
        this.completedTutorials.add(tutorialId);
        this.saveProgress();
    }

    public resetTutorials() {
        this.completedTutorials.clear();
        this.saveProgress();
    }

    public isTutorialCompleted(tutorialId: string): boolean {
        return this.completedTutorials.has(tutorialId);
    }
}
