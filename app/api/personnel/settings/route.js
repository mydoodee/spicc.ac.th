import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const settings = await query('SELECT * FROM cms_personnel_settings LIMIT 1');
        if (settings.length > 0) {
            return NextResponse.json({ success: true, settings: settings[0] });
        }
        return NextResponse.json({
            success: true,
            settings: {
                personnel_title: 'คณะผู้บริหารและคณาจารย์',
                personnel_description: 'ทีมผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมถ่ายทอดความรู้และนวัตกรรมเพื่อส่งเสริมศักยภาพของผู้เรียนอย่างเต็มที่'
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { personnel_title, personnel_description } = body;

        const existing = await query('SELECT id FROM cms_personnel_settings LIMIT 1');

        if (existing.length > 0) {
            await query(
                'UPDATE cms_personnel_settings SET personnel_title = ?, personnel_description = ? WHERE id = ?',
                [personnel_title, personnel_description, existing[0].id]
            );
        } else {
            await query(
                'INSERT INTO cms_personnel_settings (personnel_title, personnel_description) VALUES (?, ?)',
                [personnel_title, personnel_description]
            );
        }

        revalidatePath('/');
        revalidatePath('/personnel');
        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
