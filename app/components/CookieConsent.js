"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import CookiePopup from "./CookiePopup";

export default function CookieConsent() {
    const [show, setShow] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [policyContent, setPolicyContent] = useState("");

    useEffect(() => {
        // Always fetch policy content first
        fetch("/web/api/settings")
            .then(res => res.json())
            .then(data => {
                console.log("Cookie Policy Data:", data);
                if (data.success && data.settings) {
                    setPolicyContent(data.settings.cookie_policy || "");
                }
            })
            .catch(err => console.error("Failed to load cookie policy:", err));

        // Check for consent
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            // Small delay for animation effect
            const timer = setTimeout(() => setShow(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "true");
        setShow(false);
    };

    return (
        <>
            {show && (
                <div className="fixed bottom-4 left-4 right-4 z-[90] animate-fade-in-up">
                    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-[#2b4a8a]/10 shadow-2xl rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#f2cc0d]/10 flex items-center justify-center flex-shrink-0 text-[#f2cc0d]">
                                <span className="material-icons">cookie</span>
                            </div>
                            <div className="text-sm text-[#2b4a8a]/80">
                                <p className="font-semibold text-[#2b4a8a] mb-0.5">เว็บไซต์นี้ใช้คุกกี้</p>
                                <p>เราใช้คุกกี้เพื่อเพิ่มประสบการณ์การใช้งานที่ดีที่สุด <button onClick={() => setShowPopup(true)} className="underline hover:text-[#2b4a8a] font-medium">เรียนรู้เพิ่มเติม</button></p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setShow(false)}
                                className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium text-[#2b4a8a]/60 hover:bg-[#2b4a8a]/5 transition-colors"
                            >
                                ปฏิเสธ
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold bg-[#2b4a8a] text-white hover:bg-[#1a3675] shadow-lg shadow-[#2b4a8a]/20 transition-all hover:-translate-y-0.5"
                            >
                                ยอมรับ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CookiePopup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                policyContent={policyContent}
            />
        </>
    );
}
