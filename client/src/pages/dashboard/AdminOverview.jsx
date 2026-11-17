import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const roleBadgeMap = {
  jobseeker: { variant: 'brand', label: 'Jobseeker' },
  employer: { variant: 'purple', label: 'Employer' },
  admin: { variant: 'warning', label: 'Admin' },
};

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, jobsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers({ limit: 5 }),
          adminApi.getJobs({ limit: 5 }),
        ]);

        setStats(statsRes.data);
        setRecentUsers(usersRes.data || []);
        setRecentJobs(jobsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load platform statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Admin Console — Welcome, {firstName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor platform metrics, moderate job postings, and manage user accounts.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Main Aggregates Grid */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Users Stat Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Users</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {stats.users.total}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{stats.users.jobseekers} jobseekers</span>
                <span>•</span>
                <span>{stats.users.employers} employers</span>
                <span>•</span>
                <span>{stats.users.admins} admins</span>
              </div>
            </div>

            {/* Jobs Stat Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Jobs</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {stats.jobs.total}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-emerald-600 font-semibold">{stats.jobs.open} open</span>
                <span>•</span>
                <span className="text-slate-500">{stats.jobs.closed} closed</span>
              </div>
            </div>

            {/* Applications Stat Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Applications</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {stats.applications.total}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{stats.applications.pending} pending</span>
                <span>•</span>
                <span>{stats.applications.shortlisted} shortlisted</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{stats.applications.hired} hired</span>
              </div>
            </div>
          </div>

          {/* New in Last 7 Days (Three tiles row) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">New Users (7 days)</p>
                <p className="text-lg font-bold text-slate-900">+{stats.recent.usersLast7Days}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">New Jobs (7 days)</p>
                <p className="text-lg font-bold text-slate-900">+{stats.recent.jobsLast7Days}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">New Applications (7 days)</p>
                <p className="text-lg font-bold text-slate-900">+{stats.recent.applicationsLast7Days}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Activity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Users</h2>
            <Link
              to="/dashboard/admin/users"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentUsers.map((u) => {
              const badge = roleBadgeMap[u.role] || roleBadgeMap.jobseeker;
              return (
                <div
                  key={u._id}
                  className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Jobs List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Job Listings</h2>
            <Link
              to="/dashboard/admin/jobs"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentJobs.map((j) => (
              <div
                key={j._id}
                className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{j.title}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {j.company} • By {j.postedBy?.name || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={j.status === 'open' ? 'success' : 'neutral'} size="sm">
                    {j.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(j.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
