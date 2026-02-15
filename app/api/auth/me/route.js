import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json(
                { error: 'ไม่ได้เข้าสู่ระบบ' },
                { status: 401 }
            );
        }

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
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด' },
            { status: 500 }
        );
    }
}
