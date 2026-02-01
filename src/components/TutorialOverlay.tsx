import './TutorialOverlay.css';

interface TutorialOverlayProps {
    title: string;
    message: string;
    onClose: () => void;
}

export const TutorialOverlay = ({ title, message, onClose }: TutorialOverlayProps) => {
    return (
        <div className="tutorial-overlay">
            <div className="tutorial-card">
                <div className="tutorial-icon">📚</div>
                <h2 className="tutorial-title">{title}</h2>
                <p className="tutorial-message">{message}</p>
                <button onClick={onClose} className="tutorial-btn">GOT IT!</button>
            </div>
        </div>
    );
};
