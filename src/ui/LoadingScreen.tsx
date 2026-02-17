import React from 'react';

interface LoadingScreenProps {
    progress: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
    return (
        <div className="overlay loading-screen" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#222',
            color: 'white',
            zIndex: 9999
        }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '3rem' }}>LOADING...</h1>
            <div className="progress-bar-container" style={{
                width: '60%',
                height: '20px',
                background: '#444',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '2px solid white'
            }}>
                <div className="progress-bar-fill" style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    transition: 'width 0.2s ease-out'
                }} />
            </div>
            <div style={{ marginTop: '1rem', fontFamily: 'monospace' }}>{Math.round(progress * 100)}%</div>
        </div>
    );
};
