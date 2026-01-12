/**
 * Основной скрипт инициализации сайта
 * @file main.js
 */

// === НАСТРОЙКИ ===
const STRAPI_BASE_URL = 'https://shield-and-automation.ru';
const CALLBACK_ENDPOINT = `${STRAPI_BASE_URL}/api/callback-requests`;

class MainApp {
  constructor() {
    this.init();
  }

  async init() {
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Инициализация всех общих компонентов
    this.initCommonComponents();

    // Инициализация специфичных для страницы компонентов
    this.initPageSpecificComponents();
  }

  initCommonComponents() {
    // Инициализация форм
    this.initForms();

    // Инициализация телефонных ссылок
    this.initPhoneLinks();

    // Инициализация якорей
    this.initAnchors();

    // Инициализация модальных окон (на всякий случай)
    this.initModals();
  }

  initPageSpecificComponents() {
    // Проверяем на какой странице мы находимся
    const body = document.body;

    if (body.classList.contains('page--catalog')) {
      console.log('MainApp: Страница каталога');
      this.initCatalogPage();
    }

    if (body.classList.contains('page--home')) {
      console.log('MainApp: Главная страница');
      this.initHomePage();
    }
  }

initForms() {
  // Инициализация ВСЕХ форм обратной связи
  const forms = document.querySelectorAll('.callback-form__form');
  if (!forms.length) return;

  forms.forEach((form) => {
    // Чтобы не навесить обработчик повторно
    if (form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phoneInput = form.querySelector('input[name="phone"]');
      const emailInput = form.querySelector('input[name="email"]');

      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      if (!phone) {
        alert('Введите номер телефона');
        return;
      }

      // Блокируем кнопку на время отправки
      const submitBtn = form.querySelector('button[type="submit"]');
      const prevBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляю...';
      }

      try {
        const payload = {
          phone,
          source: form.closest('.modal') ? 'callback_modal' : 'callback_form',
          pageUrl: window.location.href,
        };

        // Email добавляем только если поле есть (чтобы форма "только телефон" тоже работала)
        if (email) payload.email = email;

        const response = await fetch(CALLBACK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          console.error('Callback error:', response.status, errText);
          throw new Error(`Ошибка отправки (${response.status})`);
        }

        alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');

        // Закрываем модалку, если это модальная форма
        const modal = form.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }

        form.reset();
      } catch (err) {
        console.error(err);
        alert('Не удалось отправить заявку. Попробуйте позже.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = prevBtnText || 'Отправить';
        }
      }
    });
  });
}


  initPhoneLinks() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const phoneNumber = link.getAttribute('href').replace('tel:', '');
        console.log('MainApp: Звонок на номер:', phoneNumber);
        // Здесь можно добавить аналитику
      });
    });
  }

  initAnchors() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute('href');

      // Пропускаем якоря, которые ведут к модальным окнам или пустым ссылкам
      if (
        href === '#' ||
        document.getElementById(href.substring(1))?.classList.contains('modal')
      ) {
        return;
      }

      anchor.addEventListener('click', (e) => {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  initModals() {
    // Открытие модалок
    const modalButtons = document.querySelectorAll('[data-modal], a[href^="#callback"]');
    modalButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = button.getAttribute('data-modal') || 'callback';

        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // Закрытие по крестику
    const closeButtons = document.querySelectorAll('.modal__close');
    closeButtons.forEach((button) => {
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
    overlays.forEach((overlay) => {
      overlay.addEventListener('click', () => {
        const modal = overlay.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });

    // Закрытие по ESC (приятный бонус)
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const opened = document.querySelector('.modal[style*="display: block"]');
      if (opened) {
        opened.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  initCatalogPage() {
    if (window.catalogDynamic && window.catalogDynamic.initialized) {
      return;
    }

    setTimeout(() => {
      if (window.catalogDynamic) {
        window.catalogDynamic.init();
      }
    }, 500);
  }

  initHomePage() {
    // Логика для главной страницы
  }
}

// Инициализация приложения после загрузки компонентов
document.addEventListener('componentsLoaded', () => {
  window.mainApp = new MainApp();
});

// Инициализация на случай, если событие componentsLoaded не произошло
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.mainApp) {
      window.mainApp = new MainApp();
    }
  }, 3000);
});

// === Поиск в шапке (оставлено как было) ===
document.addEventListener('DOMContentLoaded', function () {
  const searchToggle = document.querySelector('.search__toggle');
  const searchForm = document.querySelector('.search__form');
  const searchInput = document.querySelector('.search__input');
  const searchClose = document.querySelector('.search__close');

  if (searchToggle && searchForm) {
    // Открытие/закрытие формы поиска
    searchToggle.addEventListener('click', function () {
      searchForm.classList.add('search__form--active');
      if (searchInput) searchInput.focus();
    });

    if (searchClose) {
      searchClose.addEventListener('click', function () {
        searchForm.classList.remove('search__form--active');
      });
    }

    // Обработка отправки формы поиска
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.trim();
        window.location.href = `search.html?s=${encodeURIComponent(query)}`;
      }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchForm.classList.contains('search__form--active')) {
        searchForm.classList.remove('search__form--active');
      }
    });
  }

  // Обработка поиска на странице поиска
  if (window.location.pathname.includes('search.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('s');

    if (query && typeof window.SearchEngine !== 'undefined') {
      window.SearchEngine.search(query);
    }
  }
});


