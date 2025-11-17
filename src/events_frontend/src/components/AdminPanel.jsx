// components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = 'http://localhost:8000';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [currentTable, setCurrentTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const location = useLocation();

  // Таблицы для разных ролей
  const adminTables = [
    { id: 'users', name: ' Пользователи', icon: '👥', role: 'admin' },
    { id: 'events', name: ' Мероприятия', icon: '🎪', role: 'all' },
    { id: 'event_type', name: ' Типы мероприятий', icon: '🏷️', role: 'all' },
    { id: 'scale', name: ' Масштабы', icon: '📊', role: 'all' },
    { id: 'teacher', name: ' Преподаватели', icon: '👨‍🏫', role: 'all' },
    { id: 'location', name: ' Места проведения', icon: '📍', role: 'all' },
    { id: 'participant_category', name: ' Категории участников', icon: '🎓', role: 'all' }
  ];

  // Получаем роль пользователя
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    setUserRole(storedRole || 'user');
  }, []);

  // Фильтруем таблицы по роли
  const getAvailableTables = () => {
    if (userRole === 'admin') {
      return adminTables;
    } else {
      return adminTables.filter(table => table.role === 'all');
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Загрузка данных таблицы
  // components/AdminPanel.jsx - обновите fetchTableData
// Загрузка данных таблицы
  const fetchTableData = async (tableName) => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      if (tableName === 'users') {
        // Загрузка пользователей
        response = await axios.get(`${API_BASE_URL}/user/get_users`);
        console.log('Users response:', response.data);
        
        // Преобразуем массив массивов в массив объектов
        const usersData = response.data.map(userArray => ({
          id: userArray[0],
          username: userArray[1],
          role: userArray[2]
        }));
        
        setTableData(usersData);
      } else {
        // Загрузка других таблиц
        response = await axios.get(`${API_BASE_URL}/admin/tables/${tableName}`);
        setTableData(response.data);
      }
      
      setCurrentTable(tableName);
    } catch (err) {
      setError('❌ Не удалось загрузить данные таблицы');
      console.error('Error fetching table data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Удаление записи
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      if (currentTable === 'users') {
        await axios.delete(`${API_BASE_URL}/user/delete_user/${id}`);
      } else {
        await axios.delete(`${API_BASE_URL}/admin/tables/${currentTable}/${id}`);
      }
      
      // Обновляем данные таблицы после удаления
      fetchTableData(currentTable);
      // Обновляем статистику
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.detail || '❌ Не удалось удалить запись');
      console.error('Error deleting record:', err);
    }
  };

// components/AdminPanel.jsx - обновите handleChangeRole
// Изменение роли пользователя
  const handleChangeRole = async (userId, newRole) => {
    try {
      console.log('Changing role for user:', userId, 'to:', newRole);
      
      const response = await axios.put(`${API_BASE_URL}/user/change_role`, {
        id: userId,        // Изменил с user_id на id
        new_role: newRole
      });
      
      console.log('Role change response:', response.data);
      
      // Обновляем данные таблицы
      fetchTableData('users');
      
      // Показываем успешное сообщение
      setError(`✅ Роль пользователя успешно изменена на "${newRole}"`);
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || '❌ Не удалось изменить роль пользователя';
      setError(errorMessage);
      console.error('Error changing role:', err);
    }
  };

  // Создание нового пользователя
  const handleCreateUser = async (userData) => {
    try {
      await axios.post(`${API_BASE_URL}/user/register`, userData);
      fetchTableData('users');
    } catch (err) {
      setError('❌ Не удалось создать пользователя');
      console.error('Error creating user:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Определяем активную таблицу из URL
    const pathTable = location.pathname.split('/').pop();
    const availableTables = getAvailableTables();
    
    if (pathTable && pathTable !== 'admin' && availableTables.some(t => t.id === pathTable)) {
      fetchTableData(pathTable);
    } else {
      // По умолчанию загружаем первую доступную таблицу
      const defaultTable = availableTables[0]?.id || 'events';
      fetchTableData(defaultTable);
    }
  }, [location, userRole]);

  const getTableDisplayName = () => {
    const table = getAvailableTables().find(t => t.id === currentTable);
    return table ? table.name : 'Данные';
  };

  // Рендер данных для таблицы пользователей
  // components/AdminPanel.jsx - обновите функцию renderUsersTable
// Рендер данных для таблицы пользователей
  const renderUsersTable = () => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>👤 Имя пользователя</th>
            <th>👑 Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <strong>{user.username}</strong>
                {user.username === localStorage.getItem('username') && (
                  <span className="current-user-badge"> (Вы)</span>
                )}
              </td>
              <td>
                <select 
                  value={user.role} 
                  onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  className="role-select"
                  disabled={user.username === localStorage.getItem('username')}
                >
                  <option value="user">👤 Пользователь</option>
                  <option value="manager">📊 Менеджер</option>
                  <option value="admin">👑 Администратор</option>
                </select>
              </td>
              <td className="actions">
                <button 
                  className="btn small danger"
                  onClick={() => handleDelete(user.id)}
                  disabled={user.username === localStorage.getItem('username')}
                  title={user.username === localStorage.getItem('username') ? 'Нельзя удалить себя' : 'Удалить пользователя'}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Рендер данных для других таблиц
  const renderDefaultTable = () => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            {Object.keys(tableData[0] || {}).map(key => (
              <th key={key}>{key}</th>
            ))}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, cellIndex) => (
                <td key={cellIndex}>
                  {typeof value === 'boolean' ? (value ? '✅' : '❌') : 
                   value === null ? '—' : 
                   String(value)}
                </td>
              ))}
              <td className="actions">
                <button className="btn small primary">✏️</button>
                <button 
                  className="btn small danger"
                  onClick={() => handleDelete(row.id || index)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
          <p>Загружаем данные... ⏳</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">
          {error}
        </div>
      );
    }

    if (tableData.length === 0) {
      return (
        <div className="empty-state">
          <p>📭 Данные не найдены</p>
          {currentTable === 'users' && userRole === 'admin' && (
            <button className="btn primary" onClick={() => {/* Открыть модалку создания */}}>
              👥 Добавить пользователя
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="table-container">
        <div className="table-header">
          <h3>{getTableDisplayName()} ({tableData.length})</h3>
          {currentTable === 'users' && userRole === 'admin' && (
            <button className="btn primary" onClick={() => {/* Открыть модалку создания */}}>
              👥 Добавить пользователя
            </button>
          )}
        </div>
        
        <div className="table-wrapper">
          {currentTable === 'users' ? renderUsersTable() : renderDefaultTable()}
        </div>
      </div>
    );
  };

  const availableTables = getAvailableTables();

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Панель администрирования</h1>
        <p>
          Управление базой данных мероприятий 
          {userRole === 'admin' && ' и пользователями'}
        </p>
        <div className="user-info">
          Вы вошли как: <strong>{localStorage.getItem('username')}</strong> 
          <span className="user-role">({userRole})</span>
        </div>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.tableCount || 7}</h3>
            <p>Таблиц в БД</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎪</div>
          <div className="stat-info">
            <h3>{stats.eventCount || 0}</h3>
            <p>Мероприятий</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.userCount || 0}</h3>
            <p>Пользователей</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>{stats.teacherCount || 0}</h3>
            <p>Преподавателей</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Боковое меню */}
        <div className="sidebar">
          <h3>🗂️ Таблицы БД</h3>
          <nav className="table-nav">
            {availableTables.map(table => (
              <Link
                key={table.id}
                to={`/admin/${table.id}`}
                className={`nav-item ${currentTable === table.id ? 'active' : ''}`}
                onClick={() => fetchTableData(table.id)}
              >
                <span className="nav-icon">{table.icon}</span>
                <span className="nav-text">{table.name}</span>
                {table.role === 'admin' && <span className="admin-only-badge">👑</span>}
              </Link>
            ))}
          </nav>
          
          {userRole !== 'admin' && (
            <div className="role-warning">
              <p>🔒 Некоторые функции доступны только администраторам</p>
            </div>
          )}
        </div>

        {/* Основной контент */}
        <div className="main-content">
          {renderTableContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;