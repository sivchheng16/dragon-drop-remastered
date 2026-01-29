import { GameState } from '../game/GameEngine';

interface GameHudProps {
    gameState: GameState;
}

export const GameHud = ({ gameState }: GameHudProps) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none', // Pass clicks to canvas
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            fontSize: '24px',
            color: '#FFF',
            textShadow: '2px 2px 0 #000'
        }}>
            <div className="hud-time">
                TIME: {Math.floor(gameState.timeLeft)}
            </div>

            <div className="hud-level">
                STAGE {gameState.currentLevelIdx}
            </div>

            <div className="hud-score">
                SCORE: {gameState.score}
            </div>

            {/* Lives floating near start? Or sticky center? Original has "x 5" near start. 
          For now, put it in center for visibility */}
            <div style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)' }}>
                Lives: {gameState.lives}
            </div>
        </div>
    );
};
