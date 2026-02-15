"use client";
import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";

export default function AdminAbout() {
    const { showToast } = useToast();
    const [settings, setSettings] = useState({ title: "", title_highlight: "", description: "" });
    const [features, setFeatures] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingFeature, setEditingFeature] = useState(null);
    const [editingStat, setEditingStat] = useState(null);

    const [featureForm, setFeatureForm] = useState({ icon: "verified", title: "", description: "", sort_order: 0 });
    const [statForm, setStatForm] = useState({ value: "", label: "", sort_order: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
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

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/web/api/about", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) showToast("บันทึกข้อมูลหลักเรียบร้อยแล้ว", "success");
        } catch (error) {
            showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
        }
    };

    const handleFeatureSubmit = async (e) => {
        e.preventDefault();
        const method = editingFeature ? "PUT" : "POST";
        try {
            const res = await fetch("/web/api/about/features", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingFeature ? { ...featureForm, id: editingFeature.id } : featureForm)
            });
            if (res.ok) {
                setEditingFeature(null);
                setFeatureForm({ icon: "verified", title: "", description: "", sort_order: 0 });
                fetchData();
                showToast(editingFeature ? "แก้ไขจุดเด่นเรียบร้อยแล้ว" : "เพิ่มจุดเด่นเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
        }
    };

    const handleStatSubmit = async (e) => {
        e.preventDefault();
        const method = editingStat ? "PUT" : "POST";
        try {
            const res = await fetch("/web/api/about/stats", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingStat ? { ...statForm, id: editingStat.id } : statForm)
            });
            if (res.ok) {
                setEditingStat(null);
                setStatForm({ value: "", label: "", sort_order: 0 });
                fetchData();
                showToast(editingStat ? "แก้ไขสถิติเรียบร้อยแล้ว" : "เพิ่มสถิติเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("ไม่สามารถบันทึกสถิติได้", "error");
        }
    };

    const handleDeleteFeature = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/web/api/about/features?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
                showToast("ลบจุดเด่นเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("ไม่สามารถลบข้อมูลได้", "error");
        }
    };

    const handleDeleteStat = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/web/api/about/stats?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
                showToast("ลบสถิติเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("ไม่สามารถลบสถิติได้", "error");
        }
    };

    if (loading) return <div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="text-xl font-bold text-white">จัดการหน้าเกี่ยวกับเรา (About Us)</h1>
                    </div>
                </header>

                <main className="admin-main space-y-8">
                    {/* Main Settings */}
                    <section className="editor-card">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons text-primary">info</span>
                            <h2 className="text-lg font-bold text-white">ข้อมูลหลัก ส่วนหน้า "เกี่ยวกับเรา"</h2>
                        </div>
                        <form onSubmit={handleSettingsSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label>หัวข้อหลัก</label>
                                    <input
                                        type="text"
                                        value={settings.title || ""}
                                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                        placeholder="เช่น มุ่งมั่นสู่ความเป็นเลิศ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>หัวข้อเน้นสี (Highlight)</label>
                                    <input
                                        type="text"
                                        className="text-primary"
                                        value={settings.title_highlight || ""}
                                        onChange={(e) => setSettings({ ...settings, title_highlight: e.target.value })}
                                        placeholder="เช่น พัฒนาศักยภาพไร้ขีดจำกัด"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>คำอธิบาย</label>
                                <textarea
                                    rows={3}
                                    value={settings.description || ""}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    placeholder="คำอธิบายเนื้อหาเกี่ยวกับวิทยาลัย..."
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn-primary px-8">บันทึกข้อมูลหลัก</button>
                            </div>
                        </form>
                    </section>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Stats Section */}
                        <section className="editor-card">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-primary">analytics</span>
                                    <h2 className="text-lg font-bold text-white">จัดการสถิติ (Stats)</h2>
                                </div>
                                <button
                                    onClick={() => { setEditingStat(null); setStatForm({ value: "", label: "", sort_order: stats.length + 1 }); }}
                                    className="btn-primary text-xs py-1.5 px-3"
                                >
                                    เพิ่มสถิติ
                                </button>
                            </div>

                            <form onSubmit={handleStatSubmit} className="mb-6 p-5 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">{editingStat ? "แก้ไขสถิติ" : "เพิ่มสถิติใหม่"}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label>ค่า (เช่น 25+)</label>
                                        <input
                                            type="text" placeholder="25+"
                                            value={statForm.value} onChange={e => setStatForm({ ...statForm, value: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ป้ายชื่อ</label>
                                        <input
                                            type="text" placeholder="ปีประสบการณ์"
                                            value={statForm.label} onChange={e => setStatForm({ ...statForm, label: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="form-group mb-0">
                                        <label>ลำดับ</label>
                                        <input
                                            type="number" className="w-24"
                                            value={statForm.sort_order} onChange={e => setStatForm({ ...statForm, sort_order: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {editingStat && <button type="button" onClick={() => setEditingStat(null)} className="btn-secondary px-4">ยกเลิก</button>}
                                        <button type="submit" className="btn-primary px-6">{editingStat ? "อัปเดต" : "เพิ่ม"}</button>
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {stats.length === 0 ? (
                                    <div className="p-8 text-center text-white/20 border border-dashed border-white/10 rounded-xl">ยังไม่มีข้อมูลสถิติ</div>
                                ) : (
                                    stats.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-primary">{s.value}</span>
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{s.label}</div>
                                                    <div className="text-xs text-white/30">ลำดับ: {s.sort_order}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingStat(s); setStatForm(s); }} className="btn-icon btn-edit">
                                                    <span className="material-icons">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteStat(s.id)} className="btn-icon btn-delete">
                                                    <span className="material-icons">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Features Section */}
                        <section className="editor-card">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-primary">star</span>
                                    <h2 className="text-lg font-bold text-white">จัดการจุดเด่น (Features)</h2>
                                </div>
                                <button
                                    onClick={() => { setEditingFeature(null); setFeatureForm({ icon: "verified", title: "", description: "", sort_order: features.length + 1 }); }}
                                    className="btn-primary text-xs py-1.5 px-3"
                                >
                                    เพิ่มจุดเด่น
                                </button>
                            </div>

                            <form onSubmit={handleFeatureSubmit} className="mb-6 p-5 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">{editingFeature ? "แก้ไขจุดเด่น" : "เพิ่มจุดเด่นใหม่"}</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="form-group col-span-1">
                                        <label>ไอคอน</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text" placeholder="verified"
                                                value={featureForm.icon} onChange={e => setFeatureForm({ ...featureForm, icon: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group col-span-2">
                                        <label>หัวข้อ</label>
                                        <input
                                            type="text" placeholder="หัวข้อจุดเด่น"
                                            value={featureForm.title} onChange={e => setFeatureForm({ ...featureForm, title: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>รายละเอียด</label>
                                    <textarea
                                        placeholder="รายละเอียด..." rows={2}
                                        value={featureForm.description} onChange={e => setFeatureForm({ ...featureForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="form-group mb-0">
                                        <label>ลำดับ</label>
                                        <input
                                            type="number" className="w-24"
                                            value={featureForm.sort_order} onChange={e => setFeatureForm({ ...featureForm, sort_order: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {editingFeature && <button type="button" onClick={() => setEditingFeature(null)} className="btn-secondary px-4">ยกเลิก</button>}
                                        <button type="submit" className="btn-primary px-6">{editingFeature ? "อัปเดต" : "เพิ่ม"}</button>
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {features.length === 0 ? (
                                    <div className="p-8 text-center text-white/20 border border-dashed border-white/10 rounded-xl">ยังไม่มีข้อมูลจุดเด่น</div>
                                ) : (
                                    features.map(f => (
                                        <div key={f.id} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-all group">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="material-icons text-primary">{f.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-white text-sm truncate">{f.title}</h4>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingFeature(f); setFeatureForm(f); }} className="btn-icon btn-edit">
                                                            <span className="material-icons">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDeleteFeature(f.id)} className="btn-icon btn-delete">
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/40 line-clamp-2">{f.description}</p>
                                                <div className="text-[10px] text-white/20 mt-2 uppercase tracking-tight">ลำดับ: {f.sort_order}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
