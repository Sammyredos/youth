#!/usr/bin/env node

/**
 * Development Setup Script for AccoReg
 * 
 * This script helps new developers set up their development environment quickly.
 * It will:
 * 1. Check for required dependencies
 * 2. Create .env.local from .env.example
 * 3. Generate secure secrets
 * 4. Set up the database
 * 5. Create a super admin account
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js version 18 or higher is required. Current version:', nodeVersion);
    process.exit(1);
  }
  
  console.log('✅ Node.js version check passed:', nodeVersion);
}

function checkDependencies() {
  console.log('\n📦 Checking dependencies...');
  
  if (!fs.existsSync('node_modules')) {
    console.log('📥 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ Dependencies already installed');
  }
}

async function setupEnvironment() {
  console.log('\n🔧 Setting up environment variables...');
  
  const envLocalPath = '.env.local';
  const envExamplePath = '.env.example';
  
  if (fs.existsSync(envLocalPath)) {
    const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('⏭️  Skipping environment setup');
      return;
    }
  }
  
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example not found. Please ensure it exists.');
    return;
  }
  
  // Read .env.example
  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Generate secure secrets
  const nextAuthSecret = generateSecret();
  const jwtSecret = generateSecret();
  
  // Replace placeholder values
  envContent = envContent
    .replace('your-super-secure-nextauth-secret-at-least-32-chars', nextAuthSecret)
    .replace('your-super-secure-jwt-secret-at-least-32-characters', jwtSecret)
    .replace('your-backup-encryption-key-32-chars', generateSecret());
  
  // Write .env.local
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Created .env.local with secure secrets');
}

function setupDatabase() {
  console.log('\n🗄️  Setting up database...');
  
  try {
    // Generate Prisma client
    console.log('📝 Generating Prisma client...');
    execSync('npm run db:generate', { stdio: 'inherit' });
    
    // Push database schema
    console.log('🚀 Setting up database schema...');
    execSync('npm run db:push', { stdio: 'inherit' });
    
    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('💡 You can run these commands manually:');
    console.log('   npm run db:generate');
    console.log('   npm run db:push');
  }
}

async function createSuperAdmin() {
  console.log('\n👤 Setting up super admin account...');
  
  const createAdmin = await question('Create a super admin account? (Y/n): ');
  if (createAdmin.toLowerCase() === 'n') {
    console.log('⏭️  Skipping admin account creation');
    console.log('💡 You can create one later with: npx tsx scripts/create-super-admin.ts');
    return;
  }
  
  try {
    execSync('npx tsx scripts/create-super-admin.ts', { stdio: 'inherit' });
    console.log('✅ Super admin account created');
  } catch (error) {
    console.error('❌ Failed to create super admin account');
    console.log('💡 You can create one manually later with: npx tsx scripts/create-super-admin.ts');
  }
}

function showNextSteps() {
  console.log('\n🎉 Setup complete! Next steps:');
  console.log('');
  console.log('1. Start the development server:');
  console.log('   npm run dev');
  console.log('');
  console.log('2. Open your browser and visit:');
  console.log('   • Registration: http://localhost:3000/register');
  console.log('   • Admin Panel: http://localhost:3000/admin');
  console.log('   • Database Studio: npm run db:studio');
  console.log('');
  console.log('3. Optional configurations:');
  console.log('   • Email setup: docs/LOCALHOST-EMAIL-SETUP.md');
  console.log('   • SMS setup: docs/LOCALHOST-SMS-SETUP.md');
  console.log('   • File uploads: Set up Cloudinary credentials in .env.local');
  console.log('');
  console.log('📚 Documentation: Check the docs/ folder for detailed guides');
  console.log('🐛 Issues? Check README.md for troubleshooting tips');
  console.log('');
  console.log('Happy coding! 🚀');
}

async function main() {
  console.log('🚀 AccoReg Development Setup');
  console.log('============================');
  
  try {
    checkNodeVersion();
    checkDependencies();
    await setupEnvironment();
    setupDatabase();
    await createSuperAdmin();
    showNextSteps();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 You can run the setup steps manually:');
    console.log('1. Copy .env.example to .env.local and fill in values');
    console.log('2. Run: npm run db:generate');
    console.log('3. Run: npm run db:push');
    console.log('4. Run: npx tsx scripts/create-super-admin.ts');
    console.log('5. Run: npm run dev');
  } finally {
    rl.close();
  }
}

// Run the setup
main();
