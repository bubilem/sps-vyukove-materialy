/**
 * ==========================================================================
 * SPŠ Webové technologie - Téma 021: Moderní HTML5 a sémantika webu
 * Interaktivní engine:
 * 1. Div Soup vs Moderní HTML5 sémantika (interaktivní přepínač)
 * 2. Kontrolní otázky s nápovědou
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. PŘEPÍNAČ: DIV SOUP (2005) VS SÉMANTIKA HTML5 (2026)
     ======================================================================== */
  const soupBtns = document.querySelectorAll('.soup-btn');
  const codeBody = document.getElementById('comparisonCodeBody');
  const codeTitle = document.getElementById('comparisonCodeTitle');
  const noteBox = document.getElementById('comparisonNote');

  // Prvky wireframu
  const wfHeader = document.getElementById('wfHeader');
  const wfNav = document.getElementById('wfNav');
  const wfMainHeader = document.getElementById('wfMainHeader');
  const wfArticle = document.getElementById('wfArticle');
  const wfAside = document.getElementById('wfAside');
  const wfFooter = document.getElementById('wfFooter');

  const divSoupCode = `<span class="code-comment">&lt;!-- MINULOST (2005): "Div Soup" - nulový význam pro vyhledávače a čtečky --&gt;</span>
<span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">id</span>=<span class="attr-val">"header"</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">h1</span><span class="tag-bracket">&gt;</span><span class="code-content">Můj Technologický Blog</span><span class="tag-bracket">&lt;/</span><span class="tag-name">h1</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>

<span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">id</span>=<span class="attr-val">"nav"</span> <span class="attr-name">class</span>=<span class="attr-val">"menu-bar"</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">ul</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">li</span><span class="tag-bracket">&gt;&lt;</span><span class="tag-name">a</span> <span class="attr-name">href</span>=<span class="attr-val">"#"</span><span class="tag-bracket">&gt;</span><span class="code-content">Domů</span><span class="tag-bracket">&lt;/</span><span class="tag-name">a</span><span class="tag-bracket">&gt;&lt;/</span><span class="tag-name">li</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">li</span><span class="tag-bracket">&gt;&lt;</span><span class="tag-name">a</span> <span class="attr-name">href</span>=<span class="attr-val">"#"</span><span class="tag-bracket">&gt;</span><span class="code-content">Články</span><span class="tag-bracket">&lt;/</span><span class="tag-name">a</span><span class="tag-bracket">&gt;&lt;/</span><span class="tag-name">li</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;/</span><span class="tag-name">ul</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>

<span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">id</span>=<span class="attr-val">"content-wrapper"</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">id</span>=<span class="attr-val">"main-col"</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">class</span>=<span class="attr-val">"post-item"</span><span class="tag-bracket">&gt;</span>
      <span class="tag-bracket">&lt;</span><span class="tag-name">h2</span><span class="tag-bracket">&gt;</span><span class="code-content">Představení procesorů RISC-V</span><span class="tag-bracket">&lt;/</span><span class="tag-name">h2</span><span class="tag-bracket">&gt;</span>
      <span class="tag-bracket">&lt;</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span><span class="code-content">Text příspěvku...</span><span class="tag-bracket">&lt;/</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">id</span>=<span class="attr-val">"sidebar"</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">h3</span><span class="tag-bracket">&gt;</span><span class="code-content">O autorovi</span><span class="tag-bracket">&lt;/</span><span class="tag-name">h3</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>

<span class="tag-bracket">&lt;</span><span class="tag-name">div</span> <span class="attr-name">id</span>=<span class="attr-val">"footer"</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span><span class="code-content">&copy; 2005 SPŠ</span><span class="tag-bracket">&lt;/</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">div</span><span class="tag-bracket">&gt;</span>`;

  const html5Code = `<span class="code-comment">&lt;!-- SOUČASNOST: Čistý sémantický HTML5 kód --&gt;</span>
<span class="tag-bracket">&lt;</span><span class="tag-name">header</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">h1</span><span class="tag-bracket">&gt;</span><span class="code-content">Můj Technologický Blog</span><span class="tag-bracket">&lt;/</span><span class="tag-name">h1</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">header</span><span class="tag-bracket">&gt;</span>

<span class="tag-bracket">&lt;</span><span class="tag-name">nav</span> <span class="attr-name">aria-label</span>=<span class="attr-val">"Hlavní navigace"</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">ul</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">li</span><span class="tag-bracket">&gt;&lt;</span><span class="tag-name">a</span> <span class="attr-name">href</span>=<span class="attr-val">"#"</span><span class="tag-bracket">&gt;</span><span class="code-content">Domů</span><span class="tag-bracket">&lt;/</span><span class="tag-name">a</span><span class="tag-bracket">&gt;&lt;/</span><span class="tag-name">li</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">li</span><span class="tag-bracket">&gt;&lt;</span><span class="tag-name">a</span> <span class="attr-name">href</span>=<span class="attr-val">"#"</span><span class="tag-bracket">&gt;</span><span class="code-content">Články</span><span class="tag-bracket">&lt;/</span><span class="tag-name">a</span><span class="tag-bracket">&gt;&lt;/</span><span class="tag-name">li</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;/</span><span class="tag-name">ul</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">nav</span><span class="tag-bracket">&gt;</span>

<span class="tag-bracket">&lt;</span><span class="tag-name">main</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">article</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">h2</span><span class="tag-bracket">&gt;</span><span class="code-content">Představení procesorů RISC-V</span><span class="tag-bracket">&lt;/</span><span class="tag-name">h2</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">time</span> <span class="attr-name">datetime</span>=<span class="attr-val">"2026-09-24"</span><span class="tag-bracket">&gt;</span><span class="code-content">24. září 2026</span><span class="tag-bracket">&lt;/</span><span class="tag-name">time</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span><span class="code-content">Text příspěvku...</span><span class="tag-bracket">&lt;/</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;/</span><span class="tag-name">article</span><span class="tag-bracket">&gt;</span>

  <span class="tag-bracket">&lt;</span><span class="tag-name">aside</span><span class="tag-bracket">&gt;</span>
    <span class="tag-bracket">&lt;</span><span class="tag-name">h3</span><span class="tag-bracket">&gt;</span><span class="code-content">O autorovi</span><span class="tag-bracket">&lt;/</span><span class="tag-name">h3</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;/</span><span class="tag-name">aside</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">main</span><span class="tag-bracket">&gt;</span>

<span class="tag-bracket">&lt;</span><span class="tag-name">footer</span><span class="tag-bracket">&gt;</span>
  <span class="tag-bracket">&lt;</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span><span class="code-content">&copy; 2026 SPŠ</span><span class="tag-bracket">&lt;/</span><span class="tag-name">p</span><span class="tag-bracket">&gt;</span>
<span class="tag-bracket">&lt;/</span><span class="tag-name">footer</span><span class="tag-bracket">&gt;</span>`;

  // Výchozí inicializace obsahu při načtení
  if (codeBody && !codeBody.innerHTML.trim()) {
    codeBody.innerHTML = html5Code;
  }

  soupBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soupBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      if (mode === 'soup') {
        if (codeBody) codeBody.innerHTML = divSoupCode;
        if (codeTitle) codeTitle.textContent = 'layout-2005.html — „Div Soup“ bez sémantiky';
        if (noteBox) {
          noteBox.innerHTML = '<strong style="color: #fb7185;">Nevýhody Div Soup:</strong> Čtečka obrazovky nerozezná navigaci od článku (vše je jen obecný kontejner <code>&lt;div&gt;</code>). Vyhledávač Google neví, který text je podstatný. Vývojáři se ztrácejí v desítkách vnořených divů.';
        }

        // Změna popisků ve wireframu
        if (wfHeader) wfHeader.innerHTML = `<span>Hlavička webu</span> <span class="wf-tag-badge">&lt;div id="header"&gt;</span>`;
        if (wfNav) wfNav.innerHTML = `<span>Menu</span> <span class="wf-tag-badge">&lt;div id="nav"&gt;</span>`;
        if (wfMainHeader) wfMainHeader.innerHTML = `<span>Hlavní sloupec</span> <span class="wf-tag-badge">&lt;div id="main-col"&gt;</span>`;
        if (wfArticle) wfArticle.innerHTML = `<span>Článek</span> <span class="wf-tag-badge">&lt;div class="post"&gt;</span>`;
        if (wfAside) wfAside.innerHTML = `<span>Boční panel</span> <span class="wf-tag-badge">&lt;div id="sidebar"&gt;</span>`;
        if (wfFooter) wfFooter.innerHTML = `<span>Patička</span> <span class="wf-tag-badge">&lt;div id="footer"&gt;</span>`;
      } else {
        if (codeBody) codeBody.innerHTML = html5Code;
        if (codeTitle) codeTitle.textContent = 'layout-2026.html — Sémantický HTML5 standard';
        if (noteBox) {
          noteBox.innerHTML = '<strong style="color: #34d399;">Výhody sémantiky HTML5:</strong> Čtečka obrazovky nabízí rychlé klávesové zkratky pro skok na <code>&lt;main&gt;</code> nebo přeskočení <code>&lt;nav&gt;</code>. Vyhledávač okamžitě indexuje <code>&lt;article&gt;</code> jako klíčový obsah. Safari/Firefox umí zapnout Čtecí režim.';
        }

        // Změna popisků ve wireframu
        if (wfHeader) wfHeader.innerHTML = `<span>Hlavička webu</span> <span class="wf-tag-badge">&lt;header&gt;</span>`;
        if (wfNav) wfNav.innerHTML = `<span>Menu</span> <span class="wf-tag-badge">&lt;nav&gt;</span>`;
        if (wfMainHeader) wfMainHeader.innerHTML = `<span>Hlavní obsah</span> <span class="wf-tag-badge">&lt;main&gt;</span>`;
        if (wfArticle) wfArticle.innerHTML = `<span>Článek</span> <span class="wf-tag-badge">&lt;article&gt;</span>`;
        if (wfAside) wfAside.innerHTML = `<span>Boční doplňky</span> <span class="wf-tag-badge">&lt;aside&gt;</span>`;
        if (wfFooter) wfFooter.innerHTML = `<span>Patička</span> <span class="wf-tag-badge">&lt;footer&gt;</span>`;
      }
    });
  });

  /* ========================================================================
     2. KONTROLNÍ OTÁZKY S NÁPOVĚDOU
     ======================================================================== */
  const qBtns = document.querySelectorAll('.question-answer-btn');
  qBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.question-card');
      if (!card) return;
      const hint = card.querySelector('.question-hint');
      if (!hint) return;

      const isVisible = hint.classList.toggle('visible');
      btn.innerHTML = isVisible
        ? `<svg class="icon" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> Skrýt odpověď`
        : `<svg class="icon" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Zobrazit odpověď`;
    });
  });

});
