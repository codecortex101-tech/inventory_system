import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { LowStockAlerts } from './pages/LowStockAlerts';
import { StaffManagement } from './pages/StaffManagement';
import { AuditLogs } from './pages/AuditLogs';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

const AppRoutes = () => {
  useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/low-stock"
        element={
          <ProtectedRoute>
            <Layout>
              <LowStockAlerts />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/history"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <StaffManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AuditLogs />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
