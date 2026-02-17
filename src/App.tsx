import { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameHud } from './components/GameHud';
import { GameState } from './game/GameEngine';
import { AudioManager } from './game/AudioManager';
import { MainMenu } from './ui/MainMenu';
import { LevelSelector } from './ui/LevelSelector';
import { LoadingScreen } from './ui/LoadingScreen';
import { AssetLoader } from './game/AssetLoader';
import { AchievementNotification } from './components/AchievementNotification';
import { AchievementManager, Achievement } from './game/AchievementManager';
import { SettingsMenu } from './components/SettingsMenu';
import { AboutModal } from './ui/AboutModal';
import { GameCompletionScreen } from './ui/GameCompletionScreen';
import { SessionManager } from './game/SessionManager';
import { SettingsManager } from './game/SettingsManager';
import './assets/styles/index.css';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Determine initial state based on user progress
    const getInitialGameState = (): GameState => {
        const saved = localStorage.getItem('dragon_drop_completed_levels');
        const completedLevels = saved ? JSON.parse(saved) : [];
        const lastPlayedLevel = localStorage.getItem('dragon_drop_last_played_level');

        // New user: no progress
        if (completedLevels.length === 0 && !lastPlayedLevel) {
            return {
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
                boom: [],
                collectibles: [],
                coinsCollected: 0,
                gemsCollected: 0,
                activePowerUps: [],
                combo: { count: 0, timer: 0, multiplier: 1 }
            };
        }

        // Returning user: has progress - skip to level selector
        return {
            status: 'LEVEL_SELECT',
            score: 0,
            lives: 5,
            currentLevelIdx: 1,
            timeLeft: 100,
            stars: 0,
            gates: [],
            buttons: [],
            movingWalls: [],
            crumblingFloors: [],
            boom: [],
            collectibles: [],
            coinsCollected: 0,
            gemsCollected: 0,
            activePowerUps: [],
            combo: { count: 0, timer: 0, multiplier: 1 }
        };
    };

    const [gameState, setGameState] = useState<GameState>(getInitialGameState());

    const [showTutorial, setShowTutorial] = useState(false);
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showGameComplete, setShowGameComplete] = useState(false);

    // Initialize achievement manager
    useEffect(() => {
        const achievementManager = AchievementManager.getInstance();
        achievementManager.onAchievementUnlocked((achievement) => {
            setCurrentAchievement(achievement);
        });

        // Initialize session manager for classroom mode
        SessionManager.getInstance();

        // Apply Accessibility Settings
        const settings = SettingsManager.getInstance().getSettings();
        if (settings.highContrastEnabled) {
            document.body.classList.add('high-contrast');
        }
    }, []);

    // Check if tutorial should be shown on first load
    useEffect(() => {
        const tutorialCompleted = localStorage.getItem('dragon_drop_tutorial_completed');
        if (!tutorialCompleted) {
            setShowTutorial(true);
        }
    }, []);

    // Audio Management based on state
    useEffect(() => {
        if (gameState.status === 'MENU' || gameState.status === 'LEVEL_SELECT') {
            // Restore default/menu music
            AudioManager.getInstance().playThemeMusic('meadow');
        } else if (gameState.status === 'GAME_OVER') {
            // Optional: Play game over theme or sad music
            // AudioManager.getInstance().playThemeMusic('game_over'); // If implemented
        }
    }, [gameState.status]);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                await AssetLoader.getInstance().loadAll((progress) => {
                    setLoadingProgress(progress);
                });
                // Small delay to let user see 100%
                setTimeout(() => setIsLoading(false), 500);
            } catch (e) {
                console.error("Failed to load assets", e);
                setIsLoading(false); // Proceed anyway?
            }
        };
        loadAssets();
    }, []);

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


    const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
        const saved = localStorage.getItem('dragon_drop_completed_levels');
        // return saved ? JSON.parse(saved) : [1]; // Level 1 unlocked by default
        return saved ? JSON.parse(saved) : []; // Start with empty array
    });

    // Save completedLevels to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('dragon_drop_completed_levels', JSON.stringify(completedLevels));
    }, [completedLevels]);

    const startGame = (levelId: number = 1, resetScore: boolean = false) => {
        // Remember last played level
        localStorage.setItem('dragon_drop_last_played_level', levelId.toString());

        setGameState(prev => ({
            status: 'PLAYING',
            score: resetScore ? 0 : prev.score, // Reset score for new game, preserve for level progression
            lives: 5,
            currentLevelIdx: levelId,
            timeLeft: 100,
            stars: 0,
            gates: [],
            buttons: [],
            movingWalls: [],
            crumblingFloors: [],
            boom: [],
            collectibles: [],
            coinsCollected: 0,
            gemsCollected: 0,
            activePowerUps: [],
            combo: { count: 0, timer: 0, multiplier: 1 }
        }));
    };

    // const handleLevelComplete = (levelId: number) => {
    //     const newCompleted = [...completedLevels];
    //     // Mark current level as completed
    //     if (!newCompleted.includes(levelId)) {
    //         newCompleted.push(levelId);
    //     }
    //     // Unlock next level
    //     const nextLevel = levelId + 1;
    //     if (nextLevel <= 100 && !newCompleted.includes(nextLevel)) {
    //         newCompleted.push(nextLevel);
    //     }
    //     setCompletedLevels(newCompleted);
    // };

    const handleLevelComplete = (levelId: number) => {
        const newCompleted = [...completedLevels];
        // Mark current level as completed
        if (!newCompleted.includes(levelId)) {
            newCompleted.push(levelId);
        }
        // Next level will be unlocked automatically by the lock logic checking if this level is completed
        setCompletedLevels(newCompleted);
    };

    if (isLoading) {
        return <LoadingScreen progress={loadingProgress} />;
    }

    return (
        <div className="app-container">

            {gameState.status === 'MENU' && (
                <MainMenu
                    onPlay={() => setGameState(prev => ({ ...prev, status: 'LEVEL_SELECT' }))}
                    onSettings={() => setShowSettings(true)}
                    onAbout={() => setShowAbout(true)}
                />
            )}

            {gameState.status === 'LEVEL_SELECT' && (
                <LevelSelector
                    onSelectLevel={(levelId) => startGame(levelId, true)} // Reset score when starting from level select
                    onBack={() => setGameState(prev => ({ ...prev, status: 'MENU' }))}
                    completedLevels={completedLevels}
                />
            )}

            {(gameState.status === 'PLAYING' || gameState.status === 'WON' || gameState.status === 'GAME_OVER') && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
                    <GameHud
                        gameState={gameState}
                        onBackToLevels={() => setGameState(prev => ({ ...prev, status: 'LEVEL_SELECT' }))}
                    />
                    <GameBoard gameState={gameState} onStateChange={setGameState} />
                </div>
            )}

            {showTutorial && gameState.status === 'MENU' && (
                <div className="overlay tutorial-overlay">
                    <div className="tutorial-card">
                        <h1>HOW TO PLAY</h1>
                        <div className="tutorial-content">
                            <p>👆 <strong>DRAG</strong> the Dragon to move.</p>
                            <p>🥩 Get to the <strong>STEAK</strong> to win!</p>
                            <p>🧱 Avoid <strong>WALLS</strong> and obstacles.</p>
                            <p>⏳ Watch the <strong>TIME</strong>!</p>
                        </div>
                        <button onClick={() => {
                            setShowTutorial(false);
                            localStorage.setItem('dragon_drop_tutorial_completed', 'true');
                            startGame(1); // Auto-start Level 1 after tutorial
                        }} style={{ marginTop: '2rem', background: '#FFD700', color: 'black' }}>GOT IT!</button>
                    </div>
                </div>
            )}

            {gameState.status === 'GAME_OVER' && (
                <GameOverScreen
                    onMenu={() => setGameState(s => ({ ...s, status: 'MENU' }))}
                    onRetry={() => startGame(gameState.currentLevelIdx)}
                />
            )}

            {gameState.status === 'WON' && (
                <LevelCompleteScreen
                    gameState={gameState}
                    onNextLevel={() => {
                        handleLevelComplete(gameState.currentLevelIdx);
                        if (gameState.currentLevelIdx < 60) {
                            startGame(gameState.currentLevelIdx + 1, true);
                        } else {
                            // All 60 levels completed!
                            setShowGameComplete(true);
                            setGameState(prev => ({ ...prev, status: 'MENU' }));
                        }
                    }}
                    onLevels={() => setGameState(prev => ({ ...prev, status: 'LEVEL_SELECT' }))}
                />
            )}

            {/* Settings Menu */}
            {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}

            {/* About Modal */}
            {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

            {/* Game Completion Screen */}
            {showGameComplete && (
                <GameCompletionScreen
                    onBackToMenu={() => setShowGameComplete(false)}
                    onResetAndReplay={() => {
                        setShowGameComplete(false);
                        startGame(1, true);
                    }}
                />
            )}

            {/* Achievement Notification */}
            <AchievementNotification
                achievement={currentAchievement}
                onClose={() => setCurrentAchievement(null)}
            />
        </div>
    );
}

