import React, { useState, useEffect, useContext } from 'react';
import UserService from '../../services/User.service/user.service';
import { AuthContext } from '../../components/authorization/AuthContext';

const ProfileCabinet = () => {
  const { isAuthenticated, loading: authLoading, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Функция для загрузки профиля
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.getProfile();
      console.log(data);
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Личный кабинет</h1>

      {/* Индикатор загрузки */}
      {(loading || authLoading) && (
        <div className="text-center text-gray-500">Загрузка...</div>
      )}

      {/* Отображение ошибки */}
      {error && !loading && !authLoading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          Ошибка: {error}
        </div>
      )}

      {/* Основной контент */}
      {profileData && !loading && !authLoading && (
        <div className="space-y-8">
          {/* Секция 1: Личной информации */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Личная информация</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Имя:</span> {profileData.info.name || 'Не указано'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Тег:</span> {profileData.info.tag_name || 'Не указано'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Город:</span> {profileData.info.city || 'Не указано'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {profileData.info.email || 'Не указано'}
                </p>
              </div>
            </div>
          </div>

          {/* Секция 2: Список с историей посещения мероприятий */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">История посещения мероприятий</h2>
            {profileData.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Название</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Дата</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Описание</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Статус</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Жалоба</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.history.map((record) => (
                      <tr key={record.history_id} className="border-t">
                        <td className="px-4 py-2 text-gray-600">{record.event_name}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {new Date(record.event_date_start).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {record.event_description || 'Нет описания'}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{record.history_status}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {record.is_complaint ? 'Да' : 'Нет'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">История пуста</p>
            )}
          </div>

          {/* Секция 3: Кнопки выхода */}
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCabinet;