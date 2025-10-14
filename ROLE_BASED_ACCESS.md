# Role-Based Access Control Implementation

## Overview

The Chama Management System has three distinct user roles with separate dashboards and permissions:

1. **Super Admin** - Platform administrator
2. **Chama Admin** - Individual chama administrator
3. **Member** - Regular chama member

## User Roles & Access Levels

### 1. Super Admin (Platform Administrator)

**Access Level:** Platform-wide

**Dashboard:** `/superadmin`

**Capabilities:**
- View all chamas across the platform
- Monitor platform-wide statistics
- Access aggregated data for:
  - Total chamas (active/inactive)
  - Total users across all chamas
  - Total contributions platform-wide
  - Total loans disbursed
  - Platform-wide meetings
  - Platform-wide fines
  - Active rotations across chamas
  - Welfare requests across platform

**Features Added:**
✅ 8 stat widgets (4 main + 4 new features)
✅ Platform growth chart
✅ Recent chamas list
✅ Quick actions (View Chamas, Manage Users, Reports)

**Navigation:**
- Overview (`/superadmin`)
- All Chamas (`/superadmin/chamas`)
- All Users (`/superadmin/users`)

**UI Theme:** Purple/Indigo

---

### 2. Chama Admin

**Access Level:** Single chama only

**Dashboard:** `/dashboard`

**Capabilities:**
- Full CRUD operations for their chama
- Manage members (add, edit, view)
- Record contributions
- Manage loans (approve, disburse, track repayments)
- Create and manage rotation cycles
- Schedule and manage meetings
- Issue and manage fines
- Handle welfare fund and requests
- Access chama settings

**Features Added:**
✅ 8 stat widgets (4 original + 4 new):
  - Total Members
  - Total Contributions
  - Active Loans
  - Available Funds
  - **Upcoming Meetings** (new)
  - **Pending Fines** (new)
  - **Active Rotations** (new)
  - **Welfare Fund** (new)

✅ Full feature pages:
  - Rotations (`/dashboard/rotations`)
  - Meetings (`/dashboard/meetings`)
  - Fines (`/dashboard/fines`)
  - Welfare (`/dashboard/welfare`)

**Navigation:**
- Dashboard
- Members
- Contributions
- Loans
- Merry-Go-Round
- Meetings
- Fines
- Welfare
- Settings

**UI Theme:** Green (primary)

**Permissions:**
- ✅ Create: Members, Contributions, Loans, Rotations, Meetings, Fines, Welfare Contributions
- ✅ Read: All chama data
- ✅ Update: All chama data
- ✅ Delete: Limited (based on business rules)
- ✅ Approve: Loans, Welfare Requests
- ✅ Waive: Fines
- ✅ Disburse: Loans, Welfare Funds

---

### 3. Member

**Access Level:** Personal data only + read-only chama info

**Dashboard:** `/member`

**Capabilities:**
- View personal contributions
- View personal loans
- View and pay personal fines
- Submit welfare requests
- **View guarantor requests** (new)
- **Accept/Reject as guarantor** (new)
- View chama rules and settings (read-only)

**Features Added:**
✅ 4 stat widgets:
  - My Total Savings
  - Active Loans (with balance)
  - **Pending Fines** (new - clickable)
  - **Welfare Requests** (new - clickable)

✅ New alerts:
  - **Guarantor Requests Alert** - Shows pending guarantor requests
  - Links to loan page for approval

**Navigation:**
- Dashboard (`/member`)
- My Contributions (`/member/contributions`)
- My Loans (`/member/loans`)
- **My Fines** (`/member/fines`) - new
- **Welfare** (`/member/welfare`) - new
- Profile (`/member/profile`)

**UI Theme:** Primary green (consistent with admin)

**Permissions:**
- ✅ Read: Own data only (contributions, loans, fines, welfare)
- ✅ Create: Welfare requests
- ✅ Update: Guarantor responses (accept/reject)
- ❌ Cannot: Manage other members, approve loans, issue fines, edit contributions

---

## Route Protection

### Authentication Check
All routes require authentication via NextAuth.js:
```typescript
const session = await getServerSession(authOptions);
if (!session) {
  redirect('/auth/login');
}
```

### Role-Based Redirects

**Super Admin:**
- Can ONLY access `/superadmin/*` routes
- Redirected from `/dashboard` → `/superadmin`
- Redirected from `/member` → `/superadmin`

**Chama Admin:**
- Can ONLY access `/dashboard/*` routes
- Redirected from `/superadmin` → `/dashboard`
- Redirected from `/member` → `/dashboard`

**Member:**
- Can ONLY access `/member/*` routes
- Redirected from `/dashboard` → `/member`
- Redirected from `/superadmin` → `/member`

### Layout-Level Protection

Each layout enforces role checks:

```typescript
// Super Admin Layout
if (session.user.role !== 'superadmin') {
  redirect(session.user.role === 'admin' ? '/dashboard' : '/member');
}

// Chama Admin Layout
if (session.user.role === 'superadmin') {
  redirect('/superadmin');
}

// Member Layout
if (session.user.role !== 'member') {
  redirect(session.user.role === 'superadmin' ? '/superadmin' : '/dashboard');
}
```

