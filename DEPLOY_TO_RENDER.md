# 🚀 Deploy to Render.com - Simple Steps

## Prerequisites
- GitHub account
- Render.com account (free)
- Your project pushed to GitHub

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

## Step 3: Deploy Database
1. Click "New +" → "PostgreSQL"
2. Name: `youth-registration-db`
3. Database: `youth_registration`
4. User: `youth_user`
5. Plan: **Free**
6. Click "Create Database"
7. **Copy the External Database URL** (you'll need this)

## Step 4: Deploy Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `youth-registration-system`
   - **Environment**: `Node`
   - **Plan**: **Free**
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`

## Step 5: Add Environment Variables
In the web service settings, add these environment variables:

### Required Variables:
```
NODE_ENV=production
DATABASE_URL=[paste the database URL from step 3]
NEXTAUTH_SECRET=[generate random 32-character string]
NEXTAUTH_URL=https://youth-registration-system.onrender.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!
JWT_SECRET=[generate random 32-character string]
ENCRYPTION_KEY=[generate random 32-character string]
```

### Generate Random Strings:
Use this command to generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your app will be available at: `https://youth-registration-system.onrender.com`

## Step 7: Access Admin Panel
1. Go to: `https://your-app-name.onrender.com/admin/login`
2. Login with:
   - **Email**: `admin@mopgomglobal.com`
   - **Password**: `SuperAdmin123!`

## Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify DATABASE_URL is correct

### Database Connection Issues?
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check database is running in Render dashboard
- Ensure database and web service are in same region

### App Won't Start?
- Check start command is `npm start`
- Verify build completed successfully
- Check environment variables are set

## Free Tier Limitations
- **Web Service**: 750 hours/month (enough for 24/7)
- **Database**: 1GB storage, 1 month retention
- **Bandwidth**: 100GB/month
- **Sleep**: Apps sleep after 15 minutes of inactivity

## Performance Tips
- App may take 30-60 seconds to wake up from sleep
- First request after sleep will be slow
- Consider upgrading to paid plan for production use

## Support
If you encounter issues:
1. Check Render dashboard logs
2. Verify all environment variables
3. Ensure GitHub repository is up to date
4. Contact Render support if needed

## Success! 🎉
Your Youth Registration System is now live and accessible worldwide!
