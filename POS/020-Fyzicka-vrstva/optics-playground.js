/**
 * ==========================================================================
 * POS 020 - Fyzická vrstva: Interaktivní simulátor Snellova zákona a úplného odrazu
 * Snímek 6: Šíření světla v optickém vlákně (Core vs. Cladding)
 * 100% Offline & Pure Vanilla JavaScript s High-DPI Canvas a animací fotonů
 * ==========================================================================
 */

(function () {
  'use strict';

  // Výchozí fyzikální parametry
  const PRESETS = {
    fiber: {
      name: 'Optické vlákno (Telekomunikace)',
      badge: 'Core 1,480 / Cladding 1,460',
      n1: 1.480,
      name1: 'Jádro vlákna (Core)',
      n2: 1.460,
      name2: 'Plášť vlákna (Cladding)',
      defaultAngle: 83, // Větší než mezní úhel (80.6°) pro demonstraci TIR
      desc: 'Typické skleněné jednovidové/vícevidové vlákno. Malý rozdíl indexů vyžaduje vysoký úhel dopadu vůči kolmici (θ₁ > 80,6°).'
    },
    glass: {
      name: 'Křemenné sklo do vzduchu',
      badge: 'Sklo 1,500 / Vzduch 1,000',
      n1: 1.500,
      name1: 'Křemenné sklo',
      n2: 1.000,
      name2: 'Vzduch (Atmosféra)',
      defaultAngle: 45,
      desc: 'Klasický laboratorní pokus s optickým hranolem. Mezní úhel je cca 41,8°.'
    },
    water: {
      name: 'Voda do vzduchu',
      badge: 'Voda 1,333 / Vzduch 1,000',
      n1: 1.333,
      name1: 'Vodní prostředí',
      n2: 1.000,
      name2: 'Vzduch',
      defaultAngle: 52,
      desc: 'Pohled zpod vodní hladiny. Světlo nad úhlem 48,8° se odráží zpět do vody (Snellovo okno).'
    }
  };

  let currentPresetKey = 'fiber';
  let n1 = PRESETS.fiber.n1;
  let n2 = PRESETS.fiber.n2;
  let incidentAngleDeg = PRESETS.fiber.defaultAngle; // Úhel vůči kolmici ve stupních (0 až 89)
  let isDragging = false;
  let animOffset = 0;
  let animFrameId = null;

  // DOM prvky
  let canvas = null;
  let ctx = null;
  let angleSlider = null;
  let angleValBadge = null;
  let statTheta1 = null;
  let statThetaC = null;
  let statTheta2 = null;
  let statTirMode = null;
  let statReflectance = null;
  let tirAlertBox = null;

  function initOpticsSimulator() {
    canvas = document.getElementById('opticsCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    angleSlider = document.getElementById('opticsAngleSlider');
    angleValBadge = document.getElementById('opticsAngleVal');
    statTheta1 = document.getElementById('statOpticsTheta1');
    statThetaC = document.getElementById('statOpticsThetaC');
    statTheta2 = document.getElementById('statOpticsTheta2');
    statTirMode = document.getElementById('statOpticsTirMode');
    statReflectance = document.getElementById('statOpticsReflectance');
    tirAlertBox = document.getElementById('opticsTirAlert');

    // Inicializace tlačítek presetů
    const presetBtns = document.querySelectorAll('.optics-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-preset');
        if (PRESETS[key]) {
          currentPresetKey = key;
          n1 = PRESETS[key].n1;
          n2 = PRESETS[key].n2;
          incidentAngleDeg = PRESETS[key].defaultAngle;
          if (angleSlider) angleSlider.value = incidentAngleDeg;
          presetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateSimulation();
        }
      });
    });

    // Slider úhlu
    if (angleSlider) {
      angleSlider.addEventListener('input', (e) => {
        incidentAngleDeg = parseFloat(e.target.value);
        updateSimulation();
      });
    }

    // Tlačítko pro nastavení přesně mezního úhlu θc
    const btnSetCritical = document.getElementById('opticsSetCriticalBtn');
    if (btnSetCritical) {
      btnSetCritical.addEventListener('click', () => {
        const crit = getCriticalAngleDeg();
        if (crit !== null) {
          incidentAngleDeg = Math.round(crit * 10) / 10;
          if (angleSlider) angleSlider.value = incidentAngleDeg;
          updateSimulation();
        }
      });
    }

    // Interaktivní tažení myší / dotykem přímo na plátně
    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    // Responzivní přizpůsobení plátna
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Spuštění animační smyčky fotonů
    startAnimation();
  }

  function getCriticalAngleDeg() {
    if (n1 <= n2) return null;
    return (Math.asin(n2 / n1) * 180) / Math.PI;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 420;
    const h = rect.height || 260;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    renderScene();
  }

  function handlePointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    checkAndApplyPointer(x, y);
    isDragging = true;
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    checkAndApplyPointer(x, y);
  }

  function handlePointerUp() {
    isDragging = false;
  }

  function handleTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    checkAndApplyPointer(touch.clientX - rect.left, touch.clientY - rect.top);
    isDragging = true;
  }

  function handleTouchMove(e) {
    if (!isDragging || !e.touches || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    checkAndApplyPointer(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  function checkAndApplyPointer(x, y) {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Počítáme pouze pro dolní polorovinu (Prostředí 1)
    const dx = x - cx;
    const dy = y - cy;

    if (dy > 10) { // Musí být v dolním prostředí (jádře)
      // Úhel vůči záporné vertikále (kolmici dolů)
      let deg = (Math.atan2(-dx, dy) * 180) / Math.PI;
      // Omezíme na rozsah 1° až 88°
      deg = Math.max(1, Math.min(88, deg));
      incidentAngleDeg = Math.round(deg * 10) / 10;
      if (angleSlider) angleSlider.value = incidentAngleDeg;
      updateSimulation();
    }
  }

  function updateSimulation() {
    if (angleValBadge) angleValBadge.textContent = incidentAngleDeg.toFixed(1) + '°';

    const theta1Rad = (incidentAngleDeg * Math.PI) / 180;
    const critDeg = getCriticalAngleDeg();
    const isTir = (critDeg !== null && incidentAngleDeg >= critDeg);

    // Snellův zákon: sin(θ2) = (n1 / n2) * sin(θ1)
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    let theta2Deg = null;
    let theta2Rad = null;
    let reflectance = 1.0;

    if (sinTheta2 <= 1.0) {
      theta2Rad = Math.asin(sinTheta2);
      theta2Deg = (theta2Rad * 180) / Math.PI;

      // Fresnelovy vztahy pro odraz R
      const cosT1 = Math.cos(theta1Rad);
      const cosT2 = Math.cos(theta2Rad);
      const rs = Math.pow((n1 * cosT1 - n2 * cosT2) / (n1 * cosT1 + n2 * cosT2), 2);
      const rp = Math.pow((n1 * cosT2 - n2 * cosT1) / (n1 * cosT2 + n2 * cosT1), 2);
      reflectance = Math.min(0.99, (rs + rp) / 2);
    } else {
      reflectance = 1.0;
    }

    // Aktualizace telemetrických údajů
    if (statTheta1) statTheta1.textContent = incidentAngleDeg.toFixed(1) + '°';
    if (statThetaC) statThetaC.textContent = critDeg !== null ? critDeg.toFixed(1) + '°' : 'N/A (n₁ ≤ n₂)';
    if (statTheta2) {
      if (isTir) {
        statTheta2.textContent = 'Nenastává (TIR)';
        statTheta2.style.color = '#ef4444';
      } else {
        statTheta2.textContent = theta2Deg !== null ? theta2Deg.toFixed(1) + '°' : 'N/A';
        statTheta2.style.color = '#10b981';
      }
    }

    const refPct = Math.round(reflectance * 100);
    const transPct = 100 - refPct;

    if (statReflectance) {
      statReflectance.textContent = `Odraz R = ${refPct} % | Únik T = ${transPct} %`;
    }

    if (statTirMode) {
      if (isTir) {
        statTirMode.textContent = 'ÚPLNÝ VNITŘNÍ ODRAZ (100% odraz zpět)';
        statTirMode.className = 'badge badge-success';
        statTirMode.style.background = 'rgba(16, 185, 129, 0.2)';
        statTirMode.style.borderColor = '#10b981';
        statTirMode.style.color = '#10b981';
      } else if (Math.abs(incidentAngleDeg - (critDeg || 0)) < 0.8) {
        statTirMode.textContent = 'Kritický mezní stav (θ₂ ≈ 90°)';
        statTirMode.className = 'badge';
        statTirMode.style.background = 'rgba(245, 158, 11, 0.2)';
        statTirMode.style.borderColor = '#f59e0b';
        statTirMode.style.color = '#f59e0b';
      } else {
        statTirMode.textContent = 'Lom do pláště + částečný odraz';
        statTirMode.className = 'badge';
        statTirMode.style.background = 'rgba(56, 189, 248, 0.15)';
        statTirMode.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        statTirMode.style.color = '#38bdf8';
      }
    }

    if (tirAlertBox) {
      if (isTir) {
        tirAlertBox.innerHTML = `
          <strong style="color: #10b981; display: flex; align-items: center; gap: 0.35rem;">
            <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Úplný vnitřní odraz (TIR) aktivní:
          </strong>
          <span>Úhel dopadu <strong>${incidentAngleDeg.toFixed(1)}° &gt; ${critDeg.toFixed(1)}°</strong>. Žádné světlo neuniká ven do pláště (únik T = 0 %). Přesně takto se signál šíří kilometry optickým vláknem se 100% odrazem a nulovou ztrátou do stran!</span>
        `;
        tirAlertBox.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        tirAlertBox.style.background = 'rgba(16, 185, 129, 0.08)';
      } else {
        tirAlertBox.innerHTML = `
          <strong style="color: #f59e0b; display: flex; align-items: center; gap: 0.35rem;">
            <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Světlo uniká z jádra do pláště:
          </strong>
          <span>Úhel dopadu <strong>${incidentAngleDeg.toFixed(1)}° &lt; mezního úhlu ${critDeg !== null ? critDeg.toFixed(1) + '°' : 'N/A'}</strong>. Část energie (únik T = ${transPct} %) se láme ven z vlákna. Tím by v síti docházelo k útlumu a ztrátě signálu!</span>
        `;
        tirAlertBox.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        tirAlertBox.style.background = 'rgba(245, 158, 11, 0.06)';
      }
    }

    renderScene();
  }

  function startAnimation() {
    function loop() {
      animOffset += 0.8;
      if (animOffset > 24) animOffset = 0;
      renderScene();
      animFrameId = requestAnimationFrame(loop);
    }
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(loop);
  }

  function renderScene() {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    const cx = w / 2;
    const cy = h / 2;
    const rayLength = Math.min(cx, cy) * 0.88;

    ctx.clearRect(0, 0, w, h);

    const preset = PRESETS[currentPresetKey];

    // 1. Horní polovina: Prostředí 2 (Plášť / Vzduch - n2)
    ctx.fillStyle = (currentPresetKey === 'fiber') ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.5)';
    ctx.fillRect(0, 0, w, cy);

    // 2. Dolní polovina: Prostředí 1 (Jádro / Sklo - n1)
    const grad1 = ctx.createLinearGradient(0, cy, 0, h);
    grad1.addColorStop(0, 'rgba(14, 116, 144, 0.25)');
    grad1.addColorStop(1, 'rgba(8, 47, 73, 0.45)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, cy, w, h - cy);

    // Popisky prostředí
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`Prostředí 2: ${preset.name2} (n₂ = ${n2.toFixed(3)})`, 14, 22);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Prostředí 1: ${preset.name1} (n₁ = ${n1.toFixed(3)})`, 14, h - 14);

    // 3. Rozhraní prostředí (Interface line)
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.font = '500 10px monospace';
    ctx.fillText('Rozhraní prostředí', w - 12, cy - 6);

    // 4. Kolmice k rozhraní (Normála)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(cx, 16);
    ctx.lineTo(cx, h - 16);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('Kolmice (N)', cx + 6, 26);

    // 5. Výpočet geometrie paprsků
    const theta1Rad = (incidentAngleDeg * Math.PI) / 180;
    const critDeg = getCriticalAngleDeg();
    const isTir = (critDeg !== null && incidentAngleDeg >= critDeg);

    // Dopadající paprsek: z levého dolního kvadrantu do středu (cx, cy)
    // Úhel incidentAngleDeg je vůči vertikále dolů
    const incidentX = cx - rayLength * Math.sin(theta1Rad);
    const incidentY = cy + rayLength * Math.cos(theta1Rad);

    // 6. Mezní úhel θc: Vykreslení referenčního kužele mezního úhlu (tečkovaně)
    if (critDeg !== null) {
      const critRad = (critDeg * Math.PI) / 180;
      const critX = cx - rayLength * 0.9 * Math.sin(critRad);
      const critY = cy + rayLength * 0.9 * Math.cos(critRad);

      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(cx, cy);
      ctx.lineTo(critX, critY);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`θc = ${critDeg.toFixed(1)}°`, critX - 4, critY + 12);
    }

    // 7. Oblouk úhlu dopadu θ1
    const arcR = Math.min(50, rayLength * 0.4);
    ctx.beginPath();
    // Od vertikály dolů (Math.PI/2) doleva (Math.PI/2 + theta1Rad)
    ctx.arc(cx, cy, arcR, Math.PI / 2, Math.PI / 2 + theta1Rad, false);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const arcMidRad = Math.PI / 2 + theta1Rad / 2;
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`θ₁=${incidentAngleDeg.toFixed(0)}°`, cx + (arcR + 14) * Math.cos(arcMidRad), cy + (arcR + 14) * Math.sin(arcMidRad));

    // 8. Vykreslení dopadajícího laserového paprsku
    ctx.beginPath();
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Laserový zdroj / emitor (kolečko na konci dopadajícího paprsku)
    ctx.beginPath();
    ctx.arc(incidentX, incidentY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Pulzující fotony po dopadajícím paprsku
    const numPhotons = 4;
    for (let i = 0; i < numPhotons; i++) {
      const frac = ((animOffset / 24 + i / numPhotons) % 1);
      const px = incidentX + (cx - incidentX) * frac;
      const py = incidentY + (cy - incidentY) * frac;
      ctx.beginPath();
      ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 9. Odražený paprsek (Reflected ray): do pravého dolního kvadrantu
    // Vychází ze středu (cx, cy) pod stejným úhlem theta1Rad vůči vertikále
    const reflectX = cx + rayLength * Math.sin(theta1Rad);
    const reflectY = cy + rayLength * Math.cos(theta1Rad);

    // Fresnelův výpočet odrazivosti
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    let reflectance = 1.0;
    let theta2Rad = null;

    if (sinTheta2 <= 1.0) {
      theta2Rad = Math.asin(sinTheta2);
      const cosT1 = Math.cos(theta1Rad);
      const cosT2 = Math.cos(theta2Rad);
      const rs = Math.pow((n1 * cosT1 - n2 * cosT2) / (n1 * cosT1 + n2 * cosT2), 2);
      const rp = Math.pow((n1 * cosT2 - n2 * cosT1) / (n1 * cosT2 + n2 * cosT1), 2);
      reflectance = Math.min(0.99, (rs + rp) / 2);
    } else {
      reflectance = 1.0;
    }

    // Vykreslení odraženého paprsku
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(reflectX, reflectY);

    if (isTir) {
      // 100% odraz - zářící smaragdově zelený nebo zlatý paprsek
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.6;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Fotony po odraženém paprsku
      for (let i = 0; i < numPhotons; i++) {
        const frac = ((animOffset / 24 + i / numPhotons) % 1);
        const px = cx + (reflectX - cx) * frac;
        const py = cy + (reflectY - cy) * frac;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#a7f3d0';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Popisek TIR na paprsku
      ctx.fillStyle = '#10b981';
      ctx.font = '700 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('100% ODRAZ (TIR)', reflectX + 8, reflectY);
    } else {
      // Částečný odraz
      const alpha = Math.max(0.18, reflectance * 0.9);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = Math.max(1.5, 3.2 * reflectance);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6 * reflectance;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '500 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Část. odraz (${Math.round(reflectance * 100)} %)`, reflectX + 8, reflectY);
    }

    // 10. Lomený paprsek (Refracted ray): do pravého horního kvadrantu
    if (!isTir && theta2Rad !== null) {
      // Úhel vůči vertikále NAHORU
      const refractX = cx + rayLength * Math.sin(theta2Rad);
      const refractY = cy - rayLength * Math.cos(theta2Rad);

      const transAlpha = Math.max(0.2, (1 - reflectance) * 0.95);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refractX, refractY);
      ctx.strokeStyle = `rgba(239, 68, 68, ${transAlpha})`;
      ctx.lineWidth = Math.max(1.6, 3.2 * (1 - reflectance));
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Fotony unikající do pláště
      for (let i = 0; i < numPhotons; i++) {
        const frac = ((animOffset / 24 + i / numPhotons) % 1);
        const px = cx + (refractX - cx) * frac;
        const py = cy + (refractY - cy) * frac;
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = '#fca5a5';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Oblouk úhlu lomu θ2
      const arc2R = Math.min(45, rayLength * 0.35);
      ctx.beginPath();
      ctx.arc(cx, cy, arc2R, -Math.PI / 2, -Math.PI / 2 + theta2Rad, false);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      const theta2Deg = (theta2Rad * 180) / Math.PI;
      const arc2MidRad = -Math.PI / 2 + theta2Rad / 2;
      ctx.fillStyle = '#ef4444';
      ctx.font = '600 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`θ₂=${theta2Deg.toFixed(0)}°`, cx + (arc2R + 14) * Math.cos(arc2MidRad), cy + (arc2R + 14) * Math.sin(arc2MidRad));

      // Popisek lomu
      ctx.fillStyle = '#ef4444';
      ctx.font = '600 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Únik do pláště (${Math.round((1 - reflectance) * 100)} %)`, refractX + 8, refractY);
    }

    // 11. Středový bod dopadu
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = isTir ? '#10b981' : '#38bdf8';
    ctx.shadowColor = isTir ? '#10b981' : '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Inicializace po načtení stránky
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOpticsSimulator);
  } else {
    initOpticsSimulator();
  }

  // Registrace pro případné přepnutí na slide 6
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#slide-6') {
      setTimeout(resizeCanvas, 80);
    }
  });

})();
