"use client";
import { useState, useEffect } from "react";
import { normalizePath } from "@/lib/utils";

export default function Footer() {
    const [settings, setSettings] = useState({
        description: 'มุ่งเน้นการสร้างผู้นำที่มีวิสัยทัศน์และทักษะรอบด้าน เพื่อขับเคลื่อนนวัตกรรมสู่สังคมโลก',
        facebook_url: '#',
        website_url: '#',
        address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        phone: '02-xxx-xxxx',
        email: 'info@spicc.ac.th',
        copyright: '© 2026 วิทยาลัยการอาชีพศีขรภูมิ. All Rights Reserved.',
        privacy_policy_content: '',
        terms_of_use_content: ''
    });
    const [siteSettings, setSiteSettings] = useState({
        site_name: '',
        site_logo: 'school',
        site_logo_url: ''
    });
    const [links, setLinks] = useState([]);
    const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                // Fetch Footer Settings
                const footerRes = await fetch('/web/api/footer');
                const footerData = await footerRes.json();
                if (footerData.success) {
                    if (footerData.settings) {
                        const safeSettings = { ...footerData.settings };
                        Object.keys(safeSettings).forEach(key => {
                            if (safeSettings[key] === null) safeSettings[key] = '';
                        });
                        setSettings(prev => ({ ...prev, ...safeSettings }));
                    }
                    if (footerData.links) setLinks(footerData.links);
                }

                // Fetch Site Settings for Logo/Name
                const settingsRes = await fetch('/web/api/settings');
                const settingsData = await settingsRes.json();
                if (settingsData.success && settingsData.settings) {
                    setSiteSettings(prev => ({ ...prev, ...settingsData.settings }));
                }
            } catch (error) {
                console.error("Failed to fetch footer data:", error);
            }
        };
        fetchFooterData();
    }, []);

    const quickLinks = links.filter(l => l.section === 'quick');
    const helpLinks = links.filter(l => l.section === 'help');

    return (
        <footer className="bg-[#2b4a8a] text-white pt-24 pb-12 relative overflow-hidden" id="contact">
            {settings.show_wave != 0 && (
                <div className="wavy-top absolute top-0 left-0 w-full pointer-events-none">
                    <svg
                        preserveAspectRatio="none"
                        viewBox="0 0 1200 120"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                            fill={settings.wave_color || "#f8f8f5"}
                        />
                    </svg>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-12 relative z-10">
                <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 mb-8">
                        {siteSettings.site_logo_url ? (
                            <img
                                src={normalizePath(siteSettings.site_logo_url)}
                                alt={siteSettings.site_name}
                                className="w-10 h-10 object-contain rounded-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-[#f2cc0d] rounded-lg flex items-center justify-center">
                                <span className="material-icons text-[#2b4a8a]">{siteSettings.site_logo || 'school'}</span>
                            </div>
                        )}
                        <span className="text-xl font-bold tracking-tight uppercase">{siteSettings.site_name}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-8">
                        {settings.description}
                    </p>
                    <div className="flex gap-4">
                        <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f2cc0d] hover:text-[#2b4a8a] transition-all group">
                            <span className="material-icons text-xl">facebook</span>
                        </a>
                        <a href={settings.website_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f2cc0d] hover:text-[#2b4a8a] transition-all group">
                            <span className="material-icons text-xl">map</span>
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 text-[#f2cc0d]">ลิงก์ด่วน</h4>
                    <ul className="space-y-4">
                        {quickLinks.length > 0 ? quickLinks.map(link => (
                            <li key={link.id}><a href={link.url} className="text-slate-400 hover:text-white transition-colors">{link.title}</a></li>
                        )) : (
                            <>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">หลักสูตรปริญญาตรี</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">ปฏิทินการศึกษา</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">บริการนักศึกษา</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">รับสมัครงาน</a></li>
                            </>
                        )}
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 text-[#f2cc0d]">ช่วยเหลือ</h4>
                    <ul className="space-y-4">
                        {helpLinks.length > 0 ? helpLinks.map(link => (
                            <li key={link.id}><a href={link.url} className="text-slate-400 hover:text-white transition-colors">{link.title}</a></li>
                        )) : (
                            <>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">คำถามที่พบบ่อย</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">ติดต่อเจ้าหน้าที่</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">รายงานตัวออนไลน์</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">ร้องเรียน</a></li>
                            </>
                        )}
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 text-[#f2cc0d]">ที่อยู่</h4>
                    <p className="text-slate-400 leading-relaxed mb-4">
                        {settings.address}
                    </p>
                    <p className="text-slate-400 mb-2 flex items-center gap-2">
                        <span className="material-icons text-sm">phone</span> {settings.phone}
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                        <span className="material-icons text-sm">email</span> {settings.email}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 border-t border-white/10 mt-20 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-sm">{settings.copyright}</p>
                <div className="flex gap-8 text-sm text-slate-500">
                    <button
                        onClick={() => setActiveModal('privacy')}
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        นโยบายความเป็นส่วนตัว
                    </button>
                    <button
                        onClick={() => setActiveModal('terms')}
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        ข้อตกลงการใช้งาน
                    </button>
                </div>
            </div>

            {/* Legal Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md animate-fade-in"
                        onClick={() => setActiveModal(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white text-slate-900 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl animate-zoom-in flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-20">
                            <h3 className="text-xl font-bold text-[#2b4a8a] flex items-center gap-2">
                                <span className="material-icons">
                                    {activeModal === 'privacy' ? 'gavel' : 'description'}
                                </span>
                                {activeModal === 'privacy' ? 'นโยบายความเป็นส่วนตัว' : 'ข้อตกลงการใช้งาน'}
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="prose prose-slate max-w-none whitespace-pre-line">
                                {activeModal === 'privacy'
                                    ? (settings.privacy_policy_content || "ยังไม่มีข้อมูลนโยบายความเป็นส่วนตัวในขณะนี้")
                                    : (settings.terms_of_use_content || "ยังไม่มีข้อมูลข้อตกลงการใช้งานในขณะนี้")
                                }
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-6 py-2 bg-[#2b4a8a] text-white rounded-full font-bold hover:bg-[#1e3a6d] transition-colors"
                            >
                                เข้าใจแล้ว
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer >
    );
}
