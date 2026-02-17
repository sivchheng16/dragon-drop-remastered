import React, { useEffect, useRef } from 'react';

interface CollectibleIconProps {
    type: 'coin' | 'gem' | 'heart';
    size?: number;
    title?: string;
}

export const CollectibleIcon: React.FC<CollectibleIconProps> = ({ type, size = 30, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Save context
        ctx.save();

        // Scale to match the game engine's 30x30 drawing coordinate system
        const scale = size / 30;
        ctx.scale(scale, scale);

        if (type === 'coin') {
            // Temple Coin Design (Gold)

            // 1. Outer Gold Ring
            const outerGradient = ctx.createLinearGradient(0, 0, 30, 30);
            outerGradient.addColorStop(0, '#FFD700'); // Gold
            outerGradient.addColorStop(1, '#B8860B'); // Dark Gold
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(15, 15, 14, 0, Math.PI * 2);
            ctx.fill();

            // 2. Inner Recessed Circle (Lighter Gold)
            ctx.fillStyle = '#F0C300'; // Fixed typo from #FOC300
            ctx.beginPath();
            ctx.arc(15, 15, 11, 0, Math.PI * 2);
            ctx.fill();

            // 3. Stars (Dots around perimeter)
            ctx.fillStyle = '#FFFACD'; // Lemon Chiffon
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const sx = 15 + Math.cos(angle) * 12.5;
                const sy = 15 + Math.sin(angle) * 12.5;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            // 4. Temple Icon
            ctx.fillStyle = '#FFF8DC'; // Cornsilk
            // Pediment (Triangle Roof)
            ctx.beginPath();
            ctx.moveTo(15, 8);
            ctx.lineTo(21, 12);
            ctx.lineTo(9, 12);
            ctx.closePath();
            ctx.fill();
            // Columns
            ctx.fillRect(10, 13, 2, 7); // Left
            ctx.fillRect(14, 13, 2, 7); // Center
            ctx.fillRect(18, 13, 2, 7); // Right
            // Base
            ctx.fillRect(8, 20, 14, 2);

            // 5. Shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(11, 11, 4, 0, Math.PI * 2);
            ctx.fill();

        } else if (type === 'gem') {
            // Blue Diamond Design

            // Top Face (Flat, Lightest)
            ctx.fillStyle = '#E0FFFF'; // Light Cyan
            ctx.beginPath();
            ctx.moveTo(10, 5);
            ctx.lineTo(20, 5);
            ctx.lineTo(25, 12);
            ctx.lineTo(5, 12);
            ctx.closePath();
            ctx.fill();

            // Upper Facets (Mid Blue)
            ctx.fillStyle = '#00BFFF'; // Deep Sky Blue

            // Left Triangle (Upper Side)
            ctx.beginPath();
            ctx.moveTo(10, 5);
            ctx.lineTo(5, 12);
            ctx.lineTo(0, 12);
            ctx.closePath();
            ctx.fill();

            // Right Triangle (Upper Side)
            ctx.beginPath();
            ctx.moveTo(20, 5);
            ctx.lineTo(25, 12);
            ctx.lineTo(30, 12);
            ctx.closePath();
            ctx.fill();

            // Lower Body (Point, Darkest)
            const bottomY = 28;

            // Center Front Triangle (Medium Dark)
            ctx.fillStyle = '#1E90FF'; // Dodger Blue
            ctx.beginPath();
            ctx.moveTo(5, 12);
            ctx.lineTo(25, 12);
            ctx.lineTo(15, bottomY);
            ctx.closePath();
            ctx.fill();

            // Left Side (Darker)
            ctx.fillStyle = '#0000CD'; // Medium Blue
            ctx.beginPath();
            ctx.moveTo(0, 12);
            ctx.lineTo(5, 12);
            ctx.lineTo(15, bottomY);
            ctx.closePath();
            ctx.fill();

            // Right Side (Darker)
            ctx.beginPath();
            ctx.moveTo(30, 12);
            ctx.lineTo(25, 12);
            ctx.lineTo(15, bottomY);
            ctx.closePath();
            ctx.fill();

            // Outer Glow Highlight
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 12);
            ctx.lineTo(10, 5);
            ctx.lineTo(20, 5);
            ctx.lineTo(30, 12);
            ctx.lineTo(15, bottomY);
            ctx.closePath();
            ctx.stroke();

        } else if (type === 'heart') {
            // Heart Design (Red Vector Heart)
            ctx.fillStyle = '#DC143C'; // Crimson Red

            ctx.beginPath();
            const hx = 15;
            const hy = 16;
            const hs = 0.8; // Scale
            ctx.moveTo(hx, hy + 5 * hs);
            ctx.bezierCurveTo(hx, hy + 5 * hs, hx - 6 * hs, hy, hx - 6 * hs, hy - 4 * hs);
            ctx.bezierCurveTo(hx - 6 * hs, hy - 8 * hs, hx - 2 * hs, hy - 8 * hs, hx, hy - 5 * hs);
            ctx.bezierCurveTo(hx + 2 * hs, hy - 8 * hs, hx + 6 * hs, hy - 8 * hs, hx + 6 * hs, hy - 4 * hs);
            ctx.bezierCurveTo(hx + 6 * hs, hy, hx, hy + 5 * hs, hx, hy + 5 * hs);
            ctx.fill();

            // Shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(11, 11, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

    }, [type, size]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            title={title}
            style={{
                verticalAlign: 'middle',
                display: 'inline-block'
            }}
        />
    );
};
