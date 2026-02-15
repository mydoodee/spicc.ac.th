import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET news settings
export async function GET() {
    try {
        const settings = await query('SELECT * FROM cms_news_settings LIMIT 1');
        return NextResponse.json({ success: true, settings: settings[0] || null });
    } catch (error) {
        console.error("GET news settings error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT news settings (Protected)
export async function PUT(req) {
    try {
        const token = req.cookies.get('admin_token')?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { news_title, news_description } = await req.json();

        // Check if settings exist
        const existing = await query('SELECT id FROM cms_news_settings LIMIT 1');

        if (existing.length > 0) {
            await query(
                'UPDATE cms_news_settings SET news_title = ?, news_description = ? WHERE id = ?',
                [news_title, news_description, existing[0].id]
            );
        } else {
            await query(
                'INSERT INTO cms_news_settings (news_title, news_description) VALUES (?, ?)',
                [news_title, news_description]
            );
        }

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error("PUT news settings error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
