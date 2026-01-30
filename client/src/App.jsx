import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts';
import Installments from './pages/Installments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ height: '100vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/installments" element={<Installments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
