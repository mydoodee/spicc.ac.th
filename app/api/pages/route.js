import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET — ดึงเพจ (รองรับ Pagination)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
        const limit = Math.max(1, parseInt(searchParams.get('limit')) || 15);
        const search = searchParams.get('search') || '';
        const menuId = searchParams.get('menuId') || '';
        const offset = (page - 1) * limit;

        let whereClause = [];
        let params = [];

        if (search) {
            whereClause.push('(p.title LIKE ? OR p.slug LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereSql = whereClause.length > 0 ? ' WHERE ' + whereClause.join(' AND ') : '';

        // NEW: If menuId is present, we filter by the menu and its descendants
        // We use a CTE for recursive menu lookup
        let finalSqlCount, finalSqlData;
        let finalParams = [...params];

        if (menuId) {
            const menuTreeSql = `
                WITH RECURSIVE menu_tree AS (
                    SELECT id FROM cms_menus WHERE id = ?
                    UNION ALL
                    SELECT m.id FROM cms_menus m INNER JOIN menu_tree mt ON m.parent_id = mt.id
                )
            `;

            finalSqlCount = `${menuTreeSql} SELECT COUNT(DISTINCT p.id) as total 
                             FROM cms_pages p 
                             LEFT JOIN cms_menus m ON p.id = m.page_id 
                             WHERE m.id IN (SELECT id FROM menu_tree) 
                             ${search ? ' AND ' + whereClause[0] : ''}`;

            finalSqlData = `${menuTreeSql} SELECT p.id, p.title, p.slug, p.is_published, p.created_at, 
                            GROUP_CONCAT(DISTINCT m.title SEPARATOR ', ') as menu_titles
                            FROM cms_pages p
                            LEFT JOIN cms_menus m ON p.id = m.page_id
                            WHERE m.id IN (SELECT id FROM menu_tree)
                            ${search ? ' AND ' + whereClause[0] : ''}
                            GROUP BY p.id
                            ORDER BY p.created_at DESC 
                            LIMIT ${limit} OFFSET ${offset}`;

            // Need to insert menuId at the beginning for the CTE
            finalParams = [menuId, ...params];
        } else {
            finalSqlCount = `SELECT COUNT(DISTINCT p.id) as total 
                             FROM cms_pages p 
                             LEFT JOIN cms_menus m ON p.id = m.page_id 
                             ${whereSql}`;

            finalSqlData = `SELECT p.id, p.title, p.slug, p.is_published, p.created_at, 
                            GROUP_CONCAT(DISTINCT m.title SEPARATOR ', ') as menu_titles
                            FROM cms_pages p
                            LEFT JOIN cms_menus m ON p.id = m.page_id
                            ${whereSql}
                            GROUP BY p.id
                            ORDER BY p.created_at DESC 
                            LIMIT ${limit} OFFSET ${offset}`;
        }

        const countResult = await query(finalSqlCount, finalParams);
        const totalCount = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        const pages = await query(finalSqlData, finalParams);

        return NextResponse.json({
            success: true,
            pages,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('SERVER ERROR (Get Pages):', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            sqlError: true
        }, { status: 500 });
    }
}

// POST — สร้างเพจใหม่
export async function POST(request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, slug, content, is_published, gallery } = await request.json();

        if (!title || !slug) {
            return NextResponse.json({ error: 'กรุณากรอก title และ slug' }, { status: 400 });
        }

        // Check slug uniqueness
        const existing = await query('SELECT id FROM cms_pages WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'slug นี้ถูกใช้แล้ว' }, { status: 400 });
        }

        const result = await query(
            'INSERT INTO cms_pages (title, slug, content, is_published, gallery) VALUES (?, ?, ?, ?, ?)',
            [title, slug, content || '', is_published ? 1 : 0, gallery || '[]']
        );

        revalidatePath('/');
        revalidatePath('/page/' + slug);

        return NextResponse.json({
            success: true,
            page: { id: result.insertId, title, slug, content, is_published: is_published ? 1 : 0 },
        });
    } catch (error) {
        console.error('Create page error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
