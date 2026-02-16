import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await query("SELECT * FROM cms_home_slider LIMIT 1");
        const items = await query("SELECT * FROM cms_home_slider_items ORDER BY order_index ASC");

        return NextResponse.json({
            success: true,
            settings: settings.length > 0 ? settings[0] : {
                is_enabled: 1,
                transition_style: 'carousel',
                autoplay_speed: 5000,
                show_arrows: 1,
                show_pagination: 1
            },
            items: items
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { image_url, title, subtitle, link_url, link_target, order_index } = data;

        const result = await query(
            "INSERT INTO cms_home_slider_items (image_url, title, subtitle, link_url, link_target, order_index) VALUES (?, ?, ?, ?, ?, ?)",
            [image_url, title, subtitle, link_url, link_target || '_self', order_index || 0]
        );

        revalidatePath('/');
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const data = await request.json();
        const { settings, items } = data;

        // Update settings
        if (settings) {
            await query(
                "UPDATE cms_home_slider SET is_enabled = ?, transition_style = ?, autoplay_speed = ?, show_arrows = ?, show_pagination = ? WHERE id = (SELECT id FROM (SELECT id FROM cms_home_slider LIMIT 1) as t)",
                [
                    settings.is_enabled ? 1 : 0,
                    settings.transition_style,
                    settings.autoplay_speed,
                    settings.show_arrows ? 1 : 0,
                    settings.show_pagination ? 1 : 0
                ]
            );
        }

        // Update items if provided (usually for reordering or bulk updates)
        if (items && Array.isArray(items)) {
            for (const item of items) {
                if (item.id) {
                    await query(
                        "UPDATE cms_home_slider_items SET image_url = ?, title = ?, subtitle = ?, link_url = ?, link_target = ?, order_index = ? WHERE id = ?",
                        [item.image_url, item.title, item.subtitle, item.link_url, item.link_target, item.order_index, item.id]
                    );
                }
            }
        }

        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
        }

        await query("DELETE FROM cms_home_slider_items WHERE id = ?", [id]);
        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
