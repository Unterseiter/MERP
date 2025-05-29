import React, { useState, useEffect } from 'react';
import SubscriptionService from '../../services/Subscriber.service/subscriber.service'; // Путь к вашему сервису

const SubscriptionManager = () => {
  const [type, setType] = useState('subscriptions');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await SubscriptionService.getSubscriptions(type, page, search);
        setResponse(result);
      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, page, search]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
  };

  const handleAddSubscription = async () => {
    if (!newTag.trim()) return;
    
    try {
      setLoading(true);
      await SubscriptionService.createSubscription(newTag.trim());
      setNewTag('');
      // Перезагружаем данные
      const result = await SubscriptionService.getSubscriptions(type, page, search);
      setResponse(result);
    } catch (err) {
      setError('Ошибка при добавлении подписки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (tag) => {
    try {
      setLoading(true);
      await SubscriptionService.deleteSubscription(tag);
      // Перезагружаем данные
      const result = await SubscriptionService.getSubscriptions(type, page, search);
      setResponse(result);
    } catch (err) {
      setError('Ошибка при удалении подписки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Вычисляем есть ли следующая страница
  const hasNext = response ? page < response.totalPages : false;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Управление подписками</h2>
      
      {/* Переключатель подписки/подписчики */}
      <div className="flex space-x-4 mb-6">
        <button 
          className={`px-4 py-2 rounded-lg transition-colors ${
            type === 'subscriptions' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handleTypeChange('subscriptions')}
        >
          Мои подписки
        </button>
        <button 
          className={`px-4 py-2 rounded-lg transition-colors ${
            type === 'subscribers' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handleTypeChange('subscribers')}
        >
          Мои подписчики
        </button>
      </div>
      
      {/* Поиск и добавление */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Поиск по имени или тегу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={() => setPage(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
          >
            Найти
          </button>
        </div>
        
        {type === 'subscriptions' && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Введите тег для подписки"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleAddSubscription} 
              disabled={!newTag.trim()}
              className={`px-4 py-2 rounded-r-lg transition-colors ${
                newTag.trim()
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Подписаться
            </button>
          </div>
        )}
      </div>
      
      {/* Индикаторы состояния */}
      {loading && (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Список результатов */}
      {response?.data?.length > 0 ? (
        <div className="mb-6">
          <div className="mb-2 text-sm text-gray-500">
            Найдено: {response.total} | Страница: {response.page}/{response.totalPages}
          </div>
          
          <ul className="divide-y divide-gray-200">
            {response.data.map((item) => (
              <li key={item.tag_name} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded mr-2">@{item.tag_name}</span>
                      {item.city && <span>{item.city}</span>}
                    </div>
                  </div>
                  {type === 'subscriptions' && (
                    <button 
                      onClick={() => handleDeleteSubscription(item.tag_name)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Отписаться
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && <p className="text-gray-500 text-center py-4">Ничего не найдено</p>
      )}
      
      {/* Пагинация */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <button 
          disabled={page <= 1 || loading}
          onClick={() => setPage(prev => prev - 1)}
          className={`px-4 py-2 rounded-lg ${
            page > 1 && !loading
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Назад
        </button>
        
        <span className="text-gray-700">Страница: {page}</span>
        
        <button 
          disabled={!hasNext || loading}
          onClick={() => setPage(prev => prev + 1)}
          className={`px-4 py-2 rounded-lg ${
            hasNext && !loading
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Вперед
        </button>
      </div>
    </div>
  );
};

export default SubscriptionManager;