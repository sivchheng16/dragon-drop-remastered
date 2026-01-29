import { useEffect, useRef } from 'react';
import { GameEngine, GameState } from '../game/GameEngine';
import { LEVELS } from '../game/levels';

interface GameBoardProps {
    gameState: GameState;
    onStateChange: (state: GameState) => void;
}

export const GameBoard = ({ gameState, onStateChange }: GameBoardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Load Level
        const levelData = LEVELS.find(l => l.id === gameState.currentLevelIdx);
        if (!levelData) {
            console.error("Level not found");
            return;
        }

        // Initialize Engine
        engineRef.current = new GameEngine(
            canvasRef.current,
            levelData,
            gameState,
            onStateChange
        );

        return () => {
            engineRef.current?.dispose();
        };
    }, [gameState.currentLevelIdx, gameState.status]); // Re-init on level change

    return (
        <div className="game-board-container" style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#333'
        }}>
            {/* Aspect Ratio Container (Square-ish 1:1 or 4:3? logic is 1000x1000) */}
            <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    aspectRatio: '1 / 1',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                    cursor: 'default'
                }}
            />
        </div>
    );
};
