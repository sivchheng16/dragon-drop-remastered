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
    type: 'patrol' | 'chase';
    // Runtime
    currentPos?: { x: number; y: number };
    startTime?: number;
}

export interface LevelData {
    id: number;
    theme: LevelTheme;
    start: { x: number; y: number };
    goal: { x: number; y: number };
    walls: { x: number; y: number; w: number; h: number }[];
    gates?: Gate[];
    buttons?: Button[];
    movingWalls?: MovingWall[];
    hazards?: Hazard[];
    crumblingFloors?: CrumblingFloor[];
    enemies?: Enemy[];
    movingGoal?: {
        path: { x: number; y: number }[];
        duration: number;
        currentPos?: { x: number; y: number }; // Runtime
        startTime?: number; // Runtime
    };
    timeLimit: number;
    starTime?: [number, number]; // [3-star threshold, 2-star threshold] (Time Left)
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
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 100, w: 50, h: 700 }, // Vertical
            { x: 600, y: 300, w: 50, h: 700 }, // Vertical
        ],
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
            { x: 150, y: 150, w: 700, h: 50 }, // Top
            { x: 800, y: 150, w: 50, h: 700 }, // Right
            { x: 150, y: 800, w: 650, h: 50 }, // Bottom
            { x: 150, y: 300, w: 50, h: 500 }, // Left
            { x: 300, y: 300, w: 350, h: 50 }, // Inner Top
            { x: 600, y: 300, w: 50, h: 350 }, // Inner Right
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
            { x: 475, y: 0, w: 50, h: 425 },
            { x: 475, y: 575, w: 50, h: 425 },
            { x: 0, y: 475, w: 425, h: 50 },
            { x: 575, y: 475, w: 425, h: 50 },
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
            { x: 0, y: 300, w: 1000, h: 50 },
            { x: 0, y: 650, w: 1000, h: 50 },
            // Obstacles in tunnel
            { x: 300, y: 350, w: 50, h: 200 },
            { x: 600, y: 450, w: 50, h: 200 },
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
            { x: 250, y: 250, w: 150, h: 150 },
            { x: 600, y: 250, w: 150, h: 150 },
            { x: 250, y: 600, w: 150, h: 150 },
            { x: 600, y: 600, w: 150, h: 150 },
            { x: 450, y: 450, w: 100, h: 100 },
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
            { x: 650, y: 300, w: 50, h: 300 }, // Right (Gap at bottom)
        ],
    },
    // 9. Diagonal Step
    {
        id: 9,
        theme: 'meadow',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 75,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 600, w: 200, h: 50 },
            { x: 400, y: 400, w: 200, h: 50 },
            { x: 600, y: 200, w: 200, h: 50 },
        ],
    },
    // 10. The Fork
    {
        id: 10,
        theme: 'meadow',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 200, w: 100, h: 600 }, // Center Divider
            { x: 200, y: 400, w: 250, h: 50 }, // Left block
            { x: 550, y: 600, w: 250, h: 50 }, // Right block
        ],
    },
    // 11. Minimalist
    {
        id: 11,
        theme: 'meadow',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 40,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 0, w: 100, h: 450 },
            { x: 450, y: 550, w: 100, h: 450 }, // Tiny gap in middle
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
            { x: 300, y: 0, w: 50, h: 900 },
            { x: 650, y: 100, w: 50, h: 900 },
            { x: 350, y: 500, w: 300, h: 50 },
        ],
    },
    // 13. Corners
    {
        id: 13,
        theme: 'meadow',
        start: { x: 500, y: 500 },
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
        goal: { x: 900, y: 500 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            // Vertical Bars
            { x: 200, y: 100, w: 50, h: 800 },
            { x: 400, y: 100, w: 50, h: 800 },
            { x: 600, y: 100, w: 50, h: 800 },
            { x: 800, y: 100, w: 50, h: 800 },
            // Horizontal Cuts
            { x: 200, y: 300, w: 600, h: 50 },
            { x: 200, y: 700, w: 600, h: 50 },
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
            { x: 300, y: 300, w: 400, h: 400 }, // Box block center
            { x: 0, y: 500, w: 300, h: 50 },
            { x: 700, y: 500, w: 300, h: 50 },
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
            { x: 0, y: 400, w: 200, h: 50 },
            { x: 800, y: 600, w: 200, h: 50 },
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
            { x: 100, y: 100, w: 800, h: 50 },
            { x: 100, y: 100, w: 50, h: 800 },
            { x: 850, y: 100, w: 50, h: 800 },
            { x: 100, y: 850, w: 800, h: 50 },
            { x: 300, y: 300, w: 400, h: 400 }, // Center block
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
    // 21. The Gatekeeper
    {
        id: 21,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 0, w: 100, h: 1000 }, // Full vertical wall
        ],
        gates: [
            { id: 'g1', x: 450, y: 400, w: 100, h: 200 }, // Gate in middle
        ],
        buttons: [
            { x: 300, y: 500, targetGateId: 'g1' }, // Button before the wall
        ]
    },
    // 22. Double Trouble
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
        gates: [
            { id: 'g1', x: 300, y: 400, w: 50, h: 200 },
            { id: 'g2', x: 600, y: 400, w: 50, h: 200 },
        ],
        buttons: [
            { x: 200, y: 200, targetGateId: 'g1' },
            { x: 500, y: 800, targetGateId: 'g2' },
        ]
    },
    // 23. Remote Access
    {
        id: 23,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 80,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 500, w: 800, h: 50 },
            { x: 800, y: 0, w: 50, h: 550 },
        ],
        gates: [
            { id: 'g1', x: 800, y: 500, w: 50, h: 200 }, // Gate blocking path
        ],
        buttons: [
            { x: 100, y: 900, targetGateId: 'g1' }, // Button far away
        ]
    },
    // 24. The Courtyard
    {
        id: 24,
        theme: 'castle',
        start: { x: 500, y: 500 },
        goal: { x: 500, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 200, w: 600, h: 50 }, // Top box
            { x: 200, y: 800, w: 600, h: 50 }, // Bottom box
            { x: 200, y: 200, w: 50, h: 600 }, // Left box
            { x: 750, y: 200, w: 50, h: 600 }, // Right box
        ],
        gates: [
            { id: 'g1', x: 450, y: 200, w: 100, h: 50 }, // Top Gate
            { id: 'g2', x: 450, y: 800, w: 100, h: 50 }, // Bottom Gate
        ],
        buttons: [
            { x: 300, y: 500, targetGateId: 'g1' },
            { x: 700, y: 500, targetGateId: 'g2' }, // Decoy? Or multi-exit?
        ]
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
        gates: [
            { id: 'g1', x: 250, y: 100, w: 50, h: 100 },
            { id: 'g2', x: 500, y: 800, w: 50, h: 100 },
            { id: 'g3', x: 750, y: 100, w: 50, h: 100 },
        ],
        buttons: [
            { x: 150, y: 800, targetGateId: 'g1' },
            { x: 400, y: 100, targetGateId: 'g2' },
            { x: 650, y: 800, targetGateId: 'g3' },
        ]
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
            { x: 650, y: 300, w: 50, h: 400 }, // Inner Box Right
        ],
        gates: [
            { id: 'g1', x: 650, y: 450, w: 50, h: 100 }, // Gate on Right side
        ],
        buttons: [
            { x: 800, y: 500, targetGateId: 'g1' }, // Button outside to right
        ]
    },
    // 27. Crossfire
    {
        id: 27,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 0, w: 100, h: 450 },
            { x: 450, y: 550, w: 100, h: 450 },
            { x: 0, y: 450, w: 450, h: 100 },
            { x: 550, y: 450, w: 450, h: 100 },
        ],
        gates: [
            { id: 'g1', x: 450, y: 450, w: 100, h: 50 }, // Center Top
            { id: 'g2', x: 450, y: 500, w: 100, h: 50 }, // Center Bottom
        ],
        buttons: [
            { x: 200, y: 800, targetGateId: 'g1' }, // Bottom Left area opens top
            { x: 800, y: 200, targetGateId: 'g2' }, // Top Right area opens bottom
        ]
    },
    // 28. Button Maze
    {
        id: 28,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 100 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 0, y: 250, w: 800, h: 50 },
            { x: 200, y: 500, w: 800, h: 50 },
            { x: 0, y: 750, w: 800, h: 50 },
        ],
        gates: [
            { id: 'g1', x: 800, y: 250, w: 200, h: 50 },
            { id: 'g2', x: 0, y: 500, w: 200, h: 50 },
            { id: 'g3', x: 800, y: 750, w: 200, h: 50 },
        ],
        buttons: [
            { x: 100, y: 400, targetGateId: 'g1' },
            { x: 900, y: 650, targetGateId: 'g2' },
            { x: 100, y: 900, targetGateId: 'g3' },
        ]
    },
    // 29. Two Towers
    {
        id: 29,
        theme: 'castle',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 0, w: 100, h: 800 },
            { x: 700, y: 0, w: 100, h: 800 },
        ],
        gates: [
            { id: 'g1', x: 200, y: 400, w: 100, h: 50 }, // Left Tower Gate
            { id: 'g2', x: 700, y: 400, w: 100, h: 50 }, // Right Tower Gate
        ],
        buttons: [
            { x: 100, y: 500, targetGateId: 'g2' }, // Left btn opens right
            { x: 900, y: 500, targetGateId: 'g1' }, // Right btn opens left
        ]
    },
    // 30. The Gauntlet
    {
        id: 30,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 150,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 100, w: 50, h: 800 },
            { x: 400, y: 100, w: 50, h: 800 },
            { x: 600, y: 100, w: 50, h: 800 },
            { x: 800, y: 100, w: 50, h: 800 },
        ],
        gates: [
            { id: 'g1', x: 200, y: 450, w: 50, h: 100 },
            { id: 'g2', x: 400, y: 450, w: 50, h: 100 },
            { id: 'g3', x: 600, y: 450, w: 50, h: 100 },
            { id: 'g4', x: 800, y: 450, w: 50, h: 100 },
        ],
        buttons: [
            { x: 150, y: 100, targetGateId: 'g1' },
            { x: 350, y: 900, targetGateId: 'g2' },
            { x: 550, y: 100, targetGateId: 'g3' },
            { x: 750, y: 900, targetGateId: 'g4' },
        ]
    },
    // 31. Time Check
    {
        id: 31,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 40, // FAST
        walls: BOUNDARIES,
        gates: [
            { id: 'g1', x: 400, y: 400, w: 200, h: 200 }, // Big box
        ],
        buttons: [
            { x: 800, y: 100, targetGateId: 'g1' }
        ]
    },
    // 32. Four Corners
    {
        id: 32,
        theme: 'castle',
        start: { x: 500, y: 500 },
        goal: { x: 950, y: 500 }, // Edge
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 450, y: 0, w: 100, h: 1000 },
            { x: 0, y: 450, w: 1000, h: 100 },
        ],
        gates: [
            { id: 'g1', x: 550, y: 450, w: 50, h: 100 }, // Exit right
        ],
        buttons: [
            // Need to visit all 3 other corners linearly?
            { x: 100, y: 100, targetGateId: 'g_dummy1' },
            { x: 100, y: 900, targetGateId: 'g_dummy2' },
            { x: 900, y: 100, targetGateId: 'g1' }, // Only this one matters
        ]
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
            { x: 200, y: 600, w: 800, h: 50 },
        ],
        gates: [
            { id: 'g1', x: 800, y: 300, w: 100, h: 50 },
            { id: 'g2', x: 100, y: 600, w: 100, h: 50 },
        ],
        buttons: [
            { x: 500, y: 100, targetGateId: 'g1' },
            { x: 500, y: 450, targetGateId: 'g2' },
        ]
    },
    // 34. The Trap
    {
        id: 34,
        theme: 'castle',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: [
            ...BOUNDARIES,
            { x: 400, y: 0, w: 50, h: 1000 },
        ],
        gates: [
            { id: 'g1', x: 400, y: 450, w: 50, h: 100 },
        ],
        buttons: [
            { x: 300, y: 500, targetGateId: 'g1' },
        ]
    },
    // 35. Back and Forth
    {
        id: 35,
        theme: 'castle',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 120,
        walls: [
            ...BOUNDARIES,
            { x: 200, y: 300, w: 600, h: 50 },
            { x: 200, y: 700, w: 600, h: 50 },
        ],
        gates: [
            { id: 'g1', x: 200, y: 300, w: 50, h: 50 }, // Top Left Gap
            { id: 'g2', x: 750, y: 700, w: 50, h: 50 }, // Bottom Right Gap
        ],
        buttons: [
            { x: 800, y: 800, targetGateId: 'g1' },
            { x: 200, y: 500, targetGateId: 'g2' },
        ]
    },
    // 36. Open Field
    {
        id: 36,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 90,
        walls: BOUNDARIES,
        buttons: [
            { x: 200, y: 200, targetGateId: 'g1' },
            { x: 500, y: 500, targetGateId: 'g2' },
            { x: 800, y: 800, targetGateId: 'g3' },
        ],
        gates: [
            { id: 'g1', x: 850, y: 850, w: 150, h: 20 }, // Blocking goal
            { id: 'g2', x: 850, y: 870, w: 20, h: 130 },
            { id: 'g3', x: 850, y: 850, w: 20, h: 20 }, // just filler
            // Actually let's block the goal corner
            { id: 'g_main', x: 800, y: 800, w: 200, h: 50 },
            { id: 'g_main2', x: 800, y: 800, w: 50, h: 200 },
        ]
    },
    // 37. Triple Lock
    {
        id: 37,
        theme: 'castle',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 500 },
        timeLimit: 90,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 300, w: 400, h: 400 },
        ],
        gates: [
            { id: 'g1', x: 300, y: 650, w: 400, h: 50 },
        ],
        buttons: [
            { x: 100, y: 100, targetGateId: 'g1' },
            // Just one button needed really
        ]
    },
    // 38. The Spiral Gate
    {
        id: 38,
        theme: 'castle',
        start: { x: 100, y: 100 },
        goal: { x: 500, y: 500 },
        timeLimit: 150,
        walls: [
            // Spiral walls
            ...BOUNDARIES,
            { x: 200, y: 200, w: 600, h: 50 },
            { x: 800, y: 200, w: 50, h: 600 },
            { x: 200, y: 800, w: 650, h: 50 },
            { x: 200, y: 400, w: 50, h: 400 },
        ],
        gates: [
            { id: 'g1', x: 400, y: 400, w: 300, h: 50 }, // Inner
        ],
        buttons: [
            { x: 800, y: 800, targetGateId: 'g1' }, // Outer corner
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
        buttons: [
            { x: 400, y: 900, targetGateId: 'g_left' },
            { x: 600, y: 900, targetGateId: 'g_right' },
        ]
    },
    // 40. Castle Master
    {
        id: 40,
        theme: 'castle',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
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
        buttons: [
            { x: 300, y: 400, targetGateId: 'g1' },
            { x: 700, y: 600, targetGateId: 'g2' },
        ]
    },
    // --- WORLD 3: The Cloudy Sky ---
    // 41. Up in the Air
    {
        id: 41,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [
            {
                id: 'm1', x: 200, y: 400, w: 100, h: 60,
                duration: 3000,
                path: [{ x: 700, y: 400 }]
            }
        ]
    },
    // 42. Cloud Traffic
    {
        id: 42,
        theme: 'sky',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 400, y: 100, w: 60, h: 60, duration: 2000, path: [{ x: 400, y: 800 }] },
            { id: 'm2', x: 500, y: 800, w: 60, h: 60, duration: 2000, path: [{ x: 500, y: 100 }] },
        ]
    },
    // 43. Windy Path
    {
        id: 43,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 80,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 100, y: 300, w: 200, h: 50, duration: 4000, path: [{ x: 700, y: 300 }] },
            { id: 'm2', x: 700, y: 600, w: 200, h: 50, duration: 4000, path: [{ x: 100, y: 600 }] },
        ]
    },
    // 44. The Squeeze
    {
        id: 44,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 1000 },
            { x: 650, y: 0, w: 50, h: 1000 },
        ],
        movingWalls: [
            { id: 'm1', x: 350, y: 400, w: 100, h: 100, duration: 1500, path: [{ x: 550, y: 400 }] },
            { id: 'm2', x: 550, y: 600, w: 100, h: 100, duration: 1500, path: [{ x: 350, y: 600 }] },
        ]
    },
    // 45. Cloud Grid
    {
        id: 45,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 300, y: 200, w: 50, h: 50, duration: 2000, path: [{ x: 300, y: 800 }] },
            { id: 'm2', x: 500, y: 800, w: 50, h: 50, duration: 2000, path: [{ x: 500, y: 200 }] },
            { id: 'm3', x: 700, y: 200, w: 50, h: 50, duration: 2000, path: [{ x: 700, y: 800 }] },
            { id: 'h1', x: 200, y: 500, w: 50, h: 50, duration: 3000, path: [{ x: 800, y: 500 }] },
        ]
    },
    // --- WORLD 3: The Cloudy Sky ---
    // 41. Up in the Air
    {
        id: 41,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [
            {
                id: 'm1', x: 200, y: 400, w: 100, h: 60,
                duration: 3000,
                path: [{ x: 700, y: 400 }]
            }
        ]
    },
    // 42. Cloud Traffic
    {
        id: 42,
        theme: 'sky',
        start: { x: 100, y: 500 },
        goal: { x: 900, y: 500 },
        timeLimit: 60,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 400, y: 100, w: 60, h: 60, duration: 2000, path: [{ x: 400, y: 800 }] },
            { id: 'm2', x: 500, y: 800, w: 60, h: 60, duration: 2000, path: [{ x: 500, y: 100 }] },
        ]
    },
    // 43. Windy Path
    {
        id: 43,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 80,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 100, y: 300, w: 200, h: 50, duration: 4000, path: [{ x: 700, y: 300 }] },
            { id: 'm2', x: 700, y: 600, w: 200, h: 50, duration: 4000, path: [{ x: 100, y: 600 }] },
        ]
    },
    // 44. The Squeeze
    {
        id: 44,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 100,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 1000 },
            { x: 650, y: 0, w: 50, h: 1000 },
        ],
        movingWalls: [
            { id: 'm1', x: 350, y: 400, w: 100, h: 100, duration: 1500, path: [{ x: 550, y: 400 }] },
            { id: 'm2', x: 550, y: 600, w: 100, h: 100, duration: 1500, path: [{ x: 350, y: 600 }] },
        ]
    },
    // 45. Cloud Grid
    {
        id: 45,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 120,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 300, y: 200, w: 50, h: 50, duration: 2000, path: [{ x: 300, y: 800 }] },
            { id: 'm2', x: 500, y: 800, w: 50, h: 50, duration: 2000, path: [{ x: 500, y: 200 }] },
            { id: 'm3', x: 700, y: 200, w: 50, h: 50, duration: 2000, path: [{ x: 700, y: 800 }] },
            { id: 'h1', x: 200, y: 500, w: 50, h: 50, duration: 3000, path: [{ x: 800, y: 500 }] },
        ]
    },
    // 46. Storm Front
    {
        id: 46,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 100 },
        timeLimit: 120,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 200, y: 300, w: 600, h: 50, duration: 4000, path: [{ x: 200, y: 700 }] },
            { id: 'm2', x: 100, y: 500, w: 100, h: 100, duration: 2000, path: [{ x: 800, y: 500 }] },
        ]
    },
    // 47. Diagonal Drifters
    {
        id: 47,
        theme: 'sky',
        start: { x: 100, y: 900 },
        goal: { x: 900, y: 100 },
        timeLimit: 100,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'm1', x: 200, y: 800, w: 50, h: 50, duration: 3000, path: [{ x: 800, y: 200 }] },
            { id: 'm2', x: 800, y: 800, w: 50, h: 50, duration: 3000, path: [{ x: 200, y: 200 }] },
            { id: 'm3', x: 500, y: 500, w: 100, h: 100, duration: 5000, path: [{ x: 500, y: 500 }] },
        ]
    },
    // 48. The Gauntlet
    {
        id: 48,
        theme: 'sky',
        start: { x: 500, y: 950 },
        goal: { x: 500, y: 50 },
        timeLimit: 150,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 0, w: 50, h: 1000 },
            { x: 650, y: 0, w: 50, h: 1000 },
        ],
        movingWalls: [
            { id: 'mw1', x: 350, y: 200, w: 100, h: 50, duration: 1000, path: [{ x: 550, y: 200 }] },
            { id: 'mw2', x: 550, y: 400, w: 100, h: 50, duration: 1000, path: [{ x: 350, y: 400 }] },
            { id: 'mw3', x: 350, y: 600, w: 100, h: 50, duration: 1000, path: [{ x: 550, y: 600 }] },
            { id: 'mw4', x: 550, y: 800, w: 100, h: 50, duration: 1000, path: [{ x: 350, y: 800 }] },
        ]
    },
    // 49. Cloud Maze
    {
        id: 49,
        theme: 'sky',
        start: { x: 100, y: 100 },
        goal: { x: 900, y: 900 },
        timeLimit: 180,
        walls: [
            ...BOUNDARIES,
            { x: 300, y: 300, w: 400, h: 400 },
        ],
        movingWalls: [
            { id: 'm1', x: 100, y: 500, w: 100, h: 100, duration: 4000, path: [{ x: 100, y: 100 }] },
            { id: 'm2', x: 800, y: 100, w: 100, h: 100, duration: 4000, path: [{ x: 800, y: 500 }] },
            { id: 'm3', x: 500, y: 100, w: 50, h: 100, duration: 2000, path: [{ x: 500, y: 250 }] },
            { id: 'm4', x: 500, y: 800, w: 50, h: 100, duration: 2000, path: [{ x: 500, y: 750 }] },
        ]
    },
    // 50. Nimbus King
    {
        id: 50,
        theme: 'sky',
        start: { x: 500, y: 900 },
        goal: { x: 500, y: 500 },
        timeLimit: 200,
        walls: BOUNDARIES,
        movingWalls: [
            { id: 'boss1', x: 100, y: 100, w: 200, h: 100, duration: 5000, path: [{ x: 700, y: 100 }] },
            { id: 'boss2', x: 700, y: 800, w: 200, h: 100, duration: 5000, path: [{ x: 100, y: 800 }] },
            { id: 'orb1', x: 450, y: 450, w: 100, h: 100, duration: 1000, path: [{ x: 450, y: 450 }] },
        ]
    },
    // 51. Fast Lane
    {
        id: 51, theme: 'sky', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [
            { id: 'f1', x: 400, y: 100, w: 50, h: 50, duration: 500, path: [{ x: 400, y: 900 }] },
            { id: 'f2', x: 600, y: 900, w: 50, h: 50, duration: 500, path: [{ x: 600, y: 100 }] },
        ]
    },
    // 52. Precise Timing
    {
        id: 52, theme: 'sky', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 90, walls: BOUNDARIES, movingWalls: [
            { id: 'g1', x: 200, y: 400, w: 600, h: 50, duration: 2000, path: [{ x: -400, y: 400 }] },
        ]
    },
    { id: 53, theme: 'sky', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 120, walls: BOUNDARIES, movingWalls: [{ id: 'm1', x: 0, y: 500, w: 1000, h: 50, duration: 4000, path: [{ x: 0, y: 200 }] }] },
    { id: 54, theme: 'sky', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 120, walls: BOUNDARIES, movingWalls: [{ id: 'm1', x: 500, y: 0, w: 50, h: 1000, duration: 4000, path: [{ x: 800, y: 0 }] }] },
    { id: 55, theme: 'sky', start: { x: 200, y: 200 }, goal: { x: 800, y: 800 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [] },
    { id: 56, theme: 'sky', start: { x: 500, y: 500 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [] },
    { id: 57, theme: 'sky', start: { x: 100, y: 900 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [] },
    { id: 58, theme: 'sky', start: { x: 500, y: 100 }, goal: { x: 500, y: 900 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [] },
    { id: 59, theme: 'sky', start: { x: 250, y: 250 }, goal: { x: 750, y: 750 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [] },
    { id: 60, theme: 'sky', start: { x: 500, y: 500 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [] },
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
        walls: [...BOUNDARIES, { x: 0, y: 0, w: 1000, h: 1000 }],
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
        movingWalls: [
            { id: 'raft1', x: 200, y: 400, w: 100, h: 200, duration: 3000, path: [{ x: 200, y: 400 }] }
        ],
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
    { id: 72, theme: 'lava', start: { x: 900, y: 900 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 73, theme: 'lava', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 74, theme: 'lava', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 75, theme: 'lava', start: { x: 900, y: 100 }, goal: { x: 100, y: 900 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 76, theme: 'lava', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 77, theme: 'lava', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 78, theme: 'lava', start: { x: 500, y: 500 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 79, theme: 'lava', start: { x: 100, y: 900 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
    { id: 80, theme: 'lava', start: { x: 900, y: 900 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [] },
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
        enemies: [
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
        enemies: [
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
        enemies: [
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
    { id: 86, theme: 'lair', start: { x: 100, y: 900 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, enemies: [{ id: 'e1', x: 300, y: 300, w: 50, h: 50, type: 'patrol', duration: 1000, path: [{ x: 700, y: 700 }] }] },
    { id: 87, theme: 'lair', start: { x: 900, y: 100 }, goal: { x: 100, y: 900 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 100, y: 100 }], duration: 2000 } },
    { id: 88, theme: 'lair', start: { x: 500, y: 500 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, hazards: [{ x: 200, y: 0, w: 100, h: 1000 }], enemies: [{ id: 'e1', x: 600, y: 500, w: 60, h: 60, type: 'patrol', duration: 2000, path: [{ x: 600, y: 100 }] }] },
    { id: 89, theme: 'lair', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 60, walls: BOUNDARIES, movingWalls: [{ id: 'm1', x: 200, y: 400, w: 600, h: 50, duration: 3000, path: [{ x: 200, y: 600 }] }], movingGoal: { path: [{ x: 900, y: 100 }], duration: 4000 } },
    { id: 90, theme: 'lair', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, enemies: [{ id: 'e1', x: 200, y: 300, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 800, y: 300 }] }, { id: 'e2', x: 800, y: 600, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 200, y: 600 }] }] },
    { id: 91, theme: 'lair', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 900, y: 100 }], duration: 2000 }, hazards: [{ x: 400, y: 400, w: 200, h: 200 }] },
    { id: 92, theme: 'lair', start: { x: 500, y: 100 }, goal: { x: 500, y: 900 }, timeLimit: 60, walls: BOUNDARIES, enemies: [{ id: 'e1', x: 500, y: 400, w: 100, h: 100, type: 'patrol', duration: 1000, path: [{ x: 500, y: 600 }] }] },
    { id: 93, theme: 'lair', start: { x: 200, y: 200 }, goal: { x: 800, y: 800 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 200, y: 800 }], duration: 5000 } },
    { id: 94, theme: 'lair', start: { x: 900, y: 900 }, goal: { x: 100, y: 100 }, timeLimit: 60, walls: BOUNDARIES, enemies: [{ id: 'e1', x: 500, y: 500, w: 50, h: 50, type: 'patrol', duration: 500, path: [{ x: 550, y: 550 }] }] },
    { id: 95, theme: 'lair', start: { x: 100, y: 500 }, goal: { x: 900, y: 500 }, timeLimit: 30, walls: BOUNDARIES, movingGoal: { path: [{ x: 900, y: 100 }, { x: 900, y: 900 }], duration: 3000 } },
    { id: 96, theme: 'lair', start: { x: 100, y: 100 }, goal: { x: 900, y: 900 }, timeLimit: 60, walls: BOUNDARIES, enemies: [{ id: 'e1', x: 200, y: 200, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 200, y: 800 }] }, { id: 'e2', x: 800, y: 800, w: 50, h: 50, type: 'patrol', duration: 2000, path: [{ x: 800, y: 200 }] }] },
    { id: 97, theme: 'lair', start: { x: 500, y: 900 }, goal: { x: 500, y: 100 }, timeLimit: 60, walls: BOUNDARIES, movingGoal: { path: [{ x: 100, y: 100 }, { x: 900, y: 100 }], duration: 3000 }, hazards: [{ x: 300, y: 300, w: 400, h: 400 }] },
    { id: 98, theme: 'lair', start: { x: 500, y: 500 }, goal: { x: 900, y: 100 }, timeLimit: 60, walls: BOUNDARIES, enemies: [{ id: 'e1', x: 100, y: 100, w: 50, h: 50, type: 'patrol', duration: 1500, path: [{ x: 900, y: 900 }] }] },
    { id: 99, theme: 'lair', start: { x: 900, y: 900 }, goal: { x: 100, y: 100 }, timeLimit: 40, walls: BOUNDARIES, movingGoal: { path: [{ x: 800, y: 200 }], duration: 1000 }, enemies: [{ id: 'e1', x: 500, y: 500, w: 200, h: 200, type: 'patrol', duration: 5000, path: [{ x: 500, y: 500 }] }] },
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
        enemies: [
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
