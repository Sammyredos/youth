# Troubleshooting Guide

This guide covers common issues you might encounter while developing with AccoReg and their solutions.

## 🚨 Common Setup Issues

### 1. Node.js Version Issues

**Problem**: Error about Node.js version or unsupported features
```
Error: The engine "node" is incompatible with this module
```

**Solution**:
```bash
# Check your Node.js version
node --version

# Should be v18.0.0 or higher
# If not, download from https://nodejs.org/
```

### 2. Environment Variable Errors

**Problem**: Environment validation failed
```
❌ Environment validation failed:
  - NEXTAUTH_SECRET: String must contain at least 32 character(s)
```

**Solutions**:
```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. Generate secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Copy from example
cp .env.example .env.local

# 4. Use the setup script
npm run setup
```

### 3. Database Connection Issues

**Problem**: Database connection errors
```
Error: P1003: Database does not exist
```

**Solutions**:
```bash
# Reset database
rm prisma/dev.db
npm run db:push

# Or regenerate Prisma client
npm run db:generate
npm run db:push
```

### 4. Port Already in Use

**Problem**: Port 3000 is already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:
```bash
# Option 1: Kill process on port 3000
npx kill-port 3000

# Option 2: Use different port
npm run dev -- -p 3001

# Option 3: Find and kill the process manually
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

## 🔧 Development Issues

### 5. Prisma Client Issues

**Problem**: Prisma client is not generated or outdated
```
Error: Cannot find module '@prisma/client'
```

**Solutions**:
```bash
# Regenerate Prisma client
npm run db:generate

# If that doesn't work, clean and regenerate
rm -rf node_modules/.prisma
npm run db:generate
```

### 6. TypeScript Errors

**Problem**: TypeScript compilation errors
```
Type error: Property 'xyz' does not exist on type 'ABC'
```

**Solutions**:
```bash
# Run type checking
npm run type-check

# Clear TypeScript cache
rm tsconfig.tsbuildinfo
npm run type-check

# Restart VS Code TypeScript server
# In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### 7. Build Errors

**Problem**: Build fails with various errors

**Solutions**:
```bash
# Clean build artifacts
npm run clean

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### 8. Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solutions**:
```bash
# Restart development server
# Ctrl+C to stop, then npm run dev

# Clear Next.js cache
npm run clean:cache
npm run dev

# Check if files are being watched
# Make sure you're editing files in the src/ directory
```

## 📧 Email Configuration Issues

### 9. Email Not Sending

**Problem**: Emails not being sent or SMTP errors

**Solutions**:
```bash
# Check email configuration in .env.local
# For Gmail, use App Passwords instead of regular password

# Test email configuration
# Check the admin settings panel at /admin/settings

# For development, emails are logged to console
# Check your terminal output
```

**Gmail Setup**:
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in SMTP_PASS

### 10. Email Templates Not Loading

**Problem**: Email templates showing as plain text

**Solution**:
- Check that email templates exist in the correct directory
- Verify file permissions
- Restart the development server

## 📱 SMS Configuration Issues

### 11. SMS Not Sending

**Problem**: SMS verification codes not being sent

**Solutions**:
```bash
# Check SMS configuration in .env.local
SMS_ENABLED=true
SMS_PROVIDER=mock  # or your provider

# For development, use mock provider
# SMS messages will be logged to console

# Check provider-specific settings
# See docs/LOCALHOST-SMS-SETUP.md
```

## 🗄️ Database Issues

### 12. Migration Errors

**Problem**: Database migration fails
```
Error: Migration failed to apply cleanly to the shadow database
```

**Solutions**:
```bash
# For development, use db:push instead of migrate
npm run db:push

# Reset database if needed
rm prisma/dev.db
npm run db:push

# For production, check migration files
npm run db:migrate
```

### 13. Prisma Studio Won't Open

**Problem**: `npm run db:studio` fails or doesn't open browser

**Solutions**:
```bash
# Check if database exists
ls -la prisma/dev.db

# Regenerate Prisma client
npm run db:generate

# Try opening manually
npx prisma studio
```

## 🔐 Authentication Issues

### 14. Admin Login Not Working

**Problem**: Cannot log in to admin panel

**Solutions**:
```bash
# Create/reset super admin account
npm run setup:admin

# Check if admin exists in database
npm run db:studio
# Look in Admin table

# Reset admin password
npx tsx scripts/reset-admin-password.ts
```

### 15. JWT Token Issues

**Problem**: Authentication tokens not working

**Solutions**:
```bash
# Check JWT_SECRET in .env.local
# Must be at least 32 characters

# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Clear browser cookies and try again
```

## 🎨 Styling Issues

### 16. Tailwind CSS Not Working

**Problem**: Tailwind classes not applying

**Solutions**:
```bash
# Check if Tailwind is properly configured
# Verify tailwind.config.js exists

# Restart development server
npm run dev

# Check if CSS is being imported
# Verify src/app/globals.css imports Tailwind
```

### 17. Component Styling Issues

**Problem**: Components not displaying correctly

**Solutions**:
- Check browser developer tools for CSS errors
- Verify component imports are correct
- Check if Radix UI components are properly installed
- Clear browser cache

## 🔍 Debugging Tips

### General Debugging

1. **Check the Console**: Always check browser console and terminal output
2. **Use Developer Tools**: Browser DevTools are your friend
3. **Check Network Tab**: For API request/response issues
4. **Verify File Paths**: Ensure imports and file paths are correct
5. **Restart Everything**: Sometimes a full restart fixes issues

### Logging

```javascript
// Add debug logging
console.log('Debug info:', { variable, data });

// Check environment variables
console.log('Environment:', process.env.NODE_ENV);

// Log API responses
console.log('API Response:', response);
```

### VS Code Debugging

1. Install "Debugger for Chrome" extension
2. Set breakpoints in your code
3. Use F5 to start debugging
4. Step through code execution

## 📞 Getting Help

If you're still stuck after trying these solutions:

1. **Check Documentation**: Review README.md and docs/ folder
2. **Search Issues**: Look for similar issues in the repository
3. **Ask Team Members**: Don't hesitate to ask for help
4. **Create Detailed Issue**: Include error messages, steps to reproduce, and environment info

### When Reporting Issues

Include:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Error messages (full stack trace)
- Steps to reproduce
- What you expected to happen
- What actually happened

## 🔄 Reset Everything

If all else fails, here's how to completely reset your development environment:

```bash
# 1. Stop all running processes
# Ctrl+C in all terminals

# 2. Clean everything
rm -rf node_modules
rm -rf .next
rm package-lock.json
rm prisma/dev.db
rm .env.local

# 3. Fresh install
npm install

# 4. Setup from scratch
npm run setup

# 5. Start development
npm run dev
```

---

**Remember**: Most issues have simple solutions. Don't spend hours debugging - ask for help! 🤝
