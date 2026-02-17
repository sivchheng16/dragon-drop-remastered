import './HintDisplay.css';

interface HintDisplayProps {
    hint: string;
    onClose: () => void;
}

export const HintDisplay = ({ hint, onClose }: HintDisplayProps) => {
    if (!hint) return null;

    return (
        <div className="hint-overlay">
            <div className="hint-container">
                <div className="hint-icon">💡</div>
                <h2>Hint</h2>
                <p className="hint-text">{hint}</p>
                <button onClick={onClose} className="hint-close-btn">GOT IT!</button>
            </div>
        </div>
    );
};
