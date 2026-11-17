import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, ArrowRight, Building2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function JobCard({ job }) {
  if (!job) return null;

  const jobId = job._id || job.id;
  const jobType = job.jobType || job.type || 'Full-time';

  const getTypeVariant = (type) => {
    switch (type) {
      case 'Full-time':
        return 'brand';
      case 'Remote':
        return 'success';
      case 'Contract':
        return 'warning';
      case 'Part-time':
        return 'info';
      case 'Internship':
        return 'purple';
      default:
        return 'neutral';
    }
  };

  // Format salary range
  const formatSalary = () => {
    if (job.salary) return job.salary;
    const { salaryMin, salaryMax } = job;
    if (!salaryMin && !salaryMax) return null;

    const fmt = (num) => (num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num.toLocaleString()}`);

    if (salaryMin && salaryMax) {
      return `${fmt(salaryMin)} – ${fmt(salaryMax)}`;
    }
    if (salaryMin) {
      return `From ${fmt(salaryMin)}`;
    }
    return `Up to ${fmt(salaryMax)}`;
  };

  // Format date posted
  const formatDate = () => {
    if (job.postedAt) return job.postedAt;
    if (!job.createdAt) return 'Recent';
    const date = new Date(job.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const tags = job.tags || job.requirements || [];
  const salaryDisplay = formatSalary();
  const dateDisplay = formatDate();

  return (
    <div className="jc-card jc-card-hover p-6 flex flex-col justify-between group">
      <div>
        {/* Top Header: Company & Badges */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200/60 flex items-center justify-center text-brand-700 font-bold text-lg shadow-sm shrink-0">
              {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </h4>
              <Link
                to={`/jobs/${jobId}`}
                className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            <Badge variant={getTypeVariant(jobType)}>
              {jobType}
            </Badge>
            {job.experienceLevel && (
              <Badge variant="neutral">
                {job.experienceLevel}
              </Badge>
            )}
            {job.featured && (
              <Badge variant="purple">
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600 font-medium"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-slate-50 text-slate-400">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info: Location, Salary & Action */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          {salaryDisplay && (
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              {salaryDisplay}
            </span>
          )}
          {dateDisplay && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {dateDisplay}
            </span>
          )}
        </div>

        <Button
          to={`/jobs/${jobId}`}
          variant="outline"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          className="shrink-0"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
