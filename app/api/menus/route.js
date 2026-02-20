import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET — ดึงเมนูทั้งหมด (จัดเป็น tree)
export async function GET() {
    try {
        const menus = await query(
            'SELECT m.*, p.title as page_title, p.slug as page_slug, c.title as course_title, c.slug as course_slug, n.title as news_title, n.slug as news_slug FROM cms_menus m LEFT JOIN cms_pages p ON m.page_id = p.id LEFT JOIN cms_courses c ON m.course_id = c.id LEFT JOIN cms_news n ON m.news_id = n.id ORDER BY m.sort_order ASC, m.id ASC'
        );

        // Build tree structure
        const menuMap = {};
        const tree = [];

        menus.forEach(m => {
            menuMap[m.id] = { ...m, children: [] };
        });

        menus.forEach(m => {
            if (m.parent_id && menuMap[m.parent_id]) {
                menuMap[m.parent_id].children.push(menuMap[m.id]);
            } else {
                tree.push(menuMap[m.id]);
            }
        });

        return NextResponse.json({ success: true, menus: tree, allMenus: menus });
    } catch (error) {
        console.error('Get menus error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — สร้างเมนูใหม่
export async function POST(request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, url, page_id, course_id, news_id, parent_id, sort_order, is_active, target } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'กรุณากรอกชื่อเมนู' }, { status: 400 });
        }

        const result = await query(
            'INSERT INTO cms_menus (title, url, page_id, course_id, news_id, parent_id, sort_order, is_active, target) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, url || null, page_id || null, course_id || null, news_id || null, parent_id || null, sort_order || 0, is_active !== undefined ? is_active : 1, target || '_self']
        );

        return NextResponse.json({
            success: true,
            menu: { id: result.insertId, title, url, page_id, course_id, news_id, parent_id, sort_order, is_active: is_active !== undefined ? is_active : 1, target: target || '_self' },
        });
    } catch (error) {
        console.error('Create menu error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH — อัปเดตลำดับเมนูแบบกลุ่ม (Bulk sort order update)
export async function PATCH(request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { updates } = await request.json(); // updates: [{id, sort_order}, ...]

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Perform bulk updates in a transaction or individual queries
        for (const item of updates) {
            await query(
                'UPDATE cms_menus SET sort_order = ? WHERE id = ?',
                [item.sort_order, item.id]
            );
        }

        return NextResponse.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        console.error('Update menu orders error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
