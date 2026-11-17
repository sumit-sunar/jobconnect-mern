import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jobApi from '../../api/jobApi';
import applicationApi from '../../api/applicationApi';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import {
  Briefcase,
  CheckCircle,
  Users,
  Star,
  PlusCircle,
  ArrowRight,
  Eye,
  Edit,
} from 'lucide-react';

const statusBadgeMap = {
  pending: { variant: 'warning', label: 'Pending' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'purple', label: 'Shortlisted' },
  rejected: { variant: 'neutral', label: 'Rejected' },
  hired: { variant: 'success', label: 'Hired' },
};

export default function EmployerOverview() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [allApplicants, setAllApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch employer's jobs
        const jobsRes = await jobApi.getMyJobs();
        const myJobs = jobsRes.data || [];
        setJobs(myJobs);

        if (myJobs.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Fetch applicants for all jobs in parallel (capped at first 20 if very large)
        const jobsToFetch = myJobs.slice(0, 20);
        const applicantResults = await Promise.all(
          jobsToFetch.map(async (j) => {
            try {
              const res = await applicationApi.getApplicationsForJob(j._id);
              return { jobId: j._id, applications: res.data || [] };
            } catch (err) {
              return { jobId: j._id, applications: [] };
            }
          })
        );

        const appMap = {};
        const combined = [];
        applicantResults.forEach(({ jobId, applications }) => {
          appMap[jobId] = applications.length;
          applications.forEach((app) => {
            combined.push({
              ...app,
              jobTitle: myJobs.find((j) => j._id === jobId)?.title || 'Job',
              jobId,
            });
          });
        });

        // Sort recent applicants descending by date
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setApplicantsByJob(appMap);
        setAllApplicants(combined);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard overview');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const stats = {
    totalJobs: jobs.length,
    openJobs: jobs.filter((j) => j.status === 'open').length,
    totalApplicants: allApplicants.length,
    shortlistedApplicants: allApplicants.filter((a) => a.status === 'shortlisted').length,
  };

  const recentJobs = jobs.slice(0, 5);
  const recentApplicants = allApplicants.slice(0, 5);

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
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your company postings, review applicants, and track recruitment.
          </p>
        </div>
        <Button
          to="/dashboard/employer/jobs/new"
          variant="primary"
          icon={PlusCircle}
          size="md"
        >
          Post a Job
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Total Jobs Posted" value={stats.totalJobs} color="purple" />
        <StatCard icon={CheckCircle} label="Open Jobs" value={stats.openJobs} color="emerald" />
        <StatCard icon={Users} label="Total Applicants" value={stats.totalApplicants} color="sky" />
        <StatCard icon={Star} label="Shortlisted" value={stats.shortlistedApplicants} color="amber" />
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Start building your team today! Post a new job opportunity to reach thousands of qualified candidates."
          actionLabel="Post your first job"
          onAction={() => (window.location.href = '/dashboard/employer/jobs/new')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Postings</h2>
              {jobs.length > 5 && (
                <Link
                  to="/dashboard/employer/jobs"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/dashboard/employer/jobs/${job._id}/applicants`}
                      className="text-sm font-semibold text-slate-900 hover:text-brand-600 truncate block"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Badge
                        variant={job.status === 'open' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {job.status.toUpperCase()}
                      </Badge>
                      <span>•</span>
                      <span>{applicantsByJob[job._id] ?? 0} applicant(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      to={`/dashboard/employer/jobs/${job._id}/applicants`}
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      title="View Applicants"
                    />
                    <Button
                      to={`/dashboard/employer/jobs/${job._id}/edit`}
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      title="Edit Job"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applicants */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Applicants</h2>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {recentApplicants.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No applicants received yet across your job postings.
                </div>
              ) : (
                recentApplicants.map((app) => {
                  const badge = statusBadgeMap[app.status] || statusBadgeMap.pending;
                  return (
                    <div
                      key={app._id}
                      className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {app.applicant?.name || 'Candidate'}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          Applied to <span className="font-medium text-slate-700">{app.jobTitle}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                        <Link
                          to={`/dashboard/employer/jobs/${app.jobId}/applicants`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
