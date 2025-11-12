// Глобальные переменные
let winesData = [];
let filteredWines = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadWines();
    setupEventListeners();
    initAnimations();
});

// Загрузка данных о винах
async function loadWines() {
    try {
        const response = await fetch('wines.json');
        winesData = await response.json();
        filteredWines = [...winesData];
        renderWines();
        populateFilters();
        updateResultsCount();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('winesGrid').innerHTML = 
            '<p style="text-align: center; color: red;">Ошибка загрузки данных о винах</p>';
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Фильтры
    document.getElementById('countryFilter').addEventListener('change', handleFilter);
    document.getElementById('varietyFilter').addEventListener('change', handleFilter);
    document.getElementById('sweetnessFilter').addEventListener('change', handleFilter);
    
    // Модальное окно
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('wineModal').addEventListener('click', (e) => {
        if (e.target.id === 'wineModal') {
            closeModal();
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Заполнение фильтров
function populateFilters() {
    const countries = [...new Set(winesData.map(wine => wine.country))].sort();
    const varieties = [...new Set(winesData.map(wine => wine.variety))].sort();
    
    const countryFilter = document.getElementById('countryFilter');
    const varietyFilter = document.getElementById('varietyFilter');
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
    
    varieties.forEach(variety => {
        const option = document.createElement('option');
        option.value = variety;
        option.textContent = variety;
        varietyFilter.appendChild(option);
    });
}

// Поиск
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    applyFilters(searchTerm);
}

// Фильтрация
function handleFilter() {
    applyFilters();
}

// Применение всех фильтров
function applyFilters(searchTerm = '') {
    const country = document.getElementById('countryFilter').value;
    const variety = document.getElementById('varietyFilter').value;
    const sweetness = document.getElementById('sweetnessFilter').value;
    const searchInput = document.getElementById('searchInput');
    
    if (searchTerm === '' && searchInput.value) {
        searchTerm = searchInput.value.toLowerCase().trim();
    }
    
    filteredWines = winesData.filter(wine => {
        const matchesSearch = searchTerm === '' || 
            wine.name.toLowerCase().includes(searchTerm) ||
            wine.country.toLowerCase().includes(searchTerm) ||
            wine.region.toLowerCase().includes(searchTerm) ||
            wine.variety.toLowerCase().includes(searchTerm);
        
        const matchesCountry = country === '' || wine.country === country;
        const matchesVariety = variety === '' || wine.variety === variety;
        const matchesSweetness = sweetness === '' || wine.sweetness === sweetness;
        
        return matchesSearch && matchesCountry && matchesVariety && matchesSweetness;
    });
    
    renderWines();
    updateResultsCount();
}

// Отображение вин
function renderWines() {
    const grid = document.getElementById('winesGrid');
    
    if (filteredWines.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-secondary); font-size: 1.2rem;">Вина не найдены</p>';
        return;
    }
    
    grid.innerHTML = filteredWines.map(wine => createWineCard(wine)).join('');
    
    // Анимация появления карточек
    animateWineCards();
    
    // Добавление обработчиков клика
    document.querySelectorAll('.wine-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            openWineModal(filteredWines[index]);
        });
    });
}

// Создание карточки вина
function createWineCard(wine) {
    return `
        <div class="wine-card" data-id="${wine.id}">
            <div class="wine-card-image-container">
                <img src="${wine.image}" alt="${wine.name}" class="wine-card-image" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🍷%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="wine-card-header">
                <h3 class="wine-card-name">${wine.name}</h3>
                <div class="wine-card-country">
                    <span>📍</span>
                    <span>${wine.country}, ${wine.region}</span>
                </div>
            </div>
            <div class="wine-card-info">
                <span class="wine-card-badge">${wine.variety}</span>
                <span class="wine-card-badge">${wine.sweetness}</span>
                ${wine.year ? `<span class="wine-card-badge">${wine.year}</span>` : ''}
            </div>
            <p class="wine-card-taste">${wine.taste}</p>
        </div>
    `;
}

// Анимация карточек вин
function animateWineCards() {
    const cards = document.querySelectorAll('.wine-card');
    
    cards.forEach((card, index) => {
        gsap.fromTo(card, 
            {
                opacity: 0,
                y: 50,
                rotationX: 10,
            },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.6,
                delay: index * 0.1,
                ease: 'power3.out'
            }
        );
    });
}

// Открытие модального окна
function openWineModal(wine) {
    const modal = document.getElementById('wineModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-image-container">
            <img src="${wine.image}" alt="${wine.name}" class="modal-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🍷%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="modal-info">
            <h2 class="modal-title">${wine.name}</h2>
            <p class="modal-subtitle">${wine.country}, ${wine.region} ${wine.year ? `• ${wine.year}` : ''}</p>
            
            <div class="modal-badges">
                <span class="modal-badge">${wine.variety}</span>
                <span class="modal-badge">${wine.sweetness}</span>
                <span class="modal-badge">${wine.type}</span>
            </div>
            
            <div class="modal-section">
                <h3 class="modal-section-title">🎨 Цвет</h3>
                <p class="modal-section-content">${wine.color}</p>
            </div>
            
            <div class="modal-section">
                <h3 class="modal-section-title">🌸 Аромат</h3>
                <p class="modal-section-content">${wine.aroma}</p>
            </div>
            
            <div class="modal-section">
                <h3 class="modal-section-title">👅 Вкус</h3>
                <p class="modal-section-content">${wine.taste}</p>
            </div>
            
            <div class="modal-section">
                <h3 class="modal-section-title">🍽️ Гастрономия</h3>
                <p class="modal-section-content">${wine.gastronomy}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Анимация появления модального окна
    gsap.fromTo('.modal-content',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('wineModal');
    
    gsap.to('.modal-content', {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}

// Обновление счетчика результатов
function updateResultsCount() {
    const count = filteredWines.length;
    document.getElementById('resultsCount').textContent = count;
}

// Инициализация анимаций
function initAnimations() {
    // Анимация заголовков
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.to('.title-line', {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    });
    
    gsap.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1.2,
        ease: 'power3.out'
    });
    
    gsap.to('.cta-button', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1.5,
        ease: 'power3.out'
    });
    
    // Анимация секций при скролле
    gsap.utils.toArray('.section-title, .section-subtitle').forEach(element => {
        gsap.fromTo(element,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                ease: 'power3.out'
            }
        );
    });
    
    // Параллакс эффект для hero
    gsap.to('.hero-bg', {
        y: '50%',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}

// Прокрутка к секции вин
function scrollToWines() {
    const winesSection = document.getElementById('wines');
    winesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Плавная прокрутка для навигационных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

