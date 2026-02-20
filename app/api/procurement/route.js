import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');

        let sql = 'SELECT * FROM procurement_announcements WHERE is_active = 1';
        const params = [];

        if (year) {
            sql += ' AND year = ?';
            params.push(parseInt(year));
        }

        sql += ' ORDER BY announcement_date DESC';

        const announcements = await query(sql, params);
        return NextResponse.json({ success: true, announcements });
    } catch (error) {
        console.error("GET Procurement Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
