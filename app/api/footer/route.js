import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const settings = await query('SELECT * FROM cms_footer_settings LIMIT 1');
        const links = await query('SELECT * FROM cms_footer_links ORDER BY sort_order ASC');

        return NextResponse.json({
            success: true,
            settings: settings[0] || null,
            links: links
        });
    } catch (error) {
        console.error('Fetch footer error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const data = await request.json();
        const {
            description, facebook_url, website_url, address, phone, email, copyright,
            show_wave, wave_color, privacy_policy_url, terms_of_use_url,
            privacy_policy_content, terms_of_use_content
        } = data;

        const result = await query(
            `UPDATE cms_footer_settings 
       SET description = ?, facebook_url = ?, website_url = ?, address = ?, phone = ?, email = ?, copyright = ?,
           show_wave = ?, wave_color = ?, privacy_policy_url = ?, terms_of_use_url = ?,
           privacy_policy_content = ?, terms_of_use_content = ?
       WHERE id = 1`,
            [
                description, facebook_url, website_url, address, phone, email, copyright,
                show_wave ? 1 : 0, wave_color, privacy_policy_url, terms_of_use_url,
                privacy_policy_content, terms_of_use_content
            ]
        );

        if (result.affectedRows === 0) {
            // If for some reason settings don't exist, insert them
            await query(
                `INSERT INTO cms_footer_settings (
                    description, facebook_url, website_url, address, phone, email, copyright, 
                    show_wave, wave_color, privacy_policy_url, terms_of_use_url,
                    privacy_policy_content, terms_of_use_content
                )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    description, facebook_url, website_url, address, phone, email, copyright,
                    show_wave ? 1 : 0, wave_color, privacy_policy_url, terms_of_use_url,
                    privacy_policy_content, terms_of_use_content
                ]
            );
        }

        return NextResponse.json({ success: true, message: 'บันทึกข้อมูลส่วนท้ายเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Update footer error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
