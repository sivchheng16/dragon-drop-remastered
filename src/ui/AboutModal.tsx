import React from 'react';
import './AboutModal.css';
import koompi from "../assets/logo/koompi.png"

interface AboutModalProps {
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    return (
        <div className="overlay about-overlay" onClick={onClose}>
            <div className="about-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                <h1>🐉 About Dragon Drop</h1>

                <div className="about-content">
                    {/* Left Column - Game Info */}
                    <div className="about-section game-info">
                        <h2>🎓 Educational Goals</h2>
                        <p style={{ color: '#ddd', marginBottom: '25px', lineHeight: '1.6', fontSize: '15px' }}>
                            Dragon Drop is designed as an interactive tool to teach students essential computer literacy.
                            Through gameplay, students naturally master <strong>mouse control skills</strong>—including clicking,
                            dragging, and cursor precision—while developing hand-eye coordination and logical problem-solving
                            abilities needed for the digital age.
                        </p>

                        <h2>📚 How to Play</h2>
                        <div className="instructions">
                            <div className="instruction-item">
                                <span className="instruction-icon">👆</span>
                                <div>
                                    <strong>DRAG</strong> the Dragon to move
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">🥩</span>
                                <div>
                                    Get to the <strong>STEAK</strong> to win!
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">🧱</span>
                                <div>
                                    Avoid <strong>WALLS</strong> and obstacles
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">⏳</span>
                                <div>
                                    Watch the <strong>TIME</strong>!
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">💎</span>
                                <div>
                                    Collect <strong>COINS</strong> and <strong>GEMS</strong>
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">❤️</span>
                                <div>
                                    Catch the <strong>HEART</strong> to add life
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">⚡</span>
                                <div>
                                    Use <strong>POWER-UPS</strong> strategically
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="instruction-icon">🌀</span>
                                <div>
                                    Use <strong>PORTALS</strong> to teleport
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Credits */}
                    <div className="about-section credits">
                        {/* <h2>👥 Credits</h2> */}
                        <div className="credits-content">
                            <div className="koompi-logo">
                                <div className="logo-placeholder">
                                    {/* <span> */}
                                    <img src={koompi} alt="Koompi Logo" width={60} height={60} />
                                    {/* </span> */}
                                    KOOMPI
                                </div>
                            </div>

                            <p className="made-by">
                                <strong>Made by the KOOMPI Team</strong>
                            </p>

                            <div className="mission-statement">
                                <p>
                                    Created for students and children in Cambodia's
                                    countryside and border regions who have limited
                                    or no internet access.
                                </p>
                                <p className="mission-highlight">
                                    🌏 🇰🇭KH Empowering offline learning through fun and
                                    engaging educational games.
                                </p>
                            </div>

                            <div className="version-info">
                                <p>Version 0.0.2</p>
                                <p>© 2026 KOOMPI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
