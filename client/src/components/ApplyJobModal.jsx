import React, { useState } from 'react';
import { applicationApi } from '../api/applicationApi';
import { X, Send, AlertCircle, CheckCircle2, Loader2, FileText, Link as LinkIcon } from 'lucide-react';
import Button from './ui/Button';

export default function ApplyJobModal({ isOpen, onClose, job, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const jobId = job._id || job.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const res = await applicationApi.applyToJob({
        jobId,
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess(res.data);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already applied to this job.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Apply for position
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {job.title}
            </h3>
            <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            <span>Application submitted successfully! Redirecting...</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="resumeUrl"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Resume / Portfolio URL (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <LinkIcon className="h-4 w-4" />
              </div>
              <input
                id="resumeUrl"
                type="url"
                placeholder="https://yourportfolio.com/resume.pdf"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Provide a link to your Google Drive, LinkedIn, GitHub, or online portfolio.
            </p>
          </div>

          <div>
            <label
              htmlFor="coverLetter"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Cover Note / Introduction
            </label>
            <textarea
              id="coverLetter"
              rows={5}
              maxLength={2000}
              placeholder="Introduce yourself, mention key technologies you love, and explain why you're a great fit for this team..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>Markdown and line breaks supported</span>
              <span>{coverLetter.length}/2000</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || success}
              icon={submitting ? Loader2 : Send}
            >
              {submitting ? 'Submitting...' : 'Send Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
