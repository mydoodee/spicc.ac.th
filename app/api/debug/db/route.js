import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const personnel = await query('SELECT * FROM cms_personnel');
        return NextResponse.json({
            success: true,
            count: personnel.length,
            data: personnel
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
