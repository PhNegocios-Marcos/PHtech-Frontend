import React from 'react';

interface modalProps {
    children:React.ReactNode;
    className?:string;
    onClose: () => void
}

export const modalClass = 'fixed top-0 right-0 z-50 h-full w-1/2 bg-background shadow-lg overflow-auto p-6'

const Modal: React.FC<modalProps> = ({ children, className, onClose }) => {
    return (
        <aside role="dialog" aria-modal="true" className={`${className || ''} ${modalClass}`}>
            <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
            {children}
        </aside>
    );
}  

export default Modal;