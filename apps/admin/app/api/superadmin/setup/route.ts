import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB, User } from '@chama-app/database';

// POST - Create super admin (one-time setup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, setupKey } = body;

    // Secret key to prevent unauthorized super admin creation
    // In production, use environment variable
    if (setupKey !== 'CHAMA_SUPER_ADMIN_SETUP_2024') {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'Super admin already exists' },
        { status: 400 }
      );
    }

    // Check if email/phone already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const superAdmin = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Super admin created successfully',
        user: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: superAdmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Super admin setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
