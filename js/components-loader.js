/**
 * Компонент для динамической загрузки шапки и подвала на все страницы
 * @file components-loader.js
 */

class ComponentsLoader {
  constructor() {
    this.components = {
      header: './header.html',
      footer: './footer.html'
    };
    this.loadedComponents = 0;
    this.totalComponents = 2;
    this.componentsLoaded = false;
  }

  async loadComponent(componentName, targetSelector) {
    try {
      const componentPath = this.components[componentName];
      if (!componentPath) {
        return { success: false, component: componentName, error: 'Component not found' };
      }

      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const html = await response.text();
      const targetElement = document.querySelector(targetSelector);
      
      if (targetElement) {
        if (componentName === 'header') {
          targetElement.insertAdjacentHTML('afterbegin', html);
        } else if (componentName === 'footer') {
          targetElement.insertAdjacentHTML('beforeend', html);
        }
        
        this.loadedComponents++;
        
        await this.initComponent(componentName);
        
        return { success: true, component: componentName };
      } else {
        return { success: false, component: componentName, error: 'Target element not found' };
      }
    } catch (error) {
      this.createFallbackComponent(componentName);
      return { success: false, component: componentName, error: error.message };
    }
  }

  createFallbackComponent(componentName) {
    const targetElement = document.querySelector('.page__wrapper');
    if (!targetElement) return;
    
    let html = '';
    
    if (componentName === 'header') {
      html = `
        <header class="header">
          <div class="header__container container">
            <div class="header__logo">
              <a href="/" class="logo">
                <span class="logo__text">ТехноИмпериум</span>
              </a>
            </div>
            <div class="header__nav">
              <nav class="main-nav">
                <a href="/">Главная</a>
                <a href="catalog.html">Каталог</a>
                <a href="documentation.html">Документация</a>
                <a href="avtomatizatsiya.html">Автоматизация котельных</a>
                <a href="AutomationShields.html">Щиты автоматизации</a>
                <a href="about.html">О нас</a>
                <a href="search.html">Поиск</a>
              </nav>
            </div>
            <button class="header__menu-toggle" aria-label="Открыть меню">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>
      `;
      targetElement.insertAdjacentHTML('afterbegin', html);
      this.loadedComponents++;
    } else if (componentName === 'footer') {
      html = `
        <footer class="footer">
          <div class="footer__container container">
            <div class="footer__info">
              <div class="footer__logo">ТехноИмпериум</div>
              <p>Профессиональная автоматизация котельных</p>
            </div>
            <div class="footer__copyright">
              <p>© ТехноИмпериум. Все права защищены.</p>
            </div>
          </div>
        </footer>
      `;
      targetElement.insertAdjacentHTML('beforeend', html);
      this.loadedComponents++;
    }
  }

  async initComponent(componentName) {
    switch (componentName) {
      case 'header':
        await this.initHeader();
        break;
      case 'footer':
        await this.initFooter();
        break;
    }
  }

  async initHeader() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 1. Инициализация десктопного меню (выпадающие меню каталога)
    await this.initDesktopMenu();
    
    // 2. Инициализация мобильного меню
    await this.initMobileMenu();
    
