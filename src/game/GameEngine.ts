import { LevelData } from './levels';
import dragonImg from '../assets/images/dragon.png';
import wallImg from '../assets/images/wall.png';
import foodImg from '../assets/images/food.png';
import skyImg from '../assets/images/sky.png';
import grassImg from '../assets/images/grass.png';
import stoneFloorImg from '../assets/images/stone_floor.png';
import stoneWallImg from '../assets/images/stone_wall.png';
import lavaImg from '../assets/images/lava.png';
import obsidianFloorImg from '../assets/images/obsidian_floor.png';
import obsidianWallImg from '../assets/images/obsidian_wall.png';
import crackedFloorImg from '../assets/images/cracked_floor.png';
import goldFloorImg from '../assets/images/gold_floor.png';
import knightImg from '../assets/images/knight.png';
import wingsImg from '../assets/images/wings.png';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';
import { ProgressManager } from './ProgressManager';

export type GameStatus = 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'WON' | 'GAME_OVER';

export interface GameState {
    status: GameStatus;
    score: number;
    lives: number;
    currentLevelIdx: number;
    timeLeft: number;
    stars: number; // Stars derived from current run
    gates: any[]; // Store runtime state of gates
    buttons: any[]; // Store runtime state of buttons
    movingWalls: any[]; // Store runtime state of moving walls
    crumblingFloors: any[]; // Store runtime state of crumbling floors
    enemies: any[]; // Store runtime state of enemies
    movingGoal?: any; // Store runtime state of moving goal
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

    // Systems
    private particleSystem = new ParticleSystem();
    private shake = 0;
    private animationFrameId: number | null = null;

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

    constructor(canvas: HTMLCanvasElement, level: LevelData, state: GameState, onStateChange: (s: GameState) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.level = level;
        this.state = state;

        // Initialize runtime state for interactive elements
        if (!this.state.gates) {
            this.state.gates = level.gates ? level.gates.map(g => ({ ...g, isOpen: false })) : [];
            this.state.buttons = level.buttons ? level.buttons.map(b => ({ ...b, isPressed: false })) : [];
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
            } : null;
        }

        this.onStateChange = onStateChange;
        this.dragonPos = { ...level.start };

