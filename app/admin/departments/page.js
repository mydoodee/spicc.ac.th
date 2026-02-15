"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/ToastProvider";

export default function DepartmentsAdmin() {
    const { showToast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDept, setEditDept] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Color options
    const colors = [
        { name: 'Navy', class: 'bg-navy' },
        { name: 'Yellow', class: 'bg-yellow-500' },
        { name: 'Red', class: 'bg-red-500' },
        { name: 'Blue', class: 'bg-blue-500' },
        { name: 'Green', class: 'bg-green-500' },
        { name: 'Purple', class: 'bg-purple-500' },
        { name: 'Pink', class: 'bg-pink-500' },
    ];

    // Icon options (Material Icons)
    const icons = [
        'school', 'settings_suggest', 'bolt', 'computer', 'account_balance',
        'construction', 'precision_manufacturing', 'electric_car', 'architecture',
        'psychology', 'biotech', 'design_services', 'palette', 'business', 'category'
    ];

    useEffect(() => {
        checkAuth();
        fetchDepartments();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/web/api/auth/me');
            if (!res.ok) { router.push('/admin/login'); return; }
            const data = await res.json();
            setUser(data.user);
        } catch {
            router.push('/admin/login');
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/web/api/departments');
            const data = await res.json();
            if (data.success) setDepartments(data.departments);
        } catch (error) {
            console.error("Fetch failed:", error);
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const method = editDept.id ? 'PUT' : 'POST';
        const url = editDept.id ? `/web/api/departments/${editDept.id}` : '/web/api/departments';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editDept),
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchDepartments();
                showToast(editDept.id ? "แก้ไขแผนกวิชาเรียบร้อยแล้ว" : "เพิ่มแผนกวิชาเรียบร้อยแล้ว", "success");
            } else {
                showToast(data.error || "ไม่สามารถบันทึกข้อมูลได้", "error");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนกนี้?')) return;
        try {
            const res = await fetch(`/web/api/departments/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchDepartments();
                showToast("ลบแผนกวิชาเรียบร้อยแล้ว", "success");
            }
        } catch (error) {
            showToast("เกิดข้อผิดพลาดในการลบ: " + error.message, "error");
        }
    };

    const handleLogout = async () => {
        await fetch('/web/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const openModal = (dept = null) => {
        if (dept) {
            setEditDept({ ...dept });
        } else {
            setEditDept({
                title: '',
                slug: '',
                description: '',
                icon: 'category',
                color: 'bg-navy',
                is_active: 1,
                sort_order: 0
            });
        }
        setShowModal(true);
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
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>จัดการแผนกวิชา</h1>
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
                    <div className="admin-section-header">
                        <div className="admin-section-info">
                            <h2 className="admin-section-title">
                                <span className="material-icons">category</span>
                                รายการแผนกวิชาทั้งหมด
                            </h2>
                            <p className="admin-section-desc">จัดการข้อมูลแผนกวิชาที่แสดงในหน้าแรกของเว็บไซต์</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-[#2b4a8a] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#1a365d] transition-all"
                        >
                            <span className="material-icons">add</span>
                            เพิ่มแผนกใหม่
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {departments.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-14 h-14 rounded-xl ${dept.color} flex items-center justify-center text-white shadow-lg`}>
                                        <span className="material-icons text-3xl">{dept.icon}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(dept)}
                                            className="p-2 text-slate-400 hover:text-[#2b4a8a] transition-colors"
                                        >
                                            <span className="material-icons">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-[#2b4a8a] mb-2">{dept.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{dept.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${dept.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {dept.is_active ? 'Active' : 'Draft'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order: {dept.sort_order}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-[#2b4a8a] mb-6 flex items-center gap-3">
                                <span className="material-icons bg-blue-50 p-2 rounded-xl text-[#2b4a8a]">
                                    {editDept.id ? 'edit' : 'add'}
                                </span>
                                {editDept.id ? 'แก้ไขแผนกวิชา' : 'เพิ่มแผนกวิชาใหม่'}
                            </h2>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ชื่อแผนก (ภาษาไทย)</label>
                                        <input
                                            type="text"
                                            value={editDept.title}
                                            onChange={(e) => setEditDept({ ...editDept, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#2b4a8a] outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Slug (URL)</label>
                                        <input
                                            type="text"
                                            value={editDept.slug}
                                            onChange={(e) => setEditDept({ ...editDept, slug: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#2b4a8a] outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">คำอธิบายย่อ</label>
                                    <textarea
                                        value={editDept.description}
                                        onChange={(e) => setEditDept({ ...editDept, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#2b4a8a] outline-none h-24 resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ไอคอน</label>
                                        <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-2xl">
                                            {icons.map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setEditDept({ ...editDept, icon })}
                                                    className={`p-2 rounded-xl border-2 flex items-center justify-center hover:bg-white transition-all ${editDept.icon === icon ? 'border-[#2b4a8a] bg-white ring-4 ring-blue-50' : 'border-transparent'}`}
                                                >
                                                    <span className="material-icons text-xl">{icon}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">สีธีม</label>
                                        <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-2xl">
                                            {colors.map(color => (
                                                <button
                                                    key={color.class}
                                                    type="button"
                                                    onClick={() => setEditDept({ ...editDept, color: color.class })}
                                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color.class} ${editDept.color === color.class ? 'border-[#2b4a8a] scale-110 ring-4 ring-blue-50' : 'border-transparent'}`}
                                                    title={color.name}
                                                ></button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-slate-200 rounded-full cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="is_active_toggle"
                                                checked={editDept.is_active}
                                                onChange={(e) => setEditDept({ ...editDept, is_active: e.target.checked ? 1 : 0 })}
                                                className="absolute w-6 h-6 p-0 m-0 transition duration-200 ease-in-out bg-white border-2 border-slate-200 rounded-full appearance-none cursor-pointer checked:translate-x-6 checked:border-[#2b4a8a]"
                                            />
                                        </div>
                                        <label htmlFor="is_active_toggle" className="text-sm font-bold text-slate-600">แสดงผลบนเว็บไซต์</label>
                                    </div>
                                    <div className="flex items-center gap-3 justify-end">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">ลำดับ:</label>
                                        <input
                                            type="number"
                                            value={editDept.sort_order}
                                            onChange={(e) => setEditDept({ ...editDept, sort_order: parseInt(e.target.value) })}
                                            className="w-16 px-3 py-1 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-[#2b4a8a] outline-none text-center font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-4 bg-[#2b4a8a] text-white rounded-2xl font-bold hover:bg-[#1a365d] shadow-xl shadow-[#2b4a8a]/20 disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
