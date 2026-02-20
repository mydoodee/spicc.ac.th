"use client";
import { useState, useEffect, useRef } from "react";
import { normalizePath } from "@/lib/utils";

export default function HomeSlider() {
    const [settings, setSettings] = useState(null);
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef(null);

    useEffect(() => {
        fetchSliderData();
    }, []);

    const fetchSliderData = async () => {
        try {
            const res = await fetch("/web/api/home-slider");
            const data = await res.json();
            if (data.success && data.settings.is_enabled) {
                setSettings(data.settings);
                setItems(data.items);
            }
        } catch (error) {
            console.error("Error fetching slider data:", error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    useEffect(() => {
        if (!settings || items.length <= 1 || isHovered) return;

        timeoutRef.current = setTimeout(nextSlide, settings.autoplay_speed || 5000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentIndex, settings, items, isHovered]);

    if (loading || !settings || items.length === 0 || !isVisible) return null;

    const getTransitionClass = () => {
        switch (settings.transition_style) {
            case 'fade': return 'transition-opacity duration-1000';
            case 'zoom': return 'transition-all duration-1000 transform hover:scale-110';
            case 'slide_up': return 'transition-all duration-1000 transform';
            default: return 'transition-transform duration-700 ease-in-out';
        }
    };

    return (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center pt-48 md:pt-60 lg:pt-80">
            <div className="relative w-[92%] md:w-[80%] lg:w-[65%] max-w-6xl pointer-events-auto animate-fade-in-scale"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
                {/* Close Button */}
                {isVisible && (
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute -top-4 -right-4 z-40 bg-white text-[#2b4a8a] w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:bg-[#f2cc0d] transition-colors border-2 border-white/50 group"
                        title="ปิดสไลด์"
                    >
                        <span className="material-icons text-xl group-hover:rotate-90 transition-transform">close</span>
                    </button>
                )}

                <div className="relative h-[250px] md:h-[350px] lg:h-[450px] w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-black/20">
                    {items.map((item, index) => {
                        const isActive = index === currentIndex;

                        let transformStyle = {};
                        if (settings.transition_style === 'carousel') {
                            transformStyle = { transform: `translateX(${(index - currentIndex) * 100}%)` };
                        } else if (settings.transition_style === 'fade') {
                            transformStyle = { opacity: isActive ? 1 : 0 };
                        } else if (settings.transition_style === 'zoom') {
                            transformStyle = {
                                opacity: isActive ? 1 : 0,
                                transform: isActive ? 'scale(1)' : 'scale(1.2)'
                            };
                        } else if (settings.transition_style === 'slide_up') {
                            transformStyle = {
                                opacity: isActive ? 1 : 0,
                                transform: isActive ? 'translateY(0)' : 'translateY(100%)'
                            };
                        }

                        return (
                            <div
                                key={item.id}
                                className={`absolute inset-0 w-full h-full ${getTransitionClass()}`}
                                style={{
                                    ...transformStyle,
                                    zIndex: isActive ? 10 : 0,
                                    visibility: (settings.transition_style === 'carousel' || isActive) ? 'visible' : 'hidden'
                                }}
                            >
                                <img
                                    src={normalizePath(item.image_url)}
                                    alt={item.title || ""}
                                    className="w-full h-full object-cover"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    fetchPriority={index === 0 ? "high" : "low"}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                {/* Content */}
                                {(item.title || item.subtitle) && (
                                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                                        <div className="max-w-3xl">
                                            {item.title && (
                                                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-xl leading-tight animate-fade-in-up">
                                                    {item.title}
                                                </h2>
                                            )}
                                            {item.subtitle && (
                                                <p className="text-sm md:text-lg text-white/90 font-light max-w-2xl drop-shadow-md animate-fade-in-up delay-100 line-clamp-2">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                            {item.link_url && (
                                                <a
                                                    href={item.link_url}
                                                    target={item.link_target || "_self"}
                                                    className="mt-4 inline-block bg-[#f2cc0d] hover:bg-yellow-500 text-[#2b4a8a] text-sm md:text-base font-bold px-6 py-2 md:px-8 md:py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1"
                                                >
                                                    เพิ่มเติม
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Arrows */}
                    {settings.show_arrows && items.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-[#f2cc0d] hover:text-[#2b4a8a] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20 group"
                            >
                                <span className="material-icons transition-transform group-hover:-translate-x-1">chevron_left</span>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-[#f2cc0d] hover:text-[#2b4a8a] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20 group"
                            >
                                <span className="material-icons transition-transform group-hover:translate-x-1">chevron_right</span>
                            </button>
                        </>
                    )}

                    {/* Dots / Pagination */}
                    {settings.show_pagination && items.length > 1 && (
                        <div className="absolute bottom-4 right-8 z-20 flex gap-1.5 md:gap-2">
                            {items.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-6 md:w-8 bg-[#f2cc0d]" : "w-1.5 md:w-2 bg-white/30 hover:bg-white/60"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom Styles for Animations */}
                <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in-scale {
                    animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 { animation-delay: 0.15s; }
            `}</style>
            </div>
        </div>
    );
}
