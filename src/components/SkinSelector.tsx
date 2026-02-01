import { useState } from 'react';
import { SkinManager, DragonSkin } from '../game/SkinManager';
import './SkinSelector.css';

interface SkinSelectorProps {
    onClose: () => void;
}

export const SkinSelector = ({ onClose }: SkinSelectorProps) => {
    const skinManager = SkinManager.getInstance();
    const [skins] = useState<DragonSkin[]>(skinManager.getSkins());
    const [selectedSkin, setSelectedSkin] = useState<DragonSkin>(skinManager.getSelectedSkin());

    const handleSelectSkin = (skin: DragonSkin) => {
        if (skin.unlocked) {
            skinManager.selectSkin(skin.id);
            setSelectedSkin(skin);
        }
    };

    const unlockedCount = skinManager.getUnlockedCount();
    const totalCount = skinManager.getTotalCount();

    return (
        <div className="overlay skin-selector-overlay">
            <div className="skin-selector-container">
                <h1>🐉 Dragon Skins</h1>
                <p className="unlock-progress">
                    Unlocked: {unlockedCount}/{totalCount}
                </p>

                <div className="skins-grid">
                    {skins.map(skin => (
                        <div
                            key={skin.id}
                            className={`skin-card ${!skin.unlocked ? 'locked' : ''} ${selectedSkin.id === skin.id ? 'selected' : ''}`}
                            onClick={() => handleSelectSkin(skin)}
                        >
                            <div
                                className="skin-preview"
                                style={{
                                    backgroundColor: skin.unlocked ? skin.color : '#333',
                                    opacity: skin.unlocked ? 1 : 0.3
                                }}
                            >
                                {selectedSkin.id === skin.id && skin.unlocked && (
                                    <div className="selected-badge">✓</div>
                                )}
                                {!skin.unlocked && (
                                    <div className="lock-icon">🔒</div>
                                )}
                            </div>
                            <div className="skin-info">
                                <div className="skin-name">{skin.name}</div>
                                <div className="skin-description">{skin.description}</div>
                                {!skin.unlocked && (
                                    <div className="unlock-condition">{skin.unlockCondition}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="btn-close">CLOSE</button>
            </div>
        </div>
    );
};
