/**
 * Interaktivní engine pro Téma 033: L2 Switch a přepínání v LAN
 * SPŠ Výukové materiály • Předmět POS
 */

document.addEventListener('DOMContentLoaded', () => {
  initSwitchSimulator();
  initLatencyCalculator();
});

/* ==========================================================================
   1. Interaktivní simulátor CAM tabulky a L2 Switche
   ========================================================================== */
function initSwitchSimulator() {
  const srcSelect = document.getElementById('simSrcSelect');
  const dstSelect = document.getElementById('simDstSelect');
  const btnSend = document.getElementById('btnSimSend');
  const btnFlush = document.getElementById('btnSimFlush');
  const camTbody = document.getElementById('camTbody');
  const logEl = document.getElementById('simLog');

  if (!srcSelect || !dstSelect || !btnSend) return;

  const devices = {
    'pca': { name: 'PC A', port: 'Fa0/1', mac: '00:11:22:AA:AA:AA' },
    'pcb': { name: 'PC B', port: 'Fa0/2', mac: '00:11:22:BB:BB:BB' },
    'pcc': { name: 'PC C', port: 'Fa0/3', mac: '00:11:22:CC:CC:CC' },
    'pcd': { name: 'PC D', port: 'Fa0/4', mac: '00:11:22:DD:DD:DD' },
    'bcast': { name: 'Broadcast', port: 'All', mac: 'FF:FF:FF:FF:FF:FF' }
  };

  // Vnitřní stav CAM tabulky
  let camTable = {}; // mac -> { port, vlan: 1, age: 300 }

  function log(msg) {
    if (logEl) logEl.innerHTML = msg;
  }

  function renderCamTable(newMac = null) {
    if (!camTbody) return;
    camTbody.innerHTML = '';

    const entries = Object.entries(camTable);
    if (entries.length === 0) {
      camTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 1.25rem;">CAM tabulka je prázdná (Žádný naučený provoz)</td></tr>';
      return;
    }

    entries.forEach(([mac, data]) => {
      const tr = document.createElement('tr');
      if (mac === newMac) tr.className = 'new-entry';
      tr.innerHTML = `
        <td style="color: #38bdf8;">${mac}</td>
        <td style="font-weight: 700; color: #f1f5f9;">${data.port}</td>
        <td>VLAN ${data.vlan}</td>
        <td style="color: #10b981;">DYNAMIC (${data.age} s)</td>
      `;
      camTbody.appendChild(tr);
    });
  }

  function resetLeds() {
    for (let i = 1; i <= 4; i++) {
      const led = document.getElementById(`ledFa0${i}`);
      if (led) {
        led.className = 'port-led';
      }
    }
  }

  btnSend.addEventListener('click', () => {
    resetLeds();

    const srcKey = srcSelect.value;
    const dstKey = dstSelect.value;

    if (srcKey === dstKey) {
      log('<strong style="color: #f59e0b;">Filtrování (Filtering):</strong> Zdroj a cíl jsou na stejném portu. Switch rámec zahodí.');
      return;
    }

    const src = devices[srcKey];
    const dst = devices[dstKey];

    // 1. KROK: UČENÍ (LEARNING)
    let isNew = false;
    if (!camTable[src.mac]) {
      camTable[src.mac] = { port: src.port, vlan: 1, age: 300 };
      isNew = true;
    }
    renderCamTable(isNew ? src.mac : null);

    // Vstupní port svítí zeleně
    const ingressLed = document.getElementById(`led${src.port.replace('/', '')}`);
    if (ingressLed) ingressLed.className = 'port-led led-green';

    // 2. KROK: ROZHODOVÁNÍ O PŘEPOSLÁNÍ (FORWARDING / FLOODING)
    if (dstKey === 'bcast') {
      // Broadcast Flooding
      for (let i = 1; i <= 4; i++) {
        const pName = `Fa0/${i}`;
        if (pName !== src.port) {
          const l = document.getElementById(`ledFa0${i}`);
          if (l) l.className = 'port-led led-amber led-active';
        }
      }
      log(`<strong>1. Learning:</strong> Uloženo [${src.mac} &rarr; ${src.port}].<br><strong>2. Broadcast Flooding:</strong> Cíl je <code>FF:FF:FF:FF:FF:FF</code> &rarr; rámec odeslán na všechny porty kromě ${src.port}!`);
    } else if (camTable[dst.mac]) {
      // Zná cíl -> Unicast Forwarding
      const targetPort = camTable[dst.mac].port;
      const targetLed = document.getElementById(`led${targetPort.replace('/', '')}`);
      if (targetLed) targetLed.className = 'port-led led-green led-active';

      log(`<strong>1. Learning:</strong> Uloženo [${src.mac} &rarr; ${src.port}].<br><strong>2. Unicast Forwarding:</strong> Cíl ${dst.name} nalezen v CAM tabulce na portu <strong>${targetPort}</strong>. Rámec je poslán POUZE tam!`);
    } else {
      // Nezná cíl -> Unknown Unicast Flooding
      for (let i = 1; i <= 4; i++) {
        const pName = `Fa0/${i}`;
        if (pName !== src.port) {
          const l = document.getElementById(`ledFa0${i}`);
          if (l) l.className = 'port-led led-amber led-active';
        }
      }
      log(`<strong>1. Learning:</strong> Uloženo [${src.mac} &rarr; ${src.port}].<br><strong>2. Unknown Unicast Flooding:</strong> Cíl ${dst.mac} zatím v CAM tabulce <em>NENÍ</em>. Switch zaplaví všechny porty kromě ${src.port}!`);
    }
  });

  btnFlush.addEventListener('click', () => {
    camTable = {};
    renderCamTable();
    resetLeds();
    log('CAM tabulka byla vymazána (Flush). Switch je nyní v panenském stavu.');
  });

  renderCamTable();
}

/* ==========================================================================
   2. Kalkulátor latence Store-and-Forward vs Cut-Through
   ========================================================================== */
function initLatencyCalculator() {
  const selSpeed = document.getElementById('latSpeedSelect');
  const selSize = document.getElementById('latSizeSelect');
  const outStore = document.getElementById('outStoreLat');
  const outCut = document.getElementById('outCutLat');
  const outDiff = document.getElementById('outDiffLat');

  if (!selSpeed || !selSize || !outStore) return;

  function updateLatency() {
    const speedMbps = parseFloat(selSpeed.value); // 100, 1000, 10000
    const bytes = parseFloat(selSize.value); // 64, 1518

    // Store-and-forward: musí přijmout celý rámec
    // Doba = (Bytes * 8 bitů) / Speed(Mb/s) [v mikrosekundách]
    const storeUs = (bytes * 8) / speedMbps;

    // Cut-through: čte pouze prvních 6 bajtů (Cílová MAC)
    const cutUs = (6 * 8) / speedMbps;

    const diffRatio = (storeUs / cutUs).toFixed(1);

    outStore.textContent = storeUs < 1 ? `${(storeUs * 1000).toFixed(0)} ns` : `${storeUs.toFixed(2)} µs`;
    outCut.textContent = cutUs < 1 ? `${(cutUs * 1000).toFixed(0)} ns` : `${cutUs.toFixed(2)} µs`;
    outDiff.textContent = `${diffRatio}× rychlejší v Cut-Through!`;
  }

  selSpeed.addEventListener('change', updateLatency);
  selSize.addEventListener('change', updateLatency);

  updateLatency();
}
