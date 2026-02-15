"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { normalizePath } from "@/lib/utils";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [cmsMenus, setCmsMenus] = useState([]);
    const [siteSettings, setSiteSettings] = useState({
        site_name: 'วิทยาลัยการอาชีพศีขรภูมิ',
        site_logo: 'school',
        site_logo_url: '',
        site_subtitle: 'SIKHORAPHUM INDUSTRIAL AND COMMUNITY EDUCATION COLLEGE',
        register_link: '#',
        register_button_text: 'สมัครเรียนเลย'
    });
    const pathname = usePathname();
    const [logoLoaded, setLogoLoaded] = useState(false);

    useEffect(() => {
        fetchMenus();
        fetchSettings();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await fetch('/web/api/menus');
            const data = await res.json();
            if (data.success && data.menus.length > 0) {
                setCmsMenus(data.menus);
            }
        } catch (err) {
            console.error("Failed to fetch menus:", err);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/web/api/settings');
            const data = await res.json();
            if (data.success && data.settings) {
                setSiteSettings(data.settings);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const getLink = (menu) => {
        if (menu.page_id && menu.page_slug) {
            // Special cases for root-level physical routes
            const rootPages = ['personnel', 'courses', 'news'];
            if (rootPages.includes(menu.page_slug)) {
                return `/${menu.page_slug}`;
            }
            return `/page/${menu.page_slug}`;
        }
        if (menu.course_id) {
            const coursePath = menu.course_slug ? `/courses/${menu.course_slug}` : `/courses?id=${menu.course_id}`;
            return coursePath;
        }
        if (menu.news_id) {
            const newsPath = menu.news_slug ? `/news/${menu.news_slug}` : `/news?id=${menu.news_id}`;
            return newsPath;
        }

        // Handle hash links correctly when on internal pages
        if (menu.url && menu.url.startsWith('#') && pathname !== '/') {
            return `/${menu.url}`;
        }

        return menu.url || '#';
    };

    // Default menus if CMS is empty
    const defaultMenus = [
        { id: 'home', title: 'หน้าแรก', url: '/', children: [] },
        {
            id: 'courses',
            title: 'หลักสูตรที่เปิดสอน',
            url: '/courses',
            children: [
                { id: 'courses-1', title: 'หลักสูตรปกติ', url: '/courses?type=regular' },
                { id: 'courses-2', title: 'หลักสูตรพิเศษ', url: '/courses?type=special' },
                { id: 'courses-3', title: 'หลักสูตรระยะสั้น', url: '/courses?type=short' },
            ]
        },
        { id: 'personnel', title: 'คณาจารย์', url: '/personnel', children: [] },
        {
            id: 'about',
            title: 'เกี่ยวกับเรา',
            url: '/#about',
            children: [
                { id: 'about-1', title: 'ประวัติความเป็นมา', url: '/#history' },
                { id: 'about-2', title: 'วิสัยทัศน์', url: '/#vision' },
                { id: 'about-3', title: 'ผู้บริหาร', url: '/#management' },
            ]
        },
        { id: 'contact', title: 'ติดต่อสอบถาม', url: '/#contact', children: [] },
    ];

    const menusToRender = cmsMenus.length > 0 ? cmsMenus : defaultMenus;

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#2b4a8a]/10 shadow-sm">
            {/* Top Row - Logo and CTA */}
            <div className="border-b border-[#2b4a8a]/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 flex items-center justify-center overflow-hidden transition-all duration-500">
                            {siteSettings.site_logo_url ? (
                                <img
                                    src={normalizePath(siteSettings.site_logo_url)}
                                    alt="Logo"
                                    className={`w-full h-full object-contain transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setLogoLoaded(true)}
                                />
                            ) : (
                                <span className="material-icons text-[#2b4a8a] text-3xl animate-pulse">{siteSettings.site_logo}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-extrabold text-[#2b4a8a] tracking-tight leading-none">
                                {siteSettings.site_name}
                            </span>
                            {siteSettings.site_subtitle && (
                                <span className="text-[9px] text-[#2b4a8a]/60 font-medium leading-tight mt-0.5">
                                    {siteSettings.site_subtitle}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center">
                        <button
                            className="p-2 text-[#2b4a8a] hover:bg-[#2b4a8a]/5 rounded-lg transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <span className="material-icons text-3xl">menu</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Menu (Desktop) */}
            <div className="hidden lg:block bg-gradient-to-r from-[#2b4a8a]/[0.02] to-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 py-2">
                        {menusToRender.map((menu) => (
                            <div key={menu.id} className="relative group">
                                <Link
                                    href={getLink(menu)}
                                    target={menu.target || "_self"}
                                    rel={(menu.target === "_blank") ? "noopener noreferrer" : undefined}
                                    className="text-[#2b4a8a] font-bold text-sm hover:text-[#f2cc0d] hover:bg-[#f2cc0d]/5 transition-all duration-200 ease-out flex items-center gap-1 px-4 py-3 uppercase tracking-tight whitespace-nowrap rounded-lg transform hover:scale-105"
                                    style={{ willChange: 'transform, color, background-color' }}
                                >
                                    {menu.title}
                                    {menu.children && menu.children.length > 0 && (
                                        <span className="material-icons text-base opacity-60 group-hover:opacity-100 transition-opacity">expand_more</span>
                                    )}
                                </Link>

                                {/* Dropdown for Sub-menus */}
                                {menu.children && menu.children.length > 0 && (
                                    <div className="absolute top-full left-0 mt-1 min-w-[240px] bg-white shadow-2xl rounded-xl border border-[#2b4a8a]/10 overflow-hidden hidden group-hover:block z-[100] animate-fade-in-up">

                                        <div className="p-2">
                                            {menu.children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={getLink(child)}
                                                    target={child.target || "_self"}
                                                    rel={(child.target === "_blank") ? "noopener noreferrer" : undefined}
                                                    className="block px-4 py-3 text-sm font-medium text-[#2b4a8a] hover:bg-[#f2cc0d]/10 hover:text-[#f2cc0d] rounded-lg transition-all duration-200 ease-out transform hover:translate-x-1 flex items-center gap-2"
                                                    style={{ willChange: 'background-color, color, transform' }}
                                                >
                                                    <span className="material-icons text-base opacity-40">chevron_right</span>
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-[#2b4a8a]/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center p-6 text-center animate-fade-in" style={{ willChange: 'opacity' }}>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <span className="material-icons text-3xl">close</span>
                    </button>
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide scroll-smooth pt-10">
                        {menusToRender.map((menu) => (
                            <div key={menu.id} className="w-full">
                                <Link
                                    onClick={() => !menu.children?.length && setMenuOpen(false)}
                                    className="text-2xl font-black text-white hover:text-[#f2cc0d] block uppercase tracking-tight transition-all duration-300 ease-out transform hover:scale-105 hover:translate-x-2"
                                    href={getLink(menu)}
                                    target={menu.target || "_self"}
                                    rel={(menu.target === "_blank") ? "noopener noreferrer" : undefined}
                                    style={{ willChange: 'transform, color' }}
                                >
                                    {menu.title}
                                </Link>
                                {menu.children && menu.children.length > 0 && (
                                    <div className="flex flex-col gap-3 mt-4 pl-4 border-l-2 border-white/10">
                                        {menu.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                onClick={() => setMenuOpen(false)}
                                                className="text-lg font-medium text-white/70 hover:text-[#f2cc0d] transition-all duration-200 ease-out transform hover:translate-x-1"
                                                href={getLink(child)}
                                                target={child.target || "_self"}
                                                rel={(child.target === "_blank") ? "noopener noreferrer" : undefined}
                                                style={{ willChange: 'transform, color' }}
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
