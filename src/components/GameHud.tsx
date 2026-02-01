import { GameState } from '../game/GameEngine';

interface GameHudProps {
    gameState: GameState;
}

export const GameHud = ({ gameState }: GameHudProps) => {
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
            {/* LEFT: Time & Stars */}
            <div className="hud-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div>Time: {Math.floor(gameState.timeLeft)}</div>
                <div style={{ fontSize: '32px', color: '#FFD700' }}>
                    {'★'.repeat(currentStars) + '☆'.repeat(3 - currentStars)}
                </div>
            </div>

            {/* CENTER: Stage */}
            <div className="hud-level">
                Stage: {gameState.currentLevelIdx + 1}
            </div>

            {/* RIGHT: Score */}
            <div className="hud-score">
                Score: {gameState.score}
            </div>
        </div>
    );
};
