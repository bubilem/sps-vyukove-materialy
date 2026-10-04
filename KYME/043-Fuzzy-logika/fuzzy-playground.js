/**
 * ==========================================================================
 * KYME 043: Fuzzy logika - Interaktivní trenažéry a simulátory
 * SPŠ Výukové materiály
 * ==========================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // TRENAŽÉR 1: FUNKCE PŘÍSLUŠNOSTI (Slide 4)
  // ==========================================================================
  const tempSlider = document.getElementById('tempSlider');
  const tempValBadge = document.getElementById('tempValBadge');
  const barCold = document.getElementById('barCold');
  const barOpt = document.getElementById('barOpt');
  const barHot = document.getElementById('barHot');
  const valCold = document.getElementById('valCold');
  const valOpt = document.getElementById('valOpt');
  const valHot = document.getElementById('valHot');
  const cursorLine = document.getElementById('cursorLine');
  const dotCold = document.getElementById('dotCold');
  const dotOpt = document.getElementById('dotOpt');
  const dotHot = document.getElementById('dotHot');

  // Matematické definice funkcí příslušnosti (teplota -10 až 45 °C)
  // Studená: lichoběžník [-10, -10, 10, 20]
  function calcCold(t) {
    if (t <= 10) return 1.0;
    if (t >= 20) return 0.0;
    return (20 - t) / 10.0;
  }

  // Příjemná / Optimální: trojúhelník [12, 21, 30]
  function calcOpt(t) {
    if (t <= 12 || t >= 30) return 0.0;
    if (t <= 21) return (t - 12) / 9.0;
    return (30 - t) / 9.0;
  }

  // Horká: lichoběžník [22, 32, 45, 45]
  function calcHot(t) {
    if (t <= 22) return 0.0;
    if (t >= 32) return 1.0;
    return (t - 22) / 10.0;
  }

  // Převod teploty T (-10 až 45) na SVG souřadnici X (graf má šířku 500, rozsah 55 st.)
  // X min = 40 (pro -10°C), X max = 460 (pro 45°C), rozsah = 420 px
  function tempToSvgX(t) {
    const minT = -10;
    const maxT = 45;
    const clamped = Math.max(minT, Math.min(maxT, t));
    return 40 + ((clamped - minT) / (maxT - minT)) * 420;
  }

  // Převod hodnoty mu (0 až 1) na SVG souřadnici Y
  // Y = 0 je nahoře (výška grafu 180, základna je na Y=150, strop mu=1 je na Y=30)
  function muToSvgY(mu) {
    return 150 - mu * 120;
  }

  function updateMembershipPlayground(temp) {
    const t = parseFloat(temp);
    if (isNaN(t)) return;

    if (tempValBadge) {
      tempValBadge.textContent = `${t.toFixed(1)} °C`;
    }

    const muC = calcCold(t);
    const muO = calcOpt(t);
    const muH = calcHot(t);

    if (barCold) barCold.style.width = `${(muC * 100).toFixed(0)}%`;
    if (barOpt) barOpt.style.width = `${(muO * 100).toFixed(0)}%`;
    if (barHot) barHot.style.width = `${(muH * 100).toFixed(0)}%`;

    if (valCold) valCold.textContent = muC.toFixed(2);
    if (valOpt) valOpt.textContent = muO.toFixed(2);
    if (valHot) valHot.textContent = muH.toFixed(2);

    const svgX = tempToSvgX(t);
    if (cursorLine) {
      cursorLine.setAttribute('x1', svgX);
      cursorLine.setAttribute('x2', svgX);
    }

    if (dotCold) {
      dotCold.setAttribute('cx', svgX);
      dotCold.setAttribute('cy', muToSvgY(muC));
      dotCold.style.opacity = muC > 0.01 ? '1' : '0.2';
    }
    if (dotOpt) {
      dotOpt.setAttribute('cx', svgX);
      dotOpt.setAttribute('cy', muToSvgY(muO));
      dotOpt.style.opacity = muO > 0.01 ? '1' : '0.2';
    }
    if (dotHot) {
      dotHot.setAttribute('cx', svgX);
      dotHot.setAttribute('cy', muToSvgY(muH));
      dotHot.style.opacity = muH > 0.01 ? '1' : '0.2';
    }
  }

  if (tempSlider) {
    tempSlider.addEventListener('input', (e) => {
      updateMembershipPlayground(e.target.value);
    });
  }

  // Předvolby teplot
  window.setTempPreset = function (val) {
    if (!tempSlider) return;
    tempSlider.value = val;
    updateMembershipPlayground(val);
  };

  // ==========================================================================
  // KALKULÁTOR 2: FUZZY OPERACE (Slide 6)
  // ==========================================================================
  const sliderMuA = document.getElementById('sliderMuA');
  const sliderMuB = document.getElementById('sliderMuB');
  const badgeMuA = document.getElementById('badgeMuA');
  const badgeMuB = document.getElementById('badgeMuB');

  const resNotA = document.getElementById('resNotA');
  const resNotB = document.getElementById('resNotB');
  const resAnd = document.getElementById('resAnd');
  const resOr = document.getElementById('resOr');
  const resProd = document.getElementById('resProd');
  const resSum = document.getElementById('resSum');

  const barNotA = document.getElementById('barNotA');
  const barNotB = document.getElementById('barNotB');
  const barAnd = document.getElementById('barAnd');
  const barOr = document.getElementById('barOr');

  function updateFuzzyOps() {
    if (!sliderMuA || !sliderMuB) return;
    const a = parseFloat(sliderMuA.value);
    const b = parseFloat(sliderMuB.value);

    if (badgeMuA) badgeMuA.textContent = a.toFixed(2);
    if (badgeMuB) badgeMuB.textContent = b.toFixed(2);

    const notA = 1.0 - a;
    const notB = 1.0 - b;
    const andVal = Math.min(a, b);
    const orVal = Math.max(a, b);
    const prodVal = a * b;
    const sumVal = a + b - (a * b);

    if (resNotA) resNotA.textContent = notA.toFixed(2);
    if (resNotB) resNotB.textContent = notB.toFixed(2);
    if (resAnd) resAnd.textContent = andVal.toFixed(2);
    if (resOr) resOr.textContent = orVal.toFixed(2);
    if (resProd) resProd.textContent = prodVal.toFixed(2);
    if (resSum) resSum.textContent = sumVal.toFixed(2);

    if (barNotA) barNotA.style.width = `${(notA * 100).toFixed(0)}%`;
    if (barNotB) barNotB.style.width = `${(notB * 100).toFixed(0)}%`;
    if (barAnd) barAnd.style.width = `${(andVal * 100).toFixed(0)}%`;
    if (barOr) barOr.style.width = `${(orVal * 100).toFixed(0)}%`;
  }

  if (sliderMuA) sliderMuA.addEventListener('input', updateFuzzyOps);
  if (sliderMuB) sliderMuB.addEventListener('input', updateFuzzyOps);

  window.setOpsPreset = function (a, b) {
    if (!sliderMuA || !sliderMuB) return;
    sliderMuA.value = a;
    sliderMuB.value = b;
    updateFuzzyOps();
  };

  // ==========================================================================
  // SIMULÁTOR 3: MECHATRONICKÝ FUZZY REGULÁTOR CHLAZENÍ (Slide 11)
  // ==========================================================================
  let simMode = 'fuzzy'; // 'fuzzy' nebo 'onoff'
  let simTemp = 24.5;
  let simHeatLoad = 45; // ve Wattech
  let simFanSpeed = 50; // v %
  let simRelayState = false; // pro ON/OFF režim
  let simTimer = null;

  const loadSlider = document.getElementById('simLoadSlider');
  const loadBadge = document.getElementById('simLoadBadge');
  const simTempDisplay = document.getElementById('simTempDisplay');
  const simFanDisplay = document.getElementById('simFanDisplay');
  const simFanBlades = document.getElementById('simFanBlades');
  const simStatusBadge = document.getElementById('simStatusBadge');
  const simBarFan = document.getElementById('simBarFan');

  const ruleRowCold = document.getElementById('ruleRowCold');
  const ruleRowOpt = document.getElementById('ruleRowOpt');
  const ruleRowHot = document.getElementById('ruleRowHot');
  const weightCold = document.getElementById('weightCold');
  const weightOpt = document.getElementById('weightOpt');
  const weightHot = document.getElementById('weightHot');

  window.setSimMode = function (mode) {
    simMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    if (simStatusBadge) {
      if (mode === 'fuzzy') {
        simStatusBadge.textContent = 'Fuzzy regulace aktivní: Plynulý tichý chod a stabilní teplota.';
        simStatusBadge.style.color = 'var(--accent)';
      } else {
        simStatusBadge.textContent = 'Dvoupolohové ON/OFF řízení: Hysterezní cyklování, hluk a opotřebení.';
        simStatusBadge.style.color = 'var(--accent-amber)';
      }
    }
  };

  if (loadSlider) {
    loadSlider.addEventListener('input', (e) => {
      simHeatLoad = parseFloat(e.target.value);
      if (loadBadge) loadBadge.textContent = `${simHeatLoad.toFixed(0)} W`;
    });
  }

  // Specifické funkce příslušnosti pro elektrorozváděč v simulátoru
  // 1. STUDENÁ: lichoběžník (vrchol <= 18 °C, klesá k 23 °C)
  function simCalcCold(t) {
    if (t <= 18.0) return 1.0;
    if (t >= 23.0) return 0.0;
    return (23.0 - t) / 5.0;
  }

  // 2. OPTIMÁLNÍ: trojúhelník 19.5 až 27.5 °C (vrchol na 23.5 °C)
  function simCalcOpt(t) {
    if (t <= 19.5 || t >= 27.5) return 0.0;
    if (t <= 23.5) return (t - 19.5) / 4.0;
    return (27.5 - t) / 4.0;
  }

  // 3. HORKÁ: lichoběžník (stoupá od 24.5 °C, vrchol >= 29.5 °C)
  function simCalcHot(t) {
    if (t <= 24.5) return 0.0;
    if (t >= 29.5) return 1.0;
    return (t - 24.5) / 5.0;
  }

  window.simHeatPulse = function () {
    simTemp += 6.0;
    if (simTemp > 48) simTemp = 48;
  };

  window.simCoolPulse = function () {
    simTemp -= 6.0;
    if (simTemp < 16) simTemp = 16;
  };

  function simulateStep() {
    // 1. Výpočet akčního zásahu
    if (simMode === 'fuzzy') {
      // Fuzzy regulace
      const muC = simCalcCold(simTemp);
      const muO = simCalcOpt(simTemp);
      const muH = simCalcHot(simTemp);

      // Váhy pravidel (Mamdani/Sugeno singleton)
      // Pravidlo 1: IF Cold THEN Fan = 15%
      // Pravidlo 2: IF Optimal THEN Fan = 45%
      // Pravidlo 3: IF Hot THEN Fan = 100%
      const w1 = muC;
      const w2 = muO;
      const w3 = muH;
      const sumW = w1 + w2 + w3;

      let targetFan = 45;
      if (sumW > 0.001) {
        targetFan = (w1 * 15 + w2 * 45 + w3 * 100) / sumW;
      }
      // Plynulá setrvačnost ventilátoru
      simFanSpeed += (targetFan - simFanSpeed) * 0.15;

      // Zvýraznění aktivních pravidel v tabulce
      if (ruleRowCold) ruleRowCold.classList.toggle('active-rule', w1 > 0.05);
      if (ruleRowOpt) ruleRowOpt.classList.toggle('active-rule', w2 > 0.05);
      if (ruleRowHot) ruleRowHot.classList.toggle('active-rule', w3 > 0.05);
      if (weightCold) weightCold.textContent = w1.toFixed(2);
      if (weightOpt) weightOpt.textContent = w2.toFixed(2);
      if (weightHot) weightHot.textContent = w3.toFixed(2);

    } else {
      // Dvoupolohové ON/OFF řízení s hysterezí (zapne při > 26°C, vypne při < 22°C)
      if (simTemp > 26.0) {
        simRelayState = true;
      } else if (simTemp < 22.0) {
        simRelayState = false;
      }
      const targetFan = simRelayState ? 100 : 0;
      simFanSpeed += (targetFan - simFanSpeed) * 0.3; // Relé spíná skokově

      if (ruleRowCold) ruleRowCold.classList.remove('active-rule');
      if (ruleRowOpt) ruleRowOpt.classList.remove('active-rule');
      if (ruleRowHot) ruleRowHot.classList.remove('active-rule');
      if (weightCold) weightCold.textContent = simRelayState ? '0.00' : 'VYP';
      if (weightOpt) weightOpt.textContent = '-';
      if (weightHot) weightHot.textContent = simRelayState ? 'ZAP' : '0.00';
    }

    // 2. Fyzikální model teploty v rozváděči
    const ambientTemp = 17.5; // Teplota okolního vzduchu v dílně (17.5 °C)
    // Přírůstek tepla z elektrického ztrátového výkonu (0 až 100 W)
    const heatGain = (simHeatLoad / 50.0) * 0.45;
    // Úbytek tepla pasivním odvodem pláštěm rozváděče
    const passiveCool = (simTemp - ambientTemp) * 0.025;
    // Úbytek tepla nuceným odtahem ventilátoru
    const activeCool = (simFanSpeed / 100.0) * (simTemp - ambientTemp) * 0.045;

    simTemp += heatGain - passiveCool - activeCool;
    simTemp = Math.max(16.0, Math.min(48.0, simTemp));

    // 3. Aktualizace vizuálních prvků v DOM
    if (simTempDisplay) {
      simTempDisplay.textContent = `${simTemp.toFixed(1)} °C`;
      // Zbarvení podle teploty
      if (simTemp >= 27.0) {
        simTempDisplay.style.color = 'var(--accent-rose)';
      } else if (simTemp <= 22.0) {
        simTempDisplay.style.color = 'var(--fuzzy-cold)';
      } else {
        simTempDisplay.style.color = 'var(--fuzzy-opt)';
      }
    }

    if (simFanDisplay) {
      simFanDisplay.textContent = `${simFanSpeed.toFixed(0)} %`;
    }
    if (simBarFan) {
      simBarFan.style.width = `${simFanSpeed.toFixed(0)}%`;
    }

    if (simFanBlades) {
      if (simFanSpeed > 2) {
        simFanBlades.classList.add('spinning');
        // Rychlost rotace podle výkonu
        const dur = Math.max(0.08, 0.9 - (simFanSpeed / 100.0) * 0.8);
        simFanBlades.style.animationDuration = `${dur.toFixed(2)}s`;
      } else {
        simFanBlades.classList.remove('spinning');
      }
    }
  }

  // Spuštění simulačního cyklu
  function startSimulation() {
    if (!simTimer) {
      simTimer = setInterval(simulateStep, 100);
    }
  }

  // ==========================================================================
  // SIMULÁTOR DEFUZZIFIKACE (Slide 8)
  // ==========================================================================
  const sliderDefuzzMu1 = document.getElementById('sliderDefuzzMu1');
  const sliderDefuzzMu2 = document.getElementById('sliderDefuzzMu2');
  const badgeDefuzzMu1 = document.getElementById('badgeDefuzzMu1');
  const badgeDefuzzMu2 = document.getElementById('badgeDefuzzMu2');

  const markerCog = document.getElementById('markerCog');
  const markerMom = document.getElementById('markerMom');
  const markerSugeno = document.getElementById('markerSugeno');

  const valDefuzzCog = document.getElementById('valDefuzzCog');
  const valDefuzzMom = document.getElementById('valDefuzzMom');
  const valDefuzzSugeno = document.getElementById('valDefuzzSugeno');

  const calcFormulaCog = document.getElementById('calcFormulaCog');
  const calcFormulaMom = document.getElementById('calcFormulaMom');
  const calcFormulaSugeno = document.getElementById('calcFormulaSugeno');

  function updateDefuzzSimulator() {
    if (!sliderDefuzzMu1 || !sliderDefuzzMu2) return;
    const mu1 = parseFloat(sliderDefuzzMu1.value);
    const mu2 = parseFloat(sliderDefuzzMu2.value);

    if (badgeDefuzzMu1) badgeDefuzzMu1.textContent = mu1.toFixed(2);
    if (badgeDefuzzMu2) badgeDefuzzMu2.textContent = mu2.toFixed(2);

    // Hodnoty dvou akčních pravidel:
    // Pravidlo 1: Nízký výkon = 30 % (plocha A1 s užší základnou b1 = 40 %)
    // Pravidlo 2: Vysoký výkon = 80 % (plocha A2 se širší základnou b2 = 60 % pro robustní chlazení)
    const y1 = 30;
    const y2 = 80;

    // 1. Metoda těžiště (Mamdani COG): Plocha oříznutého lichoběžníku S = b * mu * (1 - mu/2)
    const area1 = 40.0 * mu1 * (1.0 - 0.5 * mu1);
    const area2 = 60.0 * mu2 * (1.0 - 0.5 * mu2);
    const sumArea = area1 + area2;
    let cogVal = 55;
    if (sumArea > 0.001) {
      cogVal = (y1 * area1 + y2 * area2) / sumArea;
    }

    // 2. Metoda maxima (MOM):
    let momVal = 55;
    let momText = 'Obě pravidla mají stejnou váhu &rarr; střed mezi pravidly (55 % PWM)';
    if (mu1 > mu2) {
      momVal = y1;
      momText = `Pravidlo 1 dominuje (${mu1.toFixed(2)} &gt; ${mu2.toFixed(2)}) &rarr; skok na 30 % PWM`;
    } else if (mu2 > mu1) {
      momVal = y2;
      momText = `Pravidlo 2 dominuje (${mu2.toFixed(2)} &gt; ${mu1.toFixed(2)}) &rarr; skok na 80 % PWM`;
    }

    // 3. Metoda Sugeno: Přímý vážený průměr diskrétních bodů (singletonů bez ploch)
    const sumMu = mu1 + mu2;
    let sugenoVal = 55;
    if (sumMu > 0.001) {
      sugenoVal = (mu1 * y1 + mu2 * y2) / sumMu;
    }

    // Pozice značek na stupnici (0 až 100 %) v jednotlivých pruzích
    if (markerCog) markerCog.style.left = `${cogVal.toFixed(1)}%`;
    if (markerMom) markerMom.style.left = `${momVal.toFixed(1)}%`;
    if (markerSugeno) markerSugeno.style.left = `${sugenoVal.toFixed(1)}%`;

    if (valDefuzzCog) valDefuzzCog.textContent = `${cogVal.toFixed(1)} % PWM`;
    if (valDefuzzMom) valDefuzzMom.textContent = `${momVal.toFixed(0)} % PWM`;
    if (valDefuzzSugeno) valDefuzzSugeno.textContent = `${sugenoVal.toFixed(1)} % PWM`;

    if (calcFormulaCog) {
      calcFormulaCog.textContent = `(30 · ${area1.toFixed(1)} + 80 · ${area2.toFixed(1)}) / (${area1.toFixed(1)} + ${area2.toFixed(1)}) = ${cogVal.toFixed(1)} % PWM`;
    }
    if (calcFormulaMom) {
      calcFormulaMom.innerHTML = momText;
    }
    if (calcFormulaSugeno) {
      calcFormulaSugeno.textContent = `(${mu1.toFixed(2)} · 30 + ${mu2.toFixed(2)} · 80) / (${mu1.toFixed(2)} + ${mu2.toFixed(2)}) = ${sugenoVal.toFixed(1)} % PWM`;
    }
  }

  if (sliderDefuzzMu1) sliderDefuzzMu1.addEventListener('input', updateDefuzzSimulator);
  if (sliderDefuzzMu2) sliderDefuzzMu2.addEventListener('input', updateDefuzzSimulator);

  window.setDefuzzPreset = function (m1, m2) {
    if (!sliderDefuzzMu1 || !sliderDefuzzMu2) return;
    sliderDefuzzMu1.value = m1;
    sliderDefuzzMu2.value = m2;
    updateDefuzzSimulator();
  };

  // ==========================================================================
  // OPAKOVACÍ KVÍZ: AKORDEON (Slide 13)
  // ==========================================================================
  window.toggleFaqAnswer = function (btn) {
    const card = btn.closest('.faq-card');
    if (!card) return;
    const isOpen = card.classList.toggle('open');
    btn.innerHTML = isOpen
      ? `<svg class="icon" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> Skrýt odpověď`
      : `<svg class="icon" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Zobrazit odpověď`;
  };

  // Inicializace po načtení DOM
  document.addEventListener('DOMContentLoaded', () => {
    updateMembershipPlayground(22.0);
    updateFuzzyOps();
    updateDefuzzSimulator();
    startSimulation();
  });

})();
