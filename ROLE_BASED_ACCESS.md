# Role-Based Access Control Implementation

## Overview

The Chama Management System has three distinct user roles with separate dashboards and permissions:

1. **Super Admin** - Platform administrator
2. **Chama Admin** - Individual chama administrator
3. **Member** - Regular chama member

## User Roles & Access Levels

### 1. Super Admin (Platform Administrator)

**Access Level:** Platform-wide

**Dashboard:** `/v1/admin` (legacy: `/superadmin` → redirects)

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
- Overview (`/v1/admin`)
- All Chamas (`/v1/admin/chamas`)
- All Users (`/v1/admin/users`)

**UI Theme:** Purple/Indigo

---

### 2. Chama Admin

**Access Level:** Single chama only

**Dashboard:** `/v1/client` (legacy: `/dashboard` → redirects)

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
  - Rotations (`/v1/client/rotations`)
  - Meetings (`/v1/client/meetings`)
  - Fines (`/v1/client/fines`)
  - Welfare (`/v1/client/welfare`)

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

**Dashboard:** `/v2/member` (legacy: `/member` → redirects)

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
- Dashboard (`/v2/member`)
- My Contributions (`/v2/member/contributions`)
- My Loans (`/v2/member/loans`)
- **My Fines** (`/v2/member/fines`) - new
- **Welfare** (`/v2/member/welfare`) - new
- Profile (`/v2/member/profile`)

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

**New Versioned Routes (Current):**

**Super Admin:**
- Can ONLY access `/v1/admin/*` routes
- Redirected from `/v1/client` → `/v1/admin`
- Redirected from `/v2/member` → `/v1/admin`
- Legacy routes (`/superadmin`, `/dashboard`, `/member`) → `/v1/admin`

**Chama Admin:**
- Can ONLY access `/v1/client/*` routes
- Redirected from `/v1/admin` → `/v1/client`
- Redirected from `/v2/member` → `/v1/client`
- Legacy routes (`/dashboard`) → `/v1/client`

**Member:**
- Can ONLY access `/v2/member/*` routes
- Redirected from `/v1/client` → `/v2/member`
- Redirected from `/v1/admin` → `/v2/member`
- Legacy routes (`/member`) → `/v2/member`

**Login Redirect Logic:**
After successful authentication, users are redirected based on role:
```typescript
if (session?.user?.role === 'superadmin') {
  router.push('/v1/admin');
} else if (session?.user?.role === 'admin') {
  router.push('/v1/client');
} else {
  router.push('/v2/member');
}
```

### Layout-Level Protection

Each layout enforces role checks:

```typescript
// Super Admin Layout (/v1/admin/layout.tsx)
if (session.user.role !== 'superadmin') {
  redirect(session.user.role === 'admin' ? '/v1/client' : '/v2/member');
}

// Chama Admin Layout (/v1/client/layout.tsx)
if (session.user.role === 'superadmin') {
  redirect('/v1/admin');
} else if (session.user.role === 'member') {
  redirect('/v2/member');
}

// Member Layout (/v2/member/layout.tsx)
if (session.user.role !== 'member') {
  redirect(session.user.role === 'superadmin' ? '/v1/admin' : '/v1/client');
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
- `GET /api/fines` - Auto-filtered to user's fines (line 30-31)
- `POST /api/fines/[id]/pay` - Pay own fine
- `GET /api/welfare/requests` - Auto-filtered to user's requests (line 25-26)
- `POST /api/welfare/requests` - Submit own request
- `POST /api/loans/[id]/guarantor` - Accept/reject guarantor request

### Shared Endpoints
Read-only access for members, full access for admins with data isolation:

**Contributions API** (`/api/contributions`):
```typescript
if (session.user.role === 'member') {
  query.userId = session.user.id; // Members see only their contributions
} else if (userId) {
  query.userId = userId; // Admins can filter
}
```

**Loans API** (`/api/loans`):
```typescript
if (session.user.role === 'member') {
  query.$or = [
    { userId: session.user.id },
    { 'guarantors.userId': session.user.id } // Include loans they're guaranteeing
  ];
} else if (userId) {
  query.userId = userId; // Admins can filter
}
```

**Meetings & Rotations APIs:**
- `GET /api/meetings` - All can view (read-only for members)
- `GET /api/rotations` - All can view (read-only for members)
- POST operations restricted to admins only

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
✅ Layout-level route protection with versioned routes
✅ API endpoint role validation
✅ **Complete member data isolation** (contributions, loans, fines, welfare)
✅ Data filtering by role at query level
✅ chamaId validation in all queries
✅ Guarantor-aware loan visibility for members
✅ Backward-compatible route redirects

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
- [x] Can access `/v1/client` (new) and `/dashboard` (legacy redirect)
- [x] Cannot access `/v1/admin` or `/v2/member`
- [x] Sees only their chama data
- [x] Has access to all 9 navigation items
- [x] Can perform all CRUD operations
- [x] Cannot access other chamas' data (enforced by chamaId filtering)

### Member:
- [x] Can access `/v2/member` (new) and `/member` (legacy redirect)
- [x] Cannot access `/v1/client` or `/v1/admin`
- [x] **Sees only personal data** (enforced at API level)
- [x] Has access to 6 navigation items
- [x] Sees guarantor requests for their loans
- [x] Can pay fines, submit welfare requests
- [x] **Cannot see other members' details** (data isolation implemented)

---

## Route Migration Guide

**Old Routes → New Routes:**
- `/superadmin` → `/v1/admin`
- `/dashboard` → `/v1/client`
- `/member` → `/v2/member`

**Benefits of Versioned Routes:**
1. **Clear Separation**: Each role has its own versioned namespace
2. **Future-Proof**: Version prefixes allow breaking changes without disrupting existing routes
3. **Better DX**: Explicit naming makes role intentions clear
4. **Scalability**: Easy to add v2/admin or v3/client in future

**Backward Compatibility:**
All legacy routes automatically redirect to new versioned routes. No breaking changes for existing users.

---

## Next Steps

1. **Testing & Validation:**
   - [x] Test member data isolation in browser
   - [x] Verify role-based redirects work correctly
   - [x] Confirm API filtering prevents data leaks
   - [ ] End-to-end testing with real user scenarios

2. **Member-Specific Pages (Future):**
   - `/v2/member/fines` - View and pay fines (already exists)
   - `/v2/member/welfare` - View requests and contribute (already exists)
   - `/v2/member/loans` - Enhanced guarantor workflow

3. **Enhance Super Admin:**
   - User management page
   - Platform reports and analytics
   - Chama activation/deactivation controls

4. **Security Enhancements:**
   - Add audit logging for admin actions
   - Implement rate limiting per role
   - Add two-factor authentication for admins

---

**Status: ✅ Role-based access control FULLY implemented**
**Status: ✅ Member data isolation COMPLETE**
**Status: ✅ Versioned routes deployed**

**Last Updated:** 2025-10-14
