import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://192.168.0.107:8000';

function App() {
  const [eventId, setEventId] = useState('');
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState('all'); // 'all', 'id', 'name'

  const fetchEvents = async (type = 'all', value = '') => {
    setLoading(true);
    setError('');
    
    try {
      let url;
      
      switch (type) {
        case 'id':
          url = `${API_BASE_URL}/event/${value}`;
          break;
        case 'name':
          url = `${API_BASE_URL}/event/name/${encodeURIComponent(value)}`;
          break;
        case 'all':
        default:
          url = `${API_BASE_URL}/event`;
          break;
      }
      
      console.log('🚀 Making request to:', url);
      const response = await axios.get(url);
      
      console.log('🎯 Response data:', response.data);
      
      let eventsData = [];

      // Новая функция преобразования для структуры с 13 полями
      const transformEventArray = (item) => {
        if (Array.isArray(item) && item.length >= 13) {
          return {
            id: item[0],
            title: item[1] || 'Без названия',
            description: item[2] || 'Описание отсутствует',
            event_type: item[3] || 'Не указан',
            scale: item[4] || 'Не указан',
            start_date: item[5],
            end_date: item[6],
            location: item[7] || 'Не указано',
            status: item[8] || 'planned',
            responsible_teacher: item[9] || 'Не указан',
            estimated_budget: item[10],
            participant_category: item[11] || 'Не указана',
            notes: item[12]
          };
        }
        return item;
      };

      // Обработка ответа
      if (Array.isArray(response.data)) {
        if (response.data.length > 0 && Array.isArray(response.data[0])) {
          // Массив массивов - преобразуем каждый
          eventsData = response.data.map(transformEventArray);
        } else if (response.data.length >= 13) {
          // Плоский массив (одно событие)
          eventsData = [transformEventArray(response.data)];
        } else {
          // Другой формат массива
          eventsData = response.data.map(item => 
            Array.isArray(item) ? transformEventArray(item) : item
          );
        }
      } else {
        // Объект
        eventsData = [response.data];
      }
      
      // Фильтруем валидные события
      eventsData = eventsData.filter(event => event && event.id);
      
      console.log('🎉 Processed events:', eventsData);
      setEvents(eventsData);
      
      if ((type === 'name' || type === 'id') && eventsData.length === 0) {
        setError(`🔍 По запросу "${value}" ничего не найдено`);
      }
      
    } catch (err) {
      console.error('💥 Error:', err);
      if (err.response && err.response.status === 404) {
        setError(`❌ По запросу "${value}" ничего не найдено`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('❌ Не удалось подключиться к серверу');
      } else {
        setError('❌ Произошла ошибка при загрузке данных');
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Функция проверки пустого события
  const isEventEmpty = (event) => {
    if (!event) return true;
    if (Array.isArray(event) && event.length === 0) return true;
    if (typeof event === 'object' && Object.keys(event).length === 0) return true;
    
    return false;
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    fetchEvents('all');
  }, []);

  const handleSearchById = (e) => {
    e.preventDefault();
    if (eventId.trim()) {
      setSearchType('id');
      fetchEvents('id', eventId.trim());
    } else {
      setSearchType('all');
      fetchEvents('all');
    }
  };

  const handleSearchByName = (e) => {
    e.preventDefault();
    if (eventName.trim()) {
      setSearchType('name');
      fetchEvents('name', eventName.trim());
    } else {
      setSearchType('all');
      fetchEvents('all');
    }
  };

  const handleClear = () => {
    setEventId('');
    setEventName('');
    setSearchType('all');
    fetchEvents('all');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Неверный формат';
    }
  };

  // Функция для перевода статусов
  const getStatusText = (status) => {
    const statusMap = {
      'planned': 'Запланировано',
      'In progress': 'В процессе',
      'Completed': 'Завершено',
      'Canceled': 'Отменено'
    };
    return statusMap[status] || status || 'Не указан';
  };

  const getSearchTitle = () => {
    switch (searchType) {
      case 'id':
        return `Событие #${eventId} 🎪`;
      case 'name':
        return `Событие: "${eventName}" 🔍`;
      default:
        return 'Все события 📚';
    }
  };

  const getSearchSubtitle = () => {
    switch (searchType) {
      case 'id':
        return `Найдено по ID: ${eventId}`;
      case 'name':
        return `Найдено по имени: ${eventName}`;
      default:
        return 'Все доступные события';
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎯 Поиск событий</h1>
          <p>Ищите события по ID, имени или просматривайте все доступные события ✨</p>
        </header>

        <div className="search-forms">
          {/* Поиск по ID */}
          <form onSubmit={handleSearchById} className="search-form">
            <div className="form-group">
              <label htmlFor="eventId" className="form-label">
                🔢 Поиск по ID
              </label>
              <div className="input-group">
                <input
                  id="eventId"
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Введите ID события..."
                  className="search-input"
                />
                <button type="submit" className="btn primary">
                  Найти по ID 🔎
                </button>
              </div>
            </div>
          </form>

          {/* Поиск по имени */}
          <form onSubmit={handleSearchByName} className="search-form">
            <div className="form-group">
              <label htmlFor="eventName" className="form-label">
                📛 Поиск по имени
              </label>
              <div className="input-group">
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Введите название события..."
                  className="search-input"
                />
                <button type="submit" className="btn primary">
                  Найти по имени 🔍
                </button>
              </div>
            </div>
          </form>

          {/* Кнопка сброса */}
          <div className="clear-section">
            <button type="button" onClick={handleClear} className="btn secondary">
              📋 Показать все события
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загружаем события... ⏳</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <div className="error-text">{error}</div>
            <button onClick={handleClear} className="btn secondary small">
              👀 Показать все события
            </button>
          </div>
        )}

        <div className="events-section">
          <div className="section-header">
            <h2>{getSearchTitle()}</h2>
            <span className="events-count">({events.length})</span>
          </div>
          <p className="search-subtitle">{getSearchSubtitle()}</p>

          {events.length === 0 && !loading && !error && (
            <div className="empty-state">
              <p>📭 Событий не найдено</p>
              <button onClick={handleClear} className="btn primary">
                Загрузить все события
              </button>
            </div>
          )}

          <div className="events-grid">
            {events.map((event, index) => (
              <div 
                key={event.id || index} 
                className="event-card"
                onClick={() => handleEventClick(event)}
              >
                <div className="event-header">
                  <h3>{event.title || 'Без названия'} 🏷️</h3>
                  {event.id && <span className="event-id">#{event.id}</span>}
                </div>
                
                <div className="event-content">
                  <p className="event-description">
                    {event.description || 'Описание отсутствует'} 📝
                  </p>
                  
                  <div className="event-details">
                    <div className="detail-row">
                      <span className="detail-label">📅 Даты:</span>
                      <span className="detail-value">
                        {formatDate(event.start_date)} - {formatDate(event.end_date)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">📍 Место:</span>
                      <span className="detail-value">{event.location}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">🎪 Тип:</span>
                      <span className="detail-value">{event.event_type}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">📊 Масштаб:</span>
                      <span className="detail-value">{event.scale}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">🎯 Статус:</span>
                      <span className={`status-badge status-${event.status?.toLowerCase().replace(' ', '')}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">👨‍🏫 Ответственный:</span>
                      <span className="detail-value">{event.responsible_teacher}</span>
                    </div>
                    
                    {event.estimated_budget && (
                      <div className="detail-row">
                        <span className="detail-label">💰 Бюджет:</span>
                        <span className="detail-value">
                          {event.estimated_budget.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="event-click-hint">
                  👆 Нажмите для подробной информации
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Модальное окно */}
        {isModalOpen && selectedEvent && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal large-modal">
              <div className="modal-header">
                <h2>🎪 Детали события</h2>
                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="detail-section">
                  <h3>📋 Основная информация</h3>
                  <div className="detail-row">
                    <span className="detail-label">ID события:</span>
                    <span className="detail-value">#{selectedEvent.id}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">🏷️ Название:</span>
                    <span className="detail-value title-value">{selectedEvent.title}</span>
                  </div>
                  
                  <div className="detail-row full-width">
                    <span className="detail-label">📝 Описание:</span>
                    <span className="detail-value description-value">{selectedEvent.description}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>📅 Время и место</h3>
                  <div className="detail-row">
                    <span className="detail-label">📅 Начало:</span>
                    <span className="detail-value">{formatDate(selectedEvent.start_date)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">📅 Окончание:</span>
                    <span className="detail-value">{formatDate(selectedEvent.end_date)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">📍 Место проведения:</span>
                    <span className="detail-value">{selectedEvent.location}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>🎯 Детали события</h3>
                  <div className="detail-row">
                    <span className="detail-label">🎪 Тип события:</span>
                    <span className="detail-value">{selectedEvent.event_type}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">📊 Масштаб:</span>
                    <span className="detail-value">{selectedEvent.scale}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">📈 Статус:</span>
                    <span className={`status-badge status-${selectedEvent.status?.toLowerCase().replace(' ', '')}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>👥 Организация</h3>
                  <div className="detail-row">
                    <span className="detail-label">👨‍🏫 Ответственный:</span>
                    <span className="detail-value">{selectedEvent.responsible_teacher}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">🎓 Категория участников:</span>
                    <span className="detail-value">{selectedEvent.participant_category}</span>
                  </div>
                  
                  {selectedEvent.estimated_budget && (
                    <div className="detail-row">
                      <span className="detail-label">💰 Бюджет:</span>
                      <span className="detail-value budget">
                        {selectedEvent.estimated_budget.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                </div>

                {selectedEvent.notes && (
                  <div className="detail-section">
                    <h3>📝 Примечания</h3>
                    <div className="notes-content">
                      {selectedEvent.notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button className="btn primary" onClick={closeModal}>
                  Закрыть 👍
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
