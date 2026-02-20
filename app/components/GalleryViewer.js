'use client';

import { useState, useEffect, useCallback } from 'react';
import { normalizePath } from '@/lib/utils';

export default function GalleryViewer({ galleryJson }) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [galleryItems, setGalleryItems] = useState([]);

    useEffect(() => {
        try {
            const items = JSON.parse(galleryJson || '[]');
            setGalleryItems(items);
        } catch (e) {
            console.error('Failed to parse gallery JSON:', e);
            setGalleryItems([]);
        }
    }, [galleryJson]);

    const onlyImages = galleryItems.filter(item => item.type === 'image');

    const openLightbox = (imageIndex) => {
        setCurrentIndex(imageIndex);
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % onlyImages.length);
    }, [onlyImages.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + onlyImages.length) % onlyImages.length);
    }, [onlyImages.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, nextImage, prevImage]);

    if (galleryItems.length === 0) return null;

    const groups = Array.from(new Set(galleryItems.map(item => item.group || 'ทั่วไป'))).sort();

    return (
        <div className="mt-8">
            {groups.map(groupName => {
                const groupItems = galleryItems.filter(item => (item.group || 'ทั่วไป') === groupName);
                const isHidden = groupName?.startsWith('_hidden_');
                const showHeader = (groups.length > 1 || groupName !== 'ทั่วไป') && !isHidden;

                return (
                    <div key={groupName} className="mb-12 last:mb-0">
                        {showHeader && (
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="w-2 h-6 bg-[#f2cc0d] rounded-full mr-3"></span>
                                {groupName}
                            </h3>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {groupItems.map((item) => {
                                const imageIndex = onlyImages.findIndex(img => img.id === item.id);
                                return (
                                    <div key={item.id} className="group relative">
                                        {item.type === 'image' ? (
                                            <div
                                                onClick={() => openLightbox(imageIndex)}
                                                className="cursor-pointer"
                                            >
                                                <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-[#f2cc0d] transition-all shadow-sm hover:shadow-xl bg-slate-100">
                                                    <img
                                                        src={normalizePath(item.url)}
                                                        alt={item.name || 'Gallery image'}
                                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <a
                                                href={normalizePath(item.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block aspect-square rounded-xl border border-slate-200 hover:border-[#f2cc0d] transition-all shadow-sm hover:shadow-xl bg-white p-4"
                                            >
                                                <div className="h-full flex flex-col items-center justify-center text-center">
                                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                                                        <span className="material-icons text-4xl text-[#ef4444]">picture_as_pdf</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 line-clamp-2 px-2">{item.name}</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Lightbox Modal */}
            {isLightboxOpen && onlyImages.length > 0 && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2"
                    >
                        <span className="material-icons text-4xl">close</span>
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Navigation Buttons */}
                        {onlyImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-3 rounded-full z-10"
                                >
                                    <span className="material-icons text-4xl">chevron_left</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-3 rounded-full z-10"
                                >
                                    <span className="material-icons text-4xl">chevron_right</span>
                                </button>
                            </>
                        )}

                        {/* Current Image */}
                        <div className="max-w-full max-h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                            <img
                                src={normalizePath(onlyImages[currentIndex].url)}
                                alt={onlyImages[currentIndex].name || ""}
                                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-sm"
                            />
                            <div className="mt-4 text-white/50 text-sm">
                                {currentIndex + 1} / {onlyImages.length}
                            </div>
                        </div>
                    </div>

                    {/* Background overlay click to close */}
                    <div className="absolute inset-0 -z-10" onClick={closeLightbox}></div>
                </div>
            )}
        </div>
    );
}
