# Logic Verification & Skill Comparison

## Critical Logic Issues
- [x] **Multi-Point Path Interpolation Broken**: `GameEngine.update()` only considers `path[0]`. Levels with multi-point paths (83, 85, 100, etc.) will fail to work as designed.
    -   *Impact*: Moving walls/goals/enemies will just oscillate between Start and Point 1, ignoring the rest of the path.
    -   *Fix*: Implement proper path segment handling in `GameEngine.ts`.
- [x] **Level 36 (Open Field) Impossible**: Gates `g_main` and `g_main2` (at 800,800) physically block the Goal (900,900) but have no associated buttons to open them.
    -   *Fix*: Add buttons for these gates or remove them.
- [x] **Level 32 (Four Corners)**: Button targets `g_dummy1` and `g_dummy2` do not exist.
    -   *Status*: Harmless (logic ignores missing gates), but confusing. Confirm intent.

## SKILL.md Improvements
- [ ] **Sprite Atlas**: Currently images are loaded individually (`dragon.png`, `wall.png`).
    -   *Improvement*: Combine into a single Texture Atlas (Sprite Sheet) to reduce draw calls and manage assets better (as per "Sprite Systems").
- [x] **Tilemap System**: Walls are manually defined rects (`{x, y, w, h}`).
    -   *Improvement*: Implement a Grid-based Tilemap system (e.g. 32x32 tiles) for easier level design and collision efficiency. (Implemented Pilot in Level 1)

## Plan to Proceed
1.  **Refactor Movement Logic**: Update `GameEngine` to handle multi-point paths (interpolate between `path[i]` and `path[i+1]` based on `t`).
2.  **Fix Level 36**: Modify `levels.ts` to make the level solvable.
3.  **Clean up Level 32**: Remove or Implement dummy buttons.
4.  (Optional) **Sprite Atlas**: If performance becomes an issue, implement Atlas loader.
