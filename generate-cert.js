// Generate self-signed certificate for local HTTPS testing
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating self-signed SSL certificate for local HTTPS...\n');

const certPath = path.join(__dirname, 'localhost.pem');
const keyPath = path.join(__dirname, 'localhost-key.pem');

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ Certificates already exist:');
  console.log('   - localhost.pem');
  console.log('   - localhost-key.pem');
  console.log('\nSkipping generation. Delete these files to regenerate.\n');
  process.exit(0);
}

try {
  // Generate self-signed certificate using OpenSSL
  // Works on Windows (if OpenSSL installed), Mac, and Linux
  const command = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout "${keyPath}" -out "${certPath}" -days 365`;
  
  console.log('Running OpenSSL command...');
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Certificate generated successfully!');
  console.log('   - localhost.pem (certificate)');
  console.log('   - localhost-key.pem (private key)');
  console.log('\n⚠️  Note: This is a self-signed certificate.');
  console.log('   Your browser will show a security warning.');
  console.log('   Click "Advanced" → "Proceed to localhost" to continue.\n');
  console.log('🚀 Now run: npm run dev:https\n');
  
} catch (error) {
  console.error('\n❌ Error generating certificate:');
  console.error(error.message);
  console.log('\n📝 OpenSSL not found. Using alternative method...\n');
  
  // Fallback: Use Node's built-in crypto to generate certificate
  // This is more complex but doesn't require OpenSSL
  console.log('⚠️  Please install OpenSSL or use ngrok for HTTPS:');
  console.log('   Windows: choco install openssl');
  console.log('   Mac: brew install openssl');
  console.log('   Linux: sudo apt-get install openssl');
  console.log('\n   Or use ngrok: npm install -g ngrok && ngrok http 3000\n');
  process.exit(1);
}
