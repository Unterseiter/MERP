import { useState, useEffect } from 'react';
import AuthService from '../services/Auth.service/auth.service';

const AuthTestPage = () => {
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

  // Проверка аутентификации при загрузке компонента
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
      setUser(userData);
      setFormData({ tag_name: '', city: '', name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      setError('Ошибка при выходе: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {user ? `Welcome, ${user.tag_name}` : isLoginForm ? 'Вход' : 'Регистрация'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!user ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Поле для Tag Name */}
              <div>
                <label htmlFor="tag_name" className="block text-sm font-medium text-gray-700">
                  Tag Name
                </label>
                <input
                  id="tag_name"
                  name="tag_name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  value={formData.tag_name}
                  onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                />
              </div>

              {/* Дополнительные поля для регистрации */}
              {!isLoginForm && (
                <>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Город
                    </label>
                    <input
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Имя
                    </label>
                    <input
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
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

              {/* Поле пароля */}
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
        ) : (
          <div className="mt-6 text-center">
            <button
              onClick={handleLogout}
              className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Выйти
            </button>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>Статус: {user ? 'Аутентифицирован' : 'Гость'}</p>
          {user && (
            <div className="mt-2">
              <p>Tag: {user.tag_name}</p>
              <p>Email: {user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;