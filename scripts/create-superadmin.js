const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://byron:%40Byron9614@cluster0.hjoets1.mongodb.net/chama-app?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  chamaId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  dateJoined: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createSuperAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('Super admin already exists:', existing.email);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('@Admin123', 10);

    // Create super admin
    const superAdmin = await User.create({
      name: 'Byron Maurice',
      email: 'kingmaurice012@gmail.com',
      phone: '+254793610447',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      dateJoined: new Date(),
    });

    console.log('✅ Super admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: @Admin123');
    console.log('\nYou can now login at: http://localhost:3000/auth/login');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSuperAdmin();
