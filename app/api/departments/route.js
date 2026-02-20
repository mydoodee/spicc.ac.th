import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — Fetch all departments
export async function GET() {
    try {
        const departments = await query('SELECT * FROM cms_departments ORDER BY sort_order ASC, created_at DESC');
        return NextResponse.json({ success: true, departments });
    } catch (error) {
        console.error("GET departments error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST — Create a new department
export async function POST(request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, slug, description, image, icon, color, is_active, sort_order } = await request.json();

        const result = await query(
            'INSERT INTO cms_departments (title, slug, description, image, icon, color, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, description || '', image || null, icon || 'school', color || 'bg-navy', is_active ? 1 : 0, sort_order || 0]
        );

        revalidatePath('/');

        return NextResponse.json({
            success: true,
            department: { id: result.insertId, title, slug, description, image, icon, color, is_active: is_active ? 1 : 0, sort_order: sort_order || 0 }
        });
    } catch (error) {
        console.error("POST department error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
