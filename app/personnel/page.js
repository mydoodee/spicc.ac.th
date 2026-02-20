"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { normalizePath } from "@/lib/utils";

export default function PersonnelPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [settings, setSettings] = useState({
        personnel_title: 'คณะผู้บริหารและคณาจารย์',
        personnel_description: 'รวบรวมรายนามผู้บริหารและบทบาทสำคัญในการขับเคลื่อนคุณภาพการศึกษาของวิทยาลัย'
    });

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch('/web/api/personnel');
                const data = await res.json();

                // Fetch header settings
                const settingsRes = await fetch('/web/api/personnel/settings');
                const settingsData = await settingsRes.json();

                if (settingsData.success && settingsData.settings) {
                    setSettings(settingsData.settings);
                }

                // Default data if DB is empty
                const defaultStaff = [
                    {
                        id: 1,
                        name: "ดร. สมชาย มุ่งมั่น",
                        role: "คณบดีวิทยบริการ",
                        description: "เชี่ยวชาญด้านการจัดการศึกษาและนวัตกรรมการเรียนรู้ระดับสากล พร้อมมุ่งเน้นการพัฒนาศักยภาพผู้เรียนในยุคดิจิทัลด้วยเทคโนโลยีสมัยใหม่",
                        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUFdMETWzuvm2xdilwDq1wiWL9ifdqLAceOSSqpgL8wxPcDAUXX-Z_Q8pUmXMTVrtQraogFnfPaqCfQv8-bslgLBv7JRymlk6ok5f6TyGZDrnBOGQGW371rYOxN9iLBtBPhbgeFKr-8yDMS9duLW-Z0LV6vp8-LUcdO5dC_-STrSvkybwQg73ocmkCETwx5s72XS4yznOueTwoibpIgDhSyX1yLBaVG7Ap860VtoIT-FWedaUafak5lVgp3XXqNxaxWje0ybHlo90"
                    }
                ];

                if (data.success && data.personnel && data.personnel.length > 0) {
                    setStaff(data.personnel);
                } else {
                    setStaff(defaultStaff);
                }
            } catch (err) {
                console.error("Fetch staff error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

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
                    <h1 className="text-4xl font-bold mb-4">{settings.personnel_title}</h1>
                    <div className="w-20 h-1.5 bg-[#f2cc0d] mx-auto rounded-full mb-4"></div>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        {settings.personnel_description}
                    </p>
                </div>
            </div>

            {/* Personnel Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    {Object.entries(
                        staff.reduce((acc, person) => {
                            const dept = person.department || 'ทั่วไป';
                            if (!acc[dept]) acc[dept] = [];
                            acc[dept].push(person);
                            return acc;
                        }, {})
                    ).sort(([a], [b]) => a.localeCompare(b)).map(([dept, members]) => (
                        <div key={dept} className="mb-20 last:mb-0">
                            <div className="flex items-center gap-4 mb-10 group">
                                <h2 className="text-2xl font-bold text-[#2b4a8a]">{dept}</h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-[#2b4a8a]/20 to-transparent"></div>
                                <span className="px-3 py-1 bg-[#2b4a8a]/5 text-[#2b4a8a] rounded-full text-sm font-medium">
                                    {members.length} บุคลากร
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {members.sort((a, b) => a.sort_order - b.sort_order).map((person, index) => (
                                    <div
                                        key={person.id || index}
                                        className="bg-white rounded-xl overflow-hidden shadow-xl shadow-[#2b4a8a]/5 group animate-fade-in-up hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                                        style={{ animationDelay: `${index * 50}ms` }}
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
                        </div>
                    ))}

                    {staff.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <span className="material-icons text-6xl mb-4">groups</span>
                            <p className="text-xl">ไม่พบข้อมูลในขณะนี้</p>
                        </div>
                    )}
                </div>
            </section>

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
                                className="w-full h-full object-cover"
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

            <Footer />
        </main>
    );
}
