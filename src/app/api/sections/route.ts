import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { verifyToken } from '@/services/auth';

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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const where: any = {};
    if (classId) where.classId = classId;

    const sections = await prisma.section.findMany({
      where,
      include: {
        class: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('Get sections error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'PRINCIPAL')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const newSection = await prisma.section.create({
      data: {
        name: data.name,
        classId: data.classId,
        capacity: parseInt(data.capacity) || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newSection,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create section error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

