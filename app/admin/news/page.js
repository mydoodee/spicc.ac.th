"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath, normalizeHTML } from "@/lib/utils";

export default function NewsManager() {
    const { showToast } = useToast();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Section Settings
    const [sectionSettings, setSectionSettings] = useState({
        news_title: "ข่าวสารและกิจกรรมล่าสุด",
        news_description: "ติดตามความเคลื่อนไหวและบรรยากาศในรั้ววิทยาลัย"
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchNews();
        fetchSettings();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch("/web/api/news");
            const data = await res.json();
            if (data.success) {
                setNews(data.news);
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/web/api/news/settings");
            const data = await res.json();
            if (data.success && data.settings) {
                setSectionSettings(data.settings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSectionSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch("/web/api/news/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sectionSettings)
            });
            if (res.ok) {
                showToast("บันทึกการตั้งค่าส่วนหัวเรียบร้อยแล้ว", "success");
            } else {
                showToast("ไม่สามารถบันทึกการตั้งค่าได้", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการอัปเดต: " + error.message, "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setFormData({
            title: "",
            description: "",
            date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
            category: "Activity",
            image: "",
            slug: "",
            gallery: "[]",
            is_featured: false
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
            // Auto-slug if title changes and slug is empty or was also auto-generated
            if (name === 'title' && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))) {
                updated.slug = value.toLowerCase()
                    .replace(/[^a-z0-9ก-ฮ]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            }
            return updated;
        });
    };

    const handleImageUpload = async (e) => {
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
                setFormData(prev => ({ ...prev, image: data.url }));
                showToast("อัปโหลดรูปภาพสำเร็จ", "success");
            }
        } catch (error) {
            showToast("อัปโหลดรูปภาพไม่สำเร็จ", "error");
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
            const url = "/web/api/news";
            const method = formData.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchNews();
                setIsEditing(false);
                showToast("บันทึกข้อมูลข่าวสารเรียบร้อยแล้ว", "success");
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
        if (!confirm("Are you sure you want to delete this news?")) return;

        try {
            const res = await fetch(`/web/api/news?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchNews();
                fetchSettings();
                showToast("ลบข้อมูลข่าวสารเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการลบ: " + error.message, "error");
        }
    };

    // Helper to group news by year
    const groupNewsByYear = (newsItems) => {
        return newsItems.reduce((acc, item) => {
            const yearMatch = item.date.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : "อื่นๆ";

            if (!acc[year]) acc[year] = [];
            acc[year].push(item);
            return acc;
        }, {});
    };

    const groupedNews = groupNewsByYear(news);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการข่าวสาร (News)</h1>
                    </div>
                </header>

                <main className="admin-main">
                    {!isEditing && (
                        <div className="admin-card" style={{ marginBottom: '32px', padding: '24px' }}>
                            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-icons text-[#2b4a8a]">settings</span>
                                ตั้งค่าส่วนหัวข้อข่าว (News Header)
                            </h2>
                            <form onSubmit={handleSettingsSubmit} style={{ display: 'grid', gap: '20px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>หัวข้อ (Section Title)</label>
                                    <input
                                        type="text"
                                        name="news_title"
                                        value={sectionSettings.news_title}
                                        onChange={handleSettingsChange}
                                        placeholder="เช่น ข่าวสารและกิจกรรมล่าสุด"
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>คำอธิบาย (Section Description)</label>
                                    <textarea
                                        name="news_description"
                                        value={sectionSettings.news_description}
                                        onChange={handleSettingsChange}
                                        placeholder="เช่น ติดตามความเคลื่อนไหวและบรรยากาศในรั้ววิทยาลัย"
                                        rows="2"
                                        required
                                    ></textarea>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-primary" disabled={savingSettings}>
                                        {savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าส่วนหัว'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {!isEditing ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>รายการข่าวสารทั้งหมด</h2>
                                <button onClick={handleAdd} className="btn-primary" style={{ gap: '8px' }}>
                                    <span className="material-icons">add</span>
                                    เพิ่มข่าวใหม่
                                </button>
                            </div>

                            {Object.keys(groupedNews).sort((a, b) => b - a).map(year => (
                                <div key={year} style={{ marginBottom: '40px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <h2 style={{ margin: 0, fontSize: '20px', color: '#2b4a8a' }}>พ.ศ. {year}</h2>
                                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                                    </div>

                                    <div className="admin-grid" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: '24px'
                                    }}>
                                        {groupedNews[year].map(item => (
                                            <div key={item.id} className="admin-card" style={{
                                                background: 'white',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                                    <img
                                                        src={normalizePath(item.image || 'https://via.placeholder.com/300x200?text=No+Image')}
                                                        alt={item.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    {item.is_featured && (
                                                        <div style={{
                                                            position: 'absolute', top: '10px', right: '10px',
                                                            background: '#f2cc0d', color: '#2b4a8a', padding: '4px 8px',
                                                            borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                                                        }}>
                                                            ข่าวเด่น
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute', bottom: '10px', left: '10px',
                                                        background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px',
                                                        borderRadius: '4px', fontSize: '12px'
                                                    }}>
                                                        {item.category}
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                                                        {item.date}
                                                    </div>
                                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b', fontWeight: '600', lineHeight: '1.4' }}>
                                                        {item.title}
                                                    </h3>
                                                    <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px', lineHeight: '1.5', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {item.description}
                                                    </p>

                                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            style={{
                                                                flex: 1, padding: '8px', border: '1px solid #e2e8f0',
                                                                borderRadius: '6px', background: 'white', color: '#475569',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                                                            แก้ไขข่าว
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            style={{
                                                                flex: 1, padding: '8px', border: '1px solid #fee2e2',
                                                                borderRadius: '6px', background: '#fef2f2', color: '#ef4444',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                                                            ลบ
                                                        </button>
                                                    </div>
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
                                <h2 style={{ margin: 0, color: '#f1f5f9' }}>{formData.id ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวใหม่'}</h2>
                                <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="login-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                    <div>
                                        <div style={{
                                            width: '100%', aspectRatio: '16/9', background: '#f1f5f9',
                                            borderRadius: '8px', overflow: 'hidden', marginBottom: '12px',
                                            border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {formData.image ? (
                                                <img src={normalizePath(formData.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span className="material-icons" style={{ fontSize: '48px', color: '#cbd5e1' }}>image</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />

                                        <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name="is_featured"
                                                    checked={formData.is_featured || false}
                                                    onChange={handleChange}
                                                    style={{ width: '20px', height: '20px' }}
                                                />
                                                <span style={{ fontWeight: '600', color: '#1e293b' }}>ตั้งเป็นข่าวเด่น (Featured)</span>
                                            </label>
                                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginLeft: '32px' }}>
                                                ข่าวเด่นจะแสดงในสไลด์ด้านบนสุดของหน้าข่าว
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="form-group">
                                            <label style={{ color: '#f1f5f9' }}>หัวข้อข่าว</label>
                                            <input
                                                type="text" name="title" required
                                                value={formData.title || ''} onChange={handleChange}
                                                placeholder="หัวข้อข่าว..."
                                                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ color: '#f1f5f9' }}>URL Slug (ควรใช้ภาษาอังกฤษและตัวเลข เพื่อรองรับ SEO)</label>
                                            <input
                                                type="text" name="slug" required
                                                value={formData.slug || ''} onChange={handleChange}
                                                placeholder="เช่น graduation-ceremony-2024"
                                                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ color: '#f1f5f9' }}>หมวดหมู่</label>
                                                <select name="category" value={formData.category || 'Activity'} onChange={handleChange}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                                                >
                                                    <option value="Activity">กิจกรรม (Activity)</option>
                                                    <option value="Press">ประชาสัมพันธ์ (Press)</option>
                                                    <option value="Workshop">อบรม/สัมมนา (Workshop)</option>
                                                    <option value="Sports">กีฬา (Sports)</option>
                                                    <option value="International">นานาชาติ (International)</option>
                                                    <option value="Academic">วิชาการ (Academic)</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ color: '#f1f5f9' }}>วันที่</label>
                                                <input
                                                    type="text" name="date" required
                                                    value={formData.date || ''} onChange={handleChange}
                                                    placeholder="เช่น 12 พ.ย. 2566"
                                                    style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ color: '#f1f5f9' }}>รายละเอียด</label>
                                            <textarea
                                                name="description" rows="6"
                                                value={formData.description || ''} onChange={handleChange}
                                                placeholder="เนื้อหาข่าวโดยย่อ..."
                                                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                            ></textarea>
                                        </div>

                                        <div className="form-group" style={{ marginTop: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#f1f5f9' }}>
                                                คลังรูปภาพและไฟล์แนบ (Gallery & Attachments)
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
                                                                    background: '#ef4444', color: 'white', borderRadius: 'full',
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

                                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
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
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div >
    );
}
