// components/CreateEventModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateEventModal.css';

const API_BASE_URL = 'http://localhost:8000';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type_id: '',
    scale_id: '',
    start_date: '',
    end_date: '',
    location_id: '',
    status: 'planned',
    responsible_teacher_id: '',
    estimated_budget: '',
    participant_category_id: '',
    notes: ''
  });
  
  const [referenceData, setReferenceData] = useState({
    event_types: [],
    scales: [],
    locations: [],
    teachers: [],
    participant_categories: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingReferences, setLoadingReferences] = useState(true);

  // Загрузка справочных данных
  useEffect(() => {
    if (isOpen) {
      loadReferenceData();
    }
  }, [isOpen]);

  // components/CreateEventModal.jsx - обновите функцию loadReferenceData
    const loadReferenceData = async () => {
        try {
            setLoadingReferences(true);
            setError('');
            
            const endpoints = [
            { key: 'event_types', url: '/reference/event_types' },
            { key: 'scales', url: '/reference/scales' },
            { key: 'locations', url: '/reference/locations' },
            { key: 'teachers', url: '/reference/teachers' },
            { key: 'participant_categories', url: '/reference/participant_categories' }
            ];

            console.log('🔄 Loading reference data...');

            const promises = endpoints.map(async ({ key, url }) => {
            try {
                const response = await axios.get(`${API_BASE_URL}${url}`);
                console.log(`✅ Loaded ${key}:`, response.data.length, 'items');
                return { key, data: response.data, success: true };
            } catch (err) {
                console.error(`❌ Error loading ${key}:`, err);
                return { key, data: [], success: false, error: err.message };
            }
            });

            const results = await Promise.all(promises);
            
            const newReferenceData = {};
            let hasErrors = false;
            const errorMessages = [];

            results.forEach(({ key, data, success, error }) => {
            newReferenceData[key] = data;
            if (!success) {
                hasErrors = true;
                errorMessages.push(`Не удалось загрузить ${getRussianName(key)}`);
            }
            });

            setReferenceData(newReferenceData);

            if (hasErrors) {
            setError(`⚠️ Некоторые данные не загружены: ${errorMessages.join(', ')}`);
            }

            console.log('📊 Reference data loaded:', newReferenceData);

        } catch (err) {
            console.error('❌ Error loading reference data:', err);
            setError('❌ Не удалось загрузить справочные данные. Проверьте подключение к серверу.');
        } finally {
            setLoadingReferences(false);
        }
    };

    // Вспомогательная функция для русских названий
    const getRussianName = (key) => {
    const names = {
        'event_types': 'типы событий',
        'scales': 'масштабы',
        'locations': 'места проведения', 
        'teachers': 'преподаватели',
        'participant_categories': 'категории участников'
    };
    return names[key] || key;
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (!formData.title.trim()) {
      setError('❌ Название события обязательно');
      setLoading(false);
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError('❌ Даты начала и окончания обязательны');
      setLoading(false);
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('❌ Дата окончания не может быть раньше даты начала');
      setLoading(false);
      return;
    }

    try {
      // Подготавливаем данные для отправки
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_type_id: parseInt(formData.event_type_id),
        scale_id: parseInt(formData.scale_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        location_id: parseInt(formData.location_id),
        status: formData.status,
        responsible_teacher_id: parseInt(formData.responsible_teacher_id),
        estimated_budget: formData.estimated_budget ? parseInt(formData.estimated_budget) : null,
        participant_category_id: parseInt(formData.participant_category_id),
        notes: formData.notes || null
      };

      console.log('Sending event data:', eventData);

      const response = await axios.post(`${API_BASE_URL}/event/add_event`, eventData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Event created successfully:', response.data);

      // Сбрасываем форму
      setFormData({
        title: '',
        description: '',
        event_type_id: '',
        scale_id: '',
        start_date: '',
        end_date: '',
        location_id: '',
        status: 'planned',
        responsible_teacher_id: '',
        estimated_budget: '',
        participant_category_id: '',
        notes: ''
      });

      // Вызываем колбэк
      if (onEventCreated) {
        onEventCreated(response.data);
      }

      // Закрываем модальное окно
      onClose();

    } catch (err) {
      console.error('Error creating event:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          '❌ Не удалось создать событие';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎪 Создать новое событие</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loadingReferences ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Загружаем справочные данные... ⏳</p>
            </div>
          ) : (
            <>
              {/* Основная информация */}
              <div className="form-section">
                <h3>📋 Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    🏷️ Название события *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Введите название события..."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    📝 Описание
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Опишите событие..."
                    className="form-input textarea"
                    rows="3"
                  />
                </div>
              </div>

              {/* Тип и масштаб */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="event_type_id" className="form-label">
                    🎪 Тип события *
                  </label>
                  <select
                    id="event_type_id"
                    name="event_type_id"
                    value={formData.event_type_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите тип события</option>
                    {referenceData.event_types.map(type => (
                      <option key={type[0]} value={type[0]}>
                        {type[1]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="scale_id" className="form-label">
                    📊 Масштаб *
                  </label>
                  <select
                    id="scale_id"
                    name="scale_id"
                    value={formData.scale_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите масштаб</option>
                    {referenceData.scales.map(scale => (
                      <option key={scale[0]} value={scale[0]}>
                        {scale[1]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Даты */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date" className="form-label">
                    📅 Дата начала *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date" className="form-label">
                    📅 Дата окончания *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Место и статус */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location_id" className="form-label">
                    📍 Место проведения *
                  </label>
                  <select
                    id="location_id"
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите место</option>
                    {referenceData.locations.map(location => (
                      <option key={location[0]} value={location[0]}>
                        {location[1]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    📈 Статус *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="planned">🟡 Запланировано</option>
                    <option value="in progress">🟠 В процессе</option>
                    <option value="completed">🟢 Завершено</option>
                    <option value="canceled">🔴 Отменено</option>
                  </select>
                </div>
              </div>

              {/* Ответственный и бюджет */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="responsible_teacher_id" className="form-label">
                    👨‍🏫 Ответственный *
                  </label>
                  <select
                    id="responsible_teacher_id"
                    name="responsible_teacher_id"
                    value={formData.responsible_teacher_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите ответственного</option>
                    {referenceData.teachers.map(teacher => (
                      <option key={teacher[0]} value={teacher[0]}>
                        {teacher[1]} ({teacher[2]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimated_budget" className="form-label">
                    💰 Бюджет (₽)
                  </label>
                  <input
                    type="number"
                    id="estimated_budget"
                    name="estimated_budget"
                    value={formData.estimated_budget}
                    onChange={handleInputChange}
                    placeholder="Введите бюджет..."
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>

              {/* Категория участников и примечания */}
              <div className="form-group">
                <label htmlFor="participant_category_id" className="form-label">
                  🎓 Категория участников *
                </label>
                <select
                  id="participant_category_id"
                  name="participant_category_id"
                  value={formData.participant_category_id}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Выберите категорию участников</option>
                  {referenceData.participant_categories.map(category => (
                    <option key={category[0]} value={category[0]}>
                      {category[1]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  📝 Примечания
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Дополнительные примечания..."
                  className="form-input textarea"
                  rows="2"
                />
              </div>
            </>
          )}

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn primary"
              disabled={loading || loadingReferences}
            >
              {loading ? '⏳ Создание...' : '🎯 Создать событие'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;