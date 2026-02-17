import { GameState } from '../game/GameEngine';

interface GameHudProps {
    gameState: GameState;
    onBackToLevels?: () => void;
}

import { CollectibleIcon } from './CollectibleIcon';

export const GameHud = ({ gameState, onBackToLevels }: GameHudProps) => {
    // Calculate star thresholds (matching GameEngine logic)
    const starThresholds = [60, 30]; // 3★: 60s+, 2★: 30s+, 1★: complete

    // Determine current star rating based on time left
    let currentStars = 1;
    if (gameState.timeLeft >= starThresholds[0]) currentStars = 3;
    else if (gameState.timeLeft >= starThresholds[1]) currentStars = 2;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            padding: '5px 40px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: '#222', // Dark background
            borderBottom: '2px solid #444',
            fontFamily: "'Inter', sans-serif",
            fontSize: '25px', // Slightly smaller for top bar (adjusted for Inter readability)
            color: '#FFFFFF',
            zIndex: 100
        }}>
            {/* FAR LEFT: Back Button (Absolute) */}
            {onBackToLevels && (
                <button
                    onClick={onBackToLevels}
                    className="btn-back-to-levels"
                    style={{
                        position: 'absolute',
                        left: '10px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        color: '#FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: '600',
                        zIndex: 110 // Above navbar content
                    }}
                    title="Back to Levels"
                >
                    <span style={{ fontSize: '24px' }}>←</span>
                    <span>level</span>
                </button>
            )}

            {/* LEFT: Time & Stars */}
            <div className="hud-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>Time: {Math.floor(gameState.timeLeft)}</div>
                    <div style={{ fontSize: '32px', color: '#FFD700' }}>
                        {'★'.repeat(currentStars) + '☆'.repeat(3 - currentStars)}
                    </div>
                </div>
            </div>

            {/* CENTER: Stage */}
            <div className="hud-level">
                Stage: {gameState.currentLevelIdx}
            </div>

            {/* RIGHT: Stats */}
            <div className="hud-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div>Score: {gameState.score}</div>
                {/* <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '20px', marginTop: '5px' }}>
                    <span title="Lives" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CollectibleIcon type="coin" size={24} /> {gameState.lives}
                    </span>
                    <span title="Gems" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CollectibleIcon type="gem" size={24} /> {gameState.gemsCollected}
                    </span>
                </div> */}
            </div>
        </div>
    );
};
