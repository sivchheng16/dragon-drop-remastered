import React from 'react';
import '../assets/styles/index.css';

interface MainMenuProps {
    onPlay: () => void;
    onSettings: () => void;
    onAbout: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings, onAbout }) => {
    const [version, setVersion] = React.useState<string>('');

    React.useEffect(() => {
        if (window.electron) {
            window.electron.getVersion().then(setVersion).catch(e => console.error(e));
        }
    }, []);

    return (
        <div className="main-menu overlay">
            <h1 className="title">DRAGON DROP</h1>
            <div className="menu-buttons">
                <button className="btn-primary" onClick={onPlay}>PLAY</button>
                <button className="btn-secondary" onClick={onSettings}>SETTINGS</button>
                <button className="btn-secondary" onClick={onAbout} style={{ borderColor: '#4FC3F7', color: '#4FC3F7' }}>ABOUT</button>
            </div>
            <div className="version">{version ? `v${version}` : 'v1.0.0'}</div>
        </div>
    );
};
