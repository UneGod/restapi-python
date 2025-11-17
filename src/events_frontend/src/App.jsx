// App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminPanel from './components/AdminPanel';
import EventsSearch from './components/EventsSearch';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loadingRole, setLoadingRole] = useState(false);

  // Функция для проверки роли пользователя - ВСЕГДА запрашивает свежую роль
  const checkUserRole = async (username) => {
    try {
      setLoadingRole(true);
      const response = await axios.get(`${API_BASE_URL}/user/check_role`, {
        params: { username }
      });
      
      console.log('🔄 Fresh role from server:', response.data[0]);
      
      let role;
      if (typeof response.data[0] === 'string') {
        role = response.data[0];
      } else if (response.data[0]) {
        role = response.data[0];
      } else {
        console.warn('Unknown role response format:', response.data[0]);
        role = 'user';
      }
      
      // Обновляем роль в состоянии и localStorage
      setUserRole(role);
      localStorage.setItem('userRole', role);
      
      console.log('✅ Updated role to:', role);
      return role;
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      const defaultRole = 'user';
      setUserRole(defaultRole);
      localStorage.setItem('userRole', defaultRole);
      return defaultRole;
    } finally {
      setLoadingRole(false);
    }
  };

  // Проверка аутентификации и ОБНОВЛЕНИЕ роли при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole');
    
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      
      // ВСЕГДА запрашиваем свежую роль при загрузке приложения
      checkUserRole(storedUsername);
    } else {
      setIsAuthenticated(false);
      setUsername('');
      setUserRole('');
      
      // Если пользователь не авторизован и пытается получить доступ к защищенным страницам
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [location, navigate]);

  // Функция для принудительного обновления роли
  const refreshUserRole = () => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      checkUserRole(storedUsername);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUsername('');
    setUserRole('');
    navigate('/login');
  };

  // Функция для защищенных роутов
  const ProtectedRoute = ({ children, requiredRole = null }) => {
    if (!isAuthenticated) {
      return (
        <div className="protected-route">
          <div className="auth-required">
            <h2>🔐 Требуется авторизация</h2>
            <p>Пожалуйста, войдите в систему для доступа к этой странице</p>
            <Link to="/login" className="btn primary">
              🔐 Войти
            </Link>
          </div>
        </div>
      );
    }

    if (loadingRole) {
      return (
        <div className="protected-route">
          <div className="auth-required">
            <div className="loading">
              <div className="spinner"></div>
              <p>Проверка прав доступа... ⏳</p>
            </div>
          </div>
        </div>
      );
    }

    // Проверка роли для админ-панели
    if (requiredRole && !requiredRole.includes(userRole)) {
      return (
        <div className="protected-route">
          <div className="auth-required">
            <h2>🚫 Доступ запрещен</h2>
            <p>У вас недостаточно прав для доступа к этой странице</p>
            <p className="role-info">Требуемая роль: {requiredRole.join(' или ')}</p>
            <p className="role-info">Ваша роль: {userRole}</p>
            <div className="action-buttons">
              <button onClick={refreshUserRole} className="btn secondary">
                🔄 Обновить роль
              </button>
              <Link to="/" className="btn primary">
                🏠 На главную
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return children;
  };

  // Проверяем, имеет ли пользователь доступ к админ-панели
  const hasAdminAccess = ['admin', 'manager'].includes(userRole);

  // Страницы, которые доступны без авторизации
  const publicRoutes = ['/login', '/register'];

  return (
    <div className="app">
      {/* Навигация - показываем только для авторизованных пользователей */}
      {isAuthenticated && !publicRoutes.includes(location.pathname) && (
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🎯 Events Manager
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                🏠 Главная
              </Link>
              
              {/* Кнопка администрирования только для admin и manager */}
              {hasAdminAccess && (
                <Link to="/admin" className="nav-link">
                  ⚙️ Администрирование
                </Link>
              )}
              
              <div className="user-section">
                <span className="username">
                  👤 {username} 
                  <span className="user-role">({userRole})</span>
                  {loadingRole && <span className="role-loading">🔄</span>}
                </span>
                <div className="user-actions">
                  <button onClick={refreshUserRole} className="btn small secondary" title="Обновить роль">
                    🔄
                  </button>
                  <button onClick={handleLogout} className="btn small secondary">
                    🚪 Выйти
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Роуты */}
      <Routes>
        {/* Публичные роуты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Защищенные роуты */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <EventsSearch />
            </ProtectedRoute>
          } 
        />
        
        {/* Админ-панель только для admin и manager */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/:table" 
          element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Редирект на логин для неизвестных маршрутов */}
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;