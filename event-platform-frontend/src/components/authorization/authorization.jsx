import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/authorization/AuthContext';
import AuthService from '../../services/Auth.service/auth.service'; // Предполагается, что у вас есть сервис для работы с сервером

const AuthPopup = ({ onClose }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    tag_name: '',
    city: '',
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AuthService.checkAuth(); // Запрос к защищенному маршруту
        setUser(userData);
      } catch (err) {
        setUser(null); // Пользователь не аутентифицирован
      }
    };
    checkAuth();
  }, []);
  // Перенаправление на страницу регистрации
  const handleRegistClick = () => {
    navigate('registr');
  };
  //Обработка входа и регистрации
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginForm) {
        await AuthService.login({ tag_name: formData.tag_name, password: formData.password });
      } else {
        await AuthService.register(formData);
      }
      // После успешного входа или регистрации запрашиваем данные пользователя
      const userData = await AuthService.checkAuth();
      login(userData);
      setUser(userData);
      setFormData({ tag_name: '', city: '', name: '', email: '', password: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          placeholder='Введите логин'
          id="tag_name"
          name="tag_name"
          type="text"
          required
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          value={formData.tag_name}
          onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
        />
        {!isLoginForm && (
          <>
            <div>
              <input
                placeholder='Введите город'
                id="city"
                name="city"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <input
                placeholder='Введите имя'
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <input
                placeholder='Введите электронную почту'
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500"
            onClick={() => setIsLoginForm(!isLoginForm)}
          >
            {isLoginForm ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : isLoginForm ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default AuthPopup;