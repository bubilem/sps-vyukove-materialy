/**
 * ==========================================================================
 * POS 020 - Fyzická vrstva: Interaktivní vizualizér bezdrátových technologií
 * 1. Vyzařovací charakteristiky antén (Polární diagramy, Fresnelova zóna)
 * 2. Wi-Fi 6 a modulace 1024-QAM (10 bitů na symbol, IQ rovina, šum SNR)
 * 100% Offline & Pure Vanilla JavaScript s High-DPI Canvas
 * ==========================================================================
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. MODUL: Vyzařovací charakteristiky antén (Snímek 12)
  // =========================================================================

  let antennaCanvas = null;
  let antennaCtx = null;
  let currentAntennaType = 'omni'; // 'omni' | 'directional' | 'sector' | 'beamforming'
  let beamformingAngle = 25; // úhel ve stupních pro beamforming (-60 až +60)
  let antennaAnimPhase = 0;
  let antennaAnimId = null;

  const ANTENNA_DATA = {
    omni: {
      name: 'Všesměrová anténa (Dipól)',
      gain: '2,15 dBi (0 dBd)',
      hpbwH: '360° (Všesměrový azimut)',
      hpbwV: '78° (Tvar donutu / zploštělý toroid)',
      fbRatio: '0 dB (Kruhové vyzařování)',
      useCase: 'Domácí Wi-Fi AP, všesměrové tyčové antény pro rovnoměrné pokrytí místnosti',
      color: '#38bdf8'
    },
    directional: {
      name: 'Směrová anténa (Yagi / Parabola)',
      gain: '18–24 dBi',
      hpbwH: '20° (Úzký koncentrovaný paprsek)',
      hpbwV: '18° (Minimální rozptyl)',
      fbRatio: '> 25 dB (Silné potlačení zpětného vyzařování)',
      useCase: 'Dálkové spoje Point-to-Point (PTP) mezi budovami na kilometry (např. 5 GHz spoj)',
      color: '#10b981'
    },
    sector: {
      name: 'Sektorová anténa (120° / 90°)',
      gain: '14–17 dBi',
      hpbwH: '120° (popř. 90° dle typu)',
      hpbwV: '8–12° (Plochý vertikální profil)',
      fbRatio: '> 25 dB (Vysoké potlačení vyzařování vzad)',
      useCase: 'BTS vysílače mobilních sítí a WISP: 3 sektory po 120° (nebo 4 sektory po 90°) pokryjí celý prostor 360° bez hluchých míst',
      color: '#f59e0b'
    },
    beamforming: {
      name: 'Smart Beamforming (MU-MIMO v Wi-Fi 6/7)',
      gain: '+3 až +6 dB efektivní zisk SNR',
      hpbwH: 'Dynamicky směrovaný adaptivní lalok',
      hpbwV: 'Fázově řízená soustava antén',
      fbRatio: 'Adaptivní nulování interferencí',
      useCase: 'Elektronické sledování polohy mobilního klienta (telefon, notebook) v reálném čase',
      color: '#a855f7'
    }
  };

  function initAntennaExplorer() {
    antennaCanvas = document.getElementById('antennaCanvas');
    if (!antennaCanvas) return;
    antennaCtx = antennaCanvas.getContext('2d');

    // Tlačítka výběru typu antény
    const typeButtons = document.querySelectorAll('.antenna-type-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAntennaType = btn.getAttribute('data-type');

        const steerControl = document.getElementById('beamformingSteerControl');
        if (steerControl) {
          steerControl.style.display = (currentAntennaType === 'beamforming') ? 'flex' : 'none';
        }

        updateAntennaCard();
        renderAntennaPattern();
      });
    });

    // Slider pro směrování beamformingu
    const steerSlider = document.getElementById('beamformingSlider');
    const steerVal = document.getElementById('beamformingAngleVal');
    if (steerSlider) {
      steerSlider.addEventListener('input', (e) => {
        beamformingAngle = parseFloat(e.target.value);
        if (steerVal) steerVal.textContent = (beamformingAngle >= 0 ? '+' : '') + beamformingAngle + '°';
        renderAntennaPattern();
      });
    }

    // Kliknutí do plátna pro natočení beamformingu
    antennaCanvas.addEventListener('click', (e) => {
      if (currentAntennaType !== 'beamforming') return;
      const rect = antennaCanvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const x = e.clientX - rect.left - cx;
      const y = e.clientY - rect.top - cy;
      let angleDeg = (Math.atan2(y, x) * 180) / Math.PI;
      // Konverze na osu 0° nahoře nebo doprava
      // Přizpůsobíme na dopředný rozsah
      if (angleDeg > 90) angleDeg = 90;
      if (angleDeg < -90) angleDeg = -90;
      beamformingAngle = Math.round(angleDeg);
      if (steerSlider) steerSlider.value = beamformingAngle;
      if (steerVal) steerVal.textContent = (beamformingAngle >= 0 ? '+' : '') + beamformingAngle + '°';
      renderAntennaPattern();
    });

    updateAntennaCard();
    resizeAntennaCanvas();
    startAntennaAnimation();
  }

  function updateAntennaCard() {
    const data = ANTENNA_DATA[currentAntennaType];
    if (!data) return;

    const nameEl = document.getElementById('antPropName');
    const gainEl = document.getElementById('antPropGain');
    const hpbwHEl = document.getElementById('antPropHpbwH');
    const hpbwVEl = document.getElementById('antPropHpbwV');
    const fbEl = document.getElementById('antPropFb');
    const useEl = document.getElementById('antPropUse');

    if (nameEl) nameEl.textContent = data.name;
    if (gainEl) gainEl.textContent = data.gain;
    if (hpbwHEl) hpbwHEl.textContent = data.hpbwH;
    if (hpbwVEl) hpbwVEl.textContent = data.hpbwV;
    if (fbEl) fbEl.textContent = data.fbRatio;
    if (useEl) useEl.textContent = data.useCase;
  }

  function resizeAntennaCanvas() {
    if (!antennaCanvas) return;
    const rect = antennaCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 360;
    const h = rect.height || 360;

    antennaCanvas.width = w * dpr;
    antennaCanvas.height = h * dpr;
    antennaCtx.resetTransform();
    antennaCtx.scale(dpr, dpr);
    renderAntennaPattern();
  }

  function startAntennaAnimation() {
    if (antennaAnimId) cancelAnimationFrame(antennaAnimId);
    function loop() {
      antennaAnimPhase = (antennaAnimPhase + 0.035) % (Math.PI * 2);
      renderAntennaPattern();
      antennaAnimId = requestAnimationFrame(loop);
    }
    antennaAnimId = requestAnimationFrame(loop);
  }

  function getGainAtAngle(type, thetaRad) {
    // Normalizace úhlu do symetrického rozsahu [-180°, +180°], kde 0° je osa x (doprava)
    let deg = (thetaRad * 180) / Math.PI;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;

    if (type === 'omni') {
      // Všesměrový horizontální řez je kruh s drobným reálným zvlněním
      return 0.95 + 0.05 * Math.cos(4 * thetaRad);
    }

    if (type === 'directional') {
      // Yagi/Parabola: Úzký hlavní lalok dopředu (-10° až +10° pro HPBW cca 20°)
      const mainBeam = Math.exp(-Math.pow(deg / 11, 2));
      const sideLobes = 0.15 * Math.abs(Math.sin((deg * Math.PI) / 25)) * Math.pow(Math.cos(thetaRad * 0.5), 2);
      const backLobe = 0.06 * Math.pow(Math.cos(thetaRad), 4) * (Math.abs(deg) > 90 ? 1 : 0);
      return Math.max(0.02, mainBeam + sideLobes + backLobe);
    }

    if (type === 'sector') {
      // Sektorová anténa: vyzařuje v úhlu 120° (symetricky od -60° do +60°)
      const absDeg = Math.abs(deg);
      let r = 0;
      if (absDeg <= 60) {
        // V sektoru 120° široký otevřený vějíř s poklesem o cca -3 dB na okrajích (±60°)
        r = 0.96 - 0.25 * Math.pow(absDeg / 60, 2);
      } else {
        // Strmý pokles mimo 120° sektor (potlačení za anténu)
        const offAngle = absDeg - 60;
        r = 0.18 * Math.exp(-offAngle / 16);
      }
      return Math.max(0.02, r);
    }

    if (type === 'beamforming') {
      // Fázově řízený svazek zaměřený na beamformingAngle
      let dDeg = deg - beamformingAngle;
      while (dDeg > 180) dDeg -= 360;
      while (dDeg < -180) dDeg += 360;
      const mainBeam = Math.exp(-Math.pow(dDeg / 14, 2));
      const gratingLobes = 0.12 * Math.abs(Math.sin((deg + beamformingAngle) * 3));
      return Math.max(0.02, mainBeam * 0.96 + gratingLobes);
    }

    return 0.5;
  }

  function renderAntennaPattern() {
    if (!antennaCanvas || !antennaCtx) return;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const w = antennaCanvas.clientWidth || 360;
    const h = antennaCanvas.clientHeight || 360;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(cx, cy) - 26;

    antennaCtx.clearRect(0, 0, w, h);

    // 1. Kreslení polární mřížky (kružnice dB a úhly)
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // Soustředné kružnice
    const circles = [
      { r: maxR, label: '0 dB' },
      { r: maxR * 0.707, label: '-3 dB' },
      { r: maxR * 0.5, label: '-10 dB' },
      { r: maxR * 0.25, label: '-20 dB' }
    ];

    circles.forEach(c => {
      antennaCtx.beginPath();
      antennaCtx.arc(cx, cy, c.r, 0, Math.PI * 2);
      antennaCtx.strokeStyle = (c.label === '-3 dB') ? (isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.35)') : gridColor;
      antennaCtx.lineWidth = (c.label === '-3 dB') ? 1.5 : 1;
      if (c.label === '-3 dB') antennaCtx.setLineDash([4, 4]);
      else antennaCtx.setLineDash([]);
      antennaCtx.stroke();
      antennaCtx.setLineDash([]);

      // Popisek dB
      antennaCtx.fillStyle = (c.label === '-3 dB') ? '#38bdf8' : textColor;
      antennaCtx.font = '10px monospace';
      antennaCtx.textAlign = 'left';
      antennaCtx.textBaseline = 'bottom';
      antennaCtx.fillText(c.label, cx + 4, cy - c.r + 12);
    });

    // Radiální paprsky (úhly po 30 stupních)
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const x = cx + maxR * Math.cos(rad);
      const y = cy + maxR * Math.sin(rad);

      antennaCtx.beginPath();
      antennaCtx.moveTo(cx, cy);
      antennaCtx.lineTo(x, y);
      antennaCtx.strokeStyle = gridColor;
      antennaCtx.lineWidth = (deg === 0 || deg === 90 || deg === 180 || deg === 270) ? 1.4 : 0.8;
      antennaCtx.stroke();

      // Popisky úhlů na vnějším okraji
      const labelX = cx + (maxR + 14) * Math.cos(rad);
      const labelY = cy + (maxR + 14) * Math.sin(rad);
      antennaCtx.fillStyle = textColor;
      antennaCtx.font = '10px monospace';
      antennaCtx.textAlign = 'center';
      antennaCtx.textBaseline = 'middle';
      antennaCtx.fillText(deg + '°', labelX, labelY);
    }

    // 2. Animované RF vyzařovací vlny (pulzující soustředné kruhy/laloky)
    const waveCount = 3;
    for (let i = 0; i < waveCount; i++) {
      const p = (antennaAnimPhase / (Math.PI * 2) + i / waveCount) % 1;
      const pulseR = maxR * p;
      const alpha = (1 - p) * 0.22;

      antennaCtx.beginPath();
      const numPts = 72;
      for (let j = 0; j <= numPts; j++) {
        const rad = (j / numPts) * Math.PI * 2;
        const gain = getGainAtAngle(currentAntennaType, rad);
        const r = pulseR * gain;
        const px = cx + r * Math.cos(rad);
        const py = cy + r * Math.sin(rad);
        if (j === 0) antennaCtx.moveTo(px, py);
        else antennaCtx.lineTo(px, py);
      }
      antennaCtx.strokeStyle = (currentAntennaType === 'directional') ? `rgba(16, 185, 129, ${alpha})` :
                               (currentAntennaType === 'sector') ? `rgba(245, 158, 11, ${alpha})` :
                               (currentAntennaType === 'beamforming') ? `rgba(168, 85, 247, ${alpha})` :
                               `rgba(56, 189, 248, ${alpha})`;
      antennaCtx.lineWidth = 1.5;
      antennaCtx.stroke();
    }

    // 3. Vygenerování a vykreslení vyzařovacího diagramu (Laloky)
    const numPoints = 180;
    const pts = [];
    for (let i = 0; i <= numPoints; i++) {
      const rad = (i / numPoints) * Math.PI * 2;
      const gain = getGainAtAngle(currentAntennaType, rad);
      const r = maxR * gain;
      pts.push({
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
        rad,
        gain
      });
    }

    // Výplň laloku s radiálním gradientem
    const mainColor = ANTENNA_DATA[currentAntennaType].color;
    const grad = antennaCtx.createRadialGradient(cx, cy, 5, cx, cy, maxR);
    grad.addColorStop(0, mainColor + '66');
    grad.addColorStop(0.7, mainColor + '33');
    grad.addColorStop(1, mainColor + '08');

    antennaCtx.beginPath();
    pts.forEach((p, idx) => {
      if (idx === 0) antennaCtx.moveTo(p.x, p.y);
      else antennaCtx.lineTo(p.x, p.y);
    });
    antennaCtx.closePath();
    antennaCtx.fillStyle = grad;
    antennaCtx.fill();

    // Obrys laloku
    antennaCtx.strokeStyle = mainColor;
    antennaCtx.lineWidth = 2.4;
    antennaCtx.shadowColor = mainColor;
    antennaCtx.shadowBlur = 10;
    antennaCtx.stroke();
    antennaCtx.shadowBlur = 0;

    // 4. Středový bod / symbol antény
    antennaCtx.beginPath();
    antennaCtx.arc(cx, cy, 6, 0, Math.PI * 2);
    antennaCtx.fillStyle = '#ffffff';
    antennaCtx.fill();
    antennaCtx.strokeStyle = mainColor;
    antennaCtx.lineWidth = 2;
    antennaCtx.stroke();

    // 5. Zvláštní indikátor pro Beamforming (směr na klienta)
    if (currentAntennaType === 'beamforming') {
      const steerRad = (beamformingAngle * Math.PI) / 180;
      const targetDist = maxR + 10;
      const tx = cx + targetDist * Math.cos(steerRad);
      const ty = cy + targetDist * Math.sin(steerRad);

      // Přerušovaný zaměřovací vektor
      antennaCtx.beginPath();
      antennaCtx.moveTo(cx, cy);
      antennaCtx.lineTo(tx, ty);
      antennaCtx.strokeStyle = '#c084fc';
      antennaCtx.lineWidth = 1.6;
      antennaCtx.setLineDash([3, 3]);
      antennaCtx.stroke();
      antennaCtx.setLineDash([]);

      // Cílový klient (ikona terče / telefonu)
      antennaCtx.beginPath();
      antennaCtx.arc(tx, ty, 8, 0, Math.PI * 2);
      antennaCtx.fillStyle = '#a855f7';
      antennaCtx.fill();
      antennaCtx.strokeStyle = '#ffffff';
      antennaCtx.lineWidth = 2;
      antennaCtx.stroke();

      antennaCtx.fillStyle = '#f3e8ff';
      antennaCtx.font = 'bold 9px monospace';
      antennaCtx.textAlign = 'center';
      antennaCtx.textBaseline = 'middle';
      antennaCtx.fillText('RX', tx, ty);
    }
  }


  // =========================================================================
  // 2. MODUL: Wi-Fi 6 a modulace 1024-QAM (Snímek 13)
  // =========================================================================

  let qamCanvas = null;
  let qamCtx = null;
  let scopeCanvas = null;
  let scopeCtx = null;

  // Stav modulace
  let currentModulation = 'qam1024'; // 'qpsk' | 'qam16' | 'qam64' | 'qam256' | 'qam1024'
  let snrDb = 38; // 15 až 40 dB
  let selectedPointIndex = 542; // Index vybraného bodu (0..1023)
  let user10Bits = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; // 10 bitů (5 pro I, 5 pro Q)
  let qamAnimPhase = 0;
  let qamAnimId = null;

  // Konfigurace modulací
  const MOD_CONFIGS = {
    qpsk: {
      name: 'QPSK (2 bity / symbol)',
      bitsPerSymbol: 2,
      pointsCount: 4,
      gridDim: 2,
      levels: [-1, 1],
      bitsI: 1,
      bitsQ: 1,
      badge: 'Základní Wi-Fi / Odolná',
      desc: 'Pouze 4 stavy (fázový posun o 90°). Extrémně odolná proti šumu, využívá se při slabém signálu na velkou vzdálenost.',
      minSnr: '8 dB'
    },
    qam16: {
      name: '16-QAM (4 bity / symbol)',
      bitsPerSymbol: 4,
      pointsCount: 16,
      gridDim: 4,
      levels: [-3, -1, 1, 3],
      bitsI: 2,
      bitsQ: 2,
      badge: 'Wi-Fi 2 / 802.11a/g',
      desc: '16 stavů (4 úrovně I × 4 úrovně Q). Přenos 4 bitů v každém taktu.',
      minSnr: '15 dB'
    },
    qam64: {
      name: '64-QAM (6 bitů / symbol)',
      bitsPerSymbol: 6,
      pointsCount: 64,
      gridDim: 8,
      levels: [-7, -5, -3, -1, 1, 3, 5, 7],
      bitsI: 3,
      bitsQ: 3,
      badge: 'Wi-Fi 4 / 802.11n',
      desc: '64 stavů (8 úrovní I × 8 úrovní Q). Klíčová modulace pro příchod standardu 802.11n.',
      minSnr: '22 dB'
    },
    qam256: {
      name: '256-QAM (8 bitů / symbol)',
      bitsPerSymbol: 8,
      pointsCount: 256,
      gridDim: 16,
      levels: Array.from({ length: 16 }, (_, i) => -15 + i * 2),
      bitsI: 4,
      bitsQ: 4,
      badge: 'Wi-Fi 5 / 802.11ac',
      desc: '256 stavů (16 úrovní I × 16 úrovní Q). Každý symbol nese celý 1 Byte dat!',
      minSnr: '28 dB'
    },
    qam1024: {
      name: '1024-QAM (10 bitů / symbol)',
      bitsPerSymbol: 10,
      pointsCount: 1024,
      gridDim: 32,
      levels: Array.from({ length: 32 }, (_, i) => -31 + i * 2),
      bitsI: 5,
      bitsQ: 5,
      badge: 'Wi-Fi 6 / 802.11ax ★',
      desc: '1024 stavů v rovině IQ (32 úrovní I × 32 úrovní Q). Nese neuvěřitelných 10 bitů na symbol (+25 % nárůst propustnosti oproti Wi-Fi 5)!',
      minSnr: '35 dB'
    }
  };

  // Grayův kód: binární na Gray a zpět
  function binToGray(num) {
    return num ^ (num >> 1);
  }

  function grayToBin(gray) {
    let bin = gray;
    bin ^= bin >> 16;
    bin ^= bin >> 8;
    bin ^= bin >> 4;
    bin ^= bin >> 2;
    bin ^= bin >> 1;
    return bin;
  }

  // Převod čísla na binární řetězec s pevnou délkou
  function toPaddedBin(val, len) {
    let str = val.toString(2);
    while (str.length < len) str = '0' + str;
    return str;
  }

  function initQamSimulator() {
    qamCanvas = document.getElementById('qamCanvas');
    scopeCanvas = document.getElementById('qamScopeCanvas');
    if (!qamCanvas || !scopeCanvas) return;

    qamCtx = qamCanvas.getContext('2d');
    scopeCtx = scopeCanvas.getContext('2d');

    // 1. Tlačítka modulací
    const modButtons = document.querySelectorAll('.mod-btn');
    modButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModulation = btn.getAttribute('data-mod');
        onModulationChange();
      });
    });

    // 2. SNR Slider
    const snrSlider = document.getElementById('qamSnrSlider');
    const snrVal = document.getElementById('qamSnrVal');
    if (snrSlider) {
      snrSlider.addEventListener('input', (e) => {
        snrDb = parseFloat(e.target.value);
        if (snrVal) snrVal.textContent = snrDb + ' dB';
        updateStats();
        renderQamConstellation();
      });
    }

    // 3. Kliknutí / interakce v IQ rovině
    qamCanvas.addEventListener('click', handleQamCanvasClick);
    qamCanvas.addEventListener('mousemove', handleQamCanvasHover);

    // 4. Nastavení tlačítek 10 bitů
    initBitButtons();

    // 5. Spuštění animací a vykreslení
    onModulationChange();
    startQamAnimation();
  }

  function onModulationChange() {
    const cfg = MOD_CONFIGS[currentModulation];
    if (!cfg) return;

    // Aktualizace popisků a karet
    const titleEl = document.getElementById('qamModTitle');
    const badgeEl = document.getElementById('qamModBadge');
    const descEl = document.getElementById('qamModDesc');
    const minSnrEl = document.getElementById('qamModMinSnr');
    const bitsCountEl = document.getElementById('qamBitsCount');

    if (titleEl) titleEl.textContent = cfg.name;
    if (badgeEl) badgeEl.textContent = cfg.badge;
    if (descEl) descEl.textContent = cfg.desc;
    if (minSnrEl) minSnrEl.textContent = cfg.minSnr;
    if (bitsCountEl) bitsCountEl.textContent = cfg.bitsPerSymbol + ' bitů';

    // Výchozí bod pro danou modulaci
    selectedPointIndex = Math.floor(cfg.pointsCount / 2) + Math.floor(cfg.gridDim / 4);
    syncBitsFromPointIndex();
    updateStats();
    resizeQamCanvases();
  }

  function resizeQamCanvases() {
    if (!qamCanvas || !scopeCanvas) return;
    const dpr = window.devicePixelRatio || 1;

    const qRect = qamCanvas.getBoundingClientRect();
    const qW = qRect.width || 380;
    const qH = qRect.height || 380;
    qamCanvas.width = qW * dpr;
    qamCanvas.height = qH * dpr;
    qamCtx.resetTransform();
    qamCtx.scale(dpr, dpr);

    const sRect = scopeCanvas.getBoundingClientRect();
    const sW = sRect.width || 380;
    const sH = sRect.height || 100;
    scopeCanvas.width = sW * dpr;
    scopeCanvas.height = sH * dpr;
    scopeCtx.resetTransform();
    scopeCtx.scale(dpr, dpr);

    renderQamConstellation();
    renderScopeWave();
  }

  function initBitButtons() {
    const container = document.getElementById('qamBitButtonsContainer');
    if (!container) return;
    container.innerHTML = '';

    // Vytvoříme 10 bitových přepínačů rozdělených na I (b9-b5) a Q (b4-b0)
    for (let i = 9; i >= 0; i--) {
      const bitWrapper = document.createElement('div');
      bitWrapper.className = 'qam-bit-wrapper';
      bitWrapper.setAttribute('data-bit-idx', i);

      const label = document.createElement('span');
      label.className = 'qam-bit-label';
      label.textContent = 'b' + i;
      if (i >= 5) label.style.color = '#38bdf8'; // I složka
      else label.style.color = '#f43f5e'; // Q složka

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qam-bit-toggle' + (user10Bits[9 - i] === 1 ? ' active-1' : ' active-0');
      btn.textContent = user10Bits[9 - i];
      btn.title = `Bit ${i} (${i >= 5 ? 'Složka I' : 'Složka Q'})`;

      btn.addEventListener('click', () => {
        const bitPos = 9 - i;
        user10Bits[bitPos] = user10Bits[bitPos] === 1 ? 0 : 1;
        btn.textContent = user10Bits[bitPos];
        btn.className = 'qam-bit-toggle' + (user10Bits[bitPos] === 1 ? ' active-1' : ' active-0');
        syncPointIndexFromBits();
      });

      bitWrapper.appendChild(label);
      bitWrapper.appendChild(btn);
      container.appendChild(bitWrapper);
    }
  }

  function updateBitButtonsUI() {
    const container = document.getElementById('qamBitButtonsContainer');
    if (!container) return;
    const cfg = MOD_CONFIGS[currentModulation];

    for (let i = 9; i >= 0; i--) {
      const bitWrapper = container.querySelector(`[data-bit-idx="${i}"]`);
      if (!bitWrapper) continue;
      const btn = bitWrapper.querySelector('.qam-bit-toggle');

      // Povoleno/zakázáno podle aktuální modulace
      // Např. QPSK má jen 2 bity: b1 a b0 (respektive b9 a b4 pro I/Q)
      const isIBit = i >= 5;
      const bitSubIdx = isIBit ? (i - 5) : i;
      const maxSubBits = isIBit ? cfg.bitsI : cfg.bitsQ;

      if (bitSubIdx < maxSubBits) {
        bitWrapper.style.opacity = '1';
        btn.disabled = false;
      } else {
        bitWrapper.style.opacity = '0.25';
        btn.disabled = true;
      }

      const bitVal = user10Bits[9 - i];
      btn.textContent = bitVal;
      btn.className = 'qam-bit-toggle' + (bitVal === 1 ? ' active-1' : ' active-0');
    }
  }

  function syncBitsFromPointIndex() {
    const cfg = MOD_CONFIGS[currentModulation];
    const totalPts = cfg.pointsCount;
    if (selectedPointIndex < 0 || selectedPointIndex >= totalPts) {
      selectedPointIndex = 0;
    }

    const gridDim = cfg.gridDim;
    const qIdx = Math.floor(selectedPointIndex / gridDim);
    const iIdx = selectedPointIndex % gridDim;

    // Gray kód indexu
    const grayI = binToGray(iIdx);
    const grayQ = binToGray(qIdx);

    const strI = toPaddedBin(grayI, cfg.bitsI);
    const strQ = toPaddedBin(grayQ, cfg.bitsQ);

    // Namapujeme do 10bitového pole (zarovnané doprava v I a Q skupině)
    for (let i = 0; i < 5; i++) {
      if (i < 5 - cfg.bitsI) user10Bits[i] = 0;
      else user10Bits[i] = parseInt(strI[i - (5 - cfg.bitsI)], 10);
    }
    for (let i = 0; i < 5; i++) {
      if (i < 5 - cfg.bitsQ) user10Bits[5 + i] = 0;
      else user10Bits[5 + i] = parseInt(strQ[i - (5 - cfg.bitsQ)], 10);
    }

    updateBitButtonsUI();
    updateStats();
    renderScopeWave();
    renderQamConstellation();
  }

  function syncPointIndexFromBits() {
    const cfg = MOD_CONFIGS[currentModulation];

    // Extrahujeme bity I a Q
    let strI = '';
    for (let i = 5 - cfg.bitsI; i < 5; i++) {
      strI += user10Bits[i];
    }
    let strQ = '';
    for (let i = 10 - cfg.bitsQ; i < 10; i++) {
      strQ += user10Bits[i];
    }

    const grayI = parseInt(strI || '0', 2);
    const grayQ = parseInt(strQ || '0', 2);

    const iIdx = grayToBin(grayI);
    const qIdx = grayToBin(grayQ);

    selectedPointIndex = qIdx * cfg.gridDim + iIdx;
    updateStats();
    renderScopeWave();
    renderQamConstellation();
  }

  function handleQamCanvasClick(e) {
    const point = getPointFromEvent(e);
    if (point !== null) {
      selectedPointIndex = point;
      syncBitsFromPointIndex();
    }
  }

  function handleQamCanvasHover(e) {
    // Vizuální kurzor
    const point = getPointFromEvent(e);
    if (point !== null) {
      qamCanvas.style.cursor = 'pointer';
    } else {
      qamCanvas.style.cursor = 'default';
    }
  }

  function getPointFromEvent(e) {
    const cfg = MOD_CONFIGS[currentModulation];
    const rect = qamCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = (Math.min(cx, cy) - 24) / (cfg.levels[cfg.levels.length - 1] * 1.15);

    const mouseX = e.clientX - rect.left - cx;
    const mouseY = e.clientY - rect.top - cy;

    // Najdeme nejbližší bod v mřížce
    let closestIdx = null;
    let closestDist = Infinity;
    const threshold = 18; // px

    for (let q = 0; q < cfg.gridDim; q++) {
      for (let i = 0; i < cfg.gridDim; i++) {
        const lvlI = cfg.levels[i];
        const lvlQ = -cfg.levels[q]; // -Q je nahoře v plátně
        const px = lvlI * scale;
        const py = lvlQ * scale;

        const dist = Math.hypot(mouseX - px, mouseY - py);
        if (dist < closestDist && dist < threshold) {
          closestDist = dist;
          closestIdx = q * cfg.gridDim + i;
        }
      }
    }
    return closestIdx;
  }

  function updateStats() {
    const cfg = MOD_CONFIGS[currentModulation];
    const gridDim = cfg.gridDim;
    const qIdx = Math.floor(selectedPointIndex / gridDim);
    const iIdx = selectedPointIndex % gridDim;

    const valI = cfg.levels[iIdx] || 0;
    const valQ = cfg.levels[qIdx] || 0;

    const amp = Math.sqrt(valI * valI + valQ * valQ);
    const phaseRad = Math.atan2(valQ, valI);
    const phaseDeg = Math.round((phaseRad * 180) / Math.PI);

    // EVM & BER kalkulace na základě SNR
    // Pro 1024-QAM je minimální SNR 35 dB
    const snrLinear = Math.pow(10, snrDb / 10);
    const noiseStd = 1.0 / Math.sqrt(snrLinear * 0.15);
    const evm = Math.min(100, Math.round(100 / Math.sqrt(snrLinear) * 1.8 * (cfg.bitsPerSymbol / 2)));
    
    let berStatus = 'Vynikající (BER = 0)';
    let berColor = '#10b981';

    if (currentModulation === 'qam1024') {
      if (snrDb < 28) {
        berStatus = 'Kritická chybovost (Nutný pád na 256-QAM)';
        berColor = '#ef4444';
      } else if (snrDb < 34) {
        berStatus = 'Hraniční příjem (Občasné retransmise)';
        berColor = '#f59e0b';
      }
    } else if (currentModulation === 'qam256') {
      if (snrDb < 22) {
        berStatus = 'Vysoká chybovost (Pád na 64-QAM)';
        berColor = '#ef4444';
      } else if (snrDb < 26) {
        berStatus = 'Mírné rušení';
        berColor = '#f59e0b';
      }
    }

    const statBitsVal = document.getElementById('statQamBits');
    const statCoordVal = document.getElementById('statQamCoord');
    const statAmpVal = document.getElementById('statQamAmp');
    const statPhaseVal = document.getElementById('statQamPhase');
    const statEvmVal = document.getElementById('statQamEvm');
    const statBerVal = document.getElementById('statQamBer');

    if (statBitsVal) {
      // Zobrazení s mezerou mezi I a Q
      const str10 = user10Bits.join('');
      statBitsVal.innerHTML = `<span style="color: #38bdf8;">${str10.slice(0, 5)}</span> <span style="color: #f43f5e;">${str10.slice(5)}</span>`;
    }
    if (statCoordVal) statCoordVal.textContent = `I = ${valI > 0 ? '+' : ''}${valI}, Q = ${valQ > 0 ? '+' : ''}${valQ}`;
    if (statAmpVal) statAmpVal.textContent = amp.toFixed(2);
    if (statPhaseVal) statPhaseVal.textContent = (phaseDeg >= 0 ? '+' : '') + phaseDeg + '°';
    if (statEvmVal) statEvmVal.textContent = evm + ' % EVM';
    if (statBerVal) {
      statBerVal.textContent = berStatus;
      statBerVal.style.color = berColor;
    }
  }

  function startQamAnimation() {
    if (qamAnimId) cancelAnimationFrame(qamAnimId);
    function loop() {
      qamAnimPhase = (qamAnimPhase + 0.08) % (Math.PI * 2);
      renderScopeWave();
      qamAnimId = requestAnimationFrame(loop);
    }
    qamAnimId = requestAnimationFrame(loop);
  }

  function renderQamConstellation() {
    if (!qamCanvas || !qamCtx) return;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const w = qamCanvas.clientWidth || 380;
    const h = qamCanvas.clientHeight || 380;
    const cx = w / 2;
    const cy = h / 2;

    const cfg = MOD_CONFIGS[currentModulation];
    const maxVal = cfg.levels[cfg.levels.length - 1];
    const scale = (Math.min(cx, cy) - 24) / (maxVal * 1.15);

    qamCtx.clearRect(0, 0, w, h);

    // 1. Kreslení os I a Q
    const axisColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // Osa I (vodorovná)
    qamCtx.beginPath();
    qamCtx.moveTo(10, cy);
    qamCtx.lineTo(w - 10, cy);
    qamCtx.strokeStyle = axisColor;
    qamCtx.lineWidth = 1.5;
    qamCtx.stroke();

    // Šipka I
    qamCtx.fillStyle = '#38bdf8';
    qamCtx.beginPath();
    qamCtx.moveTo(w - 8, cy);
    qamCtx.lineTo(w - 18, cy - 4);
    qamCtx.lineTo(w - 18, cy + 4);
    qamCtx.fill();
    qamCtx.font = 'bold 11px monospace';
    qamCtx.textAlign = 'right';
    qamCtx.fillText('+I (In-phase)', w - 24, cy - 8);

    // Osa Q (svislá)
    qamCtx.beginPath();
    qamCtx.moveTo(cx, h - 10);
    qamCtx.lineTo(cx, 10);
    qamCtx.strokeStyle = axisColor;
    qamCtx.lineWidth = 1.5;
    qamCtx.stroke();

    // Šipka Q
    qamCtx.fillStyle = '#f43f5e';
    qamCtx.beginPath();
    qamCtx.moveTo(cx, 8);
    qamCtx.lineTo(cx - 4, 18);
    qamCtx.lineTo(cx + 4, 18);
    qamCtx.fill();
    qamCtx.textAlign = 'left';
    qamCtx.fillText('+Q (Quadrature)', cx + 8, 18);

    // Kreslení rysek a číselných hodnot na osách I a Q
    const ticks = (currentModulation === 'qam1024') ? [-31, -15, -1, 1, 15, 31] :
                  (currentModulation === 'qam256') ? [-15, -7, -1, 1, 7, 15] :
                  (currentModulation === 'qam64') ? [-7, -3, -1, 1, 3, 7] :
                  (currentModulation === 'qam16') ? [-3, -1, 1, 3] : [-1, 1];

    qamCtx.font = '8px monospace';
    qamCtx.fillStyle = isDark ? '#94a3b8' : '#64748b';

    ticks.forEach(val => {
      // Vodorovná osa I
      const tx = cx + val * scale;
      qamCtx.beginPath();
      qamCtx.moveTo(tx, cy - 3);
      qamCtx.lineTo(tx, cy + 3);
      qamCtx.strokeStyle = axisColor;
      qamCtx.stroke();
      qamCtx.textAlign = 'center';
      qamCtx.fillText((val > 0 ? '+' : '') + val, tx, cy + 12);

      // Svislá osa Q
      const ty = cy - val * scale;
      qamCtx.beginPath();
      qamCtx.moveTo(cx - 3, ty);
      qamCtx.lineTo(cx + 3, ty);
      qamCtx.strokeStyle = axisColor;
      qamCtx.stroke();
      qamCtx.textAlign = 'right';
      qamCtx.fillText((val > 0 ? '+' : '') + val, cx - 6, ty + 3);
    });

    // 2. Simulace šumu (Gaussovský rozptyl dle SNR)
    // Vyšší SNR => menší rozptyl
    const snrLinear = Math.pow(10, snrDb / 10);
    const noiseStd = (maxVal * 0.45) / Math.sqrt(snrLinear);

    // 3. Vykreslení bodů konstelačního diagramu
    const pointRadius = (currentModulation === 'qam1024') ? 1.6 :
                        (currentModulation === 'qam256') ? 2.4 :
                        (currentModulation === 'qam64') ? 3.6 : 5.0;

    for (let q = 0; q < cfg.gridDim; q++) {
      for (let i = 0; i < cfg.gridDim; i++) {
        const idx = q * cfg.gridDim + i;
        const isSelected = (idx === selectedPointIndex);

        const baseI = cfg.levels[i];
        const baseQ = cfg.levels[q];

        // Přidáme náhodný šum pro živou vizualizaci SNR
        const noiseI = (Math.random() - 0.5) * noiseStd * 1.5;
        const noiseQ = (Math.random() - 0.5) * noiseStd * 1.5;

        const px = cx + (baseI + noiseI) * scale;
        const py = cy - (baseQ + noiseQ) * scale; // v plátně je +Y dolů

        qamCtx.beginPath();
        qamCtx.arc(px, py, isSelected ? pointRadius * 2.2 : pointRadius, 0, Math.PI * 2);

        if (isSelected) {
          qamCtx.fillStyle = '#ffffff';
          qamCtx.shadowColor = '#38bdf8';
          qamCtx.shadowBlur = 14;
          qamCtx.fill();
          qamCtx.shadowBlur = 0;

          // Terčík kolem vybraného bodu
          qamCtx.beginPath();
          qamCtx.arc(px, py, pointRadius * 3.5, 0, Math.PI * 2);
          qamCtx.strokeStyle = '#38bdf8';
          qamCtx.lineWidth = 1.8;
          qamCtx.stroke();

          // Vektor z počátku k vybranému bodu
          qamCtx.beginPath();
          qamCtx.moveTo(cx, cy);
          qamCtx.lineTo(px, py);
          qamCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          qamCtx.lineWidth = 1.5;
          qamCtx.setLineDash([2, 2]);
          qamCtx.stroke();
          qamCtx.setLineDash([]);
        } else {
          // Běžné body: Barevný gradient v závislosti na kvadrantu
          if (baseI >= 0 && baseQ >= 0) qamCtx.fillStyle = 'rgba(56, 189, 248, 0.75)'; // I+ Q+
          else if (baseI < 0 && baseQ >= 0) qamCtx.fillStyle = 'rgba(168, 85, 247, 0.75)'; // I- Q+
          else if (baseI < 0 && baseQ < 0) qamCtx.fillStyle = 'rgba(244, 63, 94, 0.75)'; // I- Q-
          else qamCtx.fillStyle = 'rgba(16, 185, 129, 0.75)'; // I+ Q-
          qamCtx.fill();
        }
      }
    }

    // 4. Kótovací nápis v rohu
    qamCtx.fillStyle = textColor;
    qamCtx.font = '10px monospace';
    qamCtx.textAlign = 'left';
    qamCtx.fillText(`${cfg.pointsCount} stavů (${cfg.gridDim} × ${cfg.gridDim})`, 10, h - 10);
  }

  function renderScopeWave() {
    if (!scopeCanvas || !scopeCtx) return;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const w = scopeCanvas.clientWidth || 380;
    const h = scopeCanvas.clientHeight || 100;
    const cy = h / 2;

    const cfg = MOD_CONFIGS[currentModulation];
    const gridDim = cfg.gridDim;
    const qIdx = Math.floor(selectedPointIndex / gridDim);
    const iIdx = selectedPointIndex % gridDim;

    const maxVal = cfg.levels[cfg.levels.length - 1];
    const valI = (cfg.levels[iIdx] || 0) / maxVal;
    const valQ = (cfg.levels[qIdx] || 0) / maxVal;

    const amp = Math.sqrt(valI * valI + valQ * valQ);
    const phaseRad = Math.atan2(valQ, valI);

    scopeCtx.clearRect(0, 0, w, h);

    // Středová osa osciloskopu
    scopeCtx.beginPath();
    scopeCtx.moveTo(0, cy);
    scopeCtx.lineTo(w, cy);
    scopeCtx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    scopeCtx.lineWidth = 1;
    scopeCtx.stroke();

    // Vykreslení výsledné RF vlny: s(t) = A * cos(omega * t + phase)
    const cycles = 3;
    const maxAmpPx = cy - 10;

    scopeCtx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x / w) * (cycles * Math.PI * 2);
      const y = cy - (amp * maxAmpPx * Math.cos(t - qamAnimPhase + phaseRad));
      if (x === 0) scopeCtx.moveTo(x, y);
      else scopeCtx.lineTo(x, y);
    }

    scopeCtx.strokeStyle = '#38bdf8';
    scopeCtx.lineWidth = 2.4;
    scopeCtx.shadowColor = '#38bdf8';
    scopeCtx.shadowBlur = 8;
    scopeCtx.stroke();
    scopeCtx.shadowBlur = 0;

    // Popisek
    scopeCtx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    scopeCtx.font = '10px monospace';
    scopeCtx.textAlign = 'left';
    scopeCtx.fillText(`Modulovaný RF signál symbolu s(t) • A = ${(amp * maxVal).toFixed(1)}, φ = ${((phaseRad * 180) / Math.PI).toFixed(0)}°`, 10, 16);
  }

  // Registrace inicializace po načtení stránky a při změně velikosti okna
  window.addEventListener('DOMContentLoaded', () => {
    initAntennaExplorer();
    initQamSimulator();
  });

  window.addEventListener('resize', () => {
    resizeAntennaCanvas();
    resizeQamCanvases();
  });

  // Reakce na změnu tématu (Light/Dark)
  const themeObserver = new MutationObserver(() => {
    renderAntennaPattern();
    renderQamConstellation();
    renderScopeWave();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

})();
