const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple environment variable loader
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Remove ?schema=public from URL for pg_dump
function getUrlForDump(url) {
  if (!url) {
    throw new Error('DATABASE_URL not found in .env file');
  }
  // Remove schema parameter as pg_dump doesn't support it
  return url.replace(/\?schema=.*$/, '');
}

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

try {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found in .env file');
  }

  if (!DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string (postgresql://...)');
  }

  const dbUrlForDump = getUrlForDump(DATABASE_URL);

  // Create backup filename with timestamp
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const backupFileName = `inventory_backup_${dateStr}_${timeStr}.sql`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  console.log('🔄 Creating PostgreSQL backup...');
  console.log(`📦 Database URL: ${dbUrlForDump.replace(/:[^:@]+@/, ':****@')}`); // Hide password
  console.log(`💾 Backup file: ${backupFileName}`);
  console.log(`📁 Location: ${backupPath}\n`);

  const pgDumpCommand = `pg_dump "${dbUrlForDump}" -F p -f "${backupPath}"`;

  exec(pgDumpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup failed!');
      console.error('Error:', error.message);
      if (stderr) {
        console.error('Details:', stderr);
      }
      console.error('\n💡 Make sure:');
      console.error('   1. PostgreSQL is installed and running');
      console.error('   2. pg_dump is in your PATH');
      console.error('   3. DATABASE_URL in .env is correct');
      console.error('   4. Database exists and is accessible');
      console.error('\n💡 On Windows, add PostgreSQL bin to PATH:');
      console.error('   C:\\Program Files\\PostgreSQL\\<version>\\bin');
      console.error('\n💡 Example DATABASE_URL:');
      console.error('   postgresql://postgres:postgres@localhost:5432/inventory?schema=public');
      process.exit(1);
    } else {
      // Check if backup file was created
      if (!fs.existsSync(backupPath)) {
        console.error('❌ Backup file was not created!');
        if (stderr) {
          console.error('Details:', stderr);
        }
        process.exit(1);
      }
      const stats = fs.statSync(backupPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log('✅ Backup created successfully!');
      console.log(`📊 Size: ${sizeMB} MB`);
      console.log(`📁 Full path: ${backupPath}`);
      if (stderr && !stderr.includes('WARNING')) {
        // Only show stderr if it's not just warnings
        console.warn('⚠️  Warnings:', stderr);
      }
      process.exit(0);
    }
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
