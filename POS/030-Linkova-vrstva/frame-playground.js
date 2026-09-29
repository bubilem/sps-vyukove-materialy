/**
 * Interaktivní engine pro Téma 030: Linková vrstva
 * SPŠ Výukové materiály • Předmět POS
 */

document.addEventListener('DOMContentLoaded', () => {
  initFrameInspector();
  initMacDecoder();
  initCrcSimulator();
});

/* ==========================================================================
   1. Interaktivní Frame Inspector (Rozpad rámce L2)
   ========================================================================== */
function initFrameInspector() {
  const blocks = document.querySelectorAll('.frame-block');
  const titleEl = document.getElementById('frameDetailTitle');
  const descEl = document.getElementById('frameDetailDesc');
  const rawEl = document.getElementById('frameDetailRaw');

  if (!blocks.length || !titleEl) return;

  const frameData = {
    preamble: {
      title: 'Preamble & SFD (Předzahrádka a oddělovač)',
      desc: '7 bajtů střídavých jedniček a nul (10101010...) pro synchronizaci hodin přijímače s vysílačem, zakončeno 1 bajtem SFD (Start of Frame Delimiter: 10101011), který oznamuje: „pozor, hned za tímto bajtem začíná cílová MAC adresa!“.',
      raw: 'Binárně: 10101010...10101011 (Celkem 8 B / 64 bitů)'
    },
    dst: {
      title: 'Destination MAC Address (Cílová fyzická adresa)',
      desc: 'Fyzická adresa síťové karty (NIC), pro kterou je rámec určen. Síťová karta přijme rámec pouze v případě, že se tato adresa shoduje s její vlastní MAC, nebo pokud jde o Broadcast či Multicast.',
      raw: 'Příklad: 00:1A:2B:3C:4D:5E (6 bajtů / 48 bitů)'
    },
    src: {
      title: 'Source MAC Address (Zdrojová fyzická adresa)',
      desc: 'Fyzická adresa odesílatele rámce. Přepínače (L2 Switch) tuto adresu čtou pro učení se topologie a dynamické plnění své CAM tabulky (port <-> MAC).',
      raw: 'Příklad: B8:27:EB:12:34:56 (6 bajtů / 48 bitů)'
    },
    type: {
      title: 'EtherType / Délka (Typ protokolu L3)',
      desc: 'Definuje protokol síťové vrstvy zapouzdřený v těle rámce. Hodnoty nad 1536 (0x0600) označují EtherType: nejčastěji 0x0800 (IPv4), 0x86DD (IPv6), 0x0806 (ARP). Pokud je hodnota menší než 1500, jde o délku dat (IEEE 802.3).',
      raw: 'Příklad: 0x0800 (IPv4 paket uvnitř), 0x86DD (IPv6 paket)'
    },
    payload: {
      title: 'Payload / Data (Užitečné zatížení)',
      desc: 'Data předaná z vyšší vrstvy (nejčastěji L3 IP paket). Minimální velikost je 46 bajtů (pokud je paket menší, doplní se výplňovými nulami tzv. paddingem na 46 B). Maximální standardní velikost MTU je 1500 bajtů.',
      raw: 'Rozsah: 46 až 1500 bajtů (s paddingem vždy min. 46 B)'
    },
    fcs: {
      title: 'FCS / CRC-32 (Frame Check Sequence)',
      desc: 'Kontrolní součet vypočtený vysílačem pomocí cyklického redundantního kódu (CRC-32) přes všechna pole rámce. Přijímač provede stejný výpočet; pokud se výsledky neshodují, rámec byl poškozen rušením a je okamžitě nemilosrdně ZAHODEN.',
      raw: 'Příklad: 0x4C1A8F20 (4 bajty / 32 bitů algoritmem CRC-32)'
    }
  };

  blocks.forEach(block => {
    block.addEventListener('click', () => {
      blocks.forEach(b => b.classList.remove('active'));
      block.classList.add('active');
      const key = block.dataset.field;
      if (frameData[key]) {
        titleEl.textContent = frameData[key].title;
        descEl.textContent = frameData[key].desc;
        rawEl.textContent = frameData[key].raw;
      }
    });
  });
}

/* ==========================================================================
   2. Interaktivní MAC Dekodér a Analyzátor bitů
   ========================================================================== */
