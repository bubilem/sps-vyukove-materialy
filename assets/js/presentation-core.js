/**
 * ==========================================================================
 * SPŠ Výukové materiály - Core Presentation Framework Engine
 * Univerzální prezentační engine pro střední průmyslovou školu (SPŠ)
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // Konstanty pro LocalStorage (primární SPŠ klíč s fallbacky)
  const THEME_STORAGE_KEY = 'sps_presentation_theme';

  // Stav prezentace
  let slides = [];
  let currentSlideIndex = 0;

  // DOM elementy
  let progressBar = null;
  let slideCounter = null;
  let breadcrumbSlide = null;
  let prevBtn = null;
  let nextBtn = null;
  let prevLessonBtn = null;
  let nextLessonBtn = null;
  let themeToggle = null;
  let fsBtn = null;
  let tocBtn = null;
  let tocOverlay = null;
  let tocCloseBtn = null;
  let tocList = null;
  let helpBtn = null;
  let helpModal = null;
  let helpCloseBtn = null;
  let glossaryBtn = null;
  let glossaryModal = null;

  /**
   * Inicializace enginu
   */
  function init() {
    // 1. Vyhledání všech slidů
    slides = Array.from(document.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    // 2. Vyhledání ovládacích prvků (podpora různých ID variant)
    progressBar = document.getElementById('progressBarFill') || document.querySelector('.progress-bar-fill');
    slideCounter = document.getElementById('slideCounter') || document.querySelector('.slide-counter');
    breadcrumbSlide = document.getElementById('breadcrumbSlide') || document.querySelector('.breadcrumb-current');
    prevBtn = document.getElementById('prevSlideBtn') || document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextSlideBtn') || document.getElementById('nextBtn');
    prevLessonBtn = document.getElementById('prevLessonBtn');
    nextLessonBtn = document.getElementById('nextLessonBtn');
    themeToggle = document.getElementById('themeToggleBtn') || document.getElementById('themeToggle');
    fsBtn = document.getElementById('fullscreenBtn') || document.getElementById('fsBtn');
    tocBtn = document.getElementById('tocToggleBtn') || document.getElementById('tocBtn');
    tocOverlay = document.getElementById('tocOverlay') || document.getElementById('tocModal') || document.getElementById('tocDrawer');
    if (tocOverlay && !tocOverlay.querySelector('.toc-drawer')) {
      const drawer = document.createElement('div');
      drawer.className = 'toc-drawer';
      while (tocOverlay.firstChild) {
        drawer.appendChild(tocOverlay.firstChild);
      }
      tocOverlay.appendChild(drawer);
    }
    tocCloseBtn = document.getElementById('tocCloseBtn') || document.getElementById('tocClose');
    tocList = document.getElementById('tocList');
    helpBtn = document.getElementById('helpToggleBtn') || document.getElementById('helpBtn');
    helpModal = document.getElementById('helpModal');
    helpCloseBtn = document.getElementById('helpCloseBtn') || document.getElementById('helpClose');

    // Ensure Help Modal is always populated with pristine UTF-8 Czech text
    ensureHelpModal();

    // Glossary / Slovník (auto-detekce – zobrazí se jen pokud prezentace obsahuje #glossaryModal)
    glossaryModal = document.getElementById('glossaryModal');
    glossaryBtn = document.getElementById('glossaryBtn');
    if (glossaryModal && glossaryBtn) {
      glossaryBtn.style.display = '';
    } else if (glossaryBtn) {
      glossaryBtn.style.display = 'none';
    }

    // 3. Inicializace motivu (Dark / Light)
    initTheme();

    // 4. Detekce počátečního snímku z URL hashe (#slide-N)
    initInitialSlide();

    // 5. Registrace posluchačů událostí
    bindNavigationEvents();
    bindKeyboardEvents();
    bindTouchEvents();
    bindModalEvents();
    bindCopyCodeButtons();

    // 6. Automatické vykreslení matematických vzorců ($...$ a $$...$$)
    renderMathFormulas();

    // 7. Vygenerování dynamické osnovy
    buildTableOfContents();

    // 8. Zobrazení výchozího slidu
    showSlide(currentSlideIndex, false);
  }

  /**
   * Správa témat a LocalStorage
   */
  const sunIcon = `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) ||
                        localStorage.getItem('sps_theme') ||
                        localStorage.getItem('vos_presentation_theme') ||
                        localStorage.getItem('vos_theme') ||
                        'dark';
    applyTheme(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        localStorage.setItem('sps_theme', nextTheme);
      });
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      themeToggle.setAttribute('title', theme === 'dark' ? 'Přepnout na světlý motiv' : 'Přepnout na tmavý motiv');
    }
  }

  /**
   * Detekce počátečního snímku z hashe
   */
  function initInitialSlide() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const parsedNum = parseInt(hash.replace('#slide-', ''), 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= slides.length) {
        currentSlideIndex = parsedNum - 1;
      }
    }
  }

  /**
   * Zobrazení konkrétního snímku
   */
  function showSlide(index, updateHash = true) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;

    currentSlideIndex = index;

    // Aktualizace tříd active
    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
        slide.scrollTop = 0; // reset posunu při dlouhém obsahu
      } else {
        slide.classList.remove('active');
      }
    });

    // Aktualizace počítadla
    if (slideCounter) {
      slideCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    }

    // Dynamická aktualizace drobečkové navigace (SPŠ breadcrumb)
    if (breadcrumbSlide) {
      const currentSlide = slides[currentSlideIndex];
      const slideTitle = currentSlide ? (currentSlide.getAttribute('data-title') || '') : '';
      breadcrumbSlide.textContent = `Snímek ${currentSlideIndex + 1}`;
      if (slideTitle) {
        breadcrumbSlide.setAttribute('title', `${currentSlideIndex + 1}. ${slideTitle}`);
      }
    }

    // Aktualizace horní lišty průběhu
    if (progressBar) {
      const pct = slides.length > 1 ? (currentSlideIndex / (slides.length - 1)) * 100 : 100;
      progressBar.style.width = `${pct}%`;
    }

    // Aktualizace stavu tlačítek
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSlideIndex === slides.length - 1;

    // Aktualizace URL hashe bez posunu stránky
    if (updateHash) {
      history.replaceState(null, '', `#slide-${currentSlideIndex + 1}`);
    }

    // Aktualizace aktivní položky v TOC
    updateTocActiveItem();

    // Dynamické dopočtení vzorců na aktivním snímku
    if (slides[currentSlideIndex]) {
      renderMathFormulas(slides[currentSlideIndex]);
    }
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      showSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      showSlide(currentSlideIndex - 1);
    }
  }

  function goToPrevLesson() {
    if (prevLessonBtn && !prevLessonBtn.classList.contains('disabled')) {
      const href = prevLessonBtn.getAttribute('href');
      if (href && href !== '#') {
        window.location.href = href;
      }
    }
  }

  function goToNextLesson() {
    if (nextLessonBtn && !nextLessonBtn.classList.contains('disabled')) {
      const href = nextLessonBtn.getAttribute('href');
      if (href && href !== '#') {
        window.location.href = href;
      }
    }
  }

  /**
   * Obsluha tlačítek v ovládací liště
   */
  function bindNavigationEvents() {
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); });

    // Ošetření odkazů na předchozí / další lekci pokud jsou zakázané
    if (prevLessonBtn) {
      prevLessonBtn.addEventListener('click', (e) => {
        if (prevLessonBtn.classList.contains('disabled') || prevLessonBtn.getAttribute('href') === '#') {
          e.preventDefault();
        }
      });
    }
    if (nextLessonBtn) {
      nextLessonBtn.addEventListener('click', (e) => {
        if (nextLessonBtn.classList.contains('disabled') || nextLessonBtn.getAttribute('href') === '#') {
          e.preventDefault();
        }
      });
    }

    // Klik na počítadlo otevře osnovu
    if (slideCounter) {
      slideCounter.addEventListener('click', toggleToc);
    }

    // Fullscreen tlačítko
    if (fsBtn) {
      fsBtn.addEventListener('click', toggleFullscreen);
    }

    // Změna hashe zvenku (historie zpět/vpřed)
    window.addEventListener('hashchange', () => {
      initInitialSlide();
      showSlide(currentSlideIndex, false);
    });
  }

  /**
   * Klávesové zkratky
   */
  function bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      // Ignorovat, pokud uživatel píše do inputu
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Zavření modálů přes Escape nebo opětovné stisknutí jejich zkratky
      if (e.key === 'Escape') {
        closeAllModals();
        return;
      }
      if (e.key === '?' && helpModal && helpModal.classList.contains('active')) {
        e.preventDefault();
        closeAllModals();
        return;
      }
      if ((e.key === 'g' || e.key === 'G') && glossaryModal && glossaryModal.classList.contains('active')) {
        e.preventDefault();
        closeAllModals();
        return;
      }
      if ((e.key === 'm' || e.key === 'M' || e.key === 'o' || e.key === 'O') && tocOverlay && tocOverlay.classList.contains('active')) {
        e.preventDefault();
        closeAllModals();
        return;
      }

      // Pokud je aktivní modál, neprovádět další klávesové akce
      if (isAnyModalOpen()) return;

      // Přechod mezi tématy / lekcemi v rámci modulu
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextLesson();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevLesson();
        return;
      }
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        goToNextLesson();
        return;
      }
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        goToPrevLesson();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          showSlide(0);
          break;
        case 'End':
          e.preventDefault();
          showSlide(slides.length - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          if (themeToggle) themeToggle.click();
          break;
        case 'm':
        case 'M':
        case 'o':
        case 'O':
          e.preventDefault();
          toggleToc();
          break;
        case '?':
          e.preventDefault();
          toggleHelp();
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          toggleGlossary();
          break;
      }
    });
  }

  /**
   * Dotyková gesta (Swipe pro mobily a tablety)
   */
  function bindTouchEvents() {
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (isAnyModalOpen()) return;

      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });
  }

  /**
   * Fullscreen režim
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  /**
   * Modální okna (TOC & Help)
   */
  function bindModalEvents() {
    if (tocBtn) tocBtn.addEventListener('click', toggleToc);
    if (tocCloseBtn) tocCloseBtn.addEventListener('click', closeAllModals);

    if (helpBtn) helpBtn.addEventListener('click', toggleHelp);
    if (helpCloseBtn) helpCloseBtn.addEventListener('click', closeAllModals);

    // Zavření klikem na overlay mimo dialog
    if (tocOverlay) {
      tocOverlay.addEventListener('click', (e) => {
        if (e.target === tocOverlay) closeAllModals();
      });
    }
    if (helpModal) {
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) closeAllModals();
      });
    }
  }

  function isAnyModalOpen() {
    return (tocOverlay && tocOverlay.classList.contains('active')) ||
           (helpModal && helpModal.classList.contains('active')) ||
           (glossaryModal && glossaryModal.classList.contains('active'));
  }

  function closeAllModals() {
    if (tocOverlay) {
      tocOverlay.classList.remove('active');
      tocOverlay.setAttribute('aria-hidden', 'true');
    }
    if (helpModal) {
      helpModal.classList.remove('active');
      helpModal.setAttribute('aria-hidden', 'true');
    }
    if (glossaryModal) {
      glossaryModal.classList.remove('active');
      if (glossaryModal.setAttribute) glossaryModal.setAttribute('aria-hidden', 'true');
    }
  }

  function toggleToc() {
    if (!tocOverlay) return;
    const isActive = tocOverlay.classList.contains('active');
    closeAllModals();
    if (!isActive) {
      tocOverlay.classList.add('active');
      tocOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Garantuje existenci a 100% korektní UTF-8 obsah nápovědy klávesových zkratek
   */
  function ensureHelpModal() {
    helpModal = document.getElementById('helpModal');
    if (!helpModal) {
      helpModal = document.createElement('div');
      helpModal.className = 'modal-overlay';
      helpModal.id = 'helpModal';
      document.body.appendChild(helpModal);
    }
    helpModal.setAttribute('aria-hidden', 'true');
    helpModal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>
            <svg class="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="10" y1="12" x2="10.01" y2="12"></line><line x1="14" y1="12" x2="14.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="8" y1="16" x2="16" y2="16"></line></svg>
            Klávesové zkratky
          </h3>
          <button class="toc-close" id="helpCloseBtn" title="Zavřít nápovědu">
            <svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="shortcut-row">
            <span>Další snímek</span>
            <div><span class="key-badge">Šipka vpravo</span> <span class="key-badge">Mezerník</span></div>
          </div>
          <div class="shortcut-row">
            <span>Předchozí snímek</span>
            <div><span class="key-badge">Šipka vlevo</span> <span class="key-badge">Backspace</span></div>
          </div>
          <div class="shortcut-row">
            <span>Další téma (prezentace)</span>
            <div><span class="key-badge">Ctrl + Šipka vpravo</span> <span class="key-badge">Shift + N</span></div>
          </div>
          <div class="shortcut-row">
            <span>Předchozí téma (prezentace)</span>
            <div><span class="key-badge">Ctrl + Šipka vlevo</span> <span class="key-badge">Shift + P</span></div>
          </div>
          <div class="shortcut-row">
            <span>První / Poslední snímek</span>
            <div><span class="key-badge">Home</span> / <span class="key-badge">End</span></div>
          </div>
          <div class="shortcut-row">
            <span>Celá obrazovka</span>
            <span class="key-badge">F</span>
          </div>
          <div class="shortcut-row">
            <span>Osnova / Obsah tématu</span>
            <div><span class="key-badge">M</span> nebo <span class="key-badge">O</span></div>
          </div>
          <div class="shortcut-row">
            <span>Slovník pojmů</span>
            <span class="key-badge">G</span>
          </div>
          <div class="shortcut-row">
            <span>Přepnout tmavý / světlý motiv</span>
            <span class="key-badge">T</span>
          </div>
          <div class="shortcut-row">
            <span>Nápověda (tento dialog)</span>
            <span class="key-badge">?</span>
          </div>
        </div>
      </div>
    `;
    helpCloseBtn = document.getElementById('helpCloseBtn');
  }

  function toggleHelp() {
    if (!helpModal) return;
    const isActive = helpModal.classList.contains('active');
    closeAllModals();
    if (!isActive) {
      helpModal.classList.add('active');
      helpModal.setAttribute('aria-hidden', 'false');
    }
  }

  function toggleGlossary() {
    if (!glossaryModal) return;
    const isActive = glossaryModal.classList.contains('active');
    closeAllModals();
    if (!isActive) {
      glossaryModal.classList.add('active');
      if (glossaryModal.setAttribute) glossaryModal.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Generátor osnovy prezentace (TOC)
   */
  function buildTableOfContents() {
    if (!tocList) return;
    tocList.innerHTML = '';

    slides.forEach((slide, idx) => {
      let title = slide.getAttribute('data-title');
      if (!title) {
        const heading = slide.querySelector('h1, h2, .hero-title, .slide-title');
        title = heading ? heading.textContent.trim() : `Snímek ${idx + 1}`;
      }

      const item = document.createElement('div');
      item.className = 'toc-item';
      item.innerHTML = `<span class="toc-item-num">${String(idx + 1).padStart(2, '0')}</span> <span>${title}</span>`;
      item.addEventListener('click', () => {
        showSlide(idx);
        closeAllModals();
      });

      tocList.appendChild(item);
    });

    updateTocActiveItem();
  }

  function updateTocActiveItem() {
    if (!tocList) return;
    const items = tocList.querySelectorAll('.toc-item, .toc-item-btn');
    items.forEach((item, idx) => {
      if (idx === currentSlideIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Kopírování kódu do schránky (.btn-copy)
   */
  function bindCopyCodeButtons() {
    document.querySelectorAll('.btn-copy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const box = btn.closest('.code-box, .code-wrapper');
        if (!box) return;
        const codeElement = box.querySelector('pre code, pre');
        if (!codeElement) return;

        const textToCopy = codeElement.textContent;

        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Zkopírováno</span>
          `;
          btn.style.borderColor = 'var(--accent-emerald)';
          btn.style.color = 'var(--accent-emerald)';

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 2000);
        } catch (err) {
          console.error('Chyba při kopírování do schránky:', err);
        }
      });
    });
  }

  /**
   * ==========================================================================
   * Matematické vzorce a notace (100% Offline, Native HTML & Typography)
   * Automatický převod LaTeX syntaxe $...$ a $$...$$ do formátovaných vzorců
   * ==========================================================================
   */
  function renderMathFormulas(rootElement) {
    let elements = [];
    if (rootElement) {
      elements = [rootElement];
    } else {
      elements = Array.from(document.querySelectorAll('.slide'));
    }
    if (!elements.length) return;

    elements.forEach((slide) => {
      const walker = document.createTreeWalker(
        slide,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toUpperCase();
            if (['PRE', 'CODE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'SVG', 'BUTTON'].includes(tag) ||
                parent.closest('pre, code, script, style, textarea, svg, .btn-copy, .formula, .formula-inline, .formula-box, .math-inline, .math-display')) {
              return NodeFilter.FILTER_REJECT;
            }
            if (node.nodeValue.includes('$')) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        },
        false
      );

      const nodesToProcess = [];
      while (walker.nextNode()) {
        nodesToProcess.push(walker.currentNode);
      }

      nodesToProcess.forEach((textNode) => {
        const text = textNode.nodeValue;
        if (!text || !text.includes('$')) return;

        let hasChanges = false;
        let newHtml = text;

        // 1. Blokové vzorce: $$...$$
        if (newHtml.includes('$$')) {
          newHtml = newHtml.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
            hasChanges = true;
            return '<div class="formula-display" role="math"><span class="formula-main">' + renderLatexExpression(math) + '</span></div>';
          });
        }

        // 2. Řádkové vzorce: $...$
        if (newHtml.includes('$')) {
          newHtml = newHtml.replace(/\$([^$\n]+?)\$/g, (fullMatch, math) => {
            const trimmed = math.trim();
            if (!isLikelyMath(trimmed)) return fullMatch;
            hasChanges = true;
            return formatInlineMath(trimmed);
          });
        }

        if (hasChanges && textNode.parentNode) {
          const temp = document.createElement('span');
          temp.innerHTML = newHtml;
          const parent = textNode.parentNode;
          while (temp.firstChild) {
            parent.insertBefore(temp.firstChild, textNode);
          }
          parent.removeChild(textNode);
        }
      });
    });
  }

  function isLikelyMath(str) {
    if (!str || str.length === 0) return false;
    // Úhly a stupně (0^\circ, 180^\circ apod.)
    if (/^\d+(\.\d+)?\s*\^?\s*\\circ$/.test(str) || (str.includes('\\circ') && /[\d,\s]/.test(str))) return true;
    // LaTeX značky a funkce
    if (/\\(text|mathbf|frac|sqrt|wedge|vee|neg|varepsilon|alpha|beta|gamma|delta|Delta|lambda|Lambda|theta|omega|Omega|vec|mu|pi|approx|times|cdot|le|ge|ne|to|rightarrow|leftarrow|in|pm|circ|log|ln|sin|cos|tan|oplus|bar|overline|Rightarrow|Leftrightarrow|implies|iff|equiv|infty)\b/.test(str)) return true;
    // Operátory a relace
    if (/(=|<|>|&lt;|&gt;|\+|-|\/|\*|&times;|&approx;|&le;|&ge;|\^|_|\[|\])/.test(str)) return true;
    // Výpočetní složitost O(1), O(log N)
    if (/^O\(.+\)$/.test(str)) return true;
    // Indexy nebo mocniny (P_0, C^0 apod.)
    if (/\^\{?[0-9a-zA-Z]+\}?|_{?[0-9a-zA-Z]+\}?/.test(str)) return true;
    // Samostatné proměnné, čísla nebo seznamy proměnných ($f$, $t$, $n$, $X$, $Y$, $0$, $1$, $X, Y$)
    if (/^[a-zA-Z0-9,\s\-]+$/.test(str) && str.length <= 12) return true;
    return false;
  }

  function formatInlineMath(str) {
    // Speciální zjednodušení pro čisté stupně (např. 0^\circ -> 0°, 180^\circ -> 180°)
    if (/^(\d+)\s*\^?\s*\\circ$/.test(str)) {
      return str.replace(/\^?\s*\\circ/, '') + '&deg;';
    }
    if (/^[\d,\s\^\\circ]+$/.test(str) && str.includes('\\circ')) {
      return str.replace(/\^?\s*\\circ/g, '&deg;');
    }
    return '<span class="formula-inline" role="math">' + renderLatexExpression(str) + '</span>';
  }

  function renderLatexExpression(latex) {
    let s = latex.trim();

    // 0. Odstranění escape u složených závorek \{ \} a české desetinné čárky {,}
    s = s.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
    s = s.replace(/\{,\}/g, ',');

    // 1. Textové bloky: \text{...} a tučné \mathbf{...}
    const textStore = [];
    s = s.replace(/\\mathbf\{([^}]*)\}/g, (_, txt) => {
      const idx = textStore.length;
      textStore.push('<strong class="formula-text">' + escapeHtml(txt) + '</strong>');
      return 'XXTXT' + idx + 'XX';
    });
    s = s.replace(/\\text\{([^}]*)\}/g, (_, txt) => {
      const idx = textStore.length;
      textStore.push('<span class="formula-text">' + escapeHtml(txt) + '</span>');
      return 'XXTXT' + idx + 'XX';
    });

    // 2. Pruh nad písmeny (negace / komplement): \bar{A}, \overline{A}, \bar A
    s = s.replace(/\\(bar|overline)\{([^}]+)\}/g, '<span class="formula-overline">$2</span>');
    s = s.replace(/\\bar\s*([a-zA-Z])/g, '<span class="formula-overline">$1</span>');

    // 3. Zlomky: \frac{num}{den}
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '<span class="formula-frac"><span class="formula-num">$1</span><span class="formula-den">$2</span></span>');

    // 4. Odmocniny: \sqrt{x}
    s = s.replace(/\\sqrt\{([^}]+)\}/g, '<span class="formula-sqrt"><span class="formula-surd">&radic;</span><span class="formula-radicand">$1</span></span>');

    // 4b. Vektory: \vec{E}
    s = s.replace(/\\vec\{([^}]+)\}/g, '<span class="formula-vec">$1&#x20D7;</span>');

    // 5. Symboly, logika a řecká abeceda
    const symbols = [
      [/\\implies/g, '&rArr;'],
      [/\\iff/g, '&hArr;'],
      [/\\qquad/g, '&emsp;&emsp;'],
      [/\\quad/g, '&emsp;'],
      [/\\lambda/g, '&lambda;'],
      [/\\Lambda/g, '&Lambda;'],
      [/\\theta/g, '&theta;'],
      [/\\omega/g, '&omega;'],
      [/\\Omega/g, '&Omega;'],
      [/\\wedge/g, '&and;'],
      [/\\vee/g, '&or;'],
      [/\\neg/g, '&not;'],
      [/\\varepsilon/g, '&epsilon;'],
      [/\\epsilon/g, '&epsilon;'],
      [/\\alpha/g, '&alpha;'],
      [/\\beta/g, '&beta;'],
      [/\\gamma/g, '&gamma;'],
      [/\\delta/g, '&delta;'],
      [/\\Delta/g, '&Delta;'],
      [/\\mu/g, '&mu;'],
      [/\\pi/g, '&pi;'],
      [/\\approx/g, '&approx;'],
      [/\\times/g, '&times;'],
      [/\\cdot/g, '&middot;'],
      [/\\le(q)?\b/g, '&le;'],
      [/\\ge(q)?\b/g, '&ge;'],
      [/\\ne(q)?\b/g, '&ne;'],
      [/\\to\b/g, '&rarr;'],
      [/\\rightarrow\b/g, '&rarr;'],
      [/\\leftarrow\b/g, '&larr;'],
      [/\\infty\b/g, '&infin;'],
      [/\\Rightarrow/g, '⇒'],
      [/\\Leftrightarrow/g, '⇔'],
      [/\\equiv/g, '≡'],
      [/\\in\b/g, '&isin;'],
      [/\\pm\b/g, '&plusmn;'],
      [/\\circ/g, '&deg;'],
      [/\\,/g, '&thinsp;'],
      [/\\log\b/g, '<span class="formula-fn">log</span>'],
      [/\\ln\b/g, '<span class="formula-fn">ln</span>'],
      [/\\sin\b/g, '<span class="formula-fn">sin</span>'],
      [/\\cos\b/g, '<span class="formula-fn">cos</span>'],
      [/\\tan\b/g, '<span class="formula-fn">tan</span>'],
      [/\\oplus/g, '⊕']
    ];

    for (const [re, rep] of symbols) {
      s = s.replace(re, rep);
    }

    // Vyčištění stupňů: ^&deg;
    s = s.replace(/\^\{\s*&deg;\s*\}|\^\s*&deg;/g, '&deg;');

    // Horní a dolní indexy
    s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
    s = s.replace(/\^([0-9a-zA-Z&;]+)/g, '<sup>$1</sup>');
    s = s.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
    s = s.replace(/_([0-9a-zA-Z&;]+)/g, '<sub>$1</sub>');

    // Matematické proměnné: samostatné jedno písmeno (před vložením HTML entit)
    s = s.replace(/(^|[\s=+\-*\/<>()\[\]{},])([a-zA-Z])(?=[\s=+\-*\/<>()\[\]{},]|$)/g, '$1<i>$2</i>');

    // Normalizace mezer kolem operátorů a čárek (zabrání poškození HTML tagů a nevhodnému lámání uvnitř rovnice)
    s = s.replace(/(>|^)([^<]+)(<|$)/g, (_, open, text, close) => {
      let t = text.replace(/\s*([=+]|&middot;|&isin;|&times;|&le;|&ge;|&approx;|&and;|&or;|⊕|⇒|⇔|≡)\s*/g, '&thinsp;$1&thinsp;');
      t = t.replace(/(?<=[0-9a-zA-Z>)]|\s)-(?=[0-9a-zA-Z<(]|\s)/g, '&thinsp;-&thinsp;');
      t = t.replace(/,\s*/g, ',&thinsp;');
      return open + t + close;
    });

    // Obnovení textových bloků
    textStore.forEach((html, i) => {
      s = s.replace('XXTXT' + i + 'XX', html);
    });

    return s.trim();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Spuštění po načtení DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PresentationFramework = {
    showSlide,
    nextSlide,
    prevSlide,
    renderMathFormulas,
    getCurrentIndex: () => currentSlideIndex,
    getTotalSlides: () => slides.length
  };
})();
