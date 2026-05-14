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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const search = searchParams.get('search');

    const where: any = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
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
        class: true,
        section: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Get students error:', error);
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
    const { email, password, firstName, lastName, ...studentData } = data;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'STUDENT',
        phone: data.phone,
        address: data.address,
      },
    });

    // Generate student ID
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const studentId = `STU${year}${random}`;

    // Create student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId,
        classId: studentData.classId,
        sectionId: studentData.sectionId,
        admissionDate: new Date(studentData.admissionDate),
        dateOfBirth: new Date(studentData.dateOfBirth),
        gender: studentData.gender,
        bloodGroup: studentData.bloodGroup,
        emergencyContact: studentData.emergencyContact,
        previousSchool: studentData.previousSchool,
      },
      include: {
        user: true,
        class: true,
        section: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: student,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

