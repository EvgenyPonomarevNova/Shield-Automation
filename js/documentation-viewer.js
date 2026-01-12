// documentation-viewer.js
class DocumentationViewer {
  constructor() {
    this.documentationItems = document.querySelectorAll('.documentation-item');
    this.documents = [];
    this.currentCategory = 'all';
    
    this.init();
  }
  
  async init() {
    // Получаем документы из Strapi
    await this.loadDocumentsFromStrapi();
    
    // Инициализируем превью изображений с модалкой
    this.initImagePreview();
    
    // Инициализируем фильтры
    this.initFilters();
  }
  
  async loadDocumentsFromStrapi() {
    try {
      // Ждем инициализации StrapiAPI
      await this.waitForStrapiAPI();
      
      this.documents = await window.strapiAPI.getAllDocumentations();
      console.log('Загружено документов:', this.documents.length);
      
      // Если документы загружены из Strapi, обновляем DOM
      if (this.documents.length > 0) {
        this.updateDocumentationGallery();
      } else {
        // Если документов нет, используем статические
        this.useStaticDocuments();
      }
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
      this.useStaticDocuments();
    }
  }
  
  async waitForStrapiAPI(maxAttempts = 50) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkAPI = () => {
        attempts++;
        
        if (window.strapiAPI) {
          resolve();
          return;
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error('StrapiAPI не инициализирован'));
          return;
        }
        
        setTimeout(checkAPI, 100);
      };
      
      checkAPI();
    });
  }
  
  useStaticDocuments() {
    console.log('Используем статические документы');
    
    // Если нет статических документов, создаем несколько примеров
    if (this.documentationItems.length === 0) {
      this.createExampleDocuments();
    } else {
      // Используем существующие элементы
      this.documentationItems = document.querySelectorAll('.documentation-item');
    }
  }
  
  createExampleDocuments() {
    const galleryGrid = document.querySelector('.documentation-gallery__grid');
    if (!galleryGrid) return;
    
    // Создаем несколько примеров документов
    const exampleDocs = [
      {
        title: "Сертификат соответствия ГОСТ",
        image: "./images/certificates/cert1.jpg",
        category: "certificates"
      },
      {
        title: "Лицензия на деятельность",
        image: "./images/certificates/cert2.jpg",
        category: "certificates"
      },
      {
        title: "Разрешение Ростехнадзора",
        image: "./images/certificates/cert3.jpg",
        category: "licenses"
      },
      {
        title: "Декларация соответствия",
        image: "./images/certificates/cert4.jpg",
        category: "certificates"
      },
      {
        title: "Сертификат системы менеджмента",
        image: "./images/certificates/cert5.jpg",
        category: "certificates"
      },
      {
        title: "Лицензия МЧС",
        image: "./images/certificates/cert6.jpg",
        category: "licenses"
      }
    ];
    
    galleryGrid.innerHTML = '';
    
    exampleDocs.forEach((doc, index) => {
      const docElement = this.createDocumentElement(doc.image, doc.title, doc.category, index);
      galleryGrid.appendChild(docElement);
    });
    
    this.documentationItems = document.querySelectorAll('.documentation-item');
  }
  
  updateDocumentationGallery() {
    const galleryGrid = document.querySelector('.documentation-gallery__grid');
    if (!galleryGrid) return;
    
    // Сохраняем статическое содержимое как fallback
    const staticContent = galleryGrid.innerHTML;
    
    // Очищаем текущие элементы
    galleryGrid.innerHTML = '';
    
    // Создаем элементы для каждого документа
    this.documents.forEach((doc, index) => {
      const imageUrl = window.strapiAPI ? 
        window.strapiAPI.getImageUrl(doc.attributes.image?.data?.attributes) :
        doc.attributes.image?.data?.attributes?.url || '';
      
      const title = doc.attributes.title;
      const category = doc.attributes.category || 'certificates';
      
      const documentElement = this.createDocumentElement(imageUrl, title, category, index);
      galleryGrid.appendChild(documentElement);
    });
    
    // Если нет документов, показываем статический контент
    if (this.documents.length === 0 && staticContent) {
      galleryGrid.innerHTML = staticContent;
    }
    
    // Обновляем список элементов
    this.documentationItems = document.querySelectorAll('.documentation-item');
  }
  
  createDocumentElement(imageUrl, title, category, index) {
    const div = document.createElement('div');
    div.className = 'documentation-item';
    div.dataset.category = category;
    div.dataset.index = index;
    
    div.innerHTML = `
      <div class="documentation-item__image">
        <img src="${imageUrl}" alt="${title}" loading="lazy">
      </div>
      <div class="documentation-item__content">
        <h3 class="documentation-item__title">${title}</h3>
      </div>
    `;
    
    return div;
  }
  
initImagePreview() {
    // Используем делегирование событий для всей галереи
    const galleryGrid = document.querySelector('.documentation-gallery__grid');
    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const docItem = e.target.closest('.documentation-item');
            
            if (docItem) {
                e.preventDefault();
                
                let imageUrl, title;
                const img = docItem.querySelector('img');
                
                if (img) {
                    imageUrl = img.src;
                    title = img.alt || docItem.querySelector('.documentation-item__title')?.textContent || '';
                    
                    if (imageUrl) {
                        this.openLightbox(imageUrl, title);
                    }
                }
            }
        });
    }
}

  
  initFilters() {
    const filterButtons = document.querySelectorAll('.documentation-filter__button');
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        this.filterDocuments(category);
        
        // Обновляем активный класс
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  }
  
  filterDocuments(category) {
    this.currentCategory = category;
    
    this.documentationItems.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 10);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  }
  
openLightbox(imageSrc, imageAlt) {
    // Проверяем, нет ли уже открытого лайтбокса
    const existingLightbox = document.querySelector('.lightbox');
    if (existingLightbox) {
        document.body.removeChild(existingLightbox);
    }
    
    // Создаем модальное окно (лайтбокс)
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox__overlay"></div>
      <div class="lightbox__content">
        <button class="lightbox__close" aria-label="Закрыть">&times;</button>
        <img src="${imageSrc}" alt="${imageAlt}" class="lightbox__img">
        <div class="lightbox__title">${imageAlt}</div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Функция закрытия
    const closeLightbox = () => {
        if (lightbox && lightbox.parentNode) {
            document.body.removeChild(lightbox);
        }
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
    };
    
    // Обработчик ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    };
    
    // Назначаем обработчики
    document.addEventListener('keydown', handleEsc);
    
    lightbox.querySelector('.lightbox__close').onclick = closeLightbox;
    lightbox.querySelector('.lightbox__overlay').onclick = closeLightbox;
    
    // Закрытие при клике на сам лайтбокс (кроме контента)
    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    };
    
    // Предотвращаем закрытие при клике на контент
    lightbox.querySelector('.lightbox__content').onclick = (e) => {
        e.stopPropagation();
    };
}
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.documentation-item')) {
    const initViewer = () => {
      if (typeof window.strapiAPI !== 'undefined') {
        new DocumentationViewer();
      } else {
        setTimeout(initViewer, 100);
      }
    };
    
    initViewer();
  }
});

// Инициализация через компоненты
document.addEventListener('componentsLoaded', () => {
  if (document.querySelector('.documentation-item')) {
    setTimeout(() => {
      new DocumentationViewer();
    }, 500);
  }
});

// Резервная инициализация
setTimeout(() => {
  if (document.querySelector('.documentation-item')) {
    console.log('Резервная инициализация DocumentationViewer');
    new DocumentationViewer();
  }
}, 3000);