# Deploy to Render.com (No Docker)

## 🚀 Quick Deployment Steps

### 1. Push Your Code
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Render Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:

**Basic Settings:**
- **Name**: `youth-registration-system`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install && npm install jose && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables
Add these in Render dashboard:

**Required:**
- `NODE_ENV` = `production`
- `NEXTAUTH_SECRET` = (auto-generate 32+ char string)
- `JWT_SECRET` = (auto-generate 32+ char string)
- `ENCRYPTION_KEY` = (auto-generate 32+ char string)
- `NEXTAUTH_URL` = `https://your-app-name.onrender.com`

**Database:**
- `DATABASE_URL` = (from Render PostgreSQL database)

### 4. Create Database
1. In Render dashboard: "New +" → "PostgreSQL"
2. **Name**: `youth-registration-db`
3. **Plan**: Free
4. Copy the "External Database URL"
5. Add it as `DATABASE_URL` environment variable

### 5. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Visit your app URL

## 🔐 Login After Deployment

**Super Admin Credentials:**
- **Email**: `admin@mopgomglobal.com`
- **Password**: `SuperAdmin123!`
- **URL**: `https://your-app-name.onrender.com/admin/login`

⚠️ **Change password immediately after first login!**

## 🛠️ Post-Deployment Setup

### Create Admin Account (if needed)
If login doesn't work, run this in Render shell:
```bash
npx tsx scripts/create-super-admin.ts
```

### Seed Default Settings
```bash
npx tsx scripts/seed-settings.ts
```

## 📋 Troubleshooting

### Build Fails?
1. Check build logs in Render dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set

### Database Issues?
1. Confirm DATABASE_URL is correct
2. Check database is running
3. Run migrations manually if needed

### Login Not Working?
1. Create super admin account
2. Check database connection
3. Verify JWT_SECRET is set

## 🔄 Updates & Redeployment

To update your app:
1. Make changes locally
2. Commit and push to GitHub
3. Render auto-deploys from main branch

## 📞 Support

If deployment fails:
1. Check Render build logs
2. Verify all environment variables
3. Ensure database is connected
4. Run admin creation script

Your app should be live at: `https://your-app-name.onrender.com`
