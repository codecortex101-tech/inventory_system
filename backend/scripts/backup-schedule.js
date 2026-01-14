// Simple backup scheduler - can be run with Windows Task Scheduler
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Running scheduled database backup...');
console.log(`⏰ Time: ${new Date().toLocaleString()}`);

const backupScript = path.join(__dirname, 'backup-db.js');
exec(`node "${backupScript}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Scheduled backup failed:', error.message);
    process.exit(1);
  } else {
    console.log(stdout);
    console.log('✅ Scheduled backup completed');
    process.exit(0);
  }
});
