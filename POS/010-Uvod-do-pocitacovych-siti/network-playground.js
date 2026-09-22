/**
 * ==========================================================================
 * Téma 010: Úvod do počítačových sítí
 * Lokální interaktivní engine (Multiplexing simulátor & Enkapsulace PDU)
 * 100% Offline & Pure Vanilla JS
 * ==========================================================================
 */

(function () {
  'use strict';

  // --- 1. INTERAKTIVNÍ SIMULÁTOR MULTIPLEXINGU ---
  const muxTracks = {
    tdm: [
      { id: 'A1', cls: 'packet-a', text: 'Tok A' },
      { id: 'B1', cls: 'packet-b', text: 'Tok B' },
      { id: 'C1', cls: 'packet-c', text: 'Tok C' },
      { id: 'A2', cls: 'packet-a', text: 'Tok A' },
      { id: 'B2', cls: 'packet-b', text: 'Tok B' },
      { id: 'C2', cls: 'packet-c', text: 'Tok C' }
    ],
    fdm: [
      { id: 'F1', cls: 'packet-a', text: 'Pásmo 1: Tok A (100 MHz)' },
      { id: 'F2', cls: 'packet-b', text: 'Pásmo 2: Tok B (110 MHz)' },
      { id: 'F3', cls: 'packet-c', text: 'Pásmo 3: Tok C (120 MHz)' }
    ],
    packet: [
      { id: 'P-A1', cls: 'packet-a', text: 'Paket A1' },
      { id: 'P-A2', cls: 'packet-a', text: 'Paket A2' },
      { id: 'P-B1', cls: 'packet-b', text: 'Paket B1' },
      { id: 'P-C1', cls: 'packet-c', text: 'Paket C1' },
      { id: 'P-A3', cls: 'packet-a', text: 'Paket A3' },
      { id: 'P-B2', cls: 'packet-b', text: 'Paket B2' }
    ]
  };

  const muxDescriptions = {
    tdm: '<strong>TDM (Časový multiplex):</strong> Médium je přidělováno jednotlivým tokům postupně v pevných časových slotech. Každý vysílač má vyhrazen svůj čas, i když právě nevysílá.',
    fdm: '<strong>FDM (Frekvenční multiplex):</strong> Celková šířka pásma média je rozdělena na několik nezávislých frekvenčních subkanálů. Všechny toky vysílají současně vedle sebe (např. rozhlas, DSL, kabelovka).',
    packet: '<strong>Statistický paketový multiplex (Packet Switching):</strong> Základ moderního Internetu. Data jsou rozsekána na pakety s adresou. Médium se využívá dynamicky podle okamžité potřeby bez plýtvání sloty.'
  };

  function initMultiplexingDemo() {
    const btnTdm = document.getElementById('btnMuxTdm');
    const btnFdm = document.getElementById('btnMuxFdm');
    const btnPacket = document.getElementById('btnMuxPacket');
    const displayContainer = document.getElementById('muxVisualDisplay');
    const descContainer = document.getElementById('muxDescription');

    if (!displayContainer || !descContainer) return;

    function renderMode(mode) {
      const btns = [btnTdm, btnFdm, btnPacket];
      btns.forEach(b => b && b.classList.remove('active'));

      if (mode === 'tdm' && btnTdm) btnTdm.classList.add('active');
      if (mode === 'fdm' && btnFdm) btnFdm.classList.add('active');
      if (mode === 'packet' && btnPacket) btnPacket.classList.add('active');

      descContainer.innerHTML = muxDescriptions[mode];

      if (mode === 'tdm' || mode === 'packet') {
        const items = muxTracks[mode];
        displayContainer.innerHTML = `
          <div class="mux-stream-row">
            <span class="mux-stream-label">Sdílený kabel:</span>
            <div class="mux-stream-track">
              ${items.map(it => `<div class="mux-packet ${it.cls}" style="flex: 1;">${it.text}</div>`).join('')}
            </div>
          </div>
        `;
      } else if (mode === 'fdm') {
        const items = muxTracks.fdm;
        displayContainer.innerHTML = items.map(it => `
          <div class="mux-stream-row">
            <span class="mux-stream-label">${it.id}:</span>
            <div class="mux-stream-track">
              <div class="mux-packet ${it.cls}" style="width: 95%; text-align: left; padding-left: 10px;">${it.text}</div>
            </div>
          </div>
        `).join('');
      }
    }

    if (btnTdm) btnTdm.addEventListener('click', () => renderMode('tdm'));
    if (btnFdm) btnFdm.addEventListener('click', () => renderMode('fdm'));
    if (btnPacket) btnPacket.addEventListener('click', () => renderMode('packet'));

    // Výchozí režim: Paketový multiplex
    renderMode('packet');
  }

  // --- 2. INTERAKTIVNÍ INSPEKTOR ENKAPSULACE PDU ---
  const pduLayerData = {
    app: {
      name: 'Aplikační vrstva (L7–L5)',
      pdu: 'Data (Payload)',
      color: '#c084fc',
      border: 'rgba(168, 85, 247, 0.4)',
      address: 'Aplikační data & kódování',
      headers: [
        { lbl: 'Obsah zprávy (Data)', val: 'HTTP GET /index.html (HTML, JSON, obrazová data)', cls: 'pdu-field-data' }
      ],
      desc: 'Uživatel odesílá data (např. požadavek na webovou stránku, e-mail nebo video). Data jsou ve formátu srozumitelném pro aplikaci (UTF-8, JPEG, JSON).'
    },
    transport: {
      name: 'Transportní vrstva (L4)',
      pdu: 'Segment (TCP) / Datagram (UDP)',
      color: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.4)',
      address: 'Čísla portů (Porty)',
      headers: [
        { lbl: 'Zdrojový port', val: '54210 (Klientský)', cls: 'pdu-field-hdr' },
        { lbl: 'Cílový port', val: '443 (HTTPS)', cls: 'pdu-field-hdr' },
        { lbl: 'Pořadové číslo (Seq)', val: '0x3FA91B', cls: 'pdu-field-hdr' },
        { lbl: 'Data aplikace', val: 'Payload (HTTP GET...)', cls: 'pdu-field-data' }
      ],
      desc: 'Transportní vrstva dělí data na segmenty a přidává hlavičku s čísly portů pro identifikaci správné cílové aplikace. TCP navíc garantuje spolehlivost a pořadí.'
    },
    network: {
      name: 'Síťová vrstva (L3)',
      pdu: 'Paket (Packet)',
      color: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.4)',
      address: 'Logická IP adresa',
      headers: [
        { lbl: 'Zdrojová IP', val: '192.168.1.105', cls: 'pdu-field-hdr' },
        { lbl: 'Cílová IP', val: '93.184.216.34', cls: 'pdu-field-hdr' },
        { lbl: 'TTL / Protokol', val: '64 / TCP (6)', cls: 'pdu-field-hdr' },
        { lbl: 'Segment (L4)', val: 'TCP Header + Data', cls: 'pdu-field-data' }
      ],
      desc: 'Přidává IP hlavičku obsahující zdrojovou a cílovou IP adresu. Zajišťuje logické směrování (routing) napříč různými sítěmi a celým Internetem.'
    },
    datalink: {
      name: 'Linková vrstva (L2)',
      pdu: 'Rámec (Frame)',
      color: '#34d399',
      border: 'rgba(52, 211, 153, 0.4)',
      address: 'Fyzická MAC adresa',
      headers: [
        { lbl: 'Cílová MAC', val: 'AA:BB:CC:11:22:33', cls: 'pdu-field-hdr' },
        { lbl: 'Zdrojová MAC', val: '00:1A:2B:3C:4D:5E', cls: 'pdu-field-hdr' },
        { lbl: 'EtherType', val: '0x0800 (IPv4)', cls: 'pdu-field-hdr' },
        { lbl: 'Paket (L3)', val: 'IP Packet', cls: 'pdu-field-data' },
        { lbl: 'FCS / CRC32', val: 'Kontrolní součet', cls: 'pdu-field-trailer' }
      ],
      desc: 'Zabaluje paket do rámce pro lokální síť (LAN). Přidává MAC adresy a na konec rámce kontrolní součet (FCS/CRC) pro detekci chyb vzniklých přenosem.'
    },
    physical: {
      name: 'Fyzická vrstva (L1)',
      pdu: 'Bity (Bits / Signály)',
      color: '#fbbf24',
      border: 'rgba(251, 191, 36, 0.4)',
      address: 'Kódování signálu (Napětí / Světlo / Rádiové vlny)',
      headers: [
        { lbl: 'Fyzický signál', val: '01001000 01100101 01101100 01101100 01101111 ...', cls: 'pdu-field-data' }
      ],
      desc: 'Pevné bity (0 a 1) jsou kódovány do fyzických signálů: elektrické napěťové pulzy na mědi, světelné záblesky v optickém vlákně nebo modulované elektromagnetické vlny ve vzduchu.'
    }
  };

  function initPduInspector() {
    const layerBtns = document.querySelectorAll('.pdu-layer-btn');
    const titleEl = document.getElementById('pduInspTitle');
    const unitEl = document.getElementById('pduInspUnit');
    const addrEl = document.getElementById('pduInspAddr');
    const visualEl = document.getElementById('pduInspVisual');
    const descEl = document.getElementById('pduInspDesc');

    if (!layerBtns.length || !titleEl || !visualEl) return;

    function selectLayer(layerKey) {
      const data = pduLayerData[layerKey];
      if (!data) return;

      layerBtns.forEach(btn => {
        if (btn.getAttribute('data-layer') === layerKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      titleEl.textContent = data.name;
      titleEl.style.color = data.color;
      unitEl.textContent = `PDU: ${data.pdu}`;
      unitEl.style.borderColor = data.border;
      unitEl.style.color = data.color;
      addrEl.textContent = `Adresace: ${data.address}`;
      descEl.textContent = data.desc;

      visualEl.innerHTML = data.headers.map(h => `
        <div class="pdu-field ${h.cls}">
          <span class="pdu-field-lbl">${h.lbl}</span>
          <span>${h.val}</span>
        </div>
      `).join('');
    }

    layerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.getAttribute('data-layer');
        selectLayer(layer);
      });
    });

    // Výchozí vybraná vrstva: L3 Paket
    selectLayer('network');
  }

  // --- 3. INTERAKTIVNÍ OTÁZKY S NÁPOVĚDOU ---
  function initQuestionHints() {
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
  }

  // Spuštění po načtení DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMultiplexingDemo();
      initPduInspector();
      initQuestionHints();
    });
  } else {
    initMultiplexingDemo();
    initPduInspector();
    initQuestionHints();
  }
})();
