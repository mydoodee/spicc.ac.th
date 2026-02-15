"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", href: "/admin", icon: "dashboard" },
        { name: "จัดการส่วนหัว", href: "/admin/hero", icon: "view_carousel" },
        { name: "จัดการหน้าคั่น", href: "/admin/landing-page", icon: "auto_awesome" },
        { name: "จัดการหลักสูตร", href: "/admin/courses", icon: "school" },
        { name: "จัดการแผนกวิชา", href: "/admin/departments", icon: "category" },
        { name: "จัดการบุคลากร", href: "/admin/personnel", icon: "groups" },
        { name: "จัดการข่าวสาร", href: "/admin/news", icon: "newspaper" },
        { name: "จัดการจัดซื้อจัดจ้าง", href: "/admin/procurement", icon: "gavel" },
        { name: "จัดการเกี่ยวกับเรา", href: "/admin/about", icon: "info" },
        { name: "จัดการเมนู", href: "/admin/menus", icon: "sort" },
        { name: "จัดการเพจ", href: "/admin/pages", icon: "article" },
        { name: "จัดการส่วนท้าย", href: "/admin/footer", icon: "wrap_text" },
        { name: "ตั้งค่าเว็บไซต์", href: "/admin/settings", icon: "settings" },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <span className="material-icons">school</span>
                </div>
                <span className="sidebar-title">SPICC ADMIN</span>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-nav-label">Main Menu</div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive ? "active" : ""}`}
                        >
                            <span className="material-icons">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="text-xs text-white/30 text-center">Version 1.0.0</div>
            </div>
        </aside>
    );
}
