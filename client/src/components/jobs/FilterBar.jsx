import React from 'react';
import { Search, MapPin, Briefcase, Award, X } from 'lucide-react';
import Button from '../ui/Button';

export default function FilterBar({
  searchQuery = '',
  onSearchChange = () => {},
  selectedLocation = '',
  onLocationChange = () => {},
  selectedType = '',
  onTypeChange = () => {},
  selectedCategory = '',
  onCategoryChange = () => {},
  selectedExperience = '',
  onExperienceChange = () => {},
  onResetFilters = () => {},
}) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-card p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Keyword Search */}
        <div className="relative sm:col-span-2 lg:col-span-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Title, skill, company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        {/* Location Dropdown */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <MapPin className="h-4 w-4" />
          </div>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            aria-label="Filter by location"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-8 py-2.5 text-sm text-slate-700 focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
          >
            <option value="">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="San Francisco">San Francisco</option>
            <option value="New York">New York</option>
            <option value="Austin">Austin</option>
            <option value="Seattle">Seattle</option>
            <option value="Chicago">Chicago</option>
          </select>
        </div>

        {/* Job Type Dropdown */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            aria-label="Filter by job type"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-8 py-2.5 text-sm text-slate-700 focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Engineering">Engineering</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
            <option value="DevOps">DevOps</option>
            <option value="Product">Product</option>
          </select>
        </div>

        {/* Experience Level Dropdown */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Award className="h-4 w-4" />
          </div>
          <select
            value={selectedExperience}
            onChange={(e) => onExperienceChange(e.target.value)}
            aria-label="Filter by experience level"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-8 py-2.5 text-sm text-slate-700 focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior Level</option>
            <option value="Lead">Lead / Staff</option>
          </select>
        </div>

        {/* Action / Reset */}
        <div className="sm:col-span-2 lg:col-span-1 flex items-center">
          <Button
            variant="secondary"
            size="md"
            className="w-full justify-center text-slate-500 hover:text-slate-800"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <X className="w-4 h-4" />
            <span className="lg:hidden text-xs font-semibold ml-1">Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