// === ПРОВЕРКА ТЕЛЕФОННЫХ НОМЕРОВ ===
class PhoneValidator {
  constructor() {
    // Регулярное выражение для российских номеров
    this.phoneRegex = /^\+7\s?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    
    // Минимальная и максимальная длина номера (с учётом +7)
    this.minLength = 12; // +79991234567
    this.maxLength = 18; // +7 (999) 123-45-67
    
    // Состояние валидации для каждого поля
    this.phoneFields = new Map();
  }

  // Инициализация всех телефонных полей на странице
  init() {
    this.initPhoneInputs();
    this.initFormValidation();
  }

  // Инициализация телефонных полей ввода
  initPhoneInputs() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    
    phoneInputs.forEach(input => {
      this.setupPhoneInput(input);
    });
  }

  // Настройка обработчиков для телефонного поля
  setupPhoneInput(input) {
    // Устанавливаем значение по умолчанию +7
    if (!input.value.trim()) {
      input.value = '+7';
    }

    // Сохраняем начальное состояние
    const initialValue = input.value;
    this.phoneFields.set(input, {
      isValid: false,
      value: initialValue,
      formattedValue: this.formatPhone(initialValue)
    });

    // Обработчик ввода
    input.addEventListener('input', (e) => {
      this.handlePhoneInput(e, input);
    });

    // Обработчик вставки
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      this.handlePaste(e.target, pastedData);
    });

    // Обработчик потери фокуса
    input.addEventListener('blur', () => {
      this.formatPhoneOnBlur(input);
    });

    // Обработчик получения фокуса
    input.addEventListener('focus', () => {
      if (input.value === '+7' || input.value === '') {
        input.setSelectionRange(2, 2);
      }
    });

    // Обработчик клавиш (удаление, backspace)
    input.addEventListener('keydown', (e) => {
      this.handleKeyDown(e, input);
    });
  }

  // Обработка ввода
  handlePhoneInput(e, input) {
    let value = input.value;
    let cursorPosition = input.selectionStart;
    
    // Если поле пустое, устанавливаем +7
    if (value === '') {
      input.value = '+7';
      input.setSelectionRange(2, 2);
      this.updatePhoneFieldState(input, '+7', false);
      return;
    }

    // Убираем всё, кроме цифр
    let cleaned = value.replace(/\D/g, '');
    
    // Если номер начинается не с 7 или 8, добавляем 7
    if (cleaned.length > 0 && !cleaned.startsWith('7') && !cleaned.startsWith('8')) {
      cleaned = '7' + cleaned;
    }
    
    // Заменяем 8 на 7 в начале
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.substring(1);
    }
    
    // Ограничиваем длину (10 цифр после +7)
    if (cleaned.length > 11) {
      cleaned = cleaned.substring(0, 11);
    }
    
    // Форматируем номер
    let formatted = this.formatDigits(cleaned);
    
    // Сохраняем новое значение
    input.value = formatted;
    
    // Восстанавливаем позицию курсора
    const newCursorPosition = this.calculateNewCursorPosition(
      value, 
      formatted, 
      cursorPosition
    );
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    
    // Проверяем валидность
    const isValid = this.validatePhone(formatted);
    this.updatePhoneFieldState(input, formatted, isValid);
  }

  // Обработка вставки текста
  handlePaste(input, pastedText) {
    let cleaned = pastedText.replace(/\D/g, '');
    
    // Обработка российских номеров
    if (cleaned.length >= 10) {
      // Если номер начинается с 8, заменяем на 7
      if (cleaned.startsWith('8')) {
        cleaned = '7' + cleaned.substring(1);
      }
      // Если номер не начинается с 7, добавляем
      else if (!cleaned.startsWith('7')) {
        cleaned = '7' + cleaned;
      }
      
      // Ограничиваем длину
      if (cleaned.length > 11) {
        cleaned = cleaned.substring(0, 11);
      }
      
      // Форматируем
      input.value = this.formatDigits(cleaned);
    } else {
      input.value = '+7' + cleaned;
    }
    
    // Проверяем валидность
    const isValid = this.validatePhone(input.value);
    this.updatePhoneFieldState(input, input.value, isValid);
  }

  // Форматирование номера при потере фокуса
  formatPhoneOnBlur(input) {
    const value = input.value;
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length >= 11) {
      const formatted = this.formatDigits(cleaned);
      if (value !== formatted) {
        input.value = formatted;
        const isValid = this.validatePhone(formatted);
        this.updatePhoneFieldState(input, formatted, isValid);
      }
    } else if (value === '+7' || value.trim() === '') {
      input.value = '+7';
      this.updatePhoneFieldState(input, '+7', false);
    }
  }

  // Обработка нажатий клавиш
  handleKeyDown(e, input) {
    const cursorPosition = input.selectionStart;
    const value = input.value;
    
    // Обработка Backspace
    if (e.key === 'Backspace') {
      // Не позволяем удалить +7 полностью
      if (cursorPosition <= 2) {
        e.preventDefault();
        return;
      }
      
      // Если удаляем цифру из +7, оставляем +7
      if (value.length <= 3 && value.startsWith('+7')) {
        e.preventDefault();
        input.value = '+7';
        input.setSelectionRange(2, 2);
        this.updatePhoneFieldState(input, '+7', false);
      }
    }
    
    // Обработка Delete
    if (e.key === 'Delete') {
      // Не позволяем удалить +7
      if (cursorPosition < 2) {
        e.preventDefault();
        return;
      }
    }
  }

  // Форматирование цифр в телефонный номер
  formatDigits(digits) {
    if (!digits || digits.length < 11) {
      return '+7' + digits.substring(1);
    }
    
    const countryCode = '+7';
    const areaCode = digits.substring(1, 4);
    const firstPart = digits.substring(4, 7);
    const secondPart = digits.substring(7, 9);
    const thirdPart = digits.substring(9, 11);
    
    return `${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
  }

  // Форматирование телефона для разных случаев
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length < 11) {
      return '+7' + cleaned.substring(1);
    }
    
    return this.formatDigits(cleaned);
  }

  // Валидация телефонного номера
  validatePhone(phone) {
    // Базовая проверка по регулярному выражению
    const basicCheck = this.phoneRegex.test(phone);
    
    if (!basicCheck) return false;
    
    // Проверка длины
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 11) return false;
    
    // Проверка кода оператора (должен быть 9 после +7)
    if (!digitsOnly.startsWith('79')) {
      // Разрешаем также 78, 74, 73 и другие коды операторов
      const operatorCode = digitsOnly.substring(1, 3);
      const validOperatorCodes = ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99', 
                                 '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
                                 '70', '71', '72', '73', '74', '75', '76', '77', '78', '79'];
      
      if (!validOperatorCodes.includes(operatorCode)) {
        return false;
      }
    }
    
    return true;
  }

  // Обновление состояния поля
  updatePhoneFieldState(input, value, isValid) {
    this.phoneFields.set(input, {
      isValid,
      value,
      formattedValue: value
    });
    
    // Добавляем/убираем классы валидации
    if (isValid) {
      input.classList.remove('input--error');
      input.classList.add('input--success');
    } else {
      input.classList.remove('input--success');
      if (value !== '+7') {
        input.classList.add('input--error');
      }
    }
    
    // Обновляем атрибут data-valid
    input.setAttribute('data-valid', isValid.toString());
  }

  // Вычисление новой позиции курсора
  calculateNewCursorPosition(oldValue, newValue, oldPosition) {
    // Если значения одинаковые, возвращаем старую позицию
    if (oldValue === newValue) return oldPosition;
    
    // Простой алгоритм: пытаемся сохранить позицию относительно цифр
    const oldDigits = oldValue.replace(/\D/g, '');
    const newDigits = newValue.replace(/\D/g, '');
    
    if (oldDigits.length === newDigits.length) {
      return oldPosition;
    }
    
    // Если добавили символы форматирования
    if (newValue.length > oldValue.length) {
      return Math.min(oldPosition + (newValue.length - oldValue.length), newValue.length);
    }
    
    return Math.max(oldPosition - (oldValue.length - newValue.length), 0);
  }

  // Инициализация валидации форм
  initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
          return false;
        }
      });
    });
  }

  // Валидация всей формы
  validateForm(form) {
    const phoneInputs = form.querySelectorAll('input[type="tel"], input[name="phone"]');
    let isValid = true;
    
    phoneInputs.forEach(input => {
      const fieldState = this.phoneFields.get(input);
      const isRequired = input.hasAttribute('required');
      
      if (isRequired && (!fieldState || !fieldState.isValid || fieldState.value === '+7')) {
        isValid = false;
        this.showValidationError(input, 'Введите корректный номер телефона');
      } else if (fieldState && fieldState.value !== '+7' && !fieldState.isValid) {
        isValid = false;
        this.showValidationError(input, 'Номер телефона введен неверно');
      } else {
        this.hideValidationError(input);
      }
    });
    
    return isValid;
  }

  // Показать сообщение об ошибке
  showValidationError(input, message) {
    // Убираем старое сообщение
    this.hideValidationError(input);
    
    // Создаем новое
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e53935';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    
    input.classList.add('input--error');
    input.parentNode.appendChild(errorElement);
    
    // Сохраняем ссылку на элемент ошибки
    input.dataset.errorElement = true;
  }

  // Скрыть сообщение об ошибке
  hideValidationError(input) {
    const existingError = input.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }
    input.classList.remove('input--error');
  }

  // Получить отформатированный номер
  getFormattedPhone(input) {
    const fieldState = this.phoneFields.get(input);
    return fieldState ? fieldState.formattedValue : input.value;
  }
}

// === ИНИЦИАЛИЗАЦИЯ ВСЕХ ФОРМ НА САЙТЕ ===
class FormValidator {
  constructor() {
    this.phoneValidator = new PhoneValidator();
    this.emailValidator = new EmailValidator();
  }

  init() {
    // Инициализируем валидацию телефонов
    this.phoneValidator.init();
    
    // Инициализируем валидацию email
    this.emailValidator.init();
    
    // Модифицируем обработчик отправки форм
    this.modifyFormSubmitHandlers();
  }

  // Модификация обработчиков отправки форм
  modifyFormSubmitHandlers() {
    const forms = document.querySelectorAll('.callback-form__form');
    
    forms.forEach(form => {
      // Сохраняем оригинальный обработчик, если есть
      const originalSubmitHandler = form._submitHandler;
      
      // Удаляем старый обработчик
      if (originalSubmitHandler) {
        form.removeEventListener('submit', originalSubmitHandler);
      }
      
      // Добавляем новый обработчик с валидацией
      const newHandler = async (e) => {
        e.preventDefault();
        
        // Валидация телефона
        const phoneInput = form.querySelector('input[type="tel"], input[name="phone"]');
        if (phoneInput) {
          const phoneValue = phoneInput.value.trim();
          const isPhoneValid = this.phoneValidator.validatePhone(phoneValue);
          
          if (!isPhoneValid && phoneValue !== '+7') {
            this.phoneValidator.showValidationError(phoneInput, 'Введите корректный номер телефона');
            return;
          } else if (phoneValue === '+7') {
            this.phoneValidator.showValidationError(phoneInput, 'Введите номер телефона');
            return;
          }
        }
        
        // Валидация email (если поле есть)
        const emailInput = form.querySelector('input[type="email"], input[name="email"]');
        if (emailInput && emailInput.hasAttribute('required')) {
          const emailValue = emailInput.value.trim();
          const isEmailValid = this.emailValidator.validateEmail(emailValue);
          
          if (!isEmailValid) {
            this.emailValidator.showValidationError(emailInput, 'Введите корректный email');
            return;
          }
        }
        
        // Если все проверки пройдены, вызываем оригинальный обработчик
        if (typeof originalSubmitHandler === 'function') {
          originalSubmitHandler(e);
        } else {
          // Или вызываем стандартную отправку
          this.submitForm(form);
        }
      };
      
      // Сохраняем ссылку на новый обработчик
      form._submitHandler = newHandler;
      form.addEventListener('submit', newHandler);
    });
  }

  // Отправка формы (можно интегрировать с существующим кодом)
  async submitForm(form) {
    // Здесь можно добавить логику отправки на сервер
    console.log('Форма отправлена:', new FormData(form));
    
    // Пример: показать сообщение об успехе
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;
      
      // Имитация отправки
      setTimeout(() => {
        alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Сброс телефонного поля до +7
        const phoneInput = form.querySelector('input[type="tel"], input[name="phone"]');
        if (phoneInput) {
          phoneInput.value = '+7';
        }
        
        // Закрытие модального окна, если форма в модалке
        const modal = form.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      }, 1000);
    }
  }
}

// === ВАЛИДАЦИЯ EMAIL ===
class EmailValidator {
  constructor() {
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailFields = new Map();
  }

  init() {
    this.initEmailInputs();
  }

  initEmailInputs() {
    const emailInputs = document.querySelectorAll('input[type="email"], input[name="email"]');
    
    emailInputs.forEach(input => {
      this.setupEmailInput(input);
    });
  }

  setupEmailInput(input) {
    // Сохраняем начальное состояние
    this.emailFields.set(input, {
      isValid: false,
      value: input.value
    });

    // Обработчик ввода
    input.addEventListener('input', (e) => {
      this.handleEmailInput(e.target);
    });

    // Обработчик потери фокуса
    input.addEventListener('blur', () => {
      this.validateOnBlur(input);
    });
  }

  handleEmailInput(input) {
    const value = input.value.trim();
    const isValid = this.validateEmail(value);
    
    this.updateEmailFieldState(input, value, isValid);
  }

  validateOnBlur(input) {
    const value = input.value.trim();
    const isValid = this.validateEmail(value);
    
    if (!isValid && value !== '') {
      this.showValidationError(input, 'Введите корректный email');
    } else {
      this.hideValidationError(input);
    }
    
    this.updateEmailFieldState(input, value, isValid);
  }

  validateEmail(email) {
    if (!email) return false;
    return this.emailRegex.test(email);
  }

  updateEmailFieldState(input, value, isValid) {
    this.emailFields.set(input, { isValid, value });
    
    if (isValid) {
      input.classList.remove('input--error');
      input.classList.add('input--success');
    } else if (value !== '') {
      input.classList.remove('input--success');
      input.classList.add('input--error');
    } else {
      input.classList.remove('input--success', 'input--error');
    }
  }

  showValidationError(input, message) {
    this.hideValidationError(input);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e53935';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    
    input.parentNode.appendChild(errorElement);
  }

  hideValidationError(input) {
    const existingError = input.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }
  }
}

// === ДОБАВЛЕНИЕ СТИЛЕЙ ДЛЯ ВАЛИДАЦИИ ===
function addValidationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .input--success {
      border-color: #4caf50 !important;
      background-color: rgba(76, 175, 80, 0.05) !important;
    }
    
    .input--error {
      border-color: #e53935 !important;
      background-color: rgba(229, 57, 53, 0.05) !important;
    }
    
    .validation-error {
      color: #e53935;
      font-size: 12px;
      margin-top: 5px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
document.addEventListener('DOMContentLoaded', () => {
  // Добавляем стили
  addValidationStyles();
  
  // Создаем и инициализируем валидатор форм
  window.formValidator = new FormValidator();
  window.formValidator.init();
  
  // Интеграция с существующим mainApp
  if (window.mainApp) {
    const originalInitForms = window.mainApp.initForms;
    window.mainApp.initForms = function() {
      originalInitForms.call(this);
      window.formValidator.modifyFormSubmitHandlers();
    };
  }
});

// Для интеграции с существующим кодом после загрузки компонентов
document.addEventListener('componentsLoaded', () => {
  if (window.formValidator) {
    window.formValidator.init();
  }
});