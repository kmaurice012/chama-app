import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, User, Contribution, Loan, Chama } from '@chama-app/database';
import bcrypt from 'bcryptjs';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// Helper to parse CSV
function parseCSV(text: string): string[][] {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    // Simple CSV parser (handles basic cases)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
}

// Import members
async function importMembers(
  rows: string[][],
  chamaId: string,
  adminId: string
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, errors: [] };
  const headers = rows[0].map(h => h.toLowerCase().trim());

  // Validate headers
  const requiredHeaders = ['name', 'email', 'phone'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    result.errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    result.failed = rows.length - 1;
    return result;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows

    try {
      const data: any = {};
      headers.forEach((header, index) => {
        data[header] = row[index]?.trim() || '';
      });

      // Validate required fields
      if (!data.name || !data.email || !data.phone) {
        throw new Error(`Row ${i + 1}: Missing required fields (name, email, or phone)`);
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw new Error(`Row ${i + 1}: User with email ${data.email} already exists`);
      }

      // Generate default password (they should change it)
      const defaultPassword = 'Chama@123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create user
      await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role || 'member',
        chamaId,
        nationalId: data['national id'] || data.nationalid || undefined,
        address: data.address || undefined,
        isActive: true,
      });

      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push(error.message);
    }
  }

  return result;
}

// Import contributions
async function importContributions(
  rows: string[][],
  chamaId: string,
  adminId: string
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, errors: [] };
  const headers = rows[0].map(h => h.toLowerCase().trim().replace(/\s+/g, ''));

  // Validate headers
  const requiredHeaders = ['memberemail', 'amount', 'month', 'year'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    result.errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    result.failed = rows.length - 1;
    return result;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(cell => !cell)) continue;

    try {
      const data: any = {};
      headers.forEach((header, index) => {
        data[header] = row[index]?.trim() || '';
      });

      // Validate required fields
      if (!data.memberemail || !data.amount || !data.month || !data.year) {
        throw new Error(`Row ${i + 1}: Missing required fields`);
      }

      // Find user
      const user = await User.findOne({ email: data.memberemail, chamaId });
      if (!user) {
        throw new Error(`Row ${i + 1}: Member with email ${data.memberemail} not found`);
      }

      // Check if contribution already exists
      const existing = await Contribution.findOne({
        chamaId,
        userId: user._id,
        month: parseInt(data.month),
        year: parseInt(data.year),
      });

      if (existing) {
        throw new Error(
          `Row ${i + 1}: Contribution for ${data.memberemail} for ${data.month}/${data.year} already exists`
        );
      }

      // Create contribution
      await Contribution.create({
        chamaId: chamaId as any,
        userId: user._id,
        amount: parseFloat(data.amount),
        month: parseInt(data.month),
        year: parseInt(data.year),
        paymentDate: data.paymentdate ? new Date(data.paymentdate) : new Date(),
        paymentMethod: data.paymentmethod?.toLowerCase() || 'cash',
        transactionRef: data.transactionref || undefined,
        status: data.status?.toLowerCase() || 'paid',
        notes: data.notes || undefined,
        recordedBy: adminId,
      });

      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push(error.message);
    }
  }

  return result;
}

// Import loans
async function importLoans(
  rows: string[][],
  chamaId: string,
  adminId: string
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, errors: [] };
  const headers = rows[0].map(h => h.toLowerCase().trim().replace(/\s+/g, ''));

  // Validate headers
  const requiredHeaders = ['memberemail', 'amount', 'purpose'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    result.errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    result.failed = rows.length - 1;
    return result;
  }

  // Get chama for interest rate
  const chama = await Chama.findById(chamaId);
  if (!chama) {
    result.errors.push('Chama not found');
    result.failed = rows.length - 1;
    return result;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(cell => !cell)) continue;

    try {
      const data: any = {};
      headers.forEach((header, index) => {
        data[header] = row[index]?.trim() || '';
      });

      // Validate required fields
      if (!data.memberemail || !data.amount || !data.purpose) {
        throw new Error(`Row ${i + 1}: Missing required fields`);
      }

      // Find user
      const user = await User.findOne({ email: data.memberemail, chamaId });
      if (!user) {
        throw new Error(`Row ${i + 1}: Member with email ${data.memberemail} not found`);
      }

      // Calculate loan details
      const amount = parseFloat(data.amount);
      const interestRate = data.interestrate
        ? parseFloat(data.interestrate)
        : chama.loanInterestRate;
      const interestAmount = (amount * interestRate) / 100;
      const totalAmount = amount + interestAmount;

      // Create loan
      const loan = await Loan.create({
        chamaId,
        userId: user._id,
        amount,
        interestRate,
        totalAmount,
        purpose: data.purpose,
        dueDate: data.duedate ? new Date(data.duedate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days
        balance: totalAmount,
        status: data.status?.toLowerCase() || 'pending',
        requestDate: new Date(),
        notes: data.notes || undefined,
      });

      // If loan is disbursed, update approval details
      if (loan.status === 'disbursed' || loan.status === 'approved') {
        loan.approvedBy = adminId as any;
        loan.approvalDate = new Date();
        if (loan.status === 'disbursed') {
          loan.disbursementDate = new Date();
        }
        await loan.save();
      }

      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push(error.message);
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === 'member') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['members', 'contributions', 'loans'].includes(type)) {
      return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
    }

    // Read CSV file
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain at least a header row and one data row' },
        { status: 400 }
      );
    }

    let result: ImportResult;

    // Process based on type
    switch (type) {
      case 'members':
        result = await importMembers(rows, session.user.chamaId, session.user.id);
        break;
      case 'contributions':
        result = await importContributions(rows, session.user.chamaId, session.user.id);
        break;
      case 'loans':
        result = await importLoans(rows, session.user.chamaId, session.user.id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
