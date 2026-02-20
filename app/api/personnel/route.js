import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const personnel = await query('SELECT * FROM cms_personnel ORDER BY sort_order ASC');
        return NextResponse.json({ success: true, personnel });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, role, description, image, sort_order, department, is_homepage } = body;

        const result = await query(
            'INSERT INTO cms_personnel (name, role, description, image, sort_order, department, is_homepage) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, role, description, image, sort_order || 0, department || 'ทั่วไป', is_homepage ? 1 : 0]
        );

        revalidatePath('/'); // Clear home page cache
        revalidatePath('/personnel');
        return NextResponse.json({ success: true, message: 'Added successfully', id: result.insertId });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, name, role, description, image, sort_order, department, is_homepage } = body;

        await query(
            'UPDATE cms_personnel SET name=?, role=?, description=?, image=?, sort_order=?, department=?, is_homepage=? WHERE id=?',
            [name, role, description, image, sort_order, department, is_homepage ? 1 : 0, id]
        );

        revalidatePath('/'); // Clear home page cache
        revalidatePath('/personnel');
        return NextResponse.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
        }

        await query('DELETE FROM cms_personnel WHERE id = ?', [id]);

        revalidatePath('/'); // Clear home page cache
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
