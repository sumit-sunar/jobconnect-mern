import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jobApi from '../../api/jobApi';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import Skeleton from '../../components/ui/Skeleton';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Remote',
];

const EXPERIENCE_LEVELS = [
  'Entry',
  'Mid',
  'Senior',
  'Lead',
];

export default function EmployerJobForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    company: user?.profile?.companyName || '',
    location: user?.profile?.location || '',
    jobType: 'Full-time',
    category: '',
    experienceLevel: 'Mid',
    salaryMin: '',
    salaryMax: '',
    applicationDeadline: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    status: 'open',
  });

  // Fetch job in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await jobApi.getJobById(id);
        const job = res.data;

        // Defensive ownership check (backend checks on PUT too)
        const jobOwnerId = typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy;
        if (jobOwnerId && jobOwnerId.toString() !== user?._id?.toString() && user?.role !== 'admin') {
          setUnauthorized(true);
          return;
        }

        setFormData({
          title: job.title || '',
          company: job.company || '',
          location: job.location || '',
          jobType: job.jobType || 'Full-time',
          category: job.category || '',
          experienceLevel: job.experienceLevel || 'Mid',
          salaryMin: job.salaryMin ?? '',
          salaryMax: job.salaryMax ?? '',
          applicationDeadline: job.applicationDeadline
            ? new Date(job.applicationDeadline).toISOString().split('T')[0]
            : '',
          description: job.description || '',
          requirements: job.requirements?.length > 0 ? job.requirements : [''],
          responsibilities: job.responsibilities?.length > 0 ? job.responsibilities : [''],
          status: job.status || 'open',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, isEditMode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic list helpers (Requirements & Responsibilities)
  const handleListChange = (field, index, value) => {
    setFormData((prev) => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const handleAddListItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleRemoveListItem = (field, index) => {
    setFormData((prev) => {
      const list = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: list.length > 0 ? list : [''] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (formData.salaryMin && formData.salaryMax) {
      if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
        setError('Minimum salary cannot exceed maximum salary.');
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        category: formData.category.trim() || undefined,
        experienceLevel: formData.experienceLevel,
        description: formData.description.trim(),
        requirements: formData.requirements.map((r) => r.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.map((r) => r.trim()).filter(Boolean),
      };

      if (formData.salaryMin !== '') payload.salaryMin = Number(formData.salaryMin);
      if (formData.salaryMax !== '') payload.salaryMax = Number(formData.salaryMax);
      if (formData.applicationDeadline) payload.applicationDeadline = formData.applicationDeadline;
      if (isEditMode) payload.status = formData.status;

      if (isEditMode) {
        await jobApi.updateJob(id, payload);
      } else {
        await jobApi.createJob(payload);
      }

      navigate('/dashboard/employer/jobs', {
        state: { toastMessage: isEditMode ? 'Job updated successfully!' : 'Job created successfully!' },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save job posting';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
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
          You cannot edit this job posting because it was created by another employer.
        </p>
        <Button to="/dashboard/employer/jobs" variant="secondary" icon={ArrowLeft}>
          Back to My Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dashboard/employer/jobs"
              className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Jobs
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Job Posting' : 'Post a New Job'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEditMode
              ? 'Update details, requirements, and status for this job.'
              : 'Fill in the details below to publish a new job opening.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Job Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Job Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack Engineer"
              required
            />
            <Input
              label="Company Name *"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Location *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote, or New York, NY"
              required
            />
            <Select
              label="Job Type *"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              options={JOB_TYPES}
              required
            />
            <Select
              label="Experience Level"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              options={EXPERIENCE_LEVELS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Engineering, Design, Product"
            />
            <Input
              label="Min Salary (USD/yr)"
              name="salaryMin"
              type="number"
              value={formData.salaryMin}
              onChange={handleChange}
              placeholder="e.g. 80000"
            />
            <Input
              label="Max Salary (USD/yr)"
              name="salaryMax"
              type="number"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="e.g. 120000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Application Deadline"
              name="applicationDeadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={handleChange}
            />

            {isEditMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Job Status
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="open"
                      checked={formData.status === 'open'}
                      onChange={handleChange}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-emerald-700">Open (Accepting applicants)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="closed"
                      checked={formData.status === 'closed'}
                      onChange={handleChange}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-slate-500">Closed (Hidden from public)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Job Description *"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a comprehensive summary of the role, team, and company culture..."
            required
          />
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Requirements & Qualifications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Key skills, certifications, and technical experience needed.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => handleAddListItem('requirements')}
            >
              Add Requirement
            </Button>
          </div>

          <div className="space-y-3">
            {formData.requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleListChange('requirements', idx, e.target.value)}
                  placeholder={`Requirement #${idx + 1} (e.g. 3+ years experience with React)`}
                  className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 px-3.5 py-2 focus:outline-none focus:ring-2 focus:border-brand-600 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('requirements', idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Remove requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Key Responsibilities
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                What the candidate will own day-to-day.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => handleAddListItem('responsibilities')}
            >
              Add Responsibility
            </Button>
          </div>

          <div className="space-y-3">
            {formData.responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleListChange('responsibilities', idx, e.target.value)}
                  placeholder={`Responsibility #${idx + 1} (e.g. Design and build robust APIs)`}
                  className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 px-3.5 py-2 focus:outline-none focus:ring-2 focus:border-brand-600 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('responsibilities', idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Remove responsibility"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/dashboard/employer/jobs')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Job' : 'Publish Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
