import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { connectDB, User, Chama } from '@chama-app/database';

// GET all members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const members = await User.find({
      chamaId: session.user.chamaId,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error: any) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, password, nationalId } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone and password are required' },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create member
    const member = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      nationalId,
      role: 'member',
      chamaId: session.user.chamaId,
      isActive: true,
    });

    // Update chama member count
    await Chama.findByIdAndUpdate(session.user.chamaId, {
      $inc: { totalMembers: 1 },
    });

    return NextResponse.json(
      {
        message: 'Member created successfully',
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
