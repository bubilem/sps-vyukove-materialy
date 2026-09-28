/**
 * SPŠ Webové technologie - Téma 035: Responzivní web a Media queries
 * rwd-playground.js - Interaktivní simulátor responzivity a akordeon otázek
 */

document.addEventListener('DOMContentLoaded', () => {
  initRwdSimulator();
  initQuestionHints();
});

function initRwdSimulator() {
  const device = document.getElementById('rwdMockDevice');
  if (!device) return;

  const widthSlider = document.getElementById('rwdWidthSlider');
  const widthLabel = document.getElementById('rwdWidthLabel');
  const breakpointBadge = document.getElementById('rwdBreakpointBadge');
  const demoGrid = document.getElementById('rwdDemoGrid');
  const codeSnippet = document.getElementById('rwdActiveCssCode');

  const btnMobile = document.getElementById('rwdBtnMobile');
  const btnTablet = document.getElementById('rwdBtnTablet');
  const btnDesktop = document.getElementById('rwdBtnDesktop');

  function setWidth(px) {
    device.style.width = px + 'px';
    if (widthSlider) widthSlider.value = px;
    if (widthLabel) widthLabel.textContent = px + ' px';

    // Aktualizace stavu podle zlomového bodu
    if (px < 600) {
      if (demoGrid) demoGrid.className = 'rwd-demo-grid mobile';
      if (breakpointBadge) {
        breakpointBadge.textContent = 'Mobil (< 600px)';
        breakpointBadge.style.color = '#f43f5e';
      }
      if (codeSnippet) {
        codeSnippet.textContent = `/* Mobilní zobrazení (Mobile-First základ) */\n.grid {\n  grid-template-columns: 1fr;\n}`;
      }
      setActiveBtn(btnMobile);
    } else if (px < 900) {
      if (demoGrid) demoGrid.className = 'rwd-demo-grid tablet';
      if (breakpointBadge) {
        breakpointBadge.textContent = 'Tablet (600px - 899px)';
        breakpointBadge.style.color = '#f59e0b';
      }
      if (codeSnippet) {
        codeSnippet.textContent = `@media (min-width: 600px) {\n  .grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}`;
      }
      setActiveBtn(btnTablet);
    } else {
      if (demoGrid) demoGrid.className = 'rwd-demo-grid desktop';
      if (breakpointBadge) {
        breakpointBadge.textContent = 'Desktop (>= 900px)';
        breakpointBadge.style.color = '#10b981';
      }
      if (codeSnippet) {
        codeSnippet.textContent = `@media (min-width: 900px) {\n  .grid {\n    grid-template-columns: repeat(3, 1fr);\n  }\n}`;
      }
      setActiveBtn(btnDesktop);
    }
  }

  function setActiveBtn(activeBtn) {
    [btnMobile, btnTablet, btnDesktop].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  if (btnMobile) btnMobile.addEventListener('click', () => setWidth(375));
  if (btnTablet) btnTablet.addEventListener('click', () => setWidth(720));
  if (btnDesktop) btnDesktop.addEventListener('click', () => setWidth(1024));

  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      setWidth(parseInt(e.target.value));
    });
  }

  // Výchozí rozměr
  setWidth(720);
}

function initQuestionHints() {
  const buttons = document.querySelectorAll('.question-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.question-card');
      if (!parent) return;
      const hint = parent.querySelector('.question-hint');
      if (hint) {
        hint.classList.toggle('visible');
        if (hint.classList.contains('visible')) {
          btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="18 15 12 9 6 15"></polyline></svg> Skrýt odpověď`;
        } else {
          btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="6 9 12 15 18 9"></polyline></svg> Zobrazit odpověď`;
        }
      }
    });
  });
}
