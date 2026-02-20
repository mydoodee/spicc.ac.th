import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(request) {
    try {
        const announcements = await query('SELECT * FROM procurement_announcements ORDER BY announcement_date DESC');
        return NextResponse.json({ success: true, announcements });
    } catch (error) {
        console.error("GET Procurement Admin Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, announcement_date, year, file_url, external_url, gallery, is_active, is_urgent } = body;

        const result = await query(
            'INSERT INTO procurement_announcements (title, description, announcement_date, year, file_url, external_url, gallery, is_active, is_urgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', announcement_date, year, file_url || '', external_url || '', gallery || '[]', is_active !== false ? 1 : 0, is_urgent ? 1 : 0]
        );

        revalidatePath('/');
        return NextResponse.json({ success: true, message: 'Added successfully', id: result.insertId });
    } catch (error) {
        console.error("POST Procurement Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, title, description, announcement_date, year, file_url, external_url, gallery, is_active, is_urgent } = body;

        await query(
            'UPDATE procurement_announcements SET title=?, description=?, announcement_date=?, year=?, file_url=?, external_url=?, gallery=?, is_active=?, is_urgent=? WHERE id=?',
            [title, description || '', announcement_date, year, file_url || '', external_url || '', gallery || '[]', is_active !== false ? 1 : 0, is_urgent ? 1 : 0, id]
        );

        revalidatePath('/');
        return NextResponse.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        console.error("PUT Procurement Error:", error);
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

        await query('DELETE FROM procurement_announcements WHERE id = ?', [id]);

        revalidatePath('/');
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error("DELETE Procurement Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
