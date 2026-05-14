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

    const classes = await prisma.class.findMany({
      include: {
        sections: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        level: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error('Get classes error:', error);
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

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        level: parseInt(data.level),
        capacity: parseInt(data.capacity) || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        sections: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newClass,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

