'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';

export default function MenusPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [allMenus, setAllMenus] = useState([]);
    const [pages, setPages] = useState([]);
    const [courses, setCourses] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', url: '', page_id: '', course_id: '', news_id: '', parent_id: '', sort_order: 0, is_active: 1, link_type: 'url', target: '_self' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [collapsedIds, setCollapsedIds] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const res = await fetch('/web/api/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        setLoading(false);
        loadData();
    };

    const loadData = async () => {
        const [menusRes, pagesRes, coursesRes, newsRes] = await Promise.all([
            fetch('/web/api/menus'),
            fetch('/web/api/pages?limit=999'),
            fetch('/web/api/courses'),
            fetch('/web/api/news'),
        ]);
        const menusData = await menusRes.json();
        const pagesData = await pagesRes.json();
        const coursesData = await coursesRes.json();
        const newsData = await newsRes.json();
        setMenus(menusData.menus || []);
        setAllMenus(menusData.allMenus || []);
        setPages(pagesData.pages || []);
        setCourses(coursesData.courses || []);
        setNews(newsData.news || []);
    };

    const toggleCollapse = (id) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        // Add a class for visual feedback
        e.currentTarget.classList.add('dragging');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetItem, targetParentId) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetItem.id) return;

        // Reorder logic
        const updateOrder = async (parentId, siblings) => {
            const newSiblings = [...siblings];
            const draggedIdx = newSiblings.findIndex(i => i.id === draggedItem.id);
            const targetIdx = newSiblings.findIndex(i => i.id === targetItem.id);

            if (draggedIdx !== -1) {
                newSiblings.splice(draggedIdx, 1);
            }

            // Find new index in case it changed after splice
            const finalTargetIdx = newSiblings.findIndex(i => i.id === targetItem.id);
            newSiblings.splice(finalTargetIdx, 0, draggedItem);

            const updates = newSiblings.map((item, idx) => ({
                id: item.id,
                sort_order: idx
            }));

            // If moving to a different parent (optional advanced feature, but keeping it simple for now within same level)
            // For now, only reorder within the same parent
            if (draggedItem.parent_id !== targetParentId) {
                // We would need to update parent_id as well
                // await fetch(`/api/menus/${draggedItem.id}`, { method: 'PUT', ... })
            }

            await fetch('/web/api/menus', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            loadData();
        };

        // Find the siblings of the target
        const findSiblings = (items, targetId) => {
            for (let item of items) {
                if (item.id === targetId) return items;
                if (item.children && item.children.length > 0) {
                    const found = findSiblings(item.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const siblings = findSiblings(menus, targetItem.id);
        if (siblings) {
            await updateOrder(targetParentId, siblings);
        }
    };

    const handleDragEnd = (e) => {
        setDraggedItem(null);
        e.currentTarget.classList.remove('dragging');
        // Clean up any hover classes
        document.querySelectorAll('.menu-tree-item').forEach(el => el.classList.remove('drag-over'));
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        if (e.currentTarget.classList.contains('menu-tree-item')) {
            e.currentTarget.classList.add('drag-over');
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    };

    const openAdd = (parentId = null) => {
        setEditing(null);
        setForm({ title: '', url: '', page_id: '', course_id: '', news_id: '', parent_id: parentId || '', sort_order: 0, is_active: 1, link_type: 'url', target: '_self' });
        setShowModal(true);
    };

    const openEdit = (menu) => {
        setEditing(menu);
        let linkType = 'url';
        if (menu.page_id) linkType = 'page';
        else if (menu.course_id) linkType = 'course';
        else if (menu.news_id) linkType = 'news';

        setForm({
            title: menu.title,
            url: menu.url || '',
            page_id: menu.page_id || '',
            course_id: menu.course_id || '',
            news_id: menu.news_id || '',
            parent_id: menu.parent_id || '',
            sort_order: menu.sort_order || 0,
            is_active: menu.is_active,
            link_type: linkType,
            target: menu.target || '_self',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const body = {
            title: form.title,
            url: form.link_type === 'url' ? form.url : null,
            page_id: form.link_type === 'page' ? (form.page_id || null) : null,
            course_id: form.link_type === 'course' ? (form.course_id || null) : null,
            news_id: form.link_type === 'news' ? (form.news_id || null) : null,
            parent_id: form.parent_id || null,
            sort_order: parseInt(form.sort_order) || 0,
            is_active: form.is_active ? 1 : 0,
            target: form.target || '_self',
        };

        if (editing) {
            await fetch(`/web/api/menus/${editing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } else {
            await fetch('/web/api/menus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        }

        setShowModal(false);
        loadData();
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันการลบเมนูนี้? (sub-menu จะถูกลบด้วย)')) return;
        await fetch(`/web/api/menus/${id}`, { method: 'DELETE' });
        loadData();
    };

    const renderMenuTree = (items, depth = 0, parentId = null) => {
        return items.map((menu) => (
            <div key={menu.id} className="menu-tree-node">
                <div
                    className={`menu-tree-item depth-${depth} ${draggedItem?.id === menu.id ? 'dragging' : ''}`}
                    style={{ paddingLeft: `${20 + depth * 32}px` }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, menu)}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, menu, parentId)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="menu-tree-handle">
                        <span className="material-icons">drag_indicator</span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {menu.children && menu.children.length > 0 && (
                            <button
                                onClick={() => toggleCollapse(menu.id)}
                                className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors shrink-0"
                            >
                                <span className={`material-icons text-sm transition-transform duration-200 ${collapsedIds.has(menu.id) ? '-rotate-90' : ''}`}>
                                    expand_more
                                </span>
                            </button>
                        )}
                        {(!menu.children || menu.children.length === 0) && depth > 0 && <span className="w-6 shrink-0"></span>}

                        <div className="menu-tree-info min-w-0 flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={`menu-status shrink-0 ${menu.is_active ? 'active' : 'inactive'}`}></span>
                                <span className="menu-tree-title font-bold truncate">{menu.title}</span>
                            </div>
                            <span className="menu-tree-url opacity-50 text-xs truncate block">
                                {menu.page_id
                                    ? <><span className="material-icons text-[10px] align-middle mr-1">article</span>{menu.page_title || 'เพจ'}</>
                                    : menu.course_id
                                        ? <><span className="material-icons text-[10px] align-middle mr-1">school</span>{menu.course_title || 'หลักสูตร'}</>
                                        : menu.news_id
                                            ? <><span className="material-icons text-[10px] align-middle mr-1">newspaper</span>{menu.news_title || 'ข่าวสาร'}</>
                                            : (
                                                <>
                                                    {menu.url ? (
                                                        <span title={decodeURIComponent(menu.url)}>
                                                            {(() => {
                                                                try {
                                                                    return decodeURIComponent(menu.url);
                                                                } catch (e) {
                                                                    return menu.url;
                                                                }
                                                            })()}
                                                        </span>
                                                    ) : '—'}
                                                </>
                                            )}
                            </span>
                        </div>
                    </div>

                    <div className="menu-tree-actions">
                        <button className="btn-icon btn-add-sub" title="เพิ่ม sub-menu" onClick={() => openAdd(menu.id)}>
                            <span className="material-icons">add</span>
                        </button>
                        <button className="btn-icon btn-edit" title="แก้ไข" onClick={() => openEdit(menu)}>
                            <span className="material-icons">edit</span>
                        </button>
                        <button className="btn-icon btn-delete" title="ลบ" onClick={() => handleDelete(menu.id)}>
                            <span className="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                {menu.children && menu.children.length > 0 && !collapsedIds.has(menu.id) && (
                    <div className="menu-tree-children">
                        {renderMenuTree(menu.children, depth + 1, menu.id)}
                    </div>
                )}
            </div>
        ));
    };

    const paginatedMenus = menus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(menus.length / itemsPerPage);

    if (loading) {
        return <div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="text-xl font-bold text-white">จัดการเมนู</h1>
                        <p className="text-sm text-white/50">ลากวางเพื่อจัดลำดับเมนู และจัดการเมนูย่อย</p>
                    </div>
                    <div className="admin-header-right">
                        <button className="btn-primary" onClick={() => openAdd()}>
                            <span className="material-icons">add</span> เพิ่มเมนูใหม่
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {menus.length === 0 ? (
                        <div className="empty-state">
                            <span className="material-icons">menu_open</span>
                            <h3>ยังไม่มีเมนู</h3>
                            <p>สร้างเมนูแรกเพื่อใช้ในเว็บไซต์</p>
                            <button className="btn-primary" onClick={() => openAdd()}>
                                <span className="material-icons">add</span> เพิ่มเมนูใหม่
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="menu-tree-container bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                <div className="menu-tree-header grid grid-cols-[1fr_auto] px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-white/40">
                                    <span>ชื่อเมนู / ข้อมูล</span>
                                    <span className="text-right">จัดการ</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {renderMenuTree(paginatedMenus, 0, null)}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-sm text-white/40">
                                        แสดง {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, menus.length)} จากทั้งหมด {menus.length} เมนูหลัก
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 transition-all flex items-center gap-2"
                                        >
                                            <span className="material-icons text-sm">chevron_left</span>
                                            ก่อนหน้า
                                        </button>
                                        <div className="flex gap-1">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-secondary' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 transition-all flex items-center gap-2"
                                        >
                                            ถัดไป
                                            <span className="material-icons text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>ชื่อเมนู</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="เช่น หน้าแรก, เกี่ยวกับเรา" />
                            </div>

                            <div className="form-group">
                                <label>เมนูหลัก (Parent)</label>
                                <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                                    <option value="">— ไม่มี (เป็นเมนูหลัก) —</option>
                                    {allMenus.filter(m => !editing || m.id !== editing.id).map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>ประเภทลิงก์</label>
                                <div className="radio-group">
                                    <label className={`radio-label ${form.link_type === 'url' ? 'active' : ''}`}>
                                        <input type="radio" name="link_type" value="url" checked={form.link_type === 'url'} onChange={() => setForm({ ...form, link_type: 'url' })} />
                                        <span className="material-icons">link</span> URL
                                    </label>
                                    <label className={`radio-label ${form.link_type === 'page' ? 'active' : ''}`}>
                                        <input type="radio" name="link_type" value="page" checked={form.link_type === 'page'} onChange={() => setForm({ ...form, link_type: 'page' })} />
                                        <span className="material-icons">article</span> เลือกเพจ
                                    </label>
                                    <label className={`radio-label ${form.link_type === 'course' ? 'active' : ''}`}>
                                        <input type="radio" name="link_type" value="course" checked={form.link_type === 'course'} onChange={() => setForm({ ...form, link_type: 'course' })} />
                                        <span className="material-icons">school</span> เลือกหลักสูตร
                                    </label>
                                    <label className={`radio-label ${form.link_type === 'news' ? 'active' : ''}`}>
                                        <input type="radio" name="link_type" value="news" checked={form.link_type === 'news'} onChange={() => setForm({ ...form, link_type: 'news' })} />
                                        <span className="material-icons">newspaper</span> เลือกข่าวสาร
                                    </label>
                                </div>
                            </div>

                            {form.link_type === 'url' ? (
                                <div className="form-group">
                                    <label>URL</label>
                                    <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com หรือ #section" />
                                </div>
                            ) : form.link_type === 'page' ? (
                                <div className="form-group">
                                    <label>เลือกเพจ</label>
                                    <select value={form.page_id} onChange={(e) => setForm({ ...form, page_id: e.target.value })}>
                                        <option value="">— เลือกเพจ —</option>
                                        {pages.map(p => (
                                            <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
                                        ))}
                                    </select>
                                </div>
                            ) : form.link_type === 'course' ? (
                                <div className="form-group">
                                    <label>เลือกหลักสูตร</label>
                                    <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                                        <option value="">— เลือกหลักสูตร —</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.title} ({c.slug})</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>เลือกข่าวสาร/กิจกรรม</label>
                                    <select value={form.news_id} onChange={(e) => setForm({ ...form, news_id: e.target.value })}>
                                        <option value="">— เลือกข่าวสาร —</option>
                                        {news.map(n => (
                                            <option key={n.id} value={n.id}>{n.title} ({n.slug})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>ลำดับ</label>
                                    <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>สถานะ</label>
                                    <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: parseInt(e.target.value) })}>
                                        <option value={1}>เปิดใช้งาน</option>
                                        <option value={0}>ปิดใช้งาน</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.target === '_blank'}
                                        onChange={(e) => setForm({ ...form, target: e.target.checked ? '_blank' : '_self' })}
                                        className="w-4 h-4"
                                    />
                                    <span>เปิดในแท็บใหม่ (Open in new tab)</span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                            <button className="btn-primary" onClick={handleSave} disabled={!form.title}>
                                <span className="material-icons">save</span>
                                {editing ? 'บันทึก' : 'เพิ่มเมนู'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
