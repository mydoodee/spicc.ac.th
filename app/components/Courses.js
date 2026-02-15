"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizePath, normalizeHTML } from "@/lib/utils";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [settings, setSettings] = useState({ courses_title: "", courses_description: "" });
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const router = useRouter();

    const handleCourseClick = (course) => {
        if (course.slug) {
            router.push(`/courses/${course.slug}`);
        } else {
            setSelectedCourse(course);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, settingsRes] = await Promise.all([
                    fetch("/web/api/courses"),
                    fetch("/web/api/courses/settings")
                ]);

                const coursesData = await coursesRes.json();
                const settingsData = await settingsRes.json();

                if (coursesData.success) {
                    setCourses(coursesData.courses.filter(c => c.is_active !== false));
                }
                if (settingsData.success) setSettings(settingsData.settings);

                setLoading(false);
            } catch (error) {
                console.error("Fetch failed:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </section>
    );

    const displayCourses = courses.filter(c => c.show_on_home).slice(0, 3);

    // Fallback if no courses are selected to show on home
    const finalCourses = displayCourses.length > 0 ? displayCourses : courses.slice(0, 3);

    return (
        <section id="courses" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-48 -mb-48"></div>

            <div className="container mx-auto px-4 relative">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-navy mb-4">
                        {settings.courses_title || "หลักสูตรที่เปิดสอน"}
                    </h2>
                    <p className="text-xl text-slate-600">
                        {settings.courses_description || "หลักสูตรอาชีวศึกษาที่มุ่งเน้นทักษะวิชาชีพและการทำงานจริง"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {finalCourses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => handleCourseClick(course)}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 cursor-pointer"
                        >
                            <div className="relative h-56 overflow-hidden">
                                {course.image ? (
                                    <img
                                        src={normalizePath(course.image)}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className={`w-full h-full ${course.color || 'bg-navy'} flex items-center justify-center`}>
                                        <span className={`material-icons text-7xl ${course.text_color || 'text-white'} opacity-20`}>
                                            {course.icon || 'school'}
                                        </span>
                                    </div>
                                )}
                                <div className={`absolute top-4 right-4 w-12 h-12 rounded-2xl ${course.color || 'bg-white'} ${course.text_color || 'text-navy'} shadow-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
                                    <span className="material-icons">{course.icon || 'school'}</span>
                                </div>
                                {course.is_special ? (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-yellow-400 text-navy text-[10px] font-black px-3 py-1 rounded-full shadow-lg">RECOMMENDED</span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-navy mb-3 group-hover:text-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p
                                    className="text-slate-600 line-clamp-2 mb-6"
                                    dangerouslySetInnerHTML={{ __html: course.description?.replace(/<[^>]*>/g, '') }}
                                />
                                <div className="flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                                    อ่านรายละเอียดเพิ่มเติม
                                    <span className="material-icons ml-1 text-sm">arrow_forward_ios</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <Link href="/courses" className="inline-flex items-center gap-2 bg-navy text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary hover:text-navy transition-all hover:scale-105 shadow-xl shadow-navy/20">
                        ดูทุกหลักสูตรที่เปิดสอน
                        <span className="material-icons">east</span>
                    </Link>
                </div>
            </div>

            {/* Course Detail Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-navy/90 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setSelectedCourse(null)}
                    ></div>

                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:rotate-90 transition-all border border-white/20"
                        >
                            <span className="material-icons">close</span>
                        </button>

                        <div className="overflow-y-auto custom-scrollbar">
                            <div className="h-72 md:h-96 relative">
                                {selectedCourse.image ? (
                                    <img src={normalizePath(selectedCourse.image)} alt={selectedCourse.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full ${selectedCourse.color} flex items-center justify-center`}>
                                        <span className={`material-icons text-9xl ${selectedCourse.text_color} opacity-20 animate-pulse`}>{selectedCourse.icon}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 ${selectedCourse.color} ${selectedCourse.text_color} shadow-lg shadow-navy/20`}>
                                        <span className="material-icons">{selectedCourse.icon}</span>
                                        <span className="font-bold uppercase tracking-widest text-xs">Technical Course</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-navy">{selectedCourse.title}</h2>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-10 bg-primary rounded-full"></div>
                                        <h4 className="text-xl font-bold text-navy">รายละเอียดและจุดเด่นของหลักสูตร</h4>
                                    </div>
                                    <div
                                        className="text-lg text-slate-600 leading-relaxed prose prose-slate max-w-none"
                                        dangerouslySetInnerHTML={{ __html: normalizeHTML(selectedCourse.description) }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