const LevelCompleteScreen = ({ gameState, onNextLevel, onLevels }: { gameState: GameState, onNextLevel: () => void, onLevels: () => void }) => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onNextLevel();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="overlay result-screen win">
            <h1>LEVEL COMPLETE!</h1>
            <div className="stars" style={{
                fontSize: '64px',
                margin: '20px 0',
                letterSpacing: '10px'
            }}>
                {[...Array(3)].map((_, i) => (
                    <span
                        key={i}
                        style={{
                            color: i < (gameState.stars || 1) ? '#FFD700' : '#333',
                            textShadow: i < (gameState.stars || 1) ? '0 0 20px #FFD700, 0 0 30px #FFA500' : 'none',
                            display: 'inline-block',
                            transform: i < (gameState.stars || 1) ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {i < (gameState.stars || 1) ? '★' : '☆'}
                    </span>
                ))}
            </div>
            <p style={{ fontSize: '20px', margin: '10px 0' }}>Score: {gameState.score}</p>
            <p style={{ fontSize: '18px', margin: '10px 0', color: '#FFD700' }}>
                Time Left: {Math.floor(gameState.timeLeft)}s
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <button onClick={onLevels}>LEVELS</button>
                <button onClick={onNextLevel} style={{ minWidth: '160px' }}>
                    NEXT LEVEL ({countdown})
                </button>
            </div>
        </div>
    );
};

const GameOverScreen = ({ onMenu, onRetry }: { onMenu: () => void, onRetry: () => void }) => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onRetry();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="overlay result-screen game-over">
            <h1 style={{ fontSize: '78px', color: '#FF4444', textShadow: '0 0 20px #FF4444' }}>GAME OVER</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <button onClick={onMenu}>MENU</button>
                <button onClick={onRetry} style={{ minWidth: '160px' }}>
                    RETRY ({countdown})
                </button>
            </div>
        </div>
    );
};

export default App;
