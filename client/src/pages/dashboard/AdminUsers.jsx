import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Users,
  Search,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const roleBadgeMap = {
  jobseeker: { variant: 'brand', label: 'Jobseeker' },
  employer: { variant: 'purple', label: 'Employer' },
  admin: { variant: 'warning', label: 'Admin' },
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Updating role state
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (roleFilter) params.role = roleFilter;

      const res = await adminApi.getUsers(params);
      setUsers(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250); // debounce input
    return () => clearTimeout(timer);
  }, [keyword, roleFilter, page]);

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser._id === currentUser._id) return;
    try {
      setUpdatingId(targetUser._id);
      await adminApi.updateUserRole(targetUser._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
      setToast({
        message: `Updated ${targetUser.name}'s role to ${newRole}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to update user role',
        type: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setToast({
        message: `Deleted account for ${deleteTarget.name} and related records`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete user',
        type: 'error',
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User Account"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.email})? All associated jobs posted by this user and all application submissions will also be deleted.`}
        confirmLabel="Delete User"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review registered accounts, modify access permissions, and manage user lifecycles.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search by name or email..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {[
            { label: 'All Roles', value: '' },
            { label: 'Jobseeker', value: 'jobseeker' },
            { label: 'Employer', value: 'employer' },
            { label: 'Admin', value: 'admin' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => {
                setRoleFilter(r.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try modifying your search keyword or selected role filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Joined</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  const badge = roleBadgeMap[u.role] || roleBadgeMap.jobseeker;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate">{u.name}</p>
                          {isSelf && (
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{u.email}</td>
                      <td className="py-4 px-6">
                        {isSelf ? (
                          <Badge variant={badge.variant} size="sm">
                            {badge.label}
                          </Badge>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            disabled={updatingId === u._id}
                            className="rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 disabled:opacity-50"
                          >
                            <option value="jobseeker">Jobseeker</option>
                            <option value="employer">Employer</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isSelf ? (
                          <span
                            className="text-xs text-slate-400 italic"
                            title="Cannot modify your own account"
                          >
                            Protected
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => setDeleteTarget(u)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete User"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalCount} total users)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
