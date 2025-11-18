// components/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_BASE_URL = 'http://192.168.3.212:8000';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('❌ Пароли не совпадают');
      setLoading(false);
      return;
    }

    // Проверка длины пароля
    if (formData.password.length < 6) {
      setError('❌ Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/user/register`, {
        username: formData.username,
        password: formData.password
      });
      
      // После успешной регистрации перенаправляем на вход
      navigate('/login', { 
        state: { message: '✅ Регистрация прошла успешно! Теперь вы можете войти.' }
      });
    } catch (err) {
      setError(err.response?.data?.detail || '❌ Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>✨ Регистрация</h1>
          <p>Создайте новый аккаунт для доступа к системе</p>
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
              placeholder="Придумайте имя пользователя..."
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
              placeholder="Придумайте пароль (мин. 6 символов)..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              🔒 Подтверждение пароля
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль..."
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
            {loading ? '⏳ Регистрация...' : '🎯 Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;