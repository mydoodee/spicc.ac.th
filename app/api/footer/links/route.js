import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const data = await request.json();
        const { section, title, url, sort_order } = data;

        const result = await query(
            'INSERT INTO cms_footer_links (section, title, url, sort_order) VALUES (?, ?, ?, ?)',
            [section, title, url, sort_order || 0]
        );

        return NextResponse.json({
            success: true,
            message: 'เพิ่มลิงก์เรียบร้อยแล้ว',
            linkId: result.insertId
        });
    } catch (error) {
        console.error('Add footer link error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const data = await request.json();
        const { id, title, url, sort_order } = data;

        await query(
            'UPDATE cms_footer_links SET title = ?, url = ?, sort_order = ? WHERE id = ?',
            [title, url, sort_order, id]
        );

        return NextResponse.json({ success: true, message: 'บันทึกการแก้ไขลิงก์เรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Update footer link error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
        }

        await query('DELETE FROM cms_footer_links WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'ลบลิงก์เรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Delete footer link error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
