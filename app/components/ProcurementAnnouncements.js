"use client";
import { useState, useEffect } from "react";
import { normalizePath } from "@/lib/utils";

export default function ProcurementAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [allAnnouncements, setAllAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('all');
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/web/api/procurement');
                const data = await res.json();

                if (data.success && data.announcements) {
                    setAllAnnouncements(data.announcements);
                    setAnnouncements(data.announcements);

                    // Extract unique years
                    const years = [...new Set(data.announcements.map(a => a.year))].sort((a, b) => b - a);
                    setAvailableYears(years);
                }
            } catch (err) {
                console.error("Fetch procurement error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedYear === 'all') {
            setAnnouncements(allAnnouncements);
        } else {
            setAnnouncements(allAnnouncements.filter(a => a.year === parseInt(selectedYear)));
        }
    }, [selectedYear, allAnnouncements]);

    const openModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        document.body.style.overflow = 'auto';
    };

    if (loading || announcements.length === 0) return null;

    const displayAnnouncements = announcements.slice(0, 5);

    return (
        <section id="procurement" className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#2b4a8a]/5 rounded-full blur-3xl -ml-48 -mt-48"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f2cc0d]/5 rounded-full blur-3xl -mr-48 -mb-48"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-[#2b4a8a] mb-4">ประชาสัมพันธ์การจัดซื้อจัดจ้าง</h2>
                    <div className="w-24 h-1.5 bg-[#f2cc0d] mx-auto rounded-full"></div>
                    <p className="mt-6 text-slate-600 max-w-2xl mx-auto text-lg">
                        ข้อมูลประกาศจัดซื้อจัดจ้างของสถาบัน เพื่อความโปร่งใสและตรวจสอบได้
                    </p>
                </div>

                {/* Year Filter */}
                {availableYears.length > 1 && (
                    <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="inline-flex items-center gap-3 bg-slate-50 rounded-2xl p-2 shadow-sm">
                            <span className="material-icons text-[#2b4a8a] ml-2">filter_list</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[#2b4a8a] font-semibold cursor-pointer hover:border-[#f2cc0d] transition-colors focus:outline-none focus:border-[#f2cc0d]"
                            >
                                <option value="all">ทุกปี</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>ปี {year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Announcements List */}
                <div className="space-y-3 mb-12">
                    {displayAnnouncements.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => openModal(item)}
                            className="group bg-gradient-to-r from-white to-slate-50 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-[#f2cc0d] animate-fade-in-up cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                {/* Urgent Flag */}
                                {!!item.is_urgent && (
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md animate-pulse">
                                            <span className="material-icons text-white text-lg">priority_high</span>
                                        </div>
                                    </div>
                                )}

                                {/* Icon */}
                                {!item.is_urgent && (
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#2b4a8a] to-[#1e3a6a] rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-white text-lg">description</span>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <h3 className="text-sm font-bold text-[#2b4a8a] group-hover:text-[#1e3a6a] transition-colors line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-[#f2cc0d]/20 text-[#2b4a8a] rounded-full text-xs font-bold">
                                            {item.year}
                                        </span>
                                    </div>

                                    {item.description && (
                                        <p className="text-slate-600 text-xs mb-2 line-clamp-1">
                                            {item.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 text-xs flex-wrap">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-icons" style={{ fontSize: '14px' }}>calendar_today</span>
                                            <span>{new Date(item.announcement_date).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</span>
                                        </div>

                                        {item.external_url && (
                                            <a
                                                href={item.external_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#2b4a8a] text-[#2b4a8a] rounded-lg font-semibold hover:bg-[#2b4a8a] hover:text-white transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="material-icons" style={{ fontSize: '14px' }}>open_in_new</span>
                                                <span>ดูรายละเอียด</span>
                                            </a>
                                        )}

                                        {JSON.parse(item.gallery || '[]').some(f => f.type === 'image') && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg font-semibold">
                                                <span className="material-icons" style={{ fontSize: '14px' }}>image</span>
                                                <span>รูปภาพ</span>
                                            </div>
                                        )}

                                        {item.file_url && (
                                            <a
                                                href={normalizePath(item.file_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all ml-auto"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="material-icons" style={{ fontSize: '14px' }}>picture_as_pdf</span>
                                                <span>PDF</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {announcements.length > 5 && (
                    <div className="text-center animate-fade-in-up">
                        <a
                            href="/web/procurement"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#2b4a8a] border-2 border-[#2b4a8a] rounded-full font-bold hover:bg-[#2b4a8a] hover:text-white transition-all duration-300 group shadow-lg shadow-[#2b4a8a]/10"
                        >
                            ดูประกาศทั้งหมด ({announcements.length} รายการ)
                            <span className="material-icons text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedItem && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-[#2b4a8a] to-[#1e3a6a] text-white p-6 rounded-t-2xl flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {selectedItem.is_urgent && (
                                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                            <span className="material-icons" style={{ fontSize: '14px' }}>priority_high</span>
                                            เร่งด่วน
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                                        ปี {selectedItem.year}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                                <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
                                    <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
                                    {new Date(selectedItem.announcement_date).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Description */}
                            {selectedItem.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-[#2b4a8a] mb-2">รายละเอียด</h3>
                                    <p className="text-slate-700 leading-relaxed">{selectedItem.description}</p>
                                </div>
                            )}

                            {/* Gallery */}
                            {JSON.parse(selectedItem.gallery || '[]').length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-[#2b4a8a] mb-3">ไฟล์แนบ</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {JSON.parse(selectedItem.gallery || '[]').map((file) => (
                                            <div key={file.id} className="group relative">
                                                {file.type === 'image' ? (
                                                    <a
                                                        href={normalizePath(file.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-[#f2cc0d] transition-all"
                                                    >
                                                        <img
                                                            src={normalizePath(file.url)}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={normalizePath(file.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block aspect-square rounded-xl border-2 border-slate-200 hover:border-red-500 transition-all bg-red-50 flex flex-col items-center justify-center p-4 text-center hover:bg-red-100"
                                                    >
                                                        <span className="material-icons text-red-600 text-4xl mb-2">picture_as_pdf</span>
                                                        <span className="text-xs text-slate-700 line-clamp-2">{file.name}</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                {selectedItem.file_url && (
                                    <a
                                        href={normalizePath(selectedItem.file_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all border-2 border-red-200"
                                    >
                                        <span className="material-icons">picture_as_pdf</span>
                                        <span>ดาวน์โหลด PDF หลัก</span>
                                    </a>
                                )}
                                {selectedItem.external_url && (
                                    <a
                                        href={selectedItem.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-[#2b4a8a] text-white rounded-xl font-semibold hover:bg-[#1e3a6a] transition-all"
                                    >
                                        <span className="material-icons">open_in_new</span>
                                        <span>เปิดลิงก์ภายนอก</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
