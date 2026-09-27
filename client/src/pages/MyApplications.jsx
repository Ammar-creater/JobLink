import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import applicationsAPI from '../services/applications';
import authAPI from '../services/auth';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'jobseeker') {
      // Only jobseekers can view their applications
      return;
    }
    loadApplications();
    // eslint-disable-next-line
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationsAPI.getMy();
      setApplications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-slate-500">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            My Applications
          </h1>
          <p className="text-indigo-100">
            Track the status of every job you've applied to.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-500 mb-6">
              Start browsing jobs and apply to the ones that fit you.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">
                      {app.jobId?.title || 'Job unavailable'}
                    </h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="text-sm text-slate-500 space-y-1">
                    <p>📍 {app.jobId?.location || '—'}</p>
                    <p>💰 {app.jobId?.salary || 'Negotiable'}</p>
                    <p>Applied on {formatDate(app.createdAt)}</p>
                  </div>
                </div>
                {app.jobId?._id && (
                  <Link
                    to={`/jobs/${app.jobId._id}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                  >
                    View Job →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default MyApplications;