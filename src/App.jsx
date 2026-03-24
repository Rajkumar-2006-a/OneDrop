import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Loginpage';
import Signup from './Signup';
import UserDashboard from './UserDashboard';

import AdminDashboard from './AdminDashboard';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}

export default App;
