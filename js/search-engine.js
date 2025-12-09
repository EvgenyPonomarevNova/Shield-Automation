// search-engine.js

// База данных для поиска
class SearchDatabase {
  constructor() {
    this.data = [];
    this.init();
  }

  init() {
    // Категории из catalog.html
    this.addCategories();
    
    // Портфолио из portfolio.html
    this.addPortfolio();
    
    // Страницы
    this.addPages();
    
    // Документация
    this.addDocumentation();
  }

  addCategories() {
    const categories = [
      {
        id: 'kotelnye',
        title: 'Щиты автоматизации котельных',
        description: 'Проектирование, разработка и производство щитов автоматизации для котельных любого типа и мощности.',
        path: 'Каталог / Щиты автоматизации котельных',
        url: 'catalog.html#kotelnye',
        type: 'category'
      },
      {
        id: 'itp',
        title: 'Щиты автоматизации ИТП',
        description: 'Автоматизация индивидуальных тепловых пунктов для эффективного управления отоплением.',
        path: 'Каталог / Щиты автоматизации ИТП',
        url: 'catalog.html#itp',
        type: 'category'
      },
      {
        id: 'nasosy',
        title: 'Щиты автоматизации насосов',
        description: 'Системы управления насосным оборудованием для водоснабжения, отопления и других систем.',
        path: 'Каталог / Щиты автоматизации насосов',
        url: 'catalog.html#nasosy',
        type: 'category'
      },
      {
        id: 'kns',
        title: 'Щиты автоматизации КНС',
        description: 'Автоматизация канализационных насосных станций для эффективной работы систем водоотведения.',
        path: 'Каталог / Щиты автоматизации КНС',
        url: 'catalog.html#kns',
        type: 'category'
      },
      {
        id: 'kamery',
        title: 'Щиты автоматизации покрасочно-сушильных камер',
        description: 'Системы управления для покрасочных и сушильных камер промышленного назначения.',
        path: 'Каталог / Покрасочно-сушильные камеры',
        url: 'catalog.html#kamery',
        type: 'category'
      },
      {
        id: 'kotly',
        title: 'Щиты автоматизации котлов',
        description: 'Автоматика для управления котлами различных типов и производителей.',
        path: 'Каталог / Щиты автоматизации котлов',
        url: 'catalog.html#kotly',
        type: 'category'
      },
      {
        id: 'asu-tp',
        title: 'Щиты автоматизации для АСУ ТП',
        description: 'Автоматизированные системы управления технологическими процессами.',
        path: 'Каталог / АСУ ТП',
        url: 'catalog.html#asu-tp',
        type: 'category'
      },
      {
        id: 'ovoshchehranilishcha',
        title: 'Щиты автоматизации овощехранилищ',
        description: 'Системы управления микроклиматом в овощехранилищах и складах.',
        path: 'Каталог / Овощехранилища',
        url: 'catalog.html#ovoshchehranilishcha',
        type: 'category'
      },
      {
        id: 'ventilyatsiya',
        title: 'Щиты автоматизации систем вентиляции и кондиционирования',
        description: 'Управление системами вентиляции, кондиционирования и климат-контроля.',
        path: 'Каталог / Вентиляция и кондиционирование',
        url: 'catalog.html#ventilyatsiya',
        type: 'category'
      },
      {
        id: 'vru',
        title: 'ВРУ (Вводно-распределительное устройство)',
        description: 'Вводно-распределительные устройства для электроснабжения объектов.',
        path: 'Каталог / ВРУ',
        url: 'catalog.html#vru',
        type: 'category'
      },
      {
        id: 'komplekty',
        title: 'Комплект щитов для котельной',
        description: 'Полные комплекты щитового оборудования для котельных.',
        path: 'Каталог / Комплекты щитов',
        url: 'catalog.html#komplekty',
        type: 'category'
      },
      {
        id: 'vosstanovlenie',
        title: 'Восстановление и ремонт щитов автоматизации',
        description: 'Ремонт, модернизация и восстановление щитов автоматизации любых производителей.',
        path: 'Каталог / Ремонт щитов',
        url: 'catalog.html#vosstanovlenie',
        type: 'category'
      },
      {
        id: 'lebedki',
        title: 'Щит автоматизации лебёдки',
        description: 'Системы управления лебедками и подъемными механизмами.',
        path: 'Каталог / Щиты для лебедок',
        url: 'catalog.html#lebedki',
        type: 'category'
      }
    ];

    this.data.push(...categories);
  }

  addPortfolio() {
    const portfolioItems = [
      {
        title: 'Щит автоматизации для управления лебёдкой маневровой ЛМ 140',
        description: 'Разработан и запущен в производство щит автоматизации для управления лебёдкой маневровой ЛМ 140.',
        path: 'Наши работы / Ремонт и модернизация щитов автоматизации',
        url: 'portfolio.html#work-1',
        type: 'portfolio'
      },
      {
        title: 'Техническое обслуживание КИПиА газогорелочного оборудования',
        description: 'Техническое обслуживание КИПиА газогорелочного оборудования на асфальтосмесительной установке.',
        path: 'Наши работы / Техническое обслуживание КИПиА',
        url: 'portfolio.html#work-7',
        type: 'portfolio'
      },
      {
        title: 'Монтаж и пусконаладка КИПиА котельной 2 МВт',
        description: 'Монтаж и пусконаладка КИПиА котельной суммарной мощностью 2 МВт на природном газе.',
        path: 'Наши работы / Техническое обслуживание КИПиА',
        url: 'portfolio.html#work-8',
        type: 'portfolio'
      },
      {
        title: 'Модернизация щита автоматизации котла КВС-1',
        description: 'Модернизация щита автоматизации котла КВС-1, Чувашия, Чебоксары.',
        path: 'Наши работы / Щиты автоматизации котлов и котельных',
        url: 'portfolio.html#work-11',
        type: 'portfolio'
      },
      {
        title: 'Восстановление работоспособности щита автоматизации',
        description: 'Восстановление работоспособности щита автоматизации блочно-модульной котельной.',
        path: 'Наши работы / Ремонт и модернизация щитов автоматизации',
        url: 'portfolio.html#work-18',
        type: 'portfolio'
      }
    ];

    this.data.push(...portfolioItems);
  }

  addPages() {
    const pages = [
      {
        title: 'Автоматизация котельных. Разработка, монтаж, наладка, сервис',
        description: 'Автоматизация котельных. Монтаж, пусконаладка, сервисное и техническое обслуживание КИПиА теплогенерирующих объектов.',
        path: 'Услуги / Автоматизация котельных',
        url: 'avtomatizatsiya.html',
        type: 'page'
      },
      {
        title: 'Щиты автоматики. Разработка, монтаж, наладка, сервис',
        description: 'ООО "Щит-Автоматика" – разработчик и производитель щитов автоматизации для самого широкого спектра применения.',
        path: 'Услуги / Щиты автоматики',
        url: 'AutomationShields.html',
        type: 'page'
      },
      {
        title: 'Щиты автоматизации - Каталог',
        description: 'Щиты автоматизации котельных. Разработка, монтаж, наладка, сервис.',
        path: 'Каталог',
        url: 'catalog.html',
        type: 'page'
      },
      {
        title: 'Наши работы',
        description: 'Наши работы по автоматизации котельных, щитам автоматики, КИПиА. Разработка, монтаж, наладка, сервис.',
        path: 'Наши работы',
        url: 'portfolio.html',
        type: 'page'
      },
      {
        title: 'Документация',
        description: 'Сертификаты и разрешения компании «ТехноИмпериум». Официальная документация, лицензии, свидетельства.',
        path: 'Документация',
        url: 'documentation.html',
        type: 'page'
      }
    ];

    this.data.push(...pages);
  }

  addDocumentation() {
    const documents = [
      {
        title: 'Сертификат соответствия',
        description: 'Официальный сертификат соответствия требованиям качества и безопасности.',
        path: 'Документация / Сертификаты',
        url: 'documentation.html#cert-1',
        type: 'documentation'
      },
      {
        title: 'Свидетельство',
        description: 'Свидетельство о регистрации и разрешительная документация.',
        path: 'Документация / Свидетельства',
        url: 'documentation.html#cert-5',
        type: 'documentation'
      },
      {
        title: 'Лицензии',
        description: 'Лицензии на осуществление деятельности.',
        path: 'Документация / Лицензии',
        url: 'documentation.html#cert-8',
        type: 'documentation'
      }
    ];

    this.data.push(...documents);
  }

