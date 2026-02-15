import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('Running dedicated migration...');
        const results = [];

        // 1. Check/Add show_on_home
        try {
            const columns = await query(`SHOW COLUMNS FROM cms_courses`);
            const hasShowOnHome = columns.some(col => col.Field === 'show_on_home');
            if (!hasShowOnHome) {
                await query(`ALTER TABLE cms_courses ADD COLUMN show_on_home BOOLEAN DEFAULT false AFTER is_active`);
                results.push('Added show_on_home column');
            } else {
                results.push('show_on_home column already exists');
            }

            const hasIsActive = columns.some(col => col.Field === 'is_active');
            if (!hasIsActive) {
                await query(`ALTER TABLE cms_courses ADD COLUMN is_active BOOLEAN DEFAULT true AFTER sort_order`);
                results.push('Added is_active column');
            } else {
                results.push('is_active column already exists');
            }

            const hasSlug = columns.some(col => col.Field === 'slug');
            if (!hasSlug) {
                await query(`ALTER TABLE cms_courses ADD COLUMN slug VARCHAR(255) AFTER title`);
                results.push('Added slug column');
            } else {
                results.push('slug column already exists');
            }
        } catch (e) {
            console.error('Migration Column Error:', e);
            results.push('Error checking/adding columns: ' + e.message);
        }

        // 2. Check/Create cms_courses_settings table
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS cms_courses_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    courses_title VARCHAR(255),
                    courses_description TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            results.push('Ensured cms_courses_settings table exists');
        } catch (e) {
            results.push('Error creating settings table: ' + e.message);
        }

        // 3. Check/Add course_id to cms_menus
        try {
            const menuColumns = await query(`SHOW COLUMNS FROM cms_menus`);
            const hasCourseId = menuColumns.some(col => col.Field === 'course_id');
            if (!hasCourseId) {
                await query(`ALTER TABLE cms_menus ADD COLUMN course_id INT AFTER page_id`);
                results.push('Added course_id column to cms_menus');
            } else {
                results.push('course_id column already exists in cms_menus');
            }

            const hasNewsId = menuColumns.some(col => col.Field === 'news_id');
            if (!hasNewsId) {
                await query(`ALTER TABLE cms_menus ADD COLUMN news_id INT AFTER course_id`);
                results.push('Added news_id column to cms_menus');
            } else {
                results.push('news_id column already exists in cms_menus');
            }
        } catch (e) {
            results.push('Error updating cms_menus: ' + e.message);
        }

        // 4. Check/Add slug to cms_news
        try {
            const newsColumns = await query(`SHOW COLUMNS FROM cms_news`);
            const hasSlug = newsColumns.some(col => col.Field === 'slug');
            if (!hasSlug) {
                await query(`ALTER TABLE cms_news ADD COLUMN slug VARCHAR(255) AFTER title`);
                results.push('Added slug column to cms_news');
            } else {
                results.push('slug column already exists in cms_news');
            }

            const hasGallery = newsColumns.some(col => col.Field === 'gallery');
            if (!hasGallery) {
                await query(`ALTER TABLE cms_news ADD COLUMN gallery LONGTEXT AFTER description`);
                results.push('Added gallery column to cms_news');
            } else {
                results.push('gallery column already exists in cms_news');
            }
        } catch (e) {
            results.push('Error updating cms_news: ' + e.message);
        }

        // 5. Slug Repair: Ensure all courses/pages/news have slugs
        try {
            const courses = await query(`SELECT id, title, slug FROM cms_courses WHERE slug IS NULL OR slug = ''`);
            for (const course of courses) {
                const autoSlug = (course.title || 'course-' + course.id)
                    .toLowerCase()
                    .replace(/[^a-z0-9ก-ฮ]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                await query(`UPDATE cms_courses SET slug = ? WHERE id = ?`, [autoSlug || ('course-' + course.id), course.id]);
                results.push(`Auto-generated slug for course: ${course.title} -> ${autoSlug}`);
            }

            const pages = await query(`SELECT id, title, slug FROM cms_pages WHERE slug IS NULL OR slug = ''`);
            for (const page of pages) {
                const autoSlug = (page.title || 'page-' + page.id)
                    .toLowerCase()
                    .replace(/[^a-z0-9ก-ฮ]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                await query(`UPDATE cms_pages SET slug = ? WHERE id = ?`, [autoSlug || ('page-' + page.id), page.id]);
                results.push(`Auto-generated slug for page: ${page.title} -> ${autoSlug}`);
            }

            const news = await query(`SELECT id, title, slug FROM cms_news WHERE slug IS NULL OR slug = ''`);
            for (const item of news) {
                const autoSlug = (item.title || 'news-' + item.id)
                    .toLowerCase()
                    .replace(/[^a-z0-9ก-ฮ]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                await query(`UPDATE cms_news SET slug = ? WHERE id = ?`, [autoSlug || ('news-' + item.id), item.id]);
                results.push(`Auto-generated slug for news: ${item.title} -> ${autoSlug}`);
            }
        } catch (e) {
            results.push('Error repairing slugs: ' + e.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Migration process finished',
            details: results
        });

    } catch (error) {
        console.error('Migration Global Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
