'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';

export default function PagesListPage() {
    const router = useRouter();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 15
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const res = await fetch('/web/api/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        loadMenus();
        setLoading(false);
        loadPages(1, '', '');
    };

    const loadMenus = async () => {
        const res = await fetch('/web/api/menus');
        const data = await res.json();
        setMenus(data.allMenus || []);
    };

    const loadPages = async (page = 1, search = '', menuId = '') => {
        const res = await fetch(`/web/api/pages?page=${page}&limit=15&search=${encodeURIComponent(search)}&menuId=${menuId}`);
        const data = await res.json();
        if (data.success) {
            setPages(data.pages || []);
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } else {
            alert('โหลดข้อมูลล้มเหลว: ' + (data.error || 'Unknown error'));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadPages(1, searchTerm, selectedMenu);
    };

    const handleMenuChange = (e) => {
        const menuId = e.target.value;
        setSelectedMenu(menuId);
        loadPages(1, searchTerm, menuId);
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันการลบเพจนี้?')) return;
        await fetch(`/web/api/pages/${id}`, { method: 'DELETE' });
        loadPages(pagination.currentPage, searchTerm, selectedMenu);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        loadPages(newPage, searchTerm, selectedMenu);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        <div className="admin-filters">
                            <select
                                className="admin-filter-select"
                                value={selectedMenu}
                                onChange={handleMenuChange}
                            >
                                <option value="">ทุกกลุ่มเมนู</option>
                                {menus.filter(m => !m.parent_id || m.parent_id === 0).map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.title}
                                    </option>
                                ))}
                            </select>

                            <form className="admin-search-box" onSubmit={handleSearch}>
                                <span className="material-icons">search</span>
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อเพจหรือ Slug..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" hidden>Search</button>
                            </form>
                        </div>
                        <button className="btn-primary" onClick={() => router.push('/admin/pages/editor')}>
                            <span className="material-icons">add</span> สร้างเพจใหม่
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {pages.length === 0 ? (
                        <div className="empty-state">
                            <span className="material-icons">{(searchTerm || selectedMenu) ? 'search_off' : 'article'}</span>
                            <h3>{(searchTerm || selectedMenu) ? `ไม่พบข้อมูลที่ค้นหา` : 'ยังไม่มีเพจ'}</h3>
                            <p>{(searchTerm || selectedMenu) ? 'ลองเลือกกลุ่มอื่นหรือใช้คำค้นหาใหม่' : 'สร้างเพจแรกเพื่อใช้ในเว็บไซต์'}</p>
                            {(searchTerm || selectedMenu) ? (
                                <button className="btn-outline" onClick={() => { setSearchTerm(''); setSelectedMenu(''); loadPages(1, '', ''); }}>
                                    ล้างการกรองข้อมูล
                                </button>
                            ) : (
                                <button className="btn-primary" onClick={() => router.push('/admin/pages/editor')}>
                                    <span className="material-icons">add</span> สร้างเพจใหม่
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="pages-table-wrap">
                            <table className="pages-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อเพจ</th>
                                        <th>เมนู / กลุ่ม</th>
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
                                                {page.menu_titles ? (
                                                    <div className="menu-labels">
                                                        {page.menu_titles.split(', ').map((m, idx) => (
                                                            <span key={idx} className="menu-tag">{m}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="no-menu-tag">ยังไม่ได้เชื่อมต่อ</span>
                                                )}
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

                            {/* Pagination UI */}
                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <div className="pagination-info">
                                        แสดงรายการที่ {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} จากทั้งหมด {pagination.totalCount} รายการ
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            className="pagination-btn"
                                            disabled={pagination.currentPage === 1}
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        >
                                            <span className="material-icons">chevron_left</span>
                                        </button>

                                        {[...Array(pagination.totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show limited page numbers if totalPages is large
                                            if (
                                                pagination.totalPages > 7 &&
                                                pageNum !== 1 &&
                                                pageNum !== pagination.totalPages &&
                                                Math.abs(pageNum - pagination.currentPage) > 2
                                            ) {
                                                if (Math.abs(pageNum - pagination.currentPage) === 3) return <span key={i} className="pagination-ellipsis">...</span>;
                                                return null;
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    className={`pagination-btn ${pagination.currentPage === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            className="pagination-btn"
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        >
                                            <span className="material-icons">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