  search(query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return this.data.filter(item => {
      const searchString = `${item.title} ${item.description} ${item.path}`.toLowerCase();
      
      // Проверяем все термины поиска
      return searchTerms.every(term => searchString.includes(term));
    }).map(item => ({
      ...item,
      relevance: this.calculateRelevance(item, query)
    })).sort((a, b) => b.relevance - a.relevance);
  }

  calculateRelevance(item, query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const searchString = `${item.title} ${item.description}`.toLowerCase();
    
    let relevance = 0;
    
    searchTerms.forEach(term => {
      // Более высокий вес для совпадений в заголовке
      if (item.title.toLowerCase().includes(term)) {
        relevance += 10;
      }
      
      // Средний вес для описания
      if (item.description.toLowerCase().includes(term)) {
        relevance += 5;
      }
      
      // Проверяем точные совпадения
      const titleWords = item.title.toLowerCase().split(/\s+/);
      const descriptionWords = item.description.toLowerCase().split(/\s+/);
      
      titleWords.forEach(word => {
        if (word.startsWith(term)) {
          relevance += 8;
        }
        if (word === term) {
          relevance += 12;
        }
      });
      
      descriptionWords.forEach(word => {
        if (word.startsWith(term)) {
          relevance += 3;
        }
        if (word === term) {
          relevance += 5;
        }
      });
    });
    
    return relevance;
  }

  highlightText(text, query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlighted = text;
    
    searchTerms.forEach(term => {
      if (term.length > 2) { // Подсвечиваем только термины длиннее 2 символов
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="search-highlight">$1</span>');
      }
    });
    
    return highlighted;
  }
}

// Инициализация базы данных
const searchDB = new SearchDatabase();

// Функция поиска
function performSearch(query) {
  const searchLoading = document.getElementById('search-loading');
  const searchResults = document.getElementById('search-results');
  const searchList = document.getElementById('search-list');
  const searchInfo = document.getElementById('search-info');
  const searchEmpty = document.getElementById('search-empty');
  
  if (searchLoading) searchLoading.style.display = 'block';
  if (searchList) searchList.innerHTML = '';
  if (searchEmpty) searchEmpty.style.display = 'none';
  
  // Имитация загрузки для UX
  setTimeout(() => {
    const results = searchDB.search(query);
    
    if (searchLoading) searchLoading.style.display = 'none';
    
    if (results.length === 0) {
      if (searchEmpty) searchEmpty.style.display = 'block';
      if (searchInfo) searchInfo.textContent = `По запросу "${query}" ничего не найдено`;
    } else {
      if (searchInfo) {
        const countText = results.length === 1 ? 'найден 1 результат' : `найдено ${results.length} результатов`;
        searchInfo.textContent = `По запросу "${query}" ${countText}`;
      }
      
      renderResults(results, query, searchList);
    }
    
    // Сохраняем запрос в истории браузера
    if (history.pushState) {
      const url = new URL(window.location);
      url.searchParams.set('s', query);
      history.pushState({}, '', url);
    }
  }, 500);
}

// Рендеринг результатов
function renderResults(results, query, container) {
  container.innerHTML = '';
  
  results.forEach((item, index) => {
    const highlightedTitle = searchDB.highlightText(item.title, query);
    const highlightedDescription = searchDB.highlightText(item.description, query);
    const highlightedPath = searchDB.highlightText(item.path, query);
    
    const resultItem = document.createElement('div');
    resultItem.className = 'search-item';
    resultItem.innerHTML = `
      <div class="search-item__header">
        <span class="search-item__type search-item__type--${item.type}">
          ${getTypeLabel(item.type)}
        </span>
        <h3 class="search-item__title">
          <a href="${item.url}">${highlightedTitle}</a>
        </h3>
      </div>
      <p class="search-item__description">${highlightedDescription}</p>
      <div class="search-item__path">${highlightedPath}</div>
    `;
    
    container.appendChild(resultItem);
  });
}

function getTypeLabel(type) {
  const labels = {
    'category': 'Категория',
    'portfolio': 'Работа',
    'documentation': 'Документ',
    'page': 'Страница'
  };
  
  return labels[type] || type;
}

// Экспорт для использования в других скриптах
window.SearchEngine = {
  search: performSearch,
  database: searchDB
};