import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const stats = await query('SELECT * FROM cms_about_stats ORDER BY sort_order ASC');
        return NextResponse.json({ success: true, stats });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { value, label, sort_order } = await request.json();
        await query(
            'INSERT INTO cms_about_stats (value, label, sort_order) VALUES (?, ?, ?)',
            [value, label, sort_order || 0]
        );
        return NextResponse.json({ success: true, message: 'Stat added' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, value, label, sort_order } = await request.json();
        await query(
            'UPDATE cms_about_stats SET value = ?, label = ?, sort_order = ? WHERE id = ?',
            [value, label, sort_order, id]
        );
        return NextResponse.json({ success: true, message: 'Stat updated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        await query('DELETE FROM cms_about_stats WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Stat deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
