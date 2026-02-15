"use client";
import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function AdminSettings() {
    const { showToast } = useToast();
    const [settings, setSettings] = useState({
        site_name: "",
        site_logo: "",
        site_logo_url: "",
        site_favicon_url: "",
        site_title_suffix: "",
        site_subtitle: "",
        register_link: "",
        register_button_text: "",
        cookie_policy: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoType, setLogoType] = useState('icon'); // 'icon' or 'image'

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/web/api/settings");
            const data = await res.json();
            if (data.success && data.settings) {
                const s = data.settings;
                setSettings({
                    site_name: s.site_name || "",
                    site_logo: s.site_logo || "",
                    site_logo_url: s.site_logo_url || "",
                    site_favicon_url: s.site_favicon_url || "",
                    site_title_suffix: s.site_title_suffix || "",
                    site_subtitle: s.site_subtitle || "",
                    register_link: s.register_link || "",
                    register_button_text: s.register_button_text || "",
                    cookie_policy: s.cookie_policy || ""
                });
                if (s.site_logo_url) {
                    setLogoType('image');
                }
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e, targetField) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, [targetField]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // If type is icon, clear logo_url. If image, keep both (url takes precedence in Navbar)
            const payload = { ...settings };
            if (logoType === 'icon') {
                payload.site_logo_url = "";
            }

            const res = await fetch("/web/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
            } else {
                if (res.status === 401) {
                    showToast("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่", "error");
                    setTimeout(() => window.location.href = "/web/admin/login", 2000);
                    return;
                }
                showToast("ไม่สามารถบันทึกการตั้งค่าได้", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="text-xl font-bold text-white">ตั้งค่าเว็บไซต์ (Site Settings)</h1>
                    </div>
                </header>

                <main className="admin-main max-w-4xl space-y-8">
                    <section className="editor-card">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons text-primary">settings</span>
                            <h2 className="text-lg font-bold text-white">การตั้งค่าทั่วไป</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label>ชื่อวิทยาลัย / เว็บไซต์</label>
                                    <input
                                        type="text"
                                        value={settings.site_name}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                        placeholder="เช่น วิทยาลัยการอาชีพศีขรภูมิ"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ชื่อเรียกต่อท้าย Browser Tab</label>
                                    <input
                                        type="text"
                                        value={settings.site_title_suffix}
                                        onChange={(e) => setSettings({ ...settings, site_title_suffix: e.target.value })}
                                        placeholder="เช่น วิทยาลัยแห่งอนาคต"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>คําอธิบายใต้ชื่อวิทยาลัย (ใน Navbar)</label>
                                <input
                                    type="text"
                                    value={settings.site_subtitle}
                                    onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })}
                                    placeholder="เช่น วิทยาลัยเทคโนโลยีไอทีคอมพิวเตอร์และภาษาพื้นฐาน"
                                />
                            </div>

                            <hr className="border-white/5" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-group">
                                    <label className="mb-4 block">โลโก้เว็บไซต์ (Site Logo)</label>
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setLogoType('icon')}
                                            className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${logoType === 'icon' ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'}`}
                                        >
                                            <span className="material-icons text-sm">fingerprint</span>
                                            <span className="text-xs font-bold">ใช้ไอคอน</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLogoType('image')}
                                            className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${logoType === 'image' ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'}`}
                                        >
                                            <span className="material-icons text-sm">image</span>
                                            <span className="text-xs font-bold">ใช้รูปภาพ</span>
                                        </button>
                                    </div>

                                    {logoType === 'icon' ? (
                                        <div className="form-group">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="material-icons text-primary">{settings.site_logo || 'school'}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={settings.site_logo}
                                                    onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                                                    placeholder="Icon Name"
                                                    required={logoType === 'icon'}
                                                    className="flex-1 text-sm h-10"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => document.getElementById('logo-upload').click()}
                                            className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden"
                                        >
                                            {settings.site_logo_url ? (
                                                <img src={normalizePath(settings.site_logo_url)} alt="Logo Preview" className="max-h-full max-w-full object-contain p-2" />
                                            ) : (
                                                <>
                                                    <span className="material-icons text-2xl text-white/10 mb-1">cloud_upload</span>
                                                    <span className="text-[10px] text-white/30">อัปโหลด Logo</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'site_logo_url')}
                                        className="hidden"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="mb-4 block">ไอคอน Browser Tab (Favicon)</label>
                                    <div
                                        onClick={() => document.getElementById('favicon-upload').click()}
                                        className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden"
                                    >
                                        {settings.site_favicon_url ? (
                                            <img src={normalizePath(settings.site_favicon_url)} alt="Favicon Preview" className="w-12 h-12 object-contain" />
                                        ) : (
                                            <>
                                                <span className="material-icons text-2xl text-white/10 mb-1">add_photo_alternate</span>
                                                <span className="text-[10px] text-white/30">อัปโหลด Favicon</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="favicon-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'site_favicon_url')}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div className="form-group">
                                <label>นโยบายคุกกี้ (Cookie Policy)</label>
                                <textarea
                                    value={settings.cookie_policy}
                                    onChange={(e) => setSettings({ ...settings, cookie_policy: e.target.value })}
                                    rows="6"
                                    placeholder="รายละเอียดนโยบายคุกกี้..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                ></textarea>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="btn-primary px-10 h-12 font-bold"
                                    disabled={saving}
                                >
                                    {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        </div>
    );
}
