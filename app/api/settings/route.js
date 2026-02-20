import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const settings = await query('SELECT * FROM cms_site_settings ORDER BY id DESC LIMIT 1');
        return NextResponse.json({ success: true, settings: settings[0] || {} });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            site_name,
            site_logo,
            site_logo_url,
            site_favicon_url,
            site_title_suffix,
            site_subtitle,
            register_link,
            register_button_text,
            cookie_policy,
            show_home_slider,
            show_features,
            show_personnel,
            show_courses,
            show_news,
            show_about,
            show_procurement
        } = await req.json();

        // Check if settings exist
        const existing = await query('SELECT id FROM cms_site_settings LIMIT 1');

        if (existing.length > 0) {
            await query(
                `UPDATE cms_site_settings SET 
                site_name = ?, 
                site_logo = ?, 
                site_logo_url = ?, 
                site_favicon_url = ?,
                site_title_suffix = ?,
                site_subtitle = ?,
                register_link = ?, 
                register_button_text = ?,
                cookie_policy = ?,
                show_home_slider = ?,
                show_features = ?,
                show_personnel = ?,
                show_courses = ?,
                show_news = ?,
                show_about = ?,
                show_procurement = ?
                WHERE id = ?`,
                [
                    site_name,
                    site_logo,
                    site_logo_url,
                    site_favicon_url,
                    site_title_suffix,
                    site_subtitle,
                    register_link,
                    register_button_text,
                    cookie_policy || '',
                    show_home_slider ? 1 : 0,
                    show_features ? 1 : 0,
                    show_personnel ? 1 : 0,
                    show_courses ? 1 : 0,
                    show_news ? 1 : 0,
                    show_about ? 1 : 0,
                    show_procurement ? 1 : 0,
                    existing[0].id
                ]
            );
        } else {
            await query(
                `INSERT INTO cms_site_settings 
                (site_name, site_logo, site_logo_url, site_favicon_url, site_title_suffix, site_subtitle, register_link, register_button_text, cookie_policy, show_home_slider, show_features, show_personnel, show_courses, show_news, show_about, show_procurement) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    site_name,
                    site_logo,
                    site_logo_url,
                    site_favicon_url,
                    site_title_suffix,
                    site_subtitle,
                    register_link,
                    register_button_text,
                    cookie_policy || '',
                    show_home_slider ? 1 : 0,
                    show_features ? 1 : 0,
                    show_personnel ? 1 : 0,
                    show_courses ? 1 : 0,
                    show_news ? 1 : 0,
                    show_about ? 1 : 0,
                    show_procurement ? 1 : 0
                ]
            );
        }

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
