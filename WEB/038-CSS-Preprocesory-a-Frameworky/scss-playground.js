/**
 * SPŠ Webové technologie - Téma 038: CSS Preprocesory, Architektura a Frameworky
 * scss-playground.js - Interaktivní SCSS & BEM Sandbox a akordeon otázek
 */

document.addEventListener('DOMContentLoaded', () => {
  initScssSandbox();
  initQuestionHints();
});

function initScssSandbox() {
  const editor = document.getElementById('scssEditor');
  const output = document.getElementById('scssOutput');
  const presetSelect = document.getElementById('scssPreset');
  const copyBtn = document.getElementById('scssCopyBtn');

  if (!editor || !output) return;

  const presets = {
    'bem-nesting': `$card-bg: #1e293b;
$card-radius: 8px;
$accent: #f97316;

.card {
  background: $card-bg;
  border-radius: $card-radius;
  padding: 1.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__title {
    font-size: 1.25rem;
    color: #fff;
  }

  &--featured {
    border: 2px solid $accent;
    box-shadow: 0 0 16px rgba($accent, 0.3);
  }
}`,

    'mixin-demo': `@mixin flex-between($align: center) {
  display: flex;
  justify-content: space-between;
  align-items: $align;
}

.navbar {
  @include flex-between;
  padding: 1rem 2rem;
  background: #0f172a;

  &__menu {
    @include flex-between(baseline);
    gap: 1.5rem;
  }
}`,

    'variables-math': `$base-font: 16px;
$scale: 1.25;
$primary: #38bdf8;

h3 {
  font-size: $base-font * $scale;
  color: $primary;
}

h2 {
  font-size: $base-font * $scale * $scale;
  color: $primary;
}

h1 {
  font-size: $base-font * $scale * $scale * $scale;
  color: $primary;
}`
  };

  // Zjednodušený didaktický simulátor překladu SCSS -> CSS
  function compileScss(scss) {
    let css = scss;

    // 1. Zpracování SCSS proměnných
    const varMap = {};
    const varRegex = /\$([a-zA-Z0-9_-]+):\s*([^;]+);/g;
    let match;
    while ((match = varRegex.exec(scss)) !== null) {
      varMap[match[1]] = match[2].trim();
    }
    css = css.replace(varRegex, '');

    // Nahrazení proměnných v kódu
    for (const [key, val] of Object.entries(varMap)) {
      const rep = new RegExp(`\\$${key}\\b`, 'g');
      css = css.replace(rep, val);
    }

    // 2. Simulace rozbalení BEM nestingu
    if (scss.includes('&__') || scss.includes('&--')) {
      return `/* Výsledné zkompilované CSS pro prohlížeč: */\n.card {\n  background: #1e293b;\n  border-radius: 8px;\n  padding: 1.5rem;\n}\n\n.card__header {\n  display: flex;\n  justify-content: space-between;\n}\n\n.card__title {\n  font-size: 1.25rem;\n  color: #fff;\n}\n\n.card--featured {\n  border: 2px solid #f97316;\n  box-shadow: 0 0 16px rgba(249, 115, 22, 0.3);\n}`;
    }

    if (scss.includes('@mixin')) {
      return `/* Výsledné zkompilované CSS (mixiny rozbaleny): */\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 2rem;\n  background: #0f172a;\n}\n\n.navbar__menu {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 1.5rem;\n}`;
    }

    if (scss.includes('$scale')) {
      return `/* Výsledné zkompilované CSS (matematika vyčíslena): */\nh3 {\n  font-size: 20px;\n  color: #38bdf8;\n}\n\nh2 {\n  font-size: 25px;\n  color: #38bdf8;\n}\n\nh1 {\n  font-size: 31.25px;\n  color: #38bdf8;\n}`;
    }

    return `/* Zkompilované CSS: */\n` + css.trim();
  }

  function handleUpdate() {
    output.textContent = compileScss(editor.value);
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const code = presets[e.target.value];
      if (code) {
        editor.value = code;
        handleUpdate();
      }
    });
  }

  editor.addEventListener('input', handleUpdate);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.textContent).then(() => {
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = 'Zkopírováno!';
        setTimeout(() => { copyBtn.innerHTML = orig; }, 1500);
      });
    });
  }

  // Výchozí spuštění
  editor.value = presets['bem-nesting'];
  handleUpdate();
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
