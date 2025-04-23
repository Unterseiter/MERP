import React, { useState, useEffect, useContext } from 'react';
import UserService from '../../services/User.service/user.service';
import { AuthContext } from '../../components/authorization/AuthContext';
import image from '../../assets/defuser.png';

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
    <div className="ml-10 mt-5 mb-5">
      {(loading || authLoading) && (
        <div className="text-center text-gray-500 mb-4">Загрузка...</div>
      )}

      {error && !loading && !authLoading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          Ошибка: {error}
        </div>
      )}

      {profileData && !loading && !authLoading && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Левая колонка — профиль */}
          <div className="w-full lg:w-1/5 h-1/4 bg-white rounded-2xl shadow-md text-black p-6 flex flex-col items-center relative ring-2 ring-[#d6bda7]">
            <img
              src={image}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <div className='text-left'>
              <h2 className="text-xl font-semibold">{profileData.info.name || 'Имя не указано'}</h2>
              <p className="text-sm">@{profileData.info.tag_name}</p>
              <p className="text-sm mt-2">{profileData.info.city || 'Город не указан'}</p>
              <p className="text-sm">На сайте с {new Date(profileData.info.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</p>
              <p className="text-sm">{profileData.info.email}</p>
            </div>
            <button onClick={handleLogout} className="mt-6 text-red-600 hover:underline text-sm">
              Выйти
            </button>
          </div>

          {/* Правая колонка — история */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-md p-6 ring-2 ring-[#d6bda7]">
            <h2 className="text-2xl font-semibold mb-4 text-[#5e4c3f]">История посещения</h2>

            {profileData.history.length > 0 ? (
              <div className="grid gap-4 overflow-y-auto max-h-[600px] pr-2">
                {profileData.history.map((record) => (
                  <div
                    key={record.history_id}
                    className="border border-[#d6bda7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Название и дата */}
                    <div className="flex justify-between items-center mb-2"> 
                      <h1 className="font-medium text-black text-2xl">{record.event_name}</h1>
                      <p className="text-sm text-gray-500"> <span>Дата начала: </span>
                        {new Date(record.event_date_start).toLocaleString()}
                      </p>
                    </div>

                    {/* Описание */}
                    <p className="text-lg text-black mb-3"> 
                      {record.event_description || 'Без описания'}
                    </p>

                    {/* Жалоба и статус */}
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-red-600">{record.is_complaint ? 'Есть жалоба' : ' '}</p>
                      <p className="text-sm text-gray-600">Статус: {record.history_status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">История пуста</p>
            )}
          </div>


        </div>
      )}
    </div>
  );

};

export default ProfileCabinet;