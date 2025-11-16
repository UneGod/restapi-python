// App.jsx
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import EventsSearch from './components/EventsSearch';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      {/* Навигация */}
      {location.pathname !== '/admin' && !location.pathname.startsWith('/admin/') && (
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🎯 Events Manager
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                🏠 Главная
              </Link>
              <Link to="/admin" className="nav-link">
                ⚙️ Администрирование
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Роуты */}
      <Routes>
        <Route path="/" element={<EventsSearch />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/:table" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;