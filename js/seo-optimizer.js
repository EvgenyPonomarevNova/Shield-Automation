/**
 * SEO Оптимизатор для всего сайта
 * Подключается на все страницы
 * @file seo-optimizer.js
 */

class SEOOptimizer {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.pageData = {};
        this.init();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('catalog.html')) return 'catalog';
        if (path.includes('documentation.html')) return 'documentation';
        if (path.includes('portfolio.html') || path.includes('works.html')) return 'portfolio';
        if (path.includes('index.html') || path === '/') return 'home';
        if (path.includes('services.html')) return 'services';
        if (path.includes('about.html')) return 'about';
        if (path.includes('contacts.html')) return 'contacts';
        return 'other';
    }
    
    async init() {
        // Общие мета-теги для всех страниц
        this.setGeneralMetaTags();
        
        // SEO для конкретной страницы
        await this.applyPageSpecificSEO();
        
        // Структурированные данные
        this.addStructuredData();
        
        // Open Graph и Twitter Cards
        this.addSocialMetaTags();
        
        // Предзагрузка важных ресурсов
        this.addResourceHints();
        
        // Sitemap и robots
        this.addSitemapAndRobots();
        
        console.log(`SEO оптимизация применена для страницы: ${this.currentPage}`);
    }
    
    setGeneralMetaTags() {
        // Проверяем и добавляем обязательные мета-теги
        this.ensureMetaTag('charset', 'UTF-8');
        this.ensureMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
        this.ensureMetaTag('name', 'format-detection', 'telephone=no');
        this.ensureMetaTag('name', 'theme-color', '#ff0000');
        
        // Мобильная оптимизация
        this.ensureMetaTag('name', 'apple-mobile-web-app-capable', 'yes');
        this.ensureMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
        this.ensureMetaTag('name', 'mobile-web-app-capable', 'yes');
        
        // Предотвращение индексации страниц входа в админку
        if (window.location.pathname.includes('admin') || window.location.pathname.includes('wp-admin')) {
            this.ensureMetaTag('name', 'robots', 'noindex, nofollow');
        }
    }
    
    async applyPageSpecificSEO() {
        const seoConfig = {
            home: {
                title: 'ТехноИмпериум | Щиты автоматизации котельных | Проектирование и монтаж',
                description: 'Проектирование, монтаж и наладка щитов автоматизации котельных. Качественное оборудование, гарантия, сервис. Работаем по всей России.',
                keywords: 'щиты автоматизации, автоматизация котельных, щиты управления, монтаж щитов, проектирование АСУ ТП'
            },
            catalog: {
                title: 'Каталог щитов автоматизации | ТехноИмпериум',
                description: 'Каталог щитов автоматизации котельных, ИТП, насосов, КНС, вентиляции. Готовые решения и индивидуальное проектирование.',
                keywords: 'каталог щитов, щиты автоматизации котельных, щиты ИТП, щиты управления насосами, щиты КНС'
            },
            documentation: {
                title: 'Документация и сертификаты | ТехноИмпериум',
                description: 'Официальная документация компании: сертификаты соответствия, лицензии, разрешения, свидетельства. Вся документация в наличии.',
                keywords: 'сертификаты, лицензии, документация, разрешения, свидетельства, сертификат соответствия'
            },
            portfolio: {
                title: 'Наши работы | Реализованные проекты щитов автоматизации',
                description: 'Портфолио выполненных проектов по автоматизации котельных, ИТП, насосных станций. Фото и описание реализованных объектов.',
                keywords: 'наши работы, портфолио, выполненные проекты, реализованные объекты, фото щитов'
            },
            services: {
                title: 'Услуги по автоматизации | ТехноИмпериум',
                description: 'Полный комплекс услуг: проектирование, монтаж, наладка, пусконаладка, обслуживание щитов автоматизации.',
                keywords: 'услуги автоматизации, проектирование щитов, монтаж автоматики, наладка оборудования, обслуживание АСУ ТП'
            },
            about: {
                title: 'О компании ТехноИмпериум | Щиты автоматизации',
                description: 'Компания ТехноИмпериум - проектирование и монтаж щитов автоматизации с 2010 года. Опыт, качество, надежность.',
                keywords: 'о компании, история компании, наши специалисты, оборудование, опыт работы'
            },
            contacts: {
                title: 'Контакты | ТехноИмпериум',
                description: 'Контакты компании ТехноИмпериум. Адрес, телефоны, email, схема проезда. Закажите обратный звонок.',
                keywords: 'контакты, адрес, телефон, как проехать, обратная связь'
            }
        };
        
        const config = seoConfig[this.currentPage] || seoConfig.home;
        
        // Обновляем title
        document.title = config.title;
        
        // Обновляем description
        this.ensureMetaTag('name', 'description', config.description);
        
        // Обновляем keywords
        this.ensureMetaTag('name', 'keywords', config.keywords);
        
        // Для динамических страниц (каталог, портфолио) дополнительная обработка
        if (this.currentPage === 'catalog') {
            await this.applyCatalogSEO();
        }
    }
    
    async applyCatalogSEO() {
        // Если есть hash в URL (динамическая категория)
        const hash = window.location.hash.replace('#', '');
        if (hash && window.strapiAPI) {
            try {
                const category = await window.strapiAPI.getCategoryBySlug(hash);
                if (category) {
                    const title = `${category.attributes.title} | Щиты автоматизации - ТехноИмпериум`;
                    const description = category.attributes.description || 
                        `Щиты автоматизации ${category.attributes.title}. Проектирование, монтаж, наладка.`;
                    
                    document.title = title;
                    this.ensureMetaTag('name', 'description', description);
                    
                    // Сохраняем данные для структурированных данных
                    this.pageData.category = category;
                }
            } catch (error) {
                console.log('SEO: Не удалось загрузить данные категории для SEO');
            }
        }
    }
    
    addStructuredData() {
        // Основная организация (добавляется на все страницы)
        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ТехноИмпериум",
            "url": window.location.origin,
            "logo": `${window.location.origin}/images/logo.png`,
            "description": "Проектирование и монтаж щитов автоматизации котельных",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "ул. Примерная, д. 1",
                "addressLocality": "Москва",
                "postalCode": "123456",
                "addressCountry": "RU"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+7-XXX-XXX-XX-XX",
                "contactType": "customer service",
                "availableLanguage": "Russian"
            }
        };
        
        // Breadcrumb schema
        const breadcrumbSchema = this.generateBreadcrumbSchema();
        
        // Page-specific schemas
        const pageSchemas = this.generatePageSpecificSchemas();
        
        // Добавляем все схемы
        [organizationSchema, breadcrumbSchema, ...pageSchemas].forEach(schema => {
            if (schema) {
                this.addJSONLDSchema(schema);
            }
        });
    }
    
    generateBreadcrumbSchema() {
        const path = window.location.pathname;
        const breadcrumbs = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": window.location.origin
            }
        ];
        
        let position = 2;
        
        if (path.includes('catalog.html')) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": position++,
                "name": "Каталог",
                "item": `${window.location.origin}/catalog.html`
            });
            
            if (window.location.hash) {
                const categoryName = decodeURIComponent(window.location.hash.replace('#', '').replace(/-/g, ' '));
                breadcrumbs.push({
                    "@type": "ListItem",
                    "position": position++,
                    "name": categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
                    "item": window.location.href
                });
            }
        } else if (path.includes('documentation.html')) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": position++,
                "name": "Документация",
                "item": `${window.location.origin}/documentation.html`
            });
        }
        
        if (breadcrumbs.length > 1) {
            return {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs
            };
        }
        
        return null;
    }
    
    generatePageSpecificSchemas() {
        const schemas = [];
        
        switch (this.currentPage) {
            case 'home':
                schemas.push(this.generateWebsiteSchema());
                schemas.push(this.generateFAQSchema());
                break;
                
            case 'catalog':
                if (this.pageData.category) {
                    schemas.push(this.generateProductSchema());
                }
                break;
                
            case 'documentation':
                schemas.push(this.generateCollectionPageSchema());
                break;
                
            case 'contacts':
                schemas.push(this.generateContactPageSchema());
                break;
        }
        
        return schemas;
    }
    
    generateWebsiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ТехноИмпериум",
            "url": window.location.origin,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${window.location.origin}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
    }
    
    generateFAQSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "Сколько времени занимает монтаж щита автоматизации?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Сроки монтажа зависят от сложности проекта и составляют от 2 до 6 недель."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Даете ли вы гарантию на оборудование?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Да, мы предоставляем гарантию от 12 до 36 месяцев на все оборудование и работы."
                    }
                }
            ]
        };
    }
    
    generateProductSchema() {
        if (!this.pageData.category) return null;
        
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": this.pageData.category.attributes.title,
            "description": this.pageData.category.attributes.description,
            "category": "Электротехническое оборудование",
            "brand": {
                "@type": "Brand",
                "name": "ТехноИмпериум"
            },
            "offers": {
                "@type": "Offer",
                "priceCurrency": "RUB",
                "category": "Услуги"
            }
        };
    }
    
    generateCollectionPageSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Документация компании",
            "description": "Официальные документы, сертификаты и лицензии компании ТехноИмпериум"
        };
    }
    
    generateContactPageSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Контакты",
            "description": "Контактная информация компании ТехноИмпериум"
        };
    }
    
    addSocialMetaTags() {
        // Open Graph
        const ogTags = {
            'og:title': document.title,
            'og:description': this.getMetaContent('description'),
            'og:url': window.location.href,
            'og:type': 'website',
            'og:site_name': 'ТехноИмпериум',
            'og:locale': 'ru_RU'
        };
        
        // Twitter Cards
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': document.title,
            'twitter:description': this.getMetaContent('description')
        };
        
        // Добавляем OG теги
        Object.entries(ogTags).forEach(([property, content]) => {
            this.ensureMetaTag('property', property, content);
        });
        
        // Добавляем Twitter теги
        Object.entries(twitterTags).forEach(([name, content]) => {
            this.ensureMetaTag('name', `twitter:${name}`, content);
        });
        
        // Изображение для соцсетей (общее для всего сайта)
        const ogImage = `${window.location.origin}/images/og-image.jpg`;
        this.ensureMetaTag('property', 'og:image', ogImage);
        this.ensureMetaTag('property', 'og:image:width', '1200');
        this.ensureMetaTag('property', 'og:image:height', '630');
        this.ensureMetaTag('name', 'twitter:image', ogImage);
    }
    
    addResourceHints() {
        // Preconnect к важным доменам
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = '';
            document.head.appendChild(link);
        });
        
        // Preload важных шрифтов
        const fonts = [
            '/fonts/Roboto-Regular.woff2',
            '/fonts/Roboto-Bold.woff2'
        ];
        
        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = '';
            document.head.appendChild(link);
        });
    }
    
    addSitemapAndRobots() {
        // Ссылка на sitemap
        const sitemapLink = document.createElement('link');
        sitemapLink.rel = 'sitemap';
        sitemapLink.type = 'application/xml';
        sitemapLink.href = '/sitemap.xml';
        document.head.appendChild(sitemapLink);
        
        // Robots meta tag (если еще нет)
        if (!document.querySelector('meta[name="robots"]')) {
            this.ensureMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        }
    }
    
    // Вспомогательные методы
    ensureMetaTag(type, name, content = '') {
        let element;
        
        if (type === 'charset') {
            element = document.querySelector('meta[charset]');
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('charset', name);
                document.head.appendChild(element);
            }
        } else if (type === 'property') {
            element = document.querySelector(`meta[property="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', name);
                document.head.appendChild(element);
            }
        } else {
            element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.name = name;
                document.head.appendChild(element);
            }
        }
        
        if (content && element) {
            element.content = content;
        }
        
        return element;
    }
    
    getMetaContent(name) {
        const element = document.querySelector(`meta[name="${name}"]`);
        return element ? element.content : '';
    }
    
    addJSONLDSchema(schema) {
        // Удаляем старые схемы с тем же типом
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                if (data['@type'] === schema['@type']) {
                    script.remove();
                }
            } catch (e) {
                // Игнорируем ошибки парсинга
            }
        });
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    }
    
    // Метод для обновления SEO при смене контента (для SPA)
    static updateForDynamicContent(data) {
        const optimizer = new SEOOptimizer();
        optimizer.pageData = data;
        optimizer.addStructuredData();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка для загрузки динамического контента
    setTimeout(() => {
        window.seoOptimizer = new SEOOptimizer();
    }, 100);
});

// Для динамических страниц (каталог, портфолио)
document.addEventListener('categoryLoaded', (event) => {
    if (window.seoOptimizer) {
        window.seoOptimizer.pageData = { category: event.detail };
        window.seoOptimizer.addStructuredData();
    }
});