# 📧 Localhost Email Setup Guide

This guide shows you how to set up email functionality on localhost for development and testing.

## 🎯 **Quick Setup for Localhost**

### **Option 1: Gmail SMTP (Recommended for Testing)**

1. **Go to Settings** → **Email Configuration**
2. **Click "Edit"**
3. **Enter these settings**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP Username: your-gmail@gmail.com
   SMTP Password: your-app-password (see below)
   Use SSL/TLS: false (for port 587)
   From Name: Youth Registration System
   Reply-To Email: your-gmail@gmail.com
   Admin Emails: your-gmail@gmail.com
   ```

### **How to Get Gmail App Password**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Go to**: https://myaccount.google.com/apppasswords
3. **Select "Mail"** and **"Other (Custom name)"**
4. **Enter**: "Youth Registration System"
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
6. **Use this password** in the SMTP Password field

### **Option 2: Outlook/Hotmail SMTP**

```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP Username: your-email@outlook.com
SMTP Password: your-password
Use SSL/TLS: false
From Name: Youth Registration System
Reply-To Email: your-email@outlook.com
Admin Emails: your-email@outlook.com
```

### **Option 3: Development Mode (No Real Emails)**

If you don't want to set up real email, the system will log emails to the console in development mode:

1. **Leave email settings empty** or use dummy values
2. **Check the terminal/console** where you're running `npm run dev`
3. **Emails will be logged** instead of sent

## 🔧 **Environment Variables Setup**

Add these to your `.env.local` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
EMAIL_FROM_NAME=Youth Registration System
EMAIL_REPLY_TO=your-gmail@gmail.com
ADMIN_EMAILS=your-gmail@gmail.com
```

## 🧪 **Testing Email on Localhost**

### **Step 1: Configure Email Settings**
1. **Navigate to**: http://localhost:3000/admin/settings
2. **Go to Email Configuration section**
3. **Click "Edit"** and enter your SMTP details
4. **Click "Save"**

### **Step 2: Test Email Sending**
1. **In the Email Configuration section**
2. **Enter your email** in the test field
3. **Click "Send Test Email"**
4. **Check your inbox** for the test email

### **Step 3: Test Registration Emails**
1. **Create a test registration** at http://localhost:3000
2. **Check if admin notification email** is sent
3. **Verify email content** and formatting

## 🚨 **Troubleshooting Common Issues**

### **"Invalid email settings data" Error**

This usually means validation failed. Check:

1. **SMTP Host**: Must not be empty
2. **SMTP Port**: Must be a number (587, 465, 25)
3. **SMTP Username**: Must not be empty
4. **From Name**: Must not be empty
5. **Admin Emails**: Must not be empty

### **"SMTP Connection Failed" Error**

1. **Check credentials**: Ensure username/password are correct
2. **Check port**: Use 587 for TLS, 465 for SSL
3. **Check firewall**: Ensure SMTP ports aren't blocked
4. **Try different provider**: Gmail, Outlook, etc.

### **"Authentication Failed" Error**

1. **Enable 2FA** and use app password (Gmail)
2. **Check "Less secure apps"** setting (if available)
3. **Verify credentials** are correct
4. **Try OAuth2** if available

### **Emails Not Received**

1. **Check spam folder**
2. **Verify recipient email** is correct
3. **Check email provider logs**
4. **Try different recipient email**

## 🔍 **Debug Mode**

To see detailed email logs:

1. **Open browser console** (F12)
2. **Check terminal** where you run `npm run dev`
3. **Look for email-related logs**
4. **Check for error messages**

## 📱 **Free Email Testing Services**

For development, you can use these free services:

### **Mailtrap (Recommended)**
- **Website**: https://mailtrap.io
- **Free tier**: 100 emails/month
- **Setup**:
  ```
  SMTP Host: smtp.mailtrap.io
  SMTP Port: 587
  SMTP Username: [from mailtrap]
  SMTP Password: [from mailtrap]
  ```

### **Ethereal Email**
- **Website**: https://ethereal.email
- **Free**: Unlimited fake emails
- **Perfect for testing** email templates

### **MailHog (Local)**
- **Install**: `docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog`
- **SMTP**: localhost:1025
- **Web UI**: http://localhost:8025

## ⚡ **Quick Fix for Current Error**

If you're getting the "Invalid email settings data" error right now:

1. **Open browser console** (F12)
2. **Go to Settings** → **Email Configuration**
3. **Click "Edit"**
4. **Fill in ALL required fields**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP Username: `your-email@gmail.com`
   - SMTP Password: `your-app-password`
   - Use SSL/TLS: `false`
   - From Name: `Youth Registration System`
   - Admin Emails: `your-email@gmail.com`
5. **Click "Save"**

## 🎉 **Success Indicators**

You'll know email is working when:

1. **Settings save successfully** without errors
2. **Test email** is received in your inbox
3. **Registration notifications** are sent to admins
4. **No error messages** in console/terminal

## 📞 **Need Help?**

If you're still having issues:

1. **Check the browser console** for detailed error messages
2. **Check the terminal** for server-side logs
3. **Try a different email provider** (Gmail → Outlook)
4. **Use development mode** (emails logged to console)
5. **Verify all required fields** are filled correctly

The system is designed to work on localhost with proper SMTP configuration! 🚀
