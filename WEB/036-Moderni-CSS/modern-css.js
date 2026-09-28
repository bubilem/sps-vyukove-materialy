/**
 * SPŠ Webové technologie - Téma 036: Moderní CSS
 * modern-css.js - Interaktivní Theme Studio, Clamp kalkulátor a akordeon otázek
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeStudio();
  initQuestionHints();
});

function initThemeStudio() {
  const previewBox = document.getElementById('studioPreviewBox');
  if (!previewBox) return;

  const presetSelect = document.getElementById('studioPreset');
  const primaryInput = document.getElementById('studioPrimaryColor');
  const bgInput = document.getElementById('studioBgColor');
  const textInput = document.getElementById('studioTextColor');
  const clampSlider = document.getElementById('studioClampSlider');
  const clampLabel = document.getElementById('studioClampLabel');
  const clampText = document.getElementById('studioClampText');
  const codeOutput = document.getElementById('studioGeneratedCss');
  const copyBtn = document.getElementById('studioCopyBtn');

  const presets = {
    'midnight-indigo': { primary: '#6366f1', bg: '#0f172a', text: '#f8fafc' },
    'emerald-forest': { primary: '#10b981', bg: '#064e3b', text: '#ecfdf5' },
    'cyberpunk-neon': { primary: '#f43f5e', bg: '#18181b', text: '#38bdf8' },
    'clean-light': { primary: '#2563eb', bg: '#f8fafc', text: '#1e293b' }
  };

  function updateTheme() {
    const primary = primaryInput.value;
    const bg = bgInput.value;
    const text = textInput.value;

    previewBox.style.setProperty('--studio-primary', primary);
    previewBox.style.setProperty('--studio-bg', bg);
    previewBox.style.setProperty('--studio-text', text);

    updateCode();
  }

  function updateClamp() {
    const simulatedVw = parseInt(clampSlider.value);
    if (clampLabel) clampLabel.textContent = simulatedVw + ' px';

    // clamp(1.25rem [20px], 2.5vw + 0.5rem, 2.5rem [40px])
    const preferredPx = (simulatedVw * 0.025) + 8;
    const computedPx = Math.min(Math.max(20, preferredPx), 40);

    if (clampText) {
      clampText.style.fontSize = computedPx + 'px';
    }
    updateCode();
  }

  function updateCode() {
    if (!codeOutput) return;

    const primary = primaryInput.value;
    const bg = bgInput.value;
    const text = textInput.value;

    codeOutput.textContent = `:root {\n  --primary-color: ${primary};\n  --bg-color: ${bg};\n  --text-color: ${text};\n  --fluid-heading: clamp(1.25rem, 2.5vw + 0.5rem, 2.5rem);\n}\n\n.card {\n  background: var(--bg-color);\n  color: var(--text-color);\n  border: 2px solid var(--primary-color);\n\n  & h2 {\n    font-size: var(--fluid-heading);\n    color: var(--primary-color);\n  }\n}`;
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const p = presets[e.target.value];
      if (p) {
        primaryInput.value = p.primary;
        bgInput.value = p.bg;
        textInput.value = p.text;
        updateTheme();
      }
    });
  }

  [primaryInput, bgInput, textInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updateTheme);
  });

  if (clampSlider) {
    clampSlider.addEventListener('input', updateClamp);
  }

  if (copyBtn && codeOutput) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeOutput.textContent).then(() => {
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = 'Zkopírováno!';
        setTimeout(() => { copyBtn.innerHTML = orig; }, 1500);
      });
    });
  }

  // Výchozí nastavení
  updateTheme();
  updateClamp();
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
