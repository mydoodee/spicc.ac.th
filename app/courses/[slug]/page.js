"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { normalizePath, normalizeHTML } from "@/lib/utils";

export default function CourseDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { slug } = params;
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourse();
    }, [slug]);

    const fetchCourse = async () => {
        try {
            // Try fetching by slug first
            let res = await fetch(`/web/api/courses?slug=${slug}`);
            let data = await res.json();

            // Fallback to fetch by id if slug looks like an ID and slug-fetch failed
            if ((!data.success || !data.course) && /^\d+$/.test(slug)) {
                res = await fetch(`/web/api/courses?id=${slug}`);
                data = await res.json();
            }

            if (data.success && data.course) {
                setCourse(data.course);
            } else {
                setError("ไม่พบข้อมูลหลักสูตรนี้");
            }
        } catch (err) {
            console.error("Failed to fetch course:", err);
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f8f5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2b4a8a]"></div>
            </div>
        );
    }

    if (error || !course) {
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

            {/* Hero Header for Course */}
            <section className={`${course.color || 'bg-[#2b4a8a]'} pt-32 pb-20 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-6">
                            <span className="material-icons text-sm">{course.icon || 'school'}</span>
                            หลักสูตรที่เปิดสอน
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-bold ${course.text_color || 'text-white'} mb-6 leading-tight`}>
                            {course.title}
                        </h1>
                        <p className={`text-lg md:text-xl ${course.text_color || 'text-white'} opacity-90 leading-relaxed max-w-2xl`}>
                            {/* Short description prefix or just the title */}
                            สัมผัสประสบการณ์การเรียนรู้ระดับพรีเมียมในสาขา{course.title}
                            พร้อมก้าวสู่ความเป็นมืออาชีพในระดับสากล
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-[-10%] bottom-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl text-white"></div>
                <div className="absolute left-[50%] top-[-10%] w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-2xl"></div>
            </section>

            {/* Course Content */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {course.image && (
                                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                                    <img
                                        src={normalizePath(course.image)}
                                        alt={course.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}

                            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-navy/5 border border-slate-100">
                                <h2 className="text-3xl font-bold text-navy mb-8 flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-[#f2cc0d] rounded-full"></span>
                                    รายละเอียดหลักสูตร
                                </h2>
                                <div
                                    className="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-6 
                                    prose-headings:text-navy prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 
                                    prose-p:mb-4 prose-img:rounded-2xl prose-img:shadow-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                                    dangerouslySetInnerHTML={{ __html: normalizeHTML(course.description) }}
                                />
                            </div>
                        </div>

                        {/* Sidebar / CTA */}
                        <div className="space-y-8">
                            <div className="bg-[#1a365d] p-8 rounded-3xl text-white shadow-2xl sticky top-28">
                                <h3 className="text-2xl font-bold mb-6">สนใจร่วมเป็นส่วนหนึ่งกับเรา?</h3>
                                <p className="text-white/80 mb-8 leading-relaxed">
                                    เปิดรับสมัครในสาขา{course.title} ประจำปีการศึกษา 2567
                                    พร้อมรับสิทธิพิเศษและทุนการศึกษามากมาย
                                </p>
                                <div className="space-y-4">
                                    <button className="w-full bg-[#f2cc0d] hover:bg-yellow-500 text-navy font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">
                                        <span className="material-icons">edit_note</span>
                                        สมัครเรียนออนไลน์
                                    </button>
                                    <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2">
                                        <span className="material-icons">chat</span>
                                        ปรึกษาฝ่ายแนะแนว
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <div className="flex items-center gap-3 text-white/90">
                                        <span className="material-icons text-[#f2cc0d]">call</span>
                                        <span className="font-medium">0XX-XXX-XXXX</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90">
                                        <span className="material-icons text-[#f2cc0d]">description</span>
                                        <span className="font-medium">รับใบประกาศนียบัตรวิชาชีพ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
