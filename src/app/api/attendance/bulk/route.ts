import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { verifyToken } from '@/services/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { attendances } = await request.json();

    if (!Array.isArray(attendances) || attendances.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid attendances data' },
        { status: 400 }
      );
    }

    const createdAttendances = await prisma.attendance.createMany({
      data: attendances.map((att: any) => ({
        studentId: att.studentId,
        date: new Date(att.date),
        status: att.status,
        remarks: att.remarks,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      data: { count: createdAttendances.count },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Bulk create attendance error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

