# Testing Guide - Chama Management System

## Quick Start

### Prerequisites
1. **MongoDB** - Ensure MongoDB is running locally or have a connection string
2. **Node.js** - v18 or higher
3. **Environment Variables** - Configure `.env` file

### Environment Setup

Create a `.env` file in `apps/admin/` with:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chama-app

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Optional: NextAuth Debug (useful for development)
NEXTAUTH_DEBUG=true
```

### Starting the Application

```bash
# From project root
npm run dev:admin

# Or from apps/admin directory
cd apps/admin
npm run dev
```

The application will start on `http://localhost:3000`

---

## Fixing the Webpack Error

If you see the error: `__webpack_require__.n is not a function`

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Clear the Next.js cache:
   ```bash
   cd apps/admin
   rm -rf .next
   ```
3. Restart the dev server:
   ```bash
   npm run dev
   ```

This error is related to Next.js 15 hot reload and should be resolved after clearing the cache.

---

## Testing Scenarios

### 1. Super Admin Testing

**Setup:**
First, create a super admin account:

```bash
# Navigate to http://localhost:3000/superadmin-setup
# Or use the API directly
curl -X POST http://localhost:3000/api/superadmin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "superadmin@chama.com",
    "password": "SecurePassword123!"
  }'
```

**Login:**
- Email: `superadmin@chama.com`
- Password: `SecurePassword123!`

**Expected Behavior:**
- ✅ Redirects to `/v1/admin` after login
- ✅ Can see platform-wide statistics
- ✅ Can view all chamas
- ✅ Cannot access `/v1/client` or `/v2/member`

**Test Routes:**
- `/v1/admin` - Dashboard with platform stats
- `/v1/admin/chamas` - All chamas list
- `/v1/admin/users` - All users (if implemented)

---

### 2. Chama Admin Testing

**Setup:**
Create a chama and admin user through registration:

```bash
# Navigate to http://localhost:3000/auth/register
# Fill in the form with:
# - Name: Test Admin
# - Email: admin@testchama.com
# - Password: TestPassword123!
# - Role: Admin
# - Chama details
```

**Login:**
- Email: `admin@testchama.com`
- Password: `TestPassword123!`

**Expected Behavior:**
- ✅ Redirects to `/v1/client` after login
- ✅ Can see only their chama's data
- ✅ Has access to all 9 navigation items
- ✅ Cannot access `/v1/admin` or `/v2/member`

**Test Routes:**
- `/v1/client` - Chama dashboard
- `/v1/client/members` - Manage members
- `/v1/client/contributions` - View/record contributions
- `/v1/client/loans` - Manage loans
- `/v1/client/rotations` - Merry-go-round cycles
- `/v1/client/meetings` - Schedule meetings
- `/v1/client/fines` - Issue/manage fines
- `/v1/client/welfare` - Welfare fund management
- `/v1/client/settings` - Chama settings

**Test Data Isolation:**
1. Create multiple members in your chama
2. Record contributions for different members
3. Create loans for different members
4. Verify admins can see all member data

---

### 3. Member Testing

**Setup:**
Create a member account (requires existing chama):

```bash
# As a chama admin, add a new member
# Or register directly with role: Member
```

**Login:**
- Email: `member@testchama.com`
- Password: `MemberPassword123!`

**Expected Behavior:**
- ✅ Redirects to `/v2/member` after login
- ✅ Can see ONLY their own data
- ✅ Cannot see other members' contributions, loans, or fines
- ✅ Cannot access `/v1/admin` or `/v1/client`

**Test Routes:**
- `/v2/member` - Personal dashboard
- `/v2/member/contributions` - Own contributions only
- `/v2/member/loans` - Own loans + guarantor requests
- `/v2/member/fines` - Own fines only
- `/v2/member/welfare` - Own welfare requests
- `/v2/member/profile` - Personal profile

