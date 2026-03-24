import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ChatBot from "./ChatBot";
import { useTheme } from "./ThemeContext";
import "./ROG.css";


function DarkModeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button className="dark-mode-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <div className={`toggle-track ${isDark ? 'is-dark' : ''}`}>
                <div className="toggle-knob">{isDark ? '🌙' : '☀️'}</div>
            </div>
            <span>{isDark ? 'DARK' : 'LIGHT'}</span>
        </button>
    );
}

function UserDashboard() {
    const [user, setUser] = useState(null);
    const [showCampForm, setShowCampForm] = useState(false);
    const [showChatbot, setShowChatbot] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [campForm, setCampForm] = useState({
        institution_name: '',
        location: '',
        camp_date: '',
        camp_time: '',
        contact_person: '',
        contact_mobile: ''
    });
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Theme-aware color tokens (used in inline styles)
    const t = {
        bg:         isDark ? '#050505' : '#f5f5f7',
        navBg:      isDark ? 'rgba(5,5,5,0.8)' : 'rgba(255,255,255,0.92)',
        navBorder:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
        text:       isDark ? 'white' : '#1a1a2e',
        subtle:     isDark ? '#9ca3af' : '#555577',
        tamilMain:  isDark ? '#e5e5e5' : '#1a1a2e',
        cardBg:     isDark ? 'linear-gradient(145deg, rgba(25,25,25,0.9), rgba(10,10,10,0.8))' : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,245,0.9))',
        cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        statNum:    isDark ? 'white' : '#1a1a2e',
        statLabel:  isDark ? '#9ca3af' : '#555577',
        logoutBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        logoutColor:  isDark ? '#9ca3af' : '#555577',
        modalBg:    isDark ? '#111' : '#ffffff',
        modalBorder: isDark ? 'rgba(255,10,62,0.3)' : 'rgba(255,10,62,0.2)',
        inputBg:    isDark ? '#0a0a0a' : '#f9f9fb',
        inputColor: isDark ? 'white' : '#1a1a2e',
        inputBorder: isDark ? '#333' : '#ddd',
        cancelBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
        cancelColor:  isDark ? '#9ca3af' : '#555577',
    };

    // Generate Blood Rain Drops
    const drops = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + "vw",
            animationDuration: Math.random() * 2 + 1 + "s",
            animationDelay: Math.random() * 2 + "s"
        }));
    }, []);

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
        }, 4000);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleCampSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/camps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campForm)
            });

            if (response.ok) {
                showToast('Your camp request has been submitted for review', 'success', 'Request Submitted');
                setShowCampForm(false);
                setCampForm({ institution_name: '', location: '', camp_date: '', camp_time: '', contact_person: '', contact_mobile: '' });
            } else {
                showToast('Failed to submit request. Please try again.', 'error', 'Submission Failed');
            }
        } catch (error) {
            console.error(error);
            showToast('Network error. Please check your connection.', 'error', 'Connection Error');
        }
    };

    if (!user) return null;

    return (
        <div className="rog-dashboard-container" style={{
            background: t.bg,
            backgroundImage: `
                linear-gradient(rgba(255, 10, 62, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 10, 62, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>

            {/* ===== CINEMATIC GLOW EFFECTS ===== */}
            <div style={{
                position: 'fixed', top: '-30%', left: '-20%', width: '60%', height: '60%',
                background: 'radial-gradient(circle, rgba(255,10,62,0.07) 0%, transparent 70%)',
                filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', bottom: '-30%', right: '-20%', width: '60%', height: '60%',
                background: 'radial-gradient(circle, rgba(255,10,62,0.05) 0%, transparent 70%)',
                filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
            }} />

            {/* ===== BLOOD RAIN ===== */}
            <div className="blood-rain-container">
                {drops.map((drop) => (
                    <div key={drop.id} className="drop" style={{
                        left: drop.left,
                        animationDuration: drop.animationDuration,
                        animationDelay: drop.animationDelay
                    }} />
                ))}
            </div>

            {/* ===== TOAST NOTIFICATIONS ===== */}
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

            {/* ===== NAVBAR ===== */}
            <header className="rog-navbar" style={{
                background: t.navBg, backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${t.navBorder}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '28px', height: '28px', background: 'var(--rog-red)',
                        borderRadius: '4px', boxShadow: '0 0 15px rgba(255,10,62,0.5)'
                    }} />
                    <span style={{ fontSize: '1.15rem', fontWeight: '800', color: t.text, letterSpacing: '-0.5px' }}>
                        One <span style={{ color: 'var(--rog-red)' }}>Drop</span>
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DarkModeToggle />
                    <button onClick={handleLogout} style={{
                        background: 'transparent',
                        border: `1px solid ${t.logoutBorder}`,
                        color: t.logoutColor, padding: '8px 24px', fontSize: '0.75rem',
                        fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px',
                        borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: 'inherit'
                    }}>
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <div className="rog-main-content-flex">
                <div className="rog-split-layout">

                    {/* ======== LEFT SIDE ======== */}
                    <div className="rog-left-section">

                        {/* BIG HEADLINE */}
                        <h1 className="rog-marketing-headline" style={{
                            fontSize: '5.5rem', fontWeight: '900',
                            color: '#ff0a3e',
                            textShadow: '0 0 40px rgba(255,10,62,0.35)',
                            lineHeight: '1', marginBottom: '40px',
                            letterSpacing: '-3px', margin: '0 0 40px 0',
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            SAVE LIVES.
                        </h1>

                        {/* SUBTITLE */}
                        <p className="rog-marketing-sub" style={{
                            fontSize: '1.25rem', color: t.subtle,
                            lineHeight: '1.8', marginBottom: '40px', maxWidth: '600px', margin: '0 0 40px 0'
                        }}>
                            Join the elite network of donors via One Drop. Your contribution powers the future of healthcare.
                        </p>

                        {/* TAMIL TEXT */}
                        <p className="rog-tamil-text" style={{
                            fontSize: '1.4rem', fontWeight: '700',
                            lineHeight: '1.8', marginBottom: '80px', color: t.tamilMain,
                            margin: '0 0 80px 0'
                        }}>
                            <span style={{ color: '#ff0a3e', fontStyle: 'italic' }}>உங்கள் இரத்தம்,</span>{' '}
                            ஒருவரின் உயிர்.<br />
                            இரத்த தானம் செய்வோம்! உயிரைக் காப்போம்!
                        </p>

                        {/* ===== STATS CARDS ===== */}
                        <div className="rog-stats-minimal-row" style={{
                            display: 'flex', gap: '30px', marginBottom: '80px', padding: '10px 0'
                        }}>
                            {[
                                { value: user.donations_count || 1, label: 'DONATIONS' },
                                { value: (user.donations_count || 1) * 3, label: 'LIVES SAVED' },
                                { value: user.blood_group || 'B+', label: 'MY TYPE' }
                            ].map((stat, i) => (
                                <div key={i} className="rog-stat-minimal" style={{
                                    background: t.cardBg,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${t.cardBorder}`,
                                    borderRadius: '16px',
                                    width: '200px', height: '160px',
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: 'center', alignItems: 'center',
                                    position: 'relative', overflow: 'hidden',
                                    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default'
                                }}>
                                    {/* Top glow line */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                                        background: 'linear-gradient(90deg, transparent, var(--rog-red), transparent)'
                                    }} />
                                    {/* Glass overlay */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                                        pointerEvents: 'none'
                                    }} />
                                    <div style={{
                                        fontSize: '3.5rem', fontWeight: '800', color: t.statNum,
                                        lineHeight: '1', marginBottom: '10px',
                                        textShadow: isDark ? '0 0 20px rgba(255,10,62,0.3)' : 'none'
                                    }}>{stat.value}</div>
                                    <div style={{
                                        fontSize: '0.9rem', fontWeight: '700',
                                        textTransform: 'uppercase', letterSpacing: '2px',
                                        color: t.statLabel
                                    }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* ===== ORGANIZE CAMP SECTION ===== */}
                        <div className="rog-camp-text-section">
                            <h2 style={{
                                fontSize: '1.4rem', fontWeight: '800',
                                textTransform: 'uppercase', color: t.text,
                                marginBottom: '10px', letterSpacing: '0.5px',
                                margin: '0 0 10px 0'
                            }}>
                                Organize a Blood Camp
                            </h2>
                            <p style={{
                                fontSize: 'x-large', color: t.subtle,
                                maxWidth: '1000px', lineHeight: '1.6',
                                margin: '0 0 20px 0'
                            }}>
                                Host a donation drive at your institution. We provide full logistics support and medical staff. Make a massive impact today.
                            </p>
                            <button
                                onClick={() => setShowCampForm(true)}
                                style={{
                                    background: 'linear-gradient(180deg, #d30026 0%, #8a0019 100%)',
                                    color: 'white', border: 'none',
                                    padding: '14px 50px', fontSize: '0.85rem',
                                    fontWeight: '700', textTransform: 'uppercase',
                                    letterSpacing: '2px', borderRadius: '8px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.5), 0 0 20px rgba(255,0,40,0.3)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    fontFamily: 'inherit',
                                    marginTop: '10px'
                                }}
                                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                            >
                                START REQUEST
                            </button>
                        </div>
                    </div>

                    {/* ======== RIGHT SIDE: AI STATION ======== */}
                    {showChatbot && (
                        <div className="rog-right-section">

                            {/* Base Glow */}
                            <div style={{
                                position: 'absolute', bottom: '-5px', left: '50%',
                                transform: 'translateX(-50%)',
                                width: '70%', height: '10px',
                                background: 'var(--rog-red)', filter: 'blur(25px)',
                                zIndex: 0, opacity: 0.5
                            }} />

                            {/* AI Station Container */}
                            <div className="rog-ai-station" style={{
                                position: 'relative',
                                /* Background Image with Dark Overlay */
                                background: `linear-gradient(rgba(5, 5, 5, 0.4), rgba(5, 5, 5, 0.7)), url('/Backgrund.png') center/cover no-repeat`,
                                border: '1px solid rgba(255, 10, 62, 0.4)',
                                borderRadius: '24px',
                                borderBottomLeftRadius: 0, /* TOUCH BUTTON */
                                borderBottomRightRadius: 0, /* TOUCH BUTTON */
                                borderBottom: 'none',
                                overflow: 'hidden',
                                boxShadow: '0 0 60px rgba(255,10,62,0.12), inset 0 0 30px rgba(255,10,62,0.08)',
                                display: 'flex', flexDirection: 'column',
                                height: '100%',
                                minHeight: '600px',
                                backdropFilter: 'blur(20px)',
                                animation: 'pulse-border 4s infinite'
                            }}>

                                {/* Station Header with Title + Robot */}
                                <div style={{
                                    padding: '24px 28px 0',
                                    display: 'flex',
                                    justifyContent: 'center', /* CENTERED */
                                    alignItems: 'center',
                                    position: 'relative', zIndex: 2
                                }}>
                                    <div style={{
                                        fontSize: '1.5rem', fontWeight: '900', color: 'white',
                                        lineHeight: '1.25', letterSpacing: '1px',
                                        textTransform: 'uppercase', textAlign: 'center',
                                        textShadow: '0 0 20px rgba(255, 10, 62, 0.5)',
                                        fontFamily: "'Inter', sans-serif",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px'
                                    }}>
                                        <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 8px rgba(255,10,62,0.6))' }}>❤️</span>
                                        <span>AI Blood Assistant</span>
                                        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" stroke="#ff0a3e" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 5px rgba(255,10,62,0.6))' }}>
                                            <path d="M0 12h10l5-8 10 16 5-8h10l5-4 5 4h10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Close Button */}
                                        <button
                                            onClick={() => setShowChatbot(false)}
                                            style={{
                                                position: 'absolute', right: '20px',
                                                background: 'transparent', border: 'none',
                                                color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', padding: '5px',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = 'white'}
                                            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                                            title="Close Assistant"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Chat Area (fills remaining space) */}
                                <div style={{
                                    flex: 1, display: 'flex', flexDirection: 'column',
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    minHeight: 0
                                }}>
                                    <ChatBot />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Chatbot Toggle Button / Checkbox */}
            {!showChatbot && (
                <button
                    onClick={() => setShowChatbot(true)}
                    style={{
                        position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255,255,255,0.9)',
                        color: t.text, fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
                        padding: '12px 20px', borderRadius: '30px',
                        border: '1px solid rgba(255,10,62,0.3)',
                        backdropFilter: 'blur(10px)', boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    💬 AI Assistant
                </button>
            )}

            {/* ===== CAMP FORM MODAL ===== */}
            {showCampForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: t.modalBg, border: `1px solid ${t.modalBorder}`,
                        borderRadius: '16px', padding: '36px', width: '500px', maxWidth: '90vw',
                        boxShadow: '0 0 50px rgba(255,10,62,0.1)'
                    }}>
                        <h3 style={{
                            color: t.text, fontSize: 'medium', marginBottom: '24px',
                            fontWeight: '1000', margin: '0 0 24px 0'
                        }}>
                            🏥 Organize a Blood Camp
                        </h3>
                        <form onSubmit={handleCampSubmit} style={{
                            display: 'flex', flexDirection: 'column', gap: '14px'
                        }}>
                            <input type="text" placeholder="Institution Name" className="rog-input-dark"
                                value={campForm.institution_name}
                                onChange={e => setCampForm({ ...campForm, institution_name: e.target.value })} required />
                            <input type="text" placeholder="Location / Address" className="rog-input-dark"
                                value={campForm.location}
                                onChange={e => setCampForm({ ...campForm, location: e.target.value })} required />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <input type="date" className="rog-input-dark"
                                    value={campForm.camp_date}
                                    onChange={e => setCampForm({ ...campForm, camp_date: e.target.value })}
                                    required style={{ colorScheme: 'dark' }} />
                                <input type="text" placeholder="Time (e.g. 10AM - 3PM)" className="rog-input-dark"
                                    value={campForm.camp_time}
                                    onChange={e => setCampForm({ ...campForm, camp_time: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <input type="text" placeholder="Contact Person" className="rog-input-dark"
                                    value={campForm.contact_person}
                                    onChange={e => setCampForm({ ...campForm, contact_person: e.target.value })} required />
                                <input type="tel" placeholder="Mobile Number" className="rog-input-dark"
                                    value={campForm.contact_mobile}
                                    onChange={e => setCampForm({ ...campForm, contact_mobile: e.target.value })}
                                    required pattern="[0-9]{10}" title="10 digit mobile number" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="submit" style={{
                                    flex: 1, background: 'var(--rog-red)', color: 'white',
                                    border: 'none', padding: '12px', borderRadius: '8px',
                                    fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                                    fontFamily: 'inherit'
                                }}>SUBMIT</button>
                                <button type="button" onClick={() => setShowCampForm(false)} style={{
                                    flex: 1, background: 'transparent',
                                    border: `1px solid ${t.cancelBorder}`,
                                    color: t.cancelColor, padding: '12px', borderRadius: '8px',
                                    fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                                    fontFamily: 'inherit'
                                }}>CANCEL</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes pulse-border {
                    0% { border-color: rgba(255,10,62,0.35); box-shadow: 0 0 60px rgba(255,10,62,0.12), inset 0 0 30px rgba(255,10,62,0.08); }
                    50% { border-color: rgba(255,10,62,0.65); box-shadow: 0 0 80px rgba(255,10,62,0.2), inset 0 0 40px rgba(255,10,62,0.12); }
                    100% { border-color: rgba(255,10,62,0.35); box-shadow: 0 0 60px rgba(255,10,62,0.12), inset 0 0 30px rgba(255,10,62,0.08); }
                }
            `}</style>
        </div>
    );
}

export default UserDashboard;
