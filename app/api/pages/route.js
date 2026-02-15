import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — ดึงเพจทั้งหมด
export async function GET() {
    try {
        const pages = await query(
            'SELECT * FROM cms_pages ORDER BY created_at DESC'
        );
        return NextResponse.json({ success: true, pages });
    } catch (error) {
        console.error('Get pages error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — สร้างเพจใหม่
export async function POST(request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, slug, content, is_published, gallery } = await request.json();

        if (!title || !slug) {
            return NextResponse.json({ error: 'กรุณากรอก title และ slug' }, { status: 400 });
        }

        // Check slug uniqueness
        const existing = await query('SELECT id FROM cms_pages WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'slug นี้ถูกใช้แล้ว' }, { status: 400 });
        }

        const result = await query(
            'INSERT INTO cms_pages (title, slug, content, is_published, gallery) VALUES (?, ?, ?, ?, ?)',
            [title, slug, content || '', is_published ? 1 : 0, gallery || '[]']
        );

        revalidatePath('/');
        revalidatePath('/page/' + slug);

        return NextResponse.json({
            success: true,
            page: { id: result.insertId, title, slug, content, is_published: is_published ? 1 : 0 },
        });
    } catch (error) {
        console.error('Create page error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
