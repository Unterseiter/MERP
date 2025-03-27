const BuildNotices = require('./notices.js');
const noticesModule = BuildNotices();

document.addEventListener('DOMContentLoaded', () => {
  noticesModule.init();
});

// карусель
document.addEventListener('DOMContentLoaded', () => {
    // Карусель
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // Автопереключение карусели
    let autoSlide = setInterval(nextSlide, 5000);

    // Пауза при наведении
    document.querySelector('.carousel-container').addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });

    document.querySelector('.carousel-container').addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, 5000);
    });

    // Обработчики для пагинации
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Логика переключения страниц
            console.log('Переход на страницу:', e.target.textContent);
        });
    });
});

// открытие функциональной страницы
function openFunctionPage() {
    window.open("../html/function_page.html", "_self")
}
// кнопка авторизоваться
function openWindowAuthorisation() {
    const shadow = document.getElementById('shadow');
    const authWindow = document.getElementById('authorisation');

    // Показываем элементы
    shadow.style.display = 'block';
    authWindow.style.display = 'block';
}

function closeModal() {
    document.getElementById('shadow').style.display = 'none';
    document.getElementById('authorisation').style.display = 'none';
}

function handleLogin() {
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('auth-error');

    if (!login || !password) {
        errorDiv.textContent = "Все поля обязательны для заполнения!";
        return;
    }

    // Здесь можно добавить AJAX-запрос для реальной авторизации
    errorDiv.textContent = "";
    alert(`Добро пожаловать, ${login}!`);
    closeModal();
}

// Закрытие окна при нажатии Esc
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});

// Закрытие при клике на затемнение
document.getElementById('shadow').addEventListener('click', closeModal);
// кнопка создать запись

function openCreatorsPage() {
    window.open("../html/creator_page.html", "_self")
}

// кнопка уведомления

// кнопка чат

// пасхалка логотип

// Фильтр

function filter() {
    document.getElementById("filterDrop").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Сортировка

function sorting() {
    document.getElementById("sortingDrop").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}