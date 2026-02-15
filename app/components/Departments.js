"use client";
import React, { useState, useEffect } from "react";

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await fetch('/web/api/departments');
                const data = await res.json();
                if (data.success) {
                    setDepartments(data.departments.filter(d => d.is_active));
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch departments:", error);
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    if (loading) return null;
    if (departments.length === 0) return null;

    return (
        <section id="departments" className="py-24 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <span className="text-[#f2cc0d] font-bold tracking-widest uppercase text-sm mb-3 block">
                        Our Faculty
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#2b4a8a] mb-6">
                        แผนกวิชา <span className="text-[#f2cc0d]">ที่เปิดสอน</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-[#f2cc0d] mx-auto rounded-full mb-8"></div>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        เรามุ่งเน้นการผลิตบุคลากรที่มีทักษะวิชาชีพชั้นสูง
                        เพียบพร้อมด้วยคุณธรรมและจริยธรรม เพื่อตอบสนองความต้องการของตลาดแรงงาน
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {departments.map((dept, index) => (
                        <div
                            key={dept.id}
                            className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-[#2b4a8a]/5 border border-slate-100 hover:border-[#f2cc0d]/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Accent Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${dept.color || 'bg-navy'} opacity-[0.05] rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700`}></div>

                            <div className={`w-20 h-20 rounded-2xl ${dept.color || 'bg-navy'} flex items-center justify-center mb-8 shadow-lg shadow-[#2b4a8a]/10 group-hover:rotate-6 transition-transform duration-500`}>
                                <span className="material-icons text-4xl text-white">
                                    {dept.icon || 'school'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-[#2b4a8a] mb-4 group-hover:text-[#f2cc0d] transition-colors">
                                {dept.title}
                            </h3>

                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                {dept.description}
                            </p>

                            <div className="mt-auto pt-6 border-t border-slate-50 w-full flex justify-center">
                                <button className="text-[#2b4a8a] font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                                    ดูรายละเอียด
                                    <span className="material-icons text-xs">arrow_forward_ios</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
