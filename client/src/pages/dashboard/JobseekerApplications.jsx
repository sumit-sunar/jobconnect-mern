import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationApi from '../../api/applicationApi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  FileText,
  Briefcase,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  Filter,
} from 'lucide-react';

const statusBadgeMap = {
  pending: { variant: 'warning', label: 'Pending' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'purple', label: 'Shortlisted' },
  rejected: { variant: 'neutral', label: 'Rejected' },
  hired: { variant: 'success', label: 'Hired' },
};

const statusFilters = ['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

export default function JobseekerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Withdraw dialog state
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getMyApplications();
      setApplications(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      setWithdrawing(true);
      await applicationApi.withdrawApplication(withdrawTarget._id);
      setApplications((prev) => prev.filter((a) => a._id !== withdrawTarget._id));
      setToast({ message: 'Application withdrawn successfully', type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to withdraw application';
      setToast({ message: msg, type: 'error' });
    } finally {
      setWithdrawing(false);
      setWithdrawTarget(null);
    }
  };

  const filteredApps =
    statusFilter === 'all'
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-full max-w-md" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

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
        open={!!withdrawTarget}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application to "${withdrawTarget?.job?.title || 'this job'}"? This action cannot be undone.`}
        confirmLabel="Withdraw"
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawTarget(null)}
        loading={withdrawing}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track and manage all your job applications.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Status Filter */}
      {applications.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? `All (${applications.length})` : status}
            </button>
          ))}
        </div>
      )}

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            statusFilter !== 'all'
              ? `No ${statusFilter} applications`
              : 'No applications yet'
          }
          description={
            statusFilter !== 'all'
              ? 'Try a different filter to see your applications.'
              : 'Start your job search by browsing open positions.'
          }
          actionLabel={statusFilter === 'all' ? 'Browse Jobs' : undefined}
          onAction={statusFilter === 'all' ? () => (window.location.href = '/jobs') : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card divide-y divide-slate-100">
          {filteredApps.map((app) => {
            const badge = statusBadgeMap[app.status] || statusBadgeMap.pending;
            return (
              <div
                key={app._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors"
                    >
                      {app.job?.title || 'Untitled Job'}
                    </Link>
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
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

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    to={`/jobs/${app.job?._id}`}
                  >
                    View Job
                  </Button>
                  {(app.status === 'pending' || app.status === 'reviewed') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setWithdrawTarget(app)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
