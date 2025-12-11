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

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        class: true,
        section: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Get student error:', error);
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
    const { email, password, firstName, lastName, ...studentData } = data;

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
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
      where: { id: student.userId },
      data: userUpdateData,
    });

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        classId: studentData.classId,
        sectionId: studentData.sectionId,
        admissionDate: studentData.admissionDate ? new Date(studentData.admissionDate) : undefined,
        dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
        gender: studentData.gender,
        bloodGroup: studentData.bloodGroup,
        emergencyContact: studentData.emergencyContact,
        previousSchool: studentData.previousSchool,
        isActive: studentData.isActive !== undefined ? studentData.isActive : undefined,
      },
      include: {
        user: true,
        class: true,
        section: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error('Update student error:', error);
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

    const student = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Soft delete - deactivate instead of deleting
    await prisma.student.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Student deactivated successfully',
    });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

