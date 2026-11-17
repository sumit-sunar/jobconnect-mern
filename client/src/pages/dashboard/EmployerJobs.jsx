import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jobApi from '../../api/jobApi';
import applicationApi from '../../api/applicationApi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Briefcase,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getMyJobs();
      const myJobs = res.data || [];
      setJobs(myJobs);

      // Fetch applicant counts in parallel
      // Cap at 20 jobs to prevent excessive fan-out in large accounts
      const jobsToFetch = myJobs.slice(0, 20);
      const results = await Promise.all(
        jobsToFetch.map(async (j) => {
          try {
            const appRes = await applicationApi.getApplicationsForJob(j._id);
            return { jobId: j._id, count: appRes.results ?? appRes.data?.length ?? 0 };
          } catch {
            return { jobId: j._id, count: 0 };
          }
        })
      );

      const map = {};
      results.forEach(({ jobId, count }) => {
        map[jobId] = count;
      });
      setApplicantsMap(map);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await jobApi.deleteJob(deleteTarget._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      setToast({ message: 'Job posting deleted successfully', type: 'success' });
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

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await jobApi.updateJob(job._id, { status: nextStatus });
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j))
      );
      setToast({
        message: `Job marked as ${nextStatus}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to toggle status',
        type: 'error',
      });
    }
  };

  const filteredJobs =
    statusFilter === 'all'
      ? jobs
      : jobs.filter((j) => j.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
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
        open={!!deleteTarget}
        title="Delete Job Posting"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All submitted candidate records for this job will also be affected.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Job Postings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View, edit, close, and review candidate applications for all your positions.
          </p>
        </div>
        <Button
          to="/dashboard/employer/jobs/new"
          variant="primary"
          icon={PlusCircle}
          size="md"
        >
          Post a New Job
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Status Filter */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'open', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? `All (${jobs.length})` : `${status} (${jobs.filter((j) => j.status === status).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Jobs Listing */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={statusFilter !== 'all' ? `No ${statusFilter} jobs` : 'No job postings yet'}
          description={
            statusFilter !== 'all'
              ? 'Try switching to another filter.'
              : 'You haven’t posted any jobs yet. Create your first listing to start receiving applications!'
          }
          actionLabel={statusFilter === 'all' ? 'Post a Job' : undefined}
          onAction={statusFilter === 'all' ? () => (window.location.href = '/dashboard/employer/jobs/new') : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card divide-y divide-slate-100 overflow-hidden">
          {filteredJobs.map((job) => {
            const applicantCount = applicantsMap[job._id] ?? 0;
            return (
              <div
                key={job._id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      to={`/dashboard/employer/jobs/${job._id}/applicants`}
                      className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <Badge
                      variant={job.status === 'open' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {job.status.toUpperCase()}
                    </Badge>
                    <Badge variant="brand" size="sm">
                      {job.jobType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span>{job.company}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-brand-600">
                      <Users className="w-3.5 h-3.5" />
                      {applicantCount} candidate{applicantCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <Button
                    to={`/dashboard/employer/jobs/${job._id}/applicants`}
                    variant="outline"
                    size="sm"
                    icon={Eye}
                  >
                    Applicants ({applicantCount})
                  </Button>

                  <Button
                    to={`/dashboard/employer/jobs/${job._id}/edit`}
                    variant="secondary"
                    size="sm"
                    icon={Edit}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(job)}
                    title={job.status === 'open' ? 'Close job' : 'Reopen job'}
                    icon={job.status === 'open' ? ToggleRight : ToggleLeft}
                    className={job.status === 'open' ? 'text-emerald-600' : 'text-slate-400'}
                  >
                    {job.status === 'open' ? 'Close' : 'Reopen'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(job)}
                    icon={Trash2}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    title="Delete Job"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
