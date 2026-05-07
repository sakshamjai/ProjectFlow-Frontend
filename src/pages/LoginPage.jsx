import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearAuthError } from '../features/auth/authSlice';
import { Spinner } from '../components/Spinner';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#0a0a0a' }}
    >
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: '#0f0f0f' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(212,160,23,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #d4a017, #a07810)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: '#f5f5f5' }}>ProjectFlow</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4 leading-tight" style={{ color: '#f5f5f5' }}>
              Manage projects<br />
              <span className="gold-text">at scale</span>
            </h2>
            <p className="text-base leading-relaxed mb-10" style={{ color: '#666' }}>
              A powerful project management platform built for modern teams. Track tasks, collaborate in real-time, and ship faster.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: '⚡', text: 'Real-time task updates and tracking' },
                { icon: '🔐', text: 'Role-based access control (Admin & Member)' },
                { icon: '📊', text: 'Dashboard analytics and insights' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm" style={{ color: '#a0a0a0' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #d4a017, transparent)', transform: 'translate(30%, 30%)' }}
        />
      </div>

      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12 lg:px-12">
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #d4a017, #a07810)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold" style={{ color: '#f5f5f5' }}>ProjectFlow</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#f5f5f5' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: '#666' }}>Sign in to your account to continue</p>
        </div>

        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-6 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
            />
            {fieldErrors.email && (
              <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              style={fieldErrors.password ? { borderColor: '#ef4444' } : {}}
            />
            {fieldErrors.password && (
              <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{fieldErrors.password}</p>
            )}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
            style={{ height: 48, fontSize: '0.9375rem' }}
          >
            {loading ? (
              <>
                <Spinner size={18} />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-xs text-center mt-8" style={{ color: '#444' }}>
          Contact your administrator to get access.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
