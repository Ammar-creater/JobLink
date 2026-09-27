import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import applicationsAPI from '../services/applications';
import authAPI from '../services/auth';

const ManageApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'employer') {
      navigate('/jobs');
      return;
    }
    loadApplicants();
    // eslint-disable-next-line
  }, [jobId]);

  const loadApplicants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationsAPI.getJobApplicants(jobId);
      setJob(res.data.job);
      setApplications(res.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setActionMsg('');
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      setActionMsg(`Application ${newStatus} successfully`);
      loadApplicants();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
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
        <p className="text-slate-500">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link
            to="/admin"
            className="text-sm font-semibold text-indigo-100 hover:text-white mb-4 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Applicants for {job || 'this job'}
          </h1>
          <p className="text-indigo-100">
            {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'} so far.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {actionMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {actionMsg}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 px-6 text-center text-slate-500">
            No applicants yet.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {app.userId?.name || 'Applicant'}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm text-slate-600">
                      📧 {app.userId?.email || '—'}
                    </p>
                    {app.userId?.phone && (
                      <p className="text-sm text-slate-600">📞 {app.userId.phone}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Applied on {formatDate(app.createdAt)}
                    </p>
                  </div>

                  {app.userId?.resumeUrl && (
                    <a
                      href={app.userId.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo-600 hover:underline whitespace-nowrap"
                    >
                      View Resume →
                    </a>
                  )}
                </div>

                {app.coverLetter && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Cover Letter
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  {app.status !== 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(app._id, 'accepted')}
                      disabled={updatingId === app._id}
                      className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updatingId === app._id ? 'Updating...' : 'Accept'}
                    </button>
                  )}
                  {app.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(app._id, 'rejected')}
                      disabled={updatingId === app._id}
                      className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updatingId === app._id ? 'Updating...' : 'Reject'}
                    </button>
                  )}
                  {app.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(app._id, 'pending')}
                      disabled={updatingId === app._id}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
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

export default ManageApplicants;