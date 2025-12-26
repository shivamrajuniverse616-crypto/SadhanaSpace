import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
    if (!message) return null;

    // Check for Firestore index error
    const getIndexUrl = (msg: string) => {
        const urlMatch = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        return urlMatch ? urlMatch[0] : null;
    };

    const indexUrl = getIndexUrl(message);
    const isIndexError = message.includes('index') && !!indexUrl;

    return (
        <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-sm p-4 rounded-xl flex items-start space-x-3 mb-6 animate-fade-in group hover:bg-red-500/20 transition-all">
            <div className="p-2 bg-red-500/20 rounded-full shrink-0 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 text-red-200" />
            </div>
            <div className="flex-1">
                <h3 className="text-red-100 font-semibold text-sm mb-1">
                    {isIndexError ? "Missing Index Required" : "Attention Needed"}
                </h3>
                <p className="text-red-200/80 text-sm leading-relaxed mb-2">{message}</p>

                {isIndexError && indexUrl && (
                    <a
                        href={indexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 mt-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
                    >
                        Create Missing Index
                    </a>
                )}
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-red-300 hover:text-red-100 p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
