import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, createUser, clearCreateUserState, fetchUsers, getMe } from '../features/auth/authSlice';
import Modal from '../components/Modal';
import { Spinner } from '../components/Spinner';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'Tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

function CreateMemberModal({ onClose }) {
  const dispatch = useDispatch();
  const { createUserLoading, createUserError, createUserSuccess } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'member' });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createUser(form));
    if (createUser.fulfilled.match(res)) {
      dispatch(fetchUsers());
      setForm({ username: '', email: '', password: '', role: 'member' });
    }
  };

  const handleClose = () => {
    dispatch(clearCreateUserState());
    onClose();
  };

  return (
    <Modal title="Create Team Member" onClose={handleClose}>
      {createUserError && (
        <div
          className="px-4 py-3 rounded-lg mb-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          {createUserError}
        </div>
      )}
      {createUserSuccess && (
        <div
          className="px-4 py-3 rounded-lg mb-4 text-sm"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}
        >
          ✓ Member created successfully! You can create another or close.
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Full Name</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="John Doe"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@company.com"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            className="input-field"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="label">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="input-field">
            <option value="member">Member</option>
          </select>
          <p className="text-xs mt-1.5" style={{ color: '#555' }}>Admins can only create members.</p>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={handleClose}>Close</button>
          <button type="submit" className="btn-primary" disabled={createUserLoading}>
            {createUserLoading ? <><Spinner size={16} /> Creating...</> : 'Create Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Sidebar({ onClose, onCreateMember }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await dispatch(logout());
    // Hard redirect to ensure all state and cookies are fully cleared
    window.location.href = '/login';
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{ background: '#111111', borderRight: '1px solid #1e1e1e', width: '260px' }}
    >
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #d4a017, #a07810)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold" style={{ color: '#f5f5f5' }}>ProjectFlow</h1>
          <p className="text-xs capitalize" style={{ color: '#d4a017' }}>{user?.role}</p>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden" style={{ color: '#666' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="mx-1 my-2" style={{ height: 1, background: '#1e1e1e' }} />
            <p className="px-4 text-xs font-semibold mb-1" style={{ color: '#444' }}>ADMIN</p>
            <button
              onClick={() => { onClose(); onCreateMember(); }}
              className="sidebar-link w-full text-left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <span>Create Member</span>
            </button>
          </>
        )}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2" style={{ background: '#161616' }}>
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #d4a017, #a07810)', color: '#0a0a0a' }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>{user?.username || 'User'}</p>
            <p className="text-xs truncate" style={{ color: '#666' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="sidebar-link w-full"
          style={{ color: '#ef4444', opacity: loggingOut ? 0.6 : 1 }}
        >
          {loggingOut ? (
            <Spinner size={16} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          )}
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}

function DashboardLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);

  // If we just logged in, user only has {id, role} from login response.
  // Silently fetch the full profile so sidebar shows username/email correctly.
  useEffect(() => {
    if (user && !user.username) {
      dispatch(getMe());
    }
  }, [user, dispatch]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar onClose={() => {}} onCreateMember={() => setShowCreateMember(true)} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onCreateMember={() => { setSidebarOpen(false); setShowCreateMember(true); }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
          style={{ background: '#111111', borderBottom: '1px solid #1e1e1e' }}
        >
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#a0a0a0' }}
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#1c1c1c', border: '1px solid #2a2a2a' }}>
            <span className="text-xs" style={{ color: '#666' }}>Status:</span>
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#22c55e' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {showCreateMember && (
        <CreateMemberModal onClose={() => setShowCreateMember(false)} />
      )}
    </div>
  );
}

export default DashboardLayout;
