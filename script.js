// Скрипт для интерактивных элементов и 3D-анимаций на сайте о винах

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация 3D сцены для бутылки вина
    const hero3dContainer = document.querySelector('.hero-3d-container');
    if (hero3dContainer && window.THREE) {
        initWineBottle3D();
    }

    // Загрузка вин из JSON файла
    loadWines();

    // Мобильное меню
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            // Анимация гамбургера
            this.classList.toggle('active');
        });
    }

    // Плавная навигация
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Плавная прокрутка с использованием requestAnimationFrame для лучшего контроля
            smoothScrollTo(targetSection.offsetTop - 80);
            
            // Закрываем мобильное меню при клике на ссылку
            if(navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });

    // Оптимизированный индикатор текущей секции в навигации с использованием requestAnimationFrame
    let ticking = false;
    function updateActiveNav() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if(pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateActiveNav);
            ticking = true;
        }
    });

    // Анимация для карточек вин
    // Анимация будет добавляться для динамически созданных карточек в функции loadWines

    // Анимация при скролле
    window.addEventListener('scroll', function() {
        const scrolled = window.scrollY;
        const parallax = document.querySelector('.hero');
        const speed = scrolled * 0.5;
        
        parallax.style.backgroundPositionY = -speed + 'px';
        
        // Анимация элементов при скролле
        optimizedScrollHandler();
    });

    // Оптимизированная функция для анимации элементов при скролле
    let tickingAnimate = false;
    function animateOnScroll() {
        const elements = document.querySelectorAll('.scroll-animation:not(.animate)');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150; // Порог видимости
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    function optimizedScrollHandler() {
        if (!tickingAnimate) {
            requestAnimationFrame(function() {
                animateOnScroll();
                tickingAnimate = false;
            });
            tickingAnimate = true;
        }
    }

    // Инициализация анимации при загрузке страницы
    window.addEventListener('load', function() {
        animateOnScroll(); // Вызываем один раз при загрузке для анимации видимых элементов
    });

    // Форма обратной связи
    const contactForm = document.querySelector('.contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    }

    // Анимация кнопки CTA
    const ctaButton = document.querySelector('.cta-button');
    if(ctaButton) {
        ctaButton.addEventListener('click', function() {
            this.textContent = 'Загрузка...';
            setTimeout(() => {
                this.textContent = 'Начать путешествие';
            }, 2000);
        });
    }
});

// Функция загрузки вин из JSON файла
async function loadWines() {
    try {
        const response = await fetch('wines.json');
        const wines = await response.json();
        displayWines(wines);
    } catch (error) {
        console.error('Ошибка при загрузке вин:', error);
        // В случае ошибки загрузки JSON, отображаем сообщение об ошибке
        const winesGrid = document.getElementById('wines-grid');
        winesGrid.innerHTML = '<p class="error-message">Ошибка при загрузке вин. Пожалуйста, попробуйте позже.</p>';
    }
}

