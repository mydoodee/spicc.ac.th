import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const features = await query('SELECT * FROM cms_about_features ORDER BY sort_order ASC');
        return NextResponse.json({ success: true, features });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { icon, title, description, sort_order } = await request.json();
        await query(
            'INSERT INTO cms_about_features (icon, title, description, sort_order) VALUES (?, ?, ?, ?)',
            [icon, title, description, sort_order || 0]
        );
        return NextResponse.json({ success: true, message: 'Feature added' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, icon, title, description, sort_order } = await request.json();
        await query(
            'UPDATE cms_about_features SET icon = ?, title = ?, description = ?, sort_order = ? WHERE id = ?',
            [icon, title, description, sort_order, id]
        );
        return NextResponse.json({ success: true, message: 'Feature updated' });
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
        await query('DELETE FROM cms_about_features WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Feature deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