**Test Data Isolation:**
1. Login as Member A
2. Note the data visible (contributions, loans, fines)
3. Logout and login as Member B
4. ✅ Verify Member B cannot see Member A's data
5. ✅ Verify API calls return only member-specific data

---

## API Testing

### Test Member Data Isolation

**1. Contributions API:**
```bash
# As Member
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/contributions

# Should only return member's own contributions
```

**2. Loans API:**
```bash
# As Member
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/loans

# Should return:
# - Loans where userId = member
# - Loans where member is a guarantor
```

**3. Fines API:**
```bash
# As Member
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/fines

# Should only return member's own fines
```

**4. Welfare API:**
```bash
# As Member
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/welfare/requests

# Should only return member's own welfare requests
```

---

## Verifying Role-Based Redirects

### Test Redirect Logic:

1. **As Super Admin:**
   - Try accessing `/v1/client` → Should redirect to `/v1/admin`
   - Try accessing `/v2/member` → Should redirect to `/v1/admin`
   - Try accessing `/dashboard` → Should redirect to `/v1/admin`

2. **As Chama Admin:**
   - Try accessing `/v1/admin` → Should redirect to `/v1/client`
   - Try accessing `/v2/member` → Should redirect to `/v1/client`
   - Try accessing `/member` → Should redirect to `/v1/client`

3. **As Member:**
   - Try accessing `/v1/admin` → Should redirect to `/v2/member`
   - Try accessing `/v1/client` → Should redirect to `/v2/member`
   - Try accessing `/dashboard` → Should redirect to `/v2/member`

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running: `mongod` or start MongoDB service
- Check `MONGODB_URI` in `.env` file
- Verify connection string is correct

### Issue: "Session not found" or login redirects back
**Solution:**
- Check `NEXTAUTH_SECRET` is set in `.env`
- Clear browser cookies and try again
- Verify `NEXTAUTH_URL` matches your dev URL

### Issue: "Module not found" errors
**Solution:**
- Run `npm install` from project root
- Ensure workspace dependencies are installed
- Try deleting `node_modules` and reinstalling

### Issue: Webpack hot reload errors
**Solution:**
- Clear Next.js cache: `rm -rf apps/admin/.next`
- Restart dev server
- If persistent, try hard refresh (Ctrl+Shift+R)

---

## Success Criteria

### ✅ All tests pass if:

1. **Authentication:**
   - All three roles can login successfully
   - Redirects work correctly based on role

2. **Data Isolation:**
   - Members can only see their own data
   - Admins can see all chama data
   - Super admins see platform-wide data

3. **Navigation:**
   - All navigation links work correctly
   - Role-based menus display properly
   - No 404 errors on valid routes

4. **API Security:**
   - Members cannot access other members' data via API
   - Admin-only endpoints reject member requests
   - All endpoints validate chamaId

5. **Build:**
   - Application builds without errors
   - No TypeScript errors
   - All routes generate successfully

---

## Performance Testing

### Load Testing (Optional)
```bash
# Install k6 or use Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/contributions
```

### Check Bundle Size
```bash
cd apps/admin
npm run build

# Check the output for route sizes
# Ensure no routes are excessively large (>500kB)
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Environment variables configured for production
- [ ] MongoDB connection secured (use MongoDB Atlas or secured instance)
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] Build succeeds: `npm run build:admin`
- [ ] No console errors in production build
- [ ] SSL/HTTPS configured
- [ ] CORS settings reviewed (if needed)

---

## Next Steps After Testing

1. **Create Seed Data Script** - Populate test chamas, members, and transactions
2. **Add E2E Tests** - Use Playwright or Cypress
3. **Performance Optimization** - Implement caching where appropriate
4. **Mobile Responsiveness** - Test on mobile devices
5. **Accessibility** - Run accessibility audits

---

**Last Updated:** 2025-10-14
**Version:** 1.0.0
**Status:** Ready for Testing ✅
