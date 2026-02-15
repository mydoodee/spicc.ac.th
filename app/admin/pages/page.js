'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';

export default function PagesListPage() {
    const router = useRouter();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const res = await fetch('/web/api/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        setLoading(false);
        loadPages();
    };

    const loadPages = async () => {
        const res = await fetch('/web/api/pages');
        const data = await res.json();
        setPages(data.pages || []);
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันการลบเพจนี้?')) return;
        await fetch(`/web/api/pages/${id}`, { method: 'DELETE' });
        loadPages();
    };

    if (loading) {
        return <div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left"><h1>จัดการเพจ</h1></div>
                    <div className="admin-header-right">
                        <button className="btn-primary" onClick={() => router.push('/admin/pages/editor')}>
                            <span className="material-icons">add</span> สร้างเพจใหม่
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {pages.length === 0 ? (
                        <div className="empty-state">
                            <span className="material-icons">article</span>
                            <h3>ยังไม่มีเพจ</h3>
                            <p>สร้างเพจแรกเพื่อใช้ในเว็บไซต์</p>
                            <button className="btn-primary" onClick={() => router.push('/admin/pages/editor')}>
                                <span className="material-icons">add</span> สร้างเพจใหม่
                            </button>
                        </div>
                    ) : (
                        <div className="pages-table-wrap">
                            <table className="pages-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อเพจ</th>
                                        <th>Slug</th>
                                        <th>สถานะ</th>
                                        <th>วันที่สร้าง</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => (
                                        <tr key={page.id}>
                                            <td className="page-title-cell">
                                                <span className="material-icons">article</span>
                                                <span>{page.title}</span>
                                            </td>
                                            <td>
                                                <code className="slug-badge">/page/{page.slug}</code>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${page.is_published ? 'published' : 'draft'}`}>
                                                    {page.is_published ? 'เผยแพร่' : 'ฉบับร่าง'}
                                                </span>
                                            </td>
                                            <td className="date-cell">
                                                {new Date(page.created_at).toLocaleDateString('th-TH', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-icon btn-edit" title="แก้ไข" onClick={() => router.push(`/admin/pages/editor?id=${page.id}`)}>
                                                        <span className="material-icons">edit</span>
                                                    </button>
                                                    <a className="btn-icon btn-view" title="ดูหน้าเพจ" href={`/page/${page.slug}`} target="_blank">
                                                        <span className="material-icons">open_in_new</span>
                                                    </a>
                                                    <button className="btn-icon btn-delete" title="ลบ" onClick={() => handleDelete(page.id)}>
                                                        <span className="material-icons">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
