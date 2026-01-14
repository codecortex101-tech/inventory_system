// Quick script to verify data is being stored
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDataStorage() {
  console.log('\n🔍 Verifying Data Storage in PostgreSQL...\n');
  
  try {
    // Test 1: Create a test category
    console.log('📝 Test 1: Creating test category...');
    const testCategory = await prisma.category.create({
      data: {
        name: `Verify Test ${Date.now()}`,
        description: 'This is a verification test category',
      },
    });
    console.log('✅ Category created!');
    console.log('   ID:', testCategory.id);
    console.log('   Name:', testCategory.name);
    console.log('   Created at:', testCategory.createdAt);
    
    // Test 2: Read all categories
    console.log('\n📖 Test 2: Reading all categories...');
    const allCategories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    console.log(`✅ Found ${allCategories.length} categories (showing latest 5):`);
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id.substring(0, 8)}...)`);
    });
    
    // Test 3: Update the test category
    console.log('\n✏️  Test 3: Updating test category...');
    const updatedCategory = await prisma.category.update({
      where: { id: testCategory.id },
      data: { description: 'Updated description for verification' },
    });
    console.log('✅ Category updated!');
    console.log('   Updated description:', updatedCategory.description);
    
    // Test 4: Verify in database directly
    console.log('\n🗄️  Test 4: Verifying in database...');
    const dbCategory = await prisma.category.findUnique({
      where: { id: testCategory.id },
    });
    if (dbCategory) {
      console.log('✅ Data found in database!');
      console.log('   Name:', dbCategory.name);
      console.log('   Description:', dbCategory.description);
      console.log('   Created:', dbCategory.createdAt);
    } else {
      console.log('❌ Data not found in database!');
    }
    
    // Test 5: Count all categories
    console.log('\n📊 Test 5: Counting all categories...');
    const totalCount = await prisma.category.count();
    console.log(`✅ Total categories in database: ${totalCount}`);
    
    // Test 6: Delete test category
    console.log('\n🗑️  Test 6: Deleting test category...');
    await prisma.category.delete({
      where: { id: testCategory.id },
    });
    console.log('✅ Test category deleted!');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED - Data is being stored correctly!');
    console.log('='.repeat(60));
    console.log('\n💡 If you don\'t see data in pgAdmin:');
    console.log('   1. Refresh the table (right-click → Refresh)');
    console.log('   2. Check "categories" table (lowercase), not "Category"');
    console.log('   3. Use Query Tool: SELECT * FROM categories;');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. PostgreSQL is running');
    console.error('   2. DATABASE_URL in .env is correct');
    console.error('   3. Database "inventory" exists');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDataStorage();
