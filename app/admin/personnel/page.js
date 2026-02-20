"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function PersonnelManager() {
    const { showToast } = useToast();
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Header Settings State
    const [settings, setSettings] = useState({
        personnel_title: 'คณะผู้บริหารและคณาจารย์',
        personnel_description: 'ทีมผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมถ่ายทอดความรู้และนวัตกรรมเพื่อส่งเสริมศักยภาพของผู้เรียนอย่างเต็มที่'
    });
    const [showSettings, setShowSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchPersonnel();
        fetchSettings();
    }, []);

    const fetchPersonnel = async () => {
        try {
            const res = await fetch("/web/api/personnel");
            const data = await res.json();
            if (data.success) {
                setPersonnel(data.personnel);
            }
        } catch (error) {
            console.error("Error fetching personnel:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/web/api/personnel/settings");
            const data = await res.json();
            if (data.success && data.settings) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch("/web/api/personnel/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                showToast("บันทึกการตั้งค่าส่วนหัวเรียบร้อยแล้ว", "success");
                setShowSettings(false);
            } else {
                showToast("ไม่สามารถบันทึกการตั้งค่าได้", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleEdit = (person) => {
        setFormData(person);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setFormData({
            name: "",
            role: "",
            description: "",
            department: "ทั่วไป",
            image: "",
            sort_order: personnel.length + 1,
            is_homepage: false
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({});
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = "/web/api/personnel";
            const method = formData.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchPersonnel();
                setIsEditing(false);
                showToast("บันทึกข้อมูลบุคลากรเรียบร้อยแล้ว", "success");
            } else {
                showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleHomepage = async (person) => {
        try {
            const updatedPerson = { ...person, is_homepage: !person.is_homepage };
            const res = await fetch("/web/api/personnel", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPerson)
            });
            if (res.ok) {
                fetchPersonnel();
                showToast("อัปเดตสถานะหน้าแรกเรียบร้อย", "success");
            }
        } catch (error) {
            console.error("Toggle homepage failed:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this person?")) return;

        try {
            const res = await fetch(`/web/api/personnel?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchPersonnel();
                showToast("ลบข้อมูลบุคลากรเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการลบ: " + error.message, "error");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการบุคลากร (Personnel)</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="btn-primary"
                            style={{ gap: '8px', border: showSettings ? '2px solid #f2cc0d' : 'none' }}
                        >
                            <span className="material-icons">settings</span>
                            ตั้งค่าส่วนหัว
                        </button>
                        <button onClick={handleAdd} className="btn-primary" style={{ gap: '8px' }}>
                            <span className="material-icons">add</span>
                            เพิ่มบุคลากร
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {/* Header Settings Section */}
                    {showSettings && !isEditing && (
                        <div className="editor-card" style={{ marginBottom: '32px', border: '2px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>ตั้งค่าส่วนหัวของบุคลากร</h3>
                                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSettingsSubmit}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>ชื่อส่วนหัว (Title)</label>
                                    <input
                                        type="text"
                                        name="personnel_title"
                                        value={settings.personnel_title}
                                        onChange={handleSettingsChange}
                                        placeholder="เช่น คณะผู้บริหารและคณาจารย์"
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>คำอธิบาย (Description)</label>
                                    <textarea
                                        name="personnel_description"
                                        value={settings.personnel_description}
                                        onChange={handleSettingsChange}
                                        rows="3"
                                        placeholder="รายละเอียดหรือสโลแกน..."
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

                    {/* List View */}
                    {!isEditing ? (
                        <div className="admin-list-container">
                            {Object.entries(
                                personnel.reduce((acc, person) => {
                                    const dept = person.department || 'ทั่วไป';
                                    if (!acc[dept]) acc[dept] = [];
                                    acc[dept].push(person);
                                    return acc;
                                }, {})
                            ).sort(([a], [b]) => a.localeCompare(b)).map(([dept, members]) => (
                                <div key={dept} style={{ marginBottom: '40px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '20px',
                                        padding: '8px 16px',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #2b4a8a'
                                    }}>
                                        <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>แผนก: {dept}</h2>
                                        <span style={{
                                            background: '#e2e8f0',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: '#64748b'
                                        }}>{members.length} คน</span>
                                    </div>
                                    <div className="admin-grid" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: '24px'
                                    }}>
                                        {members.sort((a, b) => a.sort_order - b.sort_order).map(person => (
                                            <div key={person.id} className="admin-card" style={{
                                                background: 'white',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                border: person.is_homepage ? '2px solid #2b4a8a' : '1px solid #e2e8f0'
                                            }}>
                                                <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
                                                    <img
                                                        src={normalizePath(person.image || 'https://via.placeholder.com/300x200?text=No+Image')}
                                                        alt={person.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                                                    />
                                                    <div style={{
                                                        position: 'absolute', top: '10px', right: '10px',
                                                        background: 'rgba(255,255,255,0.9)', padding: '4px 8px',
                                                        borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                                        color: '#1e293b'
                                                    }}>
                                                        #{person.sort_order}
                                                    </div>
                                                    {person.is_homepage ? (
                                                        <button
                                                            onClick={() => toggleHomepage(person)}
                                                            style={{
                                                                position: 'absolute', top: '10px', left: '10px',
                                                                background: '#2b4a8a', color: 'white', padding: '4px 8px',
                                                                borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                                                                display: 'flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer'
                                                            }}
                                                            title="คลิกเพื่อนำออกจากหน้าแรก"
                                                        >
                                                            <span className="material-icons" style={{ fontSize: '12px' }}>home</span>
                                                            หน้าแรก (แสดงอยู่)
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => toggleHomepage(person)}
                                                            style={{
                                                                position: 'absolute', top: '10px', left: '10px',
                                                                background: 'rgba(255,255,255,0.8)', color: '#64748b', padding: '4px 8px',
                                                                borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                                                                display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #e2e8f0', cursor: 'pointer'
                                                            }}
                                                            title="คลิกเพื่อแสดงในหน้าแรก"
                                                        >
                                                            <span className="material-icons" style={{ fontSize: '12px' }}>add_circle</span>
                                                            เพิ่มลงหน้าแรก
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b' }}>{person.name}</h3>
                                                    <p style={{ margin: '0 0 8px 0', color: '#f2cc0d', fontSize: '14px', fontWeight: '600' }}>{person.role}</p>
                                                    <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px', lineHeight: '1.5', flex: 1, height: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                        {person.description}
                                                    </p>

                                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                                        <button
                                                            onClick={() => handleEdit(person)}
                                                            className="btn-secondary"
                                                            style={{
                                                                flex: 1, padding: '8px', border: '1px solid #e2e8f0',
                                                                borderRadius: '6px', background: 'white', color: '#475569',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '14px'
                                                            }}
                                                        >
                                                            <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                                                            แก้ไข
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(person.id)}
                                                            style={{
                                                                flex: 1, padding: '8px', border: '1px solid #fee2e2',
                                                                borderRadius: '6px', background: '#fef2f2', color: '#ef4444',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '14px'
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
                        </div>
                    ) : (
                        // Edit Form
                        <div className="editor-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0 }}>{formData.id ? 'แก้ไขข้อมูล' : 'เพิ่มบุคลากรใหม่'}</h2>
                                <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="login-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                    <div>
                                        <div style={{
                                            width: '100%', aspectRatio: '3/4', background: '#f1f5f9',
                                            borderRadius: '8px', overflow: 'hidden', marginBottom: '12px',
                                            border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {formData.image ? (
                                                <img src={normalizePath(formData.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span className="material-icons" style={{ fontSize: '48px', color: '#cbd5e1' }}>person</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="form-group">
                                            <label>ชื่อ-นามสกุล</label>
                                            <input
                                                type="text" name="name" required
                                                value={formData.name || ''} onChange={handleChange}
                                                placeholder="เช่น ดร. สมชาย มุ่งมั่น"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>ตำแหน่ง</label>
                                            <input
                                                type="text" name="role" required
                                                value={formData.role || ''} onChange={handleChange}
                                                placeholder="เช่น คณบดีคณะบริหารธุรกิจ"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>คำอธิบาย</label>
                                            <textarea
                                                name="description" rows="4"
                                                value={formData.description || ''} onChange={handleChange}
                                                placeholder="รายละเอียดความเชี่ยวชาญ..."
                                            ></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>แผนก/กลุ่ม</label>
                                            <input
                                                type="text" name="department" required
                                                value={formData.department || ''} onChange={handleChange}
                                                placeholder="เช่น คณะกรรมการบริหาร"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>ลำดับการแสดงผล</label>
                                            <input
                                                type="number" name="sort_order"
                                                value={formData.sort_order || 0} onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox" name="is_homepage" id="is_homepage"
                                                checked={formData.is_homepage || false} onChange={handleChange}
                                                style={{ width: 'auto', margin: 0 }}
                                            />
                                            <label htmlFor="is_homepage" style={{ marginBottom: 0, cursor: 'pointer' }}>แสดงในหน้าแรก (Homepage)</label>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <button type="button" onClick={handleCancel} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                                                ยกเลิก
                                            </button>
                                            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
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
        </div>
    );
}
