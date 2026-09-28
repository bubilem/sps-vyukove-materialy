/**
 * SPŠ Webové technologie - Téma 039: CSS Animace a Transformace
 * animation-playground.js - Interaktivní Keyframe Animator a akordeon otázek
 */

document.addEventListener('DOMContentLoaded', () => {
  initAnimationStudio();
  initQuestionHints();
});

function initAnimationStudio() {
  const targetBox = document.getElementById('animTargetBox');
  if (!targetBox) return;

  const effectSelect = document.getElementById('animEffect');
  const timingSelect = document.getElementById('animTiming');
  const durationSlider = document.getElementById('animDuration');
  const durationLabel = document.getElementById('animDurationLabel');
  const codeOutput = document.getElementById('animGeneratedCss');
  const copyBtn = document.getElementById('animCopyBtn');
  const restartBtn = document.getElementById('animRestartBtn');

  const keyframes = {
    'bounce': `@keyframes bounceEffect {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-40px); }
}`,
    'spin': `@keyframes spinEffect {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
    'pulse': `@keyframes pulseEffect {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}`,
    'flip3d': `@keyframes flip3dEffect {
  0% { transform: perspective(400px) rotateY(0); }
  100% { transform: perspective(400px) rotateY(360deg); }
}`,
    'swing': `@keyframes swingEffect {
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}`
  };

  // Vytvoření dynamického stylu pro animace
  const dynamicStyle = document.createElement('style');
  dynamicStyle.id = 'dynamicAnimStyle';
  dynamicStyle.textContent = `
    @keyframes bounceEffect {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-40px); }
    }
    @keyframes spinEffect {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulseEffect {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    @keyframes flip3dEffect {
      0% { transform: perspective(400px) rotateY(0); }
      100% { transform: perspective(400px) rotateY(360deg); }
    }
    @keyframes swingEffect {
      20% { transform: rotate(15deg); }
      40% { transform: rotate(-10deg); }
      60% { transform: rotate(5deg); }
      80% { transform: rotate(-5deg); }
      100% { transform: rotate(0deg); }
    }
  `;
  document.head.appendChild(dynamicStyle);

  function applyAnimation() {
    const effect = effectSelect.value;
    const timing = timingSelect.value;
    const duration = parseFloat(durationSlider.value).toFixed(1) + 's';

    if (durationLabel) durationLabel.textContent = duration;

    // Reset animace pro spuštění od začátku
    targetBox.style.animation = 'none';
    targetBox.offsetHeight; // reflow trigger

    targetBox.style.animation = `${effect}Effect ${duration} ${timing} infinite`;

    if (codeOutput) {
      codeOutput.textContent = `${keyframes[effect]}\n\n.element {\n  animation: ${effect}Effect ${duration} ${timing} infinite;\n}`;
    }
  }

  if (effectSelect) effectSelect.addEventListener('change', applyAnimation);
  if (timingSelect) timingSelect.addEventListener('change', applyAnimation);
  if (durationSlider) durationSlider.addEventListener('input', applyAnimation);

  if (restartBtn) {
    restartBtn.addEventListener('click', applyAnimation);
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

  applyAnimation();
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
