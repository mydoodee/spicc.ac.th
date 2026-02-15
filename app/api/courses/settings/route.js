import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const result = await query('SELECT * FROM cms_courses_settings LIMIT 1');
        return NextResponse.json({ success: true, settings: result[0] || {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { courses_title, courses_description } = body;

        const existing = await query('SELECT id FROM cms_courses_settings LIMIT 1');

        if (existing.length > 0) {
            await query(
                'UPDATE cms_courses_settings SET courses_title=?, courses_description=? WHERE id=?',
                [courses_title, courses_description, existing[0].id]
            );
        } else {
            await query(
                'INSERT INTO cms_courses_settings (courses_title, courses_description) VALUES (?, ?)',
                [courses_title, courses_description]
            );
        }

        revalidatePath('/');
        revalidatePath('/courses');
        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
