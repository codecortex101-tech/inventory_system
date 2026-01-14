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

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Please provide a backup file name');
  console.log('\nUsage: npm run db:restore <backup-filename>');
  console.log('\nAvailable backups:');
  
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('  No backup files found');
    } else {
      files.forEach((file, index) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        const date = stats.birthtime.toLocaleString();
        console.log(`  ${index + 1}. ${file}`);
        console.log(`     Size: ${size} MB | Created: ${date}`);
      });
    }
  }
  process.exit(1);
}

const backupPath = path.isAbsolute(backupFile) 
  ? backupFile 
  : path.join(BACKUP_DIR, backupFile);

if (!fs.existsSync(backupPath)) {
  console.error(`❌ Backup file not found: ${backupPath}`);
  process.exit(1);
}

try {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found in .env file');
  }

  if (!DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  console.log('⚠️  WARNING: This will replace data in the database!');
  console.log(`📦 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`📁 Backup file: ${path.basename(backupPath)}`);
  console.log('\n⏳ Starting restore in 3 seconds... (Press Ctrl+C to cancel)');
  
  setTimeout(() => {
    // Remove ?schema=public from URL for psql
    const dbUrlForRestore = DATABASE_URL.replace(/\?schema=.*$/, '');
    const restoreCommand = `psql "${dbUrlForRestore}" -f "${backupPath}"`;
    
    console.log('\n🔄 Restoring database...');
    
    exec(restoreCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Restore failed!');
        console.error('Error:', error.message);
        if (stderr) {
          console.error('Details:', stderr);
        }
        console.error('\n💡 Make sure:');
        console.error('   1. PostgreSQL is installed and running');
        console.error('   2. psql is in your PATH');
        console.error('   3. DATABASE_URL in .env is correct');
        console.error('   4. Database exists');
        console.error('\n💡 On Windows, add PostgreSQL bin to PATH:');
        console.error('   C:\\Program Files\\PostgreSQL\\<version>\\bin');
        process.exit(1);
      } else {
        console.log('✅ Database restored successfully!');
        if (stdout) {
          console.log(stdout);
        }
        process.exit(0);
      }
    });
  }, 3000);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
