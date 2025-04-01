import { useNavigate } from "react-router-dom";
import ROUTER_PATH from '../../navigation/path';

function Registr(){
    const navigate = useNavigate();

    return(
        <div>
            <h1>
                Регистрация
            </h1>
            <p>
                Логин - 
                <input type="Логин" /><br />
                Пароль -
                <input type="Пароль" /><br />
                Почта - 
                <input type="text" /><br />
                Настоящее имя (ФИО) - 
                <input type="text" /><br />
                Город - 
                <input type="text" /><br />
                О себе - 
                <input type="text" /><br />
                [Что вас интересует] - хз пока на счет этого. В теории могут быть теги. Закоменть если мешает и вынеси, потом решим
            </p>
        </div>
    )
}
export default Registr;