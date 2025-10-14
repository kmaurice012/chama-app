import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB, User, Chama } from '@chama-app/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chamaName, name, email, phone, password } = body;

    // Validate required fields
    if (!chamaName || !name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Create chama with default contribution amount of 1000 KES
    const chama = await Chama.create({
      name: chamaName,
      contributionAmount: 1000, // Default amount, can be changed later in settings
      contributionFrequency: 'monthly',
      totalMembers: 1,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'admin',
      chamaId: chama._id,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
