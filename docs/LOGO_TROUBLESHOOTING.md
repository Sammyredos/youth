# 🖼️ Logo Upload & Display Troubleshooting Guide

This guide helps you troubleshoot logo upload and display issues in your youth registration system.

## 🔍 Common Issues & Solutions

### Issue 1: Logo Uploads But Doesn't Display

**Symptoms:**
- Upload shows "Custom logo uploaded" 
- Logo preview shows broken image or placeholder
- Console shows 404 errors for logo files

**Solutions:**

1. **Check File Path in Browser Console**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for logo path being logged
   - Verify the path starts with `/uploads/branding/`

2. **Test Direct File Access**
   - Copy the logo URL from console
   - Try accessing it directly: `https://your-domain.com/uploads/branding/logo-123456.png`
   - If 404 error, file serving issue

3. **Check File Permissions (Local Development)**
   ```bash
   # Check if uploads directory exists
   ls -la public/uploads/branding/
   
   # Fix permissions if needed
   chmod 755 public/uploads/branding/
   chmod 644 public/uploads/branding/*
   ```

### Issue 2: Logo Upload Fails

**Symptoms:**
- Error message during upload
- Upload button doesn't respond
- Network errors in console

**Solutions:**

1. **Check File Size & Type**
   - Maximum size: 5MB
   - Supported formats: PNG, JPG, JPEG, SVG, GIF
   - Try with a smaller file

2. **Check Network Tab**
   - Open browser developer tools
   - Go to Network tab
   - Try uploading again
   - Look for failed requests to `/api/admin/settings/logo`

3. **Check Server Logs**
   - Look for upload errors in application logs
   - Check for disk space issues
   - Verify write permissions

### Issue 3: Logo Shows Temporarily Then Disappears

**Symptoms:**
- Logo appears briefly after upload
- Disappears on page refresh
- Inconsistent display across pages

**Solutions:**

1. **Clear Browser Cache**
   ```bash
   # Hard refresh
   Ctrl+F5 (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Check Database Storage**
   - Logo URL should be stored in `settings` table
   - Category: `branding`, Key: `logoUrl`
   - Value should be JSON string of file path

3. **Verify File Persistence**
   - Check if uploaded files remain in `public/uploads/branding/`
   - Files might be getting deleted by cleanup processes

## 🛠️ Debugging Steps

### Step 1: Enable Debug Logging

The system now includes debug logging. Check browser console for:
```
Loading current logo...
Logo API response status: 200
Logo API response data: {success: true, logoUrl: "/uploads/branding/logo-123456.png"}
Setting current logo to: /uploads/branding/logo-123456.png
Logo loaded successfully: /uploads/branding/logo-123456.png
```

### Step 2: Test API Endpoints

1. **Test Logo GET API**
   ```bash
   curl https://your-domain.com/api/admin/settings/logo
   ```
   Should return: `{"success":true,"logoUrl":"/uploads/branding/logo-123456.png"}`

2. **Test File Serving**
   ```bash
   curl https://your-domain.com/uploads/branding/logo-123456.png
   ```
   Should return the image file

### Step 3: Check File System

1. **Verify Upload Directory**
   ```bash
   ls -la public/uploads/branding/
   ```

2. **Check File Contents**
   ```bash
   file public/uploads/branding/logo-*.png
   ```

## 🔧 Manual Fixes

### Fix 1: Recreate Upload Directory

```bash
# Remove and recreate uploads directory
rm -rf public/uploads/branding/
mkdir -p public/uploads/branding/
chmod 755 public/uploads/branding/
```

### Fix 2: Reset Logo Settings

```sql
-- Clear logo settings from database
DELETE FROM settings WHERE category = 'branding' AND key = 'logoUrl';
```

### Fix 3: Test with Simple Image

1. Create a simple test image (100x100 PNG)
2. Upload through admin panel
3. Check if it displays correctly
4. If yes, issue was with original image file

## 🚨 Production Deployment Issues

### Render/Vercel Specific

1. **Static File Serving**
   - Files in `public/` directory should be served automatically
   - Check if build process includes uploaded files

2. **File Persistence**
   - Uploaded files might not persist across deployments
   - Consider using external storage (Cloudinary, AWS S3)

3. **Build Process**
   - Ensure `public/uploads/` directory exists in build
   - Add to `.gitignore` but create empty directory

### Environment Variables

Make sure these are set in production:
```bash
NODE_ENV=production
DATABASE_URL=your-database-url
```

## 📞 Getting Help

If issues persist:

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed requests
3. **Check Server Logs** for backend errors
4. **Test with Different Browsers** to rule out browser-specific issues
5. **Try Different Image Files** to rule out file-specific issues

## 🔄 Quick Reset

To completely reset logo system:

1. Delete all files in `public/uploads/branding/`
2. Clear logo settings from database
3. Restart application
4. Try uploading a new logo

---

**Note:** The logo system includes automatic cleanup of old files and comprehensive error handling. Most issues are related to file serving or caching problems.
