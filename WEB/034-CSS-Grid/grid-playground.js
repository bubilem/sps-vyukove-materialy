/**
 * SPŠ Webové technologie - Téma 034: CSS Grid a 2D rozvržení
 * grid-playground.js - Interaktivní simulátor CSS Gridu a podpora pro snímky
 */

document.addEventListener('DOMContentLoaded', () => {
  initGridPlayground();
  initQuestionHints();
});

function initGridPlayground() {
  const container = document.getElementById('gbTargetGrid');
  if (!container) return;

  const presetSelect = document.getElementById('gbPreset');
  const colsSelect = document.getElementById('gbColumns');
  const rowsSelect = document.getElementById('gbRows');
  const gapSelect = document.getElementById('gbGap');
  const codeOutput = document.getElementById('gbGeneratedCss');
  const copyBtn = document.getElementById('gbCopyCodeBtn');

  const presets = {
    'holy-grail': {
      columns: '180px 1fr 180px',
      rows: '60px 1fr 60px',
      gap: '12px',
      items: [
        { name: 'Header', area: 'header', style: 'grid-column: 1 / -1;', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
        { name: 'Nav (Menu)', area: 'nav', style: 'grid-row: 2; grid-column: 1;', bg: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
        { name: 'Main Content', area: 'main', style: 'grid-row: 2; grid-column: 2;', bg: 'linear-gradient(135deg, #10b981, #059669)' },
        { name: 'Aside', area: 'aside', style: 'grid-row: 2; grid-column: 3;', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { name: 'Footer', area: 'footer', style: 'grid-column: 1 / -1;', bg: 'linear-gradient(135deg, #64748b, #475569)' }
      ],
      cssCustom: `.container {\n  display: grid;\n  grid-template-columns: 180px 1fr 180px;\n  grid-template-rows: 60px 1fr 60px;\n  gap: 12px;\n}\n\n.header { grid-column: 1 / -1; }\n.footer { grid-column: 1 / -1; }`
    },
    'autofit-cards': {
      columns: 'repeat(auto-fit, minmax(140px, 1fr))',
      rows: 'auto',
      gap: '16px',
      items: [
        { name: 'Karta 1', area: '', style: '', bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
        { name: 'Karta 2', area: '', style: '', bg: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
        { name: 'Karta 3', area: '', style: '', bg: 'linear-gradient(135deg, #10b981, #059669)' },
        { name: 'Karta 4', area: '', style: '', bg: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
        { name: 'Karta 5', area: '', style: '', bg: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
        { name: 'Karta 6', area: '', style: '', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' }
      ],
      cssCustom: `.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n  gap: 16px;\n}`
    },
    'bento-grid': {
      columns: 'repeat(3, 1fr)',
      rows: 'repeat(3, 80px)',
      gap: '12px',
      items: [
        { name: 'Hero Feature', area: '1', style: 'grid-column: span 2; grid-row: span 2;', bg: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
        { name: 'Status', area: '2', style: '', bg: 'linear-gradient(135deg, #10b981, #059669)' },
        { name: 'Statistika', area: '3', style: '', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
        { name: 'Uživatelé', area: '4', style: '', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { name: 'Graf integrace', area: '5', style: 'grid-column: span 2;', bg: 'linear-gradient(135deg, #f43f5e, #e11d48)' }
      ],
      cssCustom: `.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: repeat(3, 80px);\n  gap: 12px;\n}\n\n.item-1 { grid-column: span 2; grid-row: span 2; }\n.item-5 { grid-column: span 2; }`
    },
    'simple-3col': {
      columns: 'repeat(3, 1fr)',
      rows: 'auto',
      gap: '16px',
      items: [
        { name: 'Sloupec 1', area: '', style: '', bg: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
        { name: 'Sloupec 2', area: '', style: '', bg: 'linear-gradient(135deg, #10b981, #059669)' },
        { name: 'Sloupec 3', area: '', style: '', bg: 'linear-gradient(135deg, #f97316, #ea580c)' }
      ],
      cssCustom: `.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}`
    }
  };

  function applyPreset(key) {
    const config = presets[key];
    if (!config) return;

    if (colsSelect) colsSelect.value = config.columns;
    if (rowsSelect) rowsSelect.value = config.rows;
    if (gapSelect) gapSelect.value = config.gap;

    renderGrid(config);
  }

  function renderGrid(config) {
    container.innerHTML = '';
    container.style.gridTemplateColumns = config.columns;
    container.style.gridTemplateRows = config.rows;
    container.style.gap = config.gap;

    config.items.forEach(it => {
      const cell = document.createElement('div');
      cell.className = 'gb-item';
      cell.style.background = it.bg;
      if (it.style) {
        cell.style.cssText += it.style;
      }

      cell.innerHTML = `
        <span class="gb-item-title">${it.name}</span>
        ${it.style ? `<span class="gb-item-area">${it.style}</span>` : ''}
      `;
      container.appendChild(cell);
    });

    if (codeOutput) {
      codeOutput.textContent = config.cssCustom;
    }
  }

  function onCustomChange() {
    container.style.gridTemplateColumns = colsSelect.value;
    container.style.gridTemplateRows = rowsSelect.value;
    container.style.gap = gapSelect.value;

    let css = `.container {\n  display: grid;\n  grid-template-columns: ${colsSelect.value};\n`;
    if (rowsSelect.value !== 'auto') {
      css += `  grid-template-rows: ${rowsSelect.value};\n`;
    }
    if (gapSelect.value !== '0px') {
      css += `  gap: ${gapSelect.value};\n`;
    }
    css += `}`;

    if (codeOutput) {
      codeOutput.textContent = css;
    }
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      applyPreset(e.target.value);
    });
  }

  [colsSelect, rowsSelect, gapSelect].forEach(sel => {
    if (sel) {
      sel.addEventListener('change', onCustomChange);
    }
  });

  if (copyBtn && codeOutput) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeOutput.textContent).then(() => {
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = 'Zkopírováno!';
        setTimeout(() => { copyBtn.innerHTML = orig; }, 1500);
      });
    });
  }

  // Výchozí inicializace
  applyPreset('holy-grail');
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
