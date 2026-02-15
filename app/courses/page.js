"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { normalizePath, normalizeHTML } from "@/lib/utils";

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [settings, setSettings] = useState({
        courses_title: "หลักสูตรที่เปิดสอน",
        courses_description: "หลากหลายสาขาวิชาที่ตอบโจทย์ความต้องการของตลาดโลก พร้อมอุปกรณ์การเรียนที่ทันสมัย"
    });
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
                if (settingsData.success && settingsData.settings) setSettings(settingsData.settings);

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header Section */}
            <div className="pt-52 pb-24 bg-navy text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 animate-fade-in-up">
                        {settings.courses_title}
                    </h1>
                    <p className="text-white/70 max-w-3xl mx-auto text-xl leading-relaxed animate-fade-in-up animation-delay-200">
                        {settings.courses_description}
                    </p>
                </div>
            </div>

            {/* Courses Grid */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {courses.map((course, index) => (
                                <div
                                    key={course.id || index}
                                    onClick={() => handleCourseClick(course)}
                                    className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 flex flex-col cursor-pointer"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        {course.image ? (
                                            <img
                                                src={normalizePath(course.image)}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className={`w-full h-full ${course.color || 'bg-navy'} flex items-center justify-center`}>
                                                <span className={`material-icons text-8xl ${course.text_color || 'text-white'} opacity-10`}>
                                                    {course.icon || 'school'}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`absolute top-6 right-6 w-14 h-14 rounded-2xl ${course.color || 'bg-white'} ${course.text_color || 'text-navy'} shadow-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
                                            <span className="material-icons text-3xl">{course.icon || 'school'}</span>
                                        </div>
                                    </div>

                                    <div className="p-10 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-bold text-navy mb-4 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p
                                            className="text-slate-600 text-lg leading-relaxed mb-8 flex-1 line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: course.description?.replace(/<[^>]*>/g, '') }}
                                        />
                                        <div className="flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                                            รายละเอียดหลักสูตร
                                            <span className="material-icons ml-1 text-sm">arrow_forward_ios</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal - Reusing the same beautiful logic */}
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
                                    <h2 className="text-3xl md:text-5xl font-black text-navy">{selectedCourse.title}</h2>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-navy flex items-center gap-2">
                                        <span className="material-icons text-primary">description</span>
                                        รายละเอียดของหลักสูตร
                                    </h4>
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

            <Footer />
        </main>
    );
}
