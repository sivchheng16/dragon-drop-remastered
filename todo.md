# Dragon Drop Remastered - Development Checklist

## Phase 1: Core Systems & "Juice" (The Foundation)
- [x] **Audio System**
    - [x] Create `AudioManager.ts` singleton
    - [x] Implement BGM loading and looping
    - [x] Implement SFX triggering (one-shot)
    - [x] Add muted/volume control logic
- [x] **Visual Feedback ("Juice")**
    - [x] Create `ParticleSystem.ts`
    - [x] Implement "burst" effect for wall hits
    - [x] Implement "confetti" effect for winning
    - [x] Add screen shake effect on collision
    - [x] Add trail renderer behind the dragon
- [x] **Game State Enhancements**
    - [x] Add `stars` calculation logic (based on time)
    - [x] Add persistent storage (save/load progress)

## Phase 2: World 1 - The Green Meadows (Levels 1-20)
- [x] **Assets**
    - [x] Add "Grass" background pattern
    - [/] Add "Wooden Fence" wall sprite (Using fallback)
- [x] **Mechanics**
    - [x] Refine "Drag" mechanics for smoothness (Already good)
- [x] **Levels**
    - [x] Design Levels 1-5 (Simple movement)
    - [x] Design Levels 6-10 (Wide walls)
    - [x] Design Levels 11-15 (Corners)
    - [x] Design Levels 16-20 (Introduction of speed)

## Phase 3: World 2 - The Stone Castle (Levels 21-40)
- [x] **Assets**
    - [x] Add "Stone Floor" background
    - [x] Add "Stone Wall" sprite
- [x] **Mechanics**
    - [x] Implement **Gates** (Open when button clicked)
    - [x] Implement **Buttons** entity
- [x] **Levels**
    - [x] Design Levels 21-40 with Gate puzzles

## Phase 4: World 3 - The Cloudy Sky (Levels 41-60)
- [x] **Assets**
    - [x] Add "Sky" background (already exists, refine)
    - [x] Add "Cloud" obstacles
- [x] **Mechanics**
    - [x] Implement **Moving Obstacles** (Linear paths)
- [x] **Levels**
    - [x] Design Levels 41-45 (Basic Clouds)
    - [x] Design Levels 46-60 with more complexity

## Phase 5: World 4 - The Lava Cave (Levels 61-80)
- [x] **Assets**
    - [x] Add "Lava" animated background
    - [x] Add "Obsidian" walls
- [x] **Mechanics**
    - [x] Implement **Crumbling Floor** (Time-based tiles)
- [x] **Levels**
    - [x] Design Levels 61-80 with speed challenges

## Phase 6: World 5 - The Dragon's Lair (Levels 81-100)
- [x] **Assets**
    - [x] Add "Treasure Gold" background
- [x] **Mechanics**
    - [x] Implement **Moving Goals**
    - [x] Implement **Boss** (Chasing enemy?)
- [x] **Levels**
    - [x] Design Levels 81-100 (Complex)

## Phase 7: UI & Polish
- [x] **Menus**
    - [x] Create `LevelSelector` component (Map style)
    - [x] Create `MainMenu` with "Play", "Options", "Credits"
    - [x] Create `WinScreen` with star rating animation
- [x] **Accessibilty / Ease of Use**
    - [x] Add "Tutorial" overlays for first-time mechanics
    - [x] Ensure large click targets for all UI

## Phase 8: Deployment
- [x] Verify Electron build for Linux
- [x] Create release artifacts (AppImage)
- [x] Test on target hardware (low-end capability check)

# Conclusion
Project **Dragon Drop Remastered** is complete.