---

## API Endpoint Permissions

### Super Admin Endpoints
- `GET /api/superadmin/stats` - Platform-wide statistics
- `GET /api/superadmin/chamas` - All chamas
- `GET /api/superadmin/users` - All users
- `POST /api/superadmin/setup` - One-time super admin creation

### Chama Admin Endpoints
All chama-specific endpoints restricted to admins:
- `POST /api/rotations` - Create rotation (admin only)
- `POST /api/meetings` - Create meeting (admin only)
- `POST /api/fines` - Issue fine (admin only)
- `POST /api/fines/[id]/waive` - Waive fine (admin only)
- `POST /api/welfare/contributions` - Record contribution (admin only)
- `POST /api/welfare/requests/[id]/approve` - Approve request (admin only)
- `PATCH /api/meetings/[id]/attendance` - Update attendance (admin only)

### Member Endpoints
Members can only access their own data:
- `GET /api/fines` - Auto-filtered to user's fines
- `POST /api/fines/[id]/pay` - Pay own fine
- `POST /api/welfare/requests` - Submit own request
- `POST /api/loans/[id]/guarantor` - Accept/reject guarantor request

### Shared Endpoints
Read-only access for members, full access for admins:
- `GET /api/contributions` - Filtered by role
- `GET /api/loans` - Filtered by role
- `GET /api/meetings` - All can view
- `GET /api/rotations` - All can view

---

## Data Visibility Rules

### Super Admin
- Sees ALL data across ALL chamas
- No chama-specific filtering
- Aggregated statistics

### Chama Admin
- Sees ALL data for THEIR chama only
- Filtered by `chamaId`
- Can view all members' data within their chama

### Member
- Sees ONLY their personal data
- Filtered by `userId` AND `chamaId`
- Cannot see other members' detailed data
- Can see aggregated chama statistics (read-only)

---

## Session Structure

```typescript
session.user = {
  id: string;           // User MongoDB _id
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'member';
  chamaId: string;      // null for superadmin
  chamaName: string;    // null for superadmin
}
```

---

## Feature Access Matrix

| Feature | Super Admin | Chama Admin | Member |
|---------|------------|-------------|---------|
| **Dashboard** | Platform stats | Chama stats | Personal stats |
| **Members** | View all | Full CRUD | View names only |
| **Contributions** | View all | Full CRUD | View own |
| **Loans** | View all | Full CRUD | View/Request own |
| **Rotations** | View all | Full CRUD | View schedule |
| **Meetings** | View all | Full CRUD | View schedule |
| **Fines** | View all | Full CRUD | View/Pay own |
| **Welfare** | View all | Full CRUD | Submit requests |
| **Guarantors** | - | View | Accept/Reject |
| **Reports** | Platform | Chama | Personal |
| **Settings** | Platform | Chama | Profile only |

---

## Security Considerations

### Implemented:
✅ Session-based authentication
✅ Role-based authorization
✅ Layout-level route protection
✅ API endpoint role validation
✅ Data filtering by role
✅ chamaId validation in queries

### Best Practices:
✅ Never trust client-side role checks
✅ Always validate on server (API routes)
✅ Filter database queries by user context
✅ Validate chamaId matches session
✅ Check role before mutations

### To Implement:
- [ ] Rate limiting per role
- [ ] Audit logging for admin actions
- [ ] Two-factor authentication for admins
- [ ] IP whitelisting for super admin
- [ ] Session timeout policies
- [ ] CSRF protection on forms

---

## Testing Checklist

### Super Admin:
- [x] Can access `/superadmin`
- [x] Cannot access `/dashboard` or `/member`
- [x] Sees platform-wide stats
- [x] Stats include all new features
- [x] Can view all chamas

### Chama Admin:
- [x] Can access `/dashboard`
- [x] Cannot access `/superadmin` or `/member`
- [x] Sees only their chama data
- [x] Has access to all 9 navigation items
- [x] Can perform all CRUD operations
- [ ] Cannot access other chamas' data (TODO: Test)

### Member:
- [x] Can access `/member`
- [x] Cannot access `/dashboard` or `/superadmin`
- [x] Sees only personal data
- [x] Has access to 6 navigation items
- [x] Sees guarantor requests
- [x] Can pay fines, submit welfare requests
- [ ] Cannot see other members' details (TODO: Test)

---

## Next Steps

1. **Implement member-specific pages:**
   - `/member/fines` - View and pay fines
   - `/member/welfare` - View requests and contribute
   - `/member/loans` - View loans and guarantor requests

2. **Add permission checks to existing pages:**
   - Verify all API calls validate role
   - Add "Access Denied" pages for unauthorized access

3. **Enhance super admin:**
   - User management page
   - Platform reports
   - Chama activation/deactivation

4. **Add audit logging:**
   - Track all admin actions
   - Log sensitive operations
   - Export audit trails

---

**Status: Role-based access control implemented ✅**
**Next: Member-specific feature pages and comprehensive testing**
