/**
 * ==========================================================================
 * Multi-Language Code Switcher (Python, JavaScript, PHP)
 * Výukové materiály SPŠ • Předmět PRG
 * Synchronizované přepínání jazyků se zapamatováním volby v localStorage.
 * 100% Offline Vanilla JS
 * ==========================================================================
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'sps_prg_lang';
  var DEFAULT_LANG = 'python';

  function getSavedLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function saveLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Storage might be blocked or full
    }
  }

  function switchAllCodeTabs(lang) {
    var containers = document.querySelectorAll('.code-tabs-container');
    containers.forEach(function (container) {
      // Update buttons
      var buttons = container.querySelectorAll('.code-tab-btn');
      buttons.forEach(function (btn) {
        if (btn.getAttribute('data-lang') === lang) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });

      // Update panes
      var panes = container.querySelectorAll('.code-tab-pane');
      var matchedPane = false;
      panes.forEach(function (pane) {
        if (pane.getAttribute('data-lang') === lang) {
          pane.classList.add('active');
          matchedPane = true;
        } else {
          pane.classList.remove('active');
        }
      });

      // Fallback if specific language pane doesn't exist in this block
      if (!matchedPane && panes.length > 0) {
        panes[0].classList.add('active');
      }
    });
  }

  function initCodeTabs() {
    var currentLang = getSavedLanguage();

    // Attach click events
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.code-tab-btn');
      if (!btn) return;

      var lang = btn.getAttribute('data-lang');
      if (!lang) return;

      saveLanguage(lang);
      switchAllCodeTabs(lang);
    });

    // Initial activation
    switchAllCodeTabs(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeTabs);
  } else {
    initCodeTabs();
  }

  // Export globally if needed
  window.spsCodeSwitcher = {
    setLanguage: function (lang) {
      saveLanguage(lang);
      switchAllCodeTabs(lang);
    },
    getLanguage: getSavedLanguage
  };
})();
