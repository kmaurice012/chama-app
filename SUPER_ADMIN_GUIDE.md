# Super Admin Guide - Chama Manager

## Overview

The Super Admin role is the highest level of access in the Chama Manager platform. Super admins can monitor all chamas, view platform-wide statistics, and manage the entire system.

## Features

### Super Admin Capabilities

1. **Platform Overview Dashboard**
   - View total number of chamas
   - Monitor active/inactive chamas
   - See total users across all chamas
   - Track total contributions platform-wide
   - Monitor total loans disbursed
   - View recently registered chamas

2. **Chama Management**
   - View all chamas on the platform
   - See detailed statistics for each chama:
     - Member count
     - Total savings
     - Total loans
     - Contribution amounts
   - Filter chamas by status (active/inactive)
   - Search chamas by name
   - Activate/deactivate chamas (coming soon)

3. **User Management**
   - View all users across all chamas (coming soon)
   - Manage user accounts
   - Monitor user activity

## How to Create the Super Admin Account

### Step 1: Access the Setup Page

1. Open your browser and go to: http://localhost:3000
2. At the bottom of the page, click on "Platform Administrator Setup"
3. Or directly visit: http://localhost:3000/superadmin-setup

### Step 2: Complete the Setup Form

Fill in the following information:

- **Setup Key**: `CHAMA_SUPER_ADMIN_SETUP_2024`
  - This is a security measure to prevent unauthorized super admin creation
  - In production, change this to a secure environment variable

- **Full Name**: Your full name
- **Email**: Your email address (will be used for login)
- **Phone Number**: Your phone number (Kenyan format: 0712345678)
- **Password**: Choose a secure password (minimum 6 characters)
- **Confirm Password**: Re-enter your password

### Step 3: Submit

Click "Create Super Admin" to create the account.

**Important Notes:**
- Only ONE super admin account can be created
- Once created, the setup page will no longer work
- Keep the setup key secure

## How to Login as Super Admin

1. Go to http://localhost:3000/auth/login
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to http://localhost:3000/superadmin (the super admin dashboard)

## Super Admin Dashboard Structure

### Navigation

The super admin dashboard has a purple/indigo theme (different from regular chama admin green theme) with three main sections:

1. **Overview** (`/superadmin`)
   - Platform-wide statistics
   - Recent activity
   - Quick actions

2. **All Chamas** (`/superadmin/chamas`)
   - Complete list of all chamas
   - Search and filter capabilities
   - Detailed statistics per chama

3. **All Users** (`/superadmin/users`)
   - User management (coming soon)

## Differences Between Super Admin and Chama Admin

| Feature | Super Admin | Chama Admin |
|---------|-------------|-------------|
| Dashboard Color | Purple/Indigo | Green |
| Access Level | All chamas | Single chama only |
| Can Create Members | No (platform oversight) | Yes (for their chama) |
| View All Contributions | Yes (all chamas) | Yes (their chama only) |
| Manage Loans | View only | Full management |
| Platform Statistics | Yes | No |
| Chama Management | Yes | No |

## Security Considerations

### Production Deployment

When deploying to production, make sure to:

1. **Change the Setup Key**
   - Don't use the default `CHAMA_SUPER_ADMIN_SETUP_2024`
   - Store it in an environment variable
   - Update `apps/admin/app/api/superadmin/setup/route.ts`:
     ```typescript
     if (setupKey !== process.env.SUPER_ADMIN_SETUP_KEY) {
       return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
     }
     ```

2. **Disable Setup Route After Creation**
   - Once super admin is created, you can disable the setup endpoint
   - Or add additional checks to prevent duplicate super admins

3. **Use Strong Passwords**
   - Require complex passwords for super admin
   - Consider adding 2FA (Two-Factor Authentication)

4. **Monitor Super Admin Activity**
   - Log all super admin actions
   - Set up alerts for sensitive operations

5. **Limit Super Admin Access**
   - Only trusted personnel should have super admin credentials
   - Create different admin levels if needed

## API Endpoints for Super Admin

### Authentication
- `POST /api/superadmin/setup` - Create super admin (one-time)

### Statistics
- `GET /api/superadmin/stats` - Get platform-wide statistics

### Chama Management
- `GET /api/superadmin/chamas` - Get all chamas with stats
- `PATCH /api/superadmin/chamas/:id` - Update chama status (coming soon)

### User Management
- `GET /api/superadmin/users` - Get all users (coming soon)

## Troubleshooting

### Can't Create Super Admin

**Error: "Super admin already exists"**
- A super admin has already been created
- Contact the existing super admin or check the database

**Error: "Invalid setup key"**
- Make sure you're using the correct setup key
- Default key: `CHAMA_SUPER_ADMIN_SETUP_2024`

### Can't Access Super Admin Dashboard

**Redirected to login page**
- Make sure you're logged in with the super admin account
- Regular chama admins cannot access `/superadmin` routes

**Getting permission errors**
- Verify your user role in the database is set to `superadmin`
- Check MongoDB User collection: `role` field should be `'superadmin'`

## Database Structure

The super admin user in MongoDB looks like this:

```json
{
  "_id": "...",
  "name": "Admin Name",
  "email": "admin@example.com",
  "phone": "0712345678",
  "password": "$2a$10$...", // hashed
  "role": "superadmin",
  "chamaId": null,  // Super admin has no chama
  "isActive": true,
  "dateJoined": "2024-...",
  "createdAt": "2024-...",
  "updatedAt": "2024-..."
}
```

## Future Enhancements

Planned features for super admin:

1. **User Management**
   - View all users
   - Deactivate/activate user accounts
   - Reset user passwords

2. **Chama Actions**
   - Activate/deactivate chamas
   - View detailed chama information
   - Export chama reports

3. **Analytics & Reports**
   - Generate platform-wide reports
   - Export data to CSV/Excel
   - Visual charts and graphs

4. **System Settings**
   - Configure platform-wide settings
   - Set default chama settings
   - Manage notification templates

5. **Audit Logs**
   - View all admin actions
   - Track system changes
   - Monitor suspicious activity

6. **Billing & Subscriptions**
   - Manage chama subscriptions
   - Process payments
   - View revenue reports

## Support

For issues or questions:
- Check the main README.md
- Review SETUP.md for configuration
- Check MongoDB connection if data isn't loading
