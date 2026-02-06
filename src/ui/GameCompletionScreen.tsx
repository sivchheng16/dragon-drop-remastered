import { useEffect, useState } from 'react';
import { ProgressManager } from '../game/ProgressManager';
import './GameCompletionScreen.css';

interface GameCompletionScreenProps {
    onBackToMenu: () => void;
    onResetAndReplay: () => void;
}

interface LevelStat {
    level: number;
    stars: number;
    bestTime: number;
    deaths: number;
}

export const GameCompletionScreen = ({ onBackToMenu, onResetAndReplay }: GameCompletionScreenProps) => {
    const [stats, setStats] = useState<{
        totalStars: number;
        totalDeaths: number;
        totalCoins: number;
        totalGems: number;
        totalHearts: number;
        levelStats: LevelStat[];
    }>({
        totalStars: 0,
        totalDeaths: 0,
        totalCoins: 0,
        totalGems: 0,
        totalHearts: 0,
        levelStats: []
    });

    useEffect(() => {
        const progressManager = ProgressManager.getInstance();
        const allProgress = progressManager.getAllProgress();

        let totalStars = 0;
        const levelStats: LevelStat[] = [];

        // Calculate stats for completed levels
        for (let i = 1; i <= 60; i++) {
            const progress = allProgress.get(i);
            if (progress) {
                totalStars += progress.stars;
                levelStats.push({
                    level: i,
                    stars: progress.stars,
                    bestTime: progress.bestTime,
                    deaths: progress.deaths
                });
            }
        }

        setStats({
            totalStars,
            totalDeaths: progressManager.getTotalDeaths(),
            totalCoins: progressManager.getTotalCoins(),
            totalGems: progressManager.getTotalGems(),
            totalHearts: progressManager.getTotalHearts(),
            levelStats
        });
    }, []);

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            const progressManager = ProgressManager.getInstance();
            progressManager.resetProgress();
            onResetAndReplay();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    };

    return (
        <div className="game-completion-overlay">
            <div className="completion-card">
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'][Math.floor(Math.random() * 5)]
                        }} />
                    ))}
                </div>

                <h1 className="completion-title">🎉 DRAGON DROP MASTER! 🎉</h1>
                <p className="completion-subtitle">You've conquered all 60 levels!</p>

                <div className="stats-summary">
                    <div className="stat-item">
                        <span className="stat-icon">⭐</span>
                        <span className="stat-label">Total Stars</span>
                        <span className="stat-value">{stats.totalStars}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">💀</span>
                        <span className="stat-label">Total Deaths</span>
                        <span className="stat-value">{stats.totalDeaths}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🪙</span>
                        <span className="stat-label">Coins Collected</span>
                        <span className="stat-value">{stats.totalCoins}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">💎</span>
                        <span className="stat-label">Gems Collected</span>
                        <span className="stat-value">{stats.totalGems}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">❤️</span>
                        <span className="stat-label">Hearts Collected</span>
                        <span className="stat-value">{stats.totalHearts}</span>
                    </div>
                </div>

                <div className="level-progress-section">
                    <h2>📋 Level Progress</h2>
                    <div className="level-progress-list">
                        {stats.levelStats.map((levelStat) => (
                            <div key={levelStat.level} className="level-stat-row">
                                <span className="level-number">Lvl {levelStat.level}</span>
                                <span className="level-stars">
                                    {[...Array(3)].map((_, i) => (
                                        <span key={i} className={i < levelStat.stars ? 'star-filled' : 'star-empty'}>
                                            {i < levelStat.stars ? '★' : '☆'}
                                        </span>
                                    ))}
                                </span>
                                <span className="level-time">{formatTime(levelStat.bestTime)}</span>
                                <span className="level-deaths">{levelStat.deaths} 💀</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="completion-buttons">
                    <button className="btn-menu" onClick={onBackToMenu}>
                        🏠 Back to Menu
                    </button>
                    <button className="btn-reset" onClick={handleReset}>
                        🔄 Reset & Play Again
                    </button>
                </div>

                <p className="completion-timestamp">
                    Completed on {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>
        </div>
    );
};
