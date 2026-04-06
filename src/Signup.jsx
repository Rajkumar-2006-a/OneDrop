import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Loginpage.css"; // Reuse existing styles

function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        blood_group: "",
        phone: "",
        city: "",
        is_donor: false
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            alert("Registration Successful! Please login.");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                <div className="login-card signup-card">
                    <div className="login-header">
                        <div className="logo-icon"></div>
                        <h2>Join Us</h2>
                        <p>Become a donor today</p>
                    </div>

                    <form className="login-form" onSubmit={handleSignup}>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                                <label>Full Name</label>
                                <span className="input-line"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                                <label>Email Address</label>
                                <span className="input-line"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} />
                                <label>Password</label>
                                <span className="input-line"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <select name="blood_group" required value={formData.blood_group} onChange={handleChange} style={{
                                    width: '100%', background: '#1a1012', border: '1px solid #351a1a',
                                    color: 'white', padding: '12px', borderRadius: '6px'
                                }}>
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-options-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <div className="input-wrapper">
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                                    <label>Phone</label>
                                    <span className="input-line"></span>
                                </div>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <div className="input-wrapper">
                                    <input type="text" name="city" required value={formData.city} onChange={handleChange} />
                                    <label>City</label>
                                    <span className="input-line"></span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            <input
                                type="checkbox"
                                name="is_donor"
                                id="is_donor"
                                checked={formData.is_donor}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#c0392b' }}
                            />
                            <label htmlFor="is_donor" style={{ cursor: 'pointer', fontSize: '15px' }}>
                                Want to be a blood donor?
                            </label>
                        </div>

                        {error && <div className="error-message show" style={{ marginBottom: '10px' }}>{error}</div>}

                        <button type="submit" className={`login-btn btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                            <span className="btn-text">{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                            <span className="btn-loader"></span>
                            <span className="btn-glow"></span>
                        </button>

                        <div className="register-link">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;

