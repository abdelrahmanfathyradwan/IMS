import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">IMS</div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ims.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Demo Credentials:</p>
                    <code>admin@ims.com / admin123</code>
                </div>
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
          margin: 0 auto 1rem;
        }

        .login-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .login-btn {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .login-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .login-footer p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .login-footer code {
          font-size: 0.8125rem;
          color: var(--primary-light);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
        </div>
    );
}

export default Login;
