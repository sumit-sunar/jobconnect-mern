import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Building2,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Check,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../api/jobApi';
import { applicationApi } from '../api/applicationApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ApplyJobModal from '../components/ApplyJobModal';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Application state
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Fetch job details
  useEffect(() => {
    let isCancelled = false;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        setNotFound(false);

        const res = await jobApi.getJobById(id);
        if (!isCancelled && res.data) {
          setJob(res.data);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.response?.status === 404 || err.response?.status === 400) {
            setNotFound(true);
          } else {
            setError(err.response?.data?.message || 'Failed to load job details');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchJob();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Check if current jobseeker has already applied to this job
  useEffect(() => {
    let isCancelled = false;

    const checkAppliedStatus = async () => {
      if (!user || user.role !== 'jobseeker') {
        return;
      }
      try {
        setCheckingApplication(true);
        const res = await applicationApi.getMyApplications();
        if (!isCancelled && res.data) {
          const applied = res.data.some((app) => {
            const appJobId = app.job?._id || app.job?.id || app.job;
            return String(appJobId) === String(id);
          });
          setHasApplied(applied);
        }
      } catch (err) {
        // Silently fail application check
      } finally {
        if (!isCancelled) {
          setCheckingApplication(false);
        }
      }
    };

    checkAppliedStatus();
    return () => {
      isCancelled = true;
    };
  }, [id, user]);

  // Handle "Apply Now" button click
  const handleApplyClick = () => {
    // 1. If not logged in -> redirect to login with return path
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // 2. If not jobseeker -> do nothing (button disabled anyway)
    if (user.role !== 'jobseeker') {
      return;
    }

    // 3. Open apply modal
    setIsApplyModalOpen(true);
  };

  const handleApplicationSuccess = (applicationData) => {
    setHasApplied(true);
    setToastMessage('Application submitted successfully!');
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Salary format helper — handles {min,max,currency} object or flat salaryMin/salaryMax
  const formatSalary = () => {
    if (!job) return null;
    const fmt = (num) => (num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num.toLocaleString()}`);
    if (job.salary && typeof job.salary === 'object') {
      const { min, max } = job.salary;
      if (min && max) return `${fmt(min)} – ${fmt(max)}`;
      if (min) return `From ${fmt(min)}`;
      if (max) return `Up to ${fmt(max)}`;
      return null;
    }
    if (typeof job.salary === 'string') return job.salary;
    const { salaryMin, salaryMax } = job;
    if (!salaryMin && !salaryMax) return null;
    if (salaryMin && salaryMax) return `${fmt(salaryMin)} – ${fmt(salaryMax)}`;
    if (salaryMin) return `From ${fmt(salaryMin)}`;
    return `Up to ${fmt(salaryMax)}`;
  };

  // Date format helper
  const formatDate = () => {
    if (!job?.createdAt) return 'Recently posted';
    const date = new Date(job.createdAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse space-y-6">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not Found state
  if (notFound || !job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Posting Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The job listing with ID #{id} does not exist or has been removed.
        </p>
        <Button to="/jobs" variant="primary" icon={ArrowLeft}>
          Back to all jobs
        </Button>
      </div>
    );
  }

  const isClosed = job.status === 'closed';
  const isEmployerOrAdmin = user && (user.role === 'employer' || user.role === 'admin');
  const salaryString = formatSalary();
  const dateString = formatDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col gap-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all jobs
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-extrabold text-2xl shadow-sm shrink-0">
              {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-base font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {job.company}
                </span>
                <Badge variant={job.jobType === 'Remote' ? 'success' : 'brand'}>
                  {job.jobType || job.type || 'Full-time'}
                </Badge>
                {isClosed && <Badge variant="warning">Closed</Badge>}
                {job.experienceLevel && <Badge variant="neutral">{job.experienceLevel}</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={isSaved ? Check : Bookmark}
              onClick={() => setIsSaved(!isSaved)}
              type="button"
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>

            {/* Apply Button with state decisions */}
            {isClosed ? (
              <Button variant="secondary" size="lg" disabled>
                No longer accepting applications
              </Button>
            ) : isEmployerOrAdmin ? (
              <Button
                variant="secondary"
                size="lg"
                disabled
                title="Only job seekers can apply"
              >
                Only job seekers can apply
              </Button>
            ) : hasApplied ? (
              <Button
                variant="secondary"
                size="lg"
                icon={CheckCircle2}
                disabled
                className="text-emerald-700 bg-emerald-50 border-emerald-200"
              >
                Applied
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={Send}
                onClick={handleApplyClick}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Metadata ribbon */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Location</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              {job.location}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Compensation</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              {salaryString || 'Competitive'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Category</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-600" />
              {job.category || 'Engineering'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Posted Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              {dateString}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Job Description & Lists */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About the Role</h2>
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Key Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Qualifications & Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Company & Summary Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Company Overview</h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">
                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{job.company}</h4>
                <p className="text-xs text-slate-500">{job.category || 'Technology'}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Headquarters</span>
                <span className="font-semibold text-slate-700">{job.location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Role Type</span>
                <span className="font-semibold text-slate-700">{job.jobType || 'Full-time'}</span>
              </div>
              {salaryString && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Salary</span>
                  <span className="font-semibold text-slate-700">{salaryString}</span>
                </div>
              )}
              {job.postedBy?.name && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Hiring Manager</span>
                  <span className="font-semibold text-slate-700">{job.postedBy.name}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              {isClosed ? (
                <Button variant="secondary" className="w-full justify-center" disabled>
                  Position Closed
                </Button>
              ) : isEmployerOrAdmin ? (
                <Button variant="secondary" className="w-full justify-center" disabled>
                  Only job seekers can apply
                </Button>
              ) : hasApplied ? (
                <Button
                  variant="secondary"
                  className="w-full justify-center text-emerald-700 bg-emerald-50 border-emerald-200"
                  icon={CheckCircle2}
                  disabled
                >
                  Applied
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  size="lg"
                  icon={Send}
                  onClick={handleApplyClick}
                >
                  Apply For This Position
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
