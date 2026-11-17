import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import jobApi from '../../api/jobApi';
import applicationApi from '../../api/applicationApi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import {
  Users,
  ArrowLeft,
  ExternalLink,
  Mail,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Filter,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

const statusBadgeMap = {
  pending: { variant: 'warning', label: 'Pending' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'purple', label: 'Shortlisted' },
  rejected: { variant: 'neutral', label: 'Rejected' },
  hired: { variant: 'success', label: 'Hired' },
};

export default function EmployerApplicants() {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedLetter, setExpandedLetter] = useState({});
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch job details
        const jobRes = await jobApi.getJobById(jobId);
        setJob(jobRes.data);

        // 2. Fetch applicants for this job
        const appsRes = await applicationApi.getApplicationsForJob(jobId);
        setApplications(appsRes.data || []);
      } catch (err) {
        if (err.response?.status === 403) {
          setUnauthorized(true);
        } else {
          setError(err.response?.data?.message || 'Failed to load applicants');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    // Find original status for potential rollback
    const originalApp = applications.find((a) => a._id === appId);
    const prevStatus = originalApp?.status;

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      setUpdatingId(appId);
      await applicationApi.updateApplicationStatus(appId, newStatus);
      setToast({
        message: `Status updated to ${newStatus}`,
        type: 'success',
      });
    } catch (err) {
      // Revert on error
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: prevStatus } : a))
      );
      setToast({
        message: err.response?.data?.message || 'Failed to update candidate status',
        type: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleLetter = (appId) => {
    setExpandedLetter((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const filteredApps =
    statusFilter === 'all'
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 rounded-2xl" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Permission Denied</h2>
        <p className="text-sm text-slate-600">
          You cannot view applications for this job because you are not the job creator.
        </p>
        <Button to="/dashboard/employer/jobs" variant="secondary" icon={ArrowLeft}>
          Back to My Jobs
        </Button>
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

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            to="/dashboard/employer/jobs"
            className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Jobs
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Applicants: {job?.title}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {job?.company} • Total applicants: {applications.length}
            </p>
          </div>

          <Button
            to={`/jobs/${jobId}`}
            variant="secondary"
            size="sm"
            icon={ExternalLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Public Listing
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      {applications.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  statusFilter === status
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all'
                  ? `All (${applications.length})`
                  : `${status} (${applications.filter((a) => a.status === status).length})`}
              </button>
            )
          )}
        </div>
      )}

      {/* Applicants List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={Users}
          title={statusFilter !== 'all' ? `No ${statusFilter} applicants` : 'No applicants yet'}
          description={
            statusFilter !== 'all'
              ? 'Try selecting a different status filter tab.'
              : 'Candidates who apply to this posting will appear here.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const candidate = app.applicant;
            const badge = statusBadgeMap[app.status] || statusBadgeMap.pending;
            const isExpanded = expandedLetter[app._id];
            const hasCoverLetter = Boolean(app.coverLetter);
            const skills = candidate?.profile?.skills || [];
            const resumeUrl = app.resumeUrl || candidate?.profile?.resumeUrl;

            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4"
              >
                {/* Header row: Candidate name, email, badge & dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-lg shrink-0">
                      {candidate?.name ? candidate.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {candidate?.name || 'Applicant'}
                      </h3>
                      {candidate?.profile?.headline && (
                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                          {candidate.profile.headline}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        {candidate?.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Controller */}
                  <div className="flex items-center gap-3">
                    <Badge variant={badge.variant} size="md">
                      {badge.label}
                    </Badge>

                    <div className="w-36">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        disabled={updatingId === app._id}
                        className="block w-full rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Candidate Skills */}
                {skills.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs font-semibold text-slate-400 mr-1">Skills:</span>
                    {skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Resume & Metadata */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </span>

                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Resume (External)
                    </a>
                  )}

                  {hasCoverLetter && (
                    <button
                      type="button"
                      onClick={() => toggleLetter(app._id)}
                      className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors ml-auto"
                    >
                      {isExpanded ? (
                        <>
                          Hide Cover Letter <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Read Cover Letter <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expandable Cover Letter */}
                {hasCoverLetter && isExpanded && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line animate-in fade-in duration-150">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Cover Letter
                    </p>
                    {app.coverLetter}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
