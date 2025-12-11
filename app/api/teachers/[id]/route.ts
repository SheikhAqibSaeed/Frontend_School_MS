import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Update user
    const userUpdateData: any = {
      firstName,
      lastName,
      phone: data.phone,
      address: data.address,
    };
    if (email) userUpdateData.email = email;
    if (password) userUpdateData.password = await hashPassword(password);

    await prisma.user.update({
      where: { id: teacher.userId },
      data: userUpdateData,
    });

    // Update teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        joiningDate: teacherData.joiningDate ? new Date(teacherData.joiningDate) : undefined,
        qualification: teacherData.qualification,
        experience: teacherData.experience,
        salary: teacherData.salary ? parseFloat(teacherData.salary) : undefined,
        isActive: teacherData.isActive !== undefined ? teacherData.isActive : undefined,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTeacher,
    });
  } catch (error: any) {
    console.error('Update teacher error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.teacher.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher deactivated successfully',
    });
  } catch (error: any) {
    console.error('Delete teacher error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

