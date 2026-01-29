import React from 'react';
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
    { name: "Lava", start: 61, end: 80, theme: 'lava' },
    { name: "Lair", start: 81, end: 100, theme: 'lair' },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelectLevel, onBack, completedLevels }) => {
    const [activeTab, setActiveTab] = React.useState(0);

    return (
        <div className="level-selector overlay">
            <h2>SELECT LEVEL</h2>
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

                    return (
                        <button
                            key={levelId}
                            className={`level-btn ${isLocked ? 'locked' : ''}`}
                            disabled={isLocked}
                            onClick={() => onSelectLevel(levelId)}
                        >
                            {levelId}
                        </button>
                    );
                })}
            </div>

            <button className="btn-back" onClick={onBack}>BACK</button>
        </div>
    );
};
