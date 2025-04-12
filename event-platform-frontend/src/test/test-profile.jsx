import React, { useState, useEffect, useContext } from 'react';
import UserService from '../services/User.service/user.service';
import { AuthContext } from '../components/authorization/AuthContext';

const ProfileTest = () => {
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
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

    // Загрузка профиля при монтировании
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchProfile();
        } else if (!authLoading && !isAuthenticated) {
            setProfileData(null);
            setError('Пожалуйста, авторизуйтесь');
        }
    }, [isAuthenticated, authLoading]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Тестирование профиля</h1>

            {/* Индикатор загрузки */}
            {loading && (
                <div className="text-center text-gray-500">Загрузка...</div>
            )}

            {/* Отображение ошибки */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    Ошибка: {error}
                </div>
            )}

            {/* Отображение профиля */}
            {profileData && !loading && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Информация о пользователе</h2>
                    <pre className="bg-gray-100 p-4 rounded-md mb-6 overflow-x-auto">
                        {JSON.stringify(profileData.info, null, 2)}
                    </pre>

                    <h2 className="text-2xl font-semibold mb-4">Активные события</h2>
                    {profileData.events.length > 0 ? (
                        <ul className="space-y-4">
                            {profileData.events.map((event) => (
                                <li
                                    key={event.event_id}
                                    className="bg-white shadow-md rounded-lg p-4"
                                >
                                    <h3 className="text-lg font-medium">{event.name}</h3>
                                    <p className="text-gray-600">Ограничение: {event.limited}</p>
                                    <p className="text-gray-600">
                                        Дата начала: {new Date(event.start_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        Дата окончания: {new Date(event.end_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        Описание: {event.description || 'Нет описания'}
                                    </p>
                                    <p className="text-gray-600">Создатель: {event.creator_tag}</p>
                                    <p className="text-gray-600">Просмотры: {event.views}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Нет активных событий</p>
                    )}

                    <h2 className="text-2xl font-semibold mt-6 mb-4">История</h2>
                    {profileData.history.length > 0 ? (
                        <ul className="space-y-4">
                            {profileData.history.map((record) => (
                                <li
                                    key={record.history_id}
                                    className="bg-white shadow-md rounded-lg p-4"
                                >
                                    <h3 className="text-lg font-medium">{record.event_name}</h3>
                                    <p className="text-gray-600">
                                        Дата начала: {new Date(record.event_date_start).toLocaleString()}
                                    </p>
                                    <p className="text-gray-600">
                                        Описание: {record.event_description || 'Нет описания'}
                                    </p>
                                    <p className="text-gray-600">Статус: {record.history_status}</p>
                                    <p className="text-gray-600">
                                        Жалоба: {record.is_complaint ? 'Да' : 'Нет'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">История пуста</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileTest;