import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const settings = await query('SELECT * FROM cms_about_settings LIMIT 1');
        return NextResponse.json({ success: true, settings: settings[0] || {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { title, title_highlight, description } = await request.json();

        const existing = await query('SELECT id FROM cms_about_settings LIMIT 1');
        if (existing.length > 0) {
            await query(
                'UPDATE cms_about_settings SET title = ?, title_highlight = ?, description = ? WHERE id = ?',
                [title, title_highlight, description, existing[0].id]
            );
        } else {
            await query(
                'INSERT INTO cms_about_settings (title, title_highlight, description) VALUES (?, ?, ?)',
                [title, title_highlight, description]
            );
        }

        return NextResponse.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