    // 3. Инициализация модальных окон в шапке
    await this.initHeaderModals();
  }

  async initDesktopMenu() {
    // Инициализация каталога (если есть выпадающее меню)
    const catalogButton = document.querySelector('.catalog__button');
    const catalogMenu = document.querySelector('.catalog__menu');
    
    if (catalogButton && catalogMenu) {
      catalogButton.addEventListener('click', (e) => {
        e.stopPropagation();
        catalogMenu.classList.toggle('catalog__menu--open');
        catalogButton.classList.toggle('catalog__button--active');
      });

      document.addEventListener('click', (e) => {
        if (!catalogButton.contains(e.target) && !catalogMenu.contains(e.target)) {
          catalogMenu.classList.remove('catalog__menu--open');
          catalogButton.classList.remove('catalog__button--active');
        }
      });
    }

    // Инициализация поиска (если есть)
    const searchToggle = document.querySelector('.search__toggle');
    const searchForm = document.querySelector('.search__form');
    const searchClose = document.querySelector('.search__close');
    
    if (searchToggle && searchForm) {
      searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        searchForm.classList.add('search__form--open');
        const searchInput = searchForm.querySelector('.search__input');
        if (searchInput) searchInput.focus();
      });

      if (searchClose) {
        searchClose.addEventListener('click', (e) => {
          e.stopPropagation();
          searchForm.classList.remove('search__form--open');
        });
      }

      document.addEventListener('click', (e) => {
        if (!searchToggle.contains(e.target) && 
            !searchForm.contains(e.target) && 
            searchForm.classList.contains('search__form--open')) {
          searchForm.classList.remove('search__form--open');
        }
      });

      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          const input = searchForm.querySelector('.search__input');
          if (input && input.value.trim() === '') {
            e.preventDefault();
          }
        });
      }
    }
  }

  async initMobileMenu() {
    const menuToggle = document.querySelector('.header__menu-toggle');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (!document.querySelector('.mobile-menu')) {
          this.createMobileMenu();
        }
        
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.toggle('mobile-menu--open');
          menuToggle.classList.toggle('header__menu-toggle--active');
          
          if (mobileMenu.classList.contains('mobile-menu--open')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        }
      });
    }
  }

  createMobileMenu() {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    
    // Кнопка закрытия
    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-menu__close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Закрыть меню');
    closeButton.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu--open');
      const menuToggle = document.querySelector('.header__menu-toggle');
      if (menuToggle) {
        menuToggle.classList.remove('header__menu-toggle--active');
      }
      document.body.style.overflow = '';
    });
    mobileMenu.appendChild(closeButton);
    
    // Контент меню
    const menuContent = document.createElement('div');
    menuContent.className = 'mobile-menu__content';
    
    // Навигация по пунктам меню
    const navigationHTML = `
      <nav class="mobile-menu__nav">
        <a href="/" class="mobile-menu__link">Главная</a>
        <a href="avtomatizatsiya.html" class="mobile-menu__link">Автоматизация котельных</a>
        <a href="AutomationShields.html" class="mobile-menu__link">Щиты автоматизации</a>
        <a href="catalog.html" class="mobile-menu__link">Каталог</a>
        <a href="portfolio.html" class="mobile-menu__link">Наши работы</a>
        <a href="documentation.html" class="mobile-menu__link">Документация</a>
        <a href="search.html" class="mobile-menu__link">Поиск</a>
        <a href="about.html" class="mobile-menu__link">Контакты</a>
      </nav>
    `;
    
    menuContent.innerHTML = navigationHTML;
    
    // Добавляем обработчики для ссылок
    const menuLinks = menuContent.querySelectorAll('.mobile-menu__link');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('mobile-menu--open');
        const menuToggle = document.querySelector('.header__menu-toggle');
        if (menuToggle) {
          menuToggle.classList.remove('header__menu-toggle--active');
        }
        document.body.style.overflow = '';
      });
    });
    
    mobileMenu.appendChild(menuContent);
    
    // Оверлей для закрытия
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu__overlay';
    overlay.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu--open');
      const menuToggle = document.querySelector('.header__menu-toggle');
      if (menuToggle) {
        menuToggle.classList.remove('header__menu-toggle--active');
      }
      document.body.style.overflow = '';
    });
    
    document.body.appendChild(mobileMenu);
    document.body.appendChild(overlay);
  }

  async initHeaderModals() {
    const callbackButtons = document.querySelectorAll('.header [data-modal="callback"], .header [href="#callback"]');
    
    callbackButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const modal = document.getElementById('callback');
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

  async initFooter() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const callbackButtons = document.querySelectorAll('.footer [data-modal="callback"], .footer [href="#callback"]');
    
    callbackButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const modal = document.getElementById('callback');
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });
    
    this.initAllModals();
  }
  
  initAllModals() {
    // Инициализация всех модальных окон
    const modalButtons = document.querySelectorAll('[data-modal], a[href^="#"]');
    
    modalButtons.forEach(button => {
      const href = button.getAttribute('href');
      const modalId = button.getAttribute('data-modal') || (href && href.startsWith('#') ? href.substring(1) : null);
      
      if (modalId && modalId !== '') {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
          }
        });
      }
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
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
          if (modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
        
        // Закрытие мобильного меню
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('mobile-menu--open')) {
          mobileMenu.classList.remove('mobile-menu--open');
          const menuToggle = document.querySelector('.header__menu-toggle');
          if (menuToggle) {
            menuToggle.classList.remove('header__menu-toggle--active');
          }
          document.body.style.overflow = '';
        }
      }
    });
  }

  async loadAllComponents() {
    const results = [];
    
    const headerResult = await this.loadComponent('header', '.page__wrapper');
    results.push(headerResult);
    
    const footerResult = await this.loadComponent('footer', '.page__wrapper');
    results.push(footerResult);
    
    this.componentsLoaded = true;
    
    return Promise.resolve(results);
  }

  areAllComponentsLoaded() {
    return this.loadedComponents >= this.totalComponents;
  }
}

window.ComponentsLoader = ComponentsLoader;