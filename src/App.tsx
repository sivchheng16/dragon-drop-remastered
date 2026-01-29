import { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameHud } from './components/GameHud';
import { GameState } from './game/GameEngine';
import { MainMenu } from './ui/MainMenu';
import { LevelSelector } from './ui/LevelSelector';
import './assets/styles/index.css';

function App() {
    const [gameState, setGameState] = useState<GameState>({
        status: 'MENU',
        score: 0,
        lives: 5,
        currentLevelIdx: 1,
        timeLeft: 100,
        stars: 0,
        gates: [],
        buttons: [],
        movingWalls: [],
        crumblingFloors: [],
        enemies: []
    });

    const [showTutorial, setShowTutorial] = useState(false);

    // Global Timer Logic
    useEffect(() => {
        let timer: any;
        if (gameState.status === 'PLAYING' && !showTutorial) {
            timer = setInterval(() => {
                setGameState(prev => {
                    if (prev.timeLeft <= 0) return { ...prev, status: 'GAME_OVER' };
                    return { ...prev, timeLeft: prev.timeLeft - 0.1 };
                });
            }, 100);
        }
        return () => clearInterval(timer);
    }, [gameState.status, showTutorial]);


    const [completedLevels, setCompletedLevels] = useState<number[]>([1]); // Mock: Level 1 unlocked

    const startGame = (levelId: number = 1) => {
        setGameState({
            status: 'PLAYING',
            score: 0,
            lives: 5,
            currentLevelIdx: levelId,
            timeLeft: 100,
            stars: 0,
            gates: [],
            buttons: [],
            movingWalls: [],
            crumblingFloors: [],
            enemies: []
        });
        if (levelId === 1) {
            setShowTutorial(true);
        }
    };

    const handleLevelComplete = (levelId: number) => {
        if (!completedLevels.includes(levelId)) {
            setCompletedLevels([...completedLevels, levelId]);
        }
    };

    return (
        <div className="app-container">

            {gameState.status === 'MENU' && (
                <MainMenu
                    onPlay={() => setGameState(prev => ({ ...prev, status: 'LEVEL_SELECT' }))}
                    onOptions={() => console.log("Options clicked")}
                />
            )}

            {gameState.status === 'LEVEL_SELECT' && (
                <LevelSelector
                    onSelectLevel={(levelId) => startGame(levelId)}
                    onBack={() => setGameState(prev => ({ ...prev, status: 'MENU' }))}
                    completedLevels={completedLevels}
                />
            )}

            {(gameState.status === 'PLAYING' || gameState.status === 'WON' || gameState.status === 'GAME_OVER') && (
                <>
                    <GameHud gameState={gameState} />
                    <GameBoard gameState={gameState} onStateChange={setGameState} />
                </>
            )}

            {showTutorial && gameState.status === 'PLAYING' && (
                <div className="overlay tutorial-overlay">
                    <h1>HOW TO PLAY</h1>
                    <div className="tutorial-content" style={{ textAlign: 'center', maxWidth: '500px', lineHeight: '1.6' }}>
                        <p>👆 <strong>DRAG</strong> the Dragon to move.</p>
                        <p>🥩 Get to the <strong>STEAK</strong> to win!</p>
                        <p>🧱 Avoid <strong>WALLS</strong> and obstacles.</p>
                        <p>⏳ Watch the <strong>TIME</strong>!</p>
                    </div>
                    <button onClick={() => setShowTutorial(false)} style={{ marginTop: '2rem', background: '#FFD700', color: 'black' }}>GOT IT!</button>
                </div>
            )}

            {gameState.status === 'GAME_OVER' && (
                <div className="overlay result-screen game-over">
                    <h1>GAME OVER</h1>
                    <button onClick={() => setGameState(s => ({ ...s, status: 'MENU' }))}>MENU</button>
                    <button onClick={() => startGame(gameState.currentLevelIdx)}>RETRY</button>
                </div>
            )}

            {gameState.status === 'WON' && (
                <div className="overlay result-screen win">
                    <h1>LEVEL COMPLETE!</h1>
                    <div className="stars">
                        {'★'.repeat(gameState.stars || 1)}{'☆'.repeat(3 - (gameState.stars || 1))}
                    </div>
                    <button onClick={() => {
                        handleLevelComplete(gameState.currentLevelIdx);
                        if (gameState.currentLevelIdx < 100) {
                            startGame(gameState.currentLevelIdx + 1);
                        } else {
                            setGameState(prev => ({ ...prev, status: 'MENU' }));
                        }
                    }}>NEXT LEVEL</button>
                    <button onClick={() => setGameState(prev => ({ ...prev, status: 'LEVEL_SELECT' }))}>LEVELS</button>
                </div>
            )}
        </div>
    );
}

export default App;
