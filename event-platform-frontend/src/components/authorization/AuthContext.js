import { createContext, useState, useEffect } from 'react';
import AuthService from '../../services/Auth.service/auth.service'; // Ваш сервис для запросов к серверу

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AuthService.checkAuth(); // Запрос к защищенному маршруту
        if (userData) {
          setUser(userData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Функция входа
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData.user);
  };

  // Функция выхода
  const logout = async () => {
    try {
      await AuthService.logout(); // Запрос на сервер для очистки куки
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};