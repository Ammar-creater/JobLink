import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jobsAPI, { categoriesAPI } from '../services/jobs';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    location: '',
    type: '',
    salary: '',
  });

  useEffect(() => {
    categoriesAPI.getAll().then(setCategories);
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  const fetchJobs = async (customFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const res = await jobsAPI.getAll(customFilters);
      setJobs(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(filters);
  };

  const handleReset = () => {
    const cleared = { keyword: '', category: '', location: '', type: '', salary: '' };
    setFilters(cleared);
    fetchJobs(cleared);
  };

  // Helper — format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="animate-fade-in">
      {/* ─────────────────────────────
          HERO SECTION
      ───────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
              Find Your Dream <br />
              Job or Internship
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl">
              Discover thousands of opportunities from top companies.
              Your next career move starts here.
            </p>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-8 mt-8">
              <div>
                <div className="text-3xl font-bold">{jobs.length || '100'}+</div>
                <div className="text-sm text-indigo-200 uppercase tracking-wider mt-1">
                  Live Openings
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-indigo-200 uppercase tracking-wider mt-1">
                  Companies
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">10k+</div>
                <div className="text-sm text-indigo-200 uppercase tracking-wider mt-1">
                  Candidates
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────
          SEARCH BAR
      ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 animate-slide-up"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Keyword */}
            <div className="relative lg:col-span-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Search by job title or keyword..."
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm"
              />
            </div>

            {/* Category */}
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Location */}
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location"
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm"
              />
            </div>

            {/* Type */}
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm text-slate-700"
            >
              <option value="">All Types</option>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>

            {/* Salary */}
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <input
                type="text"
                name="salary"
                value={filters.salary}
                onChange={handleFilterChange}
                placeholder="Salary contains..."
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search Jobs
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* ─────────────────────────────
          LISTING
      ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {loading ? 'Loading...' : `${jobs.length} ${jobs.length === 1 ? 'Job' : 'Jobs'} Found`}
          </h2>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse"
              >
                <div className="h-5 w-20 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-slate-100 rounded mb-6"></div>
                <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 px-6 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No jobs match your search
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Try adjusting your filters or reset to browse all available
              opportunities.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Job cards */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="card-hover group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      job.type === 'internship'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {job.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(job.createdAt)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {job.title}
                </h3>

                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
                  {job.description}
                </p>

                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{job.salary || 'Negotiable'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span>{job.category?.name || 'Uncategorized'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    View Details
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default JobListing;