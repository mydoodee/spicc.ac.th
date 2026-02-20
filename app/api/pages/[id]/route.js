import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — ดึงเพจเดี่ยว
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const pages = await query('SELECT * FROM cms_pages WHERE id = ?', [id]);
        if (pages.length === 0) {
            return NextResponse.json({ error: 'ไม่พบเพจ' }, { status: 404 });
        }
        return NextResponse.json({ success: true, page: pages[0] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT — แก้ไขเพจ
export async function PUT(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { title, slug, content, is_published, gallery } = await request.json();

        // Check slug uniqueness (exclude current page)
        const existing = await query('SELECT id FROM cms_pages WHERE slug = ? AND id != ?', [slug, id]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'slug นี้ถูกใช้แล้ว' }, { status: 400 });
        }

        await query(
            'UPDATE cms_pages SET title = ?, slug = ?, content = ?, is_published = ?, gallery = ? WHERE id = ?',
            [title, slug, content || '', is_published ? 1 : 0, gallery || '[]', id]
        );

        revalidatePath('/');
        revalidatePath('/page/' + slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update page error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — ลบเพจ
export async function DELETE(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Clear page_id references in menus
        await query('UPDATE cms_menus SET page_id = NULL WHERE page_id = ?', [id]);
        // Delete the page
        await query('DELETE FROM cms_pages WHERE id = ?', [id]);

        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete page error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
