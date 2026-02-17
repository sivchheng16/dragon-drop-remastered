import { useState, useEffect } from 'react';
import { LeaderboardManager, LevelRecord } from '../game/LeaderboardManager';
import './LeaderboardUI.css';

interface LeaderboardUIProps {
    onClose: () => void;
}

export const LeaderboardUI = ({ onClose }: LeaderboardUIProps) => {
    const [records, setRecords] = useState<LevelRecord[]>([]);
    const [totalStars, setTotalStars] = useState(0);
    const [completedLevels, setCompletedLevels] = useState(0);

    useEffect(() => {
        const manager = LeaderboardManager.getInstance();
        setRecords(manager.getAllRecords());
        setTotalStars(manager.getTotalStars());
        setCompletedLevels(manager.getCompletedLevels());
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="overlay leaderboard-overlay">
            <div className="leaderboard-container">
                <h1>🏆 Personal Records</h1>

                <div className="leaderboard-stats">
                    <div className="stat-card">
                        <div className="stat-value">{completedLevels}</div>
                        <div className="stat-label">Levels Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalStars} ⭐</div>
                        <div className="stat-label">Total Stars</div>
                    </div>
                </div>

                <div className="records-list">
                    {records.length === 0 ? (
                        <p className="no-records">No records yet. Complete some levels!</p>
                    ) : (
                        records.map(record => (
                            <div key={record.levelId} className="record-item">
                                <div className="record-level">Level {record.levelId}</div>
                                <div className="record-time">{formatTime(record.bestTime)}</div>
                                <div className="record-stars">
                                    {'⭐'.repeat(record.stars)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button onClick={onClose} className="btn-primary leaderboard-close">CLOSE</button>
            </div>
        </div>
    );
};
