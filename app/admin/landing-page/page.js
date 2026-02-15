"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function LandingPageManager() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        is_active: false,
        image_url: ""
    });

    useEffect(() => {
        fetchLandingData();
    }, []);

    const fetchLandingData = async () => {
        try {
            const res = await fetch("/web/api/landing-page");
            const data = await res.json();
            if (data.success) {
                setFormData({
                    is_active: data.settings.is_active === 1,
                    image_url: data.settings.image_url || ""
                });
            }
        } catch (error) {
            console.error("Error fetching landing page data:", error);
        } finally {
            setLoading(false);
        }
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
                setFormData(prev => ({ ...prev, image_url: data.url }));
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
            const res = await fetch("/web/api/landing-page", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                showToast("บันทึกข้อมูลสำเร็จ", "success");
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
                        <h1>จัดการหน้าคั่น (Landing Page)</h1>
                        <p className="text-sm text-white/50">จัดการหน้าที่จะปรากฏเมื่อมีคนเข้าเว็บครั้งแรก</p>
                    </div>
                </header>

                <main className="admin-main">
                    <form onSubmit={handleSubmit} className="editor-grid">
                        <div className="editor-main-col">
                            <div className="editor-card">
                                <h4>ตั้งค่าทั่วไป</h4>
                                <div className="login-form">
                                    <div className="form-group">
                                        <label className="radio-label" style={{
                                            padding: '12px 16px',
                                            background: formData.is_active ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.05)',
                                            color: formData.is_active ? '#34d399' : 'inherit',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            border: formData.is_active ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="font-bold">เปิดใช้งานหน้าคั่น (Active)</span>
                                                <span className="text-xs opacity-50">เมื่อเปิดใช้งาน หน้านี้จะปรากฏเมื่อผู้เข้าชมเว็บไซต์ครั้งแรก</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="editor-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="editor-card">
                                <h4>รูปภาพที่แสดง</h4>
                                <div style={{
                                    width: '100%', aspectRatio: '16/9', background: '#000',
                                    borderRadius: '8px', overflow: 'hidden', marginBottom: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {formData.image_url ? (
                                        <img src={normalizePath(formData.image_url)} alt="Landing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)' }}>
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="login-form">
                                    <div className="form-group">
                                        <label>อัปโหลดรูปภาพ</label>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                    <div className="form-group">
                                        <label>หรือใส่ URL</label>
                                        <input
                                            type="text"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
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
