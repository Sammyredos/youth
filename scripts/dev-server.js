const { spawn } = require('child_process');
const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

function startDevServer() {
  const networkIP = getNetworkIP();
  const port = process.env.PORT || 3000;
  
  console.log('\n🚀 Starting Mopgomglobal Development Server...\n');
  
  // Start Next.js dev server
  const nextProcess = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', port], {
    stdio: 'pipe',
    shell: true
  });

  nextProcess.stdout.on('data', (data) => {
    const output = data.toString();
    
    // Check if it's the ready message
    if (output.includes('Ready')) {
      console.log('✅ Development server ready!\n');
      console.log('📍 Access your application at:');
      console.log(`   🏠 Local:    http://localhost:${port}`);
      console.log(`   🌐 Network:  http://${networkIP}:${port}`);
      console.log('\n💡 Use Ctrl+C to stop the server\n');
    } else {
      // Show other Next.js output
      process.stdout.write(output);
    }
  });

  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  nextProcess.on('close', (code) => {
    console.log(`\n🛑 Development server stopped with code ${code}`);
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });
}

startDevServer();
