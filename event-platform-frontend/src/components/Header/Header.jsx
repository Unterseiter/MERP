import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import AuthPopup from '../authorization/authorization';
import { AuthContext } from '../../components/authorization/AuthContext'; // Предполагаемый контекст аутентификации
import { Bell, MessageSquare, Plus, ChevronDown, User } from 'lucide-react';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import AuthService from '../../services/Auth.service/auth.service';


function Header() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const { isAuthenticated, user, loading } = useContext(AuthContext); // Получаем статус и данные пользователя

    //console.log(user);

    const handleHomeClick = () => {
        navigate('home');
    };

    const handleProfileClick = () => {
        navigate('profile'); // Перенаправление на страницу личного кабинета
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            logout();
        } catch (err) {
            console.log('Ошибка при выходе: ' + err.message);
        }
    };

    return (
        <header className="bg-[#dec3ae] px-8 py-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-4 cursor-pointer" onClick={handleHomeClick}>
                <div className="relative w-12 h-12 bg-[#bb916f] rounded-full shadow-md flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center transform scale-75">
                        <Logo className="logo-style" />
                    </div>
                </div>
                <h1 className="text-[#5A4A42] text-3xl font-bold drop-shadow-md">МЕРП</h1>
            </div>

            <nav className="flex items-center gap-4">
                <button className="bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2 shadow-md hover:shadow-lg active:shadow-inner">
                    <Plus size={20} />
                    <span>Создать запись</span>
                </button>
                <button className="bg-[#CAA07D] text-white p-2 rounded-full hover:bg-[#B08F6E] transition flex items-center justify-center w-10 h-10 shadow-md hover:shadow-lg active:shadow-inner">
                    <Bell size={20} />
                </button>
                <button className="bg-[#CAA07D] text-white p-2 rounded-full hover:bg-[#B08F6E] transition flex items-center justify-center w-10 h-10 shadow-md hover:shadow-lg active:shadow-inner">
                    <MessageSquare size={20} />
                </button>

                <div className="relative">
                    {loading ? (
                        <button className="bg-[#CAA07D] text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-md opacity-50">
                            <span>Загрузка...</span>
                        </button>
                    ) : isAuthenticated ? (
                        <button
                            className="bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg active:shadow-inner"
                            onClick={handleProfileClick}
                        >
                            <User size={20} />
                            <span>{user?.tag_name || 'Личный кабинет'}</span>
                        </button>
                    ) : (
                        <button
                            className={`bg-[#CAA07D] text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-md
                ${showAuthPopup ? 'bg-[#B08F6E] shadow-lg shadow-[#B08F6E]/50' : 'hover:bg-[#B08F6E] hover:shadow-lg'}
                active:shadow-inner`}
                            onClick={() => setShowAuthPopup(!showAuthPopup)}
                        >
                            <User size={20} />
                            <span>Вход</span>
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${showAuthPopup ? 'rotate-180' : ''}`}
                            />
                        </button>
                    )}

                    {showAuthPopup && !isAuthenticated && (
                        <AuthPopup onClose={() => setShowAuthPopup(false)} />
                    )}
                </div>
                <button
                className={`bg-[#CAA07D] text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-md
                    ${showAuthPopup ? 'bg-[#B08F6E] shadow-lg shadow-[#B08F6E]/50' : 'hover:bg-[#B08F6E] hover:shadow-lg'}
                    active:shadow-inner`}
                    onClick={handleLogout}
                >
                    Выйти
                </button>
            </nav>
        </header>
    );
}

export default Header;