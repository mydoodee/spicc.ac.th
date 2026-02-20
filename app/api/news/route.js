import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const result = await query('SELECT * FROM cms_news WHERE slug = ?', [slug]);
      return NextResponse.json({ success: true, news: result[0] });
    }

    const news = await query('SELECT * FROM cms_news ORDER BY created_at DESC');
    return NextResponse.json({ success: true, news });
  } catch (error) {
    console.error("GET News Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, slug, description, gallery, date, category, image, is_featured } = body;

    const result = await query(
      'INSERT INTO cms_news (title, slug, description, gallery, date, category, image, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug || '', description, gallery || '[]', date, category, image, is_featured]
    );

    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Added successfully', id: result.insertId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, slug, description, gallery, date, category, image, is_featured } = body;

    await query(
      'UPDATE cms_news SET title=?, slug=?, description=?, gallery=?, date=?, category=?, image=?, is_featured=? WHERE id=?',
      [title, slug || '', description, gallery || '[]', date, category, image, is_featured, id]
    );

    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    await query('DELETE FROM cms_news WHERE id = ?', [id]);

    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
