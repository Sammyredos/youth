# Developer Onboarding Checklist

Welcome to the AccoReg project! This checklist will help you get up and running quickly.

## 📋 Pre-Setup Checklist

### Required Software
- [ ] **Node.js** (v18.0.0+) installed - [Download](https://nodejs.org/)
- [ ] **npm** (v8.0.0+) - comes with Node.js
- [ ] **Git** installed - [Download](https://git-scm.com/)
- [ ] **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Recommended VS Code Extensions
- [ ] **TypeScript and JavaScript Language Features** (built-in)
- [ ] **Prisma** - for database schema syntax highlighting
- [ ] **Tailwind CSS IntelliSense** - for CSS class autocomplete
- [ ] **ES7+ React/Redux/React-Native snippets** - for React snippets
- [ ] **Auto Rename Tag** - for HTML/JSX tag renaming
- [ ] **Bracket Pair Colorizer** - for better code readability
- [ ] **GitLens** - for enhanced Git capabilities

## 🚀 Quick Setup (Automated)

### Option 1: Automated Setup Script
```bash
# Clone the repository
git clone <repository-url>
cd AccoReg

# Run the automated setup script
node scripts/setup-dev.js
```

The script will:
- ✅ Check Node.js version
- ✅ Install dependencies
- ✅ Create .env.local with secure secrets
- ✅ Set up the database
- ✅ Create a super admin account
- ✅ Show next steps

### Option 2: Manual Setup
If you prefer manual setup, follow the steps in the main [README.md](../README.md).

## 🔧 Post-Setup Verification

### 1. Environment Check
- [ ] `.env.local` file exists and has all required variables
- [ ] No environment validation errors when starting the app

### 2. Database Check
- [ ] `prisma/dev.db` file exists
- [ ] Can run `npm run db:studio` without errors
- [ ] Database has tables (Admin, Registration, etc.)

### 3. Application Check
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3000/admin/login
- [ ] Can log in with super admin account

### 4. Development Tools Check
- [ ] `npm run lint` runs without errors
- [ ] `npm run type-check` passes
- [ ] `npm run build` completes successfully

## 📚 Understanding the Codebase

### Key Directories
- [ ] **`src/app/`** - Next.js App Router pages and API routes
- [ ] **`src/components/`** - Reusable UI components
- [ ] **`src/lib/`** - Utility functions and configurations
- [ ] **`prisma/`** - Database schema and migrations
- [ ] **`docs/`** - Project documentation

### Important Files
- [ ] **`package.json`** - Dependencies and scripts
- [ ] **`prisma/schema.prisma`** - Database schema
- [ ] **`src/lib/env-validation.ts`** - Environment variable validation
- [ ] **`src/middleware.ts`** - Next.js middleware for auth and security
- [ ] **`tailwind.config.js`** - Tailwind CSS configuration

### Core Concepts
- [ ] **Authentication**: Custom JWT-based auth system
- [ ] **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- [ ] **Styling**: Tailwind CSS with Radix UI components
- [ ] **Validation**: Zod for runtime type checking
- [ ] **File Uploads**: Cloudinary integration

## 🛠️ Development Workflow

### Daily Development
- [ ] Start with `npm run dev`
- [ ] Use `npm run db:studio` to view/edit database
- [ ] Run `npm run lint` before committing
- [ ] Use `npm run type-check` to catch TypeScript errors

### Making Changes
- [ ] **Database changes**: Edit `schema.prisma` → run `npm run db:push`
- [ ] **New components**: Add to `src/components/`
- [ ] **New pages**: Add to `src/app/`
- [ ] **API routes**: Add to `src/app/api/`

### Testing Your Changes
- [ ] Test registration flow at `/register`
- [ ] Test admin features at `/admin`
- [ ] Check responsive design on mobile
- [ ] Verify email/SMS functionality (if configured)

## 🔍 Common Development Tasks

### Adding a New Page
1. [ ] Create file in `src/app/your-page/page.tsx`
2. [ ] Add necessary imports and components
3. [ ] Test the route works
4. [ ] Add navigation links if needed

### Adding a New API Route
1. [ ] Create file in `src/app/api/your-endpoint/route.ts`
2. [ ] Implement GET/POST/PUT/DELETE handlers
3. [ ] Add proper error handling
4. [ ] Test with tools like Postman or browser

### Database Schema Changes
1. [ ] Edit `prisma/schema.prisma`
2. [ ] Run `npm run db:push` (development)
3. [ ] Update TypeScript types if needed
4. [ ] Test the changes in Prisma Studio

### Adding New Environment Variables
1. [ ] Add to `src/lib/env-validation.ts`
2. [ ] Update `.env.example`
3. [ ] Document in README if needed
4. [ ] Test validation works

## 🚨 Troubleshooting Common Issues

### Port Already in Use
```bash
npx kill-port 3000
# or use different port
npm run dev -- -p 3001
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
```

### Environment Variable Errors
- [ ] Check `.env.local` exists
- [ ] Verify all required variables are set
- [ ] Restart development server
- [ ] Check for typos in variable names

### Prisma Client Issues
```bash
npm run db:generate
```

### Build Errors
```bash
npm run clean
npm install
npm run build
```

## 📖 Learning Resources

### Project-Specific
- [ ] Read all files in `docs/` folder
- [ ] Check `DEPLOY_TO_RENDER.md` for deployment info
- [ ] Review existing components in `src/components/`

### Technology Stack
- [ ] **Next.js 15**: [Documentation](https://nextjs.org/docs)
- [ ] **Prisma**: [Documentation](https://www.prisma.io/docs)
- [ ] **Tailwind CSS**: [Documentation](https://tailwindcss.com/docs)
- [ ] **Radix UI**: [Documentation](https://www.radix-ui.com/docs)
- [ ] **TypeScript**: [Documentation](https://www.typescriptlang.org/docs)

## 🤝 Team Collaboration

### Before Starting Work
- [ ] Pull latest changes: `git pull origin main`
- [ ] Create feature branch: `git checkout -b feature/your-feature`
- [ ] Check if any new dependencies were added: `npm install`

### Before Committing
- [ ] Run linting: `npm run lint`
- [ ] Run type checking: `npm run type-check`
- [ ] Test your changes thoroughly
- [ ] Write descriptive commit messages

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] No console.log statements left in production code
- [ ] Error handling is implemented
- [ ] TypeScript types are properly defined
- [ ] Responsive design works on mobile
- [ ] Accessibility considerations are met

## 🎯 Next Steps

Once you've completed this checklist:

1. [ ] **Explore the codebase** - Look at existing components and pages
2. [ ] **Try making a small change** - Add a simple feature or fix a bug
3. [ ] **Set up optional features** - Email, SMS, file uploads
4. [ ] **Read the documentation** - Check all files in `docs/`
5. [ ] **Join team communications** - Slack, Discord, or other channels

## 📞 Getting Help

If you're stuck:

1. [ ] Check this documentation and README.md
2. [ ] Search existing issues in the repository
3. [ ] Ask team members for help
4. [ ] Create a detailed issue if needed

---

**Welcome to the team! 🎉**

Remember: It's okay to ask questions. Every developer was new once, and the team is here to help you succeed!
