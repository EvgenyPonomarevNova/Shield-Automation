// portfolio-filter.js
/**
 * Скрипт для фильтрации работ в портфолио и просмотра изображений
 * @file portfolio-filter.js
 */

class PortfolioFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.portfolio-filter__button');
    this.portfolioItems = document.querySelectorAll('.portfolio-item');
    this.emptyMessage = document.querySelector('.portfolio-empty');
    this.imageModal = null;
    
    this.init();
  }
  
  init() {
    // Добавляем обработчики на кнопки фильтра
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
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
    const filterValue = button.parentElement.getAttribute('data-filter');
    
    // Обновляем активную кнопку
    this.updateActiveButton(button);
    
    // Фильтруем работы
    this.filterItems(filterValue);
  }
  
  updateActiveButton(activeButton) {
    // Убираем активный класс со всех кнопок
    this.filterButtons.forEach(btn => {
      btn.classList.remove('portfolio-filter__button--active');
    });
    
    // Добавляем активный класс на нажатую кнопку
    activeButton.classList.add('portfolio-filter__button--active');
  }
  
  filterItems(filterValue) {
    let visibleItems = 0;
    
    this.portfolioItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      
      if (filterValue === 'all' || itemCategory === filterValue) {
        item.style.display = 'block';
        visibleItems++;
        
        // Добавляем анимацию появления
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 50);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
          item.style.display = 'none';
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
    this.portfolioItems.forEach(item => {
      item.style.display = 'block';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });
    
    this.hideEmptyMessage();
  }
  
  showEmptyMessage() {
    if (this.emptyMessage) {
      this.emptyMessage.style.display = 'block';
      
      // Добавляем обработчик на кнопку "показать все"
      const showAllButton = this.emptyMessage.querySelector('.portfolio-empty__button');
      if (showAllButton) {
        showAllButton.addEventListener('click', () => {
          this.showAllItems();
          this.updateActiveButton(this.filterButtons[0]); // Активируем кнопку "Все"
        });
      }
    }
  }
  
  hideEmptyMessage() {
    if (this.emptyMessage) {
      this.emptyMessage.style.display = 'none';
    }
  }
  
  initImagePreview() {
    this.portfolioItems.forEach(item => {
      const imageElement = item.querySelector('.portfolio-item__image img');
      if (imageElement) {
        // Добавляем курсор указателя
        imageElement.style.cursor = 'pointer';
        
        // Добавляем обработчик клика
        imageElement.addEventListener('click', () => {
          this.openImageModal(imageElement.src, imageElement.alt);
        });
      }
    });
  }
  
  createImageModal() {
    // Создаем HTML структуру модального окна
    const modalHTML = `
      <div class="portfolio-modal" style="display: none;">
        <div class="portfolio-modal__overlay"></div>
        <div class="portfolio-modal__container">
          <div class="portfolio-modal__content">
            <button class="portfolio-modal__close" aria-label="Закрыть окно">×</button>
            <div class="portfolio-modal__image-container">
              <img class="portfolio-modal__image" src="" alt="">
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
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Получаем ссылки на элементы модального окна
    this.imageModal = document.querySelector('.portfolio-modal');
    this.modalImage = this.imageModal.querySelector('.portfolio-modal__image');
    this.modalTitle = this.imageModal.querySelector('.portfolio-modal__title');
    this.modalDescription = this.imageModal.querySelector('.portfolio-modal__description');
    this.modalClose = this.imageModal.querySelector('.portfolio-modal__close');
    this.modalOverlay = this.imageModal.querySelector('.portfolio-modal__overlay');
    
    // Добавляем обработчики событий
    this.modalClose.addEventListener('click', () => this.closeImageModal());
    this.modalOverlay.addEventListener('click', () => this.closeImageModal());
    
    // Закрытие по клавише ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.imageModal.style.display === 'block') {
        this.closeImageModal();
      }
    });
    
    // Добавляем стили для модального окна
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
          animation: portfolioModalFadeIn 0.3s ease;
        }
        
        @keyframes portfolioModalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .portfolio-modal__overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(5px);
        }
        
        .portfolio-modal__container {
          position: relative;
          z-index: 10001;
          max-width: 90%;
          max-height: 90%;
          width: auto;
          height: auto;
          background: var(--color-secondary);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
          animation: portfolioModalSlideIn 0.4s ease;
        }
        
        @keyframes portfolioModalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .portfolio-modal__content {
          position: relative;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .portfolio-modal__close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.7);
          color: var(--color-secondary);
          border: none;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 300;
          cursor: pointer;
          z-index: 10002;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-smooth);
        }
        
        .portfolio-modal__close:hover {
          background: var(--color-accent);
          transform: rotate(90deg);
        }
        
        .portfolio-modal__image-container {
          max-height: 70vh;
          overflow: hidden;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .portfolio-modal__image {
          max-width: 100%;
          max-height: 70vh;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        
        .portfolio-modal__info {
          padding: 30px;
          background: var(--color-secondary);
        }
        
        .portfolio-modal__title {
          font-family: 'Roboto', sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0 0 15px 0;
          line-height: 1.3;
        }
        
        .portfolio-modal__description {
          font-family: 'Roboto', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-text);
          margin: 0;
        }
        
        /* Анимация закрытия */
        .portfolio-modal.closing {
          animation: portfolioModalFadeOut 0.3s ease forwards;
        }
        
        .portfolio-modal.closing .portfolio-modal__container {
          animation: portfolioModalSlideOut 0.4s ease forwards;
        }
        
        @keyframes portfolioModalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes portfolioModalSlideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
        }
        
        /* Адаптивность */
        @media (max-width: 991px) {
          .portfolio-modal__container {
            max-width: 95%;
            max-height: 95%;
          }
          
          .portfolio-modal__image-container {
            max-height: 60vh;
          }
          
          .portfolio-modal__image {
            max-height: 60vh;
          }
          
          .portfolio-modal__info {
            padding: 20px;
          }
          
          .portfolio-modal__title {
            font-size: 20px;
          }
          
          .portfolio-modal__description {
            font-size: 15px;
          }
        }
        
        @media (max-width: 767px) {
          .portfolio-modal__container {
            max-width: 100%;
            max-height: 100%;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
          
          .portfolio-modal__image-container {
            max-height: 50vh;
            height: 50vh;
          }
          
          .portfolio-modal__image {
            max-height: 50vh;
          }
          
          .portfolio-modal__close {
            top: 15px;
            right: 15px;
            width: 35px;
            height: 35px;
            font-size: 20px;
            background: rgba(0, 0, 0, 0.8);
          }
          
          .portfolio-modal__info {
            padding: 15px;
          }
          
          .portfolio-modal__title {
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .portfolio-modal__description {
            font-size: 14px;
          }
        }
        
        @media (max-width: 575px) {
          .portfolio-modal__image-container {
            max-height: 40vh;
            height: 40vh;
          }
          
          .portfolio-modal__image {
            max-height: 40vh;
          }
          
          .portfolio-modal__close {
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            font-size: 18px;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  openImageModal(imageSrc, imageAlt) {
    if (!this.imageModal) return;
    
    // Находим родительский элемент portfolio-item
    const portfolioItem = this.findPortfolioItemByImageSrc(imageSrc);
    
    if (portfolioItem) {
      // Получаем заголовок и описание
      const title = portfolioItem.querySelector('.portfolio-item__title')?.textContent || '';
      const description = portfolioItem.querySelector('.portfolio-item__description')?.textContent || '';
      
      // Заполняем модальное окно
      this.modalImage.src = imageSrc;
      this.modalImage.alt = imageAlt;
      this.modalTitle.textContent = title;
      this.modalDescription.textContent = description;
      
      // Показываем модальное окно
      this.imageModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Убираем класс closing если он был
      this.imageModal.classList.remove('closing');
    }
  }
  
  findPortfolioItemByImageSrc(imageSrc) {
    for (const item of this.portfolioItems) {
      const img = item.querySelector('.portfolio-item__image img');
      if (img && img.src === imageSrc) {
        return item;
      }
    }
    return null;
  }
  
  closeImageModal() {
    if (!this.imageModal) return;
    
    // Добавляем класс для анимации закрытия
    this.imageModal.classList.add('closing');
    
    // Ждем завершения анимации и скрываем модальное окно
    setTimeout(() => {
      this.imageModal.style.display = 'none';
      this.imageModal.classList.remove('closing');
      document.body.style.overflow = '';
      
      // Сбрасываем содержимое
      this.modalImage.src = '';
      this.modalImage.alt = '';
      this.modalTitle.textContent = '';
      this.modalDescription.textContent = '';
    }, 400); // Время должно совпадать с длительностью анимации
  }
}

// Инициализация после загрузки компонентов
document.addEventListener('componentsLoaded', () => {
  new PortfolioFilter();
});

// Инициализация на всякий случай через 3 секунды
setTimeout(() => {
  if (!document.querySelector('.portfolio-filter__button--active')) {
    new PortfolioFilter();
  }
}, 3000);