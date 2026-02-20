'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/web/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด');
                setLoading(false);
                return;
            }

            router.push('/admin');
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            {/* Background effects */}
            <div className="login-bg-gradient"></div>
            <div className="login-bg-grid"></div>
            <div className="login-floating-orb orb-1"></div>
            <div className="login-floating-orb orb-2"></div>
            <div className="login-floating-orb orb-3"></div>

            <div className="login-container">
                {/* Logo & Brand */}
                <div className="login-brand">
                    <div className="login-logo">
                        <span className="material-icons">admin_panel_settings</span>
                    </div>
                    <h1>ADMIN PANEL</h1>
                    <p>ระบบจัดการหลังบ้าน — SPICC</p>
                </div>

                {/* Login Card */}
                <div className="login-card">
                    <div className="login-card-header">
                        <h2>เข้าสู่ระบบ</h2>
                        <p>กรอกข้อมูลเพื่อเข้าสู่ระบบจัดการ</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <span className="material-icons">error_outline</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">
                                <span className="material-icons">person</span>
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="กรอกชื่อผู้ใช้"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <span className="material-icons">lock</span>
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่าน"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="login-spinner"></span>
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons">login</span>
                                    เข้าสู่ระบบ
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="login-footer">
                    <p>© 2026 SPICC Admin System</p>
                </div>
            </div>
        </div>
    );
}
