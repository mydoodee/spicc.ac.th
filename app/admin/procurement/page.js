"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function ProcurementManager() {
    const { showToast } = useToast();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch("/web/api/procurement/admin");
            const data = await res.json();
            if (data.success) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            ...item,
            announcement_date: item.announcement_date ? new Date(item.announcement_date).toISOString().split('T')[0] : ''
        });
        setIsEditing(true);
    };

    const handleAdd = () => {
        const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
        setFormData({
            title: "",
            description: "",
            announcement_date: new Date().toISOString().split('T')[0],
            year: currentYear,
            file_url: "",
            external_url: "",
            gallery: "[]",
            is_active: true,
            is_urgent: false
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({});
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setFormData((prev) => {
            const updated = { ...prev, [name]: newValue };

            // Auto-update year when announcement_date changes
            if (name === 'announcement_date' && value) {
                const date = new Date(value);
                const buddhistYear = date.getFullYear() + 543;
                updated.year = buddhistYear;
            }

            return updated;
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/web/api/upload", {
                method: "POST",
                body: uploadData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, file_url: data.url }));
                showToast("อัปโหลดไฟล์สำเร็จ", "success");
            }
        } catch (error) {
            showToast("อัปโหลดไฟล์ไม่สำเร็จ", "error");
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            const uploadData = new FormData();
            uploadData.append("file", file);

            try {
                const res = await fetch("/web/api/upload", {
                    method: "POST",
                    body: uploadData
                });
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => {
                        const currentGallery = JSON.parse(prev.gallery || "[]");
                        const newItem = {
                            id: Date.now() + Math.random().toString(36).substr(2, 9),
                            url: data.url,
                            name: file.name,
                            type: file.type.includes('image') ? 'image' : 'file'
                        };
                        return { ...prev, gallery: JSON.stringify([...currentGallery, newItem]) };
                    });
                }
            } catch (error) {
                console.error("Upload failed for file:", file.name);
            }
        }
        showToast("อัปโหลดไฟล์เรียบร้อยแล้ว", "success");
    };

    const removeGalleryItem = (itemId) => {
        setFormData(prev => {
            const currentGallery = JSON.parse(prev.gallery || "[]");
            const updatedGallery = currentGallery.filter(item => item.id !== itemId);
            return { ...prev, gallery: JSON.stringify(updatedGallery) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = "/web/api/procurement/admin";
            const method = formData.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchAnnouncements();
                setIsEditing(false);
                showToast("บันทึกข้อมูลประกาศเรียบร้อยแล้ว", "success");
            } else {
                showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการบันทึก: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) return;

        try {
            const res = await fetch(`/web/api/procurement/admin?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchAnnouncements();
                showToast("ลบข้อมูลประกาศเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการลบ: " + error.message, "error");
        }
    };

    const toggleActive = async (item) => {
        try {
            const res = await fetch("/web/api/procurement/admin", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...item, is_active: !item.is_active })
            });
            if (res.ok) {
                fetchAnnouncements();
                showToast("อัปเดตสถานะเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการอัปเดต", "error");
        }
    };

    // Group announcements by year
    const groupByYear = (items) => {
        return items.reduce((acc, item) => {
            const year = item.year || "อื่นๆ";
            if (!acc[year]) acc[year] = [];
            acc[year].push(item);
            return acc;
        }, {});
    };

    const groupedAnnouncements = groupByYear(announcements);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการประกาศจัดซื้อจัดจ้าง</h1>
                    </div>
                </header>

                <main className="admin-main">
                    {!isEditing ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>รายการประกาศทั้งหมด</h2>
                                <button onClick={handleAdd} className="btn-primary" style={{ gap: '8px' }}>
                                    <span className="material-icons">add</span>
                                    เพิ่มประกาศใหม่
                                </button>
                            </div>

                            {Object.keys(groupedAnnouncements).sort((a, b) => b - a).map(year => (
                                <div key={year} style={{ marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <h2 style={{ margin: 0, fontSize: '18px', color: '#2b4a8a', fontWeight: 'bold' }}>ปี {year}</h2>
                                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #2b4a8a, transparent)' }}></div>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>{groupedAnnouncements[year].length} รายการ</span>
                                    </div>

                                    <div style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        {groupedAnnouncements[year].map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr auto auto auto',
                                                    gap: '16px',
                                                    padding: '12px 16px',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'all 0.2s',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {/* Title and Info */}
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {!!item.is_urgent && (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                padding: '2px 8px',
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                <span className="material-icons" style={{ fontSize: '12px' }}>priority_high</span>
                                                                เร่งด่วน
                                                            </span>
                                                        )}
                                                        <span className="material-icons" style={{
                                                            fontSize: '18px',
                                                            color: '#64748b'
                                                        }}>description</span>
                                                        <h3 style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: '#1e293b',
                                                            margin: 0,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>{item.title}</h3>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <span className="material-icons" style={{ fontSize: '14px' }}>calendar_today</span>
                                                        {new Date(item.announcement_date).toLocaleDateString('th-TH', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    background: item.is_active ? '#d1fae5' : '#f3f4f6',
                                                    color: item.is_active ? '#065f46' : '#6b7280',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </div>

                                                {/* File Indicators */}
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    {item.file_url && (
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            background: '#fee2e2',
                                                            color: '#dc2626',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <span className="material-icons" style={{ fontSize: '12px' }}>picture_as_pdf</span>
                                                            PDF
                                                        </div>
                                                    )}
                                                    {item.external_url && (
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            background: '#dbeafe',
                                                            color: '#1e40af',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <span className="material-icons" style={{ fontSize: '12px' }}>link</span>
                                                        </div>
                                                    )}
                                                    {JSON.parse(item.gallery || '[]').length > 0 && (
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            background: '#e0e7ff',
                                                            color: '#4338ca',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <span className="material-icons" style={{ fontSize: '12px' }}>collections</span>
                                                            {JSON.parse(item.gallery || '[]').length}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleActive(item);
                                                        }}
                                                        style={{
                                                            padding: '6px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '6px',
                                                            background: 'white',
                                                            color: '#475569',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title={item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                                                    >
                                                        <span className="material-icons" style={{ fontSize: '16px' }}>
                                                            {item.is_active ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(item);
                                                        }}
                                                        style={{
                                                            padding: '6px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '6px',
                                                            background: 'white',
                                                            color: '#475569',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="แก้ไข"
                                                    >
                                                        <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.id);
                                                        }}
                                                        style={{
                                                            padding: '6px',
                                                            border: '1px solid #fee2e2',
                                                            borderRadius: '6px',
                                                            background: '#fef2f2',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="ลบ"
                                                    >
                                                        <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="editor-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, color: '#f1f5f9' }}>{formData.id ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}</h2>
                                <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-group">
                                    <label style={{ color: '#f1f5f9' }}>หัวข้อประกาศ *</label>
                                    <input
                                        type="text" name="title" required
                                        value={formData.title || ''} onChange={handleChange}
                                        placeholder="หัวข้อประกาศจัดซื้อจัดจ้าง..."
                                        style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ color: '#f1f5f9' }}>รายละเอียด</label>
                                    <textarea
                                        name="description" rows="4"
                                        value={formData.description || ''} onChange={handleChange}
                                        placeholder="รายละเอียดเพิ่มเติม..."
                                        style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                    ></textarea>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label style={{ color: '#f1f5f9' }}>วันที่ประกาศ *</label>
                                        <input
                                            type="date" name="announcement_date" required
                                            value={formData.announcement_date || ''} onChange={handleChange}
                                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: '#f1f5f9' }}>ปี พ.ศ. *</label>
                                        <input
                                            type="number" name="year" required
                                            value={formData.year || ''} onChange={handleChange}
                                            placeholder="เช่น 2568"
                                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ color: '#f1f5f9' }}>ไฟล์ PDF (ถ้ามี)</label>
                                    <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ width: '100%' }} />
                                    {formData.file_url && (
                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                                            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
                                            <span style={{ fontSize: '13px' }}>ไฟล์ถูกอัปโหลดแล้ว</span>
                                            <a href={normalizePath(formData.file_url)} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '13px' }}>
                                                ดูไฟล์
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label style={{ color: '#f1f5f9' }}>ลิงก์ภายนอก (ถ้ามี)</label>
                                    <input
                                        type="url" name="external_url"
                                        value={formData.external_url || ''} onChange={handleChange}
                                        placeholder="https://example.com"
                                        style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#f1f5f9' }}>
                                        คลังรูปภาพและไฟล์แนบเพิ่มเติม (Gallery)
                                    </label>
                                    <div style={{
                                        padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid #334155'
                                    }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label className="btn-secondary" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                cursor: 'pointer', background: '#334155', color: 'white',
                                                padding: '8px 16px', borderRadius: '8px', fontSize: '14px'
                                            }}>
                                                <span className="material-icons">cloud_upload</span>
                                                เลือกรูปภาพ/PDF เพิ่มเติม
                                                <input
                                                    type="file" multiple
                                                    accept="image/*,.pdf"
                                                    onChange={handleGalleryUpload}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                                สามารถอัปโหลดรูปภาพและ PDF ได้หลายไฟล์พร้อมกัน
                                            </p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                                            {JSON.parse(formData.gallery || "[]").map((item) => (
                                                <div key={item.id} style={{ position: 'relative', group: 'true' }}>
                                                    {item.type === 'image' ? (
                                                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                                            <img src={normalizePath(item.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            width: '100%', aspectRatio: '1/1', borderRadius: '8px', background: '#f1f5f9',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                            border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center'
                                                        }}>
                                                            <span className="material-icons" style={{ color: '#ef4444' }}>picture_as_pdf</span>
                                                            <span style={{ fontSize: '10px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
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
                                </div>

                                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active || false}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span style={{ fontWeight: '600', color: '#1e293b' }}>เปิดใช้งาน (แสดงในหน้าเว็บ)</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            name="is_urgent"
                                            checked={formData.is_urgent || false}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>เร่งด่วน</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>(แสดงไอคอนเร่งด่วนในหน้าเว็บ)</span>
                                        </div>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn-secondary"
                                        style={{
                                            flex: 1, justifyContent: 'center', background: '#334155',
                                            color: 'white', border: 'none', height: '48px', borderRadius: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={saving}
                                        style={{
                                            flex: 1, justifyContent: 'center', background: '#f2cc0d',
                                            color: '#1e293b', border: 'none', height: '48px', borderRadius: '12px',
                                            fontWeight: 'bold', boxShadow: '0 4px 12px rgba(242, 204, 13, 0.2)'
                                        }}
                                    >
                                        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                    }
                </main >
            </div >
        </div >
    );
}
