'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ menus: 0, pages: 0 });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/web/api/auth/me');
            const data = await res.json();
            if (!res.ok) { router.push('/admin/login'); return; }
            setUser(data.user);
            setLoading(false);
            loadStats();
        } catch {
            router.push('/admin/login');
        }
    };

    const loadStats = async () => {
        try {
            const [menusRes, pagesRes] = await Promise.all([
                fetch('/web/api/menus'),
                fetch('/web/api/pages'),
            ]);
            const menusData = await menusRes.json();
            const pagesData = await pagesRes.json();
            setStats({
                menus: menusData.allMenus?.length || 0,
                pages: pagesData.pages?.length || 0,
            });
        } catch { /* ignore */ }
    };

    const handleLogout = async () => {
        await fetch('/web/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
                <p>กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>Dashboard</h1>
                    </div>
                    <div className="admin-header-right">
                        <div className="admin-user-info">
                            <span className="material-icons">account_circle</span>
                            <div>
                                <span className="admin-user-name">{user?.display_name || user?.username}</span>
                                <span className="admin-user-role">{user?.role}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="admin-logout-btn">
                            <span className="material-icons">logout</span>
                            ออกจากระบบ
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {/* Welcome */}
                    <div className="admin-welcome">
                        <div className="admin-welcome-content">
                            <h2>สวัสดี, {user?.display_name || user?.username} 👋</h2>
                            <p>ยินดีต้อนรับเข้าสู่ระบบจัดการหลังบ้าน</p>
                        </div>
                        <div className="admin-welcome-icon">
                            <span className="material-icons">dashboard</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="admin-stats-grid">
                        <div className="admin-stat-card stat-blue" onClick={() => router.push('/admin/menus')} style={{ cursor: 'pointer' }}>
                            <div className="admin-stat-icon"><span className="material-icons">menu</span></div>
                            <div className="admin-stat-info">
                                <h3>เมนู</h3>
                                <p className="admin-stat-number">{stats.menus}</p>
                                <span className="admin-stat-label">รายการทั้งหมด</span>
                            </div>
                        </div>
                        <div className="admin-stat-card stat-gold" onClick={() => router.push('/admin/pages')} style={{ cursor: 'pointer' }}>
                            <div className="admin-stat-icon"><span className="material-icons">article</span></div>
                            <div className="admin-stat-info">
                                <h3>เพจ</h3>
                                <p className="admin-stat-number">{stats.pages}</p>
                                <span className="admin-stat-label">หน้าทั้งหมด</span>
                            </div>
                        </div>
                        <div className="admin-stat-card stat-green">
                            <div className="admin-stat-icon"><span className="material-icons">people</span></div>
                            <div className="admin-stat-info">
                                <h3>บุคลากร</h3>
                                <p className="admin-stat-number">—</p>
                                <span className="admin-stat-label">เร็วๆ นี้</span>
                            </div>
                        </div>
                        <div className="admin-stat-card stat-purple">
                            <div className="admin-stat-icon"><span className="material-icons">image</span></div>
                            <div className="admin-stat-info">
                                <h3>แกลเลอรี่</h3>
                                <p className="admin-stat-number">—</p>
                                <span className="admin-stat-label">เร็วๆ นี้</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="admin-section">
                        <h3 className="admin-section-title">
                            <span className="material-icons">flash_on</span>
                            การจัดการด่วน
                        </h3>
                        <div className="admin-actions-grid">
                            <button className="admin-action-card active-action" onClick={() => router.push('/admin/menus')}>
                                <span className="material-icons">add_link</span>
                                <span>จัดการเมนู</span>
                            </button>
                            <button className="admin-action-card active-action" onClick={() => router.push('/admin/pages/editor')}>
                                <span className="material-icons">post_add</span>
                                <span>สร้างเพจใหม่</span>
                            </button>
                            <button className="admin-action-card" disabled>
                                <span className="material-icons">person_add</span>
                                <span>เพิ่มบุคลากร</span>
                                <span className="coming-soon">เร็วๆ นี้</span>
                            </button>
                            <button className="admin-action-card" disabled>
                                <span className="material-icons">settings</span>
                                <span>ตั้งค่าเว็บไซต์</span>
                                <span className="coming-soon">เร็วๆ นี้</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
