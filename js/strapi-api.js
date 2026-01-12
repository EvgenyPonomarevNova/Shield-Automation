/**
 * API для работы с Strapi CMS
 * @file strapi-api.js тест аф
 */

class StrapiAPI {
  constructor() {
    this.baseUrl = "https://admin.shield-and-automation.ru";
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
  }

  async getAllCategories() {
    this.init();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/catalog-categories?populate=*&sort=order:asc&pagination[pageSize]=100`
      );

      if (!response.ok) {
        throw new Error(
          `Ошибка API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("StrapiAPI: Ошибка загрузки категорий:", error);
      return [];
    }
  }

  async getCategoryBySlug(slug) {
    this.init();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/catalog-categories?filters[slug][$eq]=${slug}&populate=*`
      );

      if (!response.ok) {
        throw new Error(
          `Ошибка API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error(`StrapiAPI: Ошибка загрузки категории ${slug}:`, error);
      return null;
    }
  }

  async getAllDocumentations() {
    this.init();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/documentations?populate=*&sort=createdAt:desc&pagination[pageSize]=100`
      );

      if (!response.ok) {
        throw new Error(
          `Ошибка API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("StrapiAPI: Ошибка загрузки документов:", error);
      return [];
    }
  }

  async getDocumentationsByCategory(category) {
    this.init();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/documentations?filters[category][$eq]=${category}&populate=*&sort=createdAt:desc`
      );

      if (!response.ok) {
        throw new Error(
          `Ошибка API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(
        `StrapiAPI: Ошибка загрузки документов категории ${category}:`,
        error
      );
      return [];
    }
  }

  getImageUrl(imageAttributes) {
    if (!imageAttributes) return "";

    if (imageAttributes.url) {
      if (imageAttributes.url.startsWith("/")) {
        return `${this.baseUrl}${imageAttributes.url}`;
      }
      if (imageAttributes.url.startsWith("http")) {
        return imageAttributes.url;
      }
      return `${this.baseUrl}${imageAttributes.url}`;
    }

    if (imageAttributes.formats) {
      if (imageAttributes.formats.large) {
        return `${this.baseUrl}${imageAttributes.formats.large.url}`;
      }
      if (imageAttributes.formats.medium) {
        return `${this.baseUrl}${imageAttributes.formats.medium.url}`;
      }
      if (imageAttributes.formats.small) {
        return `${this.baseUrl}${imageAttributes.formats.small.url}`;
      }
      if (imageAttributes.formats.thumbnail) {
        return `${this.baseUrl}${imageAttributes.formats.thumbnail.url}`;
      }
    }

    return "";
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  window.strapiAPI = new StrapiAPI();
});