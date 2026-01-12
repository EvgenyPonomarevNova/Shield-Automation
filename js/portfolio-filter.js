/**
 * Скрипт для фильтрации работ в портфолио и просмотра изображений
 * @file portfolio-filter.js
 */

class PortfolioFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll(".portfolio-filter__button");
    this.portfolioItems = document.querySelectorAll(".portfolio-item");
    this.emptyMessage = document.querySelector(".portfolio-empty");
    this.imageModal = null;
    this.currentImages = []; // Массив для хранения всех изображений работы
    this.currentIndex = 0; // Текущий индекс изображения в галерее
    this.visibleWorks = []; // Видимые (после фильтра) работы для навигации в модалке
    this.currentWorkIndex = 0; // Текущий индекс работы среди visibleWorks
    this.workPrevButton = null;
    this.workNextButton = null;
    this.workCounter = null;

    this.init();
  }

  init() {
    // Добавляем обработчики на кнопки фильтра
    this.filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleFilterClick(e.target);
      });
    });

    // Добавляем обработчики для открытия изображений
    this.initImagePreview();

    // Инициализируем показ всех работ
    this.showAllItems();

    // Создаем модальное окно для просмотра изображений
    this.createImageModal();
  }

  handleFilterClick(button) {
    const filterValue = button.parentElement.getAttribute("data-filter");

    // Обновляем активную кнопку
    this.updateActiveButton(button);

    // Фильтруем работы
    this.filterItems(filterValue);
  }

  updateActiveButton(activeButton) {
    // Убираем активный класс со всех кнопок
    this.filterButtons.forEach((btn) => {
      btn.classList.remove("portfolio-filter__button--active");
    });

    // Добавляем активный класс на нажатую кнопку
    activeButton.classList.add("portfolio-filter__button--active");
  }

  filterItems(filterValue) {
    let visibleItems = 0;

    this.portfolioItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");

      if (filterValue === "all" || itemCategory === filterValue) {
        item.style.display = "block";
        visibleItems++;

        // Добавляем анимацию появления
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, 50);
      } else {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        setTimeout(() => {
          item.style.display = "none";
        }, 300);
      }
    });

    // Показываем/скрываем сообщение "не найдено"
    if (visibleItems === 0) {
      this.showEmptyMessage();
    } else {
      this.hideEmptyMessage();
    }
  }

  showAllItems() {
    this.portfolioItems.forEach((item) => {
      item.style.display = "block";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    });

    this.hideEmptyMessage();
  }

  showEmptyMessage() {
    if (this.emptyMessage) {
      this.emptyMessage.style.display = "block";

      // Добавляем обработчик на кнопку "показать все"
      const showAllButton = this.emptyMessage.querySelector(
        ".portfolio-empty__button"
      );
      if (showAllButton) {
        showAllButton.addEventListener("click", () => {
          this.showAllItems();
          this.updateActiveButton(this.filterButtons[0]); // Активируем кнопку "Все"
        });
      }
    }
  }

  hideEmptyMessage() {
    if (this.emptyMessage) {
      this.emptyMessage.style.display = "none";
    }
  }

  initImagePreview() {
    this.portfolioItems.forEach((item) => {
      const imageElements = item.querySelectorAll(".portfolio-item__image img");
      if (imageElements.length > 0) {
        // Добавляем курсор указателя на все изображения
        imageElements.forEach((img) => {
          img.style.cursor = "pointer";

          // Добавляем обработчик клика
          img.addEventListener("click", () => {
            const allImages = Array.from(imageElements);
            const currentIndex = allImages.indexOf(img);
            this.openImageModal(allImages, currentIndex);
          });
        });
      }
    });
  }

  createImageModal() {
    // Создаем HTML структуру модального окна с галереей
    const modalHTML = `
      <div class="portfolio-modal" style="display: none;">
        <div class="portfolio-modal__overlay"></div>
        <div class="portfolio-modal__container">
          <div class="portfolio-modal__content">
            <button class="portfolio-modal__close" aria-label="Закрыть окно">×</button>

            <div class="portfolio-modal__work-nav">
              <button class="portfolio-modal__work portfolio-modal__work--prev" aria-label="Предыдущая работа">← Предыдущая</button>
              <div class="portfolio-modal__work-counter"></div>
              <button class="portfolio-modal__work portfolio-modal__work--next" aria-label="Следующая работа">Следующая →</button>
            </div>
            
            <div class="portfolio-modal__gallery">
              <button class="portfolio-modal__arrow portfolio-modal__arrow--prev" aria-label="Предыдущее изображение">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <div class="portfolio-modal__image-container">
                <img class="portfolio-modal__image" src="" alt="">
              </div>
              
              <button class="portfolio-modal__arrow portfolio-modal__arrow--next" aria-label="Следующее изображение">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              
              <div class="portfolio-modal__counter">
                <span class="portfolio-modal__current">1</span>
                /
                <span class="portfolio-modal__total">1</span>
              </div>
            </div>
            
            <div class="portfolio-modal__info">
              <h3 class="portfolio-modal__title"></h3>
              <p class="portfolio-modal__description"></p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Добавляем модальное окно в body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Получаем ссылки на элементы модального окна
    this.imageModal = document.querySelector(".portfolio-modal");
    this.modalImage = this.imageModal.querySelector(".portfolio-modal__image");
    this.modalTitle = this.imageModal.querySelector(".portfolio-modal__title");
    this.modalDescription = this.imageModal.querySelector(
      ".portfolio-modal__description"
    );
    this.modalClose = this.imageModal.querySelector(".portfolio-modal__close");
    this.modalOverlay = this.imageModal.querySelector(
      ".portfolio-modal__overlay"
    );
    this.prevButton = this.imageModal.querySelector(
      ".portfolio-modal__arrow--prev"
    );
    this.nextButton = this.imageModal.querySelector(
      ".portfolio-modal__arrow--next"
    );
    this.currentCounter = this.imageModal.querySelector(
      ".portfolio-modal__current"
    );
    this.totalCounter = this.imageModal.querySelector(
      ".portfolio-modal__total"
    );

    // Навигация по работам (пред/след работа)
    this.workPrevButton = this.imageModal.querySelector(
      ".portfolio-modal__work--prev"
    );
    this.workNextButton = this.imageModal.querySelector(
      ".portfolio-modal__work--next"
    );
    this.workCounter = this.imageModal.querySelector(
      ".portfolio-modal__work-counter"
    );

    // Добавляем обработчики событий
    this.modalClose.addEventListener("click", () => this.closeImageModal());
    this.modalOverlay.addEventListener("click", () => this.closeImageModal());
    this.prevButton.addEventListener("click", () => this.prevImage());
    this.nextButton.addEventListener("click", () => this.nextImage());

    if (this.workPrevButton) {
      this.workPrevButton.addEventListener("click", () => this.prevWork());
    }
    if (this.workNextButton) {
      this.workNextButton.addEventListener("click", () => this.nextWork());
    }

    // Закрытие по клавише ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.imageModal.style.display === "flex") {
        this.closeImageModal();
      } else if (
        e.key === "ArrowLeft" &&
        this.imageModal.style.display === "flex"
      ) {
        this.prevImage();
      } else if (
        e.key === "ArrowRight" &&
        this.imageModal.style.display === "flex"
      ) {
        this.nextImage();
      }
    });

    // Добавляем стили для модального окна с галереей
    this.addModalStyles();
  }

  addModalStyles() {
    const styles = `
      <style>
        .portfolio-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.9);
          animation: portfolioModalFadeIn 0.1s ease;
        }

        @keyframes portfolioModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .portfolio-modal__overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .portfolio-modal__container {
          position: relative;
          z-index: 10001;
          width: min(92vw, 980px);
          height: min(86vh, 720px);
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: flex;
        }

        .portfolio-modal__content{
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }

        .portfolio-modal__close {
          position: absolute;
          top: -10px;
          right: 0;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.1s ease;
          font-weight: bold;
        }

        .portfolio-modal__work-nav{
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 34px 0 10px 0;
        }

        .portfolio-modal__work{
          border: 1px solid rgba(0,0,0,.12);
          background: #fff;
          color: #000;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 10px;
          font: inherit;
        }

        .portfolio-modal__work-counter{
          font-size: 14px;
          opacity: .75;
          white-space: nowrap;
        }

        .portfolio-modal__gallery{
          position: relative;
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f6f6f6;
          border-radius: 12px;
          overflow: hidden;
        }

        .portfolio-modal__image-container{
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portfolio-modal__image{
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .portfolio-modal__arrow{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,.45);
          border: none;
          color: #fff;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .portfolio-modal__arrow--prev{ left: 10px; }
        .portfolio-modal__arrow--next{ right: 10px; }

        .portfolio-modal__counter{
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,.55);
          color: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 14px;
          line-height: 1;
        }

        .portfolio-modal__info{
          padding-top: 6px;
        }

        .portfolio-modal__title{
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #000;
        }

        .portfolio-modal__description{
          margin: 6px 0 0 0;
          color: rgba(0,0,0,.75);
          font-size: 14px;
        }

        /* На маленьких экранах оставляем максимум места под фото */
        @media (max-width: 640px) {
          .portfolio-modal__container{
            width: 94vw;
            height: 86vh;
            padding: 14px;
          }
          .portfolio-modal__work-nav{
            margin-top: 30px;
          }
          .portfolio-modal__description{
            display: none;
          }
        }
      </style>`;

    document.head.insertAdjacentHTML("beforeend", styles);
  }

  openImageModal(images, startIndex = 0) {
    if (!this.imageModal || images.length === 0) return;

    // Сохраняем все изображения и текущий индекс
    this.currentImages = images;
    this.currentIndex = startIndex;

    // Находим родительский элемент portfolio-item
    const portfolioItem = this.findPortfolioItemByImage(images[0]);

    if (portfolioItem) {
      // Получаем заголовок и описание
      const title =
        portfolioItem.querySelector(".portfolio-item__title")?.textContent ||
        "";
      const description =
        portfolioItem.querySelector(".portfolio-item__description")
          ?.textContent || "";

      // Навигация по работам (учитываем фильтр)
      this.visibleWorks = this.getVisibleWorks();
      this.currentWorkIndex = this.visibleWorks.indexOf(portfolioItem);
      if (this.currentWorkIndex < 0) this.currentWorkIndex = 0;
      if (this.workCounter) {
        this.workCounter.textContent = `Работа ${this.currentWorkIndex + 1} / ${
          this.visibleWorks.length
        }`;
      }

      // Обновляем счетчик
      this.updateCounter();

      // Загружаем первое изображение
      this.loadImage(startIndex);

      // Заполняем информацию
      this.modalTitle.textContent = title;
      this.modalDescription.textContent = description;

      // Показываем/скрываем кнопки навигации
      this.updateNavigationButtons();

      // Показываем модальное окно
      this.imageModal.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Убираем класс closing если он был
      this.imageModal.classList.remove("closing");
    }
  }

  loadImage(index) {
    if (index < 0 || index >= this.currentImages.length) return;

    const imageElement = this.currentImages[index];
    this.modalImage.src = imageElement.src;
    this.modalImage.alt = imageElement.alt;
    this.modalImage.classList.remove("loaded");

    // Ждем загрузки изображения
    if (imageElement.complete) {
      this.modalImage.classList.add("loaded");
    } else {
      this.modalImage.onload = () => {
        this.modalImage.classList.add("loaded");
      };
    }

    // Обновляем счетчик
    this.currentIndex = index;
    this.updateCounter();
    this.updateNavigationButtons();
  }

  updateCounter() {
    this.currentCounter.textContent = this.currentIndex + 1;
    this.totalCounter.textContent = this.currentImages.length;
  }

  updateNavigationButtons() {
    // Показываем/скрываем кнопки в зависимости от количества изображений
    if (this.currentImages.length > 1) {
      this.prevButton.style.display = "flex";
      this.nextButton.style.display = "flex";

      // Отключаем кнопки если достигли границ
      this.prevButton.disabled = this.currentIndex === 0;
      this.nextButton.disabled =
        this.currentIndex === this.currentImages.length - 1;
    } else {
      this.prevButton.style.display = "none";
      this.nextButton.style.display = "none";
    }
  }

  prevImage() {
    if (this.currentIndex > 0) {
      this.loadImage(this.currentIndex - 1);
    }
  }

  nextImage() {
    if (this.currentIndex < this.currentImages.length - 1) {
      this.loadImage(this.currentIndex + 1);
    }
  }

  getVisibleWorks() {
    // Видимые работы (учитываем фильтр: скрытые имеют display: none)
    return Array.from(document.querySelectorAll(".portfolio-item")).filter(
      (el) => el.style.display !== "none"
    );
  }

  getWorkImages(workEl) {
    const imgs = workEl.querySelectorAll(".portfolio-item__image img");
    return Array.from(imgs);
  }

  openWorkByIndex(newIndex) {
    this.visibleWorks = this.getVisibleWorks();
    if (!this.visibleWorks.length) return;

    if (newIndex < 0) newIndex = this.visibleWorks.length - 1;
    if (newIndex >= this.visibleWorks.length) newIndex = 0;

    const workEl = this.visibleWorks[newIndex];
    const imgs = this.getWorkImages(workEl);
    if (!imgs.length) return;

    this.currentWorkIndex = newIndex;

    if (this.workCounter) {
      this.workCounter.textContent = `Работа ${this.currentWorkIndex + 1} / ${
        this.visibleWorks.length
      }`;
    }

    // Открываем выбранную работу с первого изображения
    this.openImageModal(imgs, 0);
  }

  prevWork() {
    this.openWorkByIndex((this.currentWorkIndex ?? 0) - 1);
  }

  nextWork() {
    this.openWorkByIndex((this.currentWorkIndex ?? 0) + 1);
  }

  findPortfolioItemByImage(imageElement) {
    return imageElement.closest(".portfolio-item");
  }

  closeImageModal() {
    if (!this.imageModal) return;

    // Добавляем класс для анимации закрытия
    this.imageModal.classList.add("closing");

    // Ждем завершения анимации и скрываем модальное окно
    setTimeout(() => {
      this.imageModal.style.display = "none";
      this.imageModal.classList.remove("closing");
      document.body.style.overflow = "";

      // Сбрасываем содержимое
      this.modalImage.src = "";
      this.modalImage.alt = "";
      this.modalImage.classList.remove("loaded");
      this.modalTitle.textContent = "";
      this.modalDescription.textContent = "";

      // Сбрасываем состояние галереи
      this.currentImages = [];
      this.currentIndex = 0;
    }, 400);
  }
}

/**
 * ✅ ВАЖНОЕ ИЗМЕНЕНИЕ: загрузка ВСЕХ работ через пагинацию Strapi
 * Никакой другой логики не трогаем.
 */
async function fetchAllWorks(urlBase) {
  const all = [];
  let page = 1;

  while (true) {
    const url = `${urlBase}&pagination[page]=${page}&pagination[pageSize]=100`;
    const res = await fetch(url);
    const json = await res.json();

    const data = json?.data || [];
    all.push(...data);

    const pagination = json?.meta?.pagination;
    if (!pagination) break;

    if (pagination.page >= pagination.pageCount) break;
    page++;
  }

  return all;
}

// Обновленная функция загрузки работ с поддержкой галереи
async function loadWorks(filterSlug = "all") {
  const urlBase =
    filterSlug === "all"
      ? "https://admin.shield-and-automation.ru/api/works?populate=*&sort=createdAt:desc"
      : `https://admin.shield-and-automation.ru/api/works?filters[category][slug][$eq]=${filterSlug}&populate=*&sort=createdAt:desc`;

  // ✅ тут единственное отличие: тянем ВСЕ страницы
  const data = await fetchAllWorks(urlBase);

  const grid = document.getElementById("portfolio-grid");
  grid.innerHTML = "";

  data.forEach((item) => {
    const title = item.attributes.title;
    const description = item.attributes.description;
    const photos = item.attributes.photos.data;
    const category =
      item.attributes.category.data?.attributes.slug || "default";

    // Создаем HTML для галереи изображений
    let galleryHTML = "";
    if (photos && photos.length > 0) {
      // Первое изображение показываем всегда
      const firstImgUrl =
        "https://admin.shield-and-automation.ru" + photos[0].attributes.url;
      const firstImgAlt = photos[0].attributes.alternativeText || title;
      galleryHTML += `<img src="${firstImgUrl}" alt="${firstImgAlt}" loading="lazy" class="portfolio-item__main-image">`;

      // Остальные изображения добавляем скрытыми (но они будут в DOM для галереи)
      if (photos.length > 1) {
        for (let i = 1; i < photos.length; i++) {
          const imgUrl =
            "https://admin.shield-and-automation.ru" + photos[i].attributes.url;
          const imgAlt =
            photos[i].attributes.alternativeText || `${title} - фото ${i + 1}`;
          galleryHTML += `<img src="${imgUrl}" alt="${imgAlt}" loading="lazy" style="display:none;" class="portfolio-item__extra-image">`;
        }
      }
    }

    grid.insertAdjacentHTML(
      "beforeend",
      `
      <div class="portfolio-item" data-category="${category}">
        <div class="portfolio-item__image">
          ${galleryHTML}
          ${
            photos && photos.length > 1
              ? `<div class="portfolio-item__gallery-indicator">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>${photos.length} фото</span>
            </div>`
              : ""
          }
        </div>
        <div class="portfolio-item__content">
          <h3 class="portfolio-item__title">${title}</h3>
          <p class="portfolio-item__description">${description}</p>
        </div>
      </div>
    `
    );
  });

  // Добавляем стили для индикатора галереи
  const galleryIndicatorStyles = `
    <style>
      .portfolio-item__gallery-indicator {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-family: 'Roboto', sans-serif;
        pointer-events: none;
      }
      
      .portfolio-item__image {
        position: relative;
      }
      
      .portfolio-item__main-image {
        width: 100%;
        height: auto;
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      
      .portfolio-item__main-image:hover {
        transform: scale(0.02);
      }
    </style>
  `;

  if (!document.querySelector("#gallery-indicator-styles")) {
    const styleEl = document.createElement("style");
    styleEl.id = "gallery-indicator-styles";
    styleEl.textContent = galleryIndicatorStyles;
    document.head.appendChild(styleEl);
  }

  // Инициализируем новый экземпляр PortfolioFilter после загрузки работ
  setTimeout(() => {
    new PortfolioFilter();
  }, 100);
}

// 1. Подгружаем категории из Strapi
async function loadCategories() {
  // ✅ добавили pagination[pageSize]=100 (тоже только пагинация)
  const res = await fetch(
    "https://admin.shield-and-automation.ru/api/categories?pagination[pageSize]=100"
  );
  const { data } = await res.json();
  const filter = document.getElementById("category-filter");

  // Кнопка «Все»
  filter.innerHTML = `
    <li class="portfolio-filter__item portfolio-filter__item--active" data-filter="all">
      <button class="portfolio-filter__button">Все</button>
    </li>
  `;

  // Остальные категории
  data.forEach((cat) => {
    const slug = cat.attributes.slug;
    const name = cat.attributes.name;
    filter.insertAdjacentHTML(
      "beforeend",
      `
      <li class="portfolio-filter__item" data-filter="${slug}">
        <button class="portfolio-filter__button">${name}</button>
      </li>
    `
    );
  });

  // Вешаем обработчики кликов
  attachFilterHandlers();
}

// 3. Обработчики кликов по фильтру
function attachFilterHandlers() {
  const buttons = document.querySelectorAll(".portfolio-filter__button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".portfolio-filter__item");
      const filter = item.getAttribute("data-filter");

      // Подсветка активной кнопки
      document
        .querySelectorAll(".portfolio-filter__item")
        .forEach((li) => li.classList.remove("portfolio-filter__item--active"));
      item.classList.add("portfolio-filter__item--active");

      // Загружаем отфильтрованные работы
      loadWorks(filter);
    });
  });
}

// 4. Запускаем при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadWorks("all");
});
