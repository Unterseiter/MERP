import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, useRef } from 'react';
import AuthPopup from '../authorization/authorization';
import { AuthContext } from '../../components/authorization/AuthContext';
import { Bell, MessageSquare, Plus, ChevronDown, User, X } from 'lucide-react';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import AuthService from '../../services/Auth.service/auth.service';
import ROTER_PATH from '../../navigation/path';
import ModalCreateEvent from './ModalCreateEvent';

function Header() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef();
    const burgerRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                !showAuthPopup &&
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                burgerRef.current &&
                !burgerRef.current.contains(e.target)
            ) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAuthPopup]);

    const handleHomeClick = () => navigate('home');
    const handleProfileClick = () => navigate('profile');
    const handleMessageClick = () => navigate('details')
    const handleSuccessCreate = () =>{

    }
    const handleLogout = async () => {
        try {
            await AuthService.logout();
            logout();
        } catch (err) {
            console.log('Ошибка при выходе: ' + err.message);
        }
    };

    const handleAuthButtonClick = () => {
        setShowAuthPopup(prev => !prev);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-[#dec3ae] px-8 py-4 flex justify-between items-center shadow-md relative">
            {/* Логотип и бургер */}
            <div className="flex items-center gap-4">
                <div className="md:hidden cursor-pointer" ref={burgerRef}>
                <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-[#5A4A42] hover:text-[#6B5B53] transition"
                    >
                        {isMenuOpen ? <X size={32} /> : <MenuIcon />}
                    </button>
                </div>
            
                
                <div className="flex items-center gap-4 cursor-pointer" onClick={handleHomeClick}>
                    <div className="relative w-12 h-12 bg-[#bb916f] rounded-full shadow-md flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center transform scale-75">
                            <Logo className="logo-style" />
                        </div>
                    </div>
                    <h1 className="text-[#5A4A42] text-3xl font-bold drop-shadow-md">МЕРП</h1>
                </div>
            </div>

            {/* Десктопное меню */}
            <nav className="hidden md:flex items-center gap-4">
            <button
                    className="bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2 shadow-md hover:shadow-lg active:shadow-inner"
                    onClick={() => setOpenModal(true)}
                >
                    <Plus size={20} />
                    <span>Создать запись</span>
                </button>
                {openModal && (
                    <ModalCreateEvent
                        onClose={() => setOpenModal(false)}
                        onSuccess={handleSuccessCreate}
                    />
                )}
                {/* <button className="bg-[#CAA07D] text-white p-2 rounded-full hover:bg-[#B08F6E] transition flex items-center justify-center w-10 h-10 shadow-md hover:shadow-lg active:shadow-inner"
                    <Bell size={20} />
                </button> */}
                <button className="bg-[#CAA07D] text-white p-2 rounded-full hover:bg-[#B08F6E] transition flex items-center justify-center w-10 h-10 shadow-md hover:shadow-lg active:shadow-inner"
                onClick={()=>navigate(ROTER_PATH.EventDetail)}>
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
                            onClick={handleAuthButtonClick}
                        >
                            <User size={20} />
                            <span>Вход</span>
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${showAuthPopup ? 'rotate-180' : ''}`}
                            />
                        </button>
                    )}
                </div>
                {/* <button
                className={`bg-[#CAA07D] text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-md
                    ${showAuthPopup ? 'bg-[#B08F6E] shadow-lg shadow-[#B08F6E]/50' : 'hover:bg-[#B08F6E] hover:shadow-lg'}
                    active:shadow-inner`}
                    onClick={()=>{navigate(ROTER_PATH.registration)}}
                >
                    Тест
                </button> */}
                </nav>

            {/* Мобильное меню */}
            {isMenuOpen && (
                <div 
                    ref={menuRef}
                    className="absolute top-full right-0 w-full bg-[#dec3ae] shadow-lg md:hidden z-50"
                >
                    <div className="flex flex-col p-4 gap-4">
                        <button 
                            className="w-full bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2"
                            onClick={() => {
                                navigate(ROTER_PATH.eventManage);
                                setIsMenuOpen(false);
                            }}
                        >
                            <Plus size={20} />
                            <span>Создать запись</span>
                        </button>
                        
                        {/* <button 
                            className="w-full bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2"
                            onClick={() => {
                                navigate(ROTER_PATH.EventDetail);
                                setIsMenuOpen(false);
                            }}
                        >
                            <Bell size={20} />
                            <span>Уведомления</span>
                        </button> */}
                        
                        <button 
                            className="w-full bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2"
                            onClick={() => {
                                handleMessageClick();
                                setIsMenuOpen(false);
                            }}>
                            <MessageSquare size={20} />
                            <span>Сообщения</span>
                        </button>

                        {isAuthenticated ? (
                            <>
                                <button
                                    className="w-full bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2"
                                    onClick={() => {
                                        handleProfileClick();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <User size={20} />
                                    <span>Профиль</span>
                                </button>
                            </>
                        ) : (
                            <button
                                className="w-full bg-[#CAA07D] text-white px-4 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2"
                                onClick={handleAuthButtonClick}
                            >
                                <User size={20} />
                                <span>Войти</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Единый попап авторизации */}
{showAuthPopup && !isAuthenticated && (
    <>
        {/* Затемнение фона для мобильных устройств */}
        <div className="fixed inset-0 bg-black/50 z-[999] md:hidden" />

        {/* Контейнер попапа */}
        <div className="fixed z-[1000] 
            md:absolute md:right-4 md:top-14 md:transform-none 
            top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[400px] max-w-[95%] md:w-auto
            md:bg-[#CAA07D] md:text-white md:rounded-full md:shadow-md">

            <div className="md:hidden"> {/* Обертка для мобильной версии */}
                <AuthPopup onClose={() => setShowAuthPopup(false)} />
            </div>

            {/* Десктопная версия с обработчиком клика */}
            <div className="text-black"
                onClick={() => navigate(ROTER_PATH.registration)}>
                <AuthPopup onClose={() => setShowAuthPopup(false)} />
            </div>
        </div>
    </>
)}
        </header>
    );
}

const MenuIcon = () => (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </svg>
);

export default Header;

// hidden
//  md:block 
// px-4 
// py-2 
// transition-all
//  duration-300 
// hover:bg-[#B08F6E]
//  hover:shadow-lg
//  active:shadow-inner 
// cursor-pointer
//  shadow-[#B08F6E]/50