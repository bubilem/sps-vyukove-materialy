/**
 * SPŠ Webové technologie - Téma 033: Pozicování a Flexbox
 * flexbox-playground.js - Interaktivní simulátor Flexboxu a podpora pro snímky
 */

document.addEventListener('DOMContentLoaded', () => {
  initFlexboxPlayground();
  initQuestionHints();
  initStackingContextDemo();
});

function initFlexboxPlayground() {
  const container = document.getElementById('fbTargetContainer');
  if (!container) return;

  // Ovládací prvky kontejneru
  const dirSelect = document.getElementById('fbDirection');
  const justifySelect = document.getElementById('fbJustify');
  const alignSelect = document.getElementById('fbAlign');
  const wrapSelect = document.getElementById('fbWrap');
  const gapSelect = document.getElementById('fbGap');

  // Prvky položky
  const itemAlignSelect = document.getElementById('fbItemAlign');
  const itemGrowSelect = document.getElementById('fbItemGrow');
  const itemShrinkSelect = document.getElementById('fbItemShrink');
  const itemBasisSelect = document.getElementById('fbItemBasis');
  const selectedItemLabel = document.getElementById('fbSelectedItemLabel');

  const addItemBtn = document.getElementById('fbAddItemBtn');
  const removeItemBtn = document.getElementById('fbRemoveItemBtn');
  const resetBtn = document.getElementById('fbResetBtn');
  const codeOutput = document.getElementById('fbGeneratedCss');
  const copyBtn = document.getElementById('fbCopyCodeBtn');

  let activeItemIndex = 1; // 1-based index
  let itemCount = 4;

  const itemColors = [
    'linear-gradient(135deg, #f97316, #ea580c)',
    'linear-gradient(135deg, #38bdf8, #0284c7)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #a855f7, #7c3aed)',
    'linear-gradient(135deg, #f43f5e, #e11d48)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #06b6d4, #0891b2)',
    'linear-gradient(135deg, #ec4899, #db2777)'
  ];

  function updateContainerStyles() {
    container.style.flexDirection = dirSelect.value;
    container.style.justifyContent = justifySelect.value;
    container.style.alignItems = alignSelect.value;
    container.style.flexWrap = wrapSelect.value;
    container.style.gap = gapSelect.value;
    updateCodeOutput();
  }

  function renderItems() {
    container.innerHTML = '';
    for (let i = 1; i <= itemCount; i++) {
      const item = document.createElement('div');
      item.className = 'fb-item';
      if (i === activeItemIndex) item.classList.add('active');
      item.dataset.index = i;
      item.style.background = itemColors[(i - 1) % itemColors.length];

      item.innerHTML = `
        <span>${i}</span>
        <span class="fb-item-sub">item</span>
      `;

      item.addEventListener('click', () => {
        selectItem(i);
      });

      container.appendChild(item);
    }
    syncSelectedItemControls();
    updateContainerStyles();
  }

  function selectItem(index) {
    activeItemIndex = index;
    const items = container.querySelectorAll('.fb-item');
    items.forEach(it => {
      if (parseInt(it.dataset.index) === index) {
        it.classList.add('active');
      } else {
        it.classList.remove('active');
      }
    });
    if (selectedItemLabel) {
      selectedItemLabel.textContent = `Položka č. ${index}`;
    }
    syncSelectedItemControls();
    updateCodeOutput();
  }

  function syncSelectedItemControls() {
    const selectedEl = container.querySelector(`.fb-item[data-index="${activeItemIndex}"]`);
    if (!selectedEl) return;

    if (itemAlignSelect) itemAlignSelect.value = selectedEl.style.alignSelf || 'auto';
    if (itemGrowSelect) itemGrowSelect.value = selectedEl.style.flexGrow || '0';
    if (itemShrinkSelect) itemShrinkSelect.value = selectedEl.style.flexShrink || '1';
    if (itemBasisSelect) itemBasisSelect.value = selectedEl.style.flexBasis || 'auto';
  }

  function updateActiveItemStyle(prop, value) {
    const selectedEl = container.querySelector(`.fb-item[data-index="${activeItemIndex}"]`);
    if (!selectedEl) return;
    selectedEl.style[prop] = value;
    updateCodeOutput();
  }

  function updateCodeOutput() {
    if (!codeOutput) return;

    let css = `.container {\n  display: flex;\n`;
    if (dirSelect.value !== 'row') css += `  flex-direction: ${dirSelect.value};\n`;
    if (justifySelect.value !== 'flex-start') css += `  justify-content: ${justifySelect.value};\n`;
    if (alignSelect.value !== 'stretch') css += `  align-items: ${alignSelect.value};\n`;
    if (wrapSelect.value !== 'nowrap') css += `  flex-wrap: ${wrapSelect.value};\n`;
    if (gapSelect.value !== '0px') css += `  gap: ${gapSelect.value};\n`;
    css += `}`;

    const activeEl = container.querySelector(`.fb-item[data-index="${activeItemIndex}"]`);
    if (activeEl) {
      const hasCustomItemStyle = activeEl.style.alignSelf && activeEl.style.alignSelf !== 'auto' ||
                                 activeEl.style.flexGrow && activeEl.style.flexGrow !== '0' ||
                                 activeEl.style.flexShrink && activeEl.style.flexShrink !== '1' ||
                                 activeEl.style.flexBasis && activeEl.style.flexBasis !== 'auto';
      if (hasCustomItemStyle) {
        css += `\n\n.item:nth-child(${activeItemIndex}) {\n`;
        if (activeEl.style.alignSelf && activeEl.style.alignSelf !== 'auto') css += `  align-self: ${activeEl.style.alignSelf};\n`;
        if (activeEl.style.flexGrow && activeEl.style.flexGrow !== '0') css += `  flex-grow: ${activeEl.style.flexGrow};\n`;
        if (activeEl.style.flexShrink && activeEl.style.flexShrink !== '1') css += `  flex-shrink: ${activeEl.style.flexShrink};\n`;
        if (activeEl.style.flexBasis && activeEl.style.flexBasis !== 'auto') css += `  flex-basis: ${activeEl.style.flexBasis};\n`;
        css += `}`;
      }
    }

    codeOutput.textContent = css;
  }

  // Event listenery pro kontejner
  [dirSelect, justifySelect, alignSelect, wrapSelect, gapSelect].forEach(select => {
    if (select) {
      select.addEventListener('change', updateContainerStyles);
    }
  });

  // Event listenery pro položku
  if (itemAlignSelect) itemAlignSelect.addEventListener('change', (e) => updateActiveItemStyle('alignSelf', e.target.value));
  if (itemGrowSelect) itemGrowSelect.addEventListener('change', (e) => updateActiveItemStyle('flexGrow', e.target.value));
  if (itemShrinkSelect) itemShrinkSelect.addEventListener('change', (e) => updateActiveItemStyle('flexShrink', e.target.value));
  if (itemBasisSelect) itemBasisSelect.addEventListener('change', (e) => updateActiveItemStyle('flexBasis', e.target.value));

  // Tlačítka přidat / odebrat
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      if (itemCount < 8) {
        itemCount++;
        renderItems();
      }
    });
  }

  if (removeItemBtn) {
    removeItemBtn.addEventListener('click', () => {
      if (itemCount > 2) {
        if (activeItemIndex === itemCount) {
          activeItemIndex = itemCount - 1;
        }
        itemCount--;
        renderItems();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      dirSelect.value = 'row';
      justifySelect.value = 'flex-start';
      alignSelect.value = 'stretch';
      wrapSelect.value = 'nowrap';
      gapSelect.value = '16px';
      itemCount = 4;
      activeItemIndex = 1;
      renderItems();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (codeOutput) {
        navigator.clipboard.writeText(codeOutput.textContent).then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = 'Zkopírováno!';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 1500);
        });
      }
    });
  }

  renderItems();
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

