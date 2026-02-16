import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch current admin profile
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admins = await query('SELECT id, username, display_name, role FROM admin_users WHERE id = ?', [user.id]);

        if (admins.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile: admins[0] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update admin profile (display name and/or password)
export async function PUT(req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { display_name, current_password, new_password } = await req.json();

        // 1. Fetch current user data from DB
        const admins = await query('SELECT * FROM admin_users WHERE id = ?', [user.id]);
        if (admins.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const admin = admins[0];

        // 2. If password change is requested, verify current password
        let hashedPassword = admin.password;
        if (new_password) {
            if (!current_password) {
                return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านปัจจุบันเพื่อเปลี่ยนรหัสผ่านใหม่' }, { status: 400 });
            }

            const isValid = await verifyPassword(current_password, admin.password);
            if (!isValid) {
                return NextResponse.json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, { status: 400 });
            }

            hashedPassword = await hashPassword(new_password);
        }

        // 3. Update DB
        const newDisplayName = display_name || admin.display_name;
        await query(
            'UPDATE admin_users SET display_name = ?, password = ? WHERE id = ?',
            [newDisplayName, hashedPassword, user.id]
        );

        // 4. Update the auth cookie with new display name
        const token = generateToken({
            id: user.id,
            username: admin.username,
            display_name: newDisplayName,
            role: admin.role,
        });
        await setAuthCookie(token);

        return NextResponse.json({ success: true, message: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
