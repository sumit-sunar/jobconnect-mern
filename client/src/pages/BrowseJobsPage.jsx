import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { jobApi } from '../api/jobApi';
import FilterBar from '../components/jobs/FilterBar';
import JobCard from '../components/jobs/JobCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function BrowseJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states initialized from URL params if present
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('keyword') || '');
  const [debouncedKeyword, setDebouncedKeyword] = useState(searchQuery);
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || searchParams.get('jobType') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedExperience, setSelectedExperience] = useState(searchParams.get('experienceLevel') || '');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Data states
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 400ms debounce on keyword input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 whenever any filter changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
  }, [debouncedKeyword, selectedLocation, selectedType, selectedCategory, selectedExperience]);

  // Fetch jobs from backend API
  useEffect(() => {
    let isCancelled = false;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page,
          limit: 10,
          sort: 'newest',
        };

        if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
        if (selectedLocation) params.location = selectedLocation;
        if (selectedType) params.jobType = selectedType;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedExperience) params.experienceLevel = selectedExperience;

        const res = await jobApi.getAllJobs(params);

        if (!isCancelled) {
          setJobs(res.data || []);
          setTotalPages(res.pages || 1);
          setTotalResults(res.total ?? (res.results || 0));
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.response?.data?.message || 'Unable to load jobs. Please check your connection.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isCancelled = true;
    };
  }, [debouncedKeyword, selectedLocation, selectedType, selectedCategory, selectedExperience, page]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedKeyword('');
    setSelectedLocation('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedExperience('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            Discover Careers
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Browse All Opportunities
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore verified tech roles across leading startups, scale-ups, and global companies.
          </p>
        </div>

        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{jobs.length}</span> of {totalResults} available jobs
        </div>
      </div>

      {/* FilterBar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedExperience={selectedExperience}
        onExperienceChange={setSelectedExperience}
        onResetFilters={handleResetFilters}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="jc-card p-6 flex flex-col justify-between animate-pulse space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-4/5" />
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-8 bg-slate-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loaded Jobs Grid or Empty State */}
      {!loading && !error && (
        <>
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No jobs matching your criteria"
              description="We couldn't find any positions matching your selected filters or search terms. Try clearing some filters to expand your search."
              actionLabel="Clear all filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  iconPosition="right"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
