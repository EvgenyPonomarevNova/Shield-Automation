/**
 * Генератор галереи для каталога с поддержкой Strapi
 * @file gallery-generator.js
 */

class SimpleGallerySlider {
  constructor() {
    this.observer = null;
    this.initialized = false;
    this.checkingImages = new Map(); // Отслеживаем проверяемые изображения
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.swipeThreshold = 50;
  }

  init() {
    if (this.initialized) return;

    this.initGalleries();
    this.setupObserver();
    this.initialized = true;

    document.addEventListener("componentsLoaded", () => {
      this.initGalleries();
    });
  }

  initGalleries() {
    const contentContainer = document.getElementById("category-content");
    if (!contentContainer || contentContainer.innerHTML.trim() === "") {
      return;
    }

    const galleries = document.querySelectorAll(".gallery-slider");

    galleries.forEach((gallery) => {
      if (!gallery.classList.contains("gallery-initialized")) {
        this.initGallery(gallery);
      }
    });
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              if (node.classList && node.classList.contains("gallery-slider")) {
                this.initGallery(node);
              }

              const galleries = node.querySelectorAll
                ? node.querySelectorAll(".gallery-slider")
                : [];
              galleries.forEach((gallery) => this.initGallery(gallery));
            }
          }
        }
      }
    });

    const contentContainer = document.getElementById("category-content");
    if (contentContainer) {
      this.observer.observe(contentContainer, {
        childList: true,
        subtree: true,
      });
    }
  }

  async initGallery(galleryElement) {
    if (galleryElement.classList.contains("gallery-initialized")) {
      return;
    }

    console.log("Gallery: Проверка галереи");

    const strapiGalleryData = galleryElement.getAttribute(
      "data-strapi-gallery"
    );

    // Если данных еще нет, ждем их
    if (!strapiGalleryData || strapiGalleryData === "null") {
      console.log("Gallery: Данных еще нет, ждем...");

      // Ждем пока данные появятся (максимум 5 секунд)
      await this.waitForGalleryData(galleryElement);

      // Проверяем снова
      const updatedData = galleryElement.getAttribute("data-strapi-gallery");
      if (!updatedData || updatedData === "null") {
        console.log("Gallery: Данные так и не появились");
        this.showNoImagesMessage(galleryElement);
        return;
      }
    }

    // Теперь парсим данные
    let images = [];
    try {
      const parsedData = JSON.parse(
        galleryElement.getAttribute("data-strapi-gallery")
      );
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        images = parsedData;
        console.log(`Gallery: Используем ${images.length} изображений`);
      }
    } catch (e) {
      console.error("Gallery: Ошибка парсинга данных:", e);
    }

    if (images.length > 0) {
      this.createGalleryHTML(galleryElement, images);
      this.initGalleryControls(galleryElement, images);
      galleryElement.classList.add("gallery-initialized");
      
      // На мобильных добавляем свайп
      if (window.innerWidth <= 991) {
        this.setupMobileSwipe(galleryElement);
      }
    } else {
      this.showNoImagesMessage(galleryElement);
    }
  }

  // Добавьте этот метод
  async waitForGalleryData(galleryElement, maxWait = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkData = () => {
        const currentData = galleryElement.getAttribute("data-strapi-gallery");

        if (currentData && currentData !== "null") {
          console.log("Gallery: Данные появились!");
          resolve(true);
          return;
        }

        if (Date.now() - startTime > maxWait) {
          console.log("Gallery: Таймаут ожидания данных");
          resolve(false);
          return;
        }

        setTimeout(checkData, 100);
      };

      checkData();
    });
  }

  createGalleryHTML(galleryElement, images) {
    galleryElement.innerHTML = "";

    const slidesContainer = document.createElement("div");
    slidesContainer.className = "gallery-slides";

    images.forEach((image, index) => {
      const slide = this.createSlide(image, index, images.length);
      slidesContainer.appendChild(slide);
    });

    // На мобильных размещаем элементы управления поверх изображения
    if (window.innerWidth <= 991 && images.length > 1) {
      this.addMobileNavigation(slidesContainer);
      this.addMobileCounter(slidesContainer, images.length);
    }

    galleryElement.appendChild(slidesContainer);

    // В десктопной версии добавляем навигацию и превью (как было)
    if (window.innerWidth > 991 && images.length > 1) {
      this.addNavigation(galleryElement);
      this.addThumbnails(galleryElement, images);
    }

    this.ensureStyles();
  }

  createSlide(image, index, total) {
    const slide = document.createElement("div");
    slide.className = "gallery-slide";
    slide.style.display = index === 0 ? "block" : "none";
    slide.dataset.index = index;

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.alt || `Изображение ${index + 1}`;
    img.className = "gallery-image";
    img.loading = "lazy";

    // Обработка ошибок загрузки изображений
    img.onerror = () => {
      img.src = "../../images/catalog/default.jpg";
      img.alt = "Изображение недоступно";
    };

    // Только в десктопной версии показываем счетчик
    if (window.innerWidth > 991) {
      const counter = document.createElement("div");
      counter.className = "gallery-counter";
      counter.textContent = `${index + 1} / ${total}`;
      slide.appendChild(counter);
    }

    slide.appendChild(img);

    return slide;
  }

  addNavigation(galleryElement) {
    // Десктопная навигация (как было)
    if (window.innerWidth <= 991) return;

    const navContainer = document.createElement("div");
    navContainer.className = "gallery-nav";

    const prevButton = document.createElement("button");
    prevButton.className = "gallery-prev";
    prevButton.innerHTML = "‹";
    prevButton.setAttribute("aria-label", "Предыдущее изображение");

    const nextButton = document.createElement("button");
    nextButton.className = "gallery-next";
    nextButton.innerHTML = "›";
    nextButton.setAttribute("aria-label", "Следующее изображение");

    navContainer.appendChild(prevButton);
    navContainer.appendChild(nextButton);
    galleryElement.appendChild(navContainer);
  }

  addMobileNavigation(slidesContainer) {
    const navContainer = document.createElement("div");
    navContainer.className = "gallery-nav gallery-nav--mobile";

    const prevButton = document.createElement("button");
    prevButton.className = "gallery-prev";
    prevButton.innerHTML = "‹";
    prevButton.setAttribute("aria-label", "Предыдущее изображение");

    const nextButton = document.createElement("button");
    nextButton.className = "gallery-next";
    nextButton.innerHTML = "›";
    nextButton.setAttribute("aria-label", "Следующее изображение");

    navContainer.appendChild(prevButton);
    navContainer.appendChild(nextButton);
    slidesContainer.appendChild(navContainer);
  }

  addMobileCounter(slidesContainer, total) {
    const counter = document.createElement("div");
    counter.className = "gallery-counter gallery-counter--mobile";
    counter.textContent = `1 / ${total}`;
    counter.dataset.total = String(total);
    counter.dataset.current = "1";
    slidesContainer.appendChild(counter);
  }

  addThumbnails(galleryElement, images) {
    // Только для десктопов
    if (window.innerWidth <= 991) return;
    
    const thumbsContainer = document.createElement("div");
    thumbsContainer.className = "gallery-thumbs";

    images.forEach((image, index) => {
      const thumb = document.createElement("div");
      thumb.className = "gallery-thumb";
      thumb.dataset.index = index;

      if (index === 0) {
        thumb.classList.add("active");
      }

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = `Миниатюра ${index + 1}`;
      img.className = "gallery-thumb-img";
      img.loading = "lazy";

      // Обработка ошибок загрузки миниатюр
      img.onerror = () => {
        img.src = "../../images/catalog/default.jpg";
        img.alt = "Миниатюра недоступна";
      };

      thumb.appendChild(img);
      thumbsContainer.appendChild(thumb);
    });

    galleryElement.appendChild(thumbsContainer);
  }

  setupMobileSwipe(galleryElement) {
    if (window.innerWidth > 991) return;
    
    const slidesContainer = galleryElement.querySelector('.gallery-slides');
    if (!slidesContainer) return;
    
    slidesContainer.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slidesContainer.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(galleryElement);
    }, { passive: true });
  }
  
  handleSwipe(galleryElement) {
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) < this.swipeThreshold) return;
    
    const slides = galleryElement.querySelectorAll('.gallery-slide');
    let currentIndex = 0;
    
    slides.forEach((slide, index) => {
      if (slide.style.display === 'block') {
        currentIndex = index;
      }
    });
    
    if (diff > 0) {
      // Свайп влево - следующий слайд
      this.showSlide(currentIndex + 1, slides, null);
    } else {
      // Свайп вправо - предыдущий слайд
      this.showSlide(currentIndex - 1, slides, null);
    }
  }

  initGalleryControls(galleryElement, images) {
    if (images.length <= 1) return;

    const slides = galleryElement.querySelectorAll(".gallery-slide");
    const prevBtn = galleryElement.querySelector(".gallery-prev");
    const nextBtn = galleryElement.querySelector(".gallery-next");
    const thumbs = galleryElement.querySelectorAll(".gallery-thumb"); // будет только на десктопе
    const mobileCounter = galleryElement.querySelector(".gallery-counter--mobile");

    let currentIndex = 0;
    const totalSlides = slides.length;

    const updateMobileCounter = (index) => {
      if (!mobileCounter) return;
      const current = index + 1;
      mobileCounter.dataset.current = String(current);
      mobileCounter.textContent = `${current} / ${totalSlides}`;
    };

    const showSlide = (index) => {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;

      slides.forEach((slide) => {
        slide.style.display = "none";
      });

      slides[index].style.display = "block";
      currentIndex = index;

      // Десктопные превью (если есть)
      if (thumbs && thumbs.length) {
        thumbs.forEach((thumb) => thumb.classList.remove("active"));
        if (thumbs[index]) {
          thumbs[index].classList.add("active");

          const container = thumbs[index].parentElement;
          if (container && container.scrollWidth > container.clientWidth) {
            thumbs[index].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          }
        }
      }

      updateMobileCounter(index);
    };

    // Кнопки навигации (и на мобильных, и на десктопе)
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(currentIndex + 1);
      });
    }

    // Клики по превью (только если превью существуют)
    if (thumbs && thumbs.length) {
      thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", (e) => {
          e.preventDefault();
          showSlide(index);
        });
      });
    }

    // Клавиатура
    galleryElement.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        showSlide(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        showSlide(currentIndex + 1);
      }
    });

    // Инициализация счетчика
    updateMobileCounter(0);
  }

  showSlide(index, slides, thumbs) {
    const totalSlides = slides.length;
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    slides.forEach((slide) => {
      slide.style.display = "none";
    });

    slides[index].style.display = "block";

    if (thumbs) {
      thumbs.forEach((thumb) => {
        thumb.classList.remove("active");
      });

      if (thumbs[index]) {
        thumbs[index].classList.add("active");
      }
    }
  }

  showNoImagesMessage(galleryElement) {
    galleryElement.innerHTML = `
            <div class="gallery-empty">
                <div class="gallery-empty__icon">🖼️</div>
                <p class="gallery-empty__text">Изображения для этой категории скоро будут добавлены</p>
            </div>
        `;
    galleryElement.classList.add("gallery-initialized");
  }

  ensureStyles() {
    if (document.getElementById("gallery-slider-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "gallery-slider-styles";
    style.textContent = `
.gallery-slides {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.gallery-slide {
    display: none;
    width: 100%;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.gallery-slide[style*="display: block"] {
    display: block;
    opacity: 1;
    transform: translateY(0);
    animation: slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(15px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.gallery-image {
    width: 100%;
    height: auto;
    max-height: 550px;
    object-fit: contain;
    border-radius: 8px;
    background: linear-gradient(45deg, #f8f9fa, #e9ecef);
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
}

.gallery-counter {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 0, 0, 0.85);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
}

.gallery-nav {
    display: flex;
    gap: 15px;
    margin-top: 20px;
    align-items: center;
}

.gallery-prev,
.gallery-next {
    background: #ff0000;
    color: white;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.25);
    position: relative;
    overflow: hidden;
}

.gallery-prev::after,
.gallery-next::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.3s ease;
}

.gallery-prev:hover,
.gallery-next:hover {
    background: #cc0000;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 0, 0, 0.35);
}

.gallery-prev:hover::after,
.gallery-next:hover::after {
    transform: scale(1);
}

.gallery-prev:active,
.gallery-next:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
}

.gallery-thumbs {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    padding: 15px;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #ff0000 #f1f1f1;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.08);
}

.gallery-thumbs::-webkit-scrollbar {
    height: 6px;
}

.gallery-thumbs::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.gallery-thumbs::-webkit-scrollbar-thumb {
    background: #ff0000;
    border-radius: 3px;
}

.gallery-thumbs::-webkit-scrollbar-thumb:hover {
    background: #cc0000;
}

.gallery-thumb {
    flex: 0 0 90px;
    height: 70px;
    border: 3px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    position: relative;
}

.gallery-thumb::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 0, 0, 0);
    transition: background 0.3s ease;
    z-index: 1;
}

.gallery-thumb.active {
    border-color: #ff0000;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.25);
}

.gallery-thumb.active::before {
    background: rgba(255, 0, 0, 0.1);
}

.gallery-thumb:hover {
    border-color: #cc0000;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.gallery-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.gallery-thumb:hover .gallery-thumb-img {
    transform: scale(1.05);
}

.gallery-empty {
    text-align: center;
    padding: 60px 30px;
    color: #666;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.gallery-empty__icon {
    font-size: 64px;
    margin-bottom: 25px;
    opacity: 0.7;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.gallery-empty__text {
    font-size: 18px;
    margin-bottom: 12px;
    color: #444;
    font-weight: 500;
    line-height: 1.5;
}

.gallery-empty__hint {
    font-size: 14px;
    color: #888;
    margin-top: 10px;
}

/* Мобильная версия */
@media (max-width: 991px) {
    /* На мобильных оставляем стрелки и счетчик, прячем только превью */
    .gallery-thumbs {
        display: none !important;
    }

    .gallery-image {
        max-height: 350px;
        cursor: grab;
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
    }

    .gallery-slides {
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
    }

    .gallery-nav--mobile {
        position: absolute;
        left: 10px;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        margin: 0;
        z-index: 5;
    }

    .gallery-nav--mobile .gallery-prev,
    .gallery-nav--mobile .gallery-next {
        pointer-events: auto;
        width: 44px;
        height: 44px;
        font-size: 22px;
        opacity: 0.95;
    }

    .gallery-counter--mobile {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
        z-index: 6;
    }
}
        `;

    document.head.appendChild(style);
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  window.gallerySlider = new SimpleGallerySlider();

  document.addEventListener("componentsLoaded", () => {
    if (window.gallerySlider) {
      window.gallerySlider.init();
    }
  });

  setTimeout(() => {
    if (window.gallerySlider && !window.gallerySlider.initialized) {
      window.gallerySlider.init();
    }
  }, 3000);
});