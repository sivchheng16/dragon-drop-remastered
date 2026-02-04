export type LevelTheme = 'meadow' | 'castle' | 'sky' | 'lava' | 'lair';

export interface Gate {
    id: string; // Unique ID to link with button
    x: number;
    y: number;
    w: number;
    h: number;
    isOpen?: boolean; // Runtime state
}

export interface Button {
    x: number;
    y: number;
    targetGateId: string;
    isPressed?: boolean; // Runtime state
    timer?: number; // Optional: If set, gate stays open for this many seconds
}

export interface MovingWall {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    path: { x: number; y: number }[]; // Waypoints
    duration: number; // Time to complete one loop (ms)
    // Runtime state
    currentPos?: { x: number; y: number };
}

export interface Hazard {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface CrumblingFloor {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    duration: number; // Time until crumble
    isCrumbled?: boolean;
}

export interface Enemy {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    path: { x: number; y: number }[];
    duration: number;
    type: 'patrol' | 'chase' | 'bug';
    // Runtime
    currentPos?: { x: number; y: number };
    startTime?: number;
}

// Tilemap Constants
export const TILE_SIZE = 50; // Align with common wall width
export enum TileType {
    EMPTY = 0,
    WALL = 1,
    // Future expansion: 2 = Water, 3 = Spike, etc.
}

export interface Portal {
    id: string;
    x: number;
    y: number;
    targetPortalId: string;
    color?: 'blue' | 'orange'; // Optional, defaults to blue (all portals now blue)
}

export interface LevelData {
    id: number;
    theme: LevelTheme;
    start: { x: number; y: number };
    goal: { x: number; y: number };
    walls: { x: number; y: number; w: number; h: number }[];
    tileMap?: number[][]; // Optional Grid: [row][col]
    gates?: Gate[];
    buttons?: Button[];
    portals?: Portal[];
    movingWalls?: MovingWall[];
    hazards?: Hazard[];
    crumblingFloors?: CrumblingFloor[];
    boom?: Enemy[];
    collectibles?: { x: number; y: number; type: 'coin' | 'gem' | 'shield' | 'slow_mo' | 'time_freeze' | 'heart' }[]; // Coins, gems, and power-ups
    movingGoal?: {
        path: { x: number; y: number }[];
        duration: number;
        currentPos?: { x: number; y: number }; // Runtime
        startTime?: number; // Runtime
    };
    timeLimit: number;
    starTime?: [number, number]; // [3-star threshold, 2-star threshold] (Time Left)
    difficulty?: number; // 1-10 scale for balancing
    isBoss?: boolean; // Boss level flag
    isBreather?: boolean; // Breather/recovery level flag
    tutorialText?: string; // Optional tutorial message for intro levels
}

// Helper for boundaries
const BOUNDARIES = [
    { x: 0, y: 0, w: 1000, h: 50 },
    { x: 0, y: 950, w: 1000, h: 50 },
    { x: 0, y: 0, w: 50, h: 1000 },
    { x: 950, y: 0, w: 50, h: 1000 },
];

export const LEVELS: LevelData[] = [
    // 1. Warm Up
    {
        id: 1,
        theme: 'meadow',
        start: { x: 100, y: 800 },
        goal: { x: 800, y: 150 },
        timeLimit: 100,
        difficulty: 1, // Very Easy - Tutorial level
        tutorialText: "Drag the dragon to the food!",
        walls: [], // Empty, using tileMap
        collectibles: [
            { x: 200, y: 400, type: 'coin' },
            { x: 400, y: 600, type: 'coin' },
            { x: 600, y: 400, type: 'coin' },
            { x: 500, y: 300, type: 'gem' }
        ],
        tileMap: [
            // 20x20 Grid. 0=Empty, 1=Wall
            // Border Top
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Gap in second wall
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // Gap in first wall
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ]
    },
    // 2. The Bucket
    {
        id: 2,
        theme: 'meadow',
        start: { x: 100, y: 800 },
        goal: { x: 500, y: 500 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 200, w: 50, h: 600 },
            { x: 200, y: 800, w: 600, h: 50 },
            { x: 750, y: 200, w: 50, h: 600 },
        ],
    },
    // 3. Zig Zag
    {
        id: 3,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 50, h: 700 },
            { x: 400, y: 300, w: 50, h: 700 },
            { x: 600, y: 0, w: 50, h: 700 },
            { x: 800, y: 300, w: 50, h: 700 },
        ],
    },
    // 4. Spiral In
    {
        id: 4,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 500, y: 500 },
        timeLimit: 80,
        walls: [
            ...BOUNDARIES,
            { x: 50, y: 150, w: 750, h: 50 }, // Top
            { x: 800, y: 150, w: 50, h: 700 }, // Right
            { x: 150, y: 800, w: 650, h: 50 }, // Bottom
            { x: 150, y: 300, w: 50, h: 500 }, // Left
            { x: 150, y: 270, w: 500, h: 50 }, // Inner Top
            { x: 600, y: 300, w: 50, h: 350 }, // Inner Right
            { x: 300, y: 650, w: 350, h: 50 }, // Inner Bottom

        ],
    },
    // 5. Four Chambers
    {
        id: 5,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 80,
        walls: [
            ...BOUNDARIES,
            // Shortened walls to create gaps around center ("Rotary" style)
            { x: 475, y: 0, w: 50, h: 350 }, // Top (Gap 75px)
            { x: 475, y: 650, w: 50, h: 350 }, // Bottom (Gap 75px)
            { x: 0, y: 475, w: 350, h: 50 }, // Left (Gap 75px)
            { x: 650, y: 475, w: 350, h: 50 }, // Right (Gap 75px)
            // Small blockers in center
            { x: 425, y: 425, w: 150, h: 150 },
        ],
    },
    // 6. Tunnel Run
    {
        id: 6,
        theme: 'meadow',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            { x: 130, y: 300, w: 1000, h: 50 },
            { x: 130, y: 650, w: 1000, h: 50 },
            // Obstacles in tunnel - Made smaller for fairer passage
            { x: 300, y: 375, w: 50, h: 150 }, // Top gap ~75, Bottom ~125
            { x: 600, y: 475, w: 50, h: 150 }, // Top gap ~125, Bottom ~75
        ],
    },
    // 7. Checkerboard
    {
        id: 7,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 150, y: 150, w: 300, h: 300 },
            { x: 550, y: 150, w: 300, h: 300 },
            { x: 150, y: 550, w: 300, h: 300 },
            { x: 550, y: 550, w: 300, h: 300 },
            // { x: 450, y: 450, w: 100, h: 100 },
        ],
    },
    // 8. The Cage
    {
        id: 8,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 500, y: 500 },
        timeLimit: 50,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 300, w: 400, h: 50 }, // Top
            { x: 300, y: 650, w: 400, h: 50 }, // Bottom
            { x: 300, y: 300, w: 50, h: 400 }, // Left
            { x: 650, y: 300, w: 50, h: 250 }, // Right (Gap at bottom increased -> 100px)
        ],
    },
    // 9. Diagonal Step
    {
        id: 9,
        theme: 'meadow',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 375,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 600, w: 200, h: 50 },
            { x: 400, y: 400, w: 200, h: 50 },
            { x: 600, y: 200, w: 200, h: 50 },
            // Extra walls (5x more density)
            { x: 100, y: 750, w: 100, h: 50 },
            { x: 300, y: 750, w: 50, h: 100 },
            { x: 500, y: 550, w: 50, h: 150 },
            { x: 700, y: 350, w: 50, h: 150 },
            { x: 800, y: 500, w: 150, h: 50 },
            { x: 150, y: 300, w: 150, h: 50 },
            { x: 350, y: 250, w: 50, h: 100 },
            { x: 550, y: 150, w: 50, h: 100 },
            { x: 750, y: 50, w: 50, h: 150 },
            { x: 50, y: 500, w: 150, h: 50 },
            { x: 450, y: 850, w: 50, h: 100 },
            { x: 650, y: 650, w: 150, h: 50 },
        ],
    },
    // 10. The Fork
    {
        id: 10,
        theme: 'meadow',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 300,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 200, w: 100, h: 600 }, // Center Divider
            { x: 200, y: 400, w: 250, h: 50 }, // Left block
            { x: 550, y: 600, w: 250, h: 50 }, // Right block
            // x5 Extra Walls
            { x: 100, y: 200, w: 100, h: 50 },
            { x: 100, y: 600, w: 100, h: 50 },
            { x: 300, y: 100, w: 50, h: 200 },
            { x: 300, y: 600, w: 50, h: 200 },
            { x: 550, y: 300, w: 150, h: 50 },
            { x: 700, y: 100, w: 50, h: 250 },
            { x: 800, y: 400, w: 150, h: 50 },
            { x: 700, y: 700, w: 50, h: 200 },
            { x: 850, y: 600, w: 100, h: 50 },
            { x: 50, y: 800, w: 200, h: 50 },
            { x: 350, y: 850, w: 50, h: 100 },
            { x: 600, y: 50, w: 50, h: 100 },
        ],
    },
    // 11. Minimalist
    {
        id: 11,
        theme: 'meadow',
        start: { x: 900, y: 900 },
        goal: { x: 900, y: 250 },
        timeLimit: 40,
        walls: [
            ...BOUNDARIES,
            // 10 Random Walls (User Request)
            { x: 130, y: 150, w: 500, h: 50 },
            { x: 600, y: 120, w: 50, h: 400 },
            { x: 100, y: 600, w: 250, h: 50 },
            { x: 800, y: 700, w: 50, h: 150 },
            { x: 400, y: 400, w: 100, h: 100 },
            { x: 500, y: 800, w: 400, h: 50 },
            { x: 700, y: 300, w: 200, h: 50 },
            { x: 150, y: 800, w: 50, h: 100 },
            { x: 350, y: 280, w: 50, h: 300 },
            { x: 850, y: 150, w: 100, h: 50 },
            // 10 MORE Random Walls
            // { x: 250, y: 550, w: 50, h: 50 },
            // { x: 800, y: 250, w: 100, h: 50 },
            // { x: 50, y: 350, w: 200, h: 50 },
            // { x: 650, y: 650, w: 50, h: 200 },
            // { x: 450, y: 750, w: 150, h: 50 },
            // { x: 300, y: 400, w: 50, h: 100 },
            // { x: 750, y: 850, w: 100, h: 50 },
            // { x: 550, y: 50, w: 50, h: 150 },
            // { x: 900, y: 700, w: 50, h: 100 },
            // { x: 50, y: 100, w: 50, h: 50 },
        ],
    },
    // 12. H-Pattern
    {
        id: 12,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 80,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 850 },
            { x: 650, y: 150, w: 50, h: 850 },
            // Gap in the middle (x=450 to 550 is open)
            { x: 350, y: 500, w: 100, h: 50 },
            { x: 550, y: 500, w: 100, h: 50 },
        ],
    },
    // 13. Corners
    {
        id: 13,
        theme: 'meadow',
        start: { x: 900, y: 900 },
        goal: { x: 100, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 250, w: 800, h: 50 },
            { x: 200, y: 750, w: 800, h: 50 },
        ],
    },
    // 14. Snake
    {
        id: 14,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 200, w: 850, h: 50 },
            { x: 150, y: 400, w: 850, h: 50 },
            { x: 0, y: 600, w: 850, h: 50 },
            { x: 150, y: 800, w: 850, h: 50 },
        ],

    },
    // 15. The Grid
    {
        id: 15,
        theme: 'meadow',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Horizontal Cuts (Lane boundaries)
            { x: 200, y: 300, w: 600, h: 50 },
            { x: 200, y: 700, w: 600, h: 50 },
            // Vertical Bars with Slalom Gaps
            // Wall 1 (x=200) - Gap High (350-450)
            { x: 200, y: 100, w: 50, h: 250 },
            { x: 200, y: 450, w: 50, h: 450 },
            // Wall 2 (x=400) - Gap Low (550-650)
            { x: 400, y: 100, w: 50, h: 450 },
            { x: 400, y: 650, w: 50, h: 250 },
            // Wall 3 (x=600) - Gap High (350-450)
            { x: 600, y: 100, w: 50, h: 250 },
            { x: 600, y: 450, w: 50, h: 450 },
            // Wall 4 (x=800) - Gap Low (550-650)
            { x: 800, y: 100, w: 50, h: 450 },
            { x: 800, y: 650, w: 50, h: 250 },
        ],
    },
    // 16. Double Spiral
    {
        id: 16,
        theme: 'meadow',
        start: { x: 500, y: 500 },
        goal: { x: 100, y: 100 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            // Hollow Box with Top Gap
            { x: 300, y: 300, w: 100, h: 50 }, // Top Left (Gap 200px)
            { x: 600, y: 300, w: 100, h: 50 }, // Top Right
            { x: 300, y: 650, w: 400, h: 50 }, // Bottom
            { x: 300, y: 300, w: 50, h: 350 }, // Left
            { x: 650, y: 300, w: 50, h: 350 }, // Right
            { x: 0, y: 500, w: 300, h: 50 },
            { x: 700, y: 500, w: 300, h: 50 },
            // Messy Debris (User Request)
            { x: 150, y: 150, w: 50, h: 50 },
            { x: 800, y: 800, w: 50, h: 50 },
            { x: 450, y: 200, w: 30, h: 30 },
            { x: 550, y: 750, w: 40, h: 40 },
            { x: 200, y: 400, w: 25, h: 25 },
            { x: 800, y: 400, w: 35, h: 35 },
            { x: 150, y: 700, w: 40, h: 40 },
            { x: 850, y: 200, w: 30, h: 30 },
            { x: 400, y: 400, w: 170, h: 20 },
            { x: 500, y: 600, w: 20, h: 20 },
            { x: 350, y: 350, w: 30, h: 30 },
            { x: 650, y: 650, w: 30, h: 30 },
            { x: 250, y: 600, w: 40, h: 40 },
            { x: 750, y: 550, w: 40, h: 40 },
            { x: 100, y: 850, w: 20, h: 20 },
            { x: 900, y: 150, w: 25, h: 25 },
            { x: 400, y: 150, w: 50, h: 20 },
            { x: 600, y: 850, w: 20, h: 50 },
            { x: 50, y: 350, w: 30, h: 30 },
            { x: 950, y: 650, w: 30, h: 30 },
        ],
    },
    // 17. The Narrow Gap
    {
        id: 17,
        theme: 'meadow',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 0, w: 800, h: 800 }, // Big chunk TL
            { x: 850, y: 850, w: 150, h: 150 }, // Chunk BR
        ],
    },
    // 18. Complex Maze 1
    {
        id: 18,
        theme: 'meadow',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 150,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 50, h: 800 },
            { x: 400, y: 200, w: 50, h: 800 },
            { x: 600, y: 0, w: 50, h: 800 },
            { x: 800, y: 200, w: 50, h: 800 },
        ],
    },
    // 19. Complex Maze 2
    {
        id: 19,
        theme: 'meadow',
        start: { x: 900, y: 100 },
        goal: { x: 100, y: 900 },
        timeLimit: 150,
        walls: [
            ...BOUNDARIES,
            // Inner Box (Shrunk to create 150px outer gap)
            { x: 150, y: 150, w: 700, h: 50 }, // Top
            { x: 150, y: 150, w: 50, h: 580 }, // Left
            { x: 800, y: 270, w: 50, h: 580 }, // Right
            { x: 150, y: 800, w: 700, h: 50 }, // Bottom

            { x: 270, y: 270, w: 450, h: 450 }, // Center block
            { x: 500, y: 300, w: 50, h: 200 }, // Block connection
        ],
    },
    // 20. The Boss
    {
        id: 20,
        theme: 'meadow',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 500 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 100, w: 600, h: 50 },
            { x: 200, y: 100, w: 50, h: 600 },
            { x: 750, y: 100, w: 50, h: 600 },
            { x: 200, y: 700, w: 250, h: 50 },
            { x: 550, y: 700, w: 250, h: 50 },
            // Goal inside, enter from bottom gap
            { x: 450, y: 550, w: 100, h: 50 }, // Guarding goal
        ],
    },
    // --- WORLD 2: The Stone Castle ---
    // 21. The Gatekeeper (Redesigned)
    {
        id: 21,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Central Spine (Dividing Left/Right)
            { x: 475, y: 130, w: 50, h: 700 },

            // Left Sector Walls (Forcing a weave down to button)
            { x: 150, y: 300, w: 325, h: 50 }, // Horizontal Barrier
            { x: 0, y: 600, w: 350, h: 50 },   // Horizontal Barrier above button

            // Right Sector Walls
            { x: 650, y: 200, w: 350, h: 50 }, // Top blocking wall
            { x: 525, y: 500, w: 300, h: 50 }, // Mid blocking wall

            // Goal Fortress (Bottom Right)
            { x: 850, y: 750, w: 100, h: 50 }, // Roof of goal room
            { x: 750, y: 850, w: 50, h: 100 }, // Wall of goal room (Gate will be here)
        ],
        // gates: [
        //     { id: 'g_main', x: 750, y: 850, w: 50, h: 100 }, // The Gatekeeper
        // ],
        // buttons: [
        //     { x: 100, y: 900, targetGateId: 'g_main', timer: 20 }, // Far reach
        // ],
        movingWalls: [
            // The Crushers (Vertical patrols)
            { id: 'm1', x: 250, y: 0, w: 50, h: 250, duration: 2000, path: [{ x: 250, y: 300 }] },
            { id: 'm2', x: 600, y: 550, w: 50, h: 250, duration: 2500, path: [{ x: 600, y: 750 }] },

            // The Sweeper (Horizontal)
            { id: 'm3', x: 525, y: 350, w: 100, h: 50, duration: 3000, path: [{ x: 850, y: 350 }] },
        ],
        boom: [
            { id: 'e1', x: 300, y: 450, w: 50, h: 50, type: 'patrol', path: [{ x: 100, y: 450 }, { x: 450, y: 450 }], duration: 3000 },
            { id: 'e2', x: 850, y: 100, w: 50, h: 50, type: 'patrol', path: [{ x: 850, y: 600 }], duration: 2500 }
        ],
        collectibles: [
            { x: 850, y: 850, type: 'gem' }, // In goal room
            { x: 50, y: 500, type: 'coin' }, // Left niche
            { x: 900, y: 100, type: 'coin' }, // Top Right corner
            { x: 500, y: 900, type: 'heart' }, // Bottom center danger zone
        ]
    },
    // 22. Double Trouble (Fixed: Added Portals)
    {
        id: 22,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 70,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 1000 },
            { x: 600, y: 0, w: 50, h: 1000 },
        ],
        portals: [
            { id: 'p1', x: 200, y: 200, color: 'blue', targetPortalId: 'p2' },
            { id: 'p2', x: 700, y: 800, color: 'orange', targetPortalId: 'p1' }
        ]
    },
    // 23. Remote Access (Fixed: Reachable Button + Wall Gap)
    {
        id: 23,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 80,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 500, w: 700, h: 50 }, // Shortened to leave room for trapdoor
            { x: 800, y: 0, w: 50, h: 500 },
        ],
        // gates: [
        //     { id: 'g1', x: 700, y: 500, w: 100, h: 50 }, // Horizontal Trapdoor
        // ],
        // buttons: [
        //     { x: 100, y: 200, targetGateId: 'g1', timer: 8 },
        // ]
    },
    // 24. The Courtyard (Fixed: Gates inside Walls)
    {
        id: 24,
        theme: 'castle',
        start: { x: 500, y: 500 },
        goal: { x: 500, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Top Wall Split (Gap 450-550)
            { x: 200, y: 200, w: 350, h: 50 },
            { x: 500, y: 200, w: 250, h: 50 },
            // Bottom Wall Split (Gap 450-550)
            { x: 200, y: 800, w: 250, h: 50 },
            { x: 550, y: 800, w: 250, h: 50 },

            { x: 200, y: 200, w: 50, h: 600 }, // Left box
            { x: 750, y: 200, w: 50, h: 600 }, // Right box
        ],
        // gates: [
        //     { id: 'g1', x: 450, y: 200, w: 100, h: 50 }, // Top Gate
        //     { id: 'g2', x: 450, y: 800, w: 100, h: 50 }, // Bottom Gate
        // ],
        // buttons: [
        //     { x: 300, y: 500, targetGateId: 'g1', timer: 6 },
        //     { x: 700, y: 500, targetGateId: 'g2', timer: 6 },
        // ]
    },
    // 25. Zig Zag Gates
    {
        id: 25,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 250, y: 0, w: 50, h: 800 },
            { x: 500, y: 200, w: 50, h: 800 },
            { x: 750, y: 0, w: 50, h: 800 },
        ],
        // gates: [
        //     { id: 'g1', x: 250, y: 100, w: 50, h: 100 },
        //     { id: 'g2', x: 500, y: 800, w: 50, h: 100 },
        //     { id: 'g3', x: 750, y: 100, w: 50, h: 100 },
        // ],
        // buttons: [
        //     { x: 150, y: 800, targetGateId: 'g1', timer: 8 },
        //     { x: 400, y: 100, targetGateId: 'g2', timer: 6 },
        //     { x: 650, y: 800, targetGateId: 'g3', timer: 4 },
        // ]
    },
    // 26. The Vault
    {
        id: 26,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 500, y: 500 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 300, w: 400, h: 50 }, // Inner Box Top
            { x: 300, y: 650, w: 400, h: 50 }, // Inner Box Bottom
            { x: 300, y: 300, w: 50, h: 400 }, // Inner Box Left
            // Inner Box Right (Split for Gate)
            { x: 650, y: 300, w: 50, h: 150 }, // Right Top
            { x: 650, y: 550, w: 50, h: 150 }, // Right Bottom
        ],
        // gates: [
        //     { id: 'g1', x: 650, y: 450, w: 50, h: 100 }, // Gate on Right side
        // ],
        // buttons: [
        //     { x: 800, y: 500, targetGateId: 'g1', timer: 10 }, // Button outside to right
        // ]
    },
    // 27. Crossfire
    {
        id: 27,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 0, w: 100, h: 450 },
            { x: 450, y: 550, w: 100, h: 450 },
            { x: 0, y: 450, w: 450, h: 100 },
            { x: 550, y: 450, w: 450, h: 100 },
        ],
        portals: [
            // TL -> TR
            { id: 'p1', x: 300, y: 300, targetPortalId: 'p2' },
            { id: 'p2', x: 700, y: 200, targetPortalId: 'p1' },
            // TR -> BL (Protected by G1)
            { id: 'p3', x: 800, y: 400, targetPortalId: 'p4', color: 'blue' }, // Exit from TR
            { id: 'p4', x: 200, y: 600, targetPortalId: 'p3', color: 'blue' }, // Enter BL
            // BL -> BR (Protected by G2)
            { id: 'p5', x: 300, y: 800, targetPortalId: 'p6', color: 'blue' }, // Exit from BL
            { id: 'p6', x: 700, y: 700, targetPortalId: 'p5', color: 'blue' }, // Enter BR
        ],
        // gates: [
        //     { id: 'g1', x: 775, y: 375, w: 50, h: 50 }, // Blocks p3 (TR)
        //     { id: 'g2', x: 275, y: 775, w: 50, h: 50 }, // Blocks p5 (BL)
        // ],
        // buttons: [
        //     { x: 850, y: 100, targetGateId: 'g1', timer: 7 }, // Button in TR (opens path to BL)
        //     { x: 100, y: 850, targetGateId: 'g2', timer: 7 }, // Button in BL (opens path to BR)
        // ]
    },
    // 28. Button Maze
    {
        id: 28,
        theme: 'castle',
        start: { x: 100, y: 900 },
        goal: { x: 100, y: 100 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 250, w: 880, h: 50 },
            { x: 120, y: 500, w: 880, h: 50 },
            { x: 0, y: 750, w: 870, h: 50 },
        ],
        // gates: [
        //     { id: 'g1', x: 800, y: 250, w: 200, h: 50 },
        //     { id: 'g2', x: 0, y: 500, w: 200, h: 50 },
        //     { id: 'g3', x: 800, y: 750, w: 200, h: 50 },
        // ],
        // buttons: [
        //     { x: 100, y: 400, targetGateId: 'g1', timer: 12 },
        //     { x: 900, y: 650, targetGateId: 'g2', timer: 12 },
        //     { x: 100, y: 900, targetGateId: 'g3', timer: 12 },
        // ]
    },
    // 29. Two Towers
    {
        id: 29,
        theme: 'castle',
        start: { x: 500, y: 900 },
        goal: { x: 900, y: 900 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 120, w: 100, h: 750 },
            { x: 700, y: 130, w: 100, h: 770 },
        ],
        gates: [
            { id: 'g1', x: 200, y: 400, w: 600, h: 50 }, // Left Tower Gate
            // { id: 'g2', x: 700, y: 400, w: 100, h: 50 }, // Right Tower Gate
        ],
        // buttons: [
        //     { x: 100, y: 500, targetGateId: 'g2', timer: 5 }, // Left btn opens right
        //     { x: 900, y: 500, targetGateId: 'g1', timer: 5 }, // Right btn opens left
        // ]
    },
    // 30. The Gauntlet
    {
        id: 30,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 100 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Wall 1 (x=200): Gap Top (150-250)
            { x: 200, y: 100, w: 50, h: 50 },
            { x: 200, y: 250, w: 50, h: 650 },
            // Wall 2 (x=400): Gap Bottom (750-850)
            { x: 400, y: 100, w: 50, h: 650 },
            { x: 400, y: 850, w: 50, h: 50 },
            // Wall 3 (x=600): Gap Top (150-250)
            { x: 600, y: 100, w: 50, h: 50 },
            { x: 600, y: 250, w: 50, h: 650 },
            // Wall 4 (x=800): Gap Bottom (750-850)
            { x: 800, y: 100, w: 50, h: 650 },
            { x: 800, y: 850, w: 50, h: 50 },
        ],
        // gates: [
        //     { id: 'g1', x: 200, y: 150, w: 50, h: 100 },
        //     { id: 'g2', x: 400, y: 750, w: 50, h: 100 },
        //     { id: 'g3', x: 600, y: 150, w: 50, h: 100 },
        //     { id: 'g4', x: 800, y: 750, w: 50, h: 100 },
        // ],
        // buttons: [
        //     { x: 150, y: 100, targetGateId: 'g1', timer: 6 },
        //     { x: 350, y: 900, targetGateId: 'g2', timer: 6 },
        //     { x: 550, y: 100, targetGateId: 'g3', timer: 6 },
        //     { x: 750, y: 900, targetGateId: 'g4', timer: 6 },
        // ],
        // movingWalls: [
        //     { id: 'm1', x: 300, y: 0, w: 50, h: 1000, duration: 3000, path: [{ x: 300, y: 0 }, { x: 350, y: 0 }] },
        //     { id: 'm2', x: 500, y: 0, w: 50, h: 1000, duration: 3000, path: [{ x: 500, y: 0 }, { x: 550, y: 0 }] },
        //     { id: 'm3', x: 700, y: 0, w: 50, h: 1000, duration: 3000, path: [{ x: 700, y: 0 }, { x: 750, y: 0 }] },

        // ]
    },
    // 31. Time Check (Messy Version)
    {
        id: 31,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 40, // FAST
        walls: [
            ...BOUNDARIES,
            // Messy Debris (Phase 1)
            { x: 220, y: 180, w: 40, h: 40 },
            { x: 350, y: 120, w: 30, h: 30 },
            { x: 150, y: 650, w: 50, h: 20 },
            { x: 420, y: 320, w: 40, h: 40 },
            { x: 680, y: 580, w: 30, h: 30 },
            { x: 750, y: 250, w: 40, h: 40 },
            { x: 820, y: 450, w: 20, h: 50 },
            { x: 380, y: 820, w: 40, h: 40 },
            { x: 550, y: 280, w: 30, h: 30 },
            { x: 620, y: 750, w: 40, h: 40 },
            { x: 180, y: 850, w: 30, h: 30 },
            { x: 850, y: 200, w: 40, h: 40 },
            { x: 480, y: 600, w: 25, h: 25 },
            { x: 250, y: 450, w: 35, h: 35 },
            { x: 700, y: 800, w: 45, h: 15 },
            // Messy Debris (Phase 2 - x2 MESSY!)
            { x: 120, y: 300, w: 30, h: 30 },
            { x: 900, y: 600, w: 30, h: 30 },
            { x: 300, y: 700, w: 25, h: 25 },
            { x: 600, y: 150, w: 35, h: 35 },
            { x: 450, y: 850, w: 20, h: 20 },
            { x: 780, y: 350, w: 30, h: 30 },
            { x: 150, y: 400, w: 25, h: 50 },
            { x: 550, y: 650, w: 40, h: 20 },
            { x: 880, y: 800, w: 30, h: 30 },
            { x: 280, y: 150, w: 30, h: 30 },
            { x: 650, y: 450, w: 25, h: 25 },
            { x: 400, y: 550, w: 20, h: 20 },
            { x: 830, y: 700, w: 35, h: 35 },
            { x: 230, y: 580, w: 25, h: 25 },
            { x: 720, y: 120, w: 30, h: 30 },
        ],
        gates: [
            { id: 'g1', x: 400, y: 400, w: 200, h: 200 }, // Big box
        ],
        buttons: [
            { x: 800, y: 100, targetGateId: 'g1', timer: 10 }
        ],
        movingWalls: [
            { id: 'm1', x: 300, y: 0, w: 50, h: 1000, duration: 2500, path: [{ x: 300, y: 0 }, { x: 500, y: 0 }] },
            { id: 'm2', x: 500, y: 0, w: 50, h: 1000, duration: 2500, path: [{ x: 500, y: 0 }, { x: 300, y: 0 }] }
        ],
        collectibles: [
            // Scattered loot (Phase 1)
            { x: 250, y: 250, type: 'gem' },
            { x: 750, y: 750, type: 'gem' },
            { x: 200, y: 800, type: 'coin' },
            { x: 800, y: 200, type: 'coin' },
            { x: 500, y: 500, type: 'heart' },
            { x: 350, y: 600, type: 'gem' },
            { x: 650, y: 300, type: 'gem' },
            // Scattered loot (Phase 2 - x2 MESSY!)
            { x: 150, y: 350, type: 'gem' },
            { x: 850, y: 550, type: 'gem' },
            { x: 450, y: 150, type: 'coin' },
            { x: 600, y: 850, type: 'coin' },
            { x: 350, y: 450, type: 'gem' },
            { x: 700, y: 650, type: 'gem' },
            { x: 520, y: 720, type: 'gem' },
        ]
    },
    // 32. Four Corners
    {
        id: 32,
        theme: 'castle',
        start: { x: 500, y: 500 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Central "+", but retracted to leave 4 gap corners
            { x: 450, y: 0, w: 100, h: 400 }, // Top
            { x: 450, y: 600, w: 100, h: 400 }, // Bottom
            { x: 0, y: 450, w: 400, h: 100 }, // Left
            { x: 600, y: 450, w: 400, h: 100 }, // Right
        ],
        // gates: [
        //     // Block TR (Top-Right)
        //     { id: 'g1', x: 500, y: 350, w: 100, h: 100 },

        //     // Block BL (Bottom-Left)
        //     { id: 'g2', x: 350, y: 500, w: 100, h: 100 },

        //     // Block BR (Bottom-Right)
        //     { id: 'g3', x: 500, y: 500, w: 150, h: 150 },
        // ],
        // buttons: [
        //     { x: 100, y: 100, targetGateId: 'g1', timer: 8 }, // TL (Open) -> Opens TR
        //     { x: 900, y: 100, targetGateId: 'g2', timer: 8 }, // TR (Gated) -> Opens BL
        //     { x: 100, y: 900, targetGateId: 'g3', timer: 8 }, // BL (Gated) -> Opens BR
        // ],
        movingWalls: [
            { id: 'm1', x: 450, y: 400, w: 100, h: 200, duration: 2000, path: [{ x: 450, y: 400 }, { x: 450, y: 600 }] } // Central block moving vertically
        ],
        goal: { x: 850, y: 850 } // BR (Gated)
    },
    // 33. Snake Gates
    {
        id: 33,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 500, y: 500 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 300, w: 800, h: 50 },
            { x: 900, y: 300, w: 100, h: 50 }, // Plug gap
            { x: 200, y: 600, w: 800, h: 50 },
            { x: 0, y: 600, w: 100, h: 50 }, // Plug gap
        ],
        // gates: [
        //     { id: 'g1', x: 800, y: 300, w: 100, h: 50 },
        //     { id: 'g2', x: 100, y: 600, w: 100, h: 50 },
        // ],
        // buttons: [
        //     { x: 500, y: 100, targetGateId: 'g1', timer: 8 },
        //     { x: 500, y: 450, targetGateId: 'g2', timer: 8 },
        // ],
        portals: [
            { id: 'p1', x: 900, y: 100, color: 'blue', targetPortalId: 'p2' },
            { id: 'p2', x: 500, y: 800, color: 'orange', targetPortalId: 'p1' }
        ]
    },
    // 34. The Double Trap
    {
        id: 34,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Wall 1 (Left): Gap at y=200
            { x: 350, y: 0, w: 50, h: 200 },
            { x: 350, y: 300, w: 50, h: 700 }, // Gap 200-300

            // Wall 2 (Right): Gap at y=700
            { x: 650, y: 0, w: 50, h: 700 },
            { x: 650, y: 800, w: 50, h: 200 }, // Gap 700-800
        ],
        // gates: [
        //     { id: 'g1', x: 350, y: 200, w: 50, h: 100 }, // Plug Wall 1
        //     { id: 'g2', x: 650, y: 700, w: 50, h: 100 }, // Plug Wall 2
        // ],
        // buttons: [
        //     { x: 100, y: 100, targetGateId: 'g1' }, // Top Left Corner
        //     { x: 500, y: 500, targetGateId: 'g2' }, // Dangerous Center
        // ],
        boom: [
            // Knight patrolling the center corridor (between walls)
            {
                id: 'e1', x: 500, y: 50, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 500, y: 0 }, { x: 500, y: 900 }],
                duration: 2000
            },
            // Knight guarding the final stretch
            {
                id: 'e2', x: 800, y: 50, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 800, y: 0 }, { x: 800, y: 800 }],
                duration: 2500
            }
        ]
    },
    // 35. Back and Forth Gauntlet
    // 35. Back and Forth Gauntlet
    {
        id: 35,
        theme: 'castle',
        start: { x: 100, y: 850 },
        goal: { x: 500, y: 100 },
        timeLimit: 120, // Strict for the distance
        walls: [
            ...BOUNDARIES,
            // Wall 1 (Bottom): Gap 150px at Right (0-850)
            { x: 0, y: 700, w: 850, h: 50 },

            // Wall 2 (Top): Gap 150px at Left (150-1000)
            { x: 150, y: 350, w: 850, h: 50 },

            // Two Vertical Walls at Center (Obstacles) with 150px Gaps
            // Left Center: Gap Bottom (y=550-700) -> 150px gap
            { x: 400, y: 350, w: 50, h: 200 },

            // Right Center: Gap Top (y=350-500) -> 150px gap
            { x: 600, y: 500, w: 50, h: 200 },
        ],
        // gates: [
        //     { id: 'g1', x: 850, y: 700, w: 150, h: 50 }, // Right Gap (Bottom) - WIDER
        //     { id: 'g2', x: 0, y: 350, w: 150, h: 50 }, // Left Gap (Top) - WIDER
        // ],
        // buttons: [
        //     { x: 100, y: 850, targetGateId: 'g1', timer: 10 }, // Bottom Left (Opens Right)
        //     { x: 900, y: 500, targetGateId: 'g2', timer: 8 }, // Mid Right (Opens Left)
        // ],
        boom: [
            // Knight 1: Bottom Corridor (Patrols Left-Right)
            {
                id: 'e1', x: 200, y: 700, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 200, y: 400 }, { x: 700, y: 800 }],
                duration: 3000
            },
            // Knight 2: Middle Corridor (Patrols Left-Right between walls)
            {
                id: 'e2', x: 200, y: 500, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 200, y: 525 }, { x: 900, y: 525 }], // Horizontal patrol in middle
                duration: 4000
            },
            // Knight 3: Top Corridor (Patrols Goal Area)
            {
                id: 'e3', x: 300, y: 200, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 400, y: 100 }, { x: 700, y: 100 }], // Horizontal guard
                duration: 2500
            }
        ]
    },
    // 36. The Obstacle Course
    {
        id: 36,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Internal Grid of Pillars
            { x: 250, y: 200, w: 100, h: 100 }, // Top Left
            { x: 650, y: 200, w: 100, h: 100 }, // Top Right
            { x: 450, y: 500, w: 100, h: 100 }, // Center
            { x: 250, y: 800, w: 100, h: 100 }, // Bottom Left
            { x: 650, y: 800, w: 100, h: 100 }, // Bottom Right

            // Small Walls (Debris)
            { x: 150, y: 500, w: 50, h: 50 }, // Left Flank
            { x: 800, y: 500, w: 50, h: 50 }, // Right Flank
            { x: 475, y: 350, w: 50, h: 50 }, // Top Mid Debris
            { x: 475, y: 650, w: 50, h: 50 }, // Bottom Mid Debris

            // Extra Density
            { x: 300, y: 50, w: 50, h: 50 }, // Top Edge Left
            { x: 700, y: 50, w: 50, h: 50 }, // Top Edge Right
            { x: 50, y: 300, w: 50, h: 50 }, // Left Edge
            { x: 900, y: 300, w: 50, h: 50 }, // Right Edge
            { x: 350, y: 550, w: 50, h: 50 }, // Inner Left
            { x: 650, y: 550, w: 50, h: 50 }, // Inner Right
        ],
        // gates: [
        //     { id: 'g_main', x: 800, y: 800, w: 100, h: 50 }, // Blocks Goal
        // ],
        // buttons: [
        //     { x: 500, y: 200, targetGateId: 'g_main', timer: 5 }, // Top Center (Between Top Pillars)
        // ],
        boom: [
            // Horizontal Patrols
            {
                id: 'e1', x: 350, y: 350, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 350, y: 350 }, { x: 650, y: 350 }],
                duration: 2500
            },
            {
                id: 'e2', x: 350, y: 650, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 650, y: 650 }, { x: 350, y: 650 }],
                duration: 2500
            }
        ]
    },
    // 37. The Hollow Fortress
    {
        id: 37,
        theme: 'castle',
        start: { x: 750, y: 500 },
        goal: { x: 500, y: 500 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Fortress Walls (Creating a 400x400 room from 300,300 to 700,700)
            { x: 300, y: 300, w: 400, h: 50 }, // Top Wall
            { x: 300, y: 650, w: 150, h: 50 }, // Bottom Left
            { x: 550, y: 650, w: 150, h: 50 }, // Bottom Right
            { x: 300, y: 350, w: 50, h: 300 }, // Left Wall
            { x: 650, y: 350, w: 50, h: 300 }, // Right Wall

            // Outer Satellite Walls (Hardening)
            { x: 150, y: 150, w: 100, h: 100 }, // Top Left Block
            { x: 750, y: 150, w: 100, h: 100 }, // Top Right Block
            { x: 150, y: 750, w: 100, h: 100 }, // Bottom Left Block
            { x: 750, y: 750, w: 100, h: 100 }, // Bottom Right Block

            // 10 Extra Walls (CHAOS Mode)
            { x: 400, y: 100, w: 200, h: 50 }, // Top Barrier (Long Horizontal)
            { x: 400, y: 800, w: 200, h: 50 }, // Bottom Barrier (Long Horizontal) - Moved Up
            { x: 50, y: 400, w: 50, h: 200 }, // Left Barrier (Tall Vertical)
            { x: 900, y: 400, w: 50, h: 200 }, // Right Barrier (Tall Vertical)
            { x: 250, y: 250, w: 50, h: 50 }, // Corner Debris TL
            { x: 700, y: 250, w: 50, h: 50 }, // Corner Debris TR
            { x: 250, y: 700, w: 50, h: 50 }, // Corner Debris BL
            { x: 700, y: 700, w: 50, h: 50 }, // Corner Debris BR
            { x: 500, y: 200, w: 50, h: 50 }, // Top Center Dot
            { x: 200, y: 500, w: 100, h: 50 }, // Side Block Left
        ],
        // gates: [
        //     { id: 'g_fort', x: 450, y: 650, w: 100, h: 50 }, // Fortress Gate (Bottom Center)
        // ],
        // buttons: [
        //     { x: 100, y: 100, targetGateId: 'g_fort' }, // Far Top-Left Corner
        // ],
        boom: [
            // Inner Guard (Patrols inside the fortress)
            {
                id: 'e1', x: 400, y: 400, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 380, y: 380 }, { x: 620, y: 580 }], // Diagonal patrol inside
                duration: 2000
            },
            // Outer Guard
            {
                id: 'e2', x: 500, y: 700, w: 40, h: 40,
                type: 'patrol',
                path: [{ x: 200, y: 700 }, { x: 800, y: 700 }], // Patrols below fortress
                duration: 3000
            }
        ],
        collectibles: [
            { x: 100, y: 500, type: 'coin' }, // Left Flank
            { x: 900, y: 500, type: 'coin' }, // Right Flank
            { x: 200, y: 200, type: 'gem' }, // Top Left (Near Key)
            { x: 800, y: 200, type: 'gem' }, // Top Right
            { x: 500, y: 850, type: 'gem' }, // Bottom Center (Start Area)
            { x: 500, y: 300, type: 'heart' }, // Top Center (Dangerous Spot)
        ]
    },
    // 38. The Rounded Cross (Redesign: Timed Challenge)
    {
        id: 38,
        theme: 'castle',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 130 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Top-Left Quadrant
            { x: 0, y: 0, w: 450, h: 250 },
            { x: 0, y: 250, w: 350, h: 100 },
            { x: 0, y: 350, w: 250, h: 100 },
            // Top-Right Quadrant
            { x: 550, y: 0, w: 450, h: 250 },
            { x: 650, y: 250, w: 350, h: 100 },
            { x: 750, y: 350, w: 250, h: 100 },
            // Bottom-Left Quadrant
            { x: 0, y: 550, w: 250, h: 100 },
            { x: 0, y: 650, w: 350, h: 100 },
            { x: 0, y: 750, w: 450, h: 250 },
            // Bottom-Right Quadrant
            { x: 750, y: 550, w: 250, h: 100 },
            { x: 650, y: 650, w: 350, h: 100 },
            { x: 550, y: 750, w: 450, h: 250 },
        ],
        gates: [
            { id: 'g_main', x: 450, y: 600, w: 100, h: 50 }, // Blocks Bottom Approach
        ],
        // buttons: [
        //     { x: 100, y: 500, targetGateId: 'g_main', timer: 7 }, // Far Left
        //     { x: 900, y: 500, targetGateId: 'g_main', timer: 7 }, // Far Right (Backup)
        // ],
        movingWalls: [
            // Sweeping Cross Attacks
            // { id: 'm1', x: 0, y: 0, w: 50, h: 1000, duration: 4000, path: [{ x: 500, y: 0 }] }, // Full Height Sweep Left-Right
            { id: 'm2', x: 0, y: 475, w: 1000, h: 50, duration: 3500, path: [{ x: 0, y: 200 }, { x: 1000, y: 800 }] } // Full Width Sweep Up-Down
        ],
        boom: [],
        collectibles: [
            { x: 50, y: 50, type: 'coin' }, // Deep Corner TL
            { x: 950, y: 50, type: 'coin' }, // Deep Corner TR
            { x: 50, y: 950, type: 'coin' }, // Deep Corner BL
            { x: 950, y: 950, type: 'coin' }, // Deep Corner BR
            { x: 500, y: 100, type: 'gem' }, // Top Gap
            { x: 100, y: 500, type: 'gem' }, // Left Gap
            { x: 900, y: 500, type: 'gem' }, // Right Gap
            { x: 500, y: 950, type: 'heart' }, // Start Area
        ]
    },
    // 39. Split Decision
    {
        id: 39,
        theme: 'castle',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 200, w: 100, h: 600 },
        ],
        gates: [
            { id: 'g_left', x: 300, y: 500, w: 150, h: 50 },
            { id: 'g_right', x: 550, y: 500, w: 150, h: 50 },
        ],
        // buttons: [
        //     { x: 400, y: 900, targetGateId: 'g_left' },
        //     { x: 600, y: 900, targetGateId: 'g_right' },
        // ]
    },
    // 40. Castle Master
    {
        id: 40,
        theme: 'castle',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 900 },
        timeLimit: 180,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 50, h: 800 },
            { x: 400, y: 200, w: 50, h: 800 },
            { x: 600, y: 0, w: 50, h: 800 },
            { x: 800, y: 200, w: 50, h: 800 },
        ],
        gates: [
            { id: 'g1', x: 400, y: 500, w: 50, h: 100 },
            { id: 'g2', x: 600, y: 500, w: 50, h: 100 },
        ],
        // buttons: [
        //     { x: 300, y: 400, targetGateId: 'g1', timer: 6 },
        //     { x: 700, y: 600, targetGateId: 'g2', timer: 6 },
        // ]
    },
    // --- WORLD 3: The Cloudy Sky ---
    // 41. Cloud Steps (Redesign)
    {
        id: 41,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Staggered Platforms
            { x: 200, y: 750, w: 600, h: 50 }, // Platform 1 (Gap Left/Right)
            { x: 0, y: 550, w: 400, h: 50 }, // Platform 2 (Gap Center)
            { x: 600, y: 550, w: 400, h: 50 },
            { x: 200, y: 350, w: 600, h: 50 }, // Platform 3 (Gap Left/Right)
        ],
        boom: [
            { id: 'e1', x: 150, y: 650, w: 40, h: 40, type: 'patrol', path: [{ x: 100, y: 650 }, { x: 950, y: 650 }], duration: 5000 },
            { id: 'e2', x: 900, y: 450, w: 40, h: 40, type: 'patrol', path: [{ x: 950, y: 450 }, { x: 100, y: 450 }], duration: 5000 },
        ],
        portals: [
            { id: 'p1', x: 100, y: 840, targetPortalId: 'p2', color: 'orange' },
            { id: 'p2', x: 850, y: 845, targetPortalId: 'p1', color: 'orange' },
        ],
        movingWalls: []
    },
    // 42. The Intersection (Redesign)
    {
        id: 42,
        theme: 'sky',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 80,
        walls: [
            ...BOUNDARIES,
            // Central Cross Hub
            { x: 450, y: 200, w: 100, h: 200 }, // Top Hub
            { x: 450, y: 600, w: 100, h: 200 }, // Bottom Hub
            { x: 150, y: 450, w: 350, h: 100 }, // Left Hub
            { x: 600, y: 450, w: 250, h: 100 }, // Right Hub
        ],
        movingWalls: [
            // Traffic
            { id: 'm1', x: 100, y: 100, w: 60, h: 60, duration: 2500, path: [{ x: 100, y: 800 }] },
            { id: 'm2', x: 840, y: 800, w: 60, h: 60, duration: 2500, path: [{ x: 840, y: 100 }] },
            { id: 'm3', x: 100, y: 300, w: 60, h: 60, duration: 3000, path: [{ x: 800, y: 300 }] },
            { id: 'm4', x: 800, y: 700, w: 60, h: 60, duration: 3000, path: [{ x: 100, y: 700 }] },
        ],
        boom: [
            // Corner Guards
            { id: 'e1', x: 100, y: 200, w: 40, h: 40, type: 'patrol', path: [{ x: 100, y: 200 }, { x: 300, y: 200 }], duration: 2000 },
            { id: 'e2', x: 700, y: 800, w: 40, h: 40, type: 'patrol', path: [{ x: 700, y: 800 }, { x: 900, y: 800 }], duration: 2000 },
        ],
        portals: [
            { id: 'p1', x: 85, y: 500, targetPortalId: 'p2', color: 'blue' }, // Left to Right Jump
            { id: 'p2', x: 950, y: 500, targetPortalId: 'p1', color: 'blue' }
        ]
    },
    // 43. The Wind Tunnel (Redesign)
    {
        id: 43,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Snake Corridor Walls
            { x: 200, y: 0, w: 50, h: 700 }, // Wall 1 Down
            { x: 400, y: 300, w: 50, h: 700 }, // Wall 2 Up
            { x: 600, y: 0, w: 50, h: 700 }, // Wall 3 Down
            { x: 800, y: 300, w: 50, h: 700 }, // Wall 4 Up
        ],
        movingWalls: [
            // "Wind" Pushers (Vertical Patrols in the lanes)
            { id: 'm1', x: 100, y: 200, w: 80, h: 50, duration: 2000, path: [{ x: 100, y: 800 }] },
            { id: 'm2', x: 300, y: 800, w: 80, h: 50, duration: 2000, path: [{ x: 300, y: 200 }] },
            { id: 'm3', x: 500, y: 200, w: 80, h: 50, duration: 2000, path: [{ x: 500, y: 800 }] },
            { id: 'm4', x: 700, y: 800, w: 80, h: 50, duration: 2000, path: [{ x: 700, y: 200 }] },
        ],
        boom: [],
        portals: [
            { id: 'p1', x: 815, y: 300, targetPortalId: 'p2', color: 'orange' }, // Lane Hopper
            { id: 'p2', x: 100, y: 750, targetPortalId: 'p1', color: 'orange' }
        ]
    },
    // 44. The Piston Press (Redesign)
    {
        id: 44,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            // Funnel walls
            { x: 200, y: 0, w: 100, h: 1000 },
            { x: 700, y: 0, w: 100, h: 1000 },
            { x: 450, y: 450, w: 200, h: 100 }, // Center Safe Block
        ],
        movingWalls: [
            // Crushing Pistons
            { id: 'm1', x: 300, y: 0, w: 150, h: 550, duration: 3500, path: [{ x: 300, y: 450 }] }, // Top Piston
            // { id: 'm2', x: 550, y: 0, w: 150, h: 400, duration: 3500, path: [{ x: 550, y: 750 }] }, // Bottom Piston
        ],
        // boom: [
        //     { id: 'e1', x: 500, y: 500, w: 30, h: 30, type: 'patrol', path: [{ x: 450, y: 500 }, { x: 550, y: 500 }], duration: 8000 }
        // ],
        portals: [
            { id: 'p1', x: 390, y: 450, targetPortalId: 'p2', color: 'blue' }, // Emergency Escape
            { id: 'p2', x: 100, y: 150, targetPortalId: 'p', color: 'blue' }
        ]
    },
    // 45. Dense Mists (Redesign)
    {
        id: 45,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Grid Layout (Checkerboard)
            { x: 300, y: 300, w: 100, h: 100 },
            { x: 600, y: 300, w: 100, h: 100 },
            { x: 300, y: 600, w: 100, h: 100 },
            { x: 600, y: 600, w: 100, h: 100 },
            { x: 450, y: 450, w: 100, h: 100 }, // Center Block
        ],
        movingWalls: [
            // Sliding Mist Blocks
            { id: 'm1', x: 500, y: 200, w: 100, h: 50, duration: 3000, path: [{ x: 800, y: 200 }] },
            { id: 'm2', x: 500, y: 800, w: 100, h: 50, duration: 3000, path: [{ x: 200, y: 800 }] },
        ],
        // boom: [
        //     // Grid Patrollers
        //     { id: 'e1', x: 100, y: 450, w: 30, h: 30, type: 'patrol', path: [{ x: 900, y: 450 }], duration: 3000 },
        //     { id: 'e2', x: 500, y: 100, w: 30, h: 30, type: 'patrol', path: [{ x: 500, y: 900 }], duration: 3000 }
        // ],
        portals: [
            { id: 'p1', x: 200, y: 500, targetPortalId: 'p2', color: 'orange' }, // Jumps across grid
            { id: 'p2', x: 800, y: 500, targetPortalId: 'p1', color: 'orange' }
        ]
    },
    // 46. The Hurricane (Redesign)
    {
        id: 46,
        theme: 'sky',
        start: { x: 100, y: 900 },
        goal: { x: 500, y: 500 }, // Center Eye
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Spiral Static Walls
            { x: 200, y: 200, w: 600, h: 50 }, // Top Bar
            { x: 800, y: 200, w: 50, h: 600 }, // Right Bar
            { x: 200, y: 800, w: 600, h: 50 }, // Bottom Bar
            { x: 200, y: 350, w: 50, h: 450 }, // Left Bar (Gap at top)
        ],
        movingWalls: [
            // Rotating Winds (Simulated)
            { id: 'm1', x: 300, y: 300, w: 100, h: 50, duration: 2000, path: [{ x: 600, y: 300 }] }, // Inner North
            { id: 'm2', x: 600, y: 700, w: 100, h: 50, duration: 2000, path: [{ x: 300, y: 700 }] }, // Inner South
        ],
        boom: [
            { id: 'e1', x: 500, y: 500, w: 40, h: 40, type: 'patrol', path: [{ x: 400, y: 400 }, { x: 600, y: 600 }], duration: 1500 } // Eye Guard
        ],
        portals: [
            { id: 'p1', x: 100, y: 100, targetPortalId: 'p2', color: 'blue' }, // Corner to corner
            { id: 'p2', x: 900, y: 900, targetPortalId: 'p1', color: 'blue' }
        ]
    },
    // 47. Crossfire (Redesign)
    {
        id: 47,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            // The X Divider
            { x: 0, y: 0, w: 300, h: 300 }, // Top Left Corner
            { x: 700, y: 0, w: 300, h: 300 }, // Top Right Corner
            { x: 0, y: 700, w: 300, h: 300 }, // Bottom Left Corner
            { x: 700, y: 700, w: 300, h: 300 }, // Bottom Right Corner
        ],
        movingWalls: [],
        boom: [
            // Diagonal Patrollers crossing the central X
            { id: 'e1', x: 300, y: 300, w: 30, h: 30, type: 'patrol', path: [{ x: 700, y: 700 }], duration: 2000 },
            { id: 'e2', x: 700, y: 300, w: 30, h: 30, type: 'patrol', path: [{ x: 300, y: 700 }], duration: 2000 },
        ],
        portals: [
            { id: 'p1', x: 150, y: 350, targetPortalId: 'p2', color: 'orange' }, // Side to Side
            { id: 'p2', x: 850, y: 350, targetPortalId: 'p1', color: 'orange' }
        ]
    },
    // 48. The Sky Fortress (Redesign)
    {
        id: 48,
        theme: 'sky',
        start: { x: 500, y: 850 }, // Moved up from 950 (Boundary)
        goal: { x: 500, y: 150 }, // Moved down from 50 (Boundary)
        timeLimit: 180,
        walls: [
            ...BOUNDARIES,
            // Fortress Outer Walls
            { x: 100, y: 200, w: 350, h: 50 },
            { x: 550, y: 200, w: 350, h: 50 },
            // Inner Keep
            { x: 300, y: 500, w: 400, h: 50 },
            { x: 300, y: 500, w: 50, h: 200 },
            { x: 650, y: 500, w: 50, h: 200 },
        ],
        gates: [
            { id: 'g_main', x: 450, y: 200, w: 100, h: 50 }, // Main Entrance
        ],
        // buttons: [
        //     { x: 100, y: 100, targetGateId: 'g_main' }, // Top Left Tower
        //     { x: 900, y: 100, targetGateId: 'g_main' }, // Top Right Tower
        // ],
        movingWalls: [
            // Gatekeepers
            { id: 'mw1', x: 400, y: 300, w: 200, h: 50, duration: 2000, path: [{ x: 400, y: 400 }] }
        ],
        boom: [
            { id: 'e1', x: 100, y: 300, w: 40, h: 40, type: 'patrol', path: [{ x: 900, y: 300 }], duration: 3000 }, // Outer Patrol
            { id: 'e2', x: 500, y: 600, w: 40, h: 40, type: 'patrol', path: [{ x: 350, y: 600 }, { x: 650, y: 600 }], duration: 1500 } // Inner Guard
        ],
        portals: [
            { id: 'p1', x: 100, y: 900, targetPortalId: 'p2', color: 'blue' }, // Base to Tower Jump
            { id: 'p2', x: 100, y: 150, targetPortalId: 'p1', color: 'blue' }, // Near Top Left Tower
            { id: 'p3', x: 900, y: 900, targetPortalId: 'p4', color: 'orange' },
            { id: 'p4', x: 900, y: 150, targetPortalId: 'p3', color: 'orange' } // Near Top Right Tower
        ]
    },
    // 49. The Hive (Master Difficulty)
    {
        id: 49,
        theme: 'sky',
        start: { x: 100, y: 250 },
        goal: { x: 100, y: 800 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Maze Structure
            { x: 115, y: 150, w: 120, h: 50 },
            { x: 200, y: 0, w: 50, h: 400 },
            { x: 400, y: 200, w: 50, h: 400 },
            { x: 600, y: 0, w: 50, h: 400 },
            { x: 800, y: 200, w: 50, h: 400 },
            { x: 50, y: 600, w: 800, h: 50 }, // Bottom Horizontal
        ],
        boom: [
            // The Swarm
            { id: 'bug1', x: 100, y: 200, w: 20, h: 20, type: 'bug', path: [{ x: 100, y: 500 }, { x: 300, y: 200 }], duration: 1500 },
            { id: 'bug2', x: 300, y: 500, w: 20, h: 20, type: 'bug', path: [{ x: 500, y: 200 }, { x: 300, y: 500 }], duration: 1500 },
            { id: 'bug3', x: 500, y: 200, w: 20, h: 20, type: 'bug', path: [{ x: 700, y: 500 }, { x: 500, y: 200 }], duration: 1500 },
            { id: 'bug4', x: 700, y: 500, w: 20, h: 20, type: 'bug', path: [{ x: 900, y: 200 }, { x: 700, y: 500 }], duration: 1500 },
            { id: 'bug5', x: 500, y: 800, w: 20, h: 20, type: 'bug', path: [{ x: 900, y: 800 }, { x: 100, y: 800 }], duration: 3000 }
        ],
        movingWalls: [],
        portals: [
            { id: 'p1', x: 100, y: 80, targetPortalId: 'p2', color: 'orange' },
            { id: 'p2', x: 850, y: 80, targetPortalId: 'p1', color: 'orange' }
        ]
    },
    // 50. Nimbus King (Boss Rework)
    {
        id: 50,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 180,
        walls: BOUNDARIES,
        movingWalls: [
            // The Hands
            { id: 'hand1', x: 0, y: 300, w: 300, h: 100, duration: 3000, path: [{ x: 200, y: 300 }] },
            { id: 'hand2', x: 700, y: 600, w: 300, h: 100, duration: 3000, path: [{ x: 500, y: 600 }] },
            // The Crushers
            { id: 'crush1', x: 400, y: 0, w: 200, h: 200, duration: 4000, path: [{ x: 400, y: 400 }] }
        ],
        boom: [
            // Minions
            { id: 'e1', x: 200, y: 200, w: 30, h: 30, type: 'bug', path: [{ x: 800, y: 800 }], duration: 4000 },
            { id: 'e2', x: 800, y: 200, w: 30, h: 30, type: 'bug', path: [{ x: 200, y: 800 }], duration: 4000 },
            { id: 'chaser', x: 0, y: 500, w: 20, h: 20, type: 'chase', path: [], duration: 0 } // Tailgater

        ]
    },
    // 51. Velocity (Master)
    {
        id: 51,
        theme: 'sky',
        start: { x: 100, y: 500 },
        goal: { x: 950, y: 500 },
        timeLimit: 40,
        walls: [
            ...BOUNDARIES,
            // The Tunnel
            { x: 0, y: 0, w: 1000, h: 425 }, // Top
            { x: 0, y: 575, w: 1000, h: 425 }, // Bottom
        ],
        // movingWalls: [
        //     // High Speed Cross Traffic
        //     { id: 't1', x: 300, y: 425, w: 40, h: 150, duration: 1500, path: [{ x: 300, y: 575 }] }, // Down
        //     { id: 't2', x: 600, y: 575, w: 40, h: 150, duration: 1500, path: [{ x: 600, y: 425 }] }, // Up
        //     { id: 't3', x: 800, y: 425, w: 40, h: 150, duration: 1500, path: [{ x: 800, y: 575 }] }, // Fast Down
        // ],
        boom: [
            { id: 'chaser', x: 0, y: 500, w: 20, h: 20, type: 'chase', path: [], duration: 0 } // Tailgater
        ]
    },
    // 52. Clockwork (Master)
    {
        id: 52,
        theme: 'sky',
        start: { x: 500, y: 500 },
        goal: { x: 500, y: 100 },
        timeLimit: 120,
        walls: BOUNDARIES,
        movingWalls: [
            // 4 Rotating Arms (Simulated by paths)
            { id: 'arm1', x: 500, y: 500, w: 400, h: 50, duration: 4000, path: [{ x: 900, y: 500 }, { x: 500, y: 900 }, { x: 100, y: 500 }, { x: 500, y: 100 }] },
            { id: 'arm2', x: 500, y: 500, w: 50, h: 400, duration: 4000, path: [{ x: 500, y: 900 }, { x: 100, y: 500 }, { x: 500, y: 100 }, { x: 900, y: 500 }] },
        ],
        boom: [
            // Patrols on the arms
            { id: 'e1', x: 300, y: 300, w: 30, h: 30, type: 'bug', path: [{ x: 700, y: 700 }], duration: 2000 },
            { id: 'e2', x: 700, y: 300, w: 30, h: 30, type: 'bug', path: [{ x: 300, y: 700 }], duration: 2000 }
        ]
    },
    // 53. The Chasm (Master)
    {
        id: 53,
        theme: 'sky',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 600, h: 1000 }, // The Chasm Pit (Wall)
        ],
        movingWalls: [
            // Moving Platforms (Safe Zones moving horizontally)
            { id: 'plat1', x: 200, y: 200, w: 100, h: 50, duration: 4000, path: [{ x: 700, y: 200 }] },
            { id: 'plat2', x: 700, y: 800, w: 100, h: 50, duration: 4000, path: [{ x: 200, y: 800 }] },
        ],
        boom: [
            // Aerial Patrols
            { id: 'e1', x: 400, y: 0, w: 30, h: 30, type: 'bug', path: [{ x: 400, y: 1000 }], duration: 3000 },
            { id: 'e2', x: 600, y: 1000, w: 30, h: 30, type: 'bug', path: [{ x: 600, y: 0 }], duration: 3000 }

        ],
        portals: [
            { id: 'p1', x: 100, y: 100, targetPortalId: 'p2', color: 'blue' }, // Shortcut across? No, just helper
            { id: 'p2', x: 850, y: 100, targetPortalId: 'p1', color: 'blue' } // Lands on moving platform path?
        ]
    },
    // 54. Ambush (Master)
    {
        id: 54,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Central Cage
            { x: 300, y: 300, w: 50, h: 400 },
            { x: 650, y: 300, w: 50, h: 400 },
            { x: 300, y: 300, w: 400, h: 50 },
            // Gate at bottom
        ],
        gates: [
            { id: 'g1', x: 350, y: 700, w: 300, h: 50, isOpen: false }
        ],
        buttons: [
            { x: 500, y: 500, targetGateId: 'g1' }
        ],
        boom: [
            // Trapped with player
            { id: 'e1', x: 350, y: 350, w: 30, h: 30, type: 'chase', path: [], duration: 0 },
            { id: 'e2', x: 620, y: 350, w: 30, h: 30, type: 'chase', path: [], duration: 0 },
            { id: 'e3', x: 350, y: 650, w: 30, h: 30, type: 'chase', path: [], duration: 0 },
            { id: 'e4', x: 620, y: 650, w: 30, h: 30, type: 'chase', path: [], duration: 0 }
        ]
    },
    // 55. Coin Rush (Master) - Redesigned Premium
    {
        id: 55,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 30,
        walls: [
            ...BOUNDARIES,
            // Symmetrical Corner Pillars (Temple Feel)
            { x: 0, y: 0, w: 150, h: 150 }, // Top Left
            { x: 850, y: 0, w: 150, h: 150 }, // Top Right
            { x: 0, y: 850, w: 150, h: 150 }, // Bottom Left
            { x: 850, y: 850, w: 150, h: 150 }, // Bottom Right
        ],
        collectibles: [
            // Diamond Pattern Center
            { x: 500, y: 300, type: 'coin' }, // Top
            { x: 300, y: 500, type: 'coin' }, // Left
            { x: 700, y: 500, type: 'coin' }, // Right
            { x: 500, y: 700, type: 'coin' }, // Bottom
            { x: 500, y: 500, type: 'gem' },  // Center Gem

            // Corner Coins (Risk/Reward)
            { x: 200, y: 200, type: 'coin' },
            { x: 800, y: 200, type: 'coin' },
            { x: 200, y: 800, type: 'coin' },
            { x: 800, y: 800, type: 'coin' }
        ],
        movingWalls: [
            // Synchronized "Closing Gates"
            // Left Side
            { id: 'm1', x: 200, y: 300, w: 50, h: 400, duration: 2500, path: [{ x: 400, y: 300 }] }, // Moves Right
            // Right Side
            { id: 'm2', x: 750, y: 300, w: 50, h: 400, duration: 2500, path: [{ x: 550, y: 300 }] }, // Moves Left
        ],
        boom: [
            // 1. Diagonal Crossers (The X factor)
            {
                id: 'e1', x: 200, y: 200, w: 40, h: 40, type: 'patrol',
                path: [{ x: 200, y: 200 }, { x: 800, y: 800 }],
                duration: 4000
            },
            {
                id: 'e2', x: 800, y: 200, w: 40, h: 40, type: 'patrol',
                path: [{ x: 800, y: 200 }, { x: 200, y: 800 }],
                duration: 4000
            },

            // 2. Horizontal Guards (Top/Bottom lane protection)
            {
                id: 'e3', x: 300, y: 250, w: 30, h: 30, type: 'patrol',
                path: [{ x: 300, y: 250 }, { x: 700, y: 250 }],
                duration: 3000
            },
            {
                id: 'e4', x: 300, y: 750, w: 30, h: 30, type: 'patrol',
                path: [{ x: 300, y: 750 }, { x: 700, y: 750 }],
                duration: 3000
            },

            // 3. Central Minion (Chaos in the middle)
            {
                id: 'e5', x: 500, y: 500, w: 20, h: 20, type: 'patrol',
                path: [{ x: 500, y: 400 }, { x: 500, y: 600 }],
                duration: 1500
            }
        ]
    },
    // 56. Needle Threading (Master)
    {
        id: 56,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 30,
        walls: [
            ...BOUNDARIES,
            // Static Base
            { x: 0, y: 700, w: 450, h: 50 }, { x: 550, y: 700, w: 450, h: 50 },
            { x: 0, y: 500, w: 450, h: 50 }, { x: 550, y: 500, w: 450, h: 50 },
            { x: 0, y: 300, w: 450, h: 50 }, { x: 550, y: 300, w: 450, h: 50 },
        ],
        movingWalls: [
            // Shifting Gaps
            { id: 'shift1', x: 450, y: 700, w: 100, h: 50, duration: 1500, path: [{ x: 550, y: 700 }, { x: 350, y: 700 }] },
            { id: 'shift2', x: 450, y: 500, w: 100, h: 50, duration: 2500, path: [{ x: 350, y: 500 }, { x: 550, y: 500 }] }, // Counter sync
        ],
        boom: []
    },
    // 57. Bullet Hell (Master)
    {
        id: 57,
        theme: 'sky',
        start: { x: 500, y: 500 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [], // No walls, just bullets
        boom: [
            // Spiral Patterns of Bugs
            { id: 'b1', x: 200, y: 200, w: 15, h: 15, type: 'bug', path: [{ x: 800, y: 800 }], duration: 2000 },
            { id: 'b2', x: 800, y: 200, w: 15, h: 15, type: 'bug', path: [{ x: 200, y: 800 }], duration: 2000 },
            { id: 'b3', x: 200, y: 800, w: 15, h: 15, type: 'bug', path: [{ x: 800, y: 200 }], duration: 2000 },
            { id: 'b4', x: 800, y: 800, w: 15, h: 15, type: 'bug', path: [{ x: 200, y: 200 }], duration: 2000 },
            { id: 'b5', x: 500, y: 100, w: 15, h: 15, type: 'bug', path: [{ x: 500, y: 900 }], duration: 1500 }, // Vertical
            { id: 'b6', x: 100, y: 500, w: 15, h: 15, type: 'bug', path: [{ x: 900, y: 500 }], duration: 1500 }, // Horizontal
            { id: 'b7', x: 400, y: 400, w: 15, h: 15, type: 'bug', path: [{ x: 600, y: 600 }, { x: 400, y: 600 }, { x: 600, y: 400 }], duration: 1000 } // Center Chaos
        ]
    },
    // 58. The Marathon (Master)
    {
        id: 58,
        theme: 'sky',
        start: { x: 900, y: 250 },
        goal: { x: 100, y: 900 },
        timeLimit: 180,
        walls: [
            ...BOUNDARIES,
            // Vertical Lanes
            { x: 150, y: 120, w: 50, h: 900 },
            { x: 350, y: 0, w: 50, h: 880 },
            { x: 550, y: 120, w: 50, h: 900 },
            { x: 750, y: 0, w: 50, h: 880 },
        ],
        boom: [
            { id: 'e1', x: 100, y: 100, w: 30, h: 30, type: 'bug', path: [{ x: 100, y: 900 }], duration: 4000 },
            { id: 'e2', x: 300, y: 900, w: 30, h: 30, type: 'bug', path: [{ x: 300, y: 100 }], duration: 4000 },
            { id: 'e3', x: 500, y: 100, w: 30, h: 30, type: 'bug', path: [{ x: 500, y: 900 }], duration: 4000 },
            { id: 'e4', x: 700, y: 900, w: 30, h: 30, type: 'bug', path: [{ x: 700, y: 100 }], duration: 4000 },
            { id: 'e5', x: 900, y: 100, w: 30, h: 30, type: 'bug', path: [{ x: 900, y: 900 }], duration: 4000 },
        ]
    },
    // 59. Divine Order (Master) - Redesigned Premium
    {
        id: 59,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 40,
        walls: [
            ...BOUNDARIES,
            // Central Symmetrical Structure
            { x: 200, y: 200, w: 50, h: 600 }, // Left Pillar
            { x: 750, y: 200, w: 50, h: 600 }, // Right Pillar
            { x: 350, y: 450, w: 300, h: 100 }, // Central Block
        ],
        collectibles: [
            // Circular Pattern
            { x: 500, y: 350, type: 'gem' }, // Top
            { x: 500, y: 650, type: 'gem' }, // Bottom
            { x: 350, y: 500, type: 'coin' }, // Left
            { x: 650, y: 500, type: 'coin' }, // Right
            // Corner Gems
            { x: 100, y: 100, type: 'gem' },
            { x: 900, y: 100, type: 'gem' },
            { x: 100, y: 900, type: 'gem' },
            { x: 900, y: 900, type: 'gem' }
        ],
        movingWalls: [
            // Rhythmic Horizontal Sweepers
            { id: 'm1', x: 250, y: 300, w: 500, h: 50, duration: 5000, path: [{ x: 250, y: 300 }, { x: 250, y: 300 }] }, // Top Bar (Static for now, meant to move?) -> Let's make it move Up/Down
            // Wait, previous design had left/right sweepers. Let's do simple horizontal gates.
            { id: 'h1', x: 0, y: 350, w: 100, h: 50, duration: 5000, path: [{ x: 50, y: 350 }] }, // Left Pulse
            { id: 'h2', x: 800, y: 350, w: 100, h: 50, duration: 5000, path: [{ x: 750, y: 350 }] }, // Right Pulse

            { id: 'h3', x: 0, y: 600, w: 100, h: 50, duration: 5000, path: [{ x: 50, y: 600 }] }, // Left Pulse Lower
            { id: 'h4', x: 800, y: 600, w: 100, h: 50, duration: 5000, path: [{ x: 750, y: 600 }] }, // Right Pulse Lower
        ],
        boom: [
            // Synchronized Box Patrol around Center Block
            { id: 'e1', x: 300, y: 400, w: 40, h: 40, type: 'patrol', path: [{ x: 700, y: 400 }], duration: 2000 }, // Top Edge
            { id: 'e2', x: 700, y: 600, w: 40, h: 40, type: 'patrol', path: [{ x: 300, y: 600 }], duration: 2000 }, // Bottom Edge

            // Vertical Guards
            { id: 'e3', x: 250, y: 200, w: 30, h: 30, type: 'patrol', path: [{ x: 250, y: 800 }], duration: 3000 }, // Left Lane
            { id: 'e4', x: 750, y: 800, w: 30, h: 30, type: 'patrol', path: [{ x: 750, y: 200 }], duration: 3000 }, // Right Lane
        ]
    },
    // 60. The Grandmaster (Master)
    // 60. The Clockwork Citadel (Master) - Premium Finale
    {
        id: 60,
        theme: 'sky',
        start: { x: 500, y: 950 },
        goal: { x: 500, y: 500 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            // Layer 1: The Outer Shell (Solid)
            { x: 100, y: 800, w: 800, h: 50 }, // Bottom Wall
            { x: 100, y: 150, w: 800, h: 50 }, // Top Wall
            { x: 100, y: 150, w: 50, h: 700 }, // Left Wall
            { x: 850, y: 150, w: 50, h: 700 }, // Right Wall

            // Layer 2: The Inner Sanctum (Gap at Top)
            { x: 300, y: 350, w: 400, h: 50 }, // Top
            { x: 300, y: 650, w: 400, h: 50 }, // Bottom
            { x: 300, y: 350, w: 50, h: 350 }, // Left
            { x: 650, y: 350, w: 50, h: 350 }, // Right
            // Gap for Inner Sanctum entry is seemingly closed? 
            // Let's make a gap in Top Wall of Inner Sanctum:
            // Revised Top:
            // { x: 300, y: 350, w: 150, h: 50 }, { x: 550, y: 350, w: 150, h: 50 }
        ],
        // Overwriting walls to fix gap
        movingWalls: [
            // The Hands of Time (Giant Sweeping Arms)
            // Left Hand (Sweeps Down)
            { id: 'h1', x: 150, y: 200, w: 350, h: 40, duration: 4000, path: [{ x: 150, y: 760 }] },
            // Right Hand (Sweeps Up)
            { id: 'h2', x: 500, y: 760, w: 350, h: 40, duration: 4000, path: [{ x: 500, y: 200 }] },

            // Inner Pendulums
            { id: 'p1', x: 350, y: 500, w: 50, h: 50, duration: 2000, path: [{ x: 600, y: 500 }] }
        ],
        boom: [
            // Sentinel Patrols (Outer Corners -> Center)
            { id: 's1', x: 150, y: 150, w: 30, h: 30, type: 'patrol', path: [{ x: 150, y: 800 }], duration: 3000 },
            { id: 's2', x: 820, y: 800, w: 30, h: 30, type: 'patrol', path: [{ x: 820, y: 150 }], duration: 3000 },

            // Elite Guardians (Inside Sanctum)
            { id: 'g1', x: 350, y: 400, w: 30, h: 30, type: 'chase', path: [], duration: 0 },
            { id: 'g2', x: 620, y: 600, w: 30, h: 30, type: 'chase', path: [], duration: 0 }
        ],
        portals: [
            // Breach: Outside Bottom -> Inside Top
            { id: 'p1', x: 150, y: 900, targetPortalId: 'p2', color: 'orange' }, // Entry Left
            { id: 'p2', x: 200, y: 250, targetPortalId: 'p1', color: 'orange' }, // Exit Top Left

            { id: 'p3', x: 850, y: 900, targetPortalId: 'p4', color: 'blue' }, // Entry Right
            { id: 'p4', x: 800, y: 250, targetPortalId: 'p3', color: 'blue' } // Exit Top Right
        ],
        collectibles: [
            { x: 500, y: 500, type: 'gem' }, // The Heart
            { x: 200, y: 750, type: 'coin' },
            { x: 800, y: 750, type: 'coin' },
            { x: 500, y: 200, type: 'coin' }
        ]
    },
    // --- WORLD 4: The Lava Cave ---
    // 61. Hot Foot
    {
        id: 61,
        theme: 'lava',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        hazards: [
            { x: 200, y: 400, w: 600, h: 200 } // Big lava pool in middle
        ]
    },
    // 62. Stepping Stones
    {
        id: 62,
        theme: 'lava',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 80,
        walls: BOUNDARIES,
        hazards: [
            { x: 0, y: 200, w: 1000, h: 600 } // Huge river
        ],
        crumblingFloors: [
            { id: 'c1', x: 200, y: 200, w: 100, h: 600, duration: 2000 }, // Bridge
            { id: 'c2', x: 500, y: 200, w: 100, h: 600, duration: 1500 },
            { id: 'c3', x: 800, y: 200, w: 100, h: 600, duration: 1000 }
        ]
    },
    // 63. Obsidian Maze
    {
        id: 63,
        theme: 'lava',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 50, h: 800 },
            { x: 500, y: 200, w: 50, h: 800 },
            { x: 800, y: 0, w: 50, h: 800 }
        ],
        hazards: [
            { x: 250, y: 400, w: 250, h: 50 },
            { x: 550, y: 600, w: 250, h: 50 }
        ]
    },
    // 64. The Crumble Run
    {
        id: 64,
        theme: 'lava',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 40,
        walls: BOUNDARIES,
        hazards: [
            { x: 0, y: 300, w: 1000, h: 400 }
        ],
        crumblingFloors: [
            { id: 'c1', x: 300, y: 300, w: 400, h: 400, duration: 800 }
        ]
    },
    // 65. Lava Flows
    {
        id: 65,
        theme: 'lava',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [],
        hazards: [
            { x: 200, y: 0, w: 100, h: 1000 },
            { x: 500, y: 0, w: 100, h: 1000 },
            { x: 800, y: 0, w: 100, h: 1000 }
        ],
        crumblingFloors: [
            { id: 'safe1', x: 300, y: 450, w: 100, h: 100, duration: 2000 },
            { id: 'safe2', x: 600, y: 450, w: 100, h: 100, duration: 2000 },
            { id: 'safe3', x: 900, y: 450, w: 100, h: 100, duration: 2000 }
        ]
    },
    { id: 66, theme: 'lava', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 400, y: 400, w: 200, h: 200 }] },
    { id: 67, theme: 'lava', start: { x: 900, y: 100 }, goal: { x: 100, y: 900 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 200, y: 400, w: 600, h: 200 }] },
    { id: 68, theme: 'lava', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 300, y: 0, w: 400, h: 1000 }], crumblingFloors: [{ id: 'c', x: 300, y: 450, w: 400, h: 100, duration: 1000 }] },
    { id: 69, theme: 'lava', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 0, y: 400, w: 400, h: 200 }, { x: 600, y: 400, w: 400, h: 200 }] },
    { id: 70, theme: 'lava', start: { x: 500, y: 500 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 0, y: 200, w: 1000, h: 50 }, { x: 0, y: 600, w: 1000, h: 50 }] },
    { id: 71, theme: 'lava', start: { x: 100, y: 900 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 200, y: 200, w: 50, h: 50 }] },
    // 72. Precision Challenge: Narrow Lava Corridors
    {
        id: 72,
        theme: 'lava',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 400, w: 1000, h: 50 },
            { x: 0, y: 550, w: 1000, h: 50 }
        ],
        hazards: [
            { x: 0, y: 450, w: 1000, h: 100 }
        ]
    },
    // 73. Precision Challenge: Gem Collection
    {
        id: 73,
        theme: 'lava',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 90,
        walls: BOUNDARIES,
        hazards: [
            { x: 200, y: 300, w: 200, h: 50 },
            { x: 600, y: 500, w: 200, h: 50 },
            { x: 200, y: 700, w: 200, h: 50 }
        ],
        collectibles: [
            { x: 300, y: 350, type: 'gem' }, { x: 700, y: 550, type: 'gem' }, { x: 300, y: 750, type: 'gem' },
            { x: 500, y: 450, type: 'gem' }, { x: 500, y: 650, type: 'gem' }
        ]
    },
    // 74. Precision Challenge: Crumbling Floor Parkour
    {
        id: 74,
        theme: 'lava',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 50,
        walls: BOUNDARIES,
        hazards: [
            { x: 0, y: 400, w: 1000, h: 200 }
        ],
        crumblingFloors: [
            { id: 'c1', x: 100, y: 400, w: 100, h: 200, duration: 1500 },
            { id: 'c2', x: 300, y: 400, w: 100, h: 200, duration: 1500 },
            { id: 'c3', x: 500, y: 400, w: 100, h: 200, duration: 1500 },
            { id: 'c4', x: 700, y: 400, w: 100, h: 200, duration: 1500 }
        ]
    },
    // 75. Precision Challenge: Moving Platform Jumps
    {
        id: 75,
        theme: 'lava',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 70,
        walls: BOUNDARIES,
        hazards: [
            { x: 200, y: 0, w: 600, h: 1000 }
        ],
        movingWalls: [
            { id: 'platform1', x: 200, y: 450, w: 100, h: 100, duration: 3000, path: [{ x: 700, y: 450 }] }
        ]
    },
    // 76. Precision Challenge: Timed Gate Sequence
    {
        id: 76,
        theme: 'lava',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 80,
        walls: BOUNDARIES,
        hazards: [
            { x: 300, y: 0, w: 50, h: 1000 },
            { x: 650, y: 0, w: 50, h: 1000 }
        ],
        gates: [
            { id: 'g1', x: 300, y: 450, w: 50, h: 100 },
            { id: 'g2', x: 650, y: 450, w: 50, h: 100 }
        ],
        buttons: [
            { x: 200, y: 500, targetGateId: 'g1' },
            { x: 550, y: 500, targetGateId: 'g2' }
        ]
    },
    // 77. Precision Challenge: Hazard Maze
    {
        id: 77,
        theme: 'lava',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 700 },
            { x: 600, y: 300, w: 50, h: 700 }
        ],
        hazards: [
            { x: 350, y: 200, w: 250, h: 50 },
            { x: 100, y: 500, w: 250, h: 50 },
            { x: 650, y: 700, w: 250, h: 50 }
        ]
    },
    // 78. Precision Challenge: Rotating Obstacles
    {
        id: 78,
        theme: 'lava',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'rot1', x: 300, y: 700, w: 100, h: 50, duration: 2000, path: [{ x: 600, y: 700 }] },
            { id: 'rot2', x: 600, y: 500, w: 100, h: 50, duration: 2000, path: [{ x: 300, y: 500 }] },
            { id: 'rot3', x: 300, y: 300, w: 100, h: 50, duration: 2000, path: [{ x: 600, y: 300 }] }
        ],
        hazards: [
            { x: 200, y: 650, w: 600, h: 50 },
            { x: 200, y: 450, w: 600, h: 50 },
            { x: 200, y: 250, w: 600, h: 50 }
        ]
    },
    // 79. Precision Challenge: Shrinking Safe Zones
    {
        id: 79,
        theme: 'lava',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 45,
        walls: BOUNDARIES,
        hazards: [
            { x: 0, y: 0, w: 200, h: 1000 },
            { x: 800, y: 0, w: 200, h: 1000 },
            { x: 200, y: 0, w: 600, h: 200 },
            { x: 200, y: 800, w: 600, h: 200 }
        ],
        crumblingFloors: [
            { id: 'safe1', x: 200, y: 400, w: 600, h: 200, duration: 3000 }
        ]
    },
    // 80. Precision Challenge: Final Gauntlet
    {
        id: 80,
        theme: 'lava',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 1000 },
            { x: 650, y: 0, w: 50, h: 1000 }
        ],
        hazards: [
            { x: 350, y: 700, w: 300, h: 50 },
            { x: 350, y: 400, w: 300, h: 50 }
        ],
        movingWalls: [
            { id: 'mw1', x: 350, y: 800, w: 100, h: 50, duration: 1500, path: [{ x: 550, y: 800 }] },
            { id: 'mw2', x: 550, y: 600, w: 100, h: 50, duration: 1500, path: [{ x: 350, y: 600 }] },
            { id: 'mw3', x: 350, y: 300, w: 100, h: 50, duration: 1500, path: [{ x: 550, y: 300 }] }
        ],
        crumblingFloors: [
            { id: 'c1', x: 350, y: 500, w: 300, h: 100, duration: 2000 }
        ]
    },
    // --- WORLD 5: The Dragon's Lair ---
    // 81. Gold Rush
    {
        id: 81,
        theme: 'lair',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingGoal: {
            path: [{ x: 900, y: 100 }, { x: 100, y: 100 }],
            duration: 4000
        }
    },
    // 82. Guarded Treasure
    {
        id: 82,
        theme: 'lair',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 80,
        walls: BOUNDARIES,
        boom: [
            { id: 'e1', x: 500, y: 400, w: 60, h: 60, type: 'patrol', duration: 2000, path: [{ x: 500, y: 600 }] },
            { id: 'e2', x: 200, y: 200, w: 60, h: 60, type: 'patrol', duration: 3000, path: [{ x: 800, y: 200 }] }
        ]
    },
    // 83. The Chase
    {
        id: 83,
        theme: 'lair',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingGoal: {
            path: [{ x: 500, y: 500 }, { x: 800, y: 100 }, { x: 200, y: 100 }],
            duration: 6000
        },
        boom: [
            { id: 'e1', x: 100, y: 500, w: 60, h: 60, type: 'patrol', duration: 4000, path: [{ x: 900, y: 500 }] }
        ]
    },
    // 84. Treasure Maze
    {
        id: 84,
        theme: 'lair',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 50, h: 700 },
            { x: 500, y: 300, w: 50, h: 700 },
            { x: 800, y: 0, w: 50, h: 700 }
        ],
        boom: [
            { id: 'e1', x: 350, y: 100, w: 60, h: 60, type: 'patrol', duration: 2000, path: [{ x: 350, y: 900 }] },
            { id: 'e2', x: 650, y: 900, w: 60, h: 60, type: 'patrol', duration: 2000, path: [{ x: 650, y: 100 }] }
        ]
    },
    // 85. Winged Feast
    {
        id: 85,
        theme: 'lair',
        start: { x: 500, y: 500 },
        goal: { x: 500, y: 200 },
        timeLimit: 45,
        walls: BOUNDARIES,
        movingGoal: {
            path: [{ x: 200, y: 200 }, { x: 800, y: 800 }, { x: 200, y: 800 }, { x: 800, y: 200 }],
            duration: 8000
        }
    },
    // Levels 86-100
    { id: 86, theme: 'lair', start: { x: 100, y: 900 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, boom: [{ id: 'e1', x: 300, y: 300, w: 50, h: 50, type: 'patrol', duration: 1000, path: [{ x: 700, y: 700 }] }] },
    { id: 87, theme: 'lair', start: { x: 900, y: 100 }, goal: { x: 100, y: 900 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 100, y: 100 }], duration: 2000 } },
    { id: 88, theme: 'lair', start: { x: 500, y: 500 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 200, y: 0, w: 100, h: 1000 }], boom: [{ id: 'e1', x: 600, y: 500, w: 60, h: 60, type: 'patrol', duration: 2000, path: [{ x: 600, y: 100 }] }] },
    { id: 89, theme: 'lair', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [{ id: 'm1', x: 200, y: 400, w: 600, h: 50, duration: 3000, path: [{ x: 200, y: 600 }] }], movingGoal: { path: [{ x: 900, y: 100 }], duration: 4000 } },
    { id: 90, theme: 'lair', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, boom: [{ id: 'e1', x: 200, y: 300, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 800, y: 300 }] }, { id: 'e2', x: 800, y: 600, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 200, y: 600 }] }] },
    { id: 91, theme: 'lair', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 900, y: 100 }], duration: 2000 }, hazards: [{ x: 400, y: 400, w: 200, h: 200 }] },
    { id: 92, theme: 'lair', start: { x: 500, y: 100 }, goal: { x: 500, y: 900 }, timeLimit: 60, walls: BOUNDARIES, boom: [{ id: 'e1', x: 500, y: 400, w: 100, h: 100, type: 'patrol', duration: 1000, path: [{ x: 500, y: 600 }] }] },
    { id: 93, theme: 'lair', start: { x: 200, y: 200 }, goal: { x: 800, y: 800 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 200, y: 800 }], duration: 5000 } },
    { id: 94, theme: 'lair', start: { x: 900, y: 900 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, boom: [{ id: 'e1', x: 500, y: 500, w: 50, h: 50, type: 'patrol', duration: 500, path: [{ x: 550, y: 550 }] }] },
    { id: 95, theme: 'lair', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 30, walls: BOUNDARIES, movingGoal: { path: [{ x: 900, y: 100 }, { x: 900, y: 900 }], duration: 3000 } },
    { id: 96, theme: 'lair', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 60, walls: BOUNDARIES, boom: [{ id: 'e1', x: 200, y: 200, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 200, y: 800 }] }, { id: 'e2', x: 800, y: 800, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 800, y: 200 }] }] },
    { id: 97, theme: 'lair', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 100, y: 100 }, { x: 900, y: 100 }], duration: 3000 }, hazards: [{ x: 300, y: 300, w: 400, h: 400 }] },
    { id: 98, theme: 'lair', start: { x: 500, y: 500 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, boom: [{ id: 'e1', x: 100, y: 100, w: 50, h: 50, type: 'patrol', duration: 1500, path: [{ x: 900, y: 900 }] }] },
    { id: 99, theme: 'lair', start: { x: 900, y: 900 }, goal: { x: 100, y: 100 }, timeLimit: 40, walls: BOUNDARIES, movingGoal: { path: [{ x: 800, y: 200 }], duration: 1000 }, boom: [{ id: 'e1', x: 500, y: 500, w: 200, h: 200, type: 'patrol', duration: 5000, path: [{ x: 500, y: 500 }] }] },
    // 100. THE DRAGON KING
    {
        id: 100,
        theme: 'lair',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 120,
        walls: BOUNDARIES,
        movingGoal: {
            path: [{ x: 100, y: 100 }, { x: 900, y: 100 }, { x: 500, y: 500 }],
            duration: 5000
        },
        boom: [
            { id: 'BOSS', x: 500, y: 400, w: 150, h: 150, type: 'patrol', duration: 1500, path: [{ x: 500, y: 600 }] },
            { id: 'minion1', x: 200, y: 200, w: 50, h: 50, type: 'patrol', duration: 3000, path: [{ x: 200, y: 800 }] },
            { id: 'minion2', x: 800, y: 200, w: 50, h: 50, type: 'patrol', duration: 3000, path: [{ x: 800, y: 800 }] }
        ],
        hazards: [
            { x: 0, y: 0, w: 100, h: 1000 },
            { x: 900, y: 0, w: 100, h: 1000 }
        ]
    }
];
