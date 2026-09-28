/**
 * SPŠ Webové technologie - Téma 030: Úvod do CSS a Box model
 * Lokální interaktivní engine pro demonstraci Box modelu, barev a jednotek
 */

document.addEventListener('DOMContentLoaded', () => {
  initBoxModelPlayground();
  initColorConverter();
  initUnitTester();
  initQuestionHints();
});

/* ==========================================================================
   1. Interaktivní Box Model Playground
   ========================================================================== */
function initBoxModelPlayground() {
  const widthSlider = document.getElementById('bmWidthSlider');
  const heightSlider = document.getElementById('bmHeightSlider');
  const paddingSlider = document.getElementById('bmPaddingSlider');
  const borderSlider = document.getElementById('bmBorderSlider');
  const marginSlider = document.getElementById('bmMarginSlider');

  const widthVal = document.getElementById('bmWidthVal');
  const heightVal = document.getElementById('bmHeightVal');
  const paddingVal = document.getElementById('bmPaddingVal');
  const borderVal = document.getElementById('bmBorderVal');
  const marginVal = document.getElementById('bmMarginVal');

  const btnContentBox = document.getElementById('btnContentBox');
  const btnBorderBox = document.getElementById('btnBorderBox');

  const totalWidthStat = document.getElementById('bmTotalWidthStat');
  const totalHeightStat = document.getElementById('bmTotalHeightStat');
  const boxSizingStat = document.getElementById('bmBoxSizingStat');

  const boxElement = document.getElementById('bmLiveBox');
  const cssOutput = document.getElementById('bmCssOutput');

  if (!widthSlider || !boxElement) return;

  let currentSizing = 'content-box'; // or 'border-box'

  function updateBoxModel() {
    const w = parseInt(widthSlider.value, 10);
    const h = parseInt(heightSlider.value, 10);
    const p = parseInt(paddingSlider.value, 10);
    const b = parseInt(borderSlider.value, 10);
    const m = parseInt(marginSlider.value, 10);

    // Aktualizace hodnot v popiscích
    widthVal.textContent = `${w}px`;
    heightVal.textContent = `${h}px`;
    paddingVal.textContent = `${p}px`;
    borderVal.textContent = `${b}px`;
    marginVal.textContent = `${m}px`;

    // Aplikace stylů na živý box
    boxElement.style.boxSizing = currentSizing;
    boxElement.style.width = `${w}px`;
    boxElement.style.height = `${h}px`;
    boxElement.style.padding = `${p}px`;
    boxElement.style.borderWidth = `${b}px`;
    boxElement.style.borderStyle = 'solid';
    boxElement.style.borderColor = '#eab308';
    boxElement.style.margin = `${m}px`;

    // Výpočet celkových rozměrů dle specifikace CSS
    let totalW, totalH;
    if (currentSizing === 'content-box') {
      totalW = w + 2 * p + 2 * b;
      totalH = h + 2 * p + 2 * b;
      boxSizingStat.textContent = 'content-box (přičítá se)';
      boxSizingStat.style.color = '#fb923c';
    } else {
      totalW = w;
      totalH = h;
      boxSizingStat.textContent = 'border-box (garantováno)';
      boxSizingStat.style.color = '#38bdf8';
    }

    totalWidthStat.textContent = `${totalW}px (+ ${2 * m}px margin)`;
    totalHeightStat.textContent = `${totalH}px (+ ${2 * m}px margin)`;

    // Vygenerování živého CSS kódu
    if (cssOutput) {
      cssOutput.innerHTML = `<span class="css-sel">.krabicka</span> {\n` +
        `  <span class="css-prop">box-sizing</span>: <span class="css-val">${currentSizing}</span>;\n` +
        `  <span class="css-prop">width</span>: <span class="css-val">${w}</span><span class="css-unit">px</span>;\n` +
        `  <span class="css-prop">height</span>: <span class="css-val">${h}</span><span class="css-unit">px</span>;\n` +
        `  <span class="css-prop">padding</span>: <span class="css-val">${p}</span><span class="css-unit">px</span>;\n` +
        `  <span class="css-prop">border</span>: <span class="css-val">${b}</span><span class="css-unit">px</span> <span class="css-val">solid #eab308</span>;\n` +
        `  <span class="css-prop">margin</span>: <span class="css-val">${m}</span><span class="css-unit">px</span>;\n` +
        `}`;
    }
  }

  [widthSlider, heightSlider, paddingSlider, borderSlider, marginSlider].forEach(slider => {
    slider.addEventListener('input', updateBoxModel);
  });

  if (btnContentBox && btnBorderBox) {
    btnContentBox.addEventListener('click', () => {
      currentSizing = 'content-box';
      btnContentBox.classList.add('active');
      btnBorderBox.classList.remove('active');
      updateBoxModel();
    });

    btnBorderBox.addEventListener('click', () => {
      currentSizing = 'border-box';
      btnBorderBox.classList.add('active');
      btnContentBox.classList.remove('active');
      updateBoxModel();
    });
  }

  updateBoxModel();
}

/* ==========================================================================
   2. Interaktivní srovnávač barevných formátů
   ========================================================================== */
function initColorConverter() {
  const colorPicker = document.getElementById('demoColorPicker');
  const previewBox = document.getElementById('demoColorPreview');
  const hexOut = document.getElementById('demoHexOut');
  const rgbOut = document.getElementById('demoRgbOut');
  const hslOut = document.getElementById('demoHslOut');

  if (!colorPicker || !previewBox) return;

  function hexToRgb(hex) {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = Math.round(h * 60);
    }
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return { h, s, l };
  }

  function updateColor() {
    const hex = colorPicker.value.toUpperCase();
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);

    previewBox.style.backgroundColor = hex;
    previewBox.textContent = hex;

    if (hexOut) hexOut.textContent = hex;
    if (rgbOut) rgbOut.textContent = `rgb(${r}, ${g}, ${b})`;
    if (hslOut) hslOut.textContent = `hsl(${h}deg, ${s}%, ${l}%)`;
  }

  colorPicker.addEventListener('input', updateColor);
  updateColor();
}

/* ==========================================================================
   3. Interaktivní tester jednotek (rem vs em vs px)
   ========================================================================== */
function initUnitTester() {
  const rootSizeSlider = document.getElementById('unitRootSlider');
  const rootSizeVal = document.getElementById('unitRootVal');
  const remBox = document.getElementById('unitRemBox');
  const pxBox = document.getElementById('unitPxBox');
  const remCalculated = document.getElementById('unitRemCalc');

  if (!rootSizeSlider || !remBox) return;

  function updateUnits() {
    const rootSize = parseInt(rootSizeSlider.value, 10);
    rootSizeVal.textContent = `${rootSize}px`;

    // 1.5rem = 1.5 * rootSize
    const remPixels = (1.5 * rootSize).toFixed(1);
    remBox.style.fontSize = `${remPixels}px`;
    if (remCalculated) {
      remCalculated.textContent = `1.5rem = 1.5 × ${rootSize}px = ${remPixels}px`;
    }
  }

  rootSizeSlider.addEventListener('input', updateUnits);
  updateUnits();
}

/* ==========================================================================
   4. Otázky s rozbalovací nápovědou
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