function initMacDecoder() {
  const input = document.getElementById('macInput');
  const ouiBytesEl = document.getElementById('ouiBytes');
  const nicBytesEl = document.getElementById('nicBytes');
  const vendorNameEl = document.getElementById('vendorName');
  const igBadgeEl = document.getElementById('igBadge');
  const ulBadgeEl = document.getElementById('ulBadge');
  const presetBtns = document.querySelectorAll('.mac-preset-btn');

  if (!input) return;

  const vendorDB = {
    '00:1a:2b': 'Cisco Systems, Inc.',
    'b8:27:eb': 'Raspberry Pi Foundation',
    'dc:a6:32': 'Raspberry Pi Trading Ltd',
    'f4:39:09': 'Hewlett Packard Enterprise',
    '00:0c:29': 'VMware, Inc.',
    'ac:de:48': 'Apple, Inc.',
    '70:85:c2': 'Intel Corporate',
    '50:c7:bf': 'TP-Link Corporation',
    'ff:ff:ff': 'Broadcast (Všechny stanice)',
    '01:00:5e': 'IPv4 Multicast (IANA)'
  };

  function decodeMac(raw) {
    // Odstranění oddělovačů a normalizace
    const clean = raw.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    if (clean.length < 6) return;

    const formatted = clean.match(/.{1,2}/g) || [];
    const macHex = formatted.slice(0, 6).join(':');

    const oui = formatted.slice(0, 3).join(':');
    const nic = formatted.slice(3, 6).join(':') || '--:--:--';

    ouiBytesEl.textContent = oui.toUpperCase();
    nicBytesEl.textContent = nic.toUpperCase();

    // Hledání výrobce
    const vendor = vendorDB[oui] || 'Neznámý / Privátní výrobce OUI';
    vendorNameEl.textContent = vendor;

    // První bajt pro bity I/G a U/L
    const firstByteVal = parseInt(formatted[0], 16);
    
    // Bit 0 prvního bajtu: I/G (Individual / Group -> Unicast vs Multicast)
    const isGroup = (firstByteVal & 1) === 1;
    // Broadcast kontrola
    const isBroadcast = clean.startsWith('ffffffffffff');

    if (isBroadcast) {
      igBadgeEl.textContent = 'Broadcast (FF:FF:FF:FF:FF:FF)';
      igBadgeEl.className = 'flag-badge flag-broadcast';
    } else if (isGroup) {
      igBadgeEl.textContent = 'Multicast (Skupinový rámec, I/G bit = 1)';
      igBadgeEl.className = 'flag-badge flag-multicast';
    } else {
      igBadgeEl.textContent = 'Unicast (Individuální adresa, I/G bit = 0)';
      igBadgeEl.className = 'flag-badge flag-unicast';
    }

    // Bit 1 prvního bajtu: U/L (Universal / Local)
    const isLocal = (firstByteVal & 2) === 2;
    if (isLocal) {
      ulBadgeEl.textContent = 'Lokálně spravovaná (Locally Administered, U/L = 1)';
      ulBadgeEl.className = 'flag-badge flag-local';
    } else {
      ulBadgeEl.textContent = 'Globálně unikátní OUI (Globally Unique IEEE, U/L = 0)';
      ulBadgeEl.className = 'flag-badge flag-universal';
    }
  }

  input.addEventListener('input', () => decodeMac(input.value));

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.mac;
      decodeMac(btn.dataset.mac);
    });
  });

  // Počáteční dekódování
  decodeMac(input.value);
}

/* ==========================================================================
   3. Interaktivní simulátor CRC-32 detekce poškození
   ========================================================================== */
function initCrcSimulator() {
  const container = document.getElementById('crcBitsContainer');
  const crcDisplay = document.getElementById('crcDisplay');
  const crcStatusBar = document.getElementById('crcStatusBar');
  const crcStatusText = document.getElementById('crcStatusText');
  const resetBtn = document.getElementById('resetCrcBtn');

  if (!container || !crcDisplay) return;

  const initialBits = [1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1];
  let currentBits = [...initialBits];

  // Jednoduchá CRC-32 aproximační hash funkce pro pedagogické účely
  function calculatePseudoCrc(bits) {
    let crc = 0x4C1A8F20;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        crc = (crc ^ (0xEDB88320 >>> (i % 8))) >>> 0;
      }
    }
    return '0x' + crc.toString(16).toUpperCase().padStart(8, '0');
  }

  const expectedCrc = calculatePseudoCrc(initialBits);

  function renderBits() {
    container.innerHTML = '';
    currentBits.forEach((bit, idx) => {
      const btn = document.createElement('button');
      btn.className = `bit-btn ${bit !== initialBits[idx] ? 'flipped' : ''}`;
      btn.textContent = bit;
      btn.title = `Bit #${idx + 1} (Kliknutím zneguj stav 0 <-> 1)`;
      btn.addEventListener('click', () => {
        currentBits[idx] = currentBits[idx] === 1 ? 0 : 1;
        renderBits();
        updateCrc();
      });
      container.appendChild(btn);
    });
  }

  function updateCrc() {
    const computed = calculatePseudoCrc(currentBits);
    crcDisplay.textContent = computed;

    const isMatch = computed === expectedCrc;
    if (isMatch) {
      crcStatusBar.className = 'crc-status-bar crc-status-valid';
      crcStatusText.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" style="color: #10b981; display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <strong>KONTROLNÍ SOUČET SOUHLASÍ (OK):</strong> Rámec byl doručen bez chyby a je předán síťové vrstvě L3.
      `;
    } else {
      crcStatusBar.className = 'crc-status-bar crc-status-invalid';
      crcStatusText.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" style="color: #f43f5e; display: inline-block; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <strong>CHYBA CRC (FRAME CORRUPTED):</strong> Vypočtené CRC (${computed}) neodpovídá původnímu FCS! Rámec je <strong>ZAHODEN</strong>.
      `;
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentBits = [...initialBits];
      renderBits();
      updateCrc();
    });
  }

  renderBits();
  updateCrc();
}
