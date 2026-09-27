import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../services/admin';
import authAPI from '../services/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Job filters
  const [jobStatusFilter, setJobStatusFilter] = useState('');

  // User filters
  const [userRoleFilter, setUserRoleFilter] = useState('');

  useEffect(() => {
    // Guard: only admins can access
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/jobs');
      return;
    }
    loadAll();
    // eslint-disable-next-line
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [reportsRes, usersRes, jobsRes] = await Promise.all([
        adminAPI.getReports(),
        adminAPI.getUsers(),
        adminAPI.getJobs(),
      ]);
      setReports(reportsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const reloadJobs = async () => {
    try {
      const filters = jobStatusFilter ? { status: jobStatusFilter } : {};
      const res = await adminAPI.getJobs(filters);
      setJobs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reload jobs');
    }
  };

  const reloadUsers = async () => {
    try {
      const filters = userRoleFilter ? { role: userRoleFilter } : {};
      const res = await adminAPI.getUsers(filters);
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reload users');
    }
  };

  const handleJobStatusChange = async (jobId, newStatus) => {
    try {
      await adminAPI.updateJobStatus(jobId, newStatus);
      setActionMsg(`Job marked as "${newStatus}" successfully`);
      reloadJobs();
      // Reload reports too (numbers changed)
      const reportsRes = await adminAPI.getReports();
      setReports(reportsRes.data);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-slate-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-indigo-100">
            Manage users, review listings, and view platform activity.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Action message */}
        {actionMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {actionMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'jobs', label: 'Manage Jobs' },
            { id: 'users', label: 'Manage Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: Overview ─── */}
        {activeTab === 'overview' && reports && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={reports.users.total}
                sublabel={`${reports.users.jobseekers} seekers · ${reports.users.employers} employers`}
                color="indigo"
              />
              <StatCard
                label="Total Jobs"
                value={reports.jobs.total}
                sublabel={`${reports.jobs.approved} approved · ${reports.jobs.pending} pending`}
                color="blue"
              />
              <StatCard
                label="Pending Review"
                value={reports.jobs.pending}
                sublabel="Awaiting admin action"
                color="amber"
              />
              <StatCard
                label="Applications"
                value={reports.applications.total}
                sublabel="Submitted by job seekers"
                color="emerald"
              />
            </div>

            {/* Detailed breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Jobs by Status</h3>
                <div className="space-y-3">
                  <ProgressRow label="Approved" value={reports.jobs.approved} total={reports.jobs.total} color="emerald" />
                  <ProgressRow label="Pending" value={reports.jobs.pending} total={reports.jobs.total} color="amber" />
                  <ProgressRow label="Rejected" value={reports.jobs.rejected} total={reports.jobs.total} color="rose" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Users by Role</h3>
                <div className="space-y-3">
                  <ProgressRow label="Job Seekers" value={reports.users.jobseekers} total={reports.users.total} color="indigo" />
                  <ProgressRow label="Employers" value={reports.users.employers} total={reports.users.total} color="blue" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: Jobs ─── */}
        {activeTab === 'jobs' && (
          <div>
            {/* Filter */}
            <div className="mb-4 flex flex-wrap gap-3">
              <select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={reloadJobs}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Apply Filter
              </button>
              <button
                onClick={() => {
                  setJobStatusFilter('');
                  setTimeout(reloadJobs, 0);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Jobs table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Title</th>
                      <th className="text-left px-4 py-3 font-semibold">Employer</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 font-semibold">Posted</th>
                      <th className="text-left px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-500">
                          No jobs found.
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job._id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-800">{job.title}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {job.employerId?.name || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={job.status} />
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {job.status !== 'approved' && (
                                <button
                                  onClick={() => handleJobStatusChange(job._id, 'approved')}
                                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold text-xs rounded-lg transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {job.status !== 'rejected' && (
                                <button
                                  onClick={() => handleJobStatusChange(job._id, 'rejected')}
                                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-xs rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: Users ─── */}
        {activeTab === 'users' && (
          <div>
            {/* Filter */}
            <div className="mb-4 flex flex-wrap gap-3">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
              >
                <option value="">All Roles</option>
                <option value="jobseeker">Job Seekers</option>
                <option value="employer">Employers</option>
                <option value="admin">Admins</option>
              </select>
              <button
                onClick={reloadUsers}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Apply Filter
              </button>
              <button
                onClick={() => {
                  setUserRoleFilter('');
                  setTimeout(reloadUsers, 0);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Name</th>
                      <th className="text-left px-4 py-3 font-semibold">Email</th>
                      <th className="text-left px-4 py-3 font-semibold">Role</th>
                      <th className="text-left px-4 py-3 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                          <td className="px-4 py-3 text-slate-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/* ─────────────────────────────
    Small helper components
───────────────────────────── */
function StatCard({ label, value, sublabel, color }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-blue-500',
    blue: 'from-blue-500 to-indigo-500',
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-teal-500',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorMap[color]} mb-3`}></div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-slate-800 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{sublabel}</p>
    </div>
  );
}

function ProgressRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-rose-100 text-rose-700',
    closed: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-purple-100 text-purple-700',
    employer: 'bg-blue-100 text-blue-700',
    jobseeker: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[role] || styles.jobseeker}`}>
      {role}
    </span>
  );
}

export default AdminDashboard;