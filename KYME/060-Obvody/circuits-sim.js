/**
 * ==========================================================================
 * Téma 060: Sekvenční a logické obvody - Interaktivní simulátory
 * Čistý Vanilla JS pro 100% offline provoz (bez externích knihoven)
 * ==========================================================================
 */

(function () {
  'use strict';

  function setClass(el, cls) {
    if (!el) return;
    el.setAttribute('class', cls);
  }

  // =========================================================================
  // 1. SNÍMEK 2: KOMBINAČNÍ VS. SEKVENČNÍ OBVOD (PAMĚŤ SE ZPĚTNOU VAZBOU)
  // =========================================================================
  let combPressed = false;
  let seqMemory = 0;

  window.setCombButton = function (pressed) {
    combPressed = pressed;
    const btn = document.getElementById('btn-comb-hold');
    const wire = document.getElementById('wire-comb-out');
    const led = document.getElementById('led-comb-out');
    const txt = document.getElementById('txt-comb-status');

    if (btn) {
      btn.className = pressed ? 'sim-toggle-btn val-1' : 'sim-toggle-btn val-0';
      btn.textContent = pressed ? 'Tlačítko DRŽENO (1)' : 'Podrž mě (0)';
    }
    setClass(wire, pressed ? 'sim-wire high' : 'sim-wire');
    setClass(led, pressed ? 'sim-led on-green' : 'sim-led');
    if (txt) {
      txt.textContent = pressed
        ? 'Světlo svítí jen po dobu stisku. Jakmile pustíš, obvod „zapomene“.'
        : 'Tlačítko puštěno -> výstup je okamžitě 0 (žádná paměť).';
    }
  };

  window.triggerSeqPulse = function (mode) {
    seqMemory = mode === 'set' ? 1 : 0;
    const wireOut = document.getElementById('wire-seq-out');
    const wireFb = document.getElementById('wire-seq-fb');
    const led = document.getElementById('led-seq-out');
    const badge = document.getElementById('badge-seq-state');
    const txt = document.getElementById('txt-seq-status');

    setClass(wireOut, seqMemory ? 'sim-wire accent' : 'sim-wire');
    setClass(wireFb, seqMemory ? 'sim-wire pulse' : 'sim-wire');
    setClass(led, seqMemory ? 'sim-led on-cyan' : 'sim-led');
    if (badge) {
      badge.textContent = `Paměť Q = ${seqMemory}`;
      badge.className = seqMemory ? 'out-badge state-1' : 'out-badge state-0';
    }
    if (txt) {
      txt.textContent = seqMemory
        ? 'Stiskl jsi ZAP a pustil – zpětná vazba ale drží výstup Q = 1 v paměti!'
        : 'Stiskl jsi VYP – paměť se vynulovala na Q = 0 a zůstane tak.';
    }
  };

  // =========================================================================
  // 2. SNÍMEK 3: BISTABILNÍ KLOPNÝ OBVOD RS (NOR)
  // =========================================================================
  const rsState = {
    s: 0,
    r: 0,
    q: 0,
    qBar: 1
  };

  window.toggleRsInput = function (pin) {
    rsState[pin] = rsState[pin] === 0 ? 1 : 0;
    updateRsSim();
  };

  function updateRsSim() {
    const { s, r } = rsState;
    let isHazard = false;

    if (s === 1 && r === 1) {
      // Zakázaný stav u NOR RS: oba výstupy spadnou na 0
      rsState.q = 0;
      rsState.qBar = 0;
      isHazard = true;
    } else if (s === 1 && r === 0) {
      rsState.q = 1;
      rsState.qBar = 0;
    } else if (s === 0 && r === 1) {
      rsState.q = 0;
      rsState.qBar = 1;
    } else {
      // S=0, R=0 -> paměť (pokud přecházíme ze zakázaného stavu, nastaví se definovaný stav 0/1)
      if (rsState.q === 0 && rsState.qBar === 0) {
        rsState.q = 0;
        rsState.qBar = 1;
      }
    }

    const btnS = document.getElementById('btn-rs-s');
    const btnR = document.getElementById('btn-rs-r');
    if (btnS) {
      btnS.textContent = `S = ${s}`;
      btnS.className = `sim-toggle-btn val-${s}`;
    }
    if (btnR) {
      btnR.textContent = `R = ${r}`;
      btnR.className = `sim-toggle-btn val-${r}`;
    }

    const outBadge = document.getElementById('out-rs-q');
    if (outBadge) {
      if (isHazard) {
        outBadge.textContent = 'HAZARD (Q=0, Q̄=0)';
        outBadge.className = 'out-badge state-hazard';
      } else {
        outBadge.textContent = `Q = ${rsState.q} | Q̄ = ${rsState.qBar}`;
        outBadge.className = `out-badge state-${rsState.q}`;
      }
    }

    // SVG vodiče a LED
    setClass(document.getElementById('wire-rs-s'), s ? 'sim-wire high' : 'sim-wire');
    setClass(document.getElementById('wire-rs-r'), r ? 'sim-wire warn' : 'sim-wire');
    setClass(document.getElementById('wire-rs-q'), isHazard ? 'sim-wire warn' : (rsState.q ? 'sim-wire accent' : 'sim-wire'));
    setClass(document.getElementById('wire-rs-qb'), isHazard ? 'sim-wire warn' : (rsState.qBar ? 'sim-wire high' : 'sim-wire'));
    setClass(document.getElementById('wire-rs-fb1'), rsState.q ? 'sim-wire accent' : 'sim-wire');
    setClass(document.getElementById('wire-rs-fb2'), rsState.qBar ? 'sim-wire high' : 'sim-wire');

    setClass(document.getElementById('led-rs-q'), isHazard ? 'sim-led on-red' : (rsState.q ? 'sim-led on-cyan' : 'sim-led'));
    setClass(document.getElementById('led-rs-qb'), isHazard ? 'sim-led on-red' : (rsState.qBar ? 'sim-led on-green' : 'sim-led'));

    const txtQ = document.getElementById('svg-rs-q-val');
    const txtQb = document.getElementById('svg-rs-qb-val');
    if (txtQ) txtQ.textContent = `Q=${rsState.q}`;
    if (txtQb) txtQb.textContent = `Q̄=${rsState.qBar}`;

    // Zvýraznění řádku tabulky
    const rows = document.querySelectorAll('#rs-truth-table tbody tr');
    const key = `${r}-${s}`;
    rows.forEach(tr => {
      if (tr.getAttribute('data-row') === key) {
        tr.classList.add('active-row');
      } else {
        tr.classList.remove('active-row');
      }
    });

    // Popisek
    const cap = document.getElementById('caption-rs');
    if (cap) {
      if (isHazard) {
        cap.className = 'sim-caption warn';
        cap.textContent = 'POZOR: Zakázaný stav (S=1, R=1)! Oba výstupy jsou na 0 – po uvolnění nastane závod (hazard).';
      } else if (s === 1) {
        cap.className = 'sim-caption ok';
        cap.textContent = 'Nastavení (SET): Výstup Q se nastavil na 1 a zpětná vazba jej drží.';
      } else if (r === 1) {
        cap.className = 'sim-caption info';
        cap.textContent = 'Nulování (RESET): Výstup Q se vynuloval na 0 (Q̄ = 1).';
      } else {
        cap.className = 'sim-caption info';
        cap.textContent = `Stav PAMĚŤ (S=0, R=0): Obvod si spolehlivě drží poslední hodnotu Q = ${rsState.q}.`;
      }
    }
  }

  // =========================================================================
  // 3. SNÍMEK 4: HODINOVÝ SIGNÁL (LATCH VS. FLIP-FLOP HRANA)
  // =========================================================================
  const clkDemo = {
    data: 0,
    clk: 0,
    latchQ: 0,
    ffQ: 0,
    history: [] // max 12 kroků { clk, data, latchQ, ffQ }
  };

  function pushClkHistory() {
    clkDemo.history.push({
      clk: clkDemo.clk,
      data: clkDemo.data,
      latchQ: clkDemo.latchQ,
      ffQ: clkDemo.ffQ
    });
    if (clkDemo.history.length > 14) {
      clkDemo.history.shift();
    }
  }

  window.toggleClkDemoData = function () {
    clkDemo.data = clkDemo.data === 0 ? 1 : 0;
    if (clkDemo.clk === 1) {
      // Úrovňový Latch reaguje okamžitě, když je CLK = 1
      clkDemo.latchQ = clkDemo.data;
    }
    pushClkHistory();
    renderClkDemo();
  };

  window.toggleClkDemoClock = function () {
    const prevClk = clkDemo.clk;
    clkDemo.clk = clkDemo.clk === 0 ? 1 : 0;

    if (prevClk === 0 && clkDemo.clk === 1) {
      // Náběžná hrana (0 -> 1): Flip-Flop načte Data!
      clkDemo.ffQ = clkDemo.data;
    }
    if (clkDemo.clk === 1) {
      // Latch propouští Data po celou dobu CLK = 1
      clkDemo.latchQ = clkDemo.data;
    }
    pushClkHistory();
    renderClkDemo();
  };

  function buildStepPath(points, yHigh, yLow, key) {
    if (points.length === 0) return '';
    const stepW = 28;
    const startX = 72;
    let d = '';
    points.forEach((pt, idx) => {
      const x1 = startX + idx * stepW;
      const x2 = x1 + stepW;
      const y = pt[key] === 1 ? yHigh : yLow;
      if (idx === 0) {
        d += `M ${x1},${y} L ${x2},${y}`;
      } else {
        const prevY = points[idx - 1][key] === 1 ? yHigh : yLow;
        if (prevY !== y) {
          d += ` L ${x1},${y}`;
        }
        d += ` L ${x2},${y}`;
      }
    });
    return d;
  }

  function renderClkDemo() {
    const btnD = document.getElementById('btn-clkdemo-d');
    const btnC = document.getElementById('btn-clkdemo-c');
    if (btnD) {
      btnD.textContent = `Data = ${clkDemo.data}`;
      btnD.className = `sim-toggle-btn val-${clkDemo.data}`;
    }
    if (btnC) {
      btnC.textContent = `CLK = ${clkDemo.clk}`;
      btnC.className = `sim-toggle-btn val-${clkDemo.clk}`;
    }

    const outLatch = document.getElementById('out-clkdemo-latch');
    const outFf = document.getElementById('out-clkdemo-ff');
    if (outLatch) {
      outLatch.textContent = `Latch Q = ${clkDemo.latchQ}`;
      outLatch.className = `out-badge state-${clkDemo.latchQ}`;
    }
    if (outFf) {
      outFf.textContent = `Flip-Flop Q = ${clkDemo.ffQ}`;
      outFf.className = `out-badge state-${clkDemo.ffQ}`;
    }

    const pClk = document.getElementById('wave-clk');
    const pData = document.getElementById('wave-data');
    const pLatch = document.getElementById('wave-latch');
    const pFf = document.getElementById('wave-ff');

    if (pClk) pClk.setAttribute('d', buildStepPath(clkDemo.history, 22, 42, 'clk'));
    if (pData) pData.setAttribute('d', buildStepPath(clkDemo.history, 64, 84, 'data'));
    if (pLatch) pLatch.setAttribute('d', buildStepPath(clkDemo.history, 106, 126, 'latchQ'));
    if (pFf) pFf.setAttribute('d', buildStepPath(clkDemo.history, 148, 168, 'ffQ'));
  }

  // =========================================================================
  // 4. SNÍMEK 5: KLOPNÝ OBVOD D (DATA FLIP-FLOP)
  // =========================================================================
  const dState = {
    d: 0,
    q: 0
  };

  window.toggleDInput = function () {
    dState.d = dState.d === 0 ? 1 : 0;
    renderDSim(false);
  };

  window.pulseDClock = function () {
    dState.q = dState.d;
    renderDSim(true);
  };

  window.resetDFlipFlop = function () {
    dState.q = 0;
    renderDSim(false, true);
  };

  function renderDSim(clocked, resetted) {
    const btnD = document.getElementById('btn-d-in');
    if (btnD) {
      btnD.textContent = `D = ${dState.d}`;
      btnD.className = `sim-toggle-btn val-${dState.d}`;
    }

    const outQ = document.getElementById('out-d-q');
    if (outQ) {
      outQ.textContent = `Q = ${dState.q} | Q̄ = ${dState.q ? 0 : 1}`;
      outQ.className = `out-badge state-${dState.q}`;
    }

    setClass(document.getElementById('wire-d-in'), dState.d ? 'sim-wire high' : 'sim-wire');
    setClass(document.getElementById('wire-d-q'), dState.q ? 'sim-wire accent' : 'sim-wire');
    setClass(document.getElementById('wire-d-qb'), dState.q === 0 ? 'sim-wire high' : 'sim-wire');
    setClass(document.getElementById('led-d-q'), dState.q ? 'sim-led on-cyan' : 'sim-led');

    const svgValD = document.getElementById('svg-d-val');
    const svgValQ = document.getElementById('svg-d-qval');
    if (svgValD) svgValD.textContent = `D=${dState.d}`;
    if (svgValQ) svgValQ.textContent = `Q=${dState.q}`;

    // Zvýraznění řádku v tabulce
    const rows = document.querySelectorAll('#d-truth-table tbody tr');
    rows.forEach(tr => {
      if (tr.getAttribute('data-row') === `${dState.d}`) {
        tr.classList.add('active-row');
      } else {
        tr.classList.remove('active-row');
      }
    });

    const cap = document.getElementById('caption-d');
    if (cap) {
      if (resetted) {
        cap.className = 'sim-caption warn';
        cap.textContent = 'Asynchronní RESET vynuloval výstup Q = 0 okamžitě bez čekání na hodiny.';
      } else if (clocked) {
        cap.className = 'sim-caption ok';
        cap.textContent = `Náběžná hrana CLK ↑! Obvod zapsal hodnotu D = ${dState.d} do paměti Q.`;
      } else {
        cap.className = 'sim-caption info';
        cap.textContent = `Na vstupu je D = ${dState.d}, ale výstup Q = ${dState.q} se nezmění, dokud nepřijde hrana CLK ↑.`;
      }
    }
  }

  // =========================================================================
  // 5. SNÍMEK 6: KLOPNÝ OBVOD JK A T
  // =========================================================================
  const jkState = {
    j: 0,
    k: 0,
    q: 0
  };

  window.toggleJkInput = function (pin) {
    jkState[pin] = jkState[pin] === 0 ? 1 : 0;
    renderJkSim(false);
  };

  window.pulseJkClock = function () {
    const { j, k, q } = jkState;
    if (j === 0 && k === 1) {
      jkState.q = 0;
    } else if (j === 1 && k === 0) {
      jkState.q = 1;
    } else if (j === 1 && k === 1) {
      jkState.q = q === 0 ? 1 : 0;
    }
    renderJkSim(true);
  };

  function renderJkSim(clocked) {
    const { j, k, q } = jkState;
    const btnJ = document.getElementById('btn-jk-j');
    const btnK = document.getElementById('btn-jk-k');
    if (btnJ) {
      btnJ.textContent = `J = ${j}`;
      btnJ.className = `sim-toggle-btn val-${j}`;
    }
    if (btnK) {
      btnK.textContent = `K = ${k}`;
      btnK.className = `sim-toggle-btn val-${k}`;
    }

    const outBadge = document.getElementById('out-jk-q');
    if (outBadge) {
      outBadge.textContent = `Q = ${q} | Q̄ = ${q ? 0 : 1}`;
      outBadge.className = `out-badge state-${q}`;
    }

    setClass(document.getElementById('wire-jk-j'), j ? 'sim-wire high' : 'sim-wire');
    setClass(document.getElementById('wire-jk-k'), k ? 'sim-wire warn' : 'sim-wire');
    setClass(document.getElementById('wire-jk-q'), q ? 'sim-wire accent' : 'sim-wire');
    setClass(document.getElementById('led-jk-q'), q ? 'sim-led on-cyan' : 'sim-led');

    const svgQ = document.getElementById('svg-jk-qval');
    if (svgQ) svgQ.textContent = `Q=${q}`;

    const rows = document.querySelectorAll('#jk-truth-table tbody tr');
    const key = `${j}-${k}`;
    rows.forEach(tr => {
      if (tr.getAttribute('data-row') === key) {
        tr.classList.add('active-row');
      } else {
        tr.classList.remove('active-row');
      }
    });

    const cap = document.getElementById('caption-jk');
    if (cap) {
      let modeText = '';
      if (j === 0 && k === 0) modeText = 'Režim PAMĚŤ (0,0): Výstup drží předchozí stav.';
      else if (j === 0 && k === 1) modeText = 'Režim RESET (0,1): Při pulzu CLK ↑ se výstup vynuluje na 0.';
      else if (j === 1 && k === 0) modeText = 'Režim SET (1,0): Při pulzu CLK ↑ se výstup nastaví na 1.';
      else modeText = 'Režim TOGGLE (1,1): Při každém pulzu CLK ↑ se výstup překlopí na opačný stav!';

      cap.className = (j === 1 && k === 1) ? 'sim-caption ok' : 'sim-caption info';
      cap.textContent = clocked ? `Pulz CLK ↑ aplikován -> ${modeText}` : modeText;
    }
  }

  // =========================================================================
  // 6. SNÍMEK 7: 4BITOVÝ ASYNCHRONNÍ BINÁRNÍ ČÍTAČ (0–15)
  // =========================================================================
  let counterVal = 0;
  let counterTimer = null;

  window.stepCounter = function () {
    counterVal = (counterVal + 1) % 16;
    renderCounter();
  };

  window.resetCounter = function () {
    counterVal = 0;
    if (counterTimer) {
      clearInterval(counterTimer);
      counterTimer = null;
      const autoBtn = document.getElementById('btn-cnt-auto');
      if (autoBtn) {
        autoBtn.textContent = 'Auto čítání';
        autoBtn.className = 'sim-action-btn';
      }
    }
    renderCounter();
  };

  window.toggleCounterAuto = function () {
    const autoBtn = document.getElementById('btn-cnt-auto');
    if (counterTimer) {
      clearInterval(counterTimer);
      counterTimer = null;
      if (autoBtn) {
        autoBtn.textContent = 'Auto čítání';
        autoBtn.className = 'sim-action-btn';
      }
    } else {
      counterTimer = setInterval(window.stepCounter, 650);
      if (autoBtn) {
        autoBtn.textContent = 'Pozastavit';
        autoBtn.className = 'sim-action-btn active-run';
      }
    }
  };

  function renderCounter() {
    const decEl = document.getElementById('cnt-dec');
    const hexEl = document.getElementById('cnt-hex');
    const binEl = document.getElementById('cnt-bin');

    if (decEl) decEl.textContent = counterVal;
    if (hexEl) hexEl.textContent = '0x' + counterVal.toString(16).toUpperCase();
    if (binEl) binEl.textContent = counterVal.toString(2).padStart(4, '0');

    for (let bit = 0; bit < 4; bit++) {
      const isOne = (counterVal >> bit) & 1;
      const cell = document.getElementById(`cnt-cell-${bit}`);
      const valEl = document.getElementById(`cnt-val-${bit}`);
      if (cell) {
        cell.className = isOne ? 'bit-cell bit-1' : 'bit-cell';
      }
      if (valEl) {
        valEl.textContent = isOne;
      }
      const led = document.getElementById(`cnt-svg-led-${bit}`);
      setClass(led, isOne ? 'sim-led on-cyan' : 'sim-led');
    }
  }

  // =========================================================================
  // 7. SNÍMEK 9: POSUVNÝ REGISTR SIPO (4 BITOVÝ)
  // =========================================================================
  const shiftState = {
    dataIn: 1,
    bits: [0, 0, 0, 0] // [Q0, Q1, Q2, Q3]
  };

  window.toggleShiftDataIn = function () {
    shiftState.dataIn = shiftState.dataIn === 0 ? 1 : 0;
    renderShiftRegister();
  };

  window.clockShiftRegister = function () {
    // Posun doprava: Q3 <= Q2 <= Q1 <= Q0 <= DataIn
    shiftState.bits.pop();
    shiftState.bits.unshift(shiftState.dataIn);
    renderShiftRegister();
  };

  window.resetShiftRegister = function () {
    shiftState.bits = [0, 0, 0, 0];
    renderShiftRegister();
  };

  window.loadShiftPreset = function () {
    shiftState.bits = [1, 0, 1, 1];
    renderShiftRegister();
  };

  function renderShiftRegister() {
    const btnIn = document.getElementById('btn-shift-in');
    if (btnIn) {
      btnIn.textContent = `Data In = ${shiftState.dataIn}`;
      btnIn.className = `sim-toggle-btn val-${shiftState.dataIn}`;
    }

    for (let i = 0; i < 4; i++) {
      const bitVal = shiftState.bits[i];
      const cell = document.getElementById(`shift-cell-${i}`);
      const valEl = document.getElementById(`shift-val-${i}`);
      if (cell) {
        cell.className = bitVal ? 'bit-cell bit-1' : 'bit-cell';
      }
      if (valEl) {
        valEl.textContent = bitVal;
      }
    }

    const outByte = document.getElementById('shift-out-word');
    if (outByte) {
      outByte.textContent = `Paralelní výstup: ${shiftState.bits.join('')}`;
    }
  }

  // =========================================================================
  // 8. SNÍMEK 10: KONEČNÝ STAVOVÝ AUTOMAT (SEMAFOR S TLAČÍTKEM)
  // =========================================================================
  // Stavy: 0 = Auta ZELENÁ, 1 = Auta ORANŽOVÁ, 2 = Auta ČERVENÁ + Chodci ZELENÁ, 3 = ČERVENÁ+ORANŽOVÁ
  let fsmState = 0;

  window.advanceFsm = function () {
    fsmState = (fsmState + 1) % 4;
    renderFsm();
  };

  window.resetFsm = function () {
    fsmState = 0;
    renderFsm();
  };

  function renderFsm() {
    const stateNames = [
      'S0: Auta JEDOU (Zelená) | Chodci STŮJ',
      'S1: Auta POZOR (Oranžová) | Chodci STŮJ',
      'S2: Auta STŮJ (Červená) | Chodci VOLNO',
      'S3: Příprava na rozjezd (Červená + Oranžová)'
    ];

    const label = document.getElementById('fsm-state-label');
    if (label) {
      label.textContent = stateNames[fsmState];
    }

    // Zvýraznění uzlů stavového diagramu
    for (let i = 0; i < 4; i++) {
      const node = document.getElementById(`fsm-node-${i}`);
      if (node) {
        setClass(node, i === fsmState ? 'fsm-node active' : 'fsm-node');
      }
    }

    // Světla semaforu pro auta
    setClass(document.getElementById('tl-car-red'), (fsmState === 2 || fsmState === 3) ? 'sim-led on-red' : 'sim-led');
    setClass(document.getElementById('tl-car-amber'), (fsmState === 1 || fsmState === 3) ? 'sim-led on-amber' : 'sim-led');
    setClass(document.getElementById('tl-car-green'), fsmState === 0 ? 'sim-led on-green' : 'sim-led');

    // Světla pro chodce
    setClass(document.getElementById('tl-ped-red'), fsmState !== 2 ? 'sim-led on-red' : 'sim-led');
    setClass(document.getElementById('tl-ped-green'), fsmState === 2 ? 'sim-led on-green' : 'sim-led');
  }

  // =========================================================================
  // INICIALIZACE PO NAČTENÍ STRÁNKY
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    window.setCombButton(false);
    window.triggerSeqPulse('reset');
    updateRsSim();

    // Výchozí 3 kroky pro waveform hodiny
    pushClkHistory();
    renderClkDemo();

    renderDSim(false, false);
    renderJkSim(false);
    renderCounter();
    renderShiftRegister();
    renderFsm();
  });
})();
