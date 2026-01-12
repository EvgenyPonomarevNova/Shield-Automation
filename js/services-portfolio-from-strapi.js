/**
 * Подгрузка работ из Strapi в блок "Наши работы" на сервисных страницах
 * Использует текущую верстку карточек (createPortfolioItem) и текущую кнопку "Показать еще"
 */
(function () {
  const STRAPI_BASE = "https://admin.shield-and-automation.ru";
  const WORKS_URL = `${STRAPI_BASE}/api/works?populate=photos&pagination[pageSize]=200`;

  async function fetchWorksAsPortfolioItems() {
    const res = await fetch(WORKS_URL);
    if (!res.ok) throw new Error(`Strapi works fetch failed: ${res.status}`);
    const json = await res.json();

    const data = json?.data || [];
    return data
      .map((w) => {
        const title = w?.attributes?.title || "";
        const photos = w?.attributes?.photos?.data || [];
        const first = photos[0]?.attributes?.url;

        // если нет фото — пропускаем (иначе карточка будет битая)
        if (!first) return null;

        return {
          id: w.id,
          title,
          image: first.startsWith("http") ? first : STRAPI_BASE + first,
        };
      })
      .filter(Boolean);
  }

  async function boot() {
    // Эти переменные/функции уже есть внутри ваших страниц (инлайн-скрипт).
    // Нам нужно только подменить portfolioItems до initPortfolio().
    if (typeof window.initPortfolio !== "function") return;

    try {
      const items = await fetchWorksAsPortfolioItems();

      // portfolioItems на странице должен быть let/var (не const), чтобы мы могли заменить.
      window.portfolioItems = items;

      // запустить рендер (и лайтбокс/кнопку)
      window.initPortfolio();
    } catch (e) {
      console.error("services-portfolio-from-strapi:", e);
      // если Strapi упал — оставим как есть (или можно скрыть блок/кнопку)
      window.initPortfolio();
    }
  }

  // Важно: у вас есть два события запуска — DOMContentLoaded и componentsLoaded
  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("componentsLoaded", boot);
})();
