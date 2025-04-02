import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Добавляем useState
import AuthPopup from '../authorization/authorization'; // Путь должен быть правильным

function Header() {
    const navigate = useNavigate()
    const [showAuthPopup, setShowAuthPopup] = useState(false)

    const handleHomeClick = () => {
        navigate('home');
    }

    return (
        <header className="bg-[#E3D5CA] px-8 py-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-4" onClick={handleHomeClick}>
                <div className="w-12 h-12 bg-[#bb916f] rounded-full" />
                <h1 className=" text-[#5A4A42] text-3xl font-bold">МЕРП</h1>
            </div>

            <nav className="flex items-center gap-4">
                <button className="bg-[#CAA07D] text-white px-6 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2">
                    <span>Создать запись</span>
                </button>
                <button className="bg-[#CAA07D] text-white p-2 rounded-full hover:bg-[#B08F6E] transition">
                    Уведомления
                </button>
                <button className="bg-[#CAA07D] text-white p-2 rounded-full hover:bg-[#B08F6E] transition">
                    Чат
                </button>

                <div className="relative">
                    <button
                        className={`bg-[#CAA07D] text-white px-6 py-2 rounded-full transition-all duration-300
                        ${showAuthPopup
                                ? "bg-[#B08F6E] shadow-lg shadow-[#B08F6E]/50"
                                : "hover:bg-[#B08F6E] hover:shadow-md"
                            }`}
                        onClick={() => setShowAuthPopup(!showAuthPopup)}
                    >
                        Вход
                    </button>

                    {showAuthPopup && (
                        <AuthPopup
                            onClose={() => setShowAuthPopup(false)}
                        />
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Header