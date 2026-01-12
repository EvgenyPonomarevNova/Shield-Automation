/**
 * Скрипт для динамической загрузки контента категорий каталога из Strapi
 * @file catalog-dynamic.js
 */

class CatalogDynamic {
  constructor() {
    this.currentCategory = null;
    this.categories = {};
    this.allCategories = [];
    this.isLoading = false;
    this.initialized = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.swipeThreshold = 50; // минимальное расстояние для свайпа
  }

  async init() {
    if (document.body.classList.contains("components-loaded")) {
      await this.setup();
    } else {
      document.addEventListener("componentsLoaded", () => {
        this.setup();
      });
    }

    setTimeout(() => {
      if (!this.initialized) {
        this.setup();
      }
    }, 3000);
  }

  async setup() {
    try {
      await this.setupEventListeners();
      await this.loadInitialCategory();
      this.initialized = true;
      this.addZoomButtonsToExistingGalleries(); // Добавляем кнопки к уже загруженным галереям
    } catch (error) {
      console.error("CatalogDynamic: Ошибка инициализации:", error);
    }
  }

async setupEventListeners() {
  const menuList = document.querySelector(".catalog-menu__list");
  if (menuList) {
    menuList.addEventListener("click", (e) => {
      const menuItem = e.target.closest(".catalog-menu__item");
      if (menuItem) {
        e.preventDefault();
        const categoryId = menuItem.getAttribute("data-category");
        if (categoryId) {
          this.selectCategory(categoryId);
        }
      }
    });
  }

  // Ждем загрузки DOM и затем добавляем обработчик для кнопки
  const initMobileMenu = () => {
    const toggleBtn = document.querySelector('.catalog-sidebar__toggle-btn');
    const sidebarContent = document.querySelector('.catalog-sidebar__content');
    
    console.log('CatalogDynamic: Инициализация мобильного меню');
    console.log('Кнопка найдена:', !!toggleBtn);
    console.log('Контент найден:', !!sidebarContent);
    
    if (toggleBtn && sidebarContent) {
      // Удаляем старые обработчики чтобы избежать дублирования
      const newToggleBtn = toggleBtn.cloneNode(true);
      const newSidebarContent = sidebarContent.cloneNode(true);
      
      toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
      sidebarContent.parentNode.replaceChild(newSidebarContent, sidebarContent);
      
      const freshToggleBtn = document.querySelector('.catalog-sidebar__toggle-btn');
      const freshSidebarContent = document.querySelector('.catalog-sidebar__content');
      
      freshToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('CatalogDynamic: Клик по кнопке меню');
        
        freshSidebarContent.classList.toggle('catalog-sidebar__content--open');
        freshToggleBtn.classList.toggle('catalog-sidebar__toggle-btn--open');
      });
      
      // Закрытие при клике вне меню
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.catalog-sidebar') && 
            !e.target.closest('.catalog-sidebar__toggle-btn')) {
          if (freshSidebarContent.classList.contains('catalog-sidebar__content--open')) {
            freshSidebarContent.classList.remove('catalog-sidebar__content--open');
            freshToggleBtn.classList.remove('catalog-sidebar__toggle-btn--open');
          }
        }
      });
      
      // Закрытие при выборе пункта меню
      freshSidebarContent.addEventListener('click', (e) => {
        if (e.target.closest('.catalog-menu__link')) {
          setTimeout(() => {
            freshSidebarContent.classList.remove('catalog-sidebar__content--open');
            freshToggleBtn.classList.remove('catalog-sidebar__toggle-btn--open');
          }, 300);
        }
      });
    }
  };

  // Инициализируем при загрузке
  setTimeout(initMobileMenu, 100);
  
  // И повторно после загрузки категорий
  setTimeout(initMobileMenu, 500);

  window.addEventListener("popstate", (event) => {
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
  async loadInitialCategory() {
    try {
      this.allCategories = await this.loadCategoriesFromStrapi();

      if (this.allCategories.length === 0) {
        this.showFallbackContent();
        return;
      }

      this.updateMenuWithCategories(this.allCategories);

      const hash = window.location.hash.substring(1);
      let targetCategory = null;

      if (hash && this.isValidCategory(hash)) {
        targetCategory = hash;
      } else {
        targetCategory = this.getFirstAvailableCategory();
        if (!targetCategory) {
          return;
        }
      }

      await this.selectCategory(targetCategory, true);
    } catch (error) {
      console.error("CatalogDynamic: Ошибка начальной загрузки:", error);
      this.showFallbackContent();
    }
  }

  async loadCategoriesFromStrapi() {
    if (!window.strapiAPI) {
      console.error("CatalogDynamic: Strapi API не инициализирован");
      return [];
    }

    try {
      const categories = await window.strapiAPI.getAllCategories();

      if (!categories || categories.length === 0) {
        return [];
      }

      const publishedCategories = categories.filter((cat) => {
        const attrs = cat.attributes;
        return attrs.slug && attrs.name;
      });

      return publishedCategories;
    } catch (error) {
      console.error("CatalogDynamic: Ошибка загрузки категорий:", error);
      return [];
    }
  }

  getFirstAvailableCategory() {
    if (this.allCategories.length === 0) return null;
    return this.allCategories[0].attributes.slug;
  }

  isValidCategory(categoryId) {
    if (!this.allCategories || this.allCategories.length === 0) {
      return false;
    }
    return this.allCategories.some((cat) => cat.attributes.slug === categoryId);
  }

  updateMenuWithCategories(categories) {
    const menuList = document.querySelector(".catalog-menu__list");
    if (!menuList) {
      console.error("CatalogDynamic: Меню не найдено");
      return;
    }

    menuList.innerHTML = "";

    // Используем порядок из API (убрали сортировку по алфавиту)
    const sortedCategories = categories;

    sortedCategories.forEach((category) => {
      const attributes = category.attributes;
      const listItem = document.createElement("li");

      listItem.className = "catalog-menu__item";
      listItem.setAttribute("data-category", attributes.slug);

      const link = document.createElement("a");
      link.href = `#${attributes.slug}`;
      link.className = "catalog-menu__link";
      link.textContent = attributes.name;

      listItem.appendChild(link);
      menuList.appendChild(listItem);
    });
  }

  async selectCategory(categoryId, initialLoad = false) {
    if (this.isLoading) {
      return;
    }

    if (!initialLoad && this.currentCategory === categoryId) {
      return;
    }

    this.isLoading = true;
    this.currentCategory = categoryId;

    this.updateActiveMenuItem(categoryId);
    this.showLoading();

    try {
      const category = await this.loadCategoryFromStrapi(categoryId);

      if (!category) {
        throw new Error(`Категория ${categoryId} не найдена`);
      }

      this.updateBreadcrumbs(category);
      this.displayCategoryContent(category);

      if (!initialLoad) {
        window.history.pushState(
          { category: categoryId },
          "",
          `#${categoryId}`
        );
      }

      this.categories[categoryId] = category;
    } catch (error) {
      console.error(
        `CatalogDynamic: Ошибка загрузки категории ${categoryId}:`,
        error
      );
      this.displayError(categoryId);
    } finally {
      this.isLoading = false;
      this.hideLoading();

      const sidebarContent = document.querySelector(
        ".catalog-sidebar__content"
      );
      const mobileToggle = document.querySelector(".catalog-sidebar__toggle-btn");
      if (sidebarContent) {
        sidebarContent.classList.remove("catalog-sidebar__content--open");
      }
      if (mobileToggle) {
        mobileToggle.classList.remove("catalog-sidebar__toggle-btn--open");
      }
    }
  }

  updateActiveMenuItem(categoryId) {
    const menuItems = document.querySelectorAll(".catalog-menu__item");
    menuItems.forEach((item) => {
      item.classList.remove("catalog-menu__item--current");
    });

    const activeItem = document.querySelector(
      `[data-category="${categoryId}"]`
    );
    if (activeItem) {
      activeItem.classList.add("catalog-menu__item--current");
    }
  }

  updateBreadcrumbs(category) {
    const currentBreadcrumb = document.getElementById("current-category");
    if (currentBreadcrumb && category.attributes.name) {
      currentBreadcrumb.textContent = category.attributes.name;
    }
  }

  showLoading() {
    const contentContainer = document.getElementById("category-content");
    const loadingIndicator = document.getElementById("category-loading");

    if (contentContainer) {
      contentContainer.classList.add("category-content--loading");
    }

    if (loadingIndicator) {
      loadingIndicator.classList.add("category-loading--active");
    }
  }

  hideLoading() {
    const contentContainer = document.getElementById("category-content");
    const loadingIndicator = document.getElementById("category-loading");

    if (contentContainer) {
      contentContainer.classList.remove("category-content--loading");
    }

    if (loadingIndicator) {
      loadingIndicator.classList.remove("category-loading--active");
    }
  }

  async loadCategoryFromStrapi(slug) {
    if (this.categories[slug]) {
      return this.categories[slug];
    }

    if (!window.strapiAPI) {
      throw new Error("Strapi API не инициализирован");
    }

    const category = await window.strapiAPI.getCategoryBySlug(slug);
    if (!category) {
      throw new Error(`Категория ${slug} не найдена в Strapi`);
    }

    return category;
  }

  // ===== ФУНКЦИОНАЛ ПОЛНОЭКРАННОГО ПРОСМОТРА С ЗУМОМ =====

  // Инициализация галереи с добавлением кнопки лупы
  async initGallery(category) {
    console.log(
      "CatalogDynamic: Инициализация галереи для",
      category.attributes.name
    );

    const galleryElement = document.querySelector(
      `[data-strapi-slug="${category.attributes.slug}"]`
    );
    if (!galleryElement) {
      console.error("Gallery element not found");
      return;
    }

    // Проверяем, не инициализирована ли уже галерея
    if (galleryElement.classList.contains("gallery-initialized")) {
      console.log("Gallery already initialized, skipping");
      return;
    }

    const galleryImages = category.attributes.gallery?.data;
    if (!galleryImages || galleryImages.length === 0) {
      console.log("No gallery images");
      return;
    }

    // Подготавливаем данные
    const imagesData = [];
    galleryImages.forEach((img) => {
      if (img.attributes) {
        const url = window.strapiAPI.getImageUrl(img.attributes);
        if (url) {
          imagesData.push({
            url: url,
            alt:
              img.attributes.alternativeText ||
              img.attributes.caption ||
              img.attributes.name ||
              `${category.attributes.name} - изображение`,
            title: category.attributes.name
          });
        }
      }
    });

    if (imagesData.length === 0) {
      console.log("No valid image URLs");
      return;
    }

    // Устанавливаем данные
    galleryElement.setAttribute(
      "data-strapi-gallery",
      JSON.stringify(imagesData)
    );
    console.log("Gallery data set, images:", imagesData.length);

    // Добавляем кнопку лупы для мобильных
    this.addZoomButton(galleryElement, imagesData);

    // Триггерим событие о том, что данные готовы
    const event = new CustomEvent("galleryDataReady", {
      detail: { element: galleryElement, images: imagesData },
    });
    galleryElement.dispatchEvent(event);
  }

  // Добавляем кнопку лупы
  addZoomButton(galleryElement, imagesData) {
    console.log('CatalogDynamic: Добавление кнопки лупы для мобильных');
    
    // Удаляем старую кнопку, если есть
    const oldBtn = galleryElement.querySelector('.gallery-zoom-btn');
    if (oldBtn) {
      oldBtn.remove();
    }
    
    // Создаем новую кнопку лупы
    const zoomBtn = document.createElement('button');
    zoomBtn.className = 'gallery-zoom-btn';
    zoomBtn.innerHTML = '🔍';
    zoomBtn.setAttribute('aria-label', 'Увеличить изображение');
    zoomBtn.setAttribute('title', 'Увеличить изображение');
    
    // Показываем кнопку только на мобильных устройствах
    if (window.innerWidth <= 991) {
      zoomBtn.style.display = 'flex';
      zoomBtn.style.opacity = '1';
      zoomBtn.style.visibility = 'visible';
    } else {
      zoomBtn.style.display = 'none';
    }
    
    // Добавляем анимацию пульсации для привлечения внимания
    setTimeout(() => {
      zoomBtn.classList.add('gallery-zoom-btn--pulse');
    }, 1000);
    
    // Добавляем обработчик клика
    zoomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('CatalogDynamic: Открытие полноэкранного просмотра');
      this.openFullscreenViewer(galleryElement, imagesData);
    });
    
    // Добавляем кнопку в галерею
    galleryElement.appendChild(zoomBtn);
    console.log('CatalogDynamic: Кнопка лупы добавлена в DOM');
    
    // Также добавляем возможность открыть по клику на слайд (только на мобильных)
    const slidesContainer = galleryElement.querySelector('.gallery-slides');
    if (slidesContainer && window.innerWidth <= 991) {
      slidesContainer.style.cursor = 'pointer';
      slidesContainer.addEventListener('click', (e) => {
        if (!e.target.closest('.gallery-zoom-btn') && 
            !e.target.closest('.gallery-prev') && 
            !e.target.closest('.gallery-next')) {
          console.log('CatalogDynamic: Открытие по клику на слайд');
          this.openFullscreenViewer(galleryElement, imagesData);
        }
      });
    }
  }

  // Автоматически добавляет кнопки лупы ко всем существующим галереям
  addZoomButtonsToExistingGalleries() {
    if (window.innerWidth <= 991) {
      console.log('CatalogDynamic: Поиск существующих галерей для добавления кнопок лупы');
      const galleryElements = document.querySelectorAll('[data-strapi-gallery]');
      
      galleryElements.forEach(galleryElement => {
        const galleryData = galleryElement.getAttribute('data-strapi-gallery');
        if (galleryData) {
          try {
            const imagesData = JSON.parse(galleryData);
            console.log('CatalogDynamic: Найдена галерея, добавление кнопки лупы');
            this.addZoomButton(galleryElement, imagesData);
          } catch (e) {
            console.error('CatalogDynamic: Ошибка парсинга данных галереи:', e);
          }
        }
      });
    }
  }

  // Открывает полноэкранный просмотрщик
  openFullscreenViewer(galleryElement, imagesData) {
    console.log('CatalogDynamic: Открытие полноэкранного просмотра');
    
    // Создаем контейнер для полноэкранного просмотра
    let viewer = document.querySelector('.fullscreen-viewer');
    
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.className = 'fullscreen-viewer';
      viewer.innerHTML = this.createFullscreenViewerHTML();
      document.body.appendChild(viewer);
      
      // Инициализируем функционал просмотрщика
      this.initFullscreenViewer(viewer, galleryElement, imagesData);
    } else {
      // Обновляем данные если просмотрщик уже существует
      this.updateFullscreenViewer(viewer, galleryElement, imagesData);
    }
    
    // Показываем просмотрщик
    viewer.classList.add('fullscreen-viewer--active');
    document.body.style.overflow = 'hidden';
    
    // Добавляем подсказку при первом открытии
    this.showGestureHint(viewer);
  }

  // Создает HTML для полноэкранного просмотрщика
  createFullscreenViewerHTML() {
    return `
      <div class="fullscreen-viewer__container">
        <div class="fullscreen-viewer__header">
          <h3 class="fullscreen-viewer__title">Фото</h3>
          <button class="fullscreen-viewer__close" aria-label="Закрыть">×</button>
        </div>
        
        <div class="fullscreen-viewer__image-container" id="fullscreen-image-container">
          <img class="fullscreen-viewer__image" id="fullscreen-image" src="" alt="">
          <div class="fullscreen-viewer__gesture-hint" id="gesture-hint">
            <p class="fullscreen-viewer__gesture-hint-text">Сводите пальцы для зума<br>Двигайте для прокрутки</p>
          </div>
        </div>
        
        <div class="fullscreen-viewer__counter" id="fullscreen-counter">1/1</div>
        <div class="fullscreen-viewer__zoom-indicator" id="zoom-indicator">100%</div>
        
        <div class="fullscreen-viewer__controls">
          <button class="fullscreen-viewer__control-btn fullscreen-viewer__control-btn--zoom-in" aria-label="Увеличить">+</button>
          <button class="fullscreen-viewer__control-btn fullscreen-viewer__control-btn--zoom-out" aria-label="Уменьшить">−</button>
          <button class="fullscreen-viewer__control-btn fullscreen-viewer__control-btn--reset" aria-label="Сбросить зум">↺</button>
        </div>
        
        <div class="fullscreen-viewer__hint" id="zoom-hint">Сводите пальцы для зума</div>
      </div>
    `;
  }

  // Инициализирует полноэкранный просмотрщик
  initFullscreenViewer(viewer, galleryElement, imagesData) {
    const closeBtn = viewer.querySelector('.fullscreen-viewer__close');
    const imageContainer = viewer.querySelector('#fullscreen-image-container');
    const image = viewer.querySelector('#fullscreen-image');
    const counter = viewer.querySelector('#fullscreen-counter');
    const zoomIndicator = viewer.querySelector('#zoom-indicator');
    const zoomInBtn = viewer.querySelector('.fullscreen-viewer__control-btn--zoom-in');
    const zoomOutBtn = viewer.querySelector('.fullscreen-viewer__control-btn--zoom-out');
    const resetBtn = viewer.querySelector('.fullscreen-viewer__control-btn--reset');
    
    // Состояние зума
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let currentIndex = 0;
    let isDragging = false;
    let startX, startY, startPosX, startPosY;
    
    // Получаем текущий индекс из слайдера
    const slides = galleryElement.querySelectorAll('.gallery-slide');
    slides.forEach((slide, index) => {
      if (slide.style.display === 'block' || slide.style.display === 'flex') {
        currentIndex = index;
      }
    });
    
    // Обновляет изображение
    const updateImage = () => {
      if (imagesData[currentIndex]) {
        image.src = imagesData[currentIndex].url;
        image.alt = imagesData[currentIndex].alt;
        counter.textContent = `${currentIndex + 1}/${imagesData.length}`;
        
        // Сбрасываем зум при смене изображения
        resetZoom();
      }
    };
    
    // Сбрасывает зум
    const resetZoom = () => {
      scale = 1;
      posX = 0;
      posY = 0;
      updateTransform();
      updateZoomIndicator();
    };
    
    // Обновляет трансформацию изображения
    const updateTransform = () => {
      image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    };
    
    // Обновляет индикатор зума
    const updateZoomIndicator = () => {
      zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
    };
    
    // Ограничивает позицию изображения
    const constrainPosition = () => {
      const containerWidth = imageContainer.clientWidth;
      const containerHeight = imageContainer.clientHeight;
      const imgWidth = image.naturalWidth * scale;
      const imgHeight = image.naturalHeight * scale;
      
      // Максимальные смещения
      const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
      const maxY = Math.max(0, (imgHeight - containerHeight) / 2);
      
      // Ограничиваем позицию
      posX = Math.max(-maxX, Math.min(maxX, posX));
      posY = Math.max(-maxY, Math.min(maxY, posY));
    };
    
    // Увеличивает зум
    const zoomIn = () => {
      if (scale < 5) {
        scale = Math.min(5, scale * 1.2);
        updateTransform();
        updateZoomIndicator();
        constrainPosition();
      }
    };
    
    // Уменьшает зум
    const zoomOut = () => {
      if (scale > 0.5) {
        scale = Math.max(0.5, scale / 1.2);
        updateTransform();
        updateZoomIndicator();
        constrainPosition();
      }
    };
    
    // Обработчики кнопок
    closeBtn.addEventListener('click', () => {
      viewer.classList.remove('fullscreen-viewer--active');
      document.body.style.overflow = '';
      resetZoom();
    });
    
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetBtn.addEventListener('click', resetZoom);
    
    // Закрытие по клику на затемнение
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) {
        viewer.classList.remove('fullscreen-viewer--active');
        document.body.style.overflow = '';
        resetZoom();
      }
    });
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && viewer.classList.contains('fullscreen-viewer--active')) {
        viewer.classList.remove('fullscreen-viewer--active');
        document.body.style.overflow = '';
        resetZoom();
      }
    });
    
    // Жесты для мобильных устройств
    let initialDistance = null;
    let initialScale = 1;
    
    // Касания для зума
    imageContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Мультитач - зум
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
      } else if (e.touches.length === 1) {
        // Одно касание - перетаскивание
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startPosX = posX;
        startPosY = posY;
      }
    }, { passive: false });
    
    imageContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        // Мультитач - зум
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (initialDistance) {
          scale = initialScale * (currentDistance / initialDistance);
          scale = Math.max(0.5, Math.min(5, scale));
          updateTransform();
          updateZoomIndicator();
        }
      } else if (e.touches.length === 1 && isDragging) {
        // Одно касание - перетаскивание
        e.preventDefault();
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        posX = startPosX + deltaX;
        posY = startPosY + deltaY;
        
        constrainPosition();
        updateTransform();
      }
    }, { passive: false });
    
    imageContainer.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        initialDistance = null;
      }
      if (e.touches.length === 0) {
        isDragging = false;
      }
    });
    
    // Перетаскивание мышью (для десктопов)
    imageContainer.addEventListener('mousedown', (e) => {
      if (scale > 1) {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startPosX = posX;
        startPosY = posY;
      }
    });
    
    imageContainer.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        posX = startPosX + deltaX;
        posY = startPosY + deltaY;
        
        constrainPosition();
        updateTransform();
      }
    });
    
    imageContainer.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    imageContainer.addEventListener('mouseleave', () => {
      isDragging = false;
    });
    
    // Колесико мыши для зума
    imageContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newScale = Math.max(0.5, Math.min(5, scale + delta));
      
      // Масштабируем относительно курсора
      const rect = imageContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - imageContainer.clientWidth / 2;
      const y = e.clientY - rect.top - imageContainer.clientHeight / 2;
      
      scale = newScale;
      posX = x * (1 - scale);
      posY = y * (1 - scale);
      
      constrainPosition();
      updateTransform();
      updateZoomIndicator();
    }, { passive: false });
    
    // Навигация по изображениям
    let touchStartX = 0;
    let touchEndX = 0;
    
    imageContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && scale === 1) {
        touchStartX = e.touches[0].clientX;
      }
    });
    
    imageContainer.addEventListener('touchend', (e) => {
      if (scale === 1) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
      }
    });
    
    const handleSwipe = () => {
      const threshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Свайп влево - следующее изображение
          currentIndex = (currentIndex + 1) % imagesData.length;
        } else {
          // Свайп вправо - предыдущее изображение
          currentIndex = (currentIndex - 1 + imagesData.length) % imagesData.length;
        }
        updateImage();
      }
    };
    
    // Инициализация
    updateImage();
    
    // Сохраняем данные в элементе
    viewer.dataset.images = JSON.stringify(imagesData);
    viewer.dataset.currentIndex = currentIndex;
  }

  // Обновляет данные просмотрщика
  updateFullscreenViewer(viewer, galleryElement, imagesData) {
    // Обновляем массив изображений
    viewer.dataset.images = JSON.stringify(imagesData);
    
    // Получаем текущий индекс из слайдера
    const slides = galleryElement.querySelectorAll('.gallery-slide');
    let currentIndex = 0;
    slides.forEach((slide, index) => {
      if (slide.style.display === 'block' || slide.style.display === 'flex') {
        currentIndex = index;
      }
    });
    
    viewer.dataset.currentIndex = currentIndex;
    
    // Обновляем изображение
    const image = viewer.querySelector('#fullscreen-image');
    const counter = viewer.querySelector('#fullscreen-counter');
    
    if (imagesData[currentIndex]) {
      image.src = imagesData[currentIndex].url;
      image.alt = imagesData[currentIndex].alt;
      counter.textContent = `${currentIndex + 1}/${imagesData.length}`;
    }
  }

  // Показывает подсказку о жестах
  showGestureHint(viewer) {
    const hint = viewer.querySelector('#gesture-hint');
    if (hint) {
      // Проверяем, показывали ли уже подсказку
      const hasShownHint = localStorage.getItem('fullscreenHintShown');
      
      if (!hasShownHint && window.innerWidth <= 991) {
        // Показываем подсказку
        hint.style.display = 'block';
        
        // Убираем через 4 секунды
        setTimeout(() => {
          hint.style.display = 'none';
        }, 4000);
        
        // Помечаем, что подсказку показали
        localStorage.setItem('fullscreenHintShown', 'true');
      } else {
        hint.style.display = 'none';
      }
    }
    
    // Также показываем текстовую подсказку
    const textHint = viewer.querySelector('#zoom-hint');
    if (textHint) {
      textHint.style.display = 'block';
      setTimeout(() => {
        textHint.style.display = 'none';
      }, 3000);
    }
  }

  // Инициализация компонентов после загрузки
  initComponentsAfterLoad(category) {
    console.log(
      "CatalogDynamic: Инициализация компонентов для",
      category.attributes.name
    );

    // Сначала инициализируем галерею (устанавливаем данные)
    this.initGallery(category);

    // Потом модальные окна
    this.initModalButtons();

    // Принудительно запускаем галерею через 500мс
    const galleryElement = document.querySelector(
      `[data-strapi-slug="${category.attributes.slug}"]`
    );
    if (galleryElement && window.gallerySlider) {
      setTimeout(() => {
        if (!galleryElement.classList.contains("gallery-initialized")) {
          console.log("Forcing gallery initialization");
          window.gallerySlider.initGallery(galleryElement);
          
          // После инициализации галереи добавляем свайп для мобильных
          if (window.innerWidth <= 991) {
            this.setupMobileSwipe(galleryElement);
          }
          
          // Добавляем кнопку лупы если ее еще нет
          const existingBtn = galleryElement.querySelector('.gallery-zoom-btn');
          if (!existingBtn && galleryElement.getAttribute('data-strapi-gallery')) {
            try {
              const imagesData = JSON.parse(galleryElement.getAttribute('data-strapi-gallery'));
              this.addZoomButton(galleryElement, imagesData);
            } catch (e) {
              console.error('Error parsing gallery data:', e);
            }
          }
        }
      }, 500);
    }
  }

  displayCategoryContent(category) {
    const contentContainer = document.getElementById("category-content");
    if (!contentContainer) {
      console.error("CatalogDynamic: Контейнер контента не найден");
      return;
    }

    const html = this.createCategoryHTML(category);
    contentContainer.innerHTML = html;

    setTimeout(() => {
      this.initComponentsAfterLoad(category);
    }, 50);
  }

  createCategoryHTML(category) {
    const attributes = category.attributes;
    const description = this.formatDescription(attributes.description);
    const mainImageUrl = this.getMainImageUrl(attributes);

    return `
            <div class="catalog-header">
                <h1 class="catalog-header__title">${this.escapeHtml(
                  attributes.name
                )}</h1>
                
                <div class="catalog-description">
                    ${
                      mainImageUrl
                        ? `
                    <div class="catalog-description__image">
                        <img 
                            src="${mainImageUrl}" 
                            alt="${this.escapeHtml(attributes.name)}" 
                            class="catalog-description__img"
                            loading="lazy"
                        >
                    </div>
                    `
                        : ""
                    }
                    
                    <div class="catalog-description__text">
                        ${description}
                    </div>
                </div>
            </div>
            
            <div class="catalog-gallery">
                <div class="gallery-slider" 
                     data-category="${attributes.slug}" 
                     data-strapi-slug="${attributes.slug}"
                     data-gallery-ready="false">
                </div>
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

  formatDescription(description) {
    if (!description) return "<p>Описание отсутствует</p>";

    if (typeof description === "object") {
      try {
        if (description.blocks) {
          return description.blocks
            .map((block) => {
              if (block.type === "paragraph") {
                return `<p>${block.text}</p>`;
              }
              return "";
            })
            .join("");
        }
      } catch (e) {
        console.warn("Ошибка парсинга Rich Text:", e);
      }
    }

    const paragraphs = description
      .toString()
      .split("\n")
      .filter((p) => p.trim());
    if (paragraphs.length === 0) return "<p>Описание отсутствует</p>";

    return paragraphs
      .map((p) => `<p>${this.escapeHtml(p.trim())}</p>`)
      .join("");
  }

  getMainImageUrl(attributes) {
    if (attributes.mainImage?.data) {
      const imageData = attributes.mainImage.data;

      if (
        Array.isArray(imageData) &&
        imageData.length > 0 &&
        imageData[0].attributes
      ) {
        return window.strapiAPI.getImageUrl(imageData[0].attributes);
      } else if (imageData.attributes) {
        return window.strapiAPI.getImageUrl(imageData.attributes);
      }
    }

    const galleryImages = attributes.gallery?.data;
    if (galleryImages && galleryImages.length > 0) {
      const mainImage = galleryImages.find(
        (img) =>
          img.attributes &&
          (img.attributes.name?.includes("main") ||
            img.attributes.url?.includes("main"))
      );

      if (mainImage && mainImage.attributes) {
        return window.strapiAPI.getImageUrl(mainImage.attributes);
      }

      const firstImage = galleryImages[0];
      if (firstImage.attributes) {
        return window.strapiAPI.getImageUrl(firstImage.attributes);
      }
    }

    return "../../images/catalog/default.jpg";
  }

  // Добавляем метод для обработки свайпов
  setupMobileSwipe(galleryElement) {
    if (window.innerWidth > 991) return; // Только для мобильных
    
    const slidesContainer = galleryElement.querySelector('.gallery-slides');
    if (!slidesContainer) return;
    
    slidesContainer.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slidesContainer.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }
  
  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) < this.swipeThreshold) return;
    
    const slides = document.querySelectorAll('.gallery-slide');
    const thumbs = document.querySelectorAll('.gallery-thumb');
    let currentIndex = 0;
    
    slides.forEach((slide, index) => {
      if (slide.style.display === 'block' || slide.style.display === 'flex') {
        currentIndex = index;
      }
    });
    
    if (diff > 0) {
      // Свайп влево - следующий слайд
      this.showSlide(currentIndex + 1, slides, thumbs);
    } else {
      // Свайп вправо - предыдущий слайд
      this.showSlide(currentIndex - 1, slides, thumbs);
    }
  }
  
  showSlide(index, slides, thumbs) {
    const totalSlides = slides.length;
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    slides.forEach((slide) => {
      slide.style.display = "none";
    });

    slides[index].style.display = "block";

    thumbs.forEach((thumb) => {
      thumb.classList.remove("active");
    });

    if (thumbs[index]) {
      thumbs[index].classList.add("active");
    }
  }

  initModalButtons() {
    const modalButtons = document.querySelectorAll("[data-modal]");

    modalButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const modalId = button.getAttribute("data-modal");
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = "block";
          document.body.style.overflow = "hidden";
        }
      });
    });

    const closeButtons = document.querySelectorAll(".modal__close");
    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modal = button.closest(".modal");
        if (modal) {
          modal.style.display = "none";
          document.body.style.overflow = "";
        }
      });
    });

    const overlays = document.querySelectorAll(".modal__overlay");
    overlays.forEach((overlay) => {
      overlay.addEventListener("click", () => {
        const modal = overlay.closest(".modal");
        if (modal) {
          modal.style.display = "none";
          document.body.style.overflow = "";
        }
      });
    });
  }

  displayError(categoryId) {
    const contentContainer = document.getElementById("category-content");
    if (!contentContainer) return;

    contentContainer.innerHTML = `
            <div class="catalog-error">
                <div class="catalog-error__message">
                    <h3 class="catalog-error__title">Ошибка загрузки</h3>
                    <p class="catalog-error__text">Не удалось загрузить контент для категории "${categoryId}"</p>
                    <button class="catalog-error__button button" onclick="window.location.reload()">
                        Обновить страницу
                    </button>
                </div>
            </div>
        `;
  }

  showFallbackContent() {
    const contentContainer = document.getElementById("category-content");
    if (!contentContainer) return;

    contentContainer.innerHTML = `
            <div class="catalog-fallback">
                <h1 class="catalog-header__title">Щиты автоматизации котельных</h1>
                
                <div class="catalog-description">
                    <div class="catalog-description__image">
                        <img src="../../images/catalog/default.jpg" alt="Каталог" class="catalog-description__img">
                    </div>
                    
                    <div class="catalog-description__text">
                        <p>Каталог временно недоступен. Пожалуйста, попробуйте позже.</p>
                        <p>Или свяжитесь с нами для получения информации:</p>
                    </div>
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
            </div>
        `;

    this.initModalButtons();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Создаем экземпляр
document.addEventListener("DOMContentLoaded", () => {
  window.catalogDynamic = new CatalogDynamic();

  document.addEventListener("componentsLoaded", () => {
    if (window.catalogDynamic && !window.catalogDynamic.initialized) {
      window.catalogDynamic.init();
    }
  });

  setTimeout(() => {
    if (window.catalogDynamic && !window.catalogDynamic.initialized) {
      window.catalogDynamic.init();
    }
  }, 3000);
});

// ===== ДОПОЛНИТЕЛЬНЫЕ ОБРАБОТЧИКИ ДЛЯ ГАРАНТИРОВАННОГО ДОБАВЛЕНИЯ КНОПКИ ЛУПЫ =====

// Автоматическое добавление кнопки лупы при инициализации галереи
document.addEventListener('galleryDataReady', (e) => {
  console.log('CatalogDynamic: Событие galleryDataReady получено');
  const { element: galleryElement, images: imagesData } = e.detail;
  
  // Добавляем кнопку лупы
  if (window.catalogDynamic && window.catalogDynamic.addZoomButton) {
    setTimeout(() => {
      console.log('CatalogDynamic: Добавление кнопки лупы через событие galleryDataReady');
      window.catalogDynamic.addZoomButton(galleryElement, imagesData);
    }, 100);
  }
});

// Добавляем кнопки при изменении размера окна (если перешли с десктопа на мобильный)
window.addEventListener('resize', () => {
  if (window.innerWidth <= 991) {
    console.log('CatalogDynamic: Изменение размера окна на мобильный, добавление кнопок лупы');
    if (window.catalogDynamic && window.catalogDynamic.addZoomButtonsToExistingGalleries) {
      window.catalogDynamic.addZoomButtonsToExistingGalleries();
    }
  }
});

// Добавляем кнопки при полной загрузке страницы
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.innerWidth <= 991) {
      console.log('CatalogDynamic: Страница загружена, добавление кнопок лупы');
      if (window.catalogDynamic && window.catalogDynamic.addZoomButtonsToExistingGalleries) {
        window.catalogDynamic.addZoomButtonsToExistingGalleries();
      }
    }
  }, 1500);
});

// Добавляем кнопки при переключении категорий
const originalSelectCategory = CatalogDynamic.prototype.selectCategory;
CatalogDynamic.prototype.selectCategory = async function(...args) {
  const result = await originalSelectCategory.apply(this, args);
  
  // После загрузки категории добавляем кнопки лупы
  setTimeout(() => {
    if (window.innerWidth <= 991 && this.addZoomButtonsToExistingGalleries) {
      console.log('CatalogDynamic: Категория загружена, добавление кнопок лупы');
      this.addZoomButtonsToExistingGalleries();
    }
  }, 800);
  
  return result;
};