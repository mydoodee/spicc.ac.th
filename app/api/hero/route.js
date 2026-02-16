import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const hero = await query('SELECT * FROM cms_hero LIMIT 1');
        if (hero.length === 0) {
            return NextResponse.json({ success: false, message: 'No hero data found' });
        }
        return NextResponse.json({ success: true, hero: hero[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const {
            badge_text, title_line1, title_line2, description, bg_image,
            show_buttons, btn_primary_text, btn_primary_url, btn_secondary_text, btn_secondary_url,
            bg_opacity, bg_fit,
            btn_primary_target, btn_secondary_target
        } = body;

        // Check if row exists
        const hero = await query('SELECT id FROM cms_hero LIMIT 1');

        if (hero.length === 0) {
            await query(`
            INSERT INTO cms_hero (
              badge_text, title_line1, title_line2, description, bg_image, 
              show_buttons, btn_primary_text, btn_primary_url, btn_secondary_text, btn_secondary_url,
              bg_opacity, bg_fit,
              btn_primary_target, btn_secondary_target
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
                badge_text, title_line1, title_line2, description, bg_image,
                show_buttons ? 1 : 0, btn_primary_text, btn_primary_url, btn_secondary_text, btn_secondary_url,
                bg_opacity, bg_fit,
                btn_primary_target || '_self', btn_secondary_target || '_self'
            ]);
        } else {
            await query(`
            UPDATE cms_hero SET
              badge_text = ?, title_line1 = ?, title_line2 = ?, description = ?, bg_image = ?,
              show_buttons = ?, btn_primary_text = ?, btn_primary_url = ?, btn_secondary_text = ?, btn_secondary_url = ?,
              bg_opacity = ?, bg_fit = ?,
              btn_primary_target = ?, btn_secondary_target = ?
            WHERE id = ?
          `, [
                badge_text, title_line1, title_line2, description, bg_image,
                show_buttons ? 1 : 0, btn_primary_text, btn_primary_url, btn_secondary_text, btn_secondary_url,
                bg_opacity, bg_fit,
                btn_primary_target || '_self', btn_secondary_target || '_self',
                hero[0].id
            ]);
        }

        revalidatePath('/'); // Clear home page cache
        return NextResponse.json({ success: true, message: 'Updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
