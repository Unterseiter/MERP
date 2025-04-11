import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Предполагается, что у вас есть контекст аутентификации
import AuthService from '../../services/Auth.service/auth.service'; // Предполагается, что у вас есть сервис для работы с сервером

const AuthPopup = ({ onClose }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Функция для обновления состояния аутентификации
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Перенаправление на страницу регистрации
  const handleRegistClick = () => {
    navigate('registr');
  };

  // Обработка входа
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.login({ email, password });
      const token = response.token; // Предполагается, что сервер возвращает токен
      login(token); // Сохраняем токен через контекст
      onClose(); // Закрываем попап после успешного входа
    } catch (err) {
      setError('Ошибка входа: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие попапа при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute top-[calc(100%+40px)] right-1 w-full min-w-[320px] max-w-[400px] bg-white shadow-xl rounded-xl p-6 z-50"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition text-2xl"
      >
        ×
      </button>

      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Авторизация</h3>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="email"
          placeholder="Ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B08F6E] focus:border-transparent"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B08F6E] focus:border-transparent"
          required
        />
        <button
          type="submit"
          className="w-full bg-[#CAA07D] text-white py-3 rounded-lg hover:bg-[#B08F6E] transition font-semibold"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <button
        onClick={handleRegistClick}
        className="w-full bg-[#CAA07D] text-white py-3 rounded-lg hover:bg-[#B08F6E] transition font-semibold mt-4"
      >
        Регистрация
      </button>
    </div>
  );
};

export default AuthPopup;