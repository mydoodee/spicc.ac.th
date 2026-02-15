"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { normalizePath, normalizeHTML } from "@/lib/utils";

export default function NewsDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { slug } = params;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        fetchNews();
    }, [slug]);

    const fetchNews = async () => {
        try {
            // Try fetching by slug first
            let res = await fetch(`/web/api/news?slug=${slug}`);
            let data = await res.json();

            // Fallback to fetch by id if slug looks like an ID and slug-fetch failed
            if ((!data.success || !data.news) && /^\d+$/.test(slug)) {
                res = await fetch(`/web/api/news?id=${slug}`);
                data = await res.json();
            }

            if (data.success && data.news) {
                setItem(data.news);
            } else {
                setError("ไม่พบข้อมูลข่าวสารนี้");
            }
        } catch (err) {
            console.error("Failed to fetch news:", err);
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    const openLightbox = (index) => {
        setSelectedImageIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        const gallery = JSON.parse(item.gallery || "[]").filter(g => g.type === 'image');
        setSelectedImageIndex((prev) => (prev + 1) % gallery.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        const gallery = JSON.parse(item.gallery || "[]").filter(g => g.type === 'image');
        setSelectedImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f8f5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2b4a8a]"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-[#f8f8f5]">
                <Navbar />
                <div className="container mx-auto px-6 py-32 text-center">
                    <h1 className="text-3xl font-bold text-navy mb-4">{error || "ไม่พบหน้าที่คุณต้องการ"}</h1>
                    <Link href="/" className="text-primary hover:underline">กลับสู่หน้าแรก</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8f8f5]">
            <Navbar />

            {/* Header / Banner */}
            <section className="bg-[#2b4a8a] pt-48 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-6">
                            <span className="material-icons text-sm">newspaper</span>
                            {item.category || 'ข่าวสารและกิจกรรม'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {item.title}
                        </h1>
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-icons text-sm">calendar_today</span>
                                {item.date}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-[-10%] bottom-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl text-white"></div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {item.image && (
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                                <img
                                    src={normalizePath(item.image)}
                                    alt={item.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-navy/5 border border-slate-100">
                            <article
                                className="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-6 
                                prose-headings:text-navy prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 
                                prose-p:mb-4 prose-img:rounded-2xl prose-img:shadow-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: normalizeHTML(item.description) }}
                            />

                            {/* Gallery Section */}
                            {item.gallery && JSON.parse(item.gallery).filter(g => g.type === 'image').length > 0 && (
                                <div className="mt-12 pt-12 border-t border-slate-100">
                                    <h3 className="text-2xl font-bold text-navy mb-8 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-[#f2cc0d] rounded-full"></span>
                                        รูปภาพประกอบกิจกรรม
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {JSON.parse(item.gallery).filter(g => g.type === 'image').map((img, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => openLightbox(idx)}
                                                className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
                                            >
                                                <img
                                                    src={normalizePath(img.url)}
                                                    alt={img.name || `Gallery image ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="material-icons text-white text-3xl">zoom_in</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments Section */}
                            {item.gallery && JSON.parse(item.gallery).filter(g => g.type === 'file').length > 0 && (
                                <div className="mt-12 pt-12 border-t border-slate-100">
                                    <h3 className="text-2xl font-bold text-navy mb-8 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                                        ดาวน์โหลดเอกสารเพิ่มเติม
                                    </h3>
                                    <div className="space-y-3">
                                        {JSON.parse(item.gallery).filter(g => g.type === 'file').map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={normalizePath(file.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <span className="material-icons text-red-500 text-2xl">picture_as_pdf</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-navy group-hover:text-primary transition-colors">{file.name}</p>
                                                        <p className="text-xs text-slate-400">PDF Document</p>
                                                    </div>
                                                </div>
                                                <span className="material-icons text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">download</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center pt-8">
                            <Link
                                href="/#news"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white font-bold rounded-2xl hover:bg-navy/90 transition-all shadow-lg"
                            >
                                <span className="material-icons">arrow_back</span>
                                กลับไปที่รายการข่าวสาร
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Lightbox Modal */}
            {isLightboxOpen && selectedImageIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                        onClick={closeLightbox}
                    >
                        <span className="material-icons text-4xl">close</span>
                    </button>

                    <button
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        onClick={prevImage}
                    >
                        <span className="material-icons text-4xl">chevron_left</span>
                    </button>

                    <button
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        onClick={nextImage}
                    >
                        <span className="material-icons text-4xl">chevron_right</span>
                    </button>

                    <div className="max-w-6xl max-h-[90vh] flex flex-col items-center">
                        <img
                            src={normalizePath(JSON.parse(item.gallery).filter(g => g.type === 'image')[selectedImageIndex].url)}
                            className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg animate-in fade-in zoom-in duration-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className="mt-4 text-white/40 text-sm">
                            {(selectedImageIndex + 1)} / {JSON.parse(item.gallery).filter(g => g.type === 'image').length}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
