import React from 'react';
import '../app/customs.css';

interface GlassCardProps {
    children: React.ReactNode;
    className?:string;
}

export const glassCardClass = 'glass-card';

const GlassCard: React.FC<GlassCardProps> = ({ children, className}) => {
    return (
        <div className={`${glassCardClass} ${className || ''}`}>
            {children}
        </div>
    )
};

export default GlassCard;