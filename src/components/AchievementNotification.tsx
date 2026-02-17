import { useState, useEffect } from 'react';
import { Achievement } from '../game/AchievementManager';
import './AchievementNotification.css';

interface AchievementNotificationProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setVisible(true);
            // Auto-hide after 4 seconds
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
    };

    if (!achievement) return null;

    return (
        <div className={`achievement-notification ${visible ? 'visible' : ''}`}>
            <button className="achievement-close" onClick={handleClose} aria-label="Close">
                ×
            </button>
            <div className="achievement-content">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-text">
                    <div className="achievement-title">Achievement Unlocked!</div>
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-description">{achievement.description}</div>
                </div>
            </div>
        </div>
    );
};
