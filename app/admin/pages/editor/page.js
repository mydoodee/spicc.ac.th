'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminSidebar from '../../components/AdminSidebar';
import { normalizePath } from '@/lib/utils';

// Dynamic import for the RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../../../components/RichTextEditor'), {
    ssr: false,
    loading: () => <div className="h-96 w-full bg-slate-100 animate-pulse rounded-lg"></div>
});

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const [form, setForm] = useState({ title: '', slug: '', content: '', is_published: true, gallery: '[]' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [menus, setMenus] = useState([]);
    const [menuLinkProgress, setMenuLinkProgress] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('ทั่วไป');
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        const init = async () => {
            await checkAuth();
            loadMenus();
        };
        init();
    }, []);

    // Reset state when switching between "New Page" and "Edit Page"
    useEffect(() => {
        if (!editId) {
            setForm({ title: '', slug: '', content: '', is_published: true, gallery: '[]' });
        } else {
            loadPage();
        }
    }, [editId]);

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            const uploadData = new FormData();
            uploadData.append('file', file);

            try {
                const res = await fetch('/web/api/upload', {
                    method: 'POST',
                    body: uploadData
                });
                const data = await res.json();
                if (data.success) {
                    setForm(prev => {
                        const currentGallery = JSON.parse(prev.gallery || '[]');
                        const newItem = {
                            id: Date.now() + Math.random().toString(36).substr(2, 9),
                            url: data.url,
                            name: file.name,
                            type: file.type.includes('image') ? 'image' : 'file',
                            group: selectedGroup || 'ทั่วไป'
                        };
                        return { ...prev, gallery: JSON.stringify([...currentGallery, newItem]) };
                    });
                }
            } catch (error) {
                console.error('Upload failed for file:', file.name);
            }
        }
    };

    const removeGalleryItem = (itemId) => {
        setForm(prev => {
            const currentGallery = JSON.parse(prev.gallery || '[]');
            const updatedGallery = currentGallery.filter(item => item.id !== itemId);
            return { ...prev, gallery: JSON.stringify(updatedGallery) };
        });
    };

    const checkAuth = async () => {
        const res = await fetch('/web/api/auth/me', { cache: 'no-store' });
        if (!res.ok) { router.push('/admin/login'); return; }
        setLoading(false);
    };

    const loadPage = async () => {
        const res = await fetch(`/web/api/pages/${editId}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.page) {
            setForm({
                title: data.page.title,
                slug: data.page.slug,
                content: data.page.content || '',
                is_published: !!data.page.is_published,
                gallery: data.page.gallery || '[]',
            });
        }
    };

    const loadMenus = async () => {
        const res = await fetch('/web/api/menus', { cache: 'no-store' });
        const data = await res.json();
        setMenus(data.allMenus || []);
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9ก-๙\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setForm(prev => ({
            ...prev,
            title,
            slug: !editId ? generateSlug(title) : prev.slug,
        }));
    };

    const handleSave = async () => {
        if (!form.title || !form.slug) {
            setMessage('กรุณากรอก title และ slug');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const url = editId ? `/web/api/pages/${editId}` : '/web/api/pages';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || 'เกิดข้อผิดพลาด');
                setSaving(false);
                return;
            }

            setMessage('บันทึกสำเร็จ!');
            setSaving(false);

            if (!editId && data.page?.id) {
                router.push(`/admin/pages/editor?id=${data.page.id}`);
            }
        } catch (err) {
            setMessage('เกิดข้อผิดพลาด: ' + err.message);
            setSaving(false);
        }
    };

    const handleLinkToMenu = async () => {
        setMenuLinkProgress(true);
        try {
            const res = await fetch('/web/api/menus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    page_id: editId,
                    parent_id: selectedParentId || null,
                    is_active: 1,
                    sort_order: 0
                })
            });

            if (res.ok) {
                setMessage('เชื่อมต่อเมนูเรียบร้อยแล้ว!');
                setShowMenuModal(false);
            } else {
                const data = await res.json();
                setMessage('เชื่อมต่อเมนูไม่สำเร็จ: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            setMessage('Error linking menu: ' + err.message);
        } finally {
            setMenuLinkProgress(false);
        }
    };

    if (loading) {
        return <div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <button className="btn-back" onClick={() => router.push('/admin/pages')}>
                            <span className="material-icons">arrow_back</span>
                        </button>
                        <h1>{editId ? 'แก้ไขเพจ' : 'สร้างเพจใหม่'}</h1>
                    </div>
                    <div className="admin-header-right">
                        {editId && (
                            <Link className="btn-secondary" href={`/page/${form.slug}`} target="_blank">
                                <span className="material-icons">open_in_new</span> ดูตัวอย่าง
                            </Link>
                        )}
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            <span className="material-icons">{saving ? 'hourglass_empty' : 'save'}</span>
                            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {message && (
                        <div className={`editor-message ${message.includes('สำเร็จ') ? 'success' : 'error'}`}>
                            <span className="material-icons">{message.includes('สำเร็จ') ? 'check_circle' : 'error'}</span>
                            {message}
                        </div>
                    )}

                    <div className="editor-grid">
                        <div className="editor-main-col">
                            <div className="editor-card mb-6">
                                <div className="form-group mb-6">
                                    <label>ชื่อเพจ</label>
                                    <input
                                        className="editor-title-input"
                                        value={form.title}
                                        onChange={handleTitleChange}
                                        placeholder="ชื่อเพจ เช่น เกี่ยวกับเรา"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เนื้อหาเพจ</label>
                                    <RichTextEditor
                                        value={form.content}
                                        onChange={(content) => setForm(prev => ({ ...prev, content }))}
                                        placeholder="พิมพ์เนื้อหาที่นี่... (สามารถลากวางรูปภาพ หรือปรับขนาดได้ตามต้องการ)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="editor-side-col">
                            <div className="editor-card">
                                <h4>ตั้งค่าหัวข้อ URL</h4>
                                <div className="form-group mb-4">
                                    <label>Slug (URL)</label>
                                    <div className="slug-input-wrap">
                                        <span className="slug-prefix">/page/</span>
                                        <input
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            placeholder="about-us"
                                        />
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label>สถานะการเผยแพร่</label>
                                    <select
                                        value={form.is_published ? '1' : '0'}
                                        onChange={(e) => setForm({ ...form, is_published: e.target.value === '1' })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    >
                                        <option value="0">ฉบับร่าง (Draft)</option>
                                        <option value="1">เผยแพร่ (Published)</option>
                                    </select>
                                </div>

                                <div className="form-group mb-4">
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>
                                        <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>collections</span> คลังรูปภาพ
                                    </label>

                                    <div style={{
                                        padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {/* Group Management */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>เลือกกลุ่มที่จะอัปโหลด:</label>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                {Array.from(new Set([...JSON.parse(form.gallery || "[]").map(i => i.group || 'ทั่วไป'), 'ทั่วไป'])).map(g => {
                                                    const isHidden = g.startsWith('_hidden_');
                                                    const display = isHidden ? g.replace('_hidden_', '') : g;
                                                    return (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setSelectedGroup(g)}
                                                            style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                background: selectedGroup === g ? (isHidden ? '#64748b' : '#3b82f6') : 'rgba(255,255,255,0.1)',
                                                                color: 'white',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                textDecoration: isHidden ? 'line-through' : 'none'
                                                            }}
                                                        >
                                                            {display}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="เพิ่มกลุ่มใหม่..."
                                                    value={newGroupName}
                                                    onChange={(e) => setNewGroupName(e.target.value)}
                                                    style={{
                                                        flex: 1, padding: '6px 12px', borderRadius: '6px',
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
                                                        color: 'white', fontSize: '13px'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newGroupName.trim()) {
                                                            setSelectedGroup(newGroupName.trim());
                                                            setNewGroupName('');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '6px 12px', borderRadius: '6px', background: '#10b981', color: 'white',
                                                        border: 'none', cursor: 'pointer', fontSize: '13px'
                                                    }}
                                                >
                                                    สร้าง
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '16px' }}>
                                            <label className="btn-secondary" style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                cursor: 'pointer', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                                                padding: '10px 16px', borderRadius: '8px', fontSize: '14px', border: 'none',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <span className="material-icons">cloud_upload</span>
                                                อัปโหลดเข้ากลุ่ม "{selectedGroup.startsWith('_hidden_') ? selectedGroup.replace('_hidden_', '') : selectedGroup}"
                                                <input
                                                    type="file" multiple
                                                    accept="image/*,.pdf"
                                                    onChange={handleGalleryUpload}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        </div>

                                        {/* Grouped Gallery Display */}
                                        {(() => {
                                            const galleryData = JSON.parse(form.gallery || "[]");
                                            const uniqueGroups = Array.from(new Set(galleryData.map(i => i.group || 'ทั่วไป'))).sort();

                                            const toggleVisibility = (groupName) => {
                                                const isHidden = groupName?.startsWith('_hidden_');
                                                const newGroupName = isHidden ? groupName.replace('_hidden_', '') : `_hidden_${groupName}`;

                                                setForm(prev => {
                                                    const gallery = JSON.parse(prev.gallery || '[]');
                                                    const updated = gallery.map(item =>
                                                        (item.group || 'ทั่วไป') === groupName ? { ...item, group: newGroupName } : item
                                                    );
                                                    return { ...prev, gallery: JSON.stringify(updated) };
                                                });
                                                if (selectedGroup === groupName) setSelectedGroup(newGroupName);
                                            };

                                            const renameGroup = (oldName, newName) => {
                                                if (!newName || oldName === newName) return;
                                                setForm(prev => {
                                                    const gallery = JSON.parse(prev.gallery || '[]');
                                                    const updated = gallery.map(item =>
                                                        (item.group || 'ทั่วไป') === oldName ? { ...item, group: newName } : item
                                                    );
                                                    return { ...prev, gallery: JSON.stringify(updated) };
                                                });
                                                if (selectedGroup === oldName) setSelectedGroup(newName);
                                            };

                                            return uniqueGroups.map(groupName => {
                                                const items = galleryData.filter(i => (i.group || 'ทั่วไป') === groupName);
                                                const isHidden = groupName?.startsWith('_hidden_');
                                                const displayName = isHidden ? groupName.replace('_hidden_', '') : groupName;

                                                return (
                                                    <div key={groupName} style={{ marginBottom: '24px' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginBottom: '12px',
                                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                                            paddingBottom: '4px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    defaultValue={displayName}
                                                                    onBlur={(e) => renameGroup(groupName, isHidden ? `_hidden_${e.target.value}` : e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            renameGroup(groupName, isHidden ? `_hidden_${e.target.value}` : e.target.value);
                                                                            e.target.blur();
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: isHidden ? '#94a3b8' : '#60a5fa',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '600',
                                                                        padding: '2px 4px',
                                                                        width: '100%',
                                                                        outline: 'none',
                                                                        cursor: 'text',
                                                                        textDecoration: isHidden ? 'line-through' : 'none'
                                                                    }}
                                                                    title="คลิกเพื่อเปลี่ยนชื่อกลุ่ม"
                                                                />
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{items.length} รายการ</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleVisibility(groupName)}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: isHidden ? '#94a3b8' : '#f2cc0d',
                                                                        cursor: 'pointer',
                                                                        display: 'flex'
                                                                    }}
                                                                    title={isHidden ? "แสดงชื่อกลุ่มหน้าเว็บ" : "ซ่อนชื่อกลุ่มหน้าเว็บ"}
                                                                >
                                                                    <span className="material-icons" style={{ fontSize: '18px' }}>
                                                                        {isHidden ? 'visibility_off' : 'visibility'}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                                                            {items.map((item) => (
                                                                <div key={item.id} style={{ position: 'relative' }}>
                                                                    {item.type === 'image' ? (
                                                                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                                            <img src={normalizePath(item.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(0,0,0,0.2)' }} />
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            width: '100%', aspectRatio: '1/1', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                                            border: '1px solid rgba(255,255,255,0.2)', padding: '8px', textAlign: 'center'
                                                                        }}>
                                                                            <span className="material-icons" style={{ color: '#ef4444' }}>picture_as_pdf</span>
                                                                            <span style={{ fontSize: '10px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', color: 'white' }}>
                                                                                {item.name}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeGalleryItem(item.id)}
                                                                        style={{
                                                                            position: 'absolute', top: '-8px', right: '-8px',
                                                                            background: '#ef4444', color: 'white', borderRadius: '50%',
                                                                            width: '24px', height: '24px', border: 'none', cursor: 'pointer',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 1
                                                                        }}
                                                                    >
                                                                        <span className="material-icons" style={{ fontSize: '14px' }}>close</span>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {editId && (
                                    <button
                                        className="btn-link-menu"
                                        onClick={() => setShowMenuModal(true)}
                                    >
                                        <span className="material-icons">link</span>
                                        นำไปใส่ในเมนู
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Link to Menu Modal */}
                {showMenuModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>เชื่อมต่อเข้ากับเมนู</h3>
                                <button className="modal-close" onClick={() => setShowMenuModal(false)}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p className="text-sm text-slate-400 mb-4">
                                    เลือกเมนูหลักที่ต้องการให้หน้าเพจนี้ไปแสดงผล (ว่างไว้หากเป็นเมนูหลัก)
                                </p>
                                <div className="form-group">
                                    <label>เมนูหลัก (Parent)</label>
                                    <select
                                        className="w-full"
                                        value={selectedParentId}
                                        onChange={(e) => setSelectedParentId(e.target.value)}
                                    >
                                        <option value="">-- เป็นเมนูหลัก --</option>
                                        {menus.filter(m => !m.parent_id).map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowMenuModal(false)}>ยกเลิก</button>
                                <button
                                    className="btn-primary"
                                    onClick={handleLinkToMenu}
                                    disabled={menuLinkProgress}
                                >
                                    {menuLinkProgress ? 'กำลังบันทึก...' : 'ยันยืนการเพิ่มเมนู'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PageEditor() {
    return (
        <Suspense fallback={<div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>}>
            <EditorContent />
        </Suspense>
    );
}
