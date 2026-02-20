"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function HomeSliderManager() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        is_enabled: true,
        transition_style: "carousel",
        autoplay_speed: 5000,
        show_arrows: true,
        show_pagination: true
    });
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        image_url: "",
        title: "",
        subtitle: "",
        link_url: "",
        link_target: "_self",
        order_index: 0
    });

    useEffect(() => {
        fetchSliderData();
    }, []);

    const fetchSliderData = async () => {
        try {
            const res = await fetch("/web/api/home-slider");
            const data = await res.json();
            if (data.success) {
                setSettings({
                    ...data.settings,
                    is_enabled: data.settings.is_enabled === 1,
                    show_arrows: data.settings.show_arrows === 1,
                    show_pagination: data.settings.show_pagination === 1
                });
                setItems(data.items);
            }
        } catch (error) {
            console.error("Error fetching slider data:", error);
            showToast("โหลดข้อมูลล้มเหลว", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [name]: value };
        setItems(newItems);
    };

    const handleImageUpload = async (e, index = null) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setSaving(true);
            const res = await fetch("/web/api/upload", {
                method: "POST",
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                if (index === null) {
                    setNewItem(prev => ({ ...prev, image_url: data.url }));
                } else {
                    const newItems = [...items];
                    newItems[index] = { ...newItems[index], image_url: data.url };
                    setItems(newItems);
                }
                showToast("อัปโหลดรูปภาพสำเร็จ", "success");
            }
        } catch (error) {
            showToast("อัปโหลดไม่สำเร็จ: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const addItem = async () => {
        if (!newItem.image_url) {
            showToast("กรุณาเลือกรูปภาพ", "warning");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch("/web/api/home-slider", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newItem, order_index: items.length })
            });
            const data = await res.json();
            if (data.success) {
                showToast("เพิ่มสไลด์สำเร็จ", "success");
                setNewItem({
                    image_url: "",
                    title: "",
                    subtitle: "",
                    link_url: "",
                    link_target: "_self",
                    order_index: 0
                });
                fetchSliderData();
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const deleteItem = async (id) => {
        if (!confirm("ต้องการลบสไลด์นี้ใช่หรือไม่?")) return;

        try {
            setSaving(true);
            const res = await fetch(`/web/api/home-slider?id=${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                showToast("ลบสไลด์สำเร็จ", "success");
                fetchSliderData();
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const saveAll = async () => {
        try {
            setSaving(true);
            const res = await fetch("/web/api/home-slider", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings, items })
            });
            const data = await res.json();
            if (data.success) {
                showToast("บันทึกข้อมูลทั้งหมดสำเร็จ", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <div className="admin-loading">
                        <div className="admin-loading-spinner"></div>
                        <span>กำลังโหลดข้อมูล...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการสไลด์หน้าแรก (Home Slider)</h1>
                    </div>
                    <div className="admin-header-right">
                        <button className="btn-primary" onClick={saveAll} disabled={saving}>
                            {saving ? <div className="login-spinner"></div> : <span className="material-icons">save</span>}
                            บันทึกทั้งหมด
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    <div className="editor-grid">
                        <div className="editor-main-col">
                            {/* Existing Items */}
                            <div className="editor-card">
                                <h4>รูปภาพสไลด์ปัจจุบัน</h4>
                                <div className="slider-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                                    {items.length === 0 ? (
                                        <p style={{ opacity: 0.5, textAlign: 'center', padding: '20px' }}>ยังไม่มีรูปภาพในสไลด์</p>
                                    ) : (
                                        items.map((item, index) => (
                                            <div key={item.id} className="slider-item-card" style={{
                                                display: 'flex', gap: '20px', padding: '20px',
                                                background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ width: '200px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img src={normalizePath(item.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label>หัวข้อ</label>
                                                        <input type="text" name="title" value={item.title || ""} onChange={(e) => handleItemChange(index, e)} placeholder="หัวข้อ (ไม่บังคับ)" />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label>คำบรรยาย</label>
                                                        <input type="text" name="subtitle" value={item.subtitle || ""} onChange={(e) => handleItemChange(index, e)} placeholder="คำบรรยาย (ไม่บังคับ)" />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label>ลิงก์ URL</label>
                                                        <input type="text" name="link_url" value={item.link_url || ""} onChange={(e) => handleItemChange(index, e)} placeholder="เช่น /news/1" />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label>ลำดับ</label>
                                                            <input type="number" name="order_index" value={item.order_index} onChange={(e) => handleItemChange(index, e)} />
                                                        </div>
                                                        <button className="btn-danger" onClick={() => deleteItem(item.id)} style={{ height: '42px', padding: '0 12px' }}>
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Add New Item */}
                            <div className="editor-card" style={{ marginTop: '20px' }}>
                                <h4>เพิ่มรูปภาพใหม่</h4>
                                <div className="add-item-form" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px', marginTop: '16px' }}>
                                    <div>
                                        <div style={{
                                            width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', border: '2px dashed rgba(255,255,255,0.1)'
                                        }}>
                                            {newItem.image_url ? (
                                                <img src={normalizePath(newItem.image_url)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span className="material-icons" style={{ fontSize: '48px', opacity: 0.1 }}>add_photo_alternate</span>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} style={{ marginTop: '10px', fontSize: '12px' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div className="form-group">
                                            <label>หัวข้อ</label>
                                            <input type="text" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} placeholder="หัวข้อ" />
                                        </div>
                                        <div className="form-group">
                                            <label>คำบรรยาย</label>
                                            <input type="text" value={newItem.subtitle} onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })} placeholder="คำบรรยาย" />
                                        </div>
                                        <div className="form-group">
                                            <label>ลิงก์ URL</label>
                                            <input type="text" value={newItem.link_url} onChange={(e) => setNewItem({ ...newItem, link_url: e.target.value })} placeholder="URL ลิงก์" />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button className="btn-primary" onClick={addItem} disabled={saving} style={{ width: '100%' }}>
                                                <span className="material-icons">add</span> เพิ่มลงในสไลด์
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="editor-side-col">
                            <div className="editor-card">
                                <h4>การตั้งค่าสไลด์</h4>
                                <div className="login-form">
                                    <div className="form-group">
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" name="is_enabled" checked={settings.is_enabled} onChange={handleSettingsChange} />
                                            แสดงสไลด์ในหน้าแรก
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label>รูปแบบการเปลี่ยนภาพ (Transition)</label>
                                        <select name="transition_style" value={settings.transition_style} onChange={handleSettingsChange} className="admin-select">
                                            <option value="carousel">คาร์รูเซล (Carousel)</option>
                                            <option value="fade">จางหาย (Fade)</option>
                                            <option value="zoom">ขยายเข้า (Zoom In)</option>
                                            <option value="slide_up">เลื่อนขึ้น (Slide Up)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>ความเร็วการเปลี่ยน (ms)</label>
                                        <input type="number" name="autoplay_speed" value={settings.autoplay_speed} onChange={handleSettingsChange} step="500" />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" name="show_arrows" checked={settings.show_arrows} onChange={handleSettingsChange} />
                                            แสดงลูกศรเลื่อนซ้าย-ขวา
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" name="show_pagination" checked={settings.show_pagination} onChange={handleSettingsChange} />
                                            แสดงจุดบอกตำแหน่งสไลด์
                                        </label>
                                    </div>

                                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(242, 204, 13, 0.05)', borderRadius: '8px', border: '1px solid rgba(242, 204, 13, 0.2)' }}>
                                        <p style={{ fontSize: '13px', color: '#f2cc0d', marginBottom: '5px' }}>
                                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '5px' }}>info</span>
                                            คำแนะนำ
                                        </p>
                                        <p style={{ fontSize: '12px', opacity: 0.7 }}>
                                            แนะนำให้ใช้รูปภาพขนาดเดียวกันทั้งหมด (เช่น 1920x800 หรือ 16:9) เพื่อความสวยงาม
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
