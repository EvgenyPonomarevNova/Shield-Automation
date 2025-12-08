/**
 * Скрипт для динамической загрузки контента категорий каталога
 * @file catalog-dynamic.js
 */

class CatalogDynamic {
  constructor() {
    this.currentCategory = null; // Изначально null, чтобы можно было загрузить начальную категорию
    this.categories = {}; // Кэш загруженных категорий
    this.isLoading = false;
    this.initialized = false;
    
    // Не вызываем init() здесь, будем ждать события componentsLoaded
  }
  
  async init() {

    // Ждем загрузки компонентов
    if (document.body.classList.contains('components-loaded')) {
      this.setupEventListeners();
      this.loadInitialCategory();
    } else {
      console.log('CatalogDynamic: Ждем загрузки компонентов');
      document.addEventListener('componentsLoaded', () => {
        this.setupEventListeners();
        this.loadInitialCategory();
      });
    }
    
    this.initialized = true;
  }
  
  setupEventListeners() {
    
    // Обработка кликов по пунктам меню
    const menuItems = document.querySelectorAll('.catalog-menu__item');
    
    menuItems.forEach(item => {
      const link = item.querySelector('.catalog-menu__link');
      if (link) {
        // Удаляем все существующие обработчики
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const categoryId = item.getAttribute('data-category');
          this.selectCategory(categoryId);
        });
      }
    });
    
    // Обработка мобильного меню
    const mobileToggle = document.querySelector('.catalog-sidebar__toggle-btn');
    const sidebarContent = document.querySelector('.catalog-sidebar__content');
    
    if (mobileToggle && sidebarContent) {
      mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebarContent.classList.toggle('catalog-sidebar__content--open');
      });
    }
    
    // Закрытие мобильного меню при клике вне его
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.catalog-sidebar') && 
          !e.target.closest('.catalog-sidebar__toggle-btn') &&
          sidebarContent) {
        sidebarContent.classList.remove('catalog-sidebar__content--open');
      }
    });
    
    // Обработка кнопок назад/вперед в браузере
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.category) {
        this.selectCategory(event.state.category);
      } else if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash && this.isValidCategory(hash)) {
          this.selectCategory(hash);
        }
      }
    });
    
  }
  
  loadInitialCategory() {
    
    // Определяем категорию из URL hash
    const hash = window.location.hash.substring(1);
    console.log('CatalogDynamic: Hash из URL:', hash || 'нет');
    
    if (hash && this.isValidCategory(hash)) {
      console.log('CatalogDynamic: Загрузка категории из hash:', hash);
      this.selectCategory(hash, true); // true - начальная загрузка
    } else {
      console.log('CatalogDynamic: Загрузка категории по умолчанию: kotelnye');
      this.selectCategory('kotelnye', true);
    }
  }
  
  isValidCategory(categoryId) {
    const validCategories = [
      'kotelnye', 'itp', 'nasosy', 'kns', 'kamery', 'asu-tp', 
      'kotly', 'ovoshchehranilishcha', 'ventilyatsiya', 'vru', 
      'komplekty', 'etazhnye', 'vosstanovlenie', 'lebedki'
    ];
    return validCategories.includes(categoryId);
  }
  
  async selectCategory(categoryId, initialLoad = false) {
    
    if (this.isLoading) {
      return;
    }
    
    // Разрешаем перезагрузку той же категории при начальной загрузке
    if (!initialLoad && this.currentCategory === categoryId) {
      return;
    }
    
    this.isLoading = true;
    this.currentCategory = categoryId;
    
    // Обновляем активный пункт меню
    this.updateActiveMenuItem(categoryId);
    
    // Обновляем хлебные крошки
    this.updateBreadcrumbs(categoryId);
    
    // Обновляем URL без перезагрузки страницы (если не начальная загрузка)
    if (!initialLoad) {
      window.history.pushState({ category: categoryId }, '', `#${categoryId}`);
    }
    
    // Показываем индикатор загрузки
    this.showLoading();
    
    try {
      // Загружаем контент категории
      const content = await this.loadCategoryContent(categoryId);
      
      // Отображаем контент
      this.displayCategoryContent(content);
      
      // Сохраняем в кэш
      this.categories[categoryId] = content;
      
    } catch (error) {
      this.displayError();
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }
  
  updateActiveMenuItem(categoryId) {
    
    // Убираем активный класс со всех пунктов
    const menuItems = document.querySelectorAll('.catalog-menu__item');
    menuItems.forEach(item => {
      item.classList.remove('catalog-menu__item--current');
    });
    
    // Добавляем активный класс к выбранному пункту
    const activeItem = document.querySelector(`[data-category="${categoryId}"]`);
    if (activeItem) {
      activeItem.classList.add('catalog-menu__item--current');
    } 
  }
  
  updateBreadcrumbs(categoryId) {
    
    const categoryNames = {
      'kotelnye': 'Щиты автоматизации котельных',
      'itp': 'Щиты автоматизации ИТП',
      'nasosy': 'Щиты автоматизации насосов',
      'kns': 'Щиты автоматизации КНС',
      'kamery': 'Щиты автоматизации покрасочно-сушильных камер',
      'asu-tp': 'Щиты автоматизации для АСУ ТП',
      'kotly': 'Щиты автоматизации котлов',
      'ovoshchehranilishcha': 'Щиты автоматизации овощехранилищ',
      'ventilyatsiya': 'Щиты автоматизации систем вентиляции и кондиционирования',
      'vru': 'ВРУ (Вводно-распределительное устройство)',
      'komplekty': 'Комплект щитов для котельной',
      'etazhnye': 'Щиты этажные',
      'vosstanovlenie': 'Восстановление и ремонт щитов автоматизации',
      'lebedki': 'Щит автоматизации лебёдки'
    };
    
    const currentBreadcrumb = document.getElementById('current-category');
    if (currentBreadcrumb) {
      currentBreadcrumb.textContent = categoryNames[categoryId] || 'Каталог';
    }
  }
  
  showLoading() {
    
    const contentContainer = document.getElementById('category-content');
    const loadingIndicator = document.getElementById('category-loading');
    
    if (contentContainer) {
      contentContainer.classList.add('category-content--loading');
      contentContainer.innerHTML = ''; // Очищаем старый контент
    }
    
    if (loadingIndicator) {
      loadingIndicator.classList.add('category-loading--active');
    }
  }
  
  hideLoading() {
    
    const contentContainer = document.getElementById('category-content');
    const loadingIndicator = document.getElementById('category-loading');
    
    if (contentContainer) {
      contentContainer.classList.remove('category-content--loading');
    }
    
    if (loadingIndicator) {
      loadingIndicator.classList.remove('category-loading--active');
    }
  }
  
  async loadCategoryContent(categoryId) {
    
    // Проверяем кэш
    if (this.categories[categoryId]) {
      return this.categories[categoryId];
    }
    
    // Загружаем контент из отдельного файла
    try {
      const response = await fetch('components/catalog/' + categoryId + '.html');
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      return html;
      
    } catch (error) {
      console.error('CatalogDynamic: Ошибка загрузки файла:', error);
      
      // Возвращаем заглушку для отладки
      return this.getFallbackContent(categoryId);
    }
  }
  
  getFallbackContent(categoryId) {
    
    const categoryNames = {
      'kotelnye': 'Щиты автоматизации котельных',
      'itp': 'Щиты автоматизации ИТП',
      'nasosy': 'Щиты автоматизации насосов',
      'kns': 'Щиты автоматизации КНС',
      'kamery': 'Щиты автоматизации покрасочно-сушильных камер',
      'asu-tp': 'Щиты автоматизации для АСУ ТП',
      'kotly': 'Щиты автоматизации котлов',
      'ovoshchehranilishcha': 'Щиты автоматизации овощехранилищ',
      'ventilyatsiya': 'Щиты автоматизации систем вентиляции и кондиционирования',
      'vru': 'ВРУ (Вводно-распределительное устройство)',
      'komplekty': 'Комплект щитов для котельной',
      'etazhnye': 'Щиты этажные',
      'vosstanovlenie': 'Восстановление и ремонт щитов автоматизации',
      'lebedki': 'Щит автоматизации лебёдки'
    };
    
    const name = categoryNames[categoryId] || 'Категория';
    
    return `
      <div class="catalog-header">
        <h1 class="catalog-header__title">${name}</h1>
      </div>
      
      <div class="catalog-description">
        <p>Контент для категории "${name}" в данный момент находится в разработке.</p>
        <p>Пожалуйста, свяжитесь с нами для получения подробной информации.</p>
      </div>
      
      <div class="catalog-actions">
        <div class="catalog-actions__grid">
          <button class="catalog-actions__button catalog-actions__button--primary" data-modal="callback">
            Оставить заявку
          </button>
          <a href="tel:+79872156000" class="catalog-actions__button catalog-actions__button--secondary">
            Позвонить
          </a>
        </div>
      </div>
    `;
  }
  
  displayCategoryContent(content) {
    
    const contentContainer = document.getElementById('category-content');
    if (contentContainer) {
      contentContainer.innerHTML = content;
      
      // Инициализируем компоненты после загрузки
      setTimeout(() => {
        this.initGallery();
        this.initModalButtons();
        this.initGalleryThumbs();
      }, 100);
      
    } 
  }
  
  displayError() {
    
    const contentContainer = document.getElementById('category-content');
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="catalog-empty">
          <div class="catalog-empty__message">
            <p class="catalog-empty__text">Ошибка загрузки контента</p>
            <p class="catalog-empty__hint">Попробуйте обновить страницу или выбрать другую категорию</p>
          </div>
        </div>
      `;
    }
  }
  
  initGallery() {
    
    // Проверяем есть ли галерея в загруженном контенте
    const gallery = document.querySelector('.gallery-slider');
    if (gallery) {
      
      // Инициализация слайдера
      const mainSlider = gallery.querySelector('.gallery-slider__main');
      const slides = gallery.querySelectorAll('.gallery-slider__slide');
      const prevBtn = gallery.querySelector('.gallery-slider__prev');
      const nextBtn = gallery.querySelector('.gallery-slider__next');
      
      let currentSlide = 0;
      const totalSlides = slides.length;
      
      if (totalSlides === 0) {
        return;
      }

      // Функция показа слайда
      const showSlide = (index) => {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        // Скрываем все слайды
        slides.forEach(slide => {
          slide.style.display = 'none';
          slide.classList.remove('gallery-slider__slide--active');
        });
        
        // Показываем текущий слайд
        slides[index].style.display = 'block';
        slides[index].classList.add('gallery-slider__slide--active');
        
        currentSlide = index;
      };
      
      // Навигация
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          showSlide(currentSlide - 1);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          showSlide(currentSlide + 1);
        });
      }
      
      // Инициализация первого слайда
      showSlide(0);
      
    } 
  }
  
  initGalleryThumbs() {
    
    const thumbs = document.querySelectorAll('.gallery-thumbs__item');
    const slides = document.querySelectorAll('.gallery-slider__slide');
    
    if (thumbs.length === 0 || slides.length === 0) {
      return;
    }
    
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Убираем активный класс со всех миниатюр
        thumbs.forEach(t => {
          t.classList.remove('gallery-thumbs__item--active');
        });
        
        // Добавляем активный класс к текущей миниатюре
        thumb.classList.add('gallery-thumbs__item--active');
        
        // Показываем соответствующий слайд
        slides.forEach(slide => {
          slide.style.display = 'none';
          slide.classList.remove('gallery-slider__slide--active');
        });
        
        if (slides[index]) {
          slides[index].style.display = 'block';
          slides[index].classList.add('gallery-slider__slide--active');
        }
      });
    });
  }
  
  initModalButtons() {
    
    // Инициализация кнопок открытия модальных окон
    const modalButtons = document.querySelectorAll('[data-modal]');
    
    modalButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = button.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });
    
    // Инициализация закрытия модальных окон
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
}

// Создаем экземпляр, но не инициализируем сразу
window.catalogDynamic = new CatalogDynamic();

// Ждем события componentsLoaded для инициализации
document.addEventListener('componentsLoaded', () => {
  window.catalogDynamic.init();
});

// Инициализация через 3 секунды на всякий случай
setTimeout(() => {
  if (!window.catalogDynamic.initialized) {
    window.catalogDynamic.init();
  }
}, 3000);