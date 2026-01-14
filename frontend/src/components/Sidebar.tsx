import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Low Stock Alerts', href: '/low-stock', icon: ExclamationTriangleIcon },

  // Admin-only
  { name: 'History', href: '/history', icon: ClockIcon, adminOnly: true },
  { name: 'Staff Management', href: '/staff', icon: UserGroupIcon, adminOnly: true },
  { name: 'Audit Logs', href: '/audit-logs', icon: DocumentTextIcon, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, adminOnly: true },
];

export const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <div className="w-64 glass-effect border-r border-blue-400/30 flex flex-col shadow-2xl">
      
      {/* Header */}
      <div className="p-6 border-b border-blue-400/30 bg-gradient-to-r from-blue-600/20 to-blue-800/10">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center shadow-2xl glow-effect">
            <img
              src="/logo.svg"
              alt="Inventory Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML =
                  '<span class="text-white font-bold text-2xl">📦</span>';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-blue-100">
              Inventory
            </h1>
            <p className="text-xs text-blue-200/90 font-semibold">
              Management Hub
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navigation
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/40 to-blue-600/30 text-blue-50 font-bold shadow-xl border border-blue-400/40'
                    : 'text-blue-200/80 hover:bg-blue-600/20 hover:text-blue-50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-300 to-blue-500 rounded-r-full" />
                )}

                <item.icon className="h-5 w-5 mr-3" />
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-400/30 bg-gradient-to-r from-blue-600/20 to-blue-800/10">
        <div className="flex items-center justify-between">
          <p className="text-xs text-blue-200/90 font-semibold">
            Access Level:
          </p>
          <span
            className={`px-3 py-2 rounded-xl text-xs font-bold ${
              isAdmin
                ? 'gradient-accent text-blue-50'
                : 'bg-blue-600/30 text-blue-200 border border-blue-400/30'
            }`}
          >
            {isAdmin ? '👑 Admin' : '👤 Staff'}
          </span>
        </div>
      </div>
    </div>
  );
};
