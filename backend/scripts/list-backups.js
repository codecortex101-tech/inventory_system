const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

console.log('📦 PostgreSQL Database Backups\n');
console.log('='.repeat(60));

if (!fs.existsSync(BACKUP_DIR)) {
  console.log('❌ Backups directory does not exist');
  console.log('💡 Run "npm run db:backup" to create your first backup');
  process.exit(0);
}

const files = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.endsWith('.sql'))
  .map(f => {
    const filePath = path.join(BACKUP_DIR, f);
    const stats = fs.statSync(filePath);
    return {
      name: f,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  })
  .sort((a, b) => b.created - a.created);

if (files.length === 0) {
  console.log('📭 No backup files found');
  console.log('💡 Run "npm run db:backup" to create your first backup');
} else {
  console.log(`\nFound ${files.length} backup(s):\n`);
  
  files.forEach((file, index) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const date = file.created.toLocaleString();
    console.log(`${index + 1}. ${file.name}`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`   Created: ${date}`);
    console.log('');
  });
  
  console.log('💡 To restore a backup, use:');
  console.log('   npm run db:restore <backup-filename>');
}

console.log('='.repeat(60));
