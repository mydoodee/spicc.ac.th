import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        await removeAuthCookie();
        return NextResponse.json({ success: true, message: 'ออกจากระบบแล้ว' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด' },
            { status: 500 }
        );
    }
}
