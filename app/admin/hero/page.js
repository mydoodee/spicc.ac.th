"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function HeroManager() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        badge_text: "",
        title_line1: "",
        title_line2: "",
        description: "",
        bg_image: "",
        show_buttons: true,
        btn_primary_text: "",
        btn_primary_url: "",
        btn_secondary_text: "",
        btn_secondary_url: "",
        bg_opacity: 0.7,
        bg_fit: "cover",
        btn_primary_target: "_self",
        btn_secondary_target: "_self"
    });

    useEffect(() => {
        fetchHeroData();
    }, []);

    const fetchHeroData = async () => {
        try {
            const res = await fetch("/web/api/hero");
            const data = await res.json();
            if (data.success && data.message !== "No hero data found") {
                // Set defaults if null
                setFormData({
                    badge_text: data.hero.badge_text || "",
                    title_line1: data.hero.title_line1 || "",
                    title_line2: data.hero.title_line2 || "",
                    description: data.hero.description || "",
                    bg_image: data.hero.bg_image || "",
                    show_buttons: data.hero.show_buttons == 1,
                    btn_primary_text: data.hero.btn_primary_text || "",
                    btn_primary_url: data.hero.btn_primary_url || "",
                    btn_secondary_text: data.hero.btn_secondary_text || "",
                    btn_secondary_url: data.hero.btn_secondary_url || "",
                    bg_opacity: data.hero.bg_opacity !== undefined && data.hero.bg_opacity !== null ? data.hero.bg_opacity : 0.7,
                    bg_fit: data.hero.bg_fit || "cover",
                    btn_primary_target: data.hero.btn_primary_target || "_self",
                    btn_secondary_target: data.hero.btn_secondary_target || "_self"
                });
            }
        } catch (error) {
            console.error("Error fetching hero data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setSaving(true);
            const res = await fetch("/web/api/upload", {
                method: "POST",
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, bg_image: data.url }));
                showToast("อัปโหลดรูปภาพสำเร็จ", "success");
            }
        } catch (error) {
            showToast("อัปโหลดรูปภาพไม่สำเร็จ: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/web/api/hero", {
                method: "PUT", // Matches the PUT export in app/api/hero/route.js
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                showToast("บันทึกข้อมูลส่วนหัวสำเร็จ", "success");
            } else {
                showToast("บันทึกไม่สำเร็จ: " + (data.error || "Unknown error"), "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <div className="admin-loading">
                        <div className="admin-loading-spinner"></div>
                        <span>กำลังโหลดข้อมูล...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการส่วนหัว (Hero Section)</h1>
                    </div>
                </header>

                <main className="admin-main">

                    <form onSubmit={handleSubmit} className="editor-grid">
                        <div className="editor-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* 1. Main Content */}
                            <div className="editor-card">
                                <h4>เนื้อหาหลัก</h4>
                                <div className="login-form"> {/* Reusing login-form styles for inputs */}
                                    <div className="form-group">
                                        <label>ข้อความประกาศ (Badge)</label>
                                        <input
                                            type="text" name="badge_text"
                                            value={formData.badge_text} onChange={handleChange}
                                            placeholder="เช่น เปิดรับสมัครปีการศึกษา 2567 แล้ววันนี้"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>หัวข้อบรรทัดที่ 1</label>
                                        <input
                                            type="text" name="title_line1"
                                            value={formData.title_line1} onChange={handleChange}
                                            placeholder="เช่น สร้างอนาคตของคุณที่"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>หัวข้อบรรทัดที่ 2 (เน้นสี)</label>
                                        <input
                                            type="text" name="title_line2"
                                            value={formData.title_line2} onChange={handleChange}
                                            placeholder="เช่น วิทยาลัยระดับพรีเมียม"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>คำอธิบาย</label>
                                        <textarea
                                            name="description"
                                            value={formData.description} onChange={handleChange}
                                            rows="4"
                                            placeholder="รายละเอียดเพิ่มเติม..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Buttons */}
                            <div className="editor-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ margin: 0 }}>ปุ่มกด (Buttons)</h4>
                                    <label className="radio-label" style={{ background: formData.show_buttons ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.05)', color: formData.show_buttons ? '#34d399' : 'inherit' }}>
                                        <input type="checkbox" name="show_buttons" checked={formData.show_buttons} onChange={handleChange} />
                                        <span className="material-icons">{formData.show_buttons ? 'check_box' : 'check_box_outline_blank'}</span>
                                        แสดงปุ่ม
                                    </label>
                                </div>

                                {formData.show_buttons && (
                                    <div className="login-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>ปุ่มหลัก (ข้อความ)</label>
                                                <input type="text" name="btn_primary_text" value={formData.btn_primary_text} onChange={handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label>ปุ่มหลัก (URL)</label>
                                                <input type="text" name="btn_primary_url" value={formData.btn_primary_url} onChange={handleChange} />
                                            </div>
                                            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                                                <label className="checkbox-label flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.btn_primary_target === '_blank'}
                                                        onChange={(e) => setFormData({ ...formData, btn_primary_target: e.target.checked ? '_blank' : '_self' })}
                                                        className="w-4 h-4"
                                                    />
                                                    <span style={{ fontSize: '12px' }}>แท็บใหม่</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>ปุ่มรอง (ข้อความ)</label>
                                                <input type="text" name="btn_secondary_text" value={formData.btn_secondary_text} onChange={handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label>ปุ่มรอง (URL)</label>
                                                <input type="text" name="btn_secondary_url" value={formData.btn_secondary_url} onChange={handleChange} />
                                            </div>
                                            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                                                <label className="checkbox-label flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.btn_secondary_target === '_blank'}
                                                        onChange={(e) => setFormData({ ...formData, btn_secondary_target: e.target.checked ? '_blank' : '_self' })}
                                                        className="w-4 h-4"
                                                    />
                                                    <span style={{ fontSize: '12px' }}>แท็บใหม่</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="editor-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* 3. Image & Actions */}
                            <div className="editor-card">
                                <h4>รูปภาพพื้นหลัง</h4>
                                <div style={{
                                    width: '100%', aspectRatio: '16/9', background: '#000',
                                    borderRadius: '8px', overflow: 'hidden', marginBottom: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)', position: 'relative'
                                }}>
                                    {formData.bg_image ? (
                                        <>
                                            <img
                                                src={normalizePath(formData.bg_image)}
                                                alt="Background"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: formData.bg_fit,
                                                }}
                                            />
                                            {/* Preview Overlay */}
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: `rgba(43, 74, 138, ${formData.bg_opacity})`,
                                                pointerEvents: 'none'
                                            }}></div>
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)' }}>
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="login-form">
                                    <div className="form-group">
                                        <label>ความชัดของภาพ (Overlay Opacity: {Math.round((1 - formData.bg_opacity) * 100)}%)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', opacity: 0.5 }}>มืด</span>
                                            <input
                                                type="range"
                                                min="0" max="1" step="0.05"
                                                name="bg_opacity"
                                                value={formData.bg_opacity}
                                                onChange={(e) => setFormData({ ...formData, bg_opacity: parseFloat(e.target.value) })}
                                                style={{ flex: 1, cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '12px', opacity: 0.5 }}>ชัด</span>
                                        </div>
                                        <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5 }}>* ค่ายิ่งน้อย (ชัดมาก) อาจทำให้ข้อความบนภาพอ่านยากขึ้น</p>
                                    </div>

                                    <div className="form-group">
                                        <label>การจัดวางรูปภาพ (Background Fit)</label>
                                        <select
                                            name="bg_fit"
                                            value={formData.bg_fit}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <option value="cover">เต็มพื้นที่ (Cover - แนะนำ)</option>
                                            <option value="contain">แสดงทั้งรูป (Contain - อาจมีขอบดำ)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>อัปโหลดรูปใหม่</label>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                    <div className="form-group">
                                        <label>หรือใส่ URL</label>
                                        <input type="text" name="bg_image" value={formData.bg_image} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="editor-card">
                                <h4>บันทึกการแก้ไข</h4>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                                    disabled={saving}
                                >
                                    {saving ? <div className="login-spinner"></div> : <span className="material-icons">save</span>}
                                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}