        this.loadAssets();
        this.bindEvents();
        this.tick();
    }

    private loadAssets() {
        this.assets.dragon.src = dragonImg;
        this.assets.wall.src = wallImg;
        this.assets.food.src = foodImg;
        this.assets.sky.src = skyImg;
        this.assets.grass.src = grassImg;
        this.assets.stoneFloor.src = stoneFloorImg;
        this.assets.stoneWall.src = stoneWallImg;
        this.assets.cloud.src = '../assets/images/cloud.png'; // Should use imported image but trying to keep minimal changes
        this.assets.lava.src = lavaImg;
        this.assets.obsidianFloor.src = obsidianFloorImg;
        this.assets.obsidianWall.src = obsidianWallImg;
        this.assets.crackedFloor.src = crackedFloorImg;
        this.assets.goldFloor.src = goldFloorImg;
        this.assets.knight.src = knightImg;
        this.assets.wings.src = wingsImg;

        this.assets.wall.onload = () => {
            this.patterns.wall = this.ctx.createPattern(this.assets.wall, 'repeat');
        };
        this.assets.sky.onload = () => {
            this.patterns.sky = this.ctx.createPattern(this.assets.sky, 'repeat');
        };
        this.assets.grass.onload = () => {
            this.patterns.grass = this.ctx.createPattern(this.assets.grass, 'repeat');
        };
        this.assets.stoneFloor.onload = () => {
            this.patterns.stoneFloor = this.ctx.createPattern(this.assets.stoneFloor, 'repeat');
        };
        this.assets.stoneWall.onload = () => {
            this.patterns.stoneWall = this.ctx.createPattern(this.assets.stoneWall, 'repeat');
        };
        this.assets.obsidianFloor.onload = () => {
            this.patterns.obsidianFloor = this.ctx.createPattern(this.assets.obsidianFloor, 'repeat');
        };
        this.assets.obsidianWall.onload = () => {
            this.patterns.obsidianWall = this.ctx.createPattern(this.assets.obsidianWall, 'repeat');
        };
        this.assets.lava.onload = () => {
            this.patterns.lava = this.ctx.createPattern(this.assets.lava, 'repeat');
        };
        this.assets.goldFloor.onload = () => {
            this.patterns.goldFloor = this.ctx.createPattern(this.assets.goldFloor, 'repeat');
        };
    }

    private bindEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mouseleave', this.onMouseUp);
    }

    public dispose() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mouseleave', this.onMouseUp);
    }

    /* --- Input Handling --- */
    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = 1000 / rect.width;
        const scaleY = 1000 / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

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
        }
    };

    private onMouseMove = (e: MouseEvent) => {
        if (this.state.status !== 'PLAYING') return;
        const pos = this.getMousePos(e);

        // Update Facing
        if (pos.x < this.dragonPos.x) {
            this.facing = 'left';
        } else {
            this.facing = 'right';
        }

        if (!this.isDragging) return;

        // Update Dragon Position
        this.dragonPos.x = pos.x + this.dragOffset.x;
        this.dragonPos.y = pos.y + this.dragOffset.y;

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
            }
        }

        // Goal Collision
        // Use moving goal pos if active
        let goalX = this.level.goal.x;
        let goalY = this.level.goal.y;

        if (this.state.movingGoal) {
            goalX = this.state.movingGoal.currentPos.x;
            goalY = this.state.movingGoal.currentPos.y;
        }

        const distToGoal = Math.hypot(this.dragonPos.x - goalX, this.dragonPos.y - goalY);
        if (distToGoal < 60) {
            this.handleWin();
        }
    }

    private handleCrash() {
        this.isDragging = false;
        this.state.lives -= 1;
        AudioManager.getInstance().playSFX('crash');
        this.particleSystem.emit(this.dragonPos.x, this.dragonPos.y, 30, '#FF4500'); // Explosion
        this.shake = 20; // Trigger shake

        if (this.state.lives <= 0) {
            this.state.status = 'GAME_OVER';
        } else {
            // Reset position
            this.dragonPos = { ...this.level.start };
        }
        this.onStateChange({ ...this.state });
    }

    private handleWin() {
        this.state.status = 'WON';
        this.state.score += Math.floor(this.state.timeLeft + 100);

        // Calculate Stars
        // Default: 3 stars if > 50% time left, 2 stars if > 20% time left
        const starThresholds = this.level.starTime || [this.level.timeLimit * 0.5, this.level.timeLimit * 0.2];

        let stars = 1;
        if (this.state.timeLeft >= starThresholds[0]) stars = 3;
        else if (this.state.timeLeft >= starThresholds[1]) stars = 2;

        this.state.stars = stars;

        // Save Progress
        ProgressManager.getInstance().completeLevel(this.level.id, this.state.score, stars);

        AudioManager.getInstance().playSFX('win');
        this.particleSystem.emit(this.level.goal.x, this.level.goal.y, 50, '#FFD700'); // Confetti
        this.onStateChange({ ...this.state });
    }

    /* --- Rendering --- */
    private tick = () => {
        if (this.state.status !== 'PLAYING' && this.state.status !== 'WON' && this.state.status !== 'GAME_OVER') return;

        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(this.tick);
    };

    private update() {
        this.particleSystem.update();
        if (this.shake > 0) {
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
                        floor.triggeredAt = Date.now();
                        AudioManager.getInstance().playSFX('pop');
                    }
                }

                // Check Expiry
                if (floor.triggeredAt) {
                    if (Date.now() - floor.triggeredAt > floor.duration) {
                        floor.isCrumbled = true;
                        this.particleSystem.emit(floor.x + floor.w / 2, floor.y + floor.h / 2, 20, '#555');
                    }
                }
            }
        }

        // Update Enemies
        if (this.state.enemies) {
            const now = Date.now();
            for (const enemy of this.state.enemies) {
                if (!enemy.startTime) enemy.startTime = now;
                const elapsed = (now - enemy.startTime) % enemy.duration;
                const t = elapsed / enemy.duration;

                if (enemy.path && enemy.path.length > 0) {
                    const start = { x: enemy.x, y: enemy.y };
                    const end = enemy.path[0];
                    const factor = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;
                    enemy.currentPos.x = start.x + (end.x - start.x) * factor;
                    enemy.currentPos.y = start.y + (end.y - start.y) * factor;
                }
            }
        }

        // Update Moving Goal
        if (this.state.movingGoal) {
            const goal = this.state.movingGoal;
            const now = Date.now();
            if (!goal.startTime) goal.startTime = now;
            const elapsed = (now - goal.startTime) % goal.duration;
            const t = elapsed / goal.duration;

            if (goal.path && goal.path.length > 0) {
                const start = { x: this.level.goal.x, y: this.level.goal.y };
                const end = goal.path[0];
                const factor = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;
                goal.currentPos.x = start.x + (end.x - start.x) * factor;
                goal.currentPos.y = start.y + (end.y - start.y) * factor;
            }
        }

        // Update Moving Walls
        if (this.state.movingWalls) {
            const now = Date.now();
            for (const wall of this.state.movingWalls) {
                if (!wall.startTime) wall.startTime = now;
                const elapsed = (now - wall.startTime) % wall.duration;
                const t = elapsed / wall.duration; // 0 to 1

                // Simple Ping Pong logic between start and 1st waypoint? 
                // Or full path interpolation?
                // Let's assume path has at least 2 points: Start(implicit) -> Point1 -> Point2...
                // Actually, let's treat path as list of points including start.
                // Assuming path is [Start, End], we lerp.

                // For simplicity: If path exists, lerp between start (x,y) and path[0] and back?
                // Or iterate through path.

                // Let's do simple: PingPong between Initial Pos and Path[0]
                if (wall.path && wall.path.length > 0) {
                    const start = { x: wall.x, y: wall.y };
                    const end = wall.path[0];

                    // Sine wave for smooth ping pong
                    // (Math.sin(t * Math.PI * 2) + 1) / 2 goes 0.5 -> 1 -> 0.5 -> 0 -> 0.5
                    // We want 0 -> 1 -> 0
                    const factor = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;

                    wall.currentPos.x = start.x + (end.x - start.x) * factor;
                    wall.currentPos.y = start.y + (end.y - start.y) * factor;

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
        for (const wall of this.level.walls) {
            // Offset pattern so it looks seamless?
            // For simple rects, just filling is fine.
            this.ctx.save();
            this.ctx.translate(wall.x, wall.y);
            this.ctx.fillRect(0, 0, wall.w, wall.h);
            this.ctx.restore();

            // Add border for pop
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
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

        // Dragon
        const dragonSize = 90;

        this.ctx.save();
        this.ctx.translate(this.dragonPos.x, this.dragonPos.y);

        // Flip if facing left
        if (this.facing === 'left') {
            this.ctx.scale(-1, 1);
        }

        // Add shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 10;

        // Draw centered
        this.ctx.drawImage(this.assets.dragon, -dragonSize / 2, -dragonSize / 2, dragonSize, dragonSize);

        this.ctx.restore();

        // Particles
        this.particleSystem.draw(this.ctx);

        this.ctx.restore(); // Restore shake

        // Debug Hitbox (optional, commented out)
        // this.ctx.strokeStyle = 'red';
        // this.ctx.beginPath();
        // this.ctx.arc(this.dragonPos.x, this.dragonPos.y, 25, 0, Math.PI*2);
        // this.ctx.stroke();
    }
}
