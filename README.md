# Inventory Management System

A comprehensive, multi-organization inventory management system built with React, NestJS, PostgreSQL, and Prisma. This system allows multiple organizations to manage their inventory independently with full data isolation.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Multi-Organization System](#multi-organization-system)
- [Features Documentation](#features-documentation)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- ✅ **Multi-Organization Support**: Each organization has isolated data and users
- ✅ **Role-Based Access Control**: Admin and Staff roles with different permissions
- ✅ **Product Management**: Full CRUD operations with categories, SKUs, pricing, and stock tracking
- ✅ **Category Management**: Organize products by categories
- ✅ **Stock Management**: Track stock movements (IN, OUT, ADJUSTMENT) with detailed history
- ✅ **Low Stock Alerts**: Automatic alerts for products below minimum stock levels
- ✅ **Product Expiration Tracking**: Monitor product expiration dates with alerts
- ✅ **Comprehensive History**: Complete audit trail of all system activities
- ✅ **Data Visualization**: Charts and graphs for analytics
- ✅ **Export Functionality**: Export data to CSV format
- ✅ **Search & Filtering**: Advanced search and filtering capabilities
- ✅ **Responsive Design**: Modern, mobile-friendly UI with Tailwind CSS

### Advanced Features
- 📊 **Dashboard Analytics**: Real-time statistics and overview cards
- 📈 **Charts & Graphs**: Visual representation of inventory data
- 🔍 **Advanced Filtering**: Filter by category, status, expiration, stock levels
- 📅 **Date Range Filtering**: Filter activities by date ranges
- 👥 **Staff Management**: Admin can add/manage staff members
- 📝 **Audit Logs**: Complete activity tracking
- 🎨 **Modern UI**: Beautiful glassmorphism design with animations

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **class-validator** - DTO validation

### Database
- **PostgreSQL** - Relational database
- **Prisma Migrate** - Database migrations

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "invertory managment system"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `backend` directory
2. Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inventory?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=4000
FRONTEND_URL="http://localhost:5173"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"

FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_CALLBACK_URL="http://localhost:4000/api/auth/facebook/callback"
```

### Frontend Configuration

1. Navigate to the `frontend` directory
2. Create a `.env` file (optional, defaults to `http://localhost:4000/api`):

```env
VITE_API_URL=http://localhost:4000/api
```

## 🗄 Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE inventory;
```

### 2. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
```

This will:
- Create all necessary tables
- Set up relationships
- Create indexes

### 3. Generate Prisma Client

```bash
npx prisma generate
```

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:4000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to: `http://localhost:5173`

## 🏢 Multi-Organization System

This system supports multiple organizations with complete data isolation:

### Key Features:
- **Organization-Based Authentication**: Users login with organization name + email + password
- **Data Isolation**: Each organization only sees its own data (products, categories, users, etc.)
- **Unique Email Per Organization**: Same email can exist in different organizations
- **Organization Name Required**: Organization name is required for both login and registration
- **Case-Insensitive Organization Names**: Organization names are matched case-insensitively

### How It Works:
1. **Registration**: New users create an organization during signup
2. **Login**: Users must provide organization name along with credentials
3. **Data Filtering**: All queries automatically filter by `organizationId`
4. **Staff Management**: Admins can add staff members to their organization

## 📚 Features Documentation

### 1. Dashboard

The dashboard provides an overview of your inventory:
- **Products Overview**: Total, active, low stock, and out of stock items
- **Categories Overview**: Total categories, active categories, and category with most products
- **Product Expiration Tracking**: 
  - Total products with expiration dates
  - Expired products
  - Products expiring soon (within 30 days)
  - Active expiration (more than 30 days)

**Usage**: Click on any card to filter and view related data.

### 2. Products Management

#### Features:
- Create, read, update, and delete products
- Assign products to categories
- Set SKU (must be unique per organization)
- Set pricing (cost price and selling price)
- Track stock levels
- Set minimum stock threshold
- Add product descriptions and images
- Set expiration dates (optional)
- Stock movement tracking

#### Filters:
- Search by name, SKU, or description
- Filter by category
- Filter by status (Active/Inactive)
- Filter by stock level (Low Stock, Out of Stock)
- Filter by expiration status:
  - Has expiration date
  - Expired
  - Expiring soon (30 days)
  - Active expiration

#### Stock Management:
- **IN**: Add stock to inventory
- **OUT**: Remove stock from inventory
- **ADJUSTMENT**: Adjust stock to a specific quantity

### 3. Categories Management

#### Features:
- Create and manage product categories
- Category descriptions
- View products in each category
- Filter categories by whether they have products

**Note**: Category names must be unique per organization.

### 4. Low Stock Alerts

Automatically identifies and displays products below their minimum stock threshold:
- Visual indicators on product cards
- Dedicated low stock alerts page
- Click to view and manage products

### 5. Product Expiration Tracking

#### Features:
- Add expiration dates to products (optional)
- Visual indicators:
  - 🔴 Red: Expired products
  - 🟡 Yellow: Expiring soon (within 30 days)
  - 🟢 Green: Active expiration (more than 30 days)
- Dashboard overview cards
- Filter products by expiration status
- Click dashboard cards to view filtered products

### 6. History & Audit Logs

Comprehensive activity tracking with multiple views:

#### Tabs:
- **All**: Complete activity history
- **Products**: Product-related activities
- **Categories**: Category-related activities
- **Stock**: Stock movement history
- **Users**: User-related activities
- **Activities**: General system activities

#### Features:
- **Search**: Search by description, user name, or entity
- **Filters**:
  - Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)
  - Entity type (Product, Category, User, etc.)
  - Date range (today, week, month, custom)
  - User filter
- **Sorting**: Sort by date, action, entity type
- **Export**: Export filtered data to CSV
- **Charts**: Visual representation of activities
- **Statistics**: Summary cards with counts

#### Charts Available:
- Activity Timeline (Area Chart)
- Action Distribution (Pie Chart)
- Entity Type Distribution (Bar Chart)
- User Activity (Bar Chart)
- Stock Quantity Trends (Line Chart)

**Access**: Only available to Admin users. Staff actions are logged but only visible to admins.

### 7. Staff Management

Admin-only feature to manage organization staff:
- Add new staff members
- View all staff in the organization
- Delete staff members (cannot delete admins)
- Staff registration creates users with STAFF role

### 8. Audit Logs

Detailed audit trail of all system activities:
- User actions (create, update, delete)
- Login/logout events
- Stock movements
- Status changes
- Timestamps and user information

## 🔌 API Documentation

### Authentication Endpoints

#### Register New Organization
```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string,
  organizationName: string
}
```

#### Login
```
POST /api/auth/login
Body: {
  organizationName: string,
  email: string,
  password: string
}
```

#### Register Staff (Admin Only)
```
POST /api/auth/register-staff
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  email: string,
  password: string,
  role?: 'STAFF' | 'ADMIN'
}
```

### Products Endpoints

#### Get All Products
```
GET /api/products?page=1&limit=10&search=&categoryId=&status=&expired=&expiringSoon=&activeExpiration=&hasExpirationDate=
Headers: Authorization: Bearer <token>
```

#### Create Product (Admin Only)
```
POST /api/products
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  sku: string,
  categoryId: string,
  description?: string,
  imageUrl?: string,
  costPrice: number,
  sellingPrice: number,
  currentStock: number,
  minimumStock: number,
  unit?: string,
  status?: 'ACTIVE' | 'INACTIVE',
  expirationDate?: string (ISO date)
}
```

#### Update Product (Admin/Staff)
```
PATCH /api/products/:id
Headers: Authorization: Bearer <token>
Body: { ...product fields }
```

#### Delete Product (Admin Only)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
```

#### Get Expiration Statistics
```
GET /api/products/expiration-stats
Headers: Authorization: Bearer <token>
```

### Categories Endpoints

#### Get All Categories
```
GET /api/categories
Headers: Authorization: Bearer <token>
```

#### Create Category (Admin Only)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  description?: string
}
```

### Stock Endpoints

#### Create Stock Movement (Admin/Staff)
```
POST /api/stock/movement
Headers: Authorization: Bearer <token>
Body: {
  productId: string,
  quantity: number,
  type: 'IN' | 'OUT' | 'ADJUSTMENT',
  reason: string,
  targetStock?: number (for ADJUSTMENT)
}
```

#### Get Stock History
```
GET /api/stock/history?page=1&limit=10&productId=&type=&startDate=&endDate=
Headers: Authorization: Bearer <token>
```

### History Endpoints

#### Get Audit Logs (Admin Only)
```
GET /api/exports/history?entityType=&action=&startDate=&endDate=&userId=&page=1&limit=50
Headers: Authorization: Bearer <token>
```

#### Export History to CSV (Admin Only)
```
GET /api/exports/history-csv?entityType=&action=&startDate=&endDate=&userId=
Headers: Authorization: Bearer <token>
```

## 🔐 Authentication & Authorization

### JWT Authentication
- Tokens are valid for 7 days
- Tokens include: `userId`, `email`, `role`, `organizationId`
- Tokens are sent in `Authorization: Bearer <token>` header

### Role-Based Access Control

#### Admin Role:
- ✅ Full access to all features
- ✅ Can create/edit/delete products and categories
- ✅ Can add/manage staff members
- ✅ Can view history and audit logs
- ✅ Can perform stock movements

#### Staff Role:
- ✅ Can view products and categories
- ✅ Can update products (limited)
- ✅ Can perform stock movements
- ❌ Cannot delete products/categories
- ❌ Cannot manage staff
- ❌ Cannot view history (but actions are logged)

### Protected Routes
- All routes except `/login` and `/auth/callback` require authentication
- History and Staff Management routes require Admin role

## 📁 Project Structure

```
invertory managment system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/              # Authentication module
│   │   │   ├── products/          # Products module
│   │   │   ├── categories/        # Categories module
│   │   │   ├── stock/             # Stock management module
│   │   │   ├── users/             # Users module
│   │   │   ├── audit-log/         # Audit logging module
│   │   │   └── exports/           # Export functionality
│   │   ├── prisma/                # Prisma service
│   │   └── main.ts                # Application entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # API client functions
│   │   ├── components/            # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/               # React context
│   │   │   └── AuthContext.tsx
│   │   ├── pages/                 # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── LowStockAlerts.tsx
│   │   │   ├── History.tsx
│   │   │   ├── StaffManagement.tsx
│   │   │   └── Settings.tsx
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── .env                       # Frontend environment variables
│   └── package.json
│
└── README.md                      # This file
```

## 🐛 Troubleshooting

### Backend Issues

#### Database Connection Error
```
Error: Can't reach database server
```
**Solution**: 
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env` file
- Ensure database exists: `CREATE DATABASE inventory;`

#### Migration Errors
```
Error: Migration failed
```
**Solution**:
- Run `npx prisma migrate reset` (⚠️ This will delete all data)
- Or manually fix migration conflicts
- Ensure schema.prisma is up to date

#### Prisma Client Generation Error
```
EPERM: operation not permitted
```
**Solution**:
- Close any running applications using the Prisma client
- Restart your IDE
- Run `npx prisma generate` again

### Frontend Issues

#### Cannot Connect to Backend
```
Network Error: Cannot connect to backend server
```
**Solution**:
- Ensure backend is running on port 4000
- Check VITE_API_URL in `.env` file
- Verify CORS settings in backend

#### Login Not Working
```
Invalid organization name, email, or password
```
**Solution**:
- Ensure organization name matches exactly (case-insensitive)
- Verify user exists in the specified organization
- Check database for user records

#### Session Expired Errors
```
Session expired. Please login again
```
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Login again with valid credentials
- Check JWT token expiration (7 days default)

### Common Issues

#### Organization Not Found
**Solution**: 
- Organization names are case-insensitive but must match exactly
- Check for extra spaces in organization name
- Verify organization exists in database

#### Email Already Exists
**Solution**:
- Email can only exist once globally (across all organizations)
- Use a different email address for registration
- Check existing users in database

#### Product SKU Already Exists
**Solution**:
- SKU must be unique per organization
- Use a different SKU
- Check existing products in your organization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

Potential features for future development:
- [ ] Email notifications for low stock
- [ ] Barcode scanning support
- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Supplier management
- [ ] Purchase order management
- [ ] Invoice generation
- [ ] Inventory forecasting
- [ ] API rate limiting
- [ ] WebSocket for real-time updates
- [ ] Data backup and restore
- [ ] Multi-language support

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using React, NestJS, and PostgreSQL**
