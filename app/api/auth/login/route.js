import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอก username และ password' },
                { status: 400 }
            );
        }

        // Find user in database
        const users = await query(
            'SELECT * FROM admin_users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            role: user.role,
        });

        // Set cookie
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในระบบ: ' + error.message },
            { status: 500 }
        );
    }
}
