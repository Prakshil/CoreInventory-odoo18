import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import Products from '../pages/products/Products';
import Categories from '../pages/categories/Categories';
import Warehouses from '../pages/warehouses/Warehouses';
import Locations from '../pages/locations/Locations';
import Receipts from '../pages/receipts/Receipts';
import Deliveries from '../pages/deliveries/Deliveries';
import Transfers from '../pages/transfers/Transfers';
import Adjustments from '../pages/adjustments/Adjustments';
import Ledger from '../pages/ledger/Ledger';
import Settings from '../pages/settings/Settings';
import RoleRoute from '../components/RoleRoute';
import Reports from '../pages/reports/Reports';
import Suppliers from '../pages/suppliers/Suppliers';
import ReorderRecommendations from '../pages/reports/ReorderRecommendations';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminSettings from '../pages/admin/AdminSettings';
import AuditLogs from '../pages/admin/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="adjustments" element={<Adjustments />} />
        <Route path="ledger" element={<Ledger />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="locations" element={<Locations />} />
        <Route path="settings" element={<Settings />} />

        {/* Viewer-focused */}
        <Route path="reports" element={<RoleRoute allow={['ADMIN', 'MANAGER', 'VIEWER']}><Reports /></RoleRoute>} />

        {/* Manager-focused */}
        <Route path="suppliers" element={<RoleRoute allow={['ADMIN', 'MANAGER']}><Suppliers /></RoleRoute>} />
        <Route path="reorder" element={<RoleRoute allow={['ADMIN', 'MANAGER']}><ReorderRecommendations /></RoleRoute>} />

        {/* Admin-focused */}
        <Route path="admin/users" element={<RoleRoute allow={['ADMIN']}><AdminUsers /></RoleRoute>} />
        <Route path="admin/settings" element={<RoleRoute allow={['ADMIN']}><AdminSettings /></RoleRoute>} />
        <Route path="admin/audit-logs" element={<RoleRoute allow={['ADMIN']}><AuditLogs /></RoleRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
