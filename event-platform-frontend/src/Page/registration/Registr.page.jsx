import { useNavigate } from "react-router-dom";
import ROUTER_PATH from '../../navigation/path';
import { useState } from "react";
import EventTester from "../../test/test"
import AuthTestPage from "../../test/test-auth"
import ProfileTestPage from "../../test/test-profile"

function Registr(){
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        login: '',
        password: '',
        email: '',
        fullName: '',
        city: '',
        about: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.login || !formData.password || !formData.email || !formData.city) {
            alert('Заполните обязательные поля (*)');
            return;
        }

        console.log('Отправляем данные:', formData);
        navigate(ROUTER_PATH.HOME_PAGE);
    };

    return (
        <div>
            <AuthTestPage />
            <EventTester  />
            <ProfileTestPage />
        </div>
    );
}

export default Registr;
/*<div>
            <h1>
                Регистрация
            </h1>
            <form onSubmit={handleSubmit}>
            <div>
                <label>Логин:</label>
                <input 
                type="text"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                required/>
            </div>
            <div>
                <label>Пароль:</label>
                <input 
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required/>
            </div>
            <div>
                <label>Почта:</label>
                <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required/>
            </div>
            <div>
                <label>ФИО:</label>
                <input 
                type="text"
                name="fullname"
                value={formData.fullName}
                onChange={handleInputChange}
                />
            </div>
            <div>
                <label>Город:</label>
                <input 
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required/>
            </div>
            <div>
                <label>О себе:</label>
                <textarea 
                name="about" 
                value={formData.about}
                cols="30"
                rows="10"
                />
            </div>
            <button className="bg-cyan-100">Зарегистрироваться</button>
            </form>
        </div>*/