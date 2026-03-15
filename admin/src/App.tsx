import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/RoutesPage';
import LogsPage from './pages/LogsPage';
import TokenPage from './pages/TokenPage';
import { logout } from './api';
import './App.css';

import type { ReactNode } from 'react';

function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('apexgate_token');

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <span>ApexGate</span>
        </div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/routes">Routes</Link>
          <Link to="/tokens">Client Tokens</Link>
          <Link to="/logs">Request Logs</Link>
        </nav>
        <button className="logout" onClick={() => { logout(); navigate('/login'); }}>
          Sign out
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/routes" element={<Layout><RoutesPage /></Layout>} />
      <Route path="/tokens" element={<Layout><TokenPage /></Layout>} />
      <Route path="/logs" element={<Layout><LogsPage /></Layout>} />
    </Routes>
  );
}
