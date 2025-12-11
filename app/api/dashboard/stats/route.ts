import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance,
      pendingFees,
      upcomingExams,
    ] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.class.count({ where: { isActive: true } }),
      prisma.attendance.count({
        where: {
          date: { gte: today, lt: tomorrow },
          status: 'PRESENT',
        },
      }),
      prisma.feePayment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.exam.count({
        where: {
          startDate: { gte: today },
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        todayAttendance,
        pendingFees: pendingFees._sum.amount?.toNumber() || 0,
        upcomingExams,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

