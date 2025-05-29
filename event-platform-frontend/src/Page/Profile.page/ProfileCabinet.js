import React, { useState, useEffect, useContext } from 'react';
import UserService from '../../services/User.service/user.service';
import SubscriptionService from '../../services/Subscriber.service/subscriber.service';
import { AuthContext } from '../../components/authorization/AuthContext';
import image from '../../assets/defuser.png';

const ProfileCabinet = () => {
  const { isAuthenticated, loading: authLoading, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Состояния для переключателей
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'subscriptions', 'followers'
  const [subscriptions, setSubscriptions] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState(null);
  const [followersError, setFollowersError] = useState(null);

  // Функции для переключения
  const showEvents = () => setActiveTab('events');
  const showSubscriptions = () => {
    setActiveTab('subscriptions');
    if (subscriptions.length === 0) {
      loadSubscriptions();
    }
  };
  const showFollowers = () => {
    setActiveTab('followers');
    if (followers.length === 0) {
      loadFollowers();
    }
  };

  // Загрузка подписок
  const loadSubscriptions = async () => {
    setSubscriptionsLoading(true);
    setSubscriptionsError(null);
    try {
      const result = await SubscriptionService.getSubscriptions('subscriptions', 1, '');
      setSubscriptions(result.data || []);
    } catch (err) {
      setSubscriptionsError('Ошибка при загрузке подписок');
      console.error(err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  // Загрузка подписчиков
  const loadFollowers = async () => {
    setFollowersLoading(true);
    setFollowersError(null);
    try {
      const result = await SubscriptionService.getSubscriptions('subscribers', 1, '');
      setFollowers(result.data || []);
    } catch (err) {
      setFollowersError('Ошибка при загрузке подписчиков');
      console.error(err);
    } finally {
      setFollowersLoading(false);
    }
  };

  // Обработка отписки
  const handleUnsubscribe = async (tag) => {
    try {
      setSubscriptionsLoading(true);
      await SubscriptionService.deleteSubscription(tag);
      // Обновляем список после отписки
      const result = await SubscriptionService.getSubscriptions('subscriptions', 1, '');
      setSubscriptions(result.data || []);
    } catch (err) {
      setSubscriptionsError('Ошибка при отписке');
      console.error(err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  // Функция для загрузки профиля
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.getProfile();
      setProfileData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке профиля');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка профиля при изменении isAuthenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile();
    } else if (!authLoading && !isAuthenticated) {
      setProfileData(null);
      setError('Пожалуйста, авторизуйтесь');
    }
  }, [isAuthenticated, authLoading]);

  // Функция выхода
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Ошибка при выходе');
    }
  };

  return (
    <div className="">
      {(loading || authLoading) && (
        <div className="text-center text-gray-500 mb-4">Загрузка...</div>
      )}

      {error && !loading && !authLoading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          Ошибка: {error}
        </div>
      )}

      {profileData && !loading && !authLoading && (
        <div className="flex flex-col lg:flex-row gap-7">
          {/* Левая колонка — профиль */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-md text-black p-6 flex flex-col relative ring-2 ring-[#d6bda7]">
            <img
              src={image}
              className="w-24 h-24 rounded-[15px] object-cover mb-4 border-[#d6bda7] border-2"
            />
            <div className='text-left'>
              <h2 className="text-3xl font-semibold">{profileData.info.name || 'Имя не указано'}</h2>
              <p className="text-xl text-gray-700">@{profileData.info.tag_name}</p>
              <p className="text-lg mt-4">{profileData.info.city || 'Город не указан'}</p>
              <p className="text-lg">На сайте с {new Date(profileData.info.CreateAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-lg">{profileData.info.email}</p>
              
              {/* Статистика профиля */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="font-bold">{profileData.events.length}</p>
                  <p className="text-sm">Событий</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="font-bold">{followers.length}</p>
                  <p className="text-sm">Подписчиков</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="font-bold">{subscriptions.length}</p>
                  <p className="text-sm">Подписок</p>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-6 text-red-600 hover:underline text-sm">
              Выйти
            </button>
          </div>

          {/* Центральная колонка */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-md p-3 ring-2 ring-[#d6bda7] flex flex-col">
            <div className='flex gap-4 justify-center mb-4'>
              <button 
                className={`px-4 py-2 rounded-2xl border-2 border-[#e5c19c] transition w-full ${
                  activeTab === 'events' 
                    ? 'bg-[#CAA07D] text-white hover:bg-[#B08F6E]' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={showEvents}
              >
                Активные события
              </button>
              <button 
                className={`px-4 py-2 rounded-2xl border-2 border-[#e5c19c] transition w-full ${
                  activeTab === 'subscriptions' 
                    ? 'bg-[#CAA07D] text-white hover:bg-[#B08F6E]' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={showSubscriptions}
              >
                Подписки
              </button>
              <button 
                className={`px-4 py-2 rounded-2xl border-2 border-[#e5c19c] transition w-full ${
                  activeTab === 'followers' 
                    ? 'bg-[#CAA07D] text-white hover:bg-[#B08F6E]' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={showFollowers}
              >
                Подписчики
              </button>
            </div>

            {/* Контейнер с фиксированной высотой */}
            <div className="h-[400px] flex-grow overflow-hidden">
              {/* Блок активных событий */}
              <div className={`h-full ${activeTab === 'events' ? 'block' : 'hidden'}`}>
                {profileData.events.length > 0 ? (
                  <ul className="space-y-4 overflow-y-auto h-full pr-2">
                    {profileData.events.map((event) => (
                      <li
                        key={event.event_id}
                        className="border border-[#d6bda7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <h3 className="text-lg font-medium">{event.name}</h3>
                        <p className="text-gray-600">Ограничение: {event.limited}</p>
                        <p className="text-gray-600">
                          Дата начала: {new Date(event.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          Дата окончания: {new Date(event.end_date).toLocaleDateString()}
                        </p>
                        <div className="max-w-[30rem]">
                          <p className="text-gray-600 break-words whitespace-pre-wrap">
                            Описание: {event.description || 'Нет описания'}
                          </p>
                        </div>
                        <p className="text-gray-600">Создатель: {event.creator_tag}</p>
                        <p className="text-gray-600">Просмотры: {event.views}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Нет активных событий</p>
                  </div>
                )}
              </div>

              {/* Блок подписок */}
              <div className={`h-full ${activeTab === 'subscriptions' ? 'block' : 'hidden'}`}>
                {subscriptionsLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : subscriptionsError ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-red-500">{subscriptionsError}</p>
                  </div>
                ) : subscriptions.length > 0 ? (
                  <ul className="space-y-4 overflow-y-auto h-full pr-2">
                    {subscriptions.map((item) => (
                      <li
                        key={item.tag_name}
                        className="border border-[#d6bda7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4"
                      >
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          <p className="text-gray-600">@{item.tag_name}</p>
                          <p className="text-gray-600">{item.city || 'Город не указан'}</p>
                        </div>
                        <button 
                          onClick={() => handleUnsubscribe(item.tag_name)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Отписаться
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Нет активных подписок</p>
                  </div>
                )}
              </div>

              {/* Блок подписчиков */}
              <div className={`h-full ${activeTab === 'followers' ? 'block' : 'hidden'}`}>
                {followersLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : followersError ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-red-500">{followersError}</p>
                  </div>
                ) : followers.length > 0 ? (
                  <ul className="space-y-4 overflow-y-auto h-full pr-2">
                    {followers.map((item) => (
                      <li
                        key={item.tag_name}
                        className="border border-[#d6bda7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4"
                      >
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div>
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          <p className="text-gray-600">@{item.tag_name}</p>
                          <p className="text-gray-600">{item.city || 'Город не указан'}</p>
                          <p className="text-gray-600 text-sm">
                            Подписан с: {new Date(item.since).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">У вас пока нет подписчиков</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка — история */}
          <div className="w-full min-h-[400px] lg:w-1/3 bg-white rounded-2xl shadow-md p-6 ring-2 ring-[#d6bda7] flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-[#5e4c3f]">История посещения</h2>
            
            <div className="flex-grow overflow-hidden">
              {profileData.history.length > 0 ? (
                <div className="grid gap-4 overflow-y-auto h-full pr-2">
                  {profileData.history.map((record) => (
                    <div
                      key={record.history_id}
                      className="border border-[#d6bda7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Название и дата */}
                      <div className="flex justify-between items-center mb-2">
                        <h1 className="font-medium text-black text-2xl">{record.event_name}</h1>
                        <p className="text-sm text-gray-500"> <span>Дата: </span>
                          {new Date(record.event_date_start).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Описание */}
                      <div className="max-w-[30rem]">
                        <p className="text-lg text-black mb-3 break-words whitespace-pre-wrap">
                          {record.event_description || 'Без описания'}
                        </p>
                      </div>

                      {/* Жалоба и статус */}
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-red-600">{record.is_complaint ? 'Есть жалоба' : ' '}</p>
                        <p className="text-sm text-gray-600">Статус: {record.history_status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">История пуста</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCabinet;