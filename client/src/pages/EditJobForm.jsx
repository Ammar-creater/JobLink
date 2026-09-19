import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import jobsAPI, { categoriesAPI } from '../services/jobs';

const EditJobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'job',
    category: '',
    location: '',
    salary: '',
    requirements: '',
    deadline: '',
    status: 'pending',
  });

  useEffect(() => {
    categoriesAPI.getAll().then(setCategories);
    loadJob();
    // eslint-disable-next-line
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await jobsAPI.getById(id);
      const job = res.data;

      setFormData({
        title: job.title || '',
        description: job.description || '',
        type: job.type || 'job',
        category: job.category?._id || job.category || '',
        location: job.location || '',
        salary: job.salary || '',
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join(', ')
          : '',
        deadline: job.deadline
          ? new Date(job.deadline).toISOString().split('T')[0]
          : '',
        status: job.status || 'pending',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      ...formData,
      requirements: formData.requirements
        ? formData.requirements.split(',').map((r) => r.trim()).filter(Boolean)
        : [],
      deadline: formData.deadline || undefined,
    };

    try {
      await jobsAPI.update(id, payload);
      setSuccess('Job updated successfully! Redirecting...');
      setTimeout(() => navigate(`/jobs/${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-10 w-1/2 bg-slate-200 rounded mb-6"></div>
        <div className="h-96 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      {/* Hero header */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-14">
          <Link
            to={`/jobs/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-100 hover:text-white mb-6 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Job
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Edit Job Posting
          </h1>
          <p className="text-indigo-100 max-w-2xl">
            Update the details below. Changes will apply immediately.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-6 py-10 -mt-8 relative z-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8"
        >
          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full"></span>
              Basic Information
            </h2>

            <div className="space-y-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full"></span>
              Location & Compensation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full"></span>
              Requirements, Deadline & Status
            </h2>

            <div className="space-y-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Requirements
                </label>
                <input
                  type="text"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Comma-separated: React, Node.js, 2 years experience"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="pending">Pending (Admin Review)</option>
                    <option value="approved">Approved (Live)</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              to={`/jobs/${id}`}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditJobForm;