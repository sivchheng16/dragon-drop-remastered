import React from 'react';
import '../assets/styles/index.css'; // Ensure path is correct later

interface MainMenuProps {
    onPlay: () => void;
    onOptions: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onOptions }) => {
    return (
        <div className="main-menu overlay">
            <h1 className="title">DRAGON DROP<br /><span className="subtitle">REMASTERED</span></h1>
            <div className="menu-buttons">
                <button className="btn-primary" onClick={onPlay}>PLAY</button>
                <button className="btn-secondary" onClick={onOptions}>OPTIONS</button>
                <button className="btn-secondary">CREDITS</button>
            </div>
            <div className="version">v1.0.0</div>
        </div>
    );
};
