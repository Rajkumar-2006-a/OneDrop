import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [campRequests, setCampRequests] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [showInventoryForm, setShowInventoryForm] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [inventoryForm, setInventoryForm] = useState({ hospital_name: '', blood_group: '', units: '' });

    // Search State
    const [searchResults, setSearchResults] = useState([]);
    const [searchCity, setSearchCity] = useState("");
    const [searchBloodGroup, setSearchBloodGroup] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Helper: Visual max for inventory bars (e.g., 100 units is "full")
    const MAX_UNITS = 100;
    const unitsToPercent = (units) => Math.min((units / MAX_UNITS) * 100, 100);

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
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin') {
                navigate("/dashboard");
            }
            setUser(parsedUser);
            // Mock data loading if API fails (for demonstration)
            loadCampRequests();
            loadInventory();
            fetchAllDonors();
        }
    }, [navigate]);

    const loadCampRequests = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/camps`);
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            // Normalize response: support array or object with 'camps' or 'data' fields
            let camps = [];
            if (Array.isArray(data)) {
              camps = data;
            } else if (Array.isArray(data.camps)) {
              camps = data.camps;
            } else if (Array.isArray(data.data)) {
              camps = data.data;
            } else {
              console.warn('Unexpected camp data format', data);
            }
            setCampRequests(camps);
        } catch (error) {
            console.error(error);
            // Fallback for demo visualization
            setCampRequests([
                { id: 1, institution_name: "Tech Institute", status: "Pending", camp_date: "2025-10-15", location: "Main Hall", contact_person: "Dr. Smith" },
                { id: 2, institution_name: "City Hospital", status: "Approved", camp_date: "2025-09-20", location: "West Wing", contact_person: "Nurse Joy" }
            ]);
        }
    };

    const fetchAllDonors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/users`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load donors', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Alias handleSearch to fetchAllDonors for simplicity in the UI if needed, 
    // or just call fetchAllDonors directly.
    // Alias handleSearch to fetchAllDonors
    const handleSearch = fetchAllDonors;

    // --- Attendance Logic ---
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [campDonors, setCampDonors] = useState([]);

    const openAttendanceModal = async (camp) => {
        setSelectedCamp(camp);
        setShowAttendanceModal(true);
        setCampDonors([]); // Clear previous
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/camps/${camp.id}/donors`);
            if (response.ok) {
                const data = await response.json();
                setCampDonors(data);
            } else {
                showToast('Failed to load donors', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading donors', 'error');
        }
    };

    const handleMarkAttendance = async (donorId, status) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/camps/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campId: selectedCamp.id,
                    userId: donorId,
                    status: status
                })
            });

            if (response.ok) {
                showToast(`Marked as ${status}`, 'success');
                // Update local state by mapping over the existing campDonors
                setCampDonors(prev => prev.map(d =>
                    d.id === donorId ? { ...d, attendance_status: status } : d
                ));
            } else {
                showToast('Failed to mark attendance', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error marking attendance', 'error');
        }
    };

    const loadInventory = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/inventory`);
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            setInventory(data);
        } catch (error) {
            console.error(error);
            // Fallback for demo visualization
            setInventory([
                { id: 1, hospital_name: "Central Bank", blood_group: "A+", units: 45 },
                { id: 2, hospital_name: "Central Bank", blood_group: "O+", units: 80 },
                { id: 3, hospital_name: "City Hospital", blood_group: "B-", units: 12 },
                { id: 4, hospital_name: "City Hospital", blood_group: "AB+", units: 30 },
            ]);
        }
    };

    const handleCampStatus = async (id, status) => {
        // Optimistic UI update
        const originalRequests = [...campRequests];
        setCampRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));

        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/camps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            showToast(`Camp request ${status.toLowerCase()}`, 'success', `Request ${status}`);
        } catch (error) {
            setCampRequests(originalRequests); // Revert on fail
            showToast('Failed to update camp status', 'error', 'Update Failed');
        }
    };

    const handleInventoryUpdate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/inventory/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inventoryForm)
            });
            loadInventory();
            setShowInventoryForm(false);
            setInventoryForm({ hospital_name: '', blood_group: '', units: '' });
            showToast('Inventory stock levels updated', 'success', 'Inventory Updated');
        } catch (error) {
            showToast('Failed to update inventory', 'error', 'Update Failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (!user) return null;

    const pendingRequests = campRequests.filter(r => r.status === 'Pending').length;
    const totalDonors = 12; // Dynamic if you have API

    return (
        <div className="rog-main-content">

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

            {/* --- TOP HEADER (User Style) --- */}
            <header className="rog-navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, var(--rog-red) 0%, #cc0831 100%)',
                        clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)',
                        boxShadow: '0 0 10px rgba(255, 10, 62, 0.4)'
                    }}></div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '1px', fontFamily: "'Orbitron', sans-serif" }}>
                        <span style={{ color: '#ffffff' }}>One</span> <span style={{ color: '#ff3333', textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.4)' }}>Drop</span>
                        <span style={{
                            fontSize: '0.9rem',
                            color: 'white',
                            background: 'var(--rog-red)',
                            padding: '2px 8px',
                            borderRadius: '2px',
                            marginLeft: '12px',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            verticalAlign: 'middle',
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            ADMIN
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DarkModeToggle />
                    <button onClick={handleLogout} className="rog-btn-secondary">
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="rog-hero-section">
                <div className="anim-fade-in" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                    <h1 className="rog-hero-title">
                        <span style={{ color: 'var(--rog-red)' }}>SAVE LIVES.</span>
                    </h1>
                    <p className="rog-hero-subtitle" style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        <span style={{ color: 'var(--rog-red)' }}>PEOPLE LIVE</span> <span style={{ color: '#ffffff' }}>WHEN PEOPLE GIVE</span>
                    </p>
                </div>

                <div className="anim-slide-up" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', /* Fluid min-width */
                    gap: '2rem', /* Match fluid gap */
                    width: '100%'
                }}>
                    <div className="rog-stat-block">
                        <div className="rog-stat-number">{totalDonors}</div>
                        <div className="rog-stat-label">Total Donors</div>
                    </div>
                    <div className="rog-stat-block">
                        <div className="rog-stat-number">{pendingRequests}</div>
                        <div className="rog-stat-label">Pending Reviews</div>
                    </div>
                    <div className="rog-stat-block">
                        <div className="rog-stat-number">{inventory.length}</div>
                        <div className="rog-stat-label">Blood Types</div>
                    </div>
                </div>
            </section>

            {/* --- DASHBOARD CONTENT --- */}
            {/* --- DASHBOARD CONTENT --- */}
            <section className="rog-dashboard-stack">

                {/* Inventory Panel */}
                <div className="rog-panel-dark anim-slide-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>INVENTORY</h2>
                        <button onClick={() => setShowInventoryForm(true)} className="rog-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                            UPDATE
                        </button>
                    </div>

                    <div className="rog-inventory-list">
                        {inventory.length > 0 ? inventory.map(item => (
                            <div key={item.id} className="rog-inventory-card">
                                <div style={{ fontSize: '0.9rem', color: '#ff3333', fontWeight: '800', textTransform: 'uppercase' }}>
                                    {item.hospital_name || 'Central Bank'}
                                </div>
                                <div className="rog-blood-type">{item.blood_group}</div>
                                <div className="rog-progress-container">
                                    <div
                                        className="rog-progress-bar"
                                        style={{ width: `${unitsToPercent(item.units)}%` }}
                                    ></div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--rog-text-dim)', fontWeight: '600' }}>{item.units} Units</div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--rog-text-dim)', padding: '20px' }}>No inventory data available.</div>
                        )}
                    </div>
                </div>

                {/* Camp Requests Panel */}
                <div className="rog-panel-dark anim-slide-up">
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>CAMP REQUESTS</h2>
                    </div>

                    <div className="rog-requests-list">
                        {campRequests.length > 0 ? campRequests.map(request => (
                            <div key={request.id} className="rog-request-item">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--rog-text-light)' }}>{request.institution_name}</h3>
                                        <span className={`rog-status-badge ${request.status.toLowerCase()}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--rog-text-dim)' }}>
                                        {new Date(request.camp_date).toLocaleDateString()} • {request.camp_time || 'Time TBD'} • {request.location}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--rog-text-dim)', marginTop: '4px' }}>
                                        Contact: {request.contact_person}
                                    </div>
                                </div>

                                {request.status === 'Approved' && (
                                    <button
                                        onClick={() => openAttendanceModal(request)}
                                        className="rog-btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: '12px', whiteSpace: 'nowrap' }}
                                    >
                                        Manage Attendance
                                    </button>
                                )}

                                {request.status === 'Pending' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleCampStatus(request.id, 'Approved')}
                                            style={{
                                                background: 'none', border: '1px solid #10b981', color: '#10b981',
                                                width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Approve"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => handleCampStatus(request.id, 'Rejected')}
                                            style={{
                                                background: 'none', border: '1px solid #ef4444', color: '#ef4444',
                                                width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Reject"
                                        >
                                            ✗
                                        </button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No active camp requests found.</div>
                        )}
                    </div>
                </div>

                {/* View All Donors Panel */}
                <div className="rog-panel-dark anim-slide-up">
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>MANAGE DONORS</h2>
                    </div>
                    <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '0.9rem' }}>
                        View all registered donors and manage their accounts.
                    </p>

                    {/* Donors List */}
                    <div style={{ minHeight: '50px' }}>
                        {loading && <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>Loading donors...</div>}

                        {!loading && searchResults.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                {searchResults.map(donor => (
                                    <div key={donor.id} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '16px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                        className="rog-donor-card"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: '900',
                                                color: 'var(--rog-red)',
                                                textShadow: '0 0 10px rgba(255, 10, 62, 0.3)',
                                                minWidth: '40px'
                                            }}>
                                                {donor.blood_group}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--rog-text-light)', fontSize: '1rem' }}>{donor.name}</div>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 6px',
                                                        borderRadius: '100px',
                                                        background: donor.is_donor ? 'rgba(255, 10, 62, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: donor.is_donor ? 'var(--rog-red)' : '#9ca3af',
                                                        border: `1px solid ${donor.is_donor ? 'rgba(255, 10, 62, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {donor.is_donor ? 'Donor' : 'Recipient'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>
                                                    {donor.city || 'No Location'} • {donor.phone || 'No Contact'}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                                                    {donor.email}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Are you sure you want to delete donor ${donor.name}?`)) {
                                                    try {
                                                        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/users/${donor.id}`, { method: 'DELETE' });
                                                        showToast('Donor deleted successfully', 'success');
                                                        handleSearch(); // Reload list
                                                    } catch (err) {
                                                        showToast('Failed to delete donor', 'error');
                                                    }
                                                }
                                            }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                color: '#ef4444',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Delete Donor"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                            }}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>🗑️</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && searchResults.length === 0 && (
                            <div style={{
                                color: '#555',
                                fontStyle: 'italic',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                paddingTop: '16px',
                                fontSize: '0.9rem'
                            }}>
                                No donors found.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Inventory Update Modal */}
            {showInventoryForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="rog-panel-dark" style={{ width: '400px', maxWidth: '90vw' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>UPDATE STOCK</h2>
                        <form onSubmit={handleInventoryUpdate} style={{ display: 'grid', gap: '16px' }}>
                            <input
                                type="text"
                                placeholder="Hospital Name"
                                value={inventoryForm.hospital_name}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, hospital_name: e.target.value })}
                                required
                                className="rog-input-dark"
                            />
                            <select
                                value={inventoryForm.blood_group}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, blood_group: e.target.value })}
                                required
                                className="rog-select-dark"
                            >
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
                            <input
                                type="number"
                                placeholder="Units Available"
                                value={inventoryForm.units}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, units: e.target.value })}
                                required
                                min="0"
                                className="rog-input-dark"
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="rog-btn-primary" style={{ flex: 1 }}>SAVE</button>
                                <button type="button" onClick={() => setShowInventoryForm(false)} className="rog-btn-secondary" style={{ flex: 1 }}>
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Attendance Modal */}
            {showAttendanceModal && selectedCamp && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="rog-panel-dark" style={{ width: '700px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>Attendance</h2>
                                <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: '0.9rem' }}>{selectedCamp.institution_name} • {new Date(selectedCamp.camp_date).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setShowAttendanceModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: '0.5' }}>&times;</button>
                        </div>

                        <div style={{ display: 'grid', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
                            {campDonors.length === 0 ? (
                                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No eligible donors found for this camp.</p>
                            ) : (
                                campDonors.map(donor => (
                                    <div key={donor.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,10,62,0.1)',
                                                color: 'var(--rog-red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', border: '1px solid rgba(255,10,62,0.3)'
                                            }}>
                                                {donor.blood_group}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#eee' }}>{donor.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{donor.email}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleMarkAttendance(donor.id, 'Present')}
                                                style={{
                                                    padding: '6px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                    background: donor.attendance_status === 'Present' ? '#10b981' : 'rgba(255,255,255,0.05)',
                                                    color: donor.attendance_status === 'Present' ? '#000' : '#888',
                                                    fontWeight: '700', transition: 'all 0.2s', textTransform: 'uppercase', fontSize: '0.8rem'
                                                }}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleMarkAttendance(donor.id, 'Absent')}
                                                style={{
                                                    padding: '6px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                                    background: donor.attendance_status === 'Absent' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                                    color: donor.attendance_status === 'Absent' ? '#000' : '#888',
                                                    fontWeight: '700', transition: 'all 0.2s', textTransform: 'uppercase', fontSize: '0.8rem'
                                                }}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