// Функция отображения вин на странице
function displayWines(wines) {
    const winesGrid = document.getElementById('wines-grid');
    winesGrid.innerHTML = ''; // Очищаем контейнер перед добавлением новых вин

    // Ограничиваем количество отображаемых вин, если нужно
    const winesToShow = wines.slice(0, 9); // Показываем первые 9 вин

    winesToShow.forEach(wine => {
        const wineCard = document.createElement('div');
        wineCard.className = 'wine-card';
        wineCard.innerHTML = `
            <div class="wine-image" style="background-image: url('images/${getWineImage(wine.id)}');"></div>
            <h3>${wine.name}</h3>
            <p>${wine.country}, ${wine.region}</p>
            <div class="wine-details">
                <p class="wine-type">${wine.type}</p>
                <p class="wine-year">${wine.year}</p>
            </div>
        `;
        winesGrid.appendChild(wineCard);

        // Добавляем анимацию при наведении
        wineCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        wineCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Функция для инициализации фильтров
function initializeFilters(wines) {
    // Заполняем фильтр по странам
    const countryFilter = document.getElementById('country-filter');
    const countries = [...new Set(wines.map(wine => wine.country))].sort();
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    // Добавляем обработчики событий для фильтров
    document.getElementById('type-filter').addEventListener('change', function() {
        filterWines(wines);
    });

    document.getElementById('country-filter').addEventListener('change', function() {
        filterWines(wines);
    });

    document.getElementById('sweetness-filter').addEventListener('change', function() {
        filterWines(wines);
    });
}

// Функция фильтрации вин
function filterWines(wines) {
    const typeFilter = document.getElementById('type-filter').value;
    const countryFilter = document.getElementById('country-filter').value;
    const sweetnessFilter = document.getElementById('sweetness-filter').value;

    const filteredWines = wines.filter(wine => {
        return (!typeFilter || wine.type === typeFilter) &&
               (!countryFilter || wine.country === countryFilter) &&
               (!sweetnessFilter || wine.sweetness === sweetnessFilter);
    });

    displayWines(filteredWines);
}

// Модифицируем функцию загрузки вин, чтобы инициализировать фильтры
async function loadWines() {
    try {
        const response = await fetch('wines.json');
        const wines = await response.json();
        displayWines(wines);
        initializeFilters(wines); // Инициализируем фильтры после загрузки вин
    } catch (error) {
        console.error('Ошибка при загрузке вин:', error);
        // В случае ошибки загрузки JSON, отображаем сообщение об ошибке
        const winesGrid = document.getElementById('wines-grid');
        winesGrid.innerHTML = '<p class="error-message">Ошибка при загрузке вин. Пожалуйста, попробуйте позже.</p>';
    }
}

// Функция для получения имени файла изображения вина
function getWineImage(wineId) {
    // Получаем список файлов изображений и выбираем соответствующее вино
    // В данном случае будем использовать простую логику для демонстрации
    const imageFiles = [
        'photo_2025-11-12_21-06-06.jpg',
        'photo_2025-11-12_21-06-20.jpg',
        'photo_2025-11-12_21-06-24.jpg',
        'photo_2025-11-12_21-06-27.jpg',
        'photo_2025-11-12_21-06-30.jpg',
        'photo_2025-11-12_21-06-32.jpg',
        'photo_2025-11-12_21-06-35.jpg',
        'photo_2025-11-12_21-07-51.jpg',
        'photo_2025-11-12_21-07-54.jpg',
        'photo_2025-11-12_21-07-56.jpg',
        'photo_2025-11-12_21-07-59.jpg',
        'photo_2025-11-12_21-08-02.jpg',
        'photo_2025-11-12_21-08-04.jpg',
        'photo_2025-11-12_21-08-07.jpg',
        'photo_2025-11-12_21-08-09.jpg'
    ];
    
    // Возвращаем изображение на основе ID вина
    return imageFiles[(wine.id - 1) % imageFiles.length];
}

// Функция инициализации 3D бутылки вина
function initWineBottle3D() {
    const hero3dContainer = document.querySelector('.hero-3d-container');
    
    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9f9f9); // Цвет фона, соответствующий стилю сайта
    
    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(75, hero3dContainer.clientWidth / hero3dContainer.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(hero3dContainer.clientWidth, hero3dContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Включаем тени для более реалистичного вида
    hero3dContainer.appendChild(renderer.domElement);
    
    // Создаем группу для бутылки
    const bottleGroup = new THREE.Group();
    
    // Тело бутылки (более реалистичная форма)
    const bottleBodyGeometry = new THREE.CylinderGeometry(0.8, 1, 3, 32);
    const bottleBodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9
    });
    const bottleBody = new THREE.Mesh(bottleBodyGeometry, bottleBodyMaterial);
    bottleBody.rotation.x = Math.PI / 2;
    bottleBody.castShadow = true;
    bottleGroup.add(bottleBody);
    
    // Горлышко бутылки
    const neckGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.8, 32);
    const neckMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 1.6;
    neck.castShadow = true;
    bottleGroup.add(neck);
    
    // Пробка
    const corkGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const corkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    const cork = new THREE.Mesh(corkGeometry, corkMaterial);
    cork.position.y = 2.1;
    cork.castShadow = true;
    bottleGroup.add(cork);
    
    // Этикетка на бутылке
    const labelGeometry = new THREE.PlaneGeometry(1.8, 2);
    const labelMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.3
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0.2;
    label.position.z = 0.51; // Размещаем чуть ближе к передней части бутылки
    bottleGroup.add(label);
    
    scene.add(bottleGroup);
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 4, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Дополнительное боковое освещение для создания бликов
    const sideLight = new THREE.PointLight(0xffffff, 0.5, 10);
    sideLight.position.set(-3, 2, 1);
    scene.add(sideLight);
    
    // Анимация вращения с улучшенными эффектами
    function animate() {
        requestAnimationFrame(animate);
        
        // Плавное вращение бутылки
        bottleGroup.rotation.y += 0.005;
        
        // Легкое колебание для создания ощущения жизни
        const time = Date.now() * 0.001;
        bottleGroup.rotation.x = Math.sin(time * 0.5) * 0.05;
        bottleGroup.rotation.z = Math.cos(time * 0.7) * 0.05;
        
        // Оптимизация: рендерим только при необходимости
        renderer.render(scene, camera);
    }
    
    // Обработка изменения размера окна
    window.addEventListener('resize', function() {
        camera.aspect = hero3dContainer.clientWidth / hero3dContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(hero3dContainer.clientWidth, hero3dContainer.clientHeight);
    });
    
    animate();
}

// Функция для плавной прокрутки с кастомной анимацией
function smoothScrollTo(targetY) {
    const currentY = window.pageYOffset;
    const distance = targetY - currentY;
    const duration = 800; // Продолжительность анимации в миллисекундах
    const startTime = performance.now();

    function animation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeInOutCubic = progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
        const newY = currentY + distance * easeInOutCubic;
        window.scrollTo(0, newY);
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}