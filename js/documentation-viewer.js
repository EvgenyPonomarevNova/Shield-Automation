// documentation-viewer.js
/**
 * Скрипт для просмотра изображений документов
 * @file documentation-viewer.js
 */

class DocumentationViewer {
  constructor() {
    this.documentationItems = document.querySelectorAll('.documentation-item');
    this.imageModal = null;
    
    this.init();
  }
  
  init() {
    // Добавляем обработчики для открытия изображений
    this.initImagePreview();
    
    // Создаем модальное окно для просмотра изображений
    this.createImageModal();
  }
  
  initImagePreview() {
    this.documentationItems.forEach(item => {
      const imageElement = item.querySelector('.documentation-item__image img');
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
    // Создаем HTML структуру модального окна (используем похожую на портфолио, но упрощенную)
    const modalHTML = `
      <div class="documentation-modal" style="display: none;">
        <div class="documentation-modal__overlay"></div>
        <div class="documentation-modal__container">
          <div class="documentation-modal__content">
            <button class="documentation-modal__close" aria-label="Закрыть окно">×</button>
            <div class="documentation-modal__image-container">
              <img class="documentation-modal__image" src="" alt="">
            </div>
            <div class="documentation-modal__info">
              <h3 class="documentation-modal__title"></h3>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Добавляем модальное окно в body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Получаем ссылки на элементы модального окна
    this.imageModal = document.querySelector('.documentation-modal');
    this.modalImage = this.imageModal.querySelector('.documentation-modal__image');
    this.modalTitle = this.imageModal.querySelector('.documentation-modal__title');
    this.modalClose = this.imageModal.querySelector('.documentation-modal__close');
    this.modalOverlay = this.imageModal.querySelector('.documentation-modal__overlay');
    
    // Добавляем обработчики событий
    this.modalClose.addEventListener('click', () => this.closeImageModal());
    this.modalOverlay.addEventListener('click', () => this.closeImageModal());
    
    // Закрытие по клавише ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.imageModal.style.display === 'flex') {
        this.closeImageModal();
      }
    });
    
    // Добавляем стили для модального окна
    this.addModalStyles();
  }
  
  addModalStyles() {
    const styles = `
      <style>
        .documentation-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: documentationModalFadeIn 0.3s ease;
        }
        
        @keyframes documentationModalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .documentation-modal__overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(5px);
        }
        
        .documentation-modal__container {
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
          animation: documentationModalSlideIn 0.4s ease;
        }
        
        @keyframes documentationModalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .documentation-modal__content {
          position: relative;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .documentation-modal__close {
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
        
        .documentation-modal__close:hover {
          background: var(--color-accent);
          transform: rotate(90deg);
        }
        
        .documentation-modal__image-container {
          max-height: 80vh;
          overflow: hidden;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .documentation-modal__image {
          max-width: 100%;
          max-height: 80vh;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        
        .documentation-modal__info {
          padding: 30px;
          background: var(--color-secondary);
          text-align: center;
        }
        
        .documentation-modal__title {
          font-family: 'Roboto', sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0;
          line-height: 1.3;
        }
        
        /* Анимация закрытия */
        .documentation-modal.closing {
          animation: documentationModalFadeOut 0.3s ease forwards;
        }
        
        .documentation-modal.closing .documentation-modal__container {
          animation: documentationModalSlideOut 0.4s ease forwards;
        }
        
        @keyframes documentationModalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes documentationModalSlideOut {
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
          .documentation-modal__container {
            max-width: 95%;
            max-height: 95%;
          }
          
          .documentation-modal__image-container {
            max-height: 70vh;
          }
          
          .documentation-modal__image {
            max-height: 70vh;
          }
          
          .documentation-modal__info {
            padding: 20px;
          }
          
          .documentation-modal__title {
            font-size: 20px;
          }
        }
        
        @media (max-width: 767px) {
          .documentation-modal__container {
            max-width: 100%;
            max-height: 100%;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
          
          .documentation-modal__image-container {
            max-height: 60vh;
            height: 60vh;
            padding: 10px;
          }
          
          .documentation-modal__image {
            max-height: 60vh;
          }
          
          .documentation-modal__close {
            top: 15px;
            right: 15px;
            width: 35px;
            height: 35px;
            font-size: 20px;
            background: rgba(0, 0, 0, 0.8);
          }
          
          .documentation-modal__info {
            padding: 15px;
          }
          
          .documentation-modal__title {
            font-size: 18px;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  openImageModal(imageSrc, imageAlt) {
    if (!this.imageModal) return;
    
    // Находим родительский элемент documentation-item
    const documentationItem = this.findDocumentationItemByImageSrc(imageSrc);
    
    if (documentationItem) {
      // Получаем заголовок
      const title = documentationItem.querySelector('.documentation-item__title')?.textContent || imageAlt;
      
      // Заполняем модальное окно
      this.modalImage.src = imageSrc;
      this.modalImage.alt = imageAlt;
      this.modalTitle.textContent = title;
      
      // Показываем модальное окно
      this.imageModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Убираем класс closing если он был
      this.imageModal.classList.remove('closing');
    }
  }
  
  findDocumentationItemByImageSrc(imageSrc) {
    for (const item of this.documentationItems) {
      const img = item.querySelector('.documentation-item__image img');
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
    }, 400);
  }
}

// Инициализация после загрузки компонентов
document.addEventListener('componentsLoaded', () => {
  new DocumentationViewer();
});

// Инициализация на всякий случай через 3 секунды
setTimeout(() => {
  if (document.querySelector('.documentation-item')) {
    new DocumentationViewer();
  }
}, 3000);