// Settings Manager for Dragon Drop Remastered

export interface GameSettings {
    slowMotionEnabled: boolean;
    infiniteTimeEnabled: boolean;
    musicVolume: number; // 0-1
    sfxVolume: number; // 0-1
    highContrastEnabled: boolean;
    reducedMotionEnabled: boolean;
    keyboardControlsEnabled: boolean;
}

const STORAGE_KEY = 'dragon_drop_settings_v1';

export class SettingsManager {
    private static instance: SettingsManager;
    private settings: GameSettings;

    private constructor() {
        this.settings = this.loadSettings();
    }

    public static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    private loadSettings(): GameSettings {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }

        // Defaults
        return {
            slowMotionEnabled: false,
            infiniteTimeEnabled: false,
            musicVolume: 0.5,
            sfxVolume: 0.7,
            highContrastEnabled: false,
            reducedMotionEnabled: false,
            keyboardControlsEnabled: false
        };
    }

    private saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings', e);
        }
    }

    public updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
        this.settings[key] = value;
        this.saveSettings();
    }

    public getSettings(): GameSettings {
        return { ...this.settings };
    }

    public getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
        return this.settings[key];
    }

    public resetToDefaults() {
        this.settings = {
            slowMotionEnabled: false,
            infiniteTimeEnabled: false,
            musicVolume: 0.5,
            sfxVolume: 0.7,
            highContrastEnabled: false,
            reducedMotionEnabled: false,
            keyboardControlsEnabled: false
        };
        this.saveSettings();
    }
}
