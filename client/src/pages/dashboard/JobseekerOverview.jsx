import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import applicationApi from '../../api/applicationApi';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import {
  FileText,
  Clock,
  Star,
  CheckCircle,
  Briefcase,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react';

const statusBadgeMap = {
  pending: { variant: 'warning', label: 'Pending' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'purple', label: 'Shortlisted' },
  rejected: { variant: 'neutral', label: 'Rejected' },
  hired: { variant: 'success', label: 'Hired' },
};

export default function JobseekerOverview() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationApi.getMyApplications();
        setApplications(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Compute stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    hired: applications.filter((a) => a.status === 'hired').length,
  };

  const recentApps = applications.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's a summary of your job search activity.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Applications" value={stats.total} color="brand" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={Star} label="Shortlisted" value={stats.shortlisted} color="purple" />
        <StatCard icon={CheckCircle} label="Hired" value={stats.hired} color="emerald" />
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
          {applications.length > 5 && (
            <Link
              to="/dashboard/jobseeker/applications"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentApps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Briefcase}
              title="No applications yet"
              description="Start your job search! Browse open positions and submit your first application."
              actionLabel="Browse Jobs"
              onAction={() => window.location.href = '/jobs'}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentApps.map((app) => {
              const badge = statusBadgeMap[app.status] || statusBadgeMap.pending;
              return (
                <div
                  key={app._id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors"
                    >
                      {app.job?.title || 'Untitled Job'}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {app.job?.company || 'Company'}
                      </span>
                      {app.job?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
