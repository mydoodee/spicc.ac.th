"use client";
import { useState, useEffect } from "react";
import { normalizePath } from "@/lib/utils";

export default function Personnel() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [settings, setSettings] = useState({
        personnel_title: 'คณะผู้บริหารและคณาจารย์',
        personnel_description: 'ทีมผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมถ่ายทอดความรู้และนวัตกรรมเพื่อส่งเสริมศักยภาพของผู้เรียนอย่างเต็มที่'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch personnel list
                const res = await fetch('/web/api/personnel');
                const data = await res.json();

                // Fetch header settings
                const settingsRes = await fetch('/web/api/personnel/settings');
                const settingsData = await settingsRes.json();

                if (settingsData.success && settingsData.settings) {
                    setSettings(settingsData.settings);
                }

                if (data.success && data.personnel && data.personnel.length > 0) {
                    // Filter for homepage selected members
                    const homepageStaff = data.personnel.filter(p => p.is_homepage === 1 || p.is_homepage === true);

                    if (homepageStaff.length > 0) {
                        setStaff(homepageStaff);
                    } else {
                        // Fallback to first 4 if no one selected for homepage
                        setStaff(data.personnel.slice(0, 4));
                    }
                } else {
                    setStaff([]);
                }
            } catch (err) {
                console.error("Fetch data error:", err);
                setStaff([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || staff.length === 0) return null;

    return (
        <section id="personnel" className="py-32 bg-[#e0f2fe]/30 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-[#2b4a8a] mb-4">{settings.personnel_title}</h2>
                    <div className="w-24 h-1.5 bg-[#f2cc0d] mx-auto rounded-full"></div>
                    <p className="mt-6 text-slate-600 max-w-2xl mx-auto text-lg">
                        {settings.personnel_description}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {staff.map((person, index) => (
                        <div
                            key={person.id || index}
                            className="bg-white rounded-xl overflow-hidden shadow-xl shadow-[#2b4a8a]/5 group animate-fade-in-up hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => setSelectedPerson(person)}
                        >
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    alt={person.role}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                    src={normalizePath(person.image)}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white font-bold border-2 border-white px-4 py-2 rounded-full transform scale-90 group-hover:scale-100 transition-transform">
                                        ดูรายละเอียด
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-[#2b4a8a] mb-1">{person.name}</h4>
                                <p className="text-[#f2cc0d] font-medium text-sm mb-4">{person.role}</p>
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                    {person.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center animate-fade-in-up">
                    <a
                        href="/web/personnel"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#2b4a8a] border-2 border-[#2b4a8a] rounded-full font-bold hover:bg-[#2b4a8a] hover:text-white transition-all duration-300 group shadow-lg shadow-[#2b4a8a]/10"
                    >
                        ดูลำดับบุคลากรทั้งหมด
                        <span className="material-icons text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </a>
                </div>
            </div>

            {/* Personnel Detail Modal */}
            {selectedPerson && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedPerson(null)}
                    ></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-zoom-in flex flex-col md:flex-row max-h-[90vh]">
                        <button
                            onClick={() => setSelectedPerson(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/10 text-slate-600 hover:bg-black/20 transition-colors flex items-center justify-center"
                        >
                            <span className="material-icons">close</span>
                        </button>

                        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                            <img
                                src={normalizePath(selectedPerson.image)}
                                alt={selectedPerson.name}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>

                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col bg-white overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <span className="px-3 py-1 bg-[#2b4a8a]/10 text-[#2b4a8a] rounded-full text-xs font-bold w-fit mb-4 block">
                                    ข้อมูลบุคลากร
                                </span>
                                <h2 className="text-3xl font-bold text-[#2b4a8a] mb-2 leading-tight">
                                    {selectedPerson.name}
                                </h2>
                                <p className="text-[#f2cc0d] font-bold text-lg mb-6">
                                    {selectedPerson.role}
                                </p>
                                <div className="w-12 h-1 bg-[#f2cc0d] mb-6 rounded-full"></div>
                                <div className="prose prose-slate max-w-none text-black">
                                    <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                                        {selectedPerson.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                                <button
                                    onClick={() => setSelectedPerson(null)}
                                    className="w-full py-3 bg-[#2b4a8a] text-white rounded-xl text-sm font-bold hover:bg-[#1e3a6a] transition-all duration-300 shadow-lg shadow-[#2b4a8a]/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons text-sm">close</span>
                                    ปิดหน้าต่าง
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

