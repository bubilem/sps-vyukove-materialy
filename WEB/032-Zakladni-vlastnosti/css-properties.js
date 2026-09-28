/**
 * SPŠ Webové technologie - Téma 032: Základní vlastnosti CSS
 * Lokální interaktivní engine pro live stylování a demonstraci CSS vlastností
 */

document.addEventListener('DOMContentLoaded', () => {
  initPropertyStyler();
  initQuestionHints();
});

/* ==========================================================================
   1. Interaktivní CSS Property Live Styler
   ========================================================================== */
function initPropertyStyler() {
  const target = document.getElementById('stylerTarget');
  const codeOut = document.getElementById('stylerCssCode');
  const copyBtn = document.getElementById('btnCopyCss');

  // Vstupy
  const fontSizeInput = document.getElementById('propFontSize');
  const fontSizeVal = document.getElementById('valFontSize');
  const fontWeightInput = document.getElementById('propFontWeight');
  const textAlignInput = document.getElementById('propTextAlign');
  const textColorInput = document.getElementById('propTextColor');
  const bgColorInput = document.getElementById('propBgColor');
  const borderWidthInput = document.getElementById('propBorderWidth');
  const borderWidthVal = document.getElementById('valBorderWidth');
  const borderStyleInput = document.getElementById('propBorderStyle');
  const borderColorInput = document.getElementById('propBorderColor');
  const borderRadiusInput = document.getElementById('propBorderRadius');
  const borderRadiusVal = document.getElementById('valBorderRadius');
  const shadowInput = document.getElementById('propShadow');
  const shadowVal = document.getElementById('valShadow');
  const displayInput = document.getElementById('propDisplay');
  const overflowInput = document.getElementById('propOverflow');

  if (!target || !fontSizeInput) return;

  function updateStyles() {
    const fontSize = fontSizeInput.value;
    const fontWeight = fontWeightInput.value;
    const textAlign = textAlignInput.value;
    const textColor = textColorInput.value;
    const bgColor = bgColorInput.value;
    const borderWidth = borderWidthInput.value;
    const borderStyle = borderStyleInput.value;
    const borderColor = borderColorInput.value;
    const borderRadius = borderRadiusInput.value;
    const shadow = shadowInput.value;
    const display = displayInput.value;
    const overflow = overflowInput.value;

    // Aktualizace popisků hodnot
    if (fontSizeVal) fontSizeVal.textContent = `${fontSize}px`;
    if (borderWidthVal) borderWidthVal.textContent = `${borderWidth}px`;
    if (borderRadiusVal) borderRadiusVal.textContent = `${borderRadius}px`;
    if (shadowVal) shadowVal.textContent = `${shadow}px`;

    // Aplikace na cílový element
    target.style.fontSize = `${fontSize}px`;
    target.style.fontWeight = fontWeight;
    target.style.textAlign = textAlign;
    target.style.color = textColor;
    target.style.backgroundColor = bgColor;
    target.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
    target.style.borderRadius = `${borderRadius}px`;
    target.style.boxShadow = shadow > 0 ? `0 ${Math.round(shadow / 2)}px ${shadow}px rgba(0, 0, 0, 0.35)` : 'none';
    target.style.display = display;
    target.style.overflow = overflow;

    // Sestavení čistého CSS kódu
    const cssLines = [
      `  <span class="css-prop">display</span>: <span class="css-val">${display}</span>;`,
      `  <span class="css-prop">font-size</span>: <span class="css-val">${fontSize}</span><span class="css-unit">px</span>;`,
      `  <span class="css-prop">font-weight</span>: <span class="css-val">${fontWeight}</span>;`,
      `  <span class="css-prop">text-align</span>: <span class="css-val">${textAlign}</span>;`,
      `  <span class="css-prop">color</span>: <span class="css-val">${textColor}</span>;`,
      `  <span class="css-prop">background-color</span>: <span class="css-val">${bgColor}</span>;`,
      `  <span class="css-prop">border</span>: <span class="css-val">${borderWidth}px ${borderStyle} ${borderColor}</span>;`,
      `  <span class="css-prop">border-radius</span>: <span class="css-val">${borderRadius}</span><span class="css-unit">px</span>;`,
      shadow > 0 ? `  <span class="css-prop">box-shadow</span>: <span class="css-val">0 ${Math.round(shadow / 2)}px ${shadow}px rgba(0, 0, 0, 0.35)</span>;` : `  <span class="css-prop">box-shadow</span>: <span class="css-val">none</span>;`,
      `  <span class="css-prop">overflow</span>: <span class="css-val">${overflow}</span>;`
    ];

    if (codeOut) {
      codeOut.innerHTML = `<span class="css-sel">.karta-produktu</span> {\n${cssLines.join('\n')}\n}`;
    }
  }

  // Navázání eventů
  [
    fontSizeInput, fontWeightInput, textAlignInput, textColorInput,
    bgColorInput, borderWidthInput, borderStyleInput, borderColorInput,
    borderRadiusInput, shadowInput, displayInput, overflowInput
  ].forEach(input => {
    if (input) {
      input.addEventListener('input', updateStyles);
      input.addEventListener('change', updateStyles);
    }
  });

  // Tlačítko pro kopírování CSS
  if (copyBtn && codeOut) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = codeOut.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="color: #10b981;"><polyline points="20 6 9 17 4 12"></polyline></svg> Zkopírováno!`;
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  updateStyles();
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
