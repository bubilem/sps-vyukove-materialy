/**
 * SPŠ Webové technologie - Téma 031: CSS selektory a pseudotřídy
 * Lokální interaktivní engine pro testování selektorů a výpočet specificity
 */

document.addEventListener('DOMContentLoaded', () => {
  initSelectorPlayground();
  initQuestionHints();
});

/* ==========================================================================
   1. Interaktivní Selector Tester & Specificita
   ========================================================================== */
function initSelectorPlayground() {
  const input = document.getElementById('selectorInput');
  const sandbox = document.getElementById('domSandbox');
  const countEl = document.getElementById('matchCount');
  const specInline = document.getElementById('specInline');
  const specId = document.getElementById('specId');
  const specClass = document.getElementById('specClass');
  const specElement = document.getElementById('specElement');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const errorMsg = document.getElementById('selectorError');

  if (!input || !sandbox) return;

  function calculateSpecificity(selector) {
    let ids = 0, classes = 0, elements = 0;

    // Odstranění řetězců v uvozovkách (atributy)
    let clean = selector.trim();

    // Počet ID (#id)
    const idMatches = clean.match(/#[a-zA-Z0-9_-]+/g);
    if (idMatches) ids += idMatches.length;

    // Počet tříd (.class), atributů ([attr]) a pseudotříd (:pseudo) - vyjma :not(), :is(), :where()
    const classMatches = clean.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) classes += classMatches.length;

    const attrMatches = clean.match(/\[[^\]]+\]/g);
    if (attrMatches) classes += attrMatches.length;

    // Pseudotřídy (začínají jednou dvojtečkou a nejsou pseudoelementy ::)
    const pseudoClassMatches = clean.match(/(?<!:):[a-zA-Z-]+(\([^)]*\))?/g);
    if (pseudoClassMatches) {
      pseudoClassMatches.forEach(p => {
        if (!p.startsWith('::') && !p.startsWith(':where')) {
          classes += 1;
        }
      });
    }

    // Pseudoelementy (začínají ::)
    const pseudoElemMatches = clean.match(/::[a-zA-Z-]+/g);
    if (pseudoElemMatches) elements += pseudoElemMatches.length;

    // HTML elementy (tagy)
    // Zjednodušená aproximace pro výuku SPŠ
    const tagMatches = clean.match(/(^|[\s>+~])([a-zA-Z0-9]+)/g);
    if (tagMatches) {
      tagMatches.forEach(t => {
        const cleanTag = t.replace(/[\s>+~]/g, '');
        if (cleanTag && !cleanTag.startsWith('#') && !cleanTag.startsWith('.')) {
          elements += 1;
        }
      });
    }

    return { inline: 0, id: ids, class: classes, element: elements };
  }

  function applySelector(selectorStr) {
    if (errorMsg) errorMsg.textContent = '';
    
    // Odstranění předchozích zvýraznění
    sandbox.querySelectorAll('.match-highlight').forEach(el => {
      el.classList.remove('match-highlight');
    });

    const sel = selectorStr.trim();
    if (!sel) {
      if (countEl) countEl.textContent = '0 prvků';
      updateSpecDisplay(0, 0, 0, 0);
      return;
    }

    try {
      // Vyhledání prvků v sandboxu
      const matches = sandbox.querySelectorAll(sel);
      matches.forEach(el => {
        el.classList.add('match-highlight');
      });

      if (countEl) {
        countEl.textContent = `${matches.length} ${matches.length === 1 ? 'prvek' : (matches.length >= 2 && matches.length <= 4 ? 'prvky' : 'prvků')}`;
      }

      const spec = calculateSpecificity(sel);
      updateSpecDisplay(spec.inline, spec.id, spec.class, spec.element);

    } catch (e) {
      if (countEl) countEl.textContent = 'Chybný selektor';
      if (errorMsg) errorMsg.textContent = 'Neplatná syntaxe CSS selektoru!';
      updateSpecDisplay(0, 0, 0, 0);
    }
  }

  function updateSpecDisplay(inl, id, cls, el) {
    if (specInline) specInline.textContent = inl;
    if (specId) specId.textContent = id;
    if (specClass) specClass.textContent = cls;
    if (specElement) specElement.textContent = el;
  }

  input.addEventListener('input', () => {
    presetBtns.forEach(b => b.classList.remove('active'));
    applySelector(input.value);
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sel = btn.getAttribute('data-selector') || btn.textContent.trim();
      input.value = sel;
      applySelector(sel);
    });
  });

  // Výchozí selektor pro první načtení
  applySelector(input.value || '.karta');
}

/* ==========================================================================
   2. Otázky s rozbalovací nápovědou
   ========================================================================== */
function initQuestionHints() {
  document.querySelectorAll('.question-answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.question-card');
      const hint = card ? card.querySelector('.question-hint') : null;
      if (hint) {
        const isVisible = hint.classList.contains('visible');
        hint.classList.toggle('visible', !isVisible);
        btn.classList.toggle('open', !isVisible);
        btn.innerHTML = isVisible
          ? `<svg class="icon" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Zobrazit odpověď`
          : `<svg class="icon" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> Skrýt odpověď`;
      }
    });
  });
}
