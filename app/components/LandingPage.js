"use client";
import { useState, useEffect } from "react";
import { normalizePath } from "@/lib/utils";

export default function LandingPage() {
    const [settings, setSettings] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLandingData = async () => {
            try {
                const res = await fetch("/web/api/landing-page");
                const data = await res.json();

                if (data.success && data.settings.is_active === 1) {
                    setSettings(data.settings);

                    // Check if already dismissed in this session
                    const isDismissed = sessionStorage.getItem("landing_dismissed");
                    if (!isDismissed) {
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch landing page:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLandingData();
    }, []);

    const handleEnter = () => {
        setIsVisible(false);
        sessionStorage.setItem("landing_dismissed", "true");
    };

    if (loading || !isVisible || !settings?.image_url) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1e293b] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] overflow-hidden animate-fade-in py-10">
            {/* Image Container */}
            <div className="relative w-[90%] md:w-[70%] h-[60%] md:h-[70%] flex items-center justify-center mb-8">
                <img
                    src={normalizePath(settings.image_url)}
                    alt="Landing Page"
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(242,204,13,0.15)] transition-transform duration-500 hover:scale-[1.02]"
                />
            </div>

            {/* Content / Enter Button */}
            <div className="relative z-10 flex flex-col items-center w-full px-6">
                <button
                    onClick={handleEnter}
                    className="group relative px-10 py-4 bg-[#f2cc0d] hover:bg-yellow-500 text-[#2b4a8a] font-bold rounded-2xl transition-all shadow-2xl hover:-translate-y-1 hover:shadow-yellow-500/20 flex items-center gap-3 overflow-hidden"
                >
                    <span className="relative z-10 text-lg md:text-xl">เข้าสู่เว็บไซต์</span>
                    <span className="material-icons relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>

                    {/* Animated Shine Effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000"></div>
                </button>

                <p className="mt-4 text-white/60 text-sm font-medium animate-pulse">
                    Click to enter SPICC Website
                </p>
            </div>

            {/* Close Button Top Right (Optional) */}
            <button
                onClick={handleEnter}
                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
            >
                <span className="material-icons">close</span>
            </button>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
