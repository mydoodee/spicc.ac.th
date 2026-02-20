"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            const dbNews = await getNews();

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
                    title: "งานวันก่อตั้งวิทยาลัย ครบรอบ 25 ปี",
                    date: "20 ตุลาคม 2566",
                    description: "ฉลองครบรอบ 25 ปี แห่งความภาคภูมิใจ พร้อมมุ่งสู่ความเป็นเลิศในทศวรรษหน้า",
                    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1920&auto=format&fit=crop",
                    category: "Activity",
                    is_featured: true
                },
                {
                    id: 3,
                    title: "อบรมเชิงปฏิบัติการ: การออกแบบ User Experience",
                    date: "12 พ.ย. 2566",
                    category: "Workshop",
                    description: "เรียนรู้หลักการออกแบบประสบการณ์ผู้ใช้งานอย่างมืออาชีพ พร้อมฝึกปฏิบัติจริง",
                    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
                    is_featured: false
                }
            ];

            setNews(dbNews.length > 0 ? dbNews : defaultNews);
            setLoading(false);
        };

        loadNews();
    }, []);

    // Helper to group news by year
    const groupNewsByYear = (newsItems) => {
        return newsItems.reduce((acc, item) => {
            // Extract year (assume Thai year is 4 digits at the end or middle)
            const yearMatch = item.date.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : "อื่นๆ";

            if (!acc[year]) acc[year] = [];
            acc[year].push(item);
            return acc;
        }, {});
    };

    const groupedNews = groupNewsByYear(news);

    if (loading) return (
        <main className="min-h-screen bg-[#f8f8f5]">
            <Navbar />
            <div className="pt-48 pb-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b4a8a]"></div>
            </div>
            <Footer />
        </main>
    );

    return (
        <main className="min-h-screen bg-[#f8f8f5]">
            <Navbar />

            {/* Header Section */}
            <div className="pt-48 pb-12 bg-[#2b4a8a] text-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">ข่าวสารและกิจกรรมทั้งหมด</h1>
                    <div className="w-20 h-1 bg-[#f2cc0d] mx-auto rounded-full mb-4"></div>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        รวบรวมข่าวสาร ความเคลื่อนไหว และกิจกรรมต่างๆ ของวิทยาลัยไว้ที่นี่
                    </p>
                </div>
            </div>

            {/* News Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">
                    {Object.keys(groupedNews).sort((a, b) => b - a).map((year) => (
                        <div key={year} className="mb-16">
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-[#2b4a8a]">พ.ศ. {year}</h2>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {groupedNews[year].map((item, index) => (
                                    <div key={item.id || index}>
                                        <Link
                                            href={`/news/${item.slug || item.id}`}
                                            className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                        >
                                            {/* Image */}
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    src={normalizePath(item.image)}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* Category Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-[#f2cc0d] text-[#2b4a8a] rounded-full text-xs font-bold">
                                                        {(() => {
                                                            const map = {
                                                                'Activity': 'กิจกรรม',
                                                                'Press': 'ประชาสัมพันธ์',
                                                                'Workshop': 'อบรม/สัมมนา',
                                                                'Sports': 'กีฬา',
                                                                'International': 'นานาชาติ',
                                                                'Academic': 'วิชาการ',
                                                                'Training': 'อบรม',
                                                                'Competition': 'การแข่งขัน',
                                                                'Education': 'การศึกษา',
                                                                'Admission': 'รับสมัคร',
                                                                'International Workshop': 'การประชุมเชิงปฏิบัติการระดับนานาชาติ'
                                                            };
                                                            return map[item.category] || item.category;
                                                        })()}
                                                    </span>
                                                </div>

                                                {item.is_featured && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                                            ข่าวเด่น
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                                    <span className="material-icons text-base">event</span>
                                                    <span>{item.date}</span>
                                                </div>

                                                <h4 className="text-lg font-bold text-[#2b4a8a] mb-3 line-clamp-2 group-hover:text-[#f2cc0d] transition-colors leading-tight">
                                                    {item.title}
                                                </h4>

                                                <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center gap-2 text-sm font-bold text-[#2b4a8a] group-hover:gap-3 transition-all">
                                                    อ่านรายละเอียด
                                                    <span className="material-icons text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {news.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <span className="material-icons text-6xl mb-4">newspaper</span>
                            <p className="text-xl">ไม่พบข้อมูลข่าวสารในขณะนี้</p>
                        </div>
                    )}
                </div>
            </section>



            <Footer />
        </main>
    );
}
