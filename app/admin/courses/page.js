"use client";
import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";
import { normalizePath } from "@/lib/utils";

export default function AdminCourses() {
    const { showToast } = useToast();
    const [courses, setCourses] = useState([]);
    const [settings, setSettings] = useState({ courses_title: "", courses_description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        icon: "school",
        color: "bg-[#2b4a8a]",
        text_color: "text-white",
        is_special: false,
        sort_order: 0,
        is_active: true,
        show_on_home: false
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, settingsRes] = await Promise.all([
                fetch("/web/api/courses"),
                fetch("/web/api/courses/settings")
            ]);

            const coursesData = await coursesRes.json();
            const settingsData = await settingsRes.json();

            if (coursesData.success) setCourses(coursesData.courses);
            if (settingsData.success) setSettings(settingsData.settings);

            setLoading(false);
        } catch (error) {
            console.error("Fetch failed:", error);
            setLoading(false);
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/web/api/courses/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) showToast("บันทึกการตั้งค่าส่วนหัวเรียบร้อยแล้ว", "success");
        } catch (error) {
            showToast("ไม่สามารถบันทึกการตั้งค่าได้", "error");
        }
    };

    const handleMediaUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/web/api/upload", {
                method: "POST",
                body: formDataUpload,
            });
            const data = await res.json();

            if (data.success) {
                let insertion = "";
                if (type === 'image') {
                    insertion = `<img src="${data.url}" alt="${file.name}" class="my-6 rounded-xl shadow-lg max-w-full" />\n`;
                } else if (type === 'pdf') {
                    insertion = `<a href="${data.url}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all my-4"><span class="material-icons">picture_as_pdf</span> ดาวน์โหลดเอกสาร (PDF) - ${file.name}</a>\n`;
                }

                setFormData(prev => ({
                    ...prev,
                    description: (prev.description || "") + insertion
                }));
                showToast("อัปโหลดสื่อสำเร็จ", "success");
            } else {
                showToast("อัปโหลดไม่สำเร็จ: " + data.message, "error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            showToast("เกิดข้อผิดพลาดในการอัปโหลด", "error");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleImageUpload = (e) => {
        // ... existing code ...
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
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

    const handleEdit = (course) => {
        setFormData({
            ...course,
            image: course.image || "",
            is_special: !!course.is_special,
            show_on_home: !!course.show_on_home,
            is_active: course.is_active !== false
        });
        setIsEditing(true);
    };

    const handleAdd = () => {
        setFormData({
            title: "",
            slug: "",
            description: "",
            image: "",
            icon: "school",
            color: "bg-[#2b4a8a]",
            text_color: "text-white",
            is_special: false,
            sort_order: courses.length + 1,
            is_active: true,
            show_on_home: false
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = formData.id ? "PUT" : "POST";
        try {
            const res = await fetch("/web/api/courses", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsEditing(false);
                fetchData();
                showToast("บันทึกข้อมูลหลักสูตรเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการบันทึกหลักสูตร", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/web/api/courses?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
                showToast("ลบหลักสูตรเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการลบ", "error");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="text-2xl font-bold text-slate-800">จัดการหลักสูตร (Courses)</h1>
                    </div>
                    {!isEditing && (
                        <button onClick={handleAdd} className="btn-primary" style={{ gap: '8px', padding: '10px 20px' }}>
                            <span className="material-icons">add</span> เพิ่มหลักสูตรใหม่
                        </button>
                    )}
                </header>

                <main className="admin-main">
                    {/* Section Settings */}
                    {!isEditing && (
                        <div className="editor-card" style={{ marginBottom: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <span className="material-icons text-primary">settings</span>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">ตั้งค่าส่วนหัวข้อหลักสูตร</h2>
                            </div>
                            <form onSubmit={handleSettingsSubmit} className="space-y-4">
                                <div className="form-group">
                                    <label className="text-sm font-semibold text-slate-700 mb-1 block">หัวข้อหลัก (Title)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={settings.courses_title || ""}
                                        onChange={(e) => setSettings({ ...settings, courses_title: e.target.value })}
                                        placeholder="เช่น หลักสูตรที่เปิดสอน"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="text-sm font-semibold text-slate-700 mb-1 block">คำอธิบาย (Description)</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={settings.courses_description || ""}
                                        onChange={(e) => setSettings({ ...settings, courses_description: e.target.value })}
                                        placeholder="คำอธิบายสั้นๆ ใต้หัวข้อ"
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="btn-primary px-8">
                                        บันทึกการตั้งค่าส่วนหัว
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="editor-card" style={{ maxWidth: '900px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}>
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {formData.id ? 'แก้ไขข้อมูลหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}
                                </h2>
                                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-12 gap-8">
                                    {/* Image Upload Column */}
                                    <div className="md:col-span-4 space-y-4">
                                        <div className="form-group">
                                            <label className="text-sm font-bold text-slate-700 mb-2 block">รูปภาพประกอบ (Large Feature Image)</label>
                                            <div style={{
                                                width: '100%', aspectRatio: '16/9', background: '#f8fafc',
                                                borderRadius: '12px', overflow: 'hidden',
                                                border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', position: 'relative'
                                            }} onClick={() => document.getElementById('image-upload').click()}>
                                                {formData.image ? (
                                                    <img src={normalizePath(formData.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <span className="material-icons text-4xl text-slate-300 mb-2">image</span>
                                                        <p className="text-xs text-slate-400">คลิกเพื่ออัปโหลดรูปภาพหลักสูตร</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors"></div>
                                            </div>
                                            <input
                                                id="image-upload" type="file" accept="image/*"
                                                onChange={handleImageUpload} className="hidden"
                                            />
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                <span className="font-bold text-primary block mb-1">คำแนะนำ:</span>
                                                ใช้รูปสัดส่วน 16:9 และมีขนาดไฟล์ไม่เกิน 2MB เพื่อการแสดงผลที่สวยงามในหน้าหลักและหน้าหลักสูตร
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="md:col-span-8 space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="form-group">
                                                <label className="text-sm font-bold text-slate-700 mb-1 block">ชื่อหลักสูตร</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" name="title" required value={formData.title} onChange={handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label className="text-sm font-bold text-slate-700 mb-1 block">ชื่อไอคอน (Google Icon)</label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" name="icon" value={formData.icon} onChange={handleChange} placeholder="เช่น school, business" />
                                                    </div>
                                                    <div className="w-12 h-11 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                                        <span className="material-icons">{formData.icon}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="flex justify-between items-end mb-1">
                                                <label className="text-sm font-bold text-slate-700 block">รายละเอียด (เนื้อหาหลัก)</label>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">แทรกสื่อ:</span>
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                                                        onClick={() => document.getElementById('media-image-upload').click()}
                                                        disabled={uploading}
                                                    >
                                                        <span className="material-icons text-sm">image</span> {uploading ? 'กำลังโหลด...' : 'รูปภาพ'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                                        onClick={() => document.getElementById('media-pdf-upload').click()}
                                                        disabled={uploading}
                                                    >
                                                        <span className="material-icons text-sm">picture_as_pdf</span> {uploading ? 'กำลังโหลด...' : 'PDF'}
                                                    </button>
                                                    <input id="media-image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} />
                                                    <input id="media-pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={(e) => handleMediaUpload(e, 'pdf')} />
                                                </div>
                                            </div>
                                            <textarea className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm leading-relaxed" name="description" rows={8} value={formData.description} onChange={handleChange} placeholder="ใส่รายละเอียดหลักสูตร จุดเด่น และสิ่งที่จะได้รับ... (รองรับ HTML สำหรับการแทรกรูป/ไฟล์)" />
                                            <p className="text-[10px] text-slate-400 mt-1 italic">* รองรับการแทรกโค้ด HTML หรือใช้ปุ่มด้านบนเพื่ออัปโหลดสื่อ</p>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="form-group">
                                                <label className="text-sm font-bold text-slate-700 mb-1 block">สีการ์ด (Tailwind)</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-xs" name="color" value={formData.color} onChange={handleChange} placeholder="bg-[#2b4a8a]" />
                                            </div>
                                            <div className="form-group">
                                                <label className="text-sm font-bold text-slate-700 mb-1 block">สีตัวอักษร (Tailwind)</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-xs" name="text_color" value={formData.text_color} onChange={handleChange} placeholder="text-white" />
                                            </div>
                                            <div className="form-group">
                                                <label className="text-sm font-bold text-slate-700 mb-1 block">ลำดับ</label>
                                                <input type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" name="sort_order" value={formData.sort_order} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="is_special" name="is_special" checked={formData.is_special} onChange={handleChange} className="w-5 h-5 accent-primary cursor-pointer" />
                                                <label htmlFor="is_special" className="text-sm font-bold text-navy cursor-pointer">หลักสูตรแนะนำ (Special Highlight / Featured Course)</label>
                                            </div>
                                            <div className="flex items-center gap-2 border-t border-primary/10 pt-3">
                                                <input type="checkbox" id="show_on_home" name="show_on_home" checked={formData.show_on_home} onChange={handleChange} className="w-5 h-5 accent-[#f2cc0d] cursor-pointer" />
                                                <label htmlFor="show_on_home" className="text-sm font-bold text-navy cursor-pointer">แสดงในหน้าแรก (เลือกได้สูงสุด 3 วิชา)</label>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                                            <button type="submit" className="btn-primary flex-1 py-3 text-base shadow-lg shadow-primary/20">
                                                <span className="material-icons text-xl">save</span> {formData.id ? 'บันทึกการแก้ไข' : 'เพิ่มหลักสูตร'}
                                            </button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary px-10 border-slate-200">
                                                ยกเลิก
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="admin-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '24px'
                        }}>
                            {courses.map((course) => (
                                <div key={course.id} className="admin-card group" style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                                        {course.image ? (
                                            <img src={normalizePath(course.image)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                <span className="material-icons text-5xl mb-2">image</span>
                                                <span className="text-xs">ไม่มีรูปภาพประกอบ</span>
                                            </div>
                                        )}
                                        <div className={`absolute top-0 right-0 p-3 ${course.color} ${course.text_color} rounded-bl-2xl shadow-lg`}>
                                            <span className="material-icons">{course.icon}</span>
                                        </div>
                                        {course.is_special ? (
                                            <div className="absolute top-3 left-3 bg-yellow-400 text-navy px-2 py-1 rounded text-[10px] font-black tracking-tighter shadow-md">
                                                FEATURED
                                            </div>
                                        ) : null}
                                        {course.show_on_home ? (
                                            <div className="absolute top-3 right-12 bg-navy text-white px-2 py-1 rounded text-[10px] font-black tracking-tighter shadow-md flex items-center gap-1">
                                                <span className="material-icons text-[10px]">home</span> HOME
                                            </div>
                                        ) : null}
                                        {/* Overlay buttons to ensure visibility */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(course); }}
                                                className="w-12 h-12 bg-white text-navy rounded-full flex items-center justify-center shadow-2xl hover:bg-primary transition-all hover:scale-110"
                                                title="แก้ไข"
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                                                className="w-12 h-12 bg-white text-red-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-red-500 hover:text-white transition-all hover:scale-110"
                                                title="ลบ"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col border-t-4" style={{ borderColor: course.is_special ? '#f2cc0d' : 'transparent' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight flex-1">{course.title}</h3>
                                            <span className="text-xs font-bold text-slate-300 ml-2">#{course.sort_order}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-1">
                                            {course.description}
                                        </p>
                                        <div className="flex gap-2 pt-4 border-t border-slate-50">
                                            <button onClick={() => handleEdit(course)} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-primary hover:text-navy transition-all font-bold text-sm">
                                                <span className="material-icons text-sm">edit</span> แก้ไขข้อมูล
                                            </button>
                                            <button onClick={() => handleDelete(course.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                <span className="material-icons text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
