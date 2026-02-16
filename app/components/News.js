"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { normalizePath } from "@/lib/utils";

async function getNews() {
    try {
        const res = await fetch('/web/api/news', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        return data.news || [];
    } catch (e) {
        console.error("Failed to fetch news:", e);
        return [];
    }
}

function getYearFromDate(dateStr) {
    if (!dateStr) return null;
    // Assuming format "DD Month YYYY" e.g., "15 พฤศจิกายน 2566"
    const parts = dateStr.split(' ');
    if (parts.length > 0) {
        const year = parts[parts.length - 1];
        return !isNaN(year) ? parseInt(year) : null;
    }
    return null;
}

export default function News() {
    const [news, setNews] = useState([]);
    const [currentFeatured, setCurrentFeatured] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('All');
    const [settings, setSettings] = useState({
        news_title: "ข่าวสารและกิจกรรมล่าสุด",
        news_description: "ติดตามความเคลื่อนไหวและบรรยากาศในรั้ววิทยาลัย"
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [dbNews, settingsRes] = await Promise.all([
                    getNews(),
                    fetch('/web/api/news/settings').then(res => res.json())
                ]);

                // Default data if DB is empty
                const defaultNews = [
                    {
                        id: 1,
                        title: "พิธีรับประกาศนียบัตร ประจำปีการศึกษา 2566",
                        date: "15 พฤศจิกายน 2566",
                        description: "ขอแสดงความยินดีกับผู้สำเร็จการศึกษาทุกคนที่มุ่งมั่นตั้งใจ จนประสบความสำเร็จในวันนี้",
                        image: "https://images.unsplash.com/photo-1523580494863-6f30312248f5?q=80&w=1920&auto=format&fit=crop",
                        category: "Activity",
                        is_featured: true
                    },
                    {
                        id: 2,
                        title: "กิจกรรมกีฬาสี ปีการศึกษา 2565",
                        date: "10 ธันวาคม 2565",
                        description: "บรรยากาศความสนุกสนานและความสามัคคีในกิจกรรมกีฬาสีประจำปี",
                        image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1920&auto=format&fit=crop",
                        category: "Activity",
                        is_featured: false
                    },
                    {
                        id: 3,
                        title: "โครงการอบรมวิชาชีพระยะสั้น",
                        date: "05 ธันวาคม 2565",
                        description: "เปิดรับสมัครผู้สนใจเข้าร่วมอบรมวิชาชีพระยะสั้น หลากหลายหลักสูตร",
                        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1920&auto=format&fit=crop",
                        category: "Training",
                        is_featured: false
                    },
                    {
                        id: 4,
                        title: "การแข่งขันทักษะวิชาชีพ ระดับภาค",
                        date: "20 พฤศจิกายน 2565",
                        description: "นักศึกษาตัวแทนวิทยาลัยคว้ารางวัลชนะเลิศในการแข่งขันทักษะวิชาชีพ",
                        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1920&auto=format&fit=crop",
                        category: "Competition",
                        is_featured: false
                    },
                    {
                        id: 5,
                        title: "กิจกรรมวันไหว้ครู ประจำปี 2565",
                        date: "16 มิถุนายน 2565",
                        description: "พิธีไหว้ครูเพื่อแสดงความกตัญญูกตเวทีต่อครูอาจารย์",
                        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b955?q=80&w=1920&auto=format&fit=crop",
                        category: "Activity",
                        is_featured: false
                    },
                    {
                        id: 6,
                        title: "สอบธรรมศึกษา ปีการศึกษา 2565",
                        date: "15 พฤศจิกายน 2565",
                        description: "นักเรียนนักศึกษาเข้าสอบธรรมศึกษา ประจำปีการศึกษา 2565",
                        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1920&auto=format&fit=crop",
                        category: "Education",
                        is_featured: false
                    },
                    {
                        id: 7,
                        title: "รับสมัครนักศึกษาใหม่ 2566",
                        date: "01 พฤศจิกายน 2565",
                        description: "เปิดรับสมัครนักศึกษาใหม่ ระดับ ปวช. และ ปวส. ประจำปีการศึกษา 2566",
                        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop",
                        category: "Admission",
                        is_featured: false
                    },
                    {
                        id: 8,
                        title: "กิจกรรมจิตอาสาพัฒนาชุมชน",
                        date: "25 ตุลาคม 2565",
                        description: "นักศึกษาและบุคลากรร่วมแรงร่วมใจพัฒนาชุมชนรอบรั้ววิทยาลัย",
                        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1920&auto=format&fit=crop",
                        category: "Activity",
                        is_featured: false
                    }
                ];

                setNews(dbNews.length > 0 ? dbNews : defaultNews);

                if (settingsRes.success && settingsRes.settings) {
                    setSettings(settingsRes.settings);
                }
            } catch (err) {
                console.error("Load data error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Extract unique years
    const uniqueYears = ['All', ...new Set(news.map(item => getYearFromDate(item.date)).filter(y => y !== null))].sort((a, b) => b - a);

    // Filter news based on selected year
    const filteredNews = selectedYear === 'All'
        ? news
        : news.filter(item => getYearFromDate(item.date) === selectedYear);

    // Split news into Featured and General
    const featuredNewsItems = filteredNews.filter(item => item.is_featured);
    const generalNewsItems = filteredNews.filter(item => !item.is_featured);

    // If no featured news, take top 4 items as featured fallback to ensure carousel moves
    const displayFeatured = featuredNewsItems.length > 0 ? featuredNewsItems : filteredNews.slice(0, 4);

    // General news: Show up to 7 latest news items (allow overlap with carousel to ensure a full list)
    const displayGeneral = filteredNews.slice(0, 7);

    const [isHovered, setIsHovered] = useState(false);

    // Reset currentFeatured when year changes or news updates
    useEffect(() => {
        setCurrentFeatured(0);
    }, [selectedYear, news]);

    // Autoplay effect
    useEffect(() => {
        if (displayFeatured.length <= 1 || isHovered) return;

        const timer = setInterval(() => {
            setCurrentFeatured(prev => (prev === displayFeatured.length - 1 ? 0 : prev + 1));
        }, 5000); // Change every 5 seconds

        return () => clearInterval(timer);
    }, [displayFeatured.length, isHovered]);

    const handlePrev = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (displayFeatured.length <= 1) return;
        setCurrentFeatured(prev => (prev === 0 ? displayFeatured.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (displayFeatured.length <= 1) return;
        setCurrentFeatured(prev => (prev === displayFeatured.length - 1 ? 0 : prev + 1));
    };

    if (loading) return null; // Or a loading skeleton

    return (
        <section id="news" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-[#2b4a8a] mb-3">{settings.news_title}</h2>
                    <div className="w-20 h-1 bg-[#f2cc0d] mx-auto rounded-full"></div>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-base mb-6">
                        {settings.news_description}
                    </p>

                    {/* Year Filter */}
                    {uniqueYears.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {uniqueYears.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${selectedYear === year
                                        ? 'bg-[#2b4a8a] text-white shadow-md transform scale-105'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-[#2b4a8a] hover:text-[#2b4a8a]'
                                        }`}
                                >
                                    {year === 'All' ? 'ทั้งหมด' : year}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Featured News - Left Column */}
                    <div className="lg:col-span-7">
                        {displayFeatured.length > 0 && (
                            <div
                                className="animate-fade-in-up animation-delay-200 h-full relative group"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <div className="relative rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 h-full min-h-[500px]">
                                    {/* Slider Container */}
                                    <div
                                        className="flex h-full transition-transform duration-700 ease-in-out"
                                        style={{ transform: `translateX(-${currentFeatured * 100}%)` }}
                                    >
                                        {displayFeatured.map((item, index) => (
                                            <div key={item.id || index} className="w-full h-full shrink-0 relative overflow-hidden">
                                                <Link href={`/news/${item.slug || item.id}`} className="block h-full">
                                                    <div className="relative h-full overflow-hidden">
                                                        <img
                                                            alt={item.title}
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                            src={normalizePath(item.image)}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2b4a8a]/90 via-[#2b4a8a]/40 to-transparent"></div>
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                                        <span className="inline-block px-3 py-1 bg-[#f2cc0d] text-[#2b4a8a] rounded-full text-sm font-bold mb-3">
                                                            {item.is_featured ? 'ข่าวเด่น' : 'ข่าวล่าสุด'}
                                                        </span>
                                                        <h3 className="text-3xl font-bold mb-3 leading-tight line-clamp-2">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-slate-200 mb-4 text-base line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                                            <span className="material-icons text-base">event</span>
                                                            <span>{item.date}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Navigation Buttons */}
                                    {displayFeatured.length > 1 && (
                                        <>
                                            <div className="absolute bottom-8 right-8 flex gap-3 z-10">
                                                <button
                                                    onClick={handlePrev}
                                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-[#f2cc0d] hover:text-[#2b4a8a] hover:border-[#f2cc0d] transition-all shadow-lg"
                                                    aria-label="Previous news"
                                                >
                                                    <span className="material-icons text-xl">chevron_left</span>
                                                </button>
                                                <button
                                                    onClick={handleNext}
                                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-[#f2cc0d] hover:text-[#2b4a8a] hover:border-[#f2cc0d] transition-all shadow-lg"
                                                    aria-label="Next news"
                                                >
                                                    <span className="material-icons text-xl">chevron_right</span>
                                                </button>
                                            </div>

                                            {/* Indicators */}
                                            <div className="absolute bottom-8 left-8 flex gap-2 z-10">
                                                {displayFeatured.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentFeatured(index)}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentFeatured
                                                            ? 'w-8 bg-[#f2cc0d]'
                                                            : 'w-4 bg-white/40 hover:bg-white/60'
                                                            }`}
                                                        aria-label={`Go to news ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* News List - Right Column */}
                    <div className="lg:col-span-5 flex flex-col gap-4 animate-fade-in-up animation-delay-300">
                        {displayGeneral.map((item, index) => (
                            <Link
                                key={index}
                                href={`/news/${item.slug || item.id}`}
                                className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 hover:-translate-x-1 cursor-pointer flex h-32 border border-slate-100"
                            >
                                {/* Image */}
                                <div className="relative w-40 shrink-0 overflow-hidden">
                                    <img
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        src={normalizePath(item.image)}
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col justify-center w-full min-w-0">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                                            {item.category}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons text-[10px]">event</span>
                                            {item.date}
                                        </span>
                                    </div>

                                    <h4 className="text-base font-bold text-[#2b4a8a] mb-1 line-clamp-2 group-hover:text-[#f2cc0d] transition-colors leading-tight">
                                        {item.title}
                                    </h4>

                                    <div className="mt-auto">
                                        <span className="text-xs text-slate-400 group-hover:text-[#2b4a8a] transition-colors flex items-center gap-1">
                                            อ่านต่อ <span className="material-icons text-sm">arrow_right_alt</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* View All helper text for mobile/desktop spacing */}
                        <div className="mt-auto text-right hidden lg:block">
                            <Link href="/news" className="text-sm text-slate-500 hover:text-[#2b4a8a] font-medium inline-flex items-center gap-1 transition-colors">
                                ข่าวสารทั้งหมด <span className="material-icons text-sm">east</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/news"
                        className="bg-white border-2 border-[#2b4a8a] text-[#2b4a8a] hover:bg-[#2b4a8a] hover:text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                    >
                        ดูข่าวสารทั้งหมด
                        <span className="material-icons text-base">east</span>
                    </Link>
                </div>
            </div>


        </section>
    );
}