/**
 * Interaktivní simulace pro Stacking Context (Snímek 5)
 */
function initStackingContextDemo() {
  const btnRaise = document.getElementById('btnRaiseParentA');
  const btnReset = document.getElementById('btnResetParentA');
  const parentA = document.getElementById('stackParentA');
  const parentALabel = document.getElementById('stackParentALabel');
  const statusBadge = document.getElementById('stackStatusBadge');
  const explainText = document.getElementById('stackExplainText');

  if (!btnRaise || !btnReset || !parentA) return;

  btnRaise.addEventListener('click', () => {
    // 1. Změna vrstvy Rodiče A
    parentA.style.zIndex = '3';
    if (parentALabel) parentALabel.textContent = 'z-index: 3';

    // 2. Aktualizace stavového odznaku
    if (statusBadge) {
      statusBadge.textContent = 'Rodič A je navrchu (3 > 2)';
      statusBadge.style.color = '#34d399';
      statusBadge.style.background = 'rgba(16, 185, 129, 0.18)';
      statusBadge.style.borderColor = 'rgba(52, 211, 153, 0.4)';
    }

    // 3. Vysvětlující text
    if (explainText) {
      explainText.innerHTML = '<strong>Změna:</strong> Nyní <strong>Rodič A (3) porazil Rodiče B (2)</strong>! Celý kontext Rodiče A se posunul dopředu, a proto je nyní Potomek A (zelený s 999 999) konečně v popředí před celým Rodičem B i jeho Potomkem B.';
    }

    // 4. Přepnutí stavu tlačítek
    btnRaise.disabled = true;
    btnRaise.style.background = 'rgba(255, 255, 255, 0.05)';
    btnRaise.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    btnRaise.style.color = 'rgba(255, 255, 255, 0.35)';
    btnRaise.style.cursor = 'not-allowed';
    btnRaise.style.boxShadow = 'none';

    btnReset.disabled = false;
    btnReset.style.background = '#f43f5e';
    btnReset.style.borderColor = '#f43f5e';
    btnReset.style.color = '#ffffff';
    btnReset.style.cursor = 'pointer';
    btnReset.style.boxShadow = '0 4px 14px rgba(244, 63, 94, 0.4)';
  });

  btnReset.addEventListener('click', () => {
    // 1. Reset vrstvy Rodiče A na výchozí hodnotu 1
    parentA.style.zIndex = '1';
    if (parentALabel) parentALabel.textContent = 'z-index: 1';

    // 2. Aktualizace stavového odznaku
    if (statusBadge) {
      statusBadge.textContent = 'Rodič B je navrchu (2 > 1)';
      statusBadge.style.color = '#f43f5e';
      statusBadge.style.background = 'rgba(244, 63, 94, 0.15)';
      statusBadge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    }

    // 3. Vysvětlující text
    if (explainText) {
      explainText.innerHTML = '<strong>Výchozí stav:</strong> Potomek B (oranžový) leží <strong>NAD</strong> Potomkem A (zeleným), i když má z-index jen 1 oproti 999 999! Rodič B má totiž <code>z-index: 2</code>, který poráží Rodiče A s <code>z-index: 1</code>.';
    }

    // 4. Přepnutí stavu tlačítek
    btnReset.disabled = true;
    btnReset.style.background = 'rgba(255, 255, 255, 0.05)';
    btnReset.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    btnReset.style.color = 'rgba(255, 255, 255, 0.35)';
    btnReset.style.cursor = 'not-allowed';
    btnReset.style.boxShadow = 'none';

    btnRaise.disabled = false;
    btnRaise.style.background = '#38bdf8';
    btnRaise.style.borderColor = '#38bdf8';
    btnRaise.style.color = '#0b1329';
    btnRaise.style.cursor = 'pointer';
    btnRaise.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.35)';
  });
}

