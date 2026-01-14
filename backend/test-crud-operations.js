// Using native fetch (no dependencies needed)
const API_URL = 'http://localhost:4000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let authToken = '';
let createdCategoryId = '';
let createdProductId = '';

async function login() {
  console.log('\n' + colors.blue + '🔐 Step 1: LOGIN' + colors.reset);
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123',
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.log('   Response status:', response.status);
      console.log('   Response data:', JSON.stringify(data, null, 2));
      throw new Error(data.message || 'Login failed');
    }
    // Check different possible response structures
    authToken = data.token || data.access_token || data.accessToken;
    if (!authToken) {
      console.log('   Full response:', JSON.stringify(data, null, 2));
      throw new Error('Token not received in response');
    }
    console.log(colors.green + '✅ Login successful!' + colors.reset);
    console.log('   Token received:', authToken ? authToken.substring(0, 20) + '...' : 'N/A');
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Login failed!' + colors.reset);
    console.log('   Error:', error.message);
    if (error.message.includes('fetch')) {
      console.log('   💡 Make sure backend is running on http://localhost:4000');
    }
    return false;
  }
}

async function createCategory() {
  console.log('\n' + colors.blue + '📝 Step 2: CREATE Category (POST)' + colors.reset);
  try {
    const categoryData = {
      name: `Test Category ${Date.now()}`,
      description: 'This is a test category created via API',
    };
    
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Category creation failed');
    
    createdCategoryId = data.id;
    console.log(colors.green + '✅ Category created successfully!' + colors.reset);
    console.log('   ID:', createdCategoryId);
    console.log('   Name:', data.name);
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Category creation failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function readCategories() {
  console.log('\n' + colors.blue + '📖 Step 3: READ Categories (GET)' + colors.reset);
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Categories fetch failed');
    
    console.log(colors.green + '✅ Categories fetched successfully!' + colors.reset);
    console.log('   Total categories:', data.length);
    if (data.length > 0) {
      console.log('   First category:', data[0].name);
    }
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Categories fetch failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function readOneCategory() {
  console.log('\n' + colors.blue + '📖 Step 4: READ One Category (GET /:id)' + colors.reset);
  if (!createdCategoryId) {
    console.log(colors.yellow + '⚠️  Skipped: No category ID available' + colors.reset);
    return true;
  }
  
  try {
    const response = await fetch(`${API_URL}/categories/${createdCategoryId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Category fetch failed');
    
    console.log(colors.green + '✅ Category fetched successfully!' + colors.reset);
    console.log('   ID:', data.id);
    console.log('   Name:', data.name);
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Category fetch failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function updateCategory() {
  console.log('\n' + colors.blue + '✏️  Step 5: UPDATE Category (PATCH)' + colors.reset);
  if (!createdCategoryId) {
    console.log(colors.yellow + '⚠️  Skipped: No category ID available' + colors.reset);
    return true;
  }
  
  try {
    const updateData = {
      description: 'Updated description via API test',
    };
    
    const response = await fetch(`${API_URL}/categories/${createdCategoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Category update failed');
    
    console.log(colors.green + '✅ Category updated successfully!' + colors.reset);
    console.log('   Updated description:', data.description);
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Category update failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function createProduct() {
  console.log('\n' + colors.blue + '📦 Step 6: CREATE Product (POST)' + colors.reset);
  if (!createdCategoryId) {
    console.log(colors.yellow + '⚠️  Skipped: No category ID available' + colors.reset);
    return true;
  }
  
  try {
    const productData = {
      name: `Test Product ${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      categoryId: createdCategoryId,
      description: 'This is a test product',
      costPrice: 1000,
      sellingPrice: 1500,
      currentStock: 50,
      minimumStock: 10,
      unit: 'pcs',
      status: 'ACTIVE',
    };
    
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Product creation failed');
    
    createdProductId = data.id;
    console.log(colors.green + '✅ Product created successfully!' + colors.reset);
    console.log('   ID:', createdProductId);
    console.log('   Name:', data.name);
    console.log('   SKU:', data.sku);
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Product creation failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function readProducts() {
  console.log('\n' + colors.blue + '📖 Step 7: READ Products (GET)' + colors.reset);
  try {
    const response = await fetch(`${API_URL}/products?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Products fetch failed');
    
    console.log(colors.green + '✅ Products fetched successfully!' + colors.reset);
    const products = data.data || data;
    const pagination = data.pagination || {};
    console.log('   Total products:', Array.isArray(products) ? products.length : 'N/A');
    if (pagination.totalPages) {
      console.log('   Total pages:', pagination.totalPages);
    }
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Products fetch failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function deleteProduct() {
  console.log('\n' + colors.blue + '🗑️  Step 8: DELETE Product (DELETE)' + colors.reset);
  if (!createdProductId) {
    console.log(colors.yellow + '⚠️  Skipped: No product ID available' + colors.reset);
    return true;
  }
  
  try {
    const response = await fetch(`${API_URL}/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Product deletion failed');
    }
    
    console.log(colors.green + '✅ Product deleted successfully!' + colors.reset);
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Product deletion failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function deleteCategory() {
  console.log('\n' + colors.blue + '🗑️  Step 9: DELETE Category (DELETE)' + colors.reset);
  if (!createdCategoryId) {
    console.log(colors.yellow + '⚠️  Skipped: No category ID available' + colors.reset);
    return true;
  }
  
  try {
    const response = await fetch(`${API_URL}/categories/${createdCategoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Category deletion failed');
    }
    
    console.log(colors.green + '✅ Category deleted successfully!' + colors.reset);
    return true;
  } catch (error) {
    console.log(colors.red + '❌ Category deletion failed!' + colors.reset);
    console.log('   Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.blue + '🧪 COMPLETE CRUD OPERATIONS TEST' + colors.reset);
  console.log(colors.blue + '='.repeat(60) + colors.reset);
  
  const results = {
    login: false,
    createCategory: false,
    readCategories: false,
    readOneCategory: false,
    updateCategory: false,
    createProduct: false,
    readProducts: false,
    deleteProduct: false,
    deleteCategory: false,
  };
  
  // Run tests in sequence
  results.login = await login();
  if (!results.login) {
    console.log(colors.red + '\n❌ Cannot proceed without login!' + colors.reset);
    return;
  }
  
  results.createCategory = await createCategory();
  results.readCategories = await readCategories();
  results.readOneCategory = await readOneCategory();
  results.updateCategory = await updateCategory();
  results.createProduct = await createProduct();
  results.readProducts = await readProducts();
  results.deleteProduct = await deleteProduct();
  results.deleteCategory = await deleteCategory();
  
  // Summary
  console.log('\n' + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.blue + '📊 TEST SUMMARY' + colors.reset);
  console.log(colors.blue + '='.repeat(60) + colors.reset);
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`Failed: ${colors.red}${total - passed}${colors.reset}`);
  
  console.log('\nDetailed Results:');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? colors.green + '✅' : colors.red + '❌';
    console.log(`  ${status} ${test}`);
  });
  
  if (passed === total) {
    console.log('\n' + colors.green + '🎉 All CRUD operations working perfectly!' + colors.reset);
  } else {
    console.log('\n' + colors.red + '⚠️  Some operations failed. Check errors above.' + colors.reset);
  }
  
  console.log('\n');
}

// Run tests
runAllTests().catch(console.error);
