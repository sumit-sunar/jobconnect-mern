import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  Sparkles,
  Building,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { jobApi } from '../api/jobApi';
import JobCard from '../components/jobs/JobCard';
import Button from '../components/ui/Button';

export default function HomePage() {
  const [keyword, setKeyword] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await jobApi.getAllJobs({ limit: 3, sort: 'newest' });
        if (!isCancelled && res.data) {
          setFeaturedJobs(res.data);
        }
      } catch (err) {
        // Quiet fallback if network or backend initial connection fails
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeatured();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 md:pt-20 pb-16 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Empowering Modern Software Careers
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Find the right job.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Build the future.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            JobConnect is the dedicated job platform for developers, designers, and tech leaders. Transparent compensation, modern tech stacks, and direct company connections.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-elevated flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill (e.g. React, Node, DevOps)..."
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="sm:w-auto w-full justify-center text-sm font-semibold py-3"
            >
              Search Jobs
            </Button>
          </form>

          {/* Quick trending tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Trending Tech:</span>
            {['React', 'Node.js', 'Remote', 'MERN Stack', 'DevOps'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-600 transition-colors text-slate-600"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-slate-200/70 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">4,500+</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Active Opportunities</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">850+</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Verified Companies</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">$125k</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Avg. Tech Salary</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">98%</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Positive Response Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              Latest Tech Openings
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Opportunities
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top roles with competitive compensation, flexible culture, and verified companies.
            </p>
          </div>
          <Button
            to="/jobs"
            variant="outline"
            icon={ArrowRight}
            iconPosition="right"
          >
            Explore all jobs
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/80">
            <Loader2 className="w-7 h-7 text-brand-600 animate-spin mr-3" />
            <span className="text-sm text-slate-500">Loading latest opportunities...</span>
          </div>
        )}

        {/* Featured jobs cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">No open positions found. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* How it Works / Why JobConnect */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Why Engineers Choose JobConnect
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Built specifically for the software development ecosystem, eliminating standard recruitment frustrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Curated Tech Stacks
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter roles by exact languages and frameworks: React, Node.js, Express, MongoDB, Docker, and beyond.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                100% Verified Employers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every posting is vetted. Say goodbye to ghost jobs, staffing agency spam, and undisclosed salary ranges.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Fast Direct Connection
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct access to engineering hiring managers. Get swift feedback and accelerate your hiring timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Employer CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white p-8 sm:p-12 lg:p-16 shadow-elevated">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Building className="w-3.5 h-3.5" />
              For Companies & Recruiters
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Hiring exceptional software engineers?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
              Showcase your team, culture, and projects to active full-stack developers looking for their next venture.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                to="/register"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Post an Open Role
              </Button>
              <Button
                to="/jobs"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Browse All Openings
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
