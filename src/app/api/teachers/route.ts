import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { verifyToken, hashPassword } from '@/services/auth';

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

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
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
    const { email, password, firstName, lastName, ...teacherData } = data;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'TEACHER',
        phone: data.phone,
        address: data.address,
      },
    });

    // Generate employee ID
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const employeeId = `EMP${year}${random}`;

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId,
        joiningDate: new Date(teacherData.joiningDate),
        qualification: teacherData.qualification,
        experience: teacherData.experience,
        salary: teacherData.salary ? parseFloat(teacherData.salary) : null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: teacher,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

