/**
 * Firebase Storage CORS Configuration Script
 *
 * This script sets up CORS (Cross-Origin Resource Sharing) on your Firebase Storage bucket
 * to allow video thumbnail generation from localhost and your production domain.
 *
 * Prerequisites:
 * 1. Install the Google Cloud Storage package: npm install @google-cloud/storage
 * 2. Set up authentication (see instructions below)
 *
 * Authentication Options:
 *
 * Option A - Service Account Key (Recommended for local development):
 *   1. Go to Firebase Console > Project Settings > Service Accounts
 *   2. Click "Generate new private key"
 *   3. Save the JSON file as "serviceAccountKey.json" in the scripts folder
 *   4. Run: node scripts/setup-cors.js
 *
 * Option B - Application Default Credentials:
 *   1. Install Google Cloud SDK
 *   2. Run: gcloud auth application-default login
 *   3. Run: node scripts/setup-cors.js
 */

const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Configuration
const BUCKET_NAME = 'rs-epk.firebasestorage.app';
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  // Add your production domain here:
  // 'https://your-production-domain.com',
];

const CORS_CONFIG = [
  {
    origin: ALLOWED_ORIGINS,
    method: ['GET', 'HEAD'],
    maxAgeSeconds: 3600,
    responseHeader: ['Content-Type', 'Content-Length', 'Content-Range']
  }
];

async function setupCors() {
  console.log('🔧 Firebase Storage CORS Configuration\n');

  // Check for service account key
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  let storage;

  if (fs.existsSync(keyPath)) {
    console.log('✓ Found service account key\n');
    storage = new Storage({
      keyFilename: keyPath
    });
  } else {
    console.log('⚠ No service account key found at scripts/serviceAccountKey.json');
    console.log('  Attempting to use Application Default Credentials...\n');
    storage = new Storage();
  }

  try {
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log(`🌐 Allowed Origins:`);
    ALLOWED_ORIGINS.forEach(origin => console.log(`   - ${origin}`));
    console.log('');

    // Get bucket reference
    const bucket = storage.bucket(BUCKET_NAME);

    // Set CORS configuration
    console.log('⏳ Setting CORS configuration...');
    await bucket.setCorsConfiguration(CORS_CONFIG);

    console.log('✅ CORS configuration set successfully!\n');

    // Verify the configuration
    console.log('🔍 Verifying configuration...');
    const [metadata] = await bucket.getMetadata();

    if (metadata.cors) {
      console.log('✅ CORS configuration verified:\n');
      console.log(JSON.stringify(metadata.cors, null, 2));
    }

    console.log('\n🎉 Done! Video thumbnails should now work.');
    console.log('   You may need to clear your browser cache or do a hard refresh (Ctrl+Shift+R).\n');

  } catch (error) {
    console.error('\n❌ Error setting CORS configuration:\n');

    if (error.code === 401 || error.code === 403) {
      console.error('Authentication failed. Please ensure:');
      console.error('1. You have a valid service account key in scripts/serviceAccountKey.json');
      console.error('2. OR you have run: gcloud auth application-default login');
      console.error('3. Your account has Storage Admin permissions on the bucket\n');
    } else if (error.code === 404) {
      console.error(`Bucket "${BUCKET_NAME}" not found.`);
      console.error('Please check the bucket name is correct.\n');
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

// Run the script
setupCors();
