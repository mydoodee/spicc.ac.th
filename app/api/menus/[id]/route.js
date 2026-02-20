import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PUT — แก้ไขเมนู
export async function PUT(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { title, url, page_id, course_id, news_id, parent_id, sort_order, is_active, target } = await request.json();

        await query(
            'UPDATE cms_menus SET title = ?, url = ?, page_id = ?, course_id = ?, news_id = ?, parent_id = ?, sort_order = ?, is_active = ?, target = ? WHERE id = ?',
            [title, url || null, page_id || null, course_id || null, news_id || null, parent_id || null, sort_order || 0, is_active !== undefined ? is_active : 1, target || '_self', id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update menu error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — ลบเมนู (+ ลบ sub-menu ด้วย)
export async function DELETE(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete children first
        await query('DELETE FROM cms_menus WHERE parent_id = ?', [id]);
        // Delete the menu itself
        await query('DELETE FROM cms_menus WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete menu error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
