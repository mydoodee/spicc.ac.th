"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function CookiePopup({ isOpen, onClose, policyContent }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b flex items-center justify-between bg-[#f8f8f5]">
                    <h3 className="text-xl font-bold text-[#2b4a8a]">นโยบายความเป็นส่วนตัวและคุกกี้</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-[#f2cc0d] hover:text-[#2b4a8a] transition-colors"
                    >
                        <span className="material-icons text-lg">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar prose max-w-none text-slate-600">
                    {policyContent ? (
                        <div className="whitespace-pre-wrap">{policyContent}</div>
                    ) : (
                        <p className="text-center text-slate-400 py-8">ยังไม่มีข้อมูลนโยบาย</p>
                    )}
                </div>

                <div className="p-4 border-t bg-[#f8f8f5] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#2b4a8a] text-white rounded-lg font-bold hover:bg-[#1a3675] transition-colors shadow-lg shadow-[#2b4a8a]/20"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
