import React, { useEffect, useRef } from 'react';
import { LevelTheme } from '../game/levels';

interface LevelSelectorProps {
    onSelectLevel: (levelId: number) => void;
    onBack: () => void;
    completedLevels: number[]; // IDs of completed levels
}

const WORLDS = [
    { name: "Meadow", start: 1, end: 20, theme: 'meadow' },
    { name: "Castle", start: 21, end: 40, theme: 'castle' },
    { name: "Sky", start: 41, end: 60, theme: 'sky' },
    // { name: "Lava", start: 61, end: 80, theme: 'lava' },
    // { name: "Lair", start: 81, end: 100, theme: 'lair' },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelectLevel, onBack, completedLevels }) => {
    // Calculate next uncompleted level with smart priority
    const getNextLevel = () => {
        // Calculate next uncompleted level (highest completed + 1)
        const nextUncompletedLevel = completedLevels.length === 0
            ? 1
            : Math.max(...completedLevels) + 1;

        // Get last played level from localStorage
        const lastPlayedLevel = localStorage.getItem('dragon_drop_last_played_level');

        if (lastPlayedLevel) {
            const lastPlayed = parseInt(lastPlayedLevel);

            // Only use last played if it's >= next uncompleted level
            // This means user is progressing forward, not replaying old levels
            if (lastPlayed >= nextUncompletedLevel) {
                return Math.min(lastPlayed, 60); // Cap at 60 levels
            }
        }

        // Default: next uncompleted level (ignores replays of old levels)
        return Math.min(nextUncompletedLevel, 60);
    };

    const nextLevel = getNextLevel();

    // Determine which world tab the next level is in
    const getWorldIndexForLevel = (levelId: number) => {
        return WORLDS.findIndex(world => levelId >= world.start && levelId <= world.end);
    };

    const [activeTab, setActiveTab] = React.useState(getWorldIndexForLevel(nextLevel));
    const nextLevelRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll to next level on mount
    useEffect(() => {
        if (nextLevelRef.current) {
            nextLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeTab]);

    return (
        <div className="level-selector overlay">
            <h2>SELECT LEVEL</h2>

            {/* Continue Message */}
            {/* {completedLevels.length > 0 && nextLevel <= 60 && (
                <div className="continue-message">
                    🎮 Continue from Level {nextLevel}
                </div>
            )} */}

            <div className="world-tabs">
                {WORLDS.map((world, idx) => (
                    <button
                        key={world.name}
                        className={`tab-btn ${activeTab === idx ? 'active' : ''}`}
                        onClick={() => setActiveTab(idx)}
                    >
                        {world.name}
                    </button>
                ))}
            </div>

            <div className="level-grid">
                {Array.from({ length: 20 }).map((_, i) => {
                    const levelId = WORLDS[activeTab].start + i;
                    const isLocked = levelId > 1 && !completedLevels.includes(levelId - 1); // Simplistic lock logic
                    const isNextLevel = levelId === nextLevel;

                    return (
                        <button
                            key={levelId}
                            ref={isNextLevel ? nextLevelRef : null}
                            className={`level-btn ${isLocked ? 'locked' : ''} ${isNextLevel ? 'next-level' : ''}`}
                            disabled={isLocked}
                            onClick={() => onSelectLevel(levelId)}
                        >
                            {levelId}
                            {isNextLevel && <span className="next-badge">▶</span>}
                        </button>
                    );
                })}
            </div>

            <div className="selector-buttons">
                <button className="btn-back" onClick={onBack}>🏠 MAIN MENU</button>
            </div>
        </div>
    );
};
