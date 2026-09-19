import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';
import PostJobForm from './pages/PostJobForm';
import EditJobForm from './pages/EditJobForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* ─────────────────────────────
            NAVBAR
        ───────────────────────────── */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link to="/jobs" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                Job<span className="text-indigo-600">Link</span>
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`
                }
              >
                Browse Jobs
              </NavLink>
              <NavLink
                to="/jobs/new"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`
                }
              >
                Post a Job
              </NavLink>
            </nav>

            {/* Auth buttons (placeholders until feature/auth merges) */}
            <div className="flex items-center gap-2">
              <Link
                to="/jobs/new"
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Post Job
              </Link>
            </div>
          </div>
        </header>

        {/* ─────────────────────────────
            MAIN CONTENT
        ───────────────────────────── */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<JobListing />} />
            <Route path="/jobs" element={<JobListing />} />
            <Route path="/jobs/new" element={<PostJobForm />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
			<Route path="/jobs/:id/edit" element={<EditJobForm />} />
          </Routes>
        </main>

        {/* ─────────────────────────────
            FOOTER
        ───────────────────────────── */}
        <footer className="bg-slate-900 text-slate-300 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-white">
                    Job<span className="text-indigo-400">Link</span>
                  </span>
                </div>
                <p className="text-sm text-slate-400 max-w-md">
                  Connecting talented job seekers and students with employers
                  offering jobs and internships. Built as a learning project
                  by Noreen &amp; Eman.
                </p>
              </div>

              {/* Quick links */}
              <div>
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/jobs" className="hover:text-indigo-400 transition-colors">
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/jobs/new" className="hover:text-indigo-400 transition-colors">
                      Post a Job
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                  Contact
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>joblink@example.com</li>
                  <li>Lahore, Pakistan</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} JobLink — A Job &amp; Internship Portal. Educational project.</p>
              <p>Built with the MERN stack</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;