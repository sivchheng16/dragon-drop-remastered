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
    collectibles: { x: number; y: number; type: 'coin' | 'gem' | 'shield' | 'slow_mo' | 'time_freeze'; collected: boolean }[];
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

    constructor(canvas: HTMLCanvasElement, level: LevelData, state: GameState, onStateChange: (s: GameState) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.level = level;
        this.state = state;

        this.rect = this.canvas.getBoundingClientRect();

        // Initialize runtime state for interactive elements
        if (!this.state.gates) {
            this.state.gates = level.gates ? level.gates.map(g => ({ ...g, isOpen: false })) : [];
            this.state.buttons = level.buttons ? level.buttons.map((b, i) => ({ ...b, id: `btn_${i}`, isPressed: false })) : [];
            this.state.movingWalls = level.movingWalls ? level.movingWalls.map(m => ({
                ...m,
                currentPos: { x: m.x, y: m.y },
                startTime: Date.now()
            })) : [];
            this.state.crumblingFloors = level.crumblingFloors ? level.crumblingFloors.map(c => ({
                ...c,
                triggeredAt: null,
                isCrumbled: false
            })) : [];
            this.state.enemies = level.enemies ? level.enemies.map(e => ({
                ...e,
                currentPos: { x: e.x, y: e.y },
                startTime: Date.now()
            })) : [];
            this.state.movingGoal = level.movingGoal ? {
                ...level.movingGoal,
                currentPos: { x: level.goal.x, y: level.goal.y }, // Start at goal pos
                startTime: Date.now()
            } : undefined;
            this.state.movingGoal = level.movingGoal ? {
                ...level.movingGoal,
                currentPos: { x: level.goal.x, y: level.goal.y }, // Start at goal pos
                startTime: Date.now()
            } : undefined;
        }

        // Initialize new state if missing
        if (!this.state.combo) this.state.combo = { count: 0, timer: 0, multiplier: 1 };

        this.onStateChange = onStateChange;
        this.dragonPos = { ...level.start };

        // Set theme music
        AudioManager.getInstance().playThemeMusic(level.theme || 'meadow');

        this.initAssets();
        this.bindEvents();
        this.tick();
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
            if (button.isPressed) continue; // Already pressed

            const dist = Math.hypot(this.dragonPos.x - button.x, this.dragonPos.y - button.y);
            if (dist < 40) {
                // Press Button
                button.isPressed = true;
                AudioManager.getInstance().playSFX('pop');
                this.particleSystem.emit(button.x, button.y, 10, '#00FF00');

                // Open Linked Gate
                const gate = this.state.gates.find(g => g.id === button.targetGateId);
                if (gate) {
                    gate.isOpen = true;
                    this.particleSystem.emit(gate.x + gate.w / 2, gate.y + gate.h / 2, 20, '#FFFFFF'); // Dust effect
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

        // Check Enemies
        if (this.state.enemies) {
            for (const enemy of this.state.enemies) {
                const rect = { x: enemy.currentPos.x, y: enemy.currentPos.y, w: enemy.w, h: enemy.h };
                const dragonRadius = 25;
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
        this.state.status = 'WON';
        this.state.score += Math.floor(this.state.timeLeft + 100);

        // Calculate Stars with clear thresholds
        // Default: 3★ if 60s+ left, 2★ if 30s+ left, 1★ for completion
        const starThresholds = this.level.starTime || [60, 30];

        let stars = 1;
        if (this.state.timeLeft >= starThresholds[0]) stars = 3;
        else if (this.state.timeLeft >= starThresholds[1]) stars = 2;

        this.state.stars = stars;

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

        this.onStateChange({ ...this.state });
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
                this.state.status = 'GAME_OVER';
                AudioManager.getInstance().playSFX('crash');
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
                // Initialize startTime based on virtual gameTime if not set
                // logic: we need 'elapsed' to be consistent.
                // If we use gameTime, we should likely set startTime to gameTime on init.
                // But enemy.startTime is likely from level data? No, it's runtime state.
                // We'll initialize it to the current gameTime.
                if (!enemy.startTime) enemy.startTime = this.gameTime;

                const elapsed = (this.gameTime - enemy.startTime) % enemy.duration;
                const t = elapsed / enemy.duration;

                if (enemy.path && enemy.path.length > 0) {
                    const start = { x: enemy.x, y: enemy.y };
                    const pos = this.calculatePathPosition(start, enemy.path, t);
                    enemy.currentPos = pos;
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
                    const points = 50 * this.state.combo.multiplier;
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

        // Cooldown check (e.g. 1 second)
        if (Date.now() - this.lastPortalTime < 1000) return;

        const dragonRadius = 25;
        const portalRadius = 25; // Assuming 50x50 centered

        for (const portal of this.level.portals) {
            // Center-to-center distance
            const portalCX = portal.x + 25;
            const portalCY = portal.y + 25;
            const dx = this.dragonPos.x - portalCX;
            const dy = this.dragonPos.y - portalCY;
            const dist = Math.hypot(dx, dy);

            if (dist < (dragonRadius + portalRadius) * 0.8) { // Slightly forgiving
                // Teleport!
                const target = this.level.portals.find(p => p.id === portal.targetPortalId);
                if (target) {
                    this.dragonPos.x = target.x + 25;
                    this.dragonPos.y = target.y + 25;
                    this.lastPortalTime = Date.now();
                    AudioManager.getInstance().playSFX('powerup'); // Reuse sound or add portal sound
                    this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, portal.color === 'blue' ? '#00BFFF' : '#FF8C00');
                    return; // Handled
                }
            }
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
            for (const portal of this.level.portals) {
                const imgKey = portal.color === 'blue' ? 'portal_blue' : 'portal_orange';
                const img = AssetLoader.getInstance().get(imgKey);
                if (img) {
                    this.ctx.drawImage(img, portal.x, portal.y, 50, 50); // Assuming 50x50 size
                } else {
                    // Fallback
                    this.ctx.fillStyle = portal.color === 'blue' ? '#00BFFF' : '#FF8C00';
                    this.ctx.beginPath();
                    this.ctx.arc(portal.x + 25, portal.y + 25, 20, 0, Math.PI * 2);
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

        // Moving Walls (Clouds)
        if (this.state.movingWalls) {
            for (const wall of this.state.movingWalls) {
                this.ctx.drawImage(this.assets.cloud, wall.currentPos.x, wall.currentPos.y, wall.w, wall.h);
                // Hitbox debug
                // this.ctx.strokeRect(wall.currentPos.x, wall.currentPos.y, wall.w, wall.h);
            }
        }

        // Enemies
        if (this.state.enemies) {
            for (const enemy of this.state.enemies) {
                this.ctx.drawImage(this.assets.knight, enemy.currentPos.x, enemy.currentPos.y, enemy.w, enemy.h);
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
                    this.ctx.fillStyle = '#FFD700'; // Gold
                    this.ctx.beginPath();
                    this.ctx.arc(15, 15, 10, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#DAA520';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                    // Shine
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.beginPath();
                    this.ctx.arc(12, 12, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (item.type === 'gem') {
                    this.ctx.fillStyle = '#00FFFF'; // Cyan
                    this.ctx.beginPath();
                    this.ctx.moveTo(15, 0);
                    this.ctx.lineTo(30, 15);
                    this.ctx.lineTo(15, 30);
                    this.ctx.lineTo(0, 15);
                    this.ctx.closePath();
                    this.ctx.fill();
                    // Glow
                    this.ctx.shadowColor = '#00FFFF';
                    this.ctx.shadowBlur = 10;
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
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
