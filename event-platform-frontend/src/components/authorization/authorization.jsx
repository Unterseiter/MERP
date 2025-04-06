import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPopup = ({ onClose }) => {
  const popupRef = useRef(null)
  const navigate = useNavigate()

  const handleRegistClick = () => {
    navigate('registr');
}

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div 
      ref={popupRef}
      className="absolute top-[calc(100%+40px)] right-1 w-full min-w-[320px] max-w-[400px] bg-white shadow-xl rounded-xl p-6 z-50"
    >
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition text-2xl"
      >
        &times;
      </button>
      
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Авторизация</h3>
      
      <div className="space-y-5">
        <input
          type="email"
          placeholder="Ваш email"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B08F6E] focus:border-transparent"
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B08F6E] focus:border-transparent"
        />
        <button className="w-full bg-[#CAA07D] text-white py-3 rounded-lg hover:bg-[#B08F6E] transition font-semibold">
          Войти
        </button>
        <button className="w-full bg-[#CAA07D] text-white py-3 rounded-lg hover:bg-[#B08F6E] transition font-semibold" onClick={handleRegistClick}>
          Регистрация
        </button>
      </div>
    </div>
  )
}

export default AuthPopup