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
  const location = useLocation();

  const tables = [
    { id: 'events', name: 'Мероприятия', icon: '🎪' },
    { id: 'event_type', name: 'Типы мероприятий', icon: '🏷️' },
    { id: 'scale', name: 'Масштабы', icon: '📊' },
    { id: 'teacher', name: 'Преподаватели', icon: '👨‍🏫' },
    { id: 'location', name: 'Места проведения', icon: '📍' },
    { id: 'participant_category', name: 'Категории участников', icon: '🎓' }
  ];

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
  const fetchTableData = async (tableName) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/tables/${tableName}`);
      setTableData(response.data);
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
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/admin/tables/${currentTable}/${id}`);
      fetchTableData(currentTable);
      fetchStats();
    } catch (err) {
      setError('❌ Не удалось удалить запись');
      console.error('Error deleting record:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Определяем активную таблицу из URL
    const pathTable = location.pathname.split('/').pop();
    if (pathTable && pathTable !== 'admin' && tables.some(t => t.id === pathTable)) {
      fetchTableData(pathTable);
    } else {
      // По умолчанию загружаем мероприятия
      fetchTableData('events');
    }
  }, [location]);

  const getTableDisplayName = () => {
    const table = tables.find(t => t.id === currentTable);
    return table ? table.name : 'Мероприятия';
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
        </div>
      );
    }

    return (
      <div className="table-container">
        <div className="table-header">
          <h3>📋 {getTableDisplayName()} ({tableData.length})</h3>
          <button className="btn primary">
            ➕ Добавить запись
          </button>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(tableData[0]).map(key => (
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
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Панель администрирования</h1>
        <p>Управление базой данных мероприятий</p>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.tableCount || 0}</h3>
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
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>{stats.teacherCount || 0}</h3>
            <p>Преподавателей</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-info">
            <h3>{stats.locationCount || 0}</h3>
            <p>Мест проведения</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Боковое меню */}
        <div className="sidebar">
          <h3>🗂️ Таблицы БД</h3>
          <nav className="table-nav">
            {tables.map(table => (
              <Link
                key={table.id}
                to={`/admin/${table.id}`}
                className={`nav-item ${currentTable === table.id ? 'active' : ''}`}
                onClick={() => fetchTableData(table.id)}
              >
                <span className="nav-icon">{table.icon}</span>
                <span className="nav-text">{table.name}</span>
              </Link>
            ))}
          </nav>
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