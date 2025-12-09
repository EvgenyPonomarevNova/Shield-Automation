/**
 * Основной скрипт инициализации сайта
 * @file main.js
 */

class MainApp {
  constructor() {
    this.init();
  }
  
  async init() {
    
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Инициализация всех общих компонентов
    this.initCommonComponents();
    
    // Инициализация специфичных для страницы компонентов
    this.initPageSpecificComponents();
    

  }
  
  initCommonComponents() {

    
    // Инициализация форм
    this.initForms();
    
    // Инициализация телефонных ссылок
    this.initPhoneLinks();
    
    // Инициализация якорей
    this.initAnchors();
    
    // Инициализация модальных окон (на всякий случай)
    this.initModals();
  }
  
  initPageSpecificComponents() {

    
    // Проверяем на какой странице мы находимся
    const body = document.body;
    
    if (body.classList.contains('page--catalog')) {
      console.log('MainApp: Страница каталога');
      // Инициализация каталога
      this.initCatalogPage();
    }
    
    if (body.classList.contains('page--home')) {
      console.log('MainApp: Главная страница');
      // Инициализация главной страницы
      this.initHomePage();
    }
  }
  
  initForms() {
    
    // Инициализация формы обратного звонка
    const callbackForm = document.querySelector('.callback-form__form');
    if (callbackForm) {
      callbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneInput = callbackForm.querySelector('input[name="phone"]');
        const phone = phoneInput ? phoneInput.value : '';
        
        console.log('MainApp: Отправка формы обратного звонка, телефон:', phone);
        
        // Здесь должна быть логика отправки формы на сервер
        // Пока просто покажем сообщение
        alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
        
        // Закрываем модальное окно
        const modal = callbackForm.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
        
        // Очищаем форму
        callbackForm.reset();
      });
    }
  }
  
  initPhoneLinks() {
    
    // Добавляем обработчики для всех телефонных ссылок
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const phoneNumber = link.getAttribute('href').replace('tel:', '');
        console.log('MainApp: Звонок на номер:', phoneNumber);
        // Здесь можно добавить аналитику
      });
    });
  }
  
  initAnchors() {

    // Плавная прокрутка к якорям
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      const href = anchor.getAttribute('href');
      // Пропускаем якоря, которые ведут к модальным окнам или пустым ссылкам
      if (href === '#' || document.getElementById(href.substring(1))?.classList.contains('modal')) {
        return;
      }
      
      anchor.addEventListener('click', (e) => {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  initModals() {

    
    // Дублирующая инициализация на случай, если components-loader не сработал
    const modalButtons = document.querySelectorAll('[data-modal], a[href^="#callback"]');
    modalButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = button.getAttribute('data-modal') || 'callback';
        
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });
    
    // Закрытие модальных окон
    const closeButtons = document.querySelectorAll('.modal__close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });
    
    // Закрытие по клику на оверлей
    const overlays = document.querySelectorAll('.modal__overlay');
    overlays.forEach(overlay => {
      overlay.addEventListener('click', () => {
        const modal = overlay.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });
  }
  
  initCatalogPage() {
    
    // Проверяем, что каталог инициализирован
    if (window.catalogDynamic && window.catalogDynamic.initialized) {

    } else {

      // Попытка инициализации каталога
      setTimeout(() => {
        if (window.catalogDynamic) {
          window.catalogDynamic.init();
        }
      }, 500);
    }
  }
  
  initHomePage() {
    // Логика для главной страницы
  }
}

// Инициализация приложения после загрузки компонентов
document.addEventListener('componentsLoaded', () => {

  window.mainApp = new MainApp();
});

// Инициализация на случай, если событие componentsLoaded не произошло
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.mainApp) {
      window.mainApp = new MainApp();
    }
  }, 3000);
});

// Обработка поиска в шапке
document.addEventListener('DOMContentLoaded', function() {
  const searchToggle = document.querySelector('.search__toggle');
  const searchForm = document.querySelector('.search__form');
  const searchInput = document.querySelector('.search__input');
  const searchClose = document.querySelector('.search__close');
  
  if (searchToggle && searchForm) {
    // Открытие/закрытие формы поиска
    searchToggle.addEventListener('click', function() {
      searchForm.classList.add('search__form--active');
      if (searchInput) searchInput.focus();
    });
    
    if (searchClose) {
      searchClose.addEventListener('click', function() {
        searchForm.classList.remove('search__form--active');
      });
    }
    
    // Обработка отправки формы поиска
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.trim();
        // Переходим на страницу поиска с параметром
        window.location.href = `search.html?s=${encodeURIComponent(query)}`;
      }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchForm.classList.contains('search__form--active')) {
        searchForm.classList.remove('search__form--active');
      }
    });
  }
  
  // Обработка поиска на странице поиска
  if (window.location.pathname.includes('search.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('s');
    
    if (query && typeof window.SearchEngine !== 'undefined') {
      window.SearchEngine.search(query);
    }
  }
});