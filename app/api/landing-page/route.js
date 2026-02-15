import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const landing = await query('SELECT * FROM cms_landing_page LIMIT 1');
        if (landing.length === 0) {
            return NextResponse.json({ success: false, message: 'No landing page data found' });
        }
        return NextResponse.json({ success: true, settings: landing[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { is_active, image_url } = body;

        const landing = await query('SELECT id FROM cms_landing_page LIMIT 1');

        if (landing.length === 0) {
            await query(`
                INSERT INTO cms_landing_page (is_active, image_url) 
                VALUES (?, ?)
            `, [is_active ? 1 : 0, image_url]);
        } else {
            await query(`
                UPDATE cms_landing_page SET is_active = ?, image_url = ? 
                WHERE id = ?
            `, [is_active ? 1 : 0, image_url, landing[0].id]);
        }

        revalidatePath('/');
        return NextResponse.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
