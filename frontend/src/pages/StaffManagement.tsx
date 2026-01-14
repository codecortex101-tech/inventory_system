import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import type { User } from '../api/users';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';

export const StaffManagement = () => {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAdmin) {
      loadStaff();
    }
  }, [isAdmin]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setStaff(data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', email: '', password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.registerStaff({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'STAFF',
      });
      toast.success('Staff member added successfully');
      setShowModal(false);
      loadStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    try {
      await usersApi.delete(id);
      toast.success('Staff member deleted successfully');
      loadStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete staff member');
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-blue-100 font-bold text-lg">Access Denied</p>
        <p className="text-sm text-blue-200/80 mt-1">Only admins can access this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient mb-2">
            Staff Management
          </h1>
          <p className="mt-1 text-blue-100/90 font-semibold text-lg">Manage your organization staff</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 glow-effect border border-blue-400/30"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="glass-effect rounded-2xl overflow-hidden animate-slide-up border border-blue-400/40 shadow-2xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
            <div className="text-blue-100 font-bold">Loading staff...</div>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
              <UserIcon className="h-8 w-8 text-blue-50" />
            </div>
            <p className="text-blue-100 font-bold text-lg">No staff members found</p>
            <p className="text-sm text-blue-200/80 mt-1">Add your first staff member to get started</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-blue-400/20">
            <thead className="bg-blue-600/20 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-blue-600/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
                        <UserIcon className="h-5 w-5 text-blue-50" />
                      </div>
                      <div className="text-sm font-bold text-blue-50">
                        {member.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-blue-200/80">{member.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg ${
                        member.role === 'ADMIN'
                          ? 'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                          : 'bg-blue-600/40 text-blue-200 border border-blue-400/40'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-blue-200/80">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {member.role === 'STAFF' && (
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-blue-300 hover:bg-blue-700/30 rounded-lg transition-all hover:scale-110 border border-blue-500/40"
                        title="Delete staff member"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up border border-blue-400/40">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gradient">Add Staff Member</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="Enter staff name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-blue-400/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 bg-blue-600/30 border border-blue-400/40 rounded-xl hover:bg-blue-600/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 glow-effect border border-blue-400/30"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
