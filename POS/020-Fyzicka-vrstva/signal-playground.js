/**
 * ==========================================================================
 * POS 020 - Fyzická vrstva: Interaktivní signálový trenažér a vizualizér kódování
 * Čistý Vanilla JavaScript s podporou High-DPI Canvas, animací a přepínání témat
 * ==========================================================================
 */

(function () {
  'use strict';

  // Výchozí stav simulace
  let bits = [1, 0, 1, 1, 0, 0, 1, 0];
  let currentEncoding = 'nrz'; // 'nrz' | 'manchester' | 'ask' | 'fsk' | 'bpsk'
  let animTime = 0;
  let animFrameId = null;

  // DOM prvky
  let canvas = null;
  let ctx = null;
  let bitButtonsContainer = null;
  let encButtons = [];
  let statTransitions = null;
  let statSync = null;
  let statBaud = null;
  let statDc = null;

  // Inicializace po načtení DOMu
  function initPlayground() {
    canvas = document.getElementById('signalCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    bitButtonsContainer = document.getElementById('bitButtonsRow');
    encButtons = Array.from(document.querySelectorAll('.enc-btn'));
    statTransitions = document.getElementById('statTransitions');
    statSync = document.getElementById('statSync');
    statBaud = document.getElementById('statBaud');
    statDc = document.getElementById('statDc');

    // 1. Vygenerování interaktivních tlačítek pro bity
    renderBitButtons();

    // 2. Obsluha předvoleb bitových sekvencí
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        if (preset === 'alt') bits = [1, 0, 1, 0, 1, 0, 1, 0];
        else if (preset === 'zeros') bits = [0, 0, 0, 0, 0, 0, 0, 0];
        else if (preset === 'ones') bits = [1, 1, 1, 1, 1, 1, 1, 1];
        else if (preset === 'ccna') bits = [1, 1, 0, 0, 1, 0, 1, 0];
        else if (preset === 'random') {
          bits = Array.from({ length: 8 }, () => Math.round(Math.random()));
        }
        renderBitButtons();
        updateStats();
      });
    });

    // 3. Obsluha přepínačů kódování
    encButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        encButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentEncoding = btn.getAttribute('data-enc');
        updateStats();
      });
    });

    // 4. Přizpůsobení velikosti canvasu
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 5. Spuštění animační smyčky
    updateStats();
    startAnimation();
  }

  /**
   * Vygenerování klikatelných tlačítek bitů
   */
  function renderBitButtons() {
    if (!bitButtonsContainer) return;
    bitButtonsContainer.innerHTML = '';

    bits.forEach((bit, index) => {
      const btn = document.createElement('button');
      btn.className = `bit-btn ${bit === 1 ? 'active-1' : 'active-0'}`;
      btn.textContent = bit;
      btn.title = `Kliknutím přepnete bit ${index + 1} (současná hodnota: ${bit})`;
      btn.setAttribute('aria-label', `Bit ${index + 1}: hodnota ${bit}`);

      btn.addEventListener('click', () => {
        bits[index] = bits[index] === 1 ? 0 : 1;
        btn.textContent = bits[index];
        btn.className = `bit-btn ${bits[index] === 1 ? 'active-1' : 'active-0'}`;
        updateStats();
      });

      bitButtonsContainer.appendChild(btn);
    });
  }

  /**
   * Zajištění ostrého vykreslení na displejích s vysokým rozlišením (Retina)
   */
  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    if (ctx) ctx.scale(dpr, dpr);
  }

  /**
   * Výpočet a aktualizace statistik signálu
   */
  function updateStats() {
    // Počet přechodů úrovní
    let transitions = 0;
    if (currentEncoding === 'nrz') {
      for (let i = 1; i < bits.length; i++) {
        if (bits[i] !== bits[i - 1]) transitions++;
      }
    } else if (currentEncoding === 'manchester') {
      // Manchester má minimálně 1 přechod v každém bitu (uprostřed) + přechody mezi stejnými bity
      transitions = bits.length; // středové hrany
      for (let i = 1; i < bits.length; i++) {
        if (bits[i] === bits[i - 1]) transitions++;
      }
    } else {
      // Modulace
      transitions = bits.length;
    }

    if (statTransitions) statTransitions.textContent = `${transitions} hran`;

    // Synchronizace hodin
    if (statSync) {
      if (currentEncoding === 'manchester') {
        statSync.textContent = '100 % (Self-clocking)';
        statSync.style.color = '#34d399';
      } else if (currentEncoding === 'nrz') {
        const hasLongRun = bits.join('').includes('0000') || bits.join('').includes('1111');
        statSync.textContent = hasLongRun ? 'Riziko rozpadu' : 'Závislá na datech';
        statSync.style.color = hasLongRun ? '#f87171' : '#fbbf24';
      } else {
        statSync.textContent = 'Z nosné vlny';
        statSync.style.color = '#38bdf8';
      }
    }

    // Poměr Baud vs Bit rate
    if (statBaud) {
      if (currentEncoding === 'manchester') {
        statBaud.textContent = '2 Baud / bit (50 %)';
      } else if (currentEncoding === 'nrz') {
        statBaud.textContent = '1 Baud / bit (100 %)';
      } else if (currentEncoding === 'ask' || currentEncoding === 'fsk' || currentEncoding === 'bpsk') {
        statBaud.textContent = '1 Baud / bit';
      }
    }

    // DC složka (vyváženost 0 a 1)
    if (statDc) {
      if (currentEncoding === 'manchester') {
        statDc.textContent = '0 V (Dokonale vyvážená)';
        statDc.style.color = '#34d399';
      } else {
        const ones = bits.filter(b => b === 1).length;
        const zeros = bits.length - ones;
        const diff = Math.abs(ones - zeros);
        if (diff === 0) {
          statDc.textContent = 'Vyvážená (50/50)';
          statDc.style.color = '#34d399';
        } else {
          statDc.textContent = `DC drift (${ones}x 1 / ${zeros}x 0)`;
          statDc.style.color = '#fbbf24';
        }
      }
    }
  }

  /**
   * Animační smyčka
   */
  function startAnimation() {
    function loop() {
      animTime += 0.035;
      drawSignal();
      animFrameId = requestAnimationFrame(loop);
    }
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Hlavní vykreslovací funkce pro Canvas
   */
  function drawSignal() {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Detekce motivu pro barvy
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bgGrid = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const textMuted = isLight ? '#64748b' : '#94a3b8';
    const textBright = isLight ? '#0f172a' : '#f8fafc';
    const clockColor = isLight ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.35)';
    const signalColor = '#38bdf8';
    const glowColor = 'rgba(56, 189, 248, 0.4)';

    ctx.clearRect(0, 0, width, height);

    // Rozvržení plochy:
    // Horní část: Hodinový signál (Clock) ~ 55px
    // Spodní část: Zakódovaný signál na médiu ~ 150px
    const topMargin = 28;
    const clockH = 36;
    const clockBaseY = topMargin + clockH;
    const signalMarginTop = clockBaseY + 24;
    const signalH = height - signalMarginTop - 25;
    const signalMidY = signalMarginTop + signalH / 2;

    const bitWidth = width / bits.length;

    // 1. Vykreslení vertikálních oddělovačů bitových intervalů a bitových hlaviček
    for (let i = 0; i <= bits.length; i++) {
      const x = i * bitWidth;
      ctx.strokeStyle = bgGrid;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Zobrazení čísla a hodnoty bitu nahoře
      if (i < bits.length) {
        const bitVal = bits[i];
        const bitCenterX = x + bitWidth / 2;

        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = bitVal === 1 ? '#60a5fa' : textMuted;
        ctx.fillText(`b${i + 1}=${bitVal}`, bitCenterX, 18);
      }
    }

    // 2. Vykreslení referenčního hodinového signálu (Clock Signal)
    ctx.strokeStyle = clockColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < bits.length; i++) {
      const bx = i * bitWidth;
      const bHalf = bitWidth / 2;
      const highY = clockBaseY - clockH + 8;
      const lowY = clockBaseY;

      if (i === 0) ctx.moveTo(bx, lowY);
      // První půlka: High
      ctx.lineTo(bx, highY);
      ctx.lineTo(bx + bHalf, highY);
      // Půlka bitu: hrana dolů na Low
      ctx.lineTo(bx + bHalf, lowY);
      ctx.lineTo(bx + bitWidth, lowY);
    }
    ctx.stroke();

    // Popisek pro Clock
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = textMuted;
    ctx.fillText('CLOCK (HODINY)', 8, clockBaseY - clockH + 5);

    // 3. Vykreslení vodorovné referenční osy pro výsledný signál
    ctx.strokeStyle = bgGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, signalMidY);
    ctx.lineTo(width, signalMidY);
    ctx.stroke();

    // Popisek signálu
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#60a5fa';
    let label = 'SIGNÁL NA MÉDIU: ';
    if (currentEncoding === 'nrz') label += 'NRZ-L (1 = +V, 0 = -V)';
    else if (currentEncoding === 'manchester') label += 'Manchester IEEE 802.3 (Středové přechody)';
    else if (currentEncoding === 'ask') label += 'AM / ASK (Modulace amplitudy)';
    else if (currentEncoding === 'fsk') label += 'FM / FSK (Modulace frekvence)';
    else if (currentEncoding === 'bpsk') label += 'BPSK (Fázový posun 180°)';
    ctx.fillText(label, 8, signalMarginTop - 6);

    // 4. Vykreslení kódovaného signálu
    ctx.save();
    ctx.strokeStyle = signalColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();

    const amp = signalH * 0.42;

    if (currentEncoding === 'nrz') {
      // NRZ-L: 1 = +V (nahoře), 0 = -V (dole)
      for (let i = 0; i < bits.length; i++) {
        const bx = i * bitWidth;
        const y = bits[i] === 1 ? signalMidY - amp : signalMidY + amp;

        if (i === 0) {
          ctx.moveTo(bx, y);
        } else {
          // Vertikální přechodová hrana
          ctx.lineTo(bx, y);
        }
        ctx.lineTo(bx + bitWidth, y);
      }
    } else if (currentEncoding === 'manchester') {
      // IEEE 802.3 Manchester:
      // Bit 1: High -> Low (přechod uprostřed z +V na -V)
      // Bit 0: Low -> High (přechod uprostřed z -V na +V)
      for (let i = 0; i < bits.length; i++) {
        const bx = i * bitWidth;
        const bHalf = bitWidth / 2;
        const bVal = bits[i];

        const firstHalfY = bVal === 1 ? signalMidY - amp : signalMidY + amp;
        const secondHalfY = bVal === 1 ? signalMidY + amp : signalMidY - amp;

        if (i === 0) {
          ctx.moveTo(bx, firstHalfY);
        } else {
          ctx.lineTo(bx, firstHalfY);
        }

        ctx.lineTo(bx + bHalf, firstHalfY);
        ctx.lineTo(bx + bHalf, secondHalfY); // Středový synchronizační přechod
        ctx.lineTo(bx + bitWidth, secondHalfY);
      }
    } else if (currentEncoding === 'ask') {
      // ASK: Bit 1 má plnou amplitudu nosné vlny, Bit 0 má nulovou nebo minimální amplitudu
      const totalPoints = 300;
      for (let p = 0; p <= totalPoints; p++) {
        const x = (p / totalPoints) * width;
        const bitIndex = Math.min(Math.floor(x / bitWidth), bits.length - 1);
        const bVal = bits[bitIndex];
        const currentAmp = bVal === 1 ? amp : amp * 0.18;
        const freq = 4.0; // frekvence nosné vlny na bit
        const t = (x / bitWidth) * Math.PI * 2 * freq - animTime;
        const y = signalMidY + Math.sin(t) * currentAmp;

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (currentEncoding === 'fsk') {
      // FSK: Bit 1 má vysokou frekvenci (2f), Bit 0 má nízkou frekvenci (f)
      const totalPoints = 400;
      let phase = -animTime;
      let lastX = 0;

      for (let p = 0; p <= totalPoints; p++) {
        const x = (p / totalPoints) * width;
        const bitIndex = Math.min(Math.floor(x / bitWidth), bits.length - 1);
        const bVal = bits[bitIndex];
        const freq = bVal === 1 ? 5.0 : 2.0;

        const dx = x - lastX;
        phase += (dx / bitWidth) * Math.PI * 2 * freq;
        lastX = x;

        const y = signalMidY + Math.sin(phase) * amp;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (currentEncoding === 'bpsk') {
      // BPSK: Bit 1 fáze 0°, Bit 0 fáze 180° (obrácená sinusovka)
      const totalPoints = 400;
      const freq = 2.5;

      for (let p = 0; p <= totalPoints; p++) {
        const x = (p / totalPoints) * width;
        const bitIndex = Math.min(Math.floor(x / bitWidth), bits.length - 1);
        const bVal = bits[bitIndex];
        const phaseShift = bVal === 1 ? 0 : Math.PI;

        const t = (x / bitWidth) * Math.PI * 2 * freq + phaseShift - animTime;
        const y = signalMidY + Math.sin(t) * amp;

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();

    // 5. Zvýrazňující body / ukazatele na přechodech u Manchesteru
    if (currentEncoding === 'manchester') {
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < bits.length; i++) {
        const bHalfX = i * bitWidth + bitWidth / 2;
        ctx.beginPath();
        ctx.arc(bHalfX, signalMidY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Obsluha akordeonu kontrolních otázek na závěrečném snímku
   */
  function initQuestionHints() {
    const qBtns = document.querySelectorAll('.question-answer-btn');
    qBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.question-card');
        if (!card) return;
        const isNowActive = card.classList.toggle('active');
        btn.innerHTML = isNowActive
          ? `<svg class="icon" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> Skrýt odpověď`
          : `<svg class="icon" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Zobrazit odpověď`;
      });
    });
  }

  // Registrace inicializace po načtení dokumentu
  function startAll() {
    initPlayground();
    initQuestionHints();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAll);
  } else {
    startAll();
  }

})();
