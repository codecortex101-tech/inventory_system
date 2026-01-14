import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-effect border-b border-blue-400/30 shadow-2xl bg-gradient-to-r from-blue-600/20 to-blue-800/10">
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-2xl glow-effect transform hover:scale-110 transition-transform duration-300">
            <span className="text-blue-50 font-bold text-base">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-blue-100 drop-shadow-lg">
              Welcome, {user?.name} 👋
            </h2>
            <p className="text-sm text-blue-200/90 font-semibold">{user?.email}</p>
            {(user?.organizationName || user?.organization?.name) && (
              <p className="text-xs text-blue-300/80 font-medium mt-1">
                {user.organizationName || user.organization?.name}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-blue-50 gradient-danger rounded-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 glow-effect border border-blue-400/30"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
