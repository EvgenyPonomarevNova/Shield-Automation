/**
 * Простой и надежный слайдер для каталога
 * @file gallery-slider.js
 */

class SimpleGallerySlider {
    constructor() {
        this.categoryMapping = {
            'kotelnye': 'item1',
            'itp': 'item2', 
            'nasosy': 'item3',
            'kamery': 'item5',
            'asu-tp': 'item6',
            'kotly': 'item7',
            'ovoshchehranilishcha': 'item8',
            'ventilyatsiya': 'item9',
            'vru': 'item10',
            'komplekty': 'item11',
            'etazhnye': 'item12',
            'vosstanovlenie': 'item13',
            'lebedki': 'item14'
        };
        
        this.imageCache = new Map();
    }

    init() {
        this.initExistingGalleries();
        this.observeDOMChanges();
    }

    initExistingGalleries() {
        const galleries = document.querySelectorAll('.gallery-slider[data-category]');
        galleries.forEach(gallery => this.createGalleryForElement(gallery));
    }

    observeDOMChanges() {
        const contentContainer = document.getElementById('category-content');
        if (!contentContainer) return;

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            const galleries = node.querySelectorAll?.('.gallery-slider[data-category]') || [];
                            if (node.classList?.contains('gallery-slider') && node.hasAttribute('data-category')) {
                                this.createGalleryForElement(node);
                            }
                            galleries.forEach(gallery => this.createGalleryForElement(gallery));
                        }
                    }
                }
            }
        });
        
        observer.observe(contentContainer, { childList: true, subtree: true });
    }

    async createGalleryForElement(galleryElement) {
        if (galleryElement.classList.contains('gallery-initialized')) return;
        
        const category = galleryElement.getAttribute('data-category');
        const folderName = this.categoryMapping[category];
        
        if (!folderName) {
            this.showNoImagesMessage(galleryElement);
            return;
        }
        
        const images = await this.loadImagesForFolder(folderName, category);
        
        if (images.length === 0) {
            this.showNoImagesMessage(galleryElement);
            return;
        }
        
        this.createGalleryHTML(galleryElement, images);
        this.initSliderForGallery(galleryElement, images);
        
        galleryElement.classList.add('gallery-initialized');
    }

    async loadImagesForFolder(folderName, category) {
        const cacheKey = `${folderName}_${category}`;
        
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }
        
        const images = [];
        const basePath = `../../images/catalog/${folderName}/`;
        
        // Проверяем основное изображение
        const mainImageExists = await this.checkImageExists(`${basePath}cat__item-main.jpg`);
        if (mainImageExists) {
            images.push({ 
                url: `${basePath}cat__item-main.jpg`, 
                alt: `${category} - основное изображение`,
                order: 0 
            });
        }
        
        // Поиск остальных изображений
        let i = 1;
        let missingCount = 0;
        const batchSize = 5; // Проверяем по 5 файлов за раз
        const maxMissing = 3; // Останавливаем если 3 подряд не найдено
        
        while (missingCount < maxMissing) {
            const batchPromises = [];
            const batchUrls = [];
            
            // Создаем батч для проверки
            for (let j = 0; j < batchSize && missingCount < maxMissing; j++, i++) {
                const imageUrl = `${basePath}cat__${folderName}-${i}.jpg`;
                batchUrls.push(imageUrl);
                batchPromises.push(this.checkImageExists(imageUrl));
            }
            
            // Проверяем батч
            const batchResults = await Promise.all(batchPromises);
            
            // Обрабатываем результаты батча
            for (let j = 0; j < batchResults.length; j++) {
                if (batchResults[j]) {
                    images.push({ 
                        url: batchUrls[j], 
                        alt: `${category} - изображение ${i - batchSize + j}`,
                        order: i - batchSize + j 
                    });
                    missingCount = 0; // Сбрасываем счетчик если нашли
                } else {
                    missingCount++;
                }
            }
        }
        
        // Сортируем по порядку
        images.sort((a, b) => a.order - b.order);
        
        this.imageCache.set(cacheKey, images);
        return images;
    }

    async checkImageExists(url) {
        if (this.imageCache.has(url)) {
            return this.imageCache.get(url);
        }
        
        return new Promise((resolve) => {
            const img = new Image();
            
            // Используем таймаут для избежания бесконечного ожидания
            const timeout = setTimeout(() => {
                img.onload = null;
                img.onerror = null;
                this.imageCache.set(url, false);
                resolve(false);
            }, 2000); // 2 секунды таймаут
            
            img.onload = () => {
                clearTimeout(timeout);
                this.imageCache.set(url, true);
                resolve(true);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                this.imageCache.set(url, false);
                resolve(false);
            };
            
            img.src = url;
        });
    }

    createGalleryHTML(galleryElement, images) {
        galleryElement.innerHTML = '';
        
        const slidesContainer = document.createElement('div');
        slidesContainer.className = 'gallery-slides';
        
        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';
            slide.style.display = index === 0 ? 'block' : 'none';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.alt;
            img.className = 'gallery-image';
            img.loading = 'lazy';
            
            const counter = document.createElement('div');
            counter.className = 'gallery-counter';
            counter.textContent = `${index + 1} / ${images.length}`;
            
            slide.appendChild(img);
            slide.appendChild(counter);
            slidesContainer.appendChild(slide);
        });
        
        galleryElement.appendChild(slidesContainer);
        
        if (images.length > 1) {
            this.createNavigation(galleryElement);
            this.createThumbnails(galleryElement, images);
        }
    }

    createNavigation(galleryElement) {
        const navContainer = document.createElement('div');
        navContainer.className = 'gallery-nav';
        
        const prevButton = document.createElement('button');
        prevButton.className = 'gallery-prev';
        prevButton.innerHTML = '‹';
        prevButton.setAttribute('aria-label', 'Предыдущее изображение');
        
        const nextButton = document.createElement('button');
        nextButton.className = 'gallery-next';
        nextButton.innerHTML = '›';
        nextButton.setAttribute('aria-label', 'Следующее изображение');
        
        navContainer.appendChild(prevButton);
        navContainer.appendChild(nextButton);
        galleryElement.appendChild(navContainer);
    }

    createThumbnails(galleryElement, images) {
        const thumbsContainer = document.createElement('div');
        thumbsContainer.className = 'gallery-thumbs';
        
        images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumb';
            if (index === 0) thumb.classList.add('active');
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `Миниатюра ${index + 1}`;
            img.className = 'gallery-thumb-img';
            
            thumb.appendChild(img);
            thumbsContainer.appendChild(thumb);
        });
        
        galleryElement.appendChild(thumbsContainer);
    }

    initSliderForGallery(galleryElement, images) {
        if (images.length <= 1) return;
        
        const slides = galleryElement.querySelectorAll('.gallery-slide');
        const prevBtn = galleryElement.querySelector('.gallery-prev');
        const nextBtn = galleryElement.querySelector('.gallery-next');
        const thumbs = galleryElement.querySelectorAll('.gallery-thumb');
        
        let currentSlide = 0;
        
        const showSlide = (index) => {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            slides.forEach(slide => slide.style.display = 'none');
            slides[index].style.display = 'block';
            
            if (thumbs.length > 0) {
                thumbs.forEach(thumb => thumb.classList.remove('active'));
                if (thumbs[index]) thumbs[index].classList.add('active');
            }
            
            currentSlide = index;
        };
        
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
        
        if (thumbs.length > 0) {
            thumbs.forEach((thumb, index) => {
                thumb.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSlide(index);
                });
            });
        }
    }

    showNoImagesMessage(galleryElement) {
        galleryElement.innerHTML = `
            <div class="gallery-empty">
                <p>Изображения для этой категории загружаются</p>
            </div>
        `;
        galleryElement.classList.add('gallery-initialized');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.gallerySlider = new SimpleGallerySlider();
    window.gallerySlider.init();
});

document.addEventListener('componentsLoaded', () => {
    if (!window.gallerySlider) {
        window.gallerySlider = new SimpleGallerySlider();
    }
    window.gallerySlider.init();
});