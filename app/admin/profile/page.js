"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";

export default function ProfilePage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [profile, setProfile] = useState({
        username: "",
        display_name: "",
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAuthAndFetchProfile();
    }, []);

    const checkAuthAndFetchProfile = async () => {
        try {
            const res = await fetch("/web/api/auth/profile");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/admin/login");
                    return;
                }
                throw new Error(data.error || "Failed to fetch profile");
            }

            if (data.success) {
                setProfile(prev => ({
                    ...prev,
                    username: data.profile.username,
                    display_name: data.profile.display_name
                }));
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            showToast("ไม่สามารถดึงข้อมูลโปรไฟล์ได้", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (profile.new_password && profile.new_password !== profile.confirm_password) {
            showToast("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน", "error");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/web/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    display_name: profile.display_name,
                    current_password: profile.current_password,
                    new_password: profile.new_password
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(data.message || "อัปเดตโปรไฟล์เรียบร้อยแล้ว", "success");
                setProfile(prev => ({
                    ...prev,
                    current_password: "",
                    new_password: "",
                    confirm_password: ""
                }));
            } else {
                showToast(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-layout" style={{ background: '#0f1320' }}>
                <AdminSidebar />
                <div className="admin-content">
                    <div className="admin-loading">
                        <div className="admin-loading-spinner"></div>
                        <p>กำลังโหลด...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout" style={{ background: '#0f1320', minHeight: '100vh' }}>
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการโปรไฟล์ (Admin Profile)</h1>
                    </div>
                </header>

                <main className="admin-main">
                    <div className="admin-section">
                        <h3 className="admin-section-title">
                            <span className="material-icons">account_circle</span>
                            ข้อมูลส่วนตัว
                        </h3>

                        <div className="editor-card">
                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ชื่อผู้ใช้ (Username)</label>
                                        <input
                                            type="text"
                                            value={profile.username}
                                            disabled
                                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ชื่อที่แสดง (Display Name)</label>
                                        <input
                                            type="text"
                                            value={profile.display_name}
                                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '24px 0' }} />

                                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>เปลี่ยนรหัสผ่าน</h4>

                                <div className="form-group">
                                    <label>รหัสผ่านปัจจุบัน (สำหรับยืนยันการเปลี่ยนแปลง)</label>
                                    <input
                                        type="password"
                                        value={profile.current_password}
                                        onChange={(e) => setProfile({ ...profile, current_password: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>รหัสผ่านใหม่</label>
                                        <input
                                            type="password"
                                            value={profile.new_password}
                                            onChange={(e) => setProfile({ ...profile, new_password: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ยืนยันรหัสผ่านใหม่</label>
                                        <input
                                            type="password"
                                            value={profile.confirm_password}
                                            onChange={(e) => setProfile({ ...profile, confirm_password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary"
                                        style={{ padding: '12px 32px' }}
                                    >
                                        {saving ? (
                                            <div className="login-spinner"></div>
                                        ) : (
                                            <>
                                                <span className="material-icons">save</span>
                                                บันทึกการเปลี่ยนแปลง
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
