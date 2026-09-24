/**
 * ==========================================================================
 * SPŠ Webové technologie - Téma 022: Pokročilé HTML
 * Interaktivní engine:
 * 1. Živý validátor HTML5 formulářových pravidel
 * 2. Nativní HTML5 <dialog> modal (showModal / close)
 * 3. Kontrolní otázky s odkrývací nápovědou
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. ŽIVÝ TESTER FORMULÁŘOVÝCH VALIDACÍ
     ======================================================================== */
  const inputs = document.querySelectorAll('.form-input[data-validate]');
  const formStatus = document.getElementById('formValidationStatus');

  function evaluateInput(input) {
    const badge = input.parentElement.querySelector('.validation-badge');
    const isValid = input.checkValidity();

    if (input.value === '') {
      input.classList.remove('valid-preview', 'invalid-preview');
      if (badge) {
        badge.textContent = 'Čeká na zadání';
        badge.style.background = 'rgba(255,255,255,0.08)';
        badge.style.color = '#94a3b8';
      }
    } else if (isValid) {
      input.classList.add('valid-preview');
      input.classList.remove('invalid-preview');
      if (badge) {
        badge.textContent = 'Platné (:valid)';
        badge.style.background = 'rgba(16,185,129,0.15)';
        badge.style.color = '#34d399';
      }
    } else {
      input.classList.add('invalid-preview');
      input.classList.remove('valid-preview');
      if (badge) {
        badge.textContent = input.validationMessage || 'Neplatné (:invalid)';
        badge.style.background = 'rgba(244,63,94,0.15)';
        badge.style.color = '#fb7185';
      }
    }
  }

  inputs.forEach(input => {
    input.addEventListener('input', () => evaluateInput(input));
    input.addEventListener('blur', () => evaluateInput(input));
  });

  const demoForm = document.getElementById('demoValidationForm');
  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (demoForm.checkValidity()) {
        if (formStatus) {
          formStatus.innerHTML = '<span style="color: #34d399; font-weight: 700;">Formulář je 100% validní dle HTML5 standardu! Data by se bezpečně odeslala na server.</span>';
        }
      } else {
        if (formStatus) {
          formStatus.innerHTML = '<span style="color: #fb7185; font-weight: 700;">Chyba: Některá pole nesplňují nativní pravidla (pattern, required, min, max)!</span>';
        }
      }
    });
  }

  /* ========================================================================
     2. NATIVNÍ HTML5 <DIALOG>
     ======================================================================== */
  const openDialogBtn = document.getElementById('openNativeDialogBtn');
  const closeDialogBtn = document.getElementById('closeNativeDialogBtn');
  const nativeDialog = document.getElementById('demoNativeDialog');

  if (openDialogBtn && nativeDialog) {
    openDialogBtn.addEventListener('click', () => {
      nativeDialog.showModal();
    });
  }

  if (closeDialogBtn && nativeDialog) {
    closeDialogBtn.addEventListener('click', () => {
      nativeDialog.close();
    });
  }

  /* ========================================================================
     3. KONTROLNÍ OTÁZKY S NÁPOVĚDOU
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

  /* ========================================================================
     4. ŽIVÉ UKÁZKY PRO SLIDE 4 (Range slider, Color picker)
     ======================================================================== */
  const demoRangeInput = document.getElementById('demoRangeInput');
  const demoRangeVal = document.getElementById('demoRangeVal');
  if (demoRangeInput && demoRangeVal) {
    demoRangeInput.addEventListener('input', () => {
      demoRangeVal.textContent = `${demoRangeInput.value}%`;
    });
  }

  const demoColorInput = document.getElementById('demoColorInput');
  const demoColorVal = document.getElementById('demoColorVal');
  if (demoColorInput && demoColorVal) {
    demoColorInput.addEventListener('input', () => {
      demoColorVal.textContent = demoColorInput.value;
    });
  }

});
