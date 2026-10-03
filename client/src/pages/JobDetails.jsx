import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import jobsAPI from '../services/jobs';
import applicationsAPI from '../services/applications';
import authAPI from '../services/auth';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [applyErr, setApplyErr] = useState('');

  const user = authAPI.getCurrentUser();
  const isLoggedIn = authAPI.isAuthenticated();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job posting? This cannot be undone.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await jobsAPI.delete(id);
      alert('Job deleted successfully');
      navigate('/jobs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await jobsAPI.getById(id);
        setJob(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'jobseeker') {
      alert('Only job seekers can apply for jobs.');
      return;
    }
    setShowApplyModal(true);
    setApplyMsg('');
    setApplyErr('');
    // prefill resume if in user profile
    setResumeUrl(user?.resumeUrl || '');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyMsg('');
    setApplyErr('');

    try {
      await applicationsAPI.create({
        jobId: id,
        coverLetter,
        resumeUrl,
      });
      setApplyMsg('Application submitted successfully!');
      setCoverLetter('');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMsg('');
      }, 1800);
    } catch (err) {
      setApplyErr(
        err.response?.data?.message || 'Failed to submit application'
      );
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-100 rounded-2xl"></div>
          </div>
          <div className="h-96 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          ← Back to jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Job not found.</p>
        <Link to="/jobs" className="text-indigo-600 hover:underline mt-4 inline-block">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      {/* ─── Top bar ─── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── LEFT — Job details ─── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${job.type === 'internship' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {job.type}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${job.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : job.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {job.status}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full"></span>
                Job Description
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full"></span>
                  Requirements
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full border border-indigo-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.employerId && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full"></span>
                  About the Employer
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    {(job.employerId.name || 'E').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{job.employerId.name || 'Employer'}</p>
                    <p className="text-sm text-slate-500">{job.employerId.email || ''}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT — Sidebar ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Job Overview</h3>

              {/* ✅ FIXED: Admin/Employer actions */}
              {(user?.role === 'admin' || (user?.role === 'employer' && String(job.employerId?._id) === String(user?._id))) && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <Link to={`/jobs/${job._id}/edit`} className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-60">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}

              {/* ✅ FIXED: Employer link to manage applicants */}
              {user?.role === 'employer' && String(job.employerId?._id) === String(user?._id) && (
                <Link
                  to={`/jobs/${job._id}/applicants`}
                  className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm mb-5"
                >
                  View Applicants →
                </Link>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Salary</p>
                    <p className="font-semibold text-slate-800">{job.salary || 'Negotiable'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Category</p>
                    <p className="font-semibold text-slate-800">{job.category?.name || 'Uncategorized'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Deadline</p>
                    <p className="font-semibold text-slate-800">{formatDate(job.deadline)}</p>
                  </div>
                </div>
              </div>

              {/* Apply button — only for jobseekers (or guests who'll be redirected to login) */}
              {(!user || user.role === 'jobseeker') && (
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Apply Modal ─── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Apply for this Job</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              {applyErr && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {applyErr}
                </div>
              )}
              {applyMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                  {applyMsg}
                </div>
              )}

              <div>
                <label htmlFor="resumeUrl" className="block text-sm font-semibold text-slate-700 mb-2">
                  Resume URL (optional)
                </label>
                <input
                  id="resumeUrl"
                  type="text"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="coverLetter" className="block text-sm font-semibold text-slate-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  rows="5"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a good fit for this role?"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;