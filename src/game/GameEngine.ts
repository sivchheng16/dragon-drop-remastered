import { LevelData, Portal } from './levels';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';
import { ProgressManager } from './ProgressManager';
import { LeaderboardManager } from './LeaderboardManager';
import { AchievementManager } from './AchievementManager';
import { SkinManager } from './SkinManager';
import { AssetLoader } from './AssetLoader';
import { SettingsManager } from './SettingsManager';

export type GameStatus = 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'WON' | 'GAME_OVER';

export interface Point {
    x: number;
    y: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Gate {
    id: string; // Changed to string
    x: number;
    y: number;
    w: number;
    h: number;
    isOpen: boolean;
}

export interface Button {
    id?: string; // Optional or generated
    x: number;
    y: number;
    targetGateId: string;
    isPressed: boolean;
    timer?: number; // Optional: If set, gate stays open for this many seconds
    timerStartTime?: number; // Track when timer started
}

export interface MovingEntity {
    x: number;
    y: number;
    w: number;
    h: number;
    currentPos: Point;
    startTime: number;
    duration: number;
    path: Point[];
    type?: 'patrol' | 'chase' | 'bug'; // Optional type for enemies
    velocity?: { x: number, y: number }; // Added for physics-based movement
}

export interface CrumblingFloor {
    id: string; // Add ID as it is in levels.ts
    x: number;
    y: number;
    w: number;
    h: number;
    duration: number;
    triggeredAt: number | null;
    isCrumbled: boolean;
}

export interface GameState {
    status: GameStatus;
    score: number;
    lives: number;
    currentLevelIdx: number;
    timeLeft: number;
    stars: number; // Stars derived from current run
    gates: Gate[];
    buttons: Button[];
    movingWalls: MovingEntity[];
    crumblingFloors: CrumblingFloor[];
    enemies: MovingEntity[];
    movingGoal?: {
        currentPos: Point;
        startTime: number;
        duration: number;
        path: Point[];
    };
    activePowerUps: { type: 'shield' | 'slow_mo' | 'time_freeze'; timeLeft: number }[];
    combo: { count: number; timer: number; multiplier: number };
    collectibles: { x: number; y: number; type: 'coin' | 'gem' | 'shield' | 'slow_mo' | 'time_freeze' | 'heart'; collected: boolean }[];
    coinsCollected: number; // Total coins collected this level
    gemsCollected: number; // Total gems collected this level
}

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private level: LevelData;
    private state: GameState;

    // Physics
    private dragonPos = { x: 0, y: 0 };
    private facing: 'left' | 'right' = 'right';
    private isDragging = false;
    private dragOffset = { x: 0, y: 0 };
    private lastPortalTime = 0;

    // Systems
    private particleSystem = new ParticleSystem();
    private shake = 0;
    private animationFrameId: number | null = null;
    private crashTime: number = 0; // Track when crash occurred
    private gameTime: number = 0; // Virtual game time for slow motion
    private lastFrameTime: number = 0; // Track real time for delta
    private isCrashed: boolean = false; // Flag for crash state
    private hasMoved: boolean = false; // Flag to track if dragon has been moved from start
    private activeKeys: Set<string> = new Set();
    private velocity: { x: number, y: number } = { x: 0, y: 0 };
    private friction: number = 0.9;
    private acceleration: number = 2;
    private maxSpeed: number = 15;

    // Assets
    private assets = {
        dragon: new Image(),
        wall: new Image(),
        food: new Image(),
        sky: new Image(),
        grass: new Image(),
        stoneFloor: new Image(),
        stoneWall: new Image(),
        cloud: new Image(),
        lava: new Image(),
        obsidianFloor: new Image(),
        obsidianWall: new Image(),
        crackedFloor: new Image(),
        goldFloor: new Image(),
        knight: new Image(),
        wings: new Image(),
    };
    private patterns: { wall: CanvasPattern | null, sky: CanvasPattern | null, grass: CanvasPattern | null, stoneFloor: CanvasPattern | null, stoneWall: CanvasPattern | null, obsidianFloor: CanvasPattern | null, obsidianWall: CanvasPattern | null, lava: CanvasPattern | null, goldFloor: CanvasPattern | null } = { wall: null, sky: null, grass: null, stoneFloor: null, stoneWall: null, obsidianFloor: null, obsidianWall: null, lava: null, goldFloor: null };
    private onStateChange: (s: GameState) => void;
    private rect: DOMRect;
    private currentPortalId: string | null = null;

    constructor(canvas: HTMLCanvasElement, level: LevelData, state: GameState, onStateChange: (s: GameState) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.level = level;
        this.state = state;

        this.rect = this.canvas.getBoundingClientRect();

        // Initialize runtime state for interactive elements
        // Initialize runtime state for interactive elements
        // Always initialize when GameEngine is created (level start)
        const isHardMode = level.id > 20;
        const speedMult = isHardMode ? 1.5 : 1; // 50% faster enemies/walls
        const timeMult = isHardMode ? 0.75 : 1; // 25% less time

        if (isHardMode) {
            console.log(`[GameEngine] Hard Mode Active: x${speedMult} Speed, x${timeMult} Time`);
            // Adjust time limit if it's the initial full time
            if (Math.abs(this.state.timeLeft - level.timeLimit) < 1) {
                this.state.timeLeft = Math.floor(this.state.timeLeft * timeMult);
            }
        }

        this.state.gates = level.gates ? level.gates.map(g => ({ ...g, isOpen: false })) : [];
        this.state.buttons = level.buttons ? level.buttons.map((b, i) => ({ ...b, id: `btn_${i}`, isPressed: false })) : [];
        this.state.movingWalls = level.movingWalls ? level.movingWalls.map(m => ({
            ...m,
            currentPos: { x: m.x, y: m.y },
            startTime: Date.now(),
            duration: m.duration / speedMult // Faster speed = Lower duration
        })) : [];
        this.state.crumblingFloors = level.crumblingFloors ? level.crumblingFloors.map(c => ({
            ...c,
            triggeredAt: null,
            isCrumbled: false
        })) : [];
        this.state.enemies = level.enemies ? level.enemies.map(e => ({
            ...e,
            currentPos: { x: e.x, y: e.y },
            startTime: Date.now(),
            duration: e.duration / speedMult // Faster speed = Lower duration
        })) : [];

        // --- PROC-GEN BUGS ---
        // Ensure at least 5 bugs exist in every level (Levels 41-100 only)
        if (this.level.id >= 41 && this.level.id <= 100) {
            const BUG_COUNT_TARGET = 5;
            const currentBugs = this.state.enemies.filter(e => e.type === 'bug').length;
            if (currentBugs < BUG_COUNT_TARGET) {
                const bugsNeeded = BUG_COUNT_TARGET - currentBugs;
                for (let i = 0; i < bugsNeeded; i++) {
                    // Find valid spawn
                    let attempts = 0;
                    let valid = false;
                    let bx = 0, by = 0;
                    while (!valid && attempts < 50) {
                        bx = 50 + Math.random() * 900;
                        by = 50 + Math.random() * 900;
                        // Simple check against walls
                        if (this.isValidSpawnPosition(bx, by, 40)) {
                            valid = true;
                        }
                        attempts++;
                    }

                    if (valid) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 2; // Random speed 2-4
                        this.state.enemies.push({
                            x: bx, y: by, w: 40, h: 40,
                            currentPos: { x: bx, y: by },
                            startTime: Date.now(),
                            duration: 0,
                            path: [],
                            type: 'bug',
                            velocity: {
                                x: Math.cos(angle) * speed,
                                y: Math.sin(angle) * speed
                            }
                        });
                    }
                }
            }
        }
        this.state.movingGoal = level.movingGoal ? {
            ...level.movingGoal,
            currentPos: { x: level.goal.x, y: level.goal.y }, // Start at goal pos
            startTime: Date.now()
        } : undefined;

        // Initialize new state if missing
        if (!this.state.combo) this.state.combo = { count: 0, timer: 0, multiplier: 1 };

        this.onStateChange = onStateChange;
        this.dragonPos = { ...level.start };

        // Set theme music
        AudioManager.getInstance().playThemeMusic(level.theme || 'meadow');

        this.initAssets();
        this.bindEvents();

        // Spawn random collectibles if this is a fresh level start
        if (!this.state.collectibles.some(c => c.type === 'heart')) {
            this.spawnRandomCollectibles();
        }

        this.tick();
    }

    private spawnRandomCollectibles() {
        const bounds = { x: 50, y: 50, w: 900, h: 900 }; // Safe area inside walls
        const minDist = 100; // Min distance from other objects

        const addRandomItem = (type: 'heart' | 'gem' | 'coin') => {
            let attempts = 0;
            while (attempts < 50) {
                const x = bounds.x + Math.random() * bounds.w;
                const y = bounds.y + Math.random() * bounds.h;

                // Validate position
                if (this.isValidSpawnPosition(x, y, minDist)) {
                    this.state.collectibles.push({
                        x, y, type, collected: false
                    });
                    break;
                }
                attempts++;
            }
        };

        // Add 1 Heart
        addRandomItem('heart');

        // Add 3 Gems
        for (let i = 0; i < 3; i++) {
            addRandomItem('gem');
        }

        // Add 1-2 Coins (random)
        const numCoins = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < numCoins; i++) {
            addRandomItem('coin');
        }
    }

    private isValidSpawnPosition(x: number, y: number, radius: number): boolean {
        // Check distance from dragon start
        if (Math.hypot(x - this.level.start.x, y - this.level.start.y) < radius + 50) return false;

        // Check distance from goal
        if (Math.hypot(x - this.level.goal.x, y - this.level.goal.y) < radius + 50) return false;

        // Check walls
        for (const wall of this.level.walls) {
            if (x > wall.x - radius && x < wall.x + wall.w + radius &&
                y > wall.y - radius && y < wall.y + wall.h + radius) {
                return false;
            }
        }

        // Check hazards
        if (this.level.hazards) {
            for (const hazard of this.level.hazards) {
                if (x > hazard.x - radius && x < hazard.x + hazard.w + radius &&
                    y > hazard.y - radius && y < hazard.y + hazard.h + radius) {
                    return false;
                }
            }
        }

        // Check existing collectibles
        for (const item of this.state.collectibles) {
            if (Math.hypot(x - item.x, y - item.y) < radius) return false;
        }

        return true;
    }

    private initAssets() {
        const loader = AssetLoader.getInstance();
        const skinManager = SkinManager.getInstance();
        const skinId = skinManager.getSkinForLevel(this.level.id);

        let assetKey: any = 'dragon_default';
        switch (skinId) {
            case 'golden': assetKey = 'dragon_golden'; break;
            case 'ruby': assetKey = 'dragon_ruby'; break;
            case 'amethyst': assetKey = 'dragon_amethyst'; break;
            case 'shadow': assetKey = 'dragon_shadow'; break;
            default: assetKey = 'dragon_default';
        }

        this.assets.dragon = loader.get(assetKey);
        this.assets.wall = loader.get('wall');
        this.assets.food = loader.get('food');
        this.assets.sky = loader.get('sky');
        this.assets.grass = loader.get('grass');
        this.assets.stoneFloor = loader.get('stoneFloor');
        this.assets.stoneWall = loader.get('stoneWall');
        this.assets.cloud = loader.get('cloud');
        this.assets.lava = loader.get('lava');
        this.assets.obsidianFloor = loader.get('obsidianFloor');
        this.assets.obsidianWall = loader.get('obsidianWall');
        this.assets.crackedFloor = loader.get('crackedFloor');
        this.assets.goldFloor = loader.get('goldFloor');
        this.assets.knight = loader.get('knight');
        (this.assets as any).beetle = loader.get('beetle');
        this.assets.wings = loader.get('wings');

        // Create patterns
        if (this.assets.wall.complete) this.patterns.wall = this.ctx.createPattern(this.assets.wall, 'repeat');
        if (this.assets.sky.complete) this.patterns.sky = this.ctx.createPattern(this.assets.sky, 'repeat');
        if (this.assets.grass.complete) this.patterns.grass = this.ctx.createPattern(this.assets.grass, 'repeat');
        if (this.assets.stoneFloor.complete) this.patterns.stoneFloor = this.ctx.createPattern(this.assets.stoneFloor, 'repeat');
        if (this.assets.stoneWall.complete) this.patterns.stoneWall = this.ctx.createPattern(this.assets.stoneWall, 'repeat');
        if (this.assets.obsidianFloor.complete) this.patterns.obsidianFloor = this.ctx.createPattern(this.assets.obsidianFloor, 'repeat');
        if (this.assets.obsidianWall.complete) this.patterns.obsidianWall = this.ctx.createPattern(this.assets.obsidianWall, 'repeat');
        if (this.assets.lava.complete) this.patterns.lava = this.ctx.createPattern(this.assets.lava, 'repeat');
        if (this.assets.goldFloor.complete) this.patterns.goldFloor = this.ctx.createPattern(this.assets.goldFloor, 'repeat');
    }


    private bindEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mouseleave', this.onMouseUp);

        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd);
        this.canvas.addEventListener('touchcancel', this.onTouchEnd);

        window.addEventListener('resize', this.onResize);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    public dispose() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mouseleave', this.onMouseUp);

        this.canvas.removeEventListener('touchstart', this.onTouchStart);
        this.canvas.removeEventListener('touchmove', this.onTouchMove);
        this.canvas.removeEventListener('touchend', this.onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.onTouchEnd);

        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    private onResize = () => {
        this.rect = this.canvas.getBoundingClientRect();
    }

    /* --- Input Handling --- */
    private getMousePos(e: MouseEvent | Touch) {
        // Use cached rect
        const scaleX = 1000 / this.rect.width;
        const scaleY = 1000 / this.rect.height;
        return {
            x: (e.clientX - this.rect.left) * scaleX,
            y: (e.clientY - this.rect.top) * scaleY
        };
    }

    private onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const pos = this.getMousePos(touch);

        // Call logic same as mouse down
        AudioManager.getInstance().init();

        if (this.state.status !== 'PLAYING') return;

        // Check Dragon click
        const dist = Math.hypot(pos.x - this.dragonPos.x, pos.y - this.dragonPos.y);
        if (dist < 80) { // Larger hit area for touch
            this.isDragging = true;
            this.dragOffset = { x: this.dragonPos.x - pos.x, y: this.dragonPos.y - pos.y };
            AudioManager.getInstance().playSFX('pop');
            this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 10, '#FFFFFF');
            this.hasMoved = true; // Mark as moved on interaction
        }
    };

    private onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (!this.isDragging) return;
        const touch = e.touches[0];
        const pos = this.getMousePos(touch);

        // Update Velocity & Position
        const newX = pos.x + this.dragOffset.x;
        const newY = pos.y + this.dragOffset.y;

        // Update Facing based on movement direction
        if (newX < this.dragonPos.x) {
            this.facing = 'left';
        } else if (newX > this.dragonPos.x) {
            this.facing = 'right';
        }

        this.velocity.x = newX - this.dragonPos.x;
        this.velocity.y = newY - this.dragonPos.y;

        this.dragonPos.x = newX;
        this.dragonPos.y = newY;

        // Trail
        if (Math.random() < 0.3) {
            this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y + 20, 1, '#FFA500');
        }

        this.checkCollisions();
    };

    private onTouchEnd = (e: TouchEvent) => {
        this.isDragging = false;
    };

    private onMouseDown = (e: MouseEvent) => {
        // Ensure audio is initialized on first interaction
        AudioManager.getInstance().init();

        if (this.state.status !== 'PLAYING') return;

        const pos = this.getMousePos(e);
        // Check if clicking dragon (Radius ~40)
        const dist = Math.hypot(pos.x - this.dragonPos.x, pos.y - this.dragonPos.y);
        if (dist < 60) { // Slight larger hit area for ease
            this.isDragging = true;
            this.dragOffset = { x: this.dragonPos.x - pos.x, y: this.dragonPos.y - pos.y };
            AudioManager.getInstance().playSFX('pop');
            this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 10, '#FFFFFF');
            this.hasMoved = true; // Mark as moved on interaction
        }
    };

    private onMouseMove = (e: MouseEvent) => {
        if (this.state.status !== 'PLAYING') return;
        const pos = this.getMousePos(e);

        if (!this.isDragging) return;

        // Update Velocity & Position
        const newX = pos.x + this.dragOffset.x;
        const newY = pos.y + this.dragOffset.y;

        // Update Facing based on movement direction
        if (newX < this.dragonPos.x) {
            this.facing = 'left';
        } else if (newX > this.dragonPos.x) {
            this.facing = 'right';
        }

        // Calculate velocity for animation and momentum
        this.velocity.x = newX - this.dragonPos.x;
        this.velocity.y = newY - this.dragonPos.y;

        this.dragonPos.x = newX;
        this.dragonPos.y = newY;

        // Trail effect while dragging
        if (Math.random() < 0.3) {
            this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y + 20, 1, '#FFA500');
        }

        // Check Collisions
        this.checkCollisions();
    };

    private onMouseUp = () => {
        this.isDragging = false;
    };

    private onKeyDown = (e: KeyboardEvent) => {
        if (SettingsManager.getInstance().getSettings().keyboardControlsEnabled) {
            this.activeKeys.add(e.key.toLowerCase());

            // Initiate audio on first key press if not started
            AudioManager.getInstance().init();
            this.hasMoved = true;
        }
    };

    private onKeyUp = (e: KeyboardEvent) => {
        if (SettingsManager.getInstance().getSettings().keyboardControlsEnabled) {
            this.activeKeys.delete(e.key.toLowerCase());
        }
    };

    private handleKeyboardStart() {
        const settings = SettingsManager.getInstance().getSettings();
        if (!settings.keyboardControlsEnabled) return;

        if (this.activeKeys.size > 0 && !this.hasMoved) {
            this.hasMoved = true;
        }
    }

    /* --- Game Logic --- */
    private checkInteractions() {
        if (!this.state.buttons) return;

        const dragonRadius = 30; // Slightly larger for interaction

        for (const button of this.state.buttons) {
            const dist = Math.hypot(this.dragonPos.x - button.x, this.dragonPos.y - button.y);
            const onButton = dist < 40;

            // Handle timed buttons
            if (button.timer) {
                if (onButton) {
                    // Dragon is on button
                    if (!button.isPressed) {
                        // Just stepped on button - start timer
                        button.isPressed = true;
                        button.timerStartTime = this.gameTime;

                        AudioManager.getInstance().playSFX('pop');
                        this.particleSystem.emit(button.x, button.y, 10, '#00FF00');

                        // Open gate
                        const gate = this.state.gates.find(g => g.id === button.targetGateId);
                        if (gate) {
                            gate.isOpen = true;
                            this.particleSystem.emit(gate.x + gate.w / 2, gate.y + gate.h / 2, 20, '#FFFFFF');
                        }
                    } else {
                        // Still on button - check if timer expired
                        if (button.timerStartTime !== undefined) {
                            const elapsed = (this.gameTime - button.timerStartTime) / 1000;

                            if (elapsed >= button.timer) {
                                // Timer expired while on button - close gate
                                const gate = this.state.gates.find(g => g.id === button.targetGateId);
                                if (gate && gate.isOpen) {
                                    gate.isOpen = false;
                                    AudioManager.getInstance().playSFX('crash');
                                    this.particleSystem.emit(gate.x + gate.w / 2, gate.y + gate.h / 2, 15, '#FF0000');
                                }
                            }
                        }
                    }
                } else {
                    // Dragon left button
                    if (button.isPressed) {
                        // Close gate if timer hasn't expired yet
                        if (button.timerStartTime !== undefined) {
                            const elapsed = (this.gameTime - button.timerStartTime) / 1000;

                            if (elapsed < button.timer) {
                                // Left button before timer finished - close gate
                                const gate = this.state.gates.find(g => g.id === button.targetGateId);
                                if (gate && gate.isOpen) {
                                    gate.isOpen = false;
                                    AudioManager.getInstance().playSFX('crash');
                                    this.particleSystem.emit(gate.x + gate.w / 2, gate.y + gate.h / 2, 15, '#FF0000');
                                }
                            }
                        }

                        // Reset button
                        button.isPressed = false;
                        button.timerStartTime = undefined;
                    }
                }
            } else {
                // Non-timed button (toggle behavior)
                if (onButton && !button.isPressed) {
                    button.isPressed = true;

                    AudioManager.getInstance().playSFX('pop');
                    this.particleSystem.emit(button.x, button.y, 10, '#00FF00');

                    // Open gate permanently
                    const gate = this.state.gates.find(g => g.id === button.targetGateId);
                    if (gate) {
                        gate.isOpen = true;
                        this.particleSystem.emit(gate.x + gate.w / 2, gate.y + gate.h / 2, 20, '#FFFFFF');
                    }
                }
            }
        }
    }

    private checkCollisions() {
        const dragonRadius = 25; // Visual radius is 40, hitbox slightly smaller

        // Check Gates (Closed ones act as walls)
        if (this.state.gates) {
            for (const gate of this.state.gates) {
                if (gate.isOpen) continue;

                // Gate collision (same as wall)
                const closestX = Math.max(gate.x, Math.min(this.dragonPos.x, gate.x + gate.w));
                const closestY = Math.max(gate.y, Math.min(this.dragonPos.y, gate.y + gate.h));

                const dx = this.dragonPos.x - closestX;
                const dy = this.dragonPos.y - closestY;

                if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                    this.handleCrash();
                    return;
                }
            }
        }

        // Check Enemies (Consolidated in Update loop for physics enemies, but needed here for static patrol?)
        // The update loop handles physics enemies collision during move.
        // We still need a check here for non-moving / path-based enemies just in case, 
        // OR we can centralize collision logic.
        // Current logic in update() handles collision for moving enemies.
        // But what if dragon moves into them?
        // Let's keep this check for SAFETY.
        if (this.state.enemies) {
            for (const enemy of this.state.enemies) {
                // Bug collision handled in update() mainly, but redundancy is fine for safety.
                const cx = (enemy.currentPos?.x ?? enemy.x) + enemy.w / 2;
                const cy = (enemy.currentPos?.y ?? enemy.y) + enemy.h / 2;
                // Dist check
                if (Math.hypot(this.dragonPos.x - cx, this.dragonPos.y - cy) < 25 + enemy.w / 2) {
                    this.handleCrash();
                    return;
                }
            }
        }

        // Check Hazards
        if (this.level.hazards) {
            for (const hazard of this.level.hazards) {
                const closestX = Math.max(hazard.x, Math.min(this.dragonPos.x, hazard.x + hazard.w));
                const closestY = Math.max(hazard.y, Math.min(this.dragonPos.y, hazard.y + hazard.h));
                const dx = this.dragonPos.x - closestX;
                const dy = this.dragonPos.y - closestY;
                if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                    this.handleCrash();
                    return;
                }
            }
        }

        // Check Moving Walls
        if (this.state.movingWalls) {
            for (const wall of this.state.movingWalls) {
                const rect = { x: wall.currentPos.x, y: wall.currentPos.y, w: wall.w, h: wall.h };
                // Simple AABB/Circle check
                const closestX = Math.max(rect.x, Math.min(this.dragonPos.x, rect.x + rect.w));
                const closestY = Math.max(rect.y, Math.min(this.dragonPos.y, rect.y + rect.h));

                const dx = this.dragonPos.x - closestX;
                const dy = this.dragonPos.y - closestY;

                if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                    this.handleCrash();
                    return;
                }
            }
        }

        // Wall Collision
        for (const wall of this.level.walls) {
            // Simple Circle-Rect collision
            // Find closest point on rect to circle center
            const closestX = Math.max(wall.x, Math.min(this.dragonPos.x, wall.x + wall.w));
            const closestY = Math.max(wall.y, Math.min(this.dragonPos.y, wall.y + wall.h));

            const dx = this.dragonPos.x - closestX;
            const dy = this.dragonPos.y - closestY;

            if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                this.handleCrash();
                return;
                this.handleCrash();
                return;
            }
        }

        // Tilemap Collision
        this.checkTileCollisions();

        // Portal Collision
        this.checkPortalCollisions();

        // Goal Collision
        // Use moving goal pos if active
        let goalX = this.level.goal.x;
        let goalY = this.level.goal.y;

        if (this.state.movingGoal) {
            goalX = this.state.movingGoal.currentPos.x;
            goalY = this.state.movingGoal.currentPos.y;
        }

        const distToGoal = Math.hypot(this.dragonPos.x - goalX, this.dragonPos.y - goalY);
        if (distToGoal < 80) { // Increased from 60 for easier win
            this.handleWin();
        }
    }

    private handleCrash() {
        if (this.isCrashed) return; // Prevent multiple crashes

        // Check Shield
        const shieldIdx = this.state.activePowerUps.findIndex(p => p.type === 'shield');
        if (shieldIdx >= 0) {
            // Consume Shield
            this.state.activePowerUps.splice(shieldIdx, 1);
            AudioManager.getInstance().playSFX('shield_break'); // Need to handle if not exists, fallback to pop
            this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, '#00BFFF'); // Blue shatter
            this.shake = 10;
            return; // Survived!
        }

        this.isCrashed = true;
        this.crashTime = Date.now();
        this.isDragging = false;
        this.state.lives -= 1;

        // Reset Combo
        this.state.combo = { count: 0, timer: 0, multiplier: 1 };

        // Track stats
        ProgressManager.getInstance().recordDeath(this.level.id);

        // Reset consecutive wins
        AchievementManager.getInstance().updateStats({ consecutiveWins: 0 });

        // Enhanced crash effects
        AudioManager.getInstance().playSFX('crash');

        // Massive particle explosion
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 60, '#FF4500'); // Orange explosion
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 40, '#FF0000'); // Red burst
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, '#FFFF00'); // Yellow sparks
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 20, '#000000'); // Black smoke

        // Strong shake
        this.shake = 25;

        // Delay reset for slow-motion effect (300ms)
        setTimeout(() => {
            this.isCrashed = false;
            if (this.state.lives <= 0) {
                this.state.status = 'GAME_OVER';
            } else {
                // Reset position
                this.dragonPos = { ...this.level.start };
                this.hasMoved = false; // Reset moved flag on respawn
            }
            this.onStateChange({ ...this.state });
        }, 300);
    }

    private handleWin() {
        // Immediate visual effects and stat updates
        // Massive particle explosion at goal
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 100, '#FFD700'); // Gold confetti
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 50, '#FFA500'); // Orange burst
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 50, '#FF69B4'); // Pink sparkles

        // Particle burst at dragon position
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, '#FFFFFF'); // White flash

        // Strong screen shake for celebration
        this.shake = 30; // Increased from default

        // Calculate stars for immediate stat updates
        const starThresholds = this.level.starTime || [60, 30];
        let stars = 1;
        if (this.state.timeLeft >= starThresholds[0]) stars = 3;
        else if (this.state.timeLeft >= starThresholds[1]) stars = 2;

        // Save Progress
        ProgressManager.getInstance().completeLevel(this.level.id, this.state.score, stars);

        // Update Leaderboard
        LeaderboardManager.getInstance().submitScore(this.level.id, this.state.timeLeft, stars);

        // Update Achievements
        const achievementManager = AchievementManager.getInstance();
        achievementManager.incrementStat('levelsCompleted', 1);
        achievementManager.incrementStat('totalStars', stars);

        if (stars === 3) {
            achievementManager.incrementStat('perfectLevels', 1);
        }

        // Update Fastest Time (if new record)
        // We'll trust AchievementManager to handle the logic if we just pass the time? 
        // Actually AchievementManager stores a single fastestTime. We should probably only update it if it's better.
        // For simplicity, let's just update generic stats. The manager handles complex checks.
        // Note: The current AchievementManager design is a bit simple, let's just set valid stats.
        achievementManager.incrementStat('consecutiveWins', 1);

        // Enhanced Win Effects
        AudioManager.getInstance().playSFX('win');

        // Massive particle explosion at goal
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 100, '#FFD700'); // Gold confetti
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 50, '#FFA500'); // Orange burst
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 50, '#FF69B4'); // Pink sparkles

        // Particle burst at dragon position
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, '#FFFFFF'); // White flash

        // Strong screen shake for celebration
        this.shake = 30; // Increased from default

        // Delay popup by 1 seconds to show victory moment
        setTimeout(() => {
            this.state.status = 'WON';
            this.state.score += Math.floor(this.state.timeLeft + 100);
            this.state.stars = stars;
            this.onStateChange({ ...this.state });
        }, 1000);
    }

    /* --- Rendering --- */
    private tick = () => {
        if (this.state.status !== 'PLAYING' && this.state.status !== 'WON' && this.state.status !== 'GAME_OVER') return;

        const now = Date.now();
        if (!this.lastFrameTime) this.lastFrameTime = now;
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Apply settings
        const settings = SettingsManager.getInstance().getSettings();

        // Calculate Time Scale (Power-ups override settings)
        let timeScale = settings.slowMotionEnabled ? 0.5 : 1.0;

        // Power-up effects
        const freezeActive = this.state.activePowerUps.some(p => p.type === 'time_freeze');
        const slowMoActive = this.state.activePowerUps.some(p => p.type === 'slow_mo');

        if (freezeActive) timeScale = 0;
        else if (slowMoActive) timeScale = 0.5; // Stacks with setting? Let's say it overrides or is same.

        this.gameTime += delta * timeScale;

        // Infinite Time Logic
        if (!settings.infiniteTimeEnabled && this.state.status === 'PLAYING') {
            this.state.timeLeft -= (delta / 1000) * timeScale; // Scale timer too? Maybe or maybe not. Usually slow motion implies timer also slows down.
            if (this.state.timeLeft <= 0) {
                this.state.timeLeft = 0;
                // Delay game over popup by 3 seconds
                setTimeout(() => {
                    this.state.status = 'GAME_OVER';
                    AudioManager.getInstance().playSFX('crash');
                    this.onStateChange({ ...this.state });
                }, 1000);
            }
        }

        this.handleKeyboardMovement(timeScale); // New Keyboard Logic

        this.update(timeScale, delta); // Pass real delta for UI timers
        this.render();
        this.animationFrameId = requestAnimationFrame(this.tick);
    };

    private handleKeyboardMovement(timeScale: number) {
        const settings = SettingsManager.getInstance().getSettings();
        if (!settings.keyboardControlsEnabled) return;
        if (this.state.status !== 'PLAYING') return;

        // Direction input
        let dx = 0;
        let dy = 0;

        if (this.activeKeys.has('w') || this.activeKeys.has('arrowup')) dy -= 1;
        if (this.activeKeys.has('s') || this.activeKeys.has('arrowdown')) dy += 1;
        if (this.activeKeys.has('a') || this.activeKeys.has('arrowleft')) dx -= 1;
        if (this.activeKeys.has('d') || this.activeKeys.has('arrowright')) dx += 1;

        if (dx !== 0 || dy !== 0) {
            // Apply acceleration
            this.velocity.x += dx * this.acceleration * timeScale;
            this.velocity.y += dy * this.acceleration * timeScale;

            // Update facing
            if (dx < 0) this.facing = 'left';
            if (dx > 0) this.facing = 'right';
        }

        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        // Cap speed
        const speed = Math.hypot(this.velocity.x, this.velocity.y);
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }

        // Stop if very slow
        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;

        // Apply movement
        this.dragonPos.x += this.velocity.x * timeScale;
        this.dragonPos.y += this.velocity.y * timeScale;

        // Boundaries check (simple clamp)
        this.dragonPos.x = Math.max(25, Math.min(975, this.dragonPos.x));
        this.dragonPos.y = Math.max(25, Math.min(975, this.dragonPos.y));

        if (speed > 0.5) {
            this.checkCollisions();
            // Trail
            if (Math.random() < 0.3 && !settings.reducedMotionEnabled) {
                this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y + 20, 1, '#FFA500');
            }
        }
    }

    private update(timeScale: number, realDelta: number) {
        if (!SettingsManager.getInstance().getSettings().reducedMotionEnabled) {
            this.particleSystem.update();
        }

        // Update Power-ups (Real time duration)
        if (this.state.activePowerUps) {
            for (let i = this.state.activePowerUps.length - 1; i >= 0; i--) {
                this.state.activePowerUps[i].timeLeft -= realDelta;
                if (this.state.activePowerUps[i].timeLeft <= 0) {
                    this.state.activePowerUps.splice(i, 1);
                }
            }
        }

        // Update Combo (Real time timer)
        if (this.state.combo.count > 0) {
            this.state.combo.timer -= realDelta;
            if (this.state.combo.timer <= 0) {
                this.state.combo = { count: 0, timer: 0, multiplier: 1 };
            }
        }

        if (this.shake > 0) {
            if (!SettingsManager.getInstance().getSettings().reducedMotionEnabled) {
                // Render offset is handled in render(), we just decay here
            } else {
                this.shake = 0; // Force clear
            }
            this.shake *= 0.9; // Decay
            if (this.shake < 0.5) this.shake = 0;
        }

        // Update Crumbling Floors
        if (this.state.crumblingFloors) {
            for (const floor of this.state.crumblingFloors) {
                if (floor.isCrumbled) continue;

                // Check Trigger
                const rect = { x: floor.x, y: floor.y, w: floor.w, h: floor.h };
                const dragonRadius = 20;
                const closestX = Math.max(rect.x, Math.min(this.dragonPos.x, rect.x + rect.w));
                const closestY = Math.max(rect.y, Math.min(this.dragonPos.y, rect.y + rect.h));
                const dx = this.dragonPos.x - closestX;
                const dy = this.dragonPos.y - closestY;

                // If touching
                if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                    if (!floor.triggeredAt) {
                        floor.triggeredAt = this.gameTime; // Use gameTime
                        AudioManager.getInstance().playSFX('pop');
                    }
                }

                // Check Expiry
                if (floor.triggeredAt) {
                    if (this.gameTime - floor.triggeredAt > floor.duration) {
                        floor.isCrumbled = true;
                        this.particleSystem.emit(floor.x + floor.w / 2, floor.y + floor.h / 2, 20, '#555');
                    }
                }
            }
        }

        // Update Enemies
        if (this.state.enemies) {
            for (const enemy of this.state.enemies) {
                // Initialize startTime
                if (!enemy.startTime) enemy.startTime = this.gameTime;

                // --- BUG PHYSICS ---
                if (enemy.type === 'bug') {
                    // Initialize Velocity if missing (migrating old bugs)
                    if (!enemy.velocity) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 3;
                        enemy.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
                    }

                    // Apply Velocity
                    enemy.currentPos.x += enemy.velocity.x * timeScale;
                    enemy.currentPos.y += enemy.velocity.y * timeScale;

                    // Wall Collision (Bounce)
                    const bugRadius = enemy.w / 2; // ~20px
                    let bouncedX = false;
                    let bouncedY = false;

                    // 1. Boundaries
                    if (enemy.currentPos.x < bugRadius) { enemy.currentPos.x = bugRadius; enemy.velocity.x *= -1; bouncedX = true; }
                    if (enemy.currentPos.x > 1000 - bugRadius) { enemy.currentPos.x = 1000 - bugRadius; enemy.velocity.x *= -1; bouncedX = true; }
                    if (enemy.currentPos.y < bugRadius) { enemy.currentPos.y = bugRadius; enemy.velocity.y *= -1; bouncedY = true; }
                    if (enemy.currentPos.y > 1000 - bugRadius) { enemy.currentPos.y = 1000 - bugRadius; enemy.velocity.y *= -1; bouncedY = true; }

                    // 2. Level Walls
                    if (!bouncedX && !bouncedY) { // Skip if already bounced on boundary
                        for (const wall of this.level.walls) {
                            // Simple AABB overlap check for bounce direction
                            const rect = { l: wall.x, r: wall.x + wall.w, t: wall.y, b: wall.y + wall.h };
                            // Expanded for radius
                            if (enemy.currentPos.x + bugRadius > rect.l && enemy.currentPos.x - bugRadius < rect.r &&
                                enemy.currentPos.y + bugRadius > rect.t && enemy.currentPos.y - bugRadius < rect.b) {

                                // Determine overlap depth to resolve
                                const penLeft = (enemy.currentPos.x + bugRadius) - rect.l;
                                const penRight = rect.r - (enemy.currentPos.x - bugRadius);
                                const penTop = (enemy.currentPos.y + bugRadius) - rect.t;
                                const penBottom = rect.b - (enemy.currentPos.y - bugRadius);

                                const minPen = Math.min(penLeft, penRight, penTop, penBottom);

                                if (minPen === penLeft) { enemy.currentPos.x -= penLeft; enemy.velocity.x *= -1; }
                                else if (minPen === penRight) { enemy.currentPos.x += penRight; enemy.velocity.x *= -1; }
                                else if (minPen === penTop) { enemy.currentPos.y -= penTop; enemy.velocity.y *= -1; }
                                else if (minPen === penBottom) { enemy.currentPos.y += penBottom; enemy.velocity.y *= -1; }

                                break; // Only bounce off one wall per frame
                            }
                        }
                    }

                    // Collision with dragon
                    const rect = { x: enemy.currentPos.x, y: enemy.currentPos.y, w: enemy.w, h: enemy.h }; // Top-left for rendering, but logic uses center?
                    // Actually currentPos seems to be Top-Left based on render logic (drawImage at currentPos)
                    // Let's adjust for center
                    const cx = enemy.currentPos.x + enemy.w / 2;
                    const cy = enemy.currentPos.y + enemy.h / 2;
                    const dist = Math.hypot(this.dragonPos.x - cx, this.dragonPos.y - cy);
                    if (dist < 25 + enemy.w / 2) {
                        this.handleCrash();
                    }

                } else {
                    // Standard Path Logic
                    const elapsed = (this.gameTime - enemy.startTime) % enemy.duration;
                    const t = elapsed / enemy.duration;

                    if (enemy.type === 'chase' && this.state.status === 'PLAYING') {
                        // Simple Chase Logic
                        const speed = 2.5; // pixels per frame
                        const dx = this.dragonPos.x - enemy.currentPos.x;
                        const dy = this.dragonPos.y - enemy.currentPos.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist > 5) { // Stop if very close to avoid jitter
                            enemy.currentPos.x += (dx / dist) * speed;
                            enemy.currentPos.y += (dy / dist) * speed;
                        }

                        // Collision
                        const cx = enemy.currentPos.x + enemy.w / 2;
                        const cy = enemy.currentPos.y + enemy.h / 2;
                        if (Math.hypot(this.dragonPos.x - cx, this.dragonPos.y - cy) < 25 + enemy.w / 2) {
                            this.handleCrash();
                        }

                    } else if (enemy.path && enemy.path.length > 0 && enemy.duration > 0) {
                        const start = { x: enemy.x, y: enemy.y };
                        const pos = this.calculatePathPosition(start, enemy.path, t);
                        enemy.currentPos = pos;

                        // Collision
                        const cx = enemy.currentPos.x + enemy.w / 2; // Fix: use calculated pos
                        const cy = enemy.currentPos.y + enemy.h / 2;
                        if (Math.hypot(this.dragonPos.x - cx, this.dragonPos.y - cy) < 25 + enemy.w / 2) {
                            this.handleCrash();
                        }
                    }
                }
            }
        }

        // Update Moving Goal
        if (this.state.movingGoal) {
            const goal = this.state.movingGoal;
            if (!goal.startTime) goal.startTime = this.gameTime;
            const elapsed = (this.gameTime - goal.startTime) % goal.duration;
            const t = elapsed / goal.duration;

            if (goal.path && goal.path.length > 0) {
                const start = { x: this.level.goal.x, y: this.level.goal.y };
                const pos = this.calculatePathPosition(start, goal.path, t);
                goal.currentPos = pos;
            }
        }

        // Update Moving Walls
        if (this.state.movingWalls) {
            for (const wall of this.state.movingWalls) {
                if (!wall.startTime) wall.startTime = this.gameTime;
                const elapsed = (this.gameTime - wall.startTime) % wall.duration;
                const t = elapsed / wall.duration; // 0 to 1

                if (wall.path && wall.path.length > 0) {
                    const start = { x: wall.x, y: wall.y };
                    const pos = this.calculatePathPosition(start, wall.path, t);
                    wall.currentPos = pos;

                    // Collision Check
                    const rect = { x: wall.currentPos.x, y: wall.currentPos.y, w: wall.w, h: wall.h };
                    const dragonRadius = 25; // Approximate radius of dragon
                    // Simple AABB/Circle check
                    const closestX = Math.max(rect.x, Math.min(this.dragonPos.x, rect.x + rect.w));
                    const closestY = Math.max(rect.y, Math.min(this.dragonPos.y, rect.y + rect.h));

                    const dx = this.dragonPos.x - closestX;
                    const dy = this.dragonPos.y - closestY;

                    if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                        this.handleCrash();
                    }
                    if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                        this.handleCrash();
                    }
                }
            }
        }

        // Check Collectibles
        this.checkCollectibleCollisions();
    }

    private checkCollectibleCollisions() {
        if (!this.state.collectibles) return;

        const dragonRadius = 25;
        // Iterate backwards to allow removal
        for (let i = this.state.collectibles.length - 1; i >= 0; i--) {
            const item = this.state.collectibles[i];
            const itemSize = 30; // approx size
            // Simple distance check
            // Center of item
            const itemX = item.x + itemSize / 2;
            const itemY = item.y + itemSize / 2;

            const dx = this.dragonPos.x - itemX;
            const dy = this.dragonPos.y - itemY;
            const dist = Math.hypot(dx, dy);

            if (dist < dragonRadius + itemSize / 2) {
                // Collected!
                this.state.collectibles.splice(i, 1);

                if (item.type === 'coin') {
                    this.state.coinsCollected++;
                    const points = 25 * this.state.combo.multiplier;
                    this.state.score += points;
                    ProgressManager.getInstance().addCoins(1);
                    AudioManager.getInstance().playSFX('pickup');
                    this.particleSystem.emit(item.x, item.y, 10, '#FFD700');
                    this.incrementCombo();
                } else if (item.type === 'gem') {
                    this.state.gemsCollected++;
                    const points = 100 * this.state.combo.multiplier;
                    this.state.score += points;
                    ProgressManager.getInstance().addGems(1);
                    AudioManager.getInstance().playSFX('pickup');
                    this.particleSystem.emit(item.x, item.y, 15, '#00FFFF');
                    this.incrementCombo();
                } else if (item.type === 'shield') {
                    this.activatePowerUp('shield', 15000);
                    this.state.score += 200;
                    AudioManager.getInstance().playSFX('shield_up');
                    this.particleSystem.emit(item.x, item.y, 20, '#00BFFF');
                } else if (item.type === 'slow_mo') {
                    this.activatePowerUp('slow_mo', 10000);
                    this.state.score += 200;
                    AudioManager.getInstance().playSFX('slow_mo');
                    this.particleSystem.emit(item.x, item.y, 20, '#00FF00'); // Green matrix
                } else if (item.type === 'time_freeze') {
                    this.activatePowerUp('time_freeze', 5000);
                    this.state.score += 200;
                    AudioManager.getInstance().playSFX('time_freeze');
                    this.particleSystem.emit(item.x, item.y, 20, '#E0FFFF'); // Cyan ice
                } else if (item.type === 'heart') {
                    this.state.lives += 1;
                    this.state.score += 500;
                    ProgressManager.getInstance().addHearts(1);
                    AchievementManager.getInstance().incrementStat('heartsCollected', 1);
                    AudioManager.getInstance().playSFX('powerup');
                    this.particleSystem.emit(item.x, item.y, 20, '#FF1493'); // Deep pink
                }
            }
        }
    }

    private incrementCombo() {
        this.state.combo.count++;
        this.state.combo.timer = 2500; // 2.5s to chain
        // Multiplier Logic: 1x, 1.5x, 2x, etc? Or integer?
        // Let's do: 1 + floor(count / 5) ? Or just linear?
        // Let's do simple: 1x, 2x, 3x... capped at 10x
        this.state.combo.multiplier = Math.min(1 + Math.floor(this.state.combo.count / 3), 10);

        if (this.state.combo.multiplier > 1) {
            AudioManager.getInstance().playSFX('combo');
        }
    }

    private activatePowerUp(type: 'shield' | 'slow_mo' | 'time_freeze', duration: number) {
        // Remove existing of same type to refresh
        const existingIdx = this.state.activePowerUps.findIndex(p => p.type === type);
        if (existingIdx >= 0) {
            this.state.activePowerUps[existingIdx].timeLeft = duration;
        } else {
            this.state.activePowerUps.push({ type, timeLeft: duration });
        }
    }

    private calculatePathPosition(start: Point, waypoints: Point[], t: number): { x: number, y: number } {
        // Full path: Start -> Waypoints -> Start
        const points = [start, ...waypoints, start];

        // Calculate total length
        let totalLength = 0;
        const segmentLengths: number[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const dist = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
            segmentLengths.push(dist);
            totalLength += dist;
        }

        if (totalLength === 0) return start;

        // Find current segment based on t
        const targetDist = t * totalLength;
        let currentDist = 0;

        for (let i = 0; i < segmentLengths.length; i++) {
            if (currentDist + segmentLengths[i] >= targetDist) {
                // We are in this segment
                const segmentProgress = (targetDist - currentDist) / segmentLengths[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                return {
                    x: p1.x + (p2.x - p1.x) * segmentProgress,
                    y: p1.y + (p2.y - p1.y) * segmentProgress
                };
            }
            currentDist += segmentLengths[i];
        }

        return start; // Fallback
    }

    private checkTileCollisions() {
        if (!this.level.tileMap) return;

        const dragonRadius = 25;
        const TILE_SIZE = 50; // Hardcoded to match levels.ts for now, or import it

        // Calculate range of tiles to check
        const startCol = Math.floor((this.dragonPos.x - dragonRadius) / TILE_SIZE);
        const endCol = Math.floor((this.dragonPos.x + dragonRadius) / TILE_SIZE);
        const startRow = Math.floor((this.dragonPos.y - dragonRadius) / TILE_SIZE);
        const endRow = Math.floor((this.dragonPos.y + dragonRadius) / TILE_SIZE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                // Bounds check
                if (row >= 0 && row < this.level.tileMap.length &&
                    col >= 0 && col < this.level.tileMap[row].length) {

                    const tile = this.level.tileMap[row][col];
                    if (tile === 1) { // WALL
                        // AABB/Circle Check
                        const tileX = col * TILE_SIZE;
                        const tileY = row * TILE_SIZE;
                        const closestX = Math.max(tileX, Math.min(this.dragonPos.x, tileX + TILE_SIZE));
                        const closestY = Math.max(tileY, Math.min(this.dragonPos.y, tileY + TILE_SIZE));

                        const dx = this.dragonPos.x - closestX;
                        const dy = this.dragonPos.y - closestY;

                        if ((dx * dx + dy * dy) < (dragonRadius * dragonRadius)) {
                            this.handleCrash();
                            return;
                        }
                    }
                }
            }
        }

    }

    private checkPortalCollisions() {
        if (!this.level.portals || this.level.portals.length === 0) return;

        const dragonRadius = 25;
        const portalRadius = 35; // Increased size (70x70 visual approx)
        let insideAnyPortal = false;

        for (const portal of this.level.portals) {
            // Center-to-center distance
            const portalCX = portal.x + 25;
            const portalCY = portal.y + 25;
            const dx = this.dragonPos.x - portalCX;
            const dy = this.dragonPos.y - portalCY;
            const dist = Math.hypot(dx, dy);

            if (dist < (dragonRadius + portalRadius) * 0.8) { // Collision
                insideAnyPortal = true;

                // If we are still in the same portal we just arrived at, ignore it
                if (this.currentPortalId === portal.id) {
                    continue;
                }

                // Teleport!
                const target = this.level.portals.find(p => p.id === portal.targetPortalId);
                if (target) {
                    this.dragonPos.x = target.x + 25;
                    this.dragonPos.y = target.y + 25;
                    this.lastPortalTime = Date.now();
                    this.isDragging = false; // Stop dragging
                    this.activeKeys.clear();

                    // Set the current portal ID to the TARGET portal (where we just arrived)
                    // So we don't immediately teleport back
                    this.currentPortalId = target.id;

                    AudioManager.getInstance().playSFX('powerup');
                    this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, '#00BFFF'); // Unified Blue Particles
                    return;
                }
            }
        }

        // If we are not inside any portal, reset the tracking
        if (!insideAnyPortal) {
            this.currentPortalId = null;
        }
    }

    private render() {
        this.ctx.clearRect(0, 0, 1000, 1000);

        this.ctx.save();
        // Screen Shake
        if (this.shake > 0) {
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.translate(dx, dy);
        }

        // Background
        if (this.level.theme === 'meadow' && this.patterns.grass) {
            this.ctx.fillStyle = this.patterns.grass;
            this.ctx.fillRect(0, 0, 1000, 1000);
        } else if (this.level.theme === 'castle' && this.patterns.stoneFloor) {
            this.ctx.fillStyle = this.patterns.stoneFloor;
            this.ctx.fillRect(0, 0, 1000, 1000);
        } else if (this.level.theme === 'lair' && this.patterns.goldFloor) {
            this.ctx.fillStyle = this.patterns.goldFloor;
            this.ctx.fillRect(0, 0, 1000, 1000);
        } else if (this.patterns.sky) {
            this.ctx.fillStyle = this.patterns.sky;
            this.ctx.fillRect(0, 0, 1000, 1000);
        } else {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, 1000, 1000);
        }

        // Walls
        if (this.level.theme === 'lava' && this.patterns.obsidianWall) {
            this.ctx.fillStyle = this.patterns.obsidianWall;
        } else {
            this.ctx.fillStyle = this.patterns.wall || '#A00000';
        }

        // Render Tilemap
        if (this.level.tileMap) {
            const TILE_SIZE = 50;
            for (let r = 0; r < this.level.tileMap.length; r++) {
                for (let c = 0; c < this.level.tileMap[r].length; c++) {
                    if (this.level.tileMap[r][c] === 1) { // Wall
                        this.ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        // Optional border
                        // this.ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }

        for (const wall of this.level.walls) {
            // Offset pattern so it looks seamless?
            // For simple rects, just filling is fine.
            this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            // Border
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        }

        // Portals
        if (this.level.portals) {
            for (let i = 0; i < this.level.portals.length; i++) {
                const portal = this.level.portals[i];
                const img = AssetLoader.getInstance().get('portal_blue');
                if (img) {
                    // Draw larger portal (80x80) centered on the 50x50 grid cell
                    // Center of 50x50 cell is at x+25, y+25
                    const centerX = portal.x + 25;
                    const centerY = portal.y + 25;

                    this.ctx.save();
                    this.ctx.translate(centerX, centerY);

                    // Different rotation speeds for each portal
                    const rotationSpeed = 500 + (i * 200); // Varies by portal index
                    this.ctx.rotate(Date.now() / rotationSpeed);

                    // Varying glow for differentiation
                    this.ctx.shadowColor = '#00BFFF';
                    this.ctx.shadowBlur = 10 + (i * 5);

                    this.ctx.drawImage(img, -40, -40, 80, 80);
                    this.ctx.restore();

                    // Draw portal number label
                    this.ctx.save();
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 3;
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    const label = (i + 1).toString();
                    this.ctx.strokeText(label, centerX, centerY);
                    this.ctx.fillText(label, centerX, centerY);
                    this.ctx.restore();
                } else {
                    // Fallback
                    this.ctx.fillStyle = '#00BFFF'; // Always blue
                    this.ctx.beginPath();
                    this.ctx.arc(portal.x + 25, portal.y + 25, 35, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }

        // Gates
        if (this.state.gates) {
            for (const gate of this.state.gates) {
                if (!gate.isOpen) {
                    this.ctx.fillStyle = '#444'; // Steel Color
                    this.ctx.fillRect(gate.x, gate.y, gate.w, gate.h);

                    // Bars pattern
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    // Vertical bars
                    for (let i = 0; i < gate.w; i += 20) {
                        this.ctx.moveTo(gate.x + i, gate.y);
                        this.ctx.lineTo(gate.x + i, gate.y + gate.h);
                    }
                    this.ctx.stroke();
                    this.ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
                } else {
                    // Draw open gate (faded or just ground)
                    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    this.ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
                }
            }
        }

        // Buttons
        if (this.state.buttons) {
            for (const button of this.state.buttons) {
                const btnSize = 40;
                this.ctx.save();
                this.ctx.translate(button.x, button.y);

                if (button.isPressed) {
                    this.ctx.fillStyle = '#00AA00'; // Green when pressed
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, btnSize / 2 - 5, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillStyle = '#cc0000'; // Red when unpressed
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, btnSize / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    // Pulse effect
                    this.ctx.strokeStyle = 'white';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        }

        this.ctx.restore();

        // Hazards (Lava)
        if (this.level.hazards) {
            this.ctx.fillStyle = this.patterns.lava || '#FF4500';
            for (const hazard of this.level.hazards) {
                this.ctx.save();
                this.ctx.translate(hazard.x, hazard.y);
                this.ctx.fillRect(0, 0, hazard.w, hazard.h);
                this.ctx.restore();
            }
        }

        // Crumbling Floors
        if (this.state.crumblingFloors) {
            for (const floor of this.state.crumblingFloors) {
                if (floor.isCrumbled) continue;

                this.ctx.save();
                this.ctx.translate(floor.x, floor.y);
                this.ctx.drawImage(this.assets.crackedFloor, 0, 0, floor.w, floor.h);

                // Shake if triggered
                if (floor.triggeredAt) {
                    const shake = (Math.random() - 0.5) * 5;
                    this.ctx.translate(shake, shake);
                    // Build up red overlay?
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    this.ctx.fillRect(0, 0, floor.w, floor.h);
                }

                this.ctx.restore();
            }
        }

        // Moving Walls (wall)
        if (this.state.movingWalls) {
            for (const wall of this.state.movingWalls) {
                this.ctx.drawImage(this.assets.wall, wall.currentPos.x, wall.currentPos.y, wall.w, wall.h);
                // Hitbox debug
                // this.ctx.strokeRect(wall.currentPos.x, wall.currentPos.y, wall.w, wall.h);
            }
        }

        // Enemies
        if (this.state.enemies) {
            for (const enemy of this.state.enemies) {
                // Check if it's a bug
                // Note: We need to cast or check type properties if available in runtime state
                // Since `Enemy` interface has `type`, we can use it. But `MovingEntity` (game state) might not.
                // Looking at `GameState` interface, `enemies` is `MovingEntity[]`. 
                // `MovingEntity` DOES NOT have `type`.
                // I need to update `MovingEntity` in GameEngine.ts first! 
                // Wait, let's check `levels.ts` again. The `Enemy` interface has `type`.
                // The `GameEngine` converts `LevelData` to `GameState`.
                // I should verify where `enemies` are initialized.

                // Let's assume for now I will fix the type issue next. 
                // I'll assume `enemy` has a `type` property or I can link it back.
                // Actually, `MovingEntity` allows extra props in JS.

                // Temporary visual placeholder
                const isBug = (enemy as any).type === 'bug';

                if (isBug) {
                    this.ctx.save();
                    // Draw centered
                    const cx = enemy.currentPos.x + enemy.w / 2;
                    const cy = enemy.currentPos.y + enemy.h / 2;
                    this.ctx.translate(cx, cy);

                    // Drop Shadow
                    // this.ctx.beginPath();
                    // this.ctx.ellipse(0, 15, enemy.w / 2, enemy.h / 4, 0, 0, Math.PI * 2);
                    // this.ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
                    // this.ctx.fill();

                    // Rotation based on velocity
                    if (enemy.velocity) {
                        const angle = Math.atan2(enemy.velocity.y, enemy.velocity.x);
                        this.ctx.rotate(angle + Math.PI / 2); // Adjust for sprite pointing up? Assuming sprite points UP or RIGHT. Usually UP.
                        // If sprite points up, and we want it to face right (0 deg), we adhere to standard. 
                        // Let's assume sprite default is 'UP'. rot = angle + 90deg.
                    } else {
                        this.ctx.rotate(Date.now() / 200); // Fallback spin
                    }

                    const beetle = (this.assets as any).beetle;
                    if (beetle) {
                        this.ctx.drawImage(beetle, -enemy.w / 2, -enemy.h / 2, enemy.w, enemy.h);
                    } else {
                        // Fallback
                        this.ctx.fillStyle = '#00FF00';
                        this.ctx.fillRect(-enemy.w / 2, -enemy.h / 2, enemy.w, enemy.h);
                    }

                    this.ctx.restore();
                } else {
                    this.ctx.drawImage(this.assets.knight, enemy.currentPos.x, enemy.currentPos.y, enemy.w, enemy.h);
                }
            }
        }

        // Goal (Food)
        const goalSize = 80;
        let goalRenderX = this.level.goal.x;
        let goalRenderY = this.level.goal.y;

        if (this.state.movingGoal) {
            goalRenderX = this.state.movingGoal.currentPos.x;
            goalRenderY = this.state.movingGoal.currentPos.y;

            // Draw Wings
            const wingWidth = 120;
            const wingHeight = 60;
            this.ctx.drawImage(this.assets.wings, goalRenderX - 20, goalRenderY - 10, wingWidth, wingHeight);
        }

        this.ctx.drawImage(this.assets.food, goalRenderX - goalSize / 2, goalRenderY - goalSize / 2, goalSize, goalSize);

        // Collectibles
        if (this.state.collectibles) {
            for (const item of this.state.collectibles) {
                if (item.collected) continue;

                this.ctx.save();
                this.ctx.translate(item.x, item.y);

                // Bobbing animation
                const bob = Math.sin(this.gameTime / 200) * 5;
                this.ctx.translate(0, bob);

                if (item.type === 'coin') {
                    // Temple Coin Design (Gold)
                    const ctx = this.ctx;
                    // Scale up by 1.3x
                    ctx.save();
                    ctx.translate(15, 15);
                    ctx.scale(1.3, 1.3);
                    ctx.translate(-15, -15);

                    // 1. Outer Gold Ring
                    const outerGradient = ctx.createLinearGradient(-15, -15, 15, 15);
                    outerGradient.addColorStop(0, '#FFD700'); // Gold
                    outerGradient.addColorStop(1, '#B8860B'); // Dark Gold
                    ctx.fillStyle = outerGradient;
                    ctx.beginPath();
                    ctx.arc(15, 15, 14, 0, Math.PI * 2);
                    ctx.fill();

                    // 2. Inner Recessed Circle (Lighter Gold)
                    ctx.fillStyle = '#F0C300'; // Fixed typo
                    ctx.beginPath();
                    ctx.arc(15, 15, 11, 0, Math.PI * 2);
                    ctx.fill();

                    // 3. Stars (Dots around perimeter)
                    ctx.fillStyle = '#FFFACD'; // Lemon Chiffon
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const sx = 15 + Math.cos(angle) * 12.5;
                        const sy = 15 + Math.sin(angle) * 12.5;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); // Small star dots
                        ctx.fill();
                    }

                    // 4. Temple Icon
                    ctx.fillStyle = '#FFF8DC'; // Cornsilk (Off-white structure)
                    // Pediment (Triangle Roof)
                    ctx.beginPath();
                    ctx.moveTo(15, 8);
                    ctx.lineTo(21, 12);
                    ctx.lineTo(9, 12);
                    ctx.closePath();
                    ctx.fill();
                    // Columns
                    ctx.fillRect(10, 13, 2, 7); // Left
                    ctx.fillRect(14, 13, 2, 7); // Center
                    ctx.fillRect(18, 13, 2, 7); // Right
                    // Base
                    ctx.fillRect(8, 20, 14, 2);

                    // 5. Shine
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.arc(11, 11, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore(); // Restore scale for coin

                } else if (item.type === 'gem') {
                    // Blue Diamond Design
                    const ctx = this.ctx;
                    // Scale up by 1.3x
                    ctx.save();
                    ctx.translate(15, 15);
                    ctx.scale(1.3, 1.3);
                    ctx.translate(-15, -15);

                    // Coordinates relative to 30x30 box
                    // Top Face (Flat, Lightest)
                    ctx.fillStyle = '#E0FFFF'; // Light Cyan
                    ctx.beginPath();
                    ctx.moveTo(10, 5);
                    ctx.lineTo(20, 5);
                    ctx.lineTo(25, 12);
                    ctx.lineTo(5, 12);
                    ctx.closePath();
                    ctx.fill();

                    // Upper Facets (Mid Blue)
                    ctx.fillStyle = '#00BFFF'; // Deep Sky Blue
                    // Left Upper
                    ctx.beginPath();
                    ctx.moveTo(10, 5);
                    ctx.lineTo(5, 12);
                    ctx.lineTo(0, 12); // Far left point
                    ctx.closePath();
                    ctx.fill();

                    // Right Triangle (Upper Side)
                    ctx.beginPath();
                    ctx.moveTo(20, 5);
                    ctx.lineTo(25, 12);
                    ctx.lineTo(30, 12); // Far right
                    ctx.closePath();
                    ctx.fill();

                    // Lower Body (Point, Darkest)
                    const bottomY = 28;

                    // Center Front Triangle (Medium Dark)
                    ctx.fillStyle = '#1E90FF'; // Dodger Blue
                    ctx.beginPath();
                    ctx.moveTo(5, 12);
                    ctx.lineTo(25, 12);
                    ctx.lineTo(15, bottomY);
                    ctx.closePath();
                    ctx.fill();

                    // Left Side (Darker)
                    ctx.fillStyle = '#0000CD'; // Medium Blue
                    ctx.beginPath();
                    ctx.moveTo(0, 12);
                    ctx.lineTo(5, 12);
                    ctx.lineTo(15, bottomY);
                    ctx.closePath();
                    ctx.fill();

                    // Right Side (Darker)
                    ctx.beginPath();
                    ctx.moveTo(30, 12);
                    ctx.lineTo(25, 12);
                    ctx.lineTo(15, bottomY);
                    ctx.closePath();
                    ctx.fill();

                    // Outer Glow
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 10;
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(5, 5, 1, 1); // Dummy stroke to trigger shadow if needed, or simple path
                    // Actually, let's just add a white highlight stroke to edges
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    ctx.beginPath();
                    ctx.moveTo(0, 12); ctx.lineTo(10, 5); ctx.lineTo(20, 5); ctx.lineTo(30, 12);
                    ctx.lineTo(15, bottomY); ctx.closePath();
                    ctx.stroke();
                    ctx.restore(); // Restore scale for gem

                } else if (item.type === 'shield') {
                    this.ctx.fillStyle = '#00BFFF';
                    this.ctx.beginPath();
                    this.ctx.arc(15, 15, 12, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('S', 15, 20);
                } else if (item.type === 'slow_mo') {
                    this.ctx.fillStyle = '#32CD32';
                    this.ctx.beginPath();
                    this.ctx.rect(5, 5, 20, 20);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('T', 15, 20);
                } else if (item.type === 'time_freeze') {
                    this.ctx.fillStyle = '#E0FFFF';
                    this.ctx.beginPath();
                    this.ctx.moveTo(15, 0);
                    this.ctx.lineTo(30, 10);
                    this.ctx.lineTo(25, 25);
                    this.ctx.lineTo(5, 25);
                    this.ctx.lineTo(0, 10);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('F', 15, 20);
                } else if (item.type === 'heart') {
                    // Enhanced Heart Life Collectible
                    // Pulsing animation
                    const pulseTime = Date.now() / 300; // Pulse cycle
                    const baseScale = 2.5; // Significantly increased to match coin size (vector heart is natively smaller)
                    const pulseScale = (1 + Math.sin(pulseTime) * 0.15) * baseScale; // Pulse around base scale
                    const pulseGlow = 15 + Math.sin(pulseTime) * 8; // Glow pulses 7-23

                    this.ctx.save();
                    this.ctx.translate(15, 15);
                    this.ctx.scale(pulseScale, pulseScale);
                    this.ctx.translate(-15, -15);

                    // Outer glow effect
                    this.ctx.shadowColor = '#FF1493'; // Deep pink
                    this.ctx.shadowBlur = pulseGlow;

                    // Draw vector heart shape with gradient
                    const heartGradient = this.ctx.createRadialGradient(15, 13, 2, 15, 15, 12);
                    heartGradient.addColorStop(0, '#FF69B4'); // Hot pink center
                    heartGradient.addColorStop(0.5, '#FF1493'); // Deep pink mid
                    heartGradient.addColorStop(1, '#C71585'); // Medium violet red edge

                    this.ctx.fillStyle = heartGradient;
                    this.ctx.beginPath();

                    // Vector heart shape (centered at 15, 15)
                    const hx = 15;
                    const hy = 15;
                    const hs = 1; // Scale factor

                    // Start at bottom point
                    this.ctx.moveTo(hx, hy + 8 * hs);

                    // Left curve
                    this.ctx.bezierCurveTo(
                        hx - 8 * hs, hy + 3 * hs,  // Control point 1
                        hx - 8 * hs, hy - 5 * hs,  // Control point 2
                        hx, hy - 2 * hs            // End point (top center-left)
                    );

                    // Right curve
                    this.ctx.bezierCurveTo(
                        hx + 8 * hs, hy - 5 * hs,  // Control point 1
                        hx + 8 * hs, hy + 3 * hs,  // Control point 2
                        hx, hy + 8 * hs            // End point (bottom)
                    );

                    this.ctx.closePath();
                    this.ctx.fill();

                    // Inner highlight shine
                    this.ctx.shadowBlur = 0;
                    const shineGradient = this.ctx.createRadialGradient(12, 10, 0, 12, 10, 5);
                    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = shineGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(12, 10, 4, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Sparkle effect (small rotating plus sign)
                    const sparkleRotation = (Date.now() / 200) % (Math.PI * 2);
                    this.ctx.save();
                    this.ctx.translate(20, 8);
                    this.ctx.rotate(sparkleRotation);
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.lineCap = 'round';
                    this.ctx.beginPath();
                    this.ctx.moveTo(-3, 0);
                    this.ctx.lineTo(3, 0);
                    this.ctx.moveTo(0, -3);
                    this.ctx.lineTo(0, 3);
                    this.ctx.stroke();
                    this.ctx.restore();

                    this.ctx.restore();
                }

                this.ctx.restore();
            }
        }

        // Dragon
        const dragonSize = 90;

        this.ctx.save();
        this.ctx.translate(this.dragonPos.x, this.dragonPos.y);

        // Flip if facing left
        if (this.facing === 'left') {
            this.ctx.scale(-1, 1);
        }

        // Shield Effect
        const shieldActive = this.state.activePowerUps.some(p => p.type === 'shield');
        if (shieldActive) {
            this.ctx.save();
            this.ctx.strokeStyle = '#00BFFF';
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.5 + Math.sin(this.gameTime / 100) * 0.2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, dragonSize / 1.5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgba(0, 191, 255, 0.2)';
            this.ctx.fill();
            this.ctx.restore();
        }

        // Add shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 10;

        // Draw centered
        // Apply skin color tint
        const skinManager = SkinManager.getInstance();
        const selectedSkin = skinManager.getSelectedSkin();

        // Draw dragon with color tint
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(this.assets.dragon, -dragonSize / 2, -dragonSize / 2, dragonSize, dragonSize);

        // Apply color overlay for skin
        if (selectedSkin.id !== 'default') {
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = selectedSkin.color;
            this.ctx.fillRect(-dragonSize / 2, -dragonSize / 2, dragonSize, dragonSize);
            this.ctx.globalCompositeOperation = 'destination-in';
            this.ctx.drawImage(this.assets.dragon, -dragonSize / 2, -dragonSize / 2, dragonSize, dragonSize);
            this.ctx.globalCompositeOperation = 'source-over';
        }

        this.ctx.restore();

        // Render Lives (Heart Time) above dragon if not moved yet
        if (!this.hasMoved && this.state.status === 'PLAYING') {
            this.ctx.save();
            this.ctx.font = "bold 30px 'Inter', sans-serif";
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 0;
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(` x${this.state.lives}`, this.dragonPos.x, this.dragonPos.y - 40);
            this.ctx.fillText(` x${this.state.lives}`, this.dragonPos.x, this.dragonPos.y - 40);
            this.ctx.restore();
        }

        // Particles
        this.particleSystem.draw(this.ctx);

        this.ctx.restore(); // Restore shake

        // Danger Glow (Red Vignette)
        if (this.state.enemies && this.state.enemies.length > 0 && this.state.status === 'PLAYING') {
            let minDist = Infinity;
            for (const enemy of this.state.enemies) {
                const dist = Math.hypot(this.dragonPos.x - enemy.currentPos.x, this.dragonPos.y - enemy.currentPos.y);
                if (dist < minDist) minDist = dist;
            }

            const dangerThreshold = 200;
            if (minDist < dangerThreshold) {
                const intensity = 1 - (minDist / dangerThreshold); // 0 to 1
                const alpha = intensity * 0.85; // Max 0.85 opacity (increased from 0.6)

                this.ctx.save();
                // Use canvas dimensions (1000x1000) not rect dimensions
                const gradient = this.ctx.createRadialGradient(
                    this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.4,
                    this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.8
                );
                gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                gradient.addColorStop(1, `rgba(255, 0, 0, ${alpha})`);

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
            }
        }

        // UI Overlay (No Shake)
        this.renderUI();

        // Debug Hitbox (optional, commented out)
        // this.ctx.strokeStyle = 'red';
        // this.ctx.beginPath();
        // this.ctx.arc(this.dragonPos.x, this.dragonPos.y, 25, 0, Math.PI*2);
        // this.ctx.stroke();
    }

    private renderUI() {
        // Active Power-ups
        let yOffset = 100;
        for (const powerUp of this.state.activePowerUps) {
            this.ctx.save();
            this.ctx.translate(20, yOffset);

            // Icon
            this.ctx.fillStyle = powerUp.type === 'shield' ? '#00BFFF' :
                powerUp.type === 'slow_mo' ? '#32CD32' : '#E0FFFF';
            this.ctx.beginPath();
            this.ctx.arc(20, 0, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Timer Bar
            const width = 100;
            const pct = Math.max(0, powerUp.timeLeft / 15000); // Normalize roughly
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(40, -5, width, 10);
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(40, -5, width * pct, 10);

            this.ctx.restore();
            yOffset += 40;
        }

        // Combo UI
        if (this.state.combo.count > 1) {
            this.ctx.save();
            this.ctx.textAlign = 'center';
            this.ctx.font = 'italic bold 40px "Inter", sans-serif';

            // Pulse logic
            const scale = 1 + Math.sin(this.gameTime / 100) * 0.1;
            this.ctx.translate(this.rect.width / 2, 150);
            this.ctx.scale(scale, scale);

            // Text Gradient
            const gradient = this.ctx.createLinearGradient(0, -20, 0, 20);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FF4500');
            this.ctx.fillStyle = gradient;

            this.ctx.fillText(`${this.state.combo.count}x COMBO!`, 0, 0);
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(`${this.state.combo.count}x COMBO!`, 0, 0);

            // Timer meter for combo
            const timerPct = this.state.combo.timer / 2500;
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(-50, 20, 100 * timerPct, 5);

            this.ctx.restore();
        }
    }
}
