"use client";
import React, { useState, useEffect } from "react";

export default function About() {
    const [settings, setSettings] = useState(null);
    const [features, setFeatures] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, featuresRes, statsRes] = await Promise.all([
                    fetch("/web/api/about"),
                    fetch("/web/api/about/features"),
                    fetch("/web/api/about/stats")
                ]);

                const settingsData = await settingsRes.json();
                const featuresData = await featuresRes.json();
                const statsData = await statsRes.json();

                if (settingsData.success) setSettings(settingsData.settings);
                if (featuresData.success) setFeatures(featuresData.features);
                if (statsData.success) setStats(statsData.stats);
            } catch (error) {
                console.error("Fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return null; // Or a skeleton

    return (
        <section id="about" className="py-16 bg-gradient-to-br from-[#f8f8f5] to-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#f2cc0d]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Stats & Info */}
                    <div className="animate-fade-in-up">
                        <span className="text-[#f2cc0d] font-bold tracking-wider uppercase text-sm mb-3 block">
                            เกี่ยวกับเรา
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#2b4a8a] mb-4 leading-tight">
                            {settings?.title || "มุ่งมั่นสู่ความเป็นเลิศ"}<br />
                            <span className="text-[#f2cc0d]">{settings?.title_highlight || "พัฒนาศักยภาพไร้ขีดจำกัด"}</span>
                        </h2>
                        <p className="text-slate-600 text-base leading-relaxed mb-6">
                            {settings?.description || "วิทยาลัยการอาชีพศีขรภูมิ มุ่งมั่นสร้างสภาพแวดล้อมการเรียนรู้ที่ทันสมัยและมีคุณภาพระดับสากล เราเชื่อว่าการศึกษาคือรากฐานสำคัญของการพัฒนาตนเองและสังคม"}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {stats.map((stat, index) => (
                                <div key={stat.id || index} className="text-center p-4 bg-white rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-[#2b4a8a] mb-1">{stat.value}</div>
                                    <div className="text-xs text-slate-600">{stat.label}</div>
                                </div>
                            ))}
                            {stats.length === 0 && (
                                <>
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                        <div className="text-3xl font-bold text-[#2b4a8a] mb-1">25+</div>
                                        <div className="text-xs text-slate-600">ปีประสบการณ์</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                        <div className="text-3xl font-bold text-[#2b4a8a] mb-1">100+</div>
                                        <div className="text-xs text-slate-600">คณาจารย์</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                        <div className="text-3xl font-bold text-[#2b4a8a] mb-1">5K+</div>
                                        <div className="text-xs text-slate-600">นักศึกษา</div>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>

                    {/* Right: Features */}
                    <div className="space-y-4 animate-fade-in-up animation-delay-200">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id || index}
                                className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2b4a8a] to-[#3d5a9e] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-icons text-white">{feature.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2b4a8a] text-base mb-1">{feature.title}</h4>
                                    <p className="text-sm text-slate-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                        {features.length === 0 && (
                            <div className="p-8 text-center text-slate-400 bg-white/50 rounded-xl border border-dashed">
                                ยังไม่มีข้อมูลจุดเด่น
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
