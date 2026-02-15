import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT — Update department
export async function PUT(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { title, slug, description, image, icon, color, is_active, sort_order } = await request.json();

        await query(
            'UPDATE cms_departments SET title = ?, slug = ?, description = ?, image = ?, icon = ?, color = ?, is_active = ?, sort_order = ? WHERE id = ?',
            [title, slug, description || '', image || null, icon || 'school', color || 'bg-navy', is_active ? 1 : 0, sort_order || 0, id]
        );

        revalidatePath('/');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT department error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE — Remove department
export async function DELETE(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await query('DELETE FROM cms_departments WHERE id = ?', [id]);

        revalidatePath('/');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE department error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
