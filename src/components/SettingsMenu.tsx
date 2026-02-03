import React, { useState, useEffect } from 'react';
import './SettingsMenu.css';
import { SettingsManager, GameSettings } from '../game/SettingsManager';
import { AudioManager } from '../game/AudioManager';
import { ProgressManager } from '../game/ProgressManager';
import { AchievementManager } from '../game/AchievementManager';
import { LeaderboardManager } from '../game/LeaderboardManager';
import { GameDataManager } from '../game/GameDataManager';
import { CollectibleIcon } from './CollectibleIcon';

interface SettingsMenuProps {
    onClose: () => void;
}

export const SettingsMenu = ({ onClose }: SettingsMenuProps) => {
    const settingsManager = SettingsManager.getInstance();
    const [settings, setSettings] = useState(settingsManager.getSettings());
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [stats, setStats] = useState({
        levelsCompleted: 0,
        totalStars: 0,
        totalDeaths: 0,
        totalCoins: 0,
        totalGems: 0,
        totalHearts: 0,
        achievementsUnlocked: 0
    });

    useEffect(() => {
        // Load statistics
        const progressManager = ProgressManager.getInstance();
        const achievementManager = AchievementManager.getInstance();
        const leaderboardManager = LeaderboardManager.getInstance();

        setStats({
            levelsCompleted: leaderboardManager.getCompletedLevels(),
            totalStars: leaderboardManager.getTotalStars(),
            totalDeaths: progressManager.getTotalDeaths(),
            totalCoins: progressManager.getTotalCoins(),
            totalGems: progressManager.getTotalGems(),
            totalHearts: progressManager.getTotalHearts(),
            achievementsUnlocked: achievementManager.getUnlockedCount()
        });
    }, []);

    const handleToggle = (key: keyof GameSettings) => {
        const newValue = !settings[key];
        settingsManager.updateSetting(key, newValue);
        setSettings({ ...settings, [key]: newValue });

        // Apply High Contrast Immediately
        if (key === 'highContrastEnabled') {
            if (newValue) document.body.classList.add('high-contrast');
            else document.body.classList.remove('high-contrast');
        }
    };

    const handleSliderChange = (key: keyof GameSettings, value: number) => {
        const settingsManager = SettingsManager.getInstance();
        settingsManager.updateSetting(key, value);

        // Update music volume in real-time
        if (key === 'musicVolume') {
            AudioManager.getInstance().updateMusicVolume();
        }

        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        if (confirm('Reset all settings to defaults?')) {
            settingsManager.resetToDefaults();
            setSettings(settingsManager.getSettings());
        }
    };

    const handleResetProgress = () => {
        // Use centralized reset function
        GameDataManager.resetAllData();

        // Update stats display to show zeros
        setStats({
            levelsCompleted: 0,
            totalStars: 0,
            totalDeaths: 0,
            totalCoins: 0,
            totalGems: 0,
            totalHearts: 0,
            achievementsUnlocked: 0
        });

        setShowResetConfirm(false);

        // Show alert and reload page to reset tutorial state
        alert('All progress has been reset! The page will reload.');
        window.location.reload();
    };

    return (
        <div className="overlay settings-overlay" onClick={onClose}>
            <div className="settings-container" onClick={(e) => e.stopPropagation()}>
                <h1>⚙️ Settings & Statistics</h1>

                {/* Statistics Section */}
                <div className="settings-section">
                    <h2>📊 Your Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-value">{stats.levelsCompleted}</div>
                            <div className="stat-label">Levels</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value">{stats.totalStars} ⭐</div>
                            <div className="stat-label">Stars</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value">{stats.totalDeaths} 💀</div>
                            <div className="stat-label">Deaths</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value">{stats.achievementsUnlocked}/14</div>
                            <div className="stat-label">Achievements</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {stats.totalCoins} <CollectibleIcon type="coin" size={24} />
                            </div>
                            <div className="stat-label">Coins</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {stats.totalGems} <CollectibleIcon type="gem" size={24} />
                            </div>
                            <div className="stat-label">Gems</div>
                        </div>
                        {/* <div className="stat-box">
                            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {stats.totalHearts} <CollectibleIcon type="heart" size={24} />
                            </div>
                            <div className="stat-label">Hearts</div>
                        </div> */}
                    </div>
                </div>

                {/* Accessibility Section */}
                <div className="settings-section">
                    <h2>Accessibility</h2>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">🐌 Slow Motion Mode</div>
                            <div className="setting-description">Reduces game speed to 50%</div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.slowMotionEnabled}
                                onChange={() => handleToggle('slowMotionEnabled')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">∞ Infinite Time Mode</div>
                            <div className="setting-description">No time limit on levels</div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.infiniteTimeEnabled}
                                onChange={() => handleToggle('infiniteTimeEnabled')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">👁️ High Contrast</div>
                            <div className="setting-description">Increases visibility of UI elements</div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.highContrastEnabled}
                                onChange={() => handleToggle('highContrastEnabled')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">🚫 Reduced Motion</div>
                            <div className="setting-description">Disables screen shake and particles</div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.reducedMotionEnabled}
                                onChange={() => handleToggle('reducedMotionEnabled')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">⌨️ Keyboard Controls</div>
                            <div className="setting-description">Use WASD / Arrow Keys to move</div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.keyboardControlsEnabled}
                                onChange={() => handleToggle('keyboardControlsEnabled')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Audio Section */}
                <div className="settings-section">
                    <h2>Audio</h2>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">🎵 Music Volume</div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.musicVolume}
                            onChange={(e) => handleSliderChange('musicVolume', parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                        <span className="volume-value">{Math.round(settings.musicVolume * 100)}%</span>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-label">🔊 Sound Effects</div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.sfxVolume}
                            onChange={(e) => handleSliderChange('sfxVolume', parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                        <span className="volume-value">{Math.round(settings.sfxVolume * 100)}%</span>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="settings-section danger-zone">
                    <h2>⚠️ Data Management</h2>
                    {!showResetConfirm ? (
                        <button onClick={() => setShowResetConfirm(true)} className="btn-danger">
                            RESET ALL PROGRESS
                        </button>
                    ) : (
                        <div className="confirm-reset">
                            <p className="danger-warning">⚠️ This will delete ALL your progress, achievements, and statistics!</p>
                            <div className="confirm-buttons">
                                <button onClick={handleResetProgress} className="btn-danger-confirm">
                                    YES, DELETE EVERYTHING
                                </button>
                                <button onClick={() => setShowResetConfirm(false)} className="btn-cancel">
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="settings-buttons">
                    <button onClick={handleReset} className="btn-secondary">RESET SETTINGS</button>
                    <button onClick={onClose} className="btn-primary">CLOSE</button>
                </div>
            </div>
        </div>
    );
};
