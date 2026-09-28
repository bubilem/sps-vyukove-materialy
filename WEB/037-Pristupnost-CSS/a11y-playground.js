/**
 * SPŠ Webové technologie - Téma 037: Webová přístupnost (a11y) v CSS
 * a11y-playground.js - Interaktivní a11y audit, simulátor zrakových vad a otázky
 */

document.addEventListener('DOMContentLoaded', () => {
  initA11ySimulator();
  initQuestionHints();
});

function initA11ySimulator() {
  const viewport = document.getElementById('a11yDemoViewport');
  if (!viewport) return;

  const visionSelect = document.getElementById('a11yVisionFilter');
  const focusModeSelect = document.getElementById('a11yFocusMode');
  const textColorInput = document.getElementById('a11yTextColor');
  const bgColorInput = document.getElementById('a11yBgColor');
  const contrastRatioBadge = document.getElementById('a11yContrastBadge');
  const contrastVerdict = document.getElementById('a11yContrastVerdict');
  const demoButton = document.getElementById('a11yDemoButton');
  const demoText = document.getElementById('a11yDemoText');

  const visionDesc = document.getElementById('a11yVisionDesc');

  function updateVision() {
    viewport.className = 'a11y-demo-viewport';
    const filter = visionSelect.value;

    if (filter === 'normal') {
      viewport.style.filter = 'none';
    } else if (filter === 'protanopia') {
      viewport.style.filter = "url('#a11y-filter-protanopia')";
      viewport.classList.add('filter-protanopia');
    } else if (filter === 'deuteranopia') {
      viewport.style.filter = "url('#a11y-filter-deuteranopia')";
      viewport.classList.add('filter-deuteranopia');
    } else if (filter === 'tritanopia') {
      viewport.style.filter = "url('#a11y-filter-tritanopia')";
      viewport.classList.add('filter-tritanopia');
    } else if (filter === 'blur') {
      viewport.style.filter = 'blur(2.5px)';
      viewport.classList.add('filter-blur');
    } else if (filter === 'monochrome') {
      viewport.style.filter = 'grayscale(100%)';
      viewport.classList.add('filter-monochrome');
    }

    if (visionDesc) {
      const descriptions = {
        normal: '<strong>Normální zrak:</strong> Plné vnímání celého barevného spektra (červená, zelená, modrá).',
        protanopia: '<strong>Protanopie (výpadek L-čípku):</strong> Oko nevnímá dlouhé červené vlnové délky. Červená barva výrazně <em>ztmavne a ztrácí jas</em> (červená hláška se jeví jako tmavě šedohnědá až černá, zelená jako světlá khaki).',
        deuteranopia: '<strong>Deuteranopie (výpadek M-čípku):</strong> Chybí zelený receptor. Červená i zelená si zachovávají podobnou světlost a <em>splývají do stejného okrově žlutého tónu</em>. Červené chybové i zelené úspěšné hlášení bez textové ikony nelze rozeznat!',
        tritanopia: '<strong>Tritanopie (výpadek S-čípku):</strong> Vzácná modro-žlutá vada. Modrá se posouvá k tyrkysové a zelenomodré, žlutá k růžovofialové.',
        blur: '<strong>Slabozrakost (rozostření):</strong> Simuluje zhoršenou ostrost vidění, kataraktu (šedý zákal) nebo chybějící dioptrie. Zde pomáhá velký řez písma a vysoký kontrast.',
        monochrome: '<strong>Achromatopsie (úplná barvoslepost):</strong> Vidění pouze v odstínech šedi. Ukazuje, proč barva nikdy nesmí být jediným nosičem informace (WCAG pravidlo 1.4.1).'
      };
      visionDesc.innerHTML = descriptions[filter] || '';
    }
  }

  function updateFocusMode() {
    const mode = focusModeSelect.value;
    if (mode === 'none') {
      demoButton.style.outline = 'none';
      demoButton.style.boxShadow = 'none';
    } else if (mode === 'default') {
      demoButton.style.outline = 'initial';
      demoButton.style.boxShadow = 'none';
    } else if (mode === 'accessible') {
      demoButton.style.outline = '3px solid #2dd4bf';
      demoButton.style.outlineOffset = '3px';
      demoButton.style.boxShadow = '0 0 12px rgba(45, 212, 191, 0.6)';
    }
  }

  // Výpočet relativní luminance a kontrastního poměru podle WCAG
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function updateContrast() {
    const textHex = textColorInput.value;
    const bgHex = bgColorInput.value;

    demoText.style.color = textHex;
    demoText.style.backgroundColor = bgHex;

    const rgb1 = hexToRgb(textHex);
    const rgb2 = hexToRgb(bgHex);

    const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    const formattedRatio = ratio.toFixed(2) + ' : 1';

    if (contrastRatioBadge) contrastRatioBadge.textContent = formattedRatio;

    if (ratio >= 4.5) {
      contrastVerdict.innerHTML = '<span style="color:#10b981; font-weight:700;">PROŠLO (WCAG AA &ge; 4.5:1)</span>';
      contrastRatioBadge.style.color = '#10b981';
      contrastRatioBadge.style.borderColor = '#10b981';
    } else if (ratio >= 3.0) {
      contrastVerdict.innerHTML = '<span style="color:#f59e0b; font-weight:700;">PRO VELKÝ TEXT (3:1), malé písmo NEVYHOVUJE</span>';
      contrastRatioBadge.style.color = '#f59e0b';
      contrastRatioBadge.style.borderColor = '#f59e0b';
    } else {
      contrastVerdict.innerHTML = '<span style="color:#f43f5e; font-weight:700;">NEVYHOVUJE (Méně než 4.5:1)</span>';
      contrastRatioBadge.style.color = '#f43f5e';
      contrastRatioBadge.style.borderColor = '#f43f5e';
    }
  }

  if (visionSelect) visionSelect.addEventListener('change', updateVision);
  if (focusModeSelect) focusModeSelect.addEventListener('change', updateFocusMode);
  if (textColorInput) textColorInput.addEventListener('input', updateContrast);
  if (bgColorInput) bgColorInput.addEventListener('input', updateContrast);

  updateVision();
  updateFocusMode();
  updateContrast();
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
