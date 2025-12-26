import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-4 border-4 border-purple-400 border-b-transparent rounded-full animate-spin-reverse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl animate-pulse">🕉️</span>
                </div>
            </div>
            <p className="text-amber-100/80 font-medium animate-pulse">{message}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return <div className="flex items-center justify-center py-12">{content}</div>;
};

export default LoadingSpinner;
