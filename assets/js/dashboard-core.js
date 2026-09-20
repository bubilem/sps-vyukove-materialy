/**
 * SPŠ Výukové materiály – Dashboard Core Engine
 * Sdílená funkcionalita pro rozcestníky témat a katalog předmětů
 * 100% Offline, Pure Vanilla JS
 */

(function () {
  'use strict';

  // 1. Správa motivu (Dark / Light)
  const themeBtn = document.getElementById('themeToggleBtn');
  const sunIcon = `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function initTheme() {
    const savedTheme = localStorage.getItem('sps_theme') || 
                       localStorage.getItem('sps_presentation_theme') ||
                       localStorage.getItem('vos_theme') || 
                       localStorage.getItem('vos_presentation_theme') ||
                       'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeBtn) {
      themeBtn.innerHTML = savedTheme === 'dark' ? sunIcon : moonIcon;
      themeBtn.setAttribute('title', savedTheme === 'dark' ? 'Přepnout na světlý motiv' : 'Přepnout na tmavý motiv');
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sps_theme', next);
      localStorage.setItem('sps_presentation_theme', next);
      themeBtn.innerHTML = next === 'dark' ? sunIcon : moonIcon;
      themeBtn.setAttribute('title', next === 'dark' ? 'Přepnout na světlý motiv' : 'Přepnout na tmavý motiv');
    });
  }

  // 2. Klikatelnost celých dlaždic lekcí (.lesson-card)
  // Sjednocení navigace: kliknutí kamkoliv na dlaždici spustí prezentaci
  function initClickableCards() {
    const lessonCards = document.querySelectorAll('.lesson-card');
    lessonCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Pokud uživatel kliknul přímo na odkaz nebo tlačítko, ponecháme výchozí chování
        if (e.target.closest('a, button')) return;
        
        // Zkontrolovat, zda uživatel neprovádí výběr textu
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        const launchLink = card.querySelector('.btn-launch-lesson, a[href$=".html"]');
        if (launchLink && launchLink.href) {
          window.location.href = launchLink.href;
        }
      });
    });
  }

  // 3. Živé vyhledávání v lekcích
  function initLiveSearch() {
    const searchInput = document.getElementById('lessonSearch') || document.getElementById('searchInput');
    const lessonCards = document.querySelectorAll('.lesson-card');
    if (!searchInput || lessonCards.length === 0) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      lessonCards.forEach(card => {
        const keywords = card.getAttribute('data-keywords') || '';
        const text = (card.textContent + ' ' + keywords).toLowerCase();
        if (!query || text.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Inicializace po načtení DOMu
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initClickableCards();
      initLiveSearch();
    });
  } else {
    initTheme();
    initClickableCards();
    initLiveSearch();
  }

})();
