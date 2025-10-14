# Chama Manager - Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works fine)
- npm or yarn package manager

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (choose the free tier)
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Create a username and password (save these!)
4. Whitelist your IP address:
   - Go to Network Access → Add IP Address
   - For development, you can add `0.0.0.0/0` (allows access from anywhere)
5. Get your connection string:
   - Go to your cluster → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password

## Step 2: Install Dependencies

Open your terminal in the `chama-app` directory and run:

```bash
npm install
```

This will install all dependencies for all workspaces (admin app, database package, etc.)

## Step 3: Configure Environment Variables

1. Navigate to the admin app directory:
   ```bash
   cd apps/admin
   ```

2. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your actual values:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_here
   NODE_ENV=development
   ```

4. Generate a NEXTAUTH_SECRET:
   ```bash
   # On Linux/Mac
   openssl rand -base64 32

   # Or use any random string generator online
   ```

## Step 4: Run the Admin Dashboard

From the root `chama-app` directory:

```bash
npm run dev:admin
```

The admin dashboard will be available at http://localhost:3000

## Step 5: Register Your First Chama

1. Open your browser and go to http://localhost:3000
2. Click "Register here"
3. Fill in the registration form:
   - Chama Name (e.g., "Bidii Savings Group")
   - Your Name
   - Email
   - Phone Number (Kenyan format: 0712345678)
   - Monthly Contribution Amount (e.g., 1000)
   - Password

4. After registration, you'll be redirected to login
5. Login with your email and password

## Step 6: Start Using the System

Once logged in, you can:

1. **Add Members**: Go to Members → Add Member
2. **Record Contributions**: Go to Contributions → Record Contribution
3. **Manage Loans**: Go to Loans → New Loan Request
4. **View Dashboard**: See overview of your chama's finances

## Features

### Member Management
- Add new members with email, phone, and national ID
- View all active members
- Search and filter members

### Contribution Tracking
- Record monthly contributions for each member
- Filter by month and year
- Multiple payment methods (M-Pesa, Cash, Bank)
- View total contributions

### Loan Management
- Create loan requests
- Approve/reject loan requests (admin only)
- Disburse approved loans
- Record loan repayments
- Track loan balances
- Automatic interest calculation based on chama settings

### Dashboard
- View total members count
- See total contributions
- Monitor active loans
- Track available funds
- View chama settings

## Troubleshooting

### Connection Issues

If you get a MongoDB connection error:
1. Check your MongoDB URI is correct in `.env`
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify your database user credentials

### Build Errors

If you get TypeScript or build errors:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill

# Or change the port in package.json
"dev": "next dev -p 3001"
```

## Default Chama Settings

When you create a chama, these are the default settings:
- **Loan Interest Rate**: 10%
- **Max Loan Multiplier**: 3x (members can borrow up to 3x their contributions)
- **Late Payment Fee**: KES 100
- **Contribution Frequency**: Monthly

These can be modified in the database or through future admin settings.

## Next Steps

### Mobile App Development
The React Native mobile app is not yet initialized. To add it:
1. Create the Expo app in `apps/mobile`
2. Connect it to the same backend APIs
3. Members can use the mobile app while admins use the web dashboard

### Production Deployment

For production deployment:
1. Deploy the Next.js app to Vercel or similar platform
2. Use MongoDB Atlas production cluster
3. Set proper environment variables
4. Enable proper authentication security
5. Consider adding M-Pesa integration for automated payments

## Support

For issues or questions:
- Check the GitHub issues
- Review MongoDB Atlas documentation
- Next.js documentation: https://nextjs.org/docs

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for database users
- In production, restrict IP whitelist to your server IPs only
- Regularly backup your MongoDB database
- Use HTTPS in production
