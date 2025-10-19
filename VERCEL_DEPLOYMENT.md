# Vercel Deployment Guide

This guide will help you deploy the Chama Management System to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works)
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database
3. Your GitHub repository pushed to GitHub (recommended) or use Vercel CLI

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect it as a monorepo

### Step 3: Configure Project Settings

**Framework Preset:** Next.js

**Root Directory:** `apps/admin` (IMPORTANT for monorepo)

**Build Settings:**
- Build Command: `npm run build:admin` (auto-detected from root package.json)
- Output Directory: `.next` (default)
- Install Command: `npm install` (auto-detected)

**Node.js Version:** 18.x or higher

### Step 4: Environment Variables

Add these environment variables in Vercel:

1. Click **"Environment Variables"** in project settings
2. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `NEXTAUTH_SECRET` | Generate using command below | Secret for NextAuth.js |
| `NODE_ENV` | `production` | Environment mode |

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use this online: https://generate-secret.vercel.app/32

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. Visit your deployment URL

### Step 6: Post-Deployment Setup

1. Visit `https://your-app.vercel.app/superadmin-setup`
2. Create your superadmin account
3. Start using your Chama Management System!

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From the project root:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **Project name:** chama-app (or your choice)
- **In which directory is your code located?** ./
- **Want to override settings?** Y
- **Which settings?** Select "Build Command", "Output Directory", "Root Directory"
  - **Root Directory:** `apps/admin`
  - **Build Command:** `npm run build:admin`
  - **Output Directory:** `.next`

### Step 4: Set Environment Variables

```bash
vercel env add MONGODB_URI
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add NODE_ENV
```

For each variable, select environment (production/preview/development) and enter the value.

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## MongoDB Atlas Setup

If you don't have MongoDB Atlas set up:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user (Database Access → Add New Database User)
4. Whitelist Vercel IPs or allow access from anywhere (0.0.0.0/0)
   - Network Access → Add IP Address → Allow Access from Anywhere
5. Get your connection string:
   - Click **"Connect"** → **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `chama-app` or your preferred name

Example:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chama-app?retryWrites=true&w=majority
```

---

## Troubleshooting

### Build Fails with "Module not found"

**Issue:** Monorepo packages not resolved

**Solution:** Ensure `transpilePackages` in `next.config.js` includes:
```javascript
transpilePackages: ['@chama-app/database', '@chama-app/shared']
```

### API Routes Return 500 Errors

**Issue:** Environment variables not set or incorrect

**Solution:**
1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure all required variables are set
3. Redeploy after adding variables

### MongoDB Connection Fails

**Issue:** Network access or wrong connection string

**Solution:**
1. MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0` (allow all)
2. Verify connection string includes password and database name
3. Test connection locally first

### NextAuth Session Issues

**Issue:** NEXTAUTH_URL incorrect or NEXTAUTH_SECRET missing

**Solution:**
1. Set `NEXTAUTH_URL` to your full Vercel URL (e.g., `https://chama-app.vercel.app`)
2. Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
3. Redeploy

### PWA Service Worker Errors

**Issue:** Service worker conflicts in production

**Solution:** PWA is disabled in development by default. In production, clear browser cache and reload.

---

## Performance Optimization

### Enable Edge Runtime (Optional)

For faster API responses, add to API route files:

```typescript
export const runtime = 'edge';
```

### Configure Caching

Vercel automatically caches static assets. For API routes, add cache headers:

```typescript
export async function GET(request: Request) {
  // Your logic
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` to your custom domain

---

## Monitoring & Analytics

### Enable Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Web Analytics (free)
3. Track performance and user behavior

### Enable Error Logging

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for comprehensive monitoring

---

## Continuous Deployment

Once set up via GitHub:
- Every push to `main` branch triggers a production deployment
- Pull requests create preview deployments
- Rollback available in Vercel Dashboard → Deployments

---

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] MongoDB Atlas network access configured
- [ ] Environment variables stored in Vercel (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Security headers configured (already in `next.config.js`)

---

## Cost Estimate

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- 100 GB-hours serverless function execution

**Paid Plans:**
- Pro: $20/month (team features, more bandwidth)
- Enterprise: Custom pricing

**Note:** Most Chama apps will fit comfortably in the free tier.

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Pull environment variables
vercel env pull
```

---

**Your Chama Management System is now ready for production! 🎉**
