import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Briefcase,
  Search,
  Trash2,
  Filter,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle state tracking
  const [togglingId, setTogglingId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const res = await adminApi.getJobs(params);
      setJobs(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, statusFilter, page]);

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      setTogglingId(job._id);
      await adminApi.updateJobStatus(job._id, nextStatus);
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j))
      );
      setToast({
        message: `Job marked as ${nextStatus}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to toggle job status',
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.deleteJob(deleteTarget._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setToast({
        message: `Deleted "${deleteTarget.title}" and associated applications`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete job',
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
        title="Delete Job Posting"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All submitted candidate applications for this position will also be deleted.`}
        confirmLabel="Delete Job"
        onConfirm={handleDeleteJob}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Job Moderation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, toggle statuses, or remove active and archived platform job postings.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search title, company, location..."
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
            { label: 'All Jobs', value: 'all' },
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try modifying your keyword search or changing the status filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Title & Company</th>
                  <th className="py-3.5 px-6">Posted By</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                          {job.company} • {job.location}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">
                          {job.postedBy?.name || 'Unknown'}
                        </p>
                        <p className="text-slate-400">{job.postedBy?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={job.status === 'open' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {job.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          to={`/jobs/${job._id}`}
                          variant="ghost"
                          size="sm"
                          icon={ExternalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Public Listing"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(job)}
                          disabled={togglingId === job._id}
                          icon={job.status === 'open' ? ToggleRight : ToggleLeft}
                          className={job.status === 'open' ? 'text-emerald-600' : 'text-slate-400'}
                          title={job.status === 'open' ? 'Close job' : 'Reopen job'}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteTarget(job)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Job"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalCount} total jobs)
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
