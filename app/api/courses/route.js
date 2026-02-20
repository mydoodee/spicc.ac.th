import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');

        if (id) {
            const result = await query('SELECT * FROM cms_courses WHERE id = ?', [id]);
            return NextResponse.json({ success: true, course: result[0] });
        }

        if (slug) {
            const result = await query('SELECT * FROM cms_courses WHERE slug = ?', [slug]);
            return NextResponse.json({ success: true, course: result[0] });
        }

        const result = await query('SELECT * FROM cms_courses ORDER BY sort_order ASC');
        return NextResponse.json({ success: true, courses: result });
    } catch (error) {
        console.error('GET /api/courses Error Details:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, slug, description, image, icon, color, text_color, is_special, sort_order, show_on_home } = body;

        const result = await query(
            'INSERT INTO cms_courses (title, slug, description, image, icon, color, text_color, is_special, sort_order, is_active, show_on_home) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title || '', slug || '', description || '', image || null, icon || 'school', color || 'bg-[#2b4a8a]', text_color || 'text-white', is_special ? 1 : 0, sort_order || 0, 1, show_on_home ? 1 : 0]
        );

        revalidatePath('/');
        revalidatePath('/courses');
        return NextResponse.json({ success: true, message: 'Added successfully', id: result.insertId });
    } catch (error) {
        console.error('POST /api/courses Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        console.log('PUT /api/courses Payload Keys:', Object.keys(body));
        if (body.image) console.log('PUT /api/courses Image Size:', body.image.length);

        const { id, title, slug, description, image, icon, color, text_color, is_special, sort_order, is_active, show_on_home } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        await query(
            'UPDATE cms_courses SET title=?, slug=?, description=?, image=?, icon=?, color=?, text_color=?, is_special=?, sort_order=?, is_active=?, show_on_home=? WHERE id=?',
            [title || '', slug || '', description || '', image || null, icon || 'school', color || 'bg-[#2b4a8a]', text_color || 'text-white', is_special ? 1 : 0, sort_order || 0, is_active === false ? 0 : 1, show_on_home ? 1 : 0, id]
        );

        revalidatePath('/');
        revalidatePath('/courses');
        return NextResponse.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        console.error('PUT /api/courses Error Details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        await query('DELETE FROM cms_courses WHERE id = ?', [id]);

        revalidatePath('/');
        revalidatePath('/courses');
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/courses Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
