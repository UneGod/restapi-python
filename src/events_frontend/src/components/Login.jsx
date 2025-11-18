// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_BASE_URL = 'http://192.168.3.212:8000';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Функция для получения роли пользователя - ВСЕГДА запрашиваем свежую роль с сервера
  const getUserRole = async (username) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/check_role`, {
        params: { username }
      });
      
      console.log('🔄 Role response from server:', response.data);
      
      // Обрабатываем разные форматы ответа
      let role;
      if (typeof response.data === 'string') {
        role = response.data;
      } else if (response.data && response.data.role) {
        role = response.data.role;
      } else {
        console.warn('Unknown response format:', response.data);
        role = 'user';
      }
      
      console.log('✅ Determined role:', role);
      return role;
    } catch (error) {
      console.error('❌ Error getting user role:', error);
      return 'user';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Сначала логинимся
      const loginResponse = await axios.post(`${API_BASE_URL}/user/login`, formData);
      
      // ПОСЛЕ успешного логина получаем СВЕЖУЮ роль с сервера
      const userRole = await getUserRole(formData.username);
      
      console.log('🎯 Final user role:', userRole);
      
      // Сохраняем данные в localStorage
      localStorage.setItem('token', loginResponse.data.access_token);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('userRole', userRole); // Сохраняем свежую роль
      
      // Перенаправляем на главную
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || '❌ Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐 Вход в систему</h1>
          <p>Введите ваши учетные данные для доступа к системе</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              👤 Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              🔒 Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль..."
              className="form-input"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn primary full-width"
            disabled={loading}
          >
            {loading ? '⏳ Вход...' : '🚀 Войти в систему'}
          </button>
        </form>

        <div className="demo-credentials">
          <h3>🧪 Тестовые данные:</h3>
          <div className="credentials-grid">
            <div className="credential-item">
              <strong>👑 Администратор:</strong>
              <p>Логин: <code>admin</code></p>
              <p>Пароль: <code>admin</code></p>
              <span className="role-badge admin">admin</span>
            </div>
            <div className="credential-item">
              <strong>📊 Менеджер:</strong>
              <p>Логин: <code>manager</code></p>
              <p>Пароль: <code>manager</code></p>
              <span className="role-badge manager">manager</span>
            </div>
            <div className="credential-item">
              <strong>👤 Пользователь:</strong>
              <p>Логин: <code>user</code></p>
              <p>Пароль: <code>user</code></p>
              <span className="role-badge user">user</span>
            </div>
          </div>
          <p className="debug-info">
            💡 После изменения роли в БД - выйдите и войдите заново
          </p>
        </div>

        <div className="auth-footer">
          <p>
            Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;