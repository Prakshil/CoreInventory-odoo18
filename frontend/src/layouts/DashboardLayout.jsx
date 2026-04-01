import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowRightLeft, 
  SlidersHorizontal,
  FileSpreadsheet,
  Warehouse,
  MapPin,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Users,
  Shield,
  ClipboardList,
  Truck
} from 'lucide-react';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();

  const unreadCount = useMemo(() => {
    return notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0);
  }, [notifications]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoadingNotifications(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load notifications once the user is available (so the unread dot appears immediately).
  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Refresh when opening the dropdown.
  useEffect(() => {
    if (!notificationsOpen) return;
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Receipts', href: '/receipts', icon: ArrowDownToLine },
    { name: 'Deliveries', href: '/deliveries', icon: ArrowUpFromLine },
    { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft },
    { name: 'Adjustments', href: '/adjustments', icon: SlidersHorizontal },
    { name: 'Stock Ledger', href: '/ledger', icon: FileSpreadsheet },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
    { name: 'Locations', href: '/locations', icon: MapPin },
    { name: 'Reports', href: '/reports', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Reorder', href: '/reorder', icon: ArrowDownToLine, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
    { name: 'System Settings', href: '/admin/settings', icon: Shield, roles: ['ADMIN'] },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileSpreadsheet, roles: ['ADMIN'] },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-textNavy/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-primary/30 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-textNavy tracking-tight">Core<span className="text-primary">Inventory</span></span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
          {navigation
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-textNavy'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                {item.name}
              </NavLink>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-10">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-textNavy rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 text-textNavy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm transition-all"
                placeholder="Search products, orders, etc..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 border-l border-slate-200 pl-4 ml-4 relative">
            <button
              type="button"
              className={`relative p-2 transition-colors rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                unreadCount > 0 ? 'text-primary' : 'text-slate-400 hover:text-textNavy'
              }`}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card" />
              )}
              <Bell className="h-5 w-5" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 mt-1 w-80 bg-card border border-slate-200 rounded-2xl shadow-xl py-2 z-20">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-textNavy">Notifications</p>
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-slate-600"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </span>
                  <button
                    type="button"
                    className={`text-xs font-medium ${
                      unreadCount > 0 ? 'text-primary hover:text-primary/90' : 'text-slate-400 cursor-not-allowed'
                    }`}
                    onClick={async () => {
                      if (unreadCount <= 0) return;
                      await api.patch('/notifications/read-all');
                      await loadNotifications();
                    }}
                    disabled={unreadCount <= 0}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {loadingNotifications ? (
                    <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-default">
                      <p className="text-sm font-medium text-textNavy">No notifications</p>
                      <p className="text-xs text-slate-500 mt-1">
                        New alerts about low stock, pending deliveries, and other activity will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-default flex items-start gap-3 ${
                          !n.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${n.isRead ? 'bg-slate-300' : 'bg-accent'}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-textNavy break-words">{n.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-slate-50 pr-3 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-textNavy leading-none">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-1">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
