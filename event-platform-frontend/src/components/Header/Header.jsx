import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const handleAuthClick = () => {
        console.log("GHbskdmlafwem");
        navigate('func');
    }
    const handleHomeClick = () => {
        navigate('home');
    }

    return (
        <header className="bg-[#E3D5CA] px-8 py-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#bb916f] rounded-full" 
                onClick={handleHomeClick}/>
                <h1 className="text-[#5A4A42] text-3xl font-bold">МЕРП</h1>
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
                        onClick={handleAuthClick}
                        className="bg-[#CAA07D] text-white px-6 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2"
                    >
                        <span>Авторизоваться</span>
                    </button>

                </div>
            </nav>
        </header>
    )
}
export default Header;