import "./Loginpage.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme } from "./ThemeContext";

function Login() {
    // State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { isDark, toggleTheme } = useTheme();

    const navigate = useNavigate();


    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Toast notification system
    const showToast = (message, type = 'success', title = '') => {
        const id = Date.now();
        const toast = { id, message, type, title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info') };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 300);
        }, 2000);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showToast('Login Successful!', 'success', 'Welcome');
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                showToast(data.message || 'Login failed', 'error', 'Error');
            }
        } catch (error) {
            console.error(error);
            showToast('An error occurred during login', 'error', 'Error');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/googleLogin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    showToast('Google Login Successful!', 'success', 'Welcome');
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    showToast(data.message || 'Google Login failed', 'error', 'Error');
                }
            } catch (error) {
                console.error(error);
                showToast('An error occurred during Google login', 'error', 'Error');
            }
        },
        onError: () => {
            showToast('Google Login Failed from popup', 'error', 'Error');
        }
    });

    return (
        <div className="login-page-wrapper">
            {/* Dark Mode Toggle - Fixed Top Right */}
            <div className="login-theme-toggle">
                <button
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    className="dark-mode-toggle"
                >
                    <div className={`toggle-track ${isDark ? 'is-dark' : ''}`}>
                        <div className="toggle-knob">{isDark ? '🌙' : '☀️'}</div>
                    </div>
                    <span>{isDark ? 'DARK' : 'LIGHT'}</span>
                </button>
            </div>
            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast ${toast.type} ${toast.hiding ? 'hiding' : ''}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✗'}
                            {toast.type === 'warning' && '⚠'}
                        </div>
                        <div className="toast-content">
                            <div className="toast-title">{toast.title}</div>
                            <div className="toast-message">{toast.message}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1 className="login-brand">One <span style={{ color: '#ff3333', textShadow: '0 0 20px rgba(255, 0, 0, 0.9), 0 0 40px rgba(255, 0, 0, 0.6)' }}>Drop</span></h1>
                        <div className="logo-icon"></div>
                        <h2>Sign In</h2>
                        <p>Access your account</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Email</label>
                                <span className="input-line"></span>
                            </div>
                            <span className="error-message"></span>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Password</label>

                                <button
                                    type="button"
                                    className="password-toggle"
                                    aria-label="Toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                >
                                    <span className={`toggle-icon ${showPassword ? 'show-password' : ''}`}></span>
                                </button>

                                <span className="input-line"></span>
                            </div>
                            <span className="error-message"></span>
                        </div>

                        <div className="form-options">
                            <div className="remember-wrapper">
                                <input type="checkbox" id="remember" name="remember" />
                                <label htmlFor="remember" className="checkbox-label">
                                    <span className="custom-checkbox"></span>
                                    Keep me signed in
                                </label>
                            </div>
                            <a href="#" className="forgot-password">
                                Forgot password?
                            </a>
                        </div>

                        {error && <div className="error-message show" style={{ marginBottom: '10px' }}>{error}</div>}
                        <button type="submit" className={`login-btn btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                            <span className="btn-text">{isLoading ? 'Signing In...' : 'Sign In'}</span>
                            <span className="btn-loader"></span>
                            <span className="btn-glow"></span>
                        </button>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="social-btn google-btn" onClick={handleGoogleLogin}>
                            <span className="social-icon google-icon"></span>
                            <span>Continue with Google</span>
                        </button>

                        <button type="button" className="social-btn apple-btn">
                            <span className="social-icon apple-icon"></span>
                            <span>Continue with Apple</span>
                        </button>
                    </div>

                    <div className="signup-link">
                        <p>
                            New here? <Link to="/signup">Create an account</Link>
                        </p>
                    </div>
                </div>

                <div className="background-effects">
                    <div className="glow-orb glow-orb-1"></div>
                    <div className="glow-orb glow-orb-2"></div>
                    <div className="glow-orb glow-orb-3"></div>
                </div>
            </div>
        </div>
    );
}

export default Login;
