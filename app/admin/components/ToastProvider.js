"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border
                            animate-slide-in transition-all duration-300
                            ${toast.type === 'success'
                                ? 'bg-[#0f172a] border-emerald-500/20 text-white'
                                : 'bg-[#0f172a] border-red-500/20 text-white'}
                        `}
                        style={{ minWidth: '300px' }}
                    >
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}
                        `}>
                            <span className="material-icons">
                                {toast.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold">
                                {toast.type === 'success' ? 'สำเร็จ!' : 'ข้อผิดพลาด!'}
                            </div>
                            <div className="text-xs text-white/60">{toast.message}</div>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/20 hover:text-white transition-colors"
                        >
                            <span className="material-icons text-sm">close</span>
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
