import React from 'react';
import '../assets/styles/index.css';

interface MainMenuProps {
    onPlay: () => void;
    onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings }) => {
    const [version, setVersion] = React.useState<string>('');

    React.useEffect(() => {
        if (window.electron) {
            window.electron.getVersion().then(setVersion).catch(e => console.error(e));
        }
    }, []);

    const handleQuit = () => {
        if (window.electron) {
            window.electron.quit();
        } else {
            console.log("Quit requested (not in Electron)");
        }
    };

    return (
        <div className="main-menu overlay">
            <h1 className="title">DRAGON DROP<br /><span className="subtitle">REMASTERED</span></h1>
            <div className="menu-buttons">
                <button className="btn-primary" onClick={onPlay}>PLAY</button>
                <button className="btn-secondary" onClick={onSettings}>SETTINGS</button>
                <button className="btn-secondary" onClick={handleQuit} style={{ borderColor: '#FF4500', color: '#FF4500' }}>QUIT</button>
            </div>
            <div className="version">{version ? `v${version}` : 'v1.0.0'}</div>
        </div>
    );
};
