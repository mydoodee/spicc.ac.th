'use client';
import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';
import AdminSidebar from '../components/AdminSidebar';

export default function FooterAdmin() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('settings');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        description: '',
        facebook_url: '',
        website_url: '',
        address: '',
        phone: '',
        email: '',
        copyright: '',
        show_wave: true,
        wave_color: '#f8f8f5',
        privacy_policy_url: '',
        terms_of_use_url: '',
        privacy_policy_content: '',
        terms_of_use_content: ''
    });
    const [links, setLinks] = useState([]);
    const [editingLink, setEditingLink] = useState(null);
    const [newLink, setNewLink] = useState({ section: 'quick', title: '', url: '', sort_order: 0 });

    useEffect(() => {
        fetchFooter();
    }, []);

    const fetchFooter = async () => {
        setLoading(true);
        try {
            const res = await fetch('/web/api/footer');
            const data = await res.json();
            if (data.success) {
                if (data.settings) {
                    // Ensure no null values are passed to controlled components
                    const safeSettings = { ...data.settings };
                    Object.keys(safeSettings).forEach(key => {
                        if (safeSettings[key] === null) safeSettings[key] = '';
                    });
                    setSettings(safeSettings);
                }
                setLinks(data.links || []);
            }
        } catch (error) {
            showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/web/api/footer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    };

    const handleAddLink = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/web/api/footer/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLink)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                setNewLink({ section: 'quick', title: '', url: '', sort_order: 0 });
                fetchFooter();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการเพิ่มลิงก์', 'error');
        }
    };

    const handleUpdateLink = async (link) => {
        try {
            const res = await fetch('/web/api/footer/links', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(link)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                setEditingLink(null);
                fetchFooter();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการอัปเดต', 'error');
        }
    };

    const handleDeleteLink = async (id) => {
        if (!confirm('ยืนยันการลบลิงก์นี้?')) return;
        try {
            const res = await fetch(`/web/api/footer/links?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                fetchFooter();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการลบ', 'error');
        }
    };

    if (loading) return <div className="admin-loading"><div className="admin-loading-spinner"></div><p>กำลังโหลด...</p></div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="text-xl font-bold text-white">จัดการส่วนท้าย (Footer)</h1>
                        <p className="text-sm text-white/50">ปรับแต่งข้อมูลการติดต่อ ลิงก์ และคำอธิบายส่วนท้ายของเว็บไซต์</p>
                    </div>
                </header>

                <main className="admin-main space-y-8">
                    <div className="tabs-container flex gap-4 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-[#f2cc0d] text-[#2b4a8a]' : 'text-white/60 hover:text-white'}`}
                        >
                            ตั้งค่าทั่วไป
                        </button>
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'links' ? 'bg-[#f2cc0d] text-[#2b4a8a]' : 'text-white/60 hover:text-white'}`}
                        >
                            จัดการลิงก์
                        </button>
                    </div>

                    {activeTab === 'settings' ? (
                        <section className="space-y-8">
                            {/* Branding Reference */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
                                        <span className="material-icons text-3xl text-[#f2cc0d]">school</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">หัวเรื่องและโลโก้ (Branding)</h3>
                                        <p className="text-sm text-white/50">ชื่อวิทยาลัยและโลโก้ที่แสดงในส่วนท้ายจะถูกดึงมาจากการตั้งค่าหลักของเว็บไซต์</p>
                                    </div>
                                </div>
                                <a
                                    href="/admin/settings"
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">settings</span>
                                    ไปที่ตั้งค่าเว็บไซต์เพื่อแก้ไข
                                </a>
                            </div>

                            <div className="editor-card">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-icons text-primary">settings</span>
                                    <h2 className="text-lg font-bold text-white">ข้อมูลพื้นฐานส่วนท้าย</h2>
                                </div>
                                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                    <div className="form-group">
                                        <label>คำอธิบายส่วนท้าย</label>
                                        <textarea
                                            value={settings.description}
                                            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                            rows="3"
                                            placeholder="เช่น วิทยาลัยแห่งอนาคต..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label>Facebook URL</label>
                                            <input
                                                type="text"
                                                value={settings.facebook_url}
                                                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                                placeholder="#"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Google Maps URL</label>
                                            <input
                                                type="text"
                                                value={settings.website_url}
                                                onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                                                placeholder="https://maps.google.com/..."
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>ที่อยู่</label>
                                        <textarea
                                            value={settings.address}
                                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                            rows="2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label>เบอร์โทรศัพท์</label>
                                            <input
                                                type="text"
                                                value={settings.phone}
                                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>อีเมล</label>
                                            <input
                                                type="email"
                                                value={settings.email}
                                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Copyright Text</label>
                                        <input
                                            type="text"
                                            value={settings.copyright}
                                            onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-white/5">
                                        <div className="form-group">
                                            <label>ลิงก์นโยบายความเป็นส่วนตัว (Privacy Policy)</label>
                                            <input
                                                type="text"
                                                value={settings.privacy_policy_url}
                                                onChange={(e) => setSettings({ ...settings, privacy_policy_url: e.target.value })}
                                                placeholder="#"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>ลิงก์ข้อตกลงการใช้งาน (Terms of Use)</label>
                                            <input
                                                type="text"
                                                value={settings.terms_of_use_url}
                                                onChange={(e) => setSettings({ ...settings, terms_of_use_url: e.target.value })}
                                                placeholder="#"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-white/10">
                                        <div className="form-group">
                                            <label className="flex items-center gap-2">
                                                <span className="material-icons text-sm text-[#f2cc0d]">gavel</span>
                                                เนื้อหานโยบายความเป็นส่วนตัว (Privacy Policy Content)
                                            </label>
                                            <textarea
                                                value={settings.privacy_policy_content}
                                                onChange={(e) => setSettings({ ...settings, privacy_policy_content: e.target.value })}
                                                rows="10"
                                                placeholder="ใส่เนื้อหานโยบายความเป็นส่วนตัวที่นี่..."
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-white/30 mt-1">เนื้อหานี้จะปรากฏในรูปแบบ Popup เมื่อคลิกลิงก์ที่ส่วนท้าย</p>
                                        </div>

                                        <div className="form-group">
                                            <label className="flex items-center gap-2">
                                                <span className="material-icons text-sm text-[#f2cc0d]">description</span>
                                                เนื้อหาข้อตกลงการใช้งาน (Terms of Use Content)
                                            </label>
                                            <textarea
                                                value={settings.terms_of_use_content}
                                                onChange={(e) => setSettings({ ...settings, terms_of_use_content: e.target.value })}
                                                rows="10"
                                                placeholder="ใส่เนื้อหาข้อตกลงการใช้งานที่นี่..."
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-white/30 mt-1">เนื้อหานี้จะปรากฏในรูปแบบ Popup เมื่อคลิกลิงก์ที่ส่วนท้าย</p>
                                        </div>
                                    </div>

                                    <div className="editor-card !bg-white/5 p-6 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-white font-bold mb-1">คลื่นส่วนบน (Wavy Top Divider)</h4>
                                                <p className="text-sm text-white/50">เปิดหรือปิดรูปคลื่นที่อยู่ด้านบนสุดของส่วนท้าย</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.show_wave}
                                                    onChange={(e) => setSettings({ ...settings, show_wave: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        {settings.show_wave && (
                                            <div className="form-group mt-4">
                                                <label>สีของคลื่น (Wave Fill Color)</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="color"
                                                        value={settings.wave_color}
                                                        onChange={(e) => setSettings({ ...settings, wave_color: e.target.value })}
                                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.wave_color}
                                                        onChange={(e) => setSettings({ ...settings, wave_color: e.target.value })}
                                                        className="flex-1"
                                                        placeholder="#f8f8f5"
                                                    />
                                                </div>
                                                <p className="text-xs text-white/30 mt-1">แนะนำให้ใช้สีเดียวกับพื้นหลังของส่วนที่อยู่ติดกัน (เช่น #f8f8f5 หรือ #ffffff)</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-start pt-4">
                                        <button type="submit" className="btn-primary px-10 py-3 font-bold">
                                            บันทึกการตั้งค่า
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <section className="editor-card sticky top-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="material-icons text-primary">add_link</span>
                                        <h2 className="text-lg font-bold text-white">เพิ่มลิงก์ใหม่</h2>
                                    </div>
                                    <form onSubmit={handleAddLink} className="space-y-4">
                                        <div className="form-group">
                                            <label>หมวดหมู่</label>
                                            <select
                                                value={newLink.section}
                                                onChange={(e) => setNewLink({ ...newLink, section: e.target.value })}
                                            >
                                                <option value="quick">ลิงก์ด่วน</option>
                                                <option value="help">ช่วยเหลือ</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>ชื่อลิงก์</label>
                                            <input
                                                type="text"
                                                required
                                                value={newLink.title}
                                                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>URL</label>
                                            <input
                                                type="text"
                                                required
                                                value={newLink.url}
                                                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>ลำดับ</label>
                                            <input
                                                type="number"
                                                value={newLink.sort_order}
                                                onChange={(e) => setNewLink({ ...newLink, sort_order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary w-full py-3 font-bold mt-2">
                                            เพิ่มลิงก์
                                        </button>
                                    </form>
                                </section>
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                {['quick', 'help'].map((section) => (
                                    <section key={section} className="editor-card !p-0 overflow-hidden">
                                        <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
                                            <span className="material-icons text-primary">{section === 'quick' ? 'link' : 'help_outline'}</span>
                                            <h3 className="text-lg font-bold text-white capitalize">{section === 'quick' ? 'ลิงก์ด่วน' : 'ช่วยเหลือ'}</h3>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {links.filter(l => l.section === section).map((link) => (
                                                <div key={link.id} className="p-6">
                                                    {editingLink?.id === link.id ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                                            <div className="md:col-span-1 form-group mb-0">
                                                                <input
                                                                    type="text"
                                                                    value={editingLink.title}
                                                                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2 form-group mb-0">
                                                                <input
                                                                    type="text"
                                                                    value={editingLink.url}
                                                                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleUpdateLink(editingLink)} className="p-2 bg-green-500 rounded text-white flex-1 hover:bg-green-600 transition-all">
                                                                    <span className="material-icons text-sm">check</span>
                                                                </button>
                                                                <button onClick={() => setEditingLink(null)} className="p-2 bg-white/10 rounded text-white flex-1 hover:bg-white/20 transition-all">
                                                                    <span className="material-icons text-sm">close</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="text-white font-medium">{link.title}</h4>
                                                                <p className="text-primary text-xs mt-1">{link.url}</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <button onClick={() => setEditingLink(link)} className="text-white/40 hover:text-primary transition-all">
                                                                    <span className="material-icons text-xl">edit</span>
                                                                </button>
                                                                <button onClick={() => handleDeleteLink(link.id)} className="text-white/40 hover:text-red-500 transition-all">
                                                                    <span className="material-icons text-xl">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {links.filter(l => l.section === section).length === 0 && (
                                                <div className="p-12 text-center text-white/20">ยังไม่มีลิงก์ในหมวดหมู่ นี้</div>
                                            )}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
