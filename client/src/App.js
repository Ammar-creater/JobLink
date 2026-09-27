import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';
import PostJobForm from './pages/PostJobForm';
import EditJobForm from './pages/EditJobForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import authAPI from './services/auth';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

/* ─────────────────────────────
    NAVBAR COMPONENT
───────────────────────────── */
function Navbar() {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const isLoggedIn = authAPI.isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/jobs');
    window.location.reload();
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          to="/jobs"
          className="flex items-center gap-2 group flex-shrink-0"
          onClick={closeMenu}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
          <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Job<span className="text-indigo-600">Link</span>
          </span>
        </Link>

        {/* Nav links — desktop only */}
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

          {(!isLoggedIn || (user && user.role === 'employer')) && (
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
          )}

          {isLoggedIn && user && user.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right side — auth buttons OR user info */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoggedIn && user ? (
            <>
              {/* User avatar — always visible */}
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="text-xs hidden md:block">
                  <div className="font-semibold text-slate-700">{user.name}</div>
                  <div className="text-slate-500 capitalize">{user.role}</div>
                </div>
              </div>

              {/* Logout — desktop only */}
              <button
                onClick={handleLogout}
                className="hidden md:block text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-2 sm:px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <NavLink
              to="/jobs"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`
              }
            >
              Browse Jobs
            </NavLink>

            {(!isLoggedIn || (user && user.role === 'employer')) && (
              <NavLink
                to="/jobs/new"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`
                }
              >
                Post a Job
              </NavLink>
            )}

            {isLoggedIn && user && user.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                  }`
                }
              >
                Admin
              </NavLink>
            )}

            {isLoggedIn && (
              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────
    FOOTER COMPONENT
───────────────────────────── */
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
  );
}

export default App;