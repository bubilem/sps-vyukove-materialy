/**
 * Interaktivní engine pro Téma 031: Ethernet (IEEE 802.3)
 * SPŠ Výukové materiály • Předmět POS
 */

document.addEventListener('DOMContentLoaded', () => {
  initCsmaCdSimulator();
  initTimingCalculator();
  initCableSimulator();
});

/* ==========================================================================
   1. Interaktivní simulátor CSMA/CD na sdílené sběrnici
   ========================================================================== */
function initCsmaCdSimulator() {
  const canvas = document.getElementById('csmaCanvas');
  const btnSingle = document.getElementById('btnCsmaSingle');
  const btnCollide = document.getElementById('btnCsmaCollide');
  const btnReset = document.getElementById('btnCsmaReset');
  const logEl = document.getElementById('csmaLog');

  if (!canvas || !btnSingle || !btnCollide) return;

  const ctx = canvas.getContext('2d');
  let animId = null;

  // Stav simulace
  let state = 'IDLE'; // IDLE, SENDING_1, COLLISION_FLY, JAMMING, BACKOFF
  let t = 0;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 220;
    drawScene();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function log(msg) {
    if (logEl) logEl.innerHTML = msg;
  }

  function drawScene() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Společná sběrnice (Coax / Bus)
    const busY = h * 0.65;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(40, busY);
    ctx.lineTo(w - 40, busY);
    ctx.stroke();

    // Zakončovací odpory (Terminátory 50 Ohm)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(34, busY - 10, 6, 20);
    ctx.fillRect(w - 40, busY - 10, 6, 20);

    // Stanice PC 1 (vlevo)
    const pc1X = w * 0.2;
    const pc2X = w * 0.8;
    const pcY = h * 0.3;

    drawStation(pc1X, pcY, 'PC 1 (Stanice A)', state === 'BACKOFF' ? '#f43f5e' : (state.includes('1') ? '#3b82f6' : '#94a3b8'));
    drawStation(pc2X, pcY, 'PC 2 (Stanice B)', state === 'BACKOFF' ? '#f43f5e' : (state === 'COLLISION_FLY' ? '#f59e0b' : '#94a3b8'));

    // Svodové kabely k busu
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pc1X, pcY + 24);
    ctx.lineTo(pc1X, busY);
    ctx.moveTo(pc2X, pcY + 24);
    ctx.lineTo(pc2X, busY);
    ctx.stroke();

    // Animace signálů podle stavu
    if (state === 'SENDING_1') {
      const prog = Math.min(1, t / 80);
      const curX = pc1X + (pc2X - pc1X) * prog;

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(curX, busY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Vlnění za paketem
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(pc1X, busY);
      ctx.lineTo(curX, busY);
      ctx.stroke();

      if (prog >= 1) {
        state = 'IDLE';
        log('Rámec z PC 1 úspěšně doručen do PC 2 bez kolize (Carrier Sense: volno).');
      }
    } else if (state === 'COLLISION_FLY') {
      const prog = Math.min(1, t / 40);
      const wave1X = pc1X + ((w * 0.5) - pc1X) * prog;
      const wave2X = pc2X - (pc2X - (w * 0.5)) * prog;

      // Signál 1
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(wave1X, busY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Signál 2
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(wave2X, busY, 8, 0, Math.PI * 2);
      ctx.fill();

      if (prog >= 1) {
        state = 'JAMMING';
        t = 0;
        log('<strong style="color: #f43f5e;">KOLIZE DETEKOVÁNA!</strong> Signály se střetly. Stanice vysílají 32bitový JAM signál!');
      }
    } else if (state === 'JAMMING') {
      // Výbuch kolize uprostřed
      const colX = w * 0.5;
      const blastRad = 15 + Math.sin(t * 0.3) * 10;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(colX, busY, blastRad + 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(colX, busY, blastRad, 0, Math.PI * 2);
      ctx.fill();

      if (t > 40) {
        state = 'BACKOFF';
        t = 0;
        const r1 = Math.floor(Math.random() * 2);
        const r2 = Math.floor(Math.random() * 2) + 1;
        log(`<strong>Exponenciální zpoždění (Backoff):</strong> PC 1 čeká ${r1} slot time, PC 2 čeká ${r2} slot time. Vysílání pozastaveno.`);
      }
    } else if (state === 'BACKOFF') {
      if (t > 60) {
        state = 'IDLE';
        log('Linka uvolněna. Stanice se vrátily do stavu naslouchání (Carrier Sense).');
      }
    }
  }

  function drawStation(x, y, name, color) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 45, y - 24, 90, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 4);
  }

  function animate() {
    t++;
    drawScene();
    animId = requestAnimationFrame(animate);
  }
  animate();

  btnSingle.addEventListener('click', () => {
    state = 'SENDING_1';
    t = 0;
    log('PC 1 naslouchá médiu: ticho &rarr; začíná vysílat rámec...');
  });

  btnCollide.addEventListener('click', () => {
    state = 'COLLISION_FLY';
    t = 0;
    log('PC 1 i PC 2 začaly vysílat současně v témže časovém slotu!');
  });

  btnReset.addEventListener('click', () => {
    state = 'IDLE';
    t = 0;
    log('Připraveno. Zvolte režim přenosu pro spuštění animace.');
  });
}

/* ==========================================================================
   2. Interaktivní kalkulátor časování a pipeline (IFG / Bit Time)
   ========================================================================== */
function initTimingCalculator() {
  const chips = document.querySelectorAll('.speed-chip');
  const bitTimeEl = document.getElementById('timeBit');
  const ifgTimeEl = document.getElementById('timeIfg');
  const slotTimeEl = document.getElementById('timeSlot');
  const fps64El = document.getElementById('timeFps64');

  if (!chips.length || !bitTimeEl) return;

  const data = {
    '10m': {
      speed: '10 Mb/s (10BASE-T)',
      bit: '100 ns',
      ifg: '9 600 ns (9,6 µs)',
      slot: '51 200 ns (51,2 µs)',
      fps64: '14 880 fps'
    },
    '100m': {
      speed: '100 Mb/s (Fast Ethernet)',
      bit: '10 ns',
      ifg: '960 ns (0,96 µs)',
      slot: '5 120 ns (5,12 µs)',
      fps64: '148 809 fps'
    },
    '1g': {
      speed: '1 Gb/s (Gigabit Ethernet)',
      bit: '1 ns',
      ifg: '96 ns',
      slot: '4 096 ns (rozšířeno carrier extension)',
      fps64: '1 488 095 fps'
    },
    '10g': {
      speed: '10 Gb/s (10G Ethernet)',
      bit: '0,1 ns (100 ps)',
      ifg: '9,6 ns',
      slot: 'Pouze Full-Duplex (žádný slot time)',
      fps64: '14 880 952 fps'
    }
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.speed;
      if (data[val]) {
        bitTimeEl.textContent = data[val].bit;
        ifgTimeEl.textContent = data[val].ifg;
        slotTimeEl.textContent = data[val].slot;
        fps64El.textContent = data[val].fps64;
      }
    });
  });
}

/* ==========================================================================
   3. Interaktivní simulátor typů kabelů a Auto-MDIX
   ========================================================================== */
function initCableSimulator() {
  const sel = document.getElementById('devicePairSelect');
  const resType = document.getElementById('cableReqType');
  const resDesc = document.getElementById('cableReqDesc');
  const mdixStatus = document.getElementById('autoMdixStatus');

  if (!sel || !resType) return;

  const pairs = {
    'pc-switch': {
      type: 'Přímý kabel (Straight-Through)',
      desc: 'Různorodá zařízení (Hostitel MDI <-> Přepínač MDI-X). Pin 1 (TX+) z PC putuje přímo na Pin 1 (RX+) switche.',
      mdix: 'Aktivní: Pokud použijete křížený kabel, Auto-MDIX port sám přepne piny.'
    },
    'pc-pc': {
      type: 'Křížený kabel (Crossover)',
      desc: 'Stejnorodá zařízení (Hostitel MDI <-> Hostitel MDI). Bez překřížení by oba počítače vysílaly (TX) do stejného páru!',
      mdix: 'Auto-MDIX eliminuje nutnost kříženého kabelu: moderní gigabitové karty se dohodnou automaticky.'
    },
    'switch-switch': {
      type: 'Křížený kabel (Crossover)',
      desc: 'Stejnorodá zařízení (Switch MDI-X <-> Switch MDI-X). Tradičně vyžadovalo křížený kabel.',
      mdix: 'Dnešní switche standardně používají Auto-MDIX na všech portech.'
    },
    'router-switch': {
      type: 'Přímý kabel (Straight-Through)',
      desc: 'Různorodá zařízení (Router MDI <-> Switch MDI-X). Směrovač má ethernetový port zapojený jako hostitel (MDI).',
      mdix: 'Funguje automaticky s jakýmkoliv kabelem.'
    }
  };

  sel.addEventListener('change', () => {
    const p = pairs[sel.value];
    if (p) {
      resType.textContent = p.type;
      resDesc.textContent = p.desc;
      mdixStatus.textContent = p.mdix;
    }
  });
}
