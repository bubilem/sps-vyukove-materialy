/**
 * Téma 041: IP Adresace - Interaktivní výukový engine
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initIpAnalyzer();
  initIpv6Playground();
  initQuizQuestions();
});

/* ==========================================================================
   1. Interaktivní IP Adresní Analyzer & AND kalkulátor
   ========================================================================== */
function initIpAnalyzer() {
  const ipInput = document.getElementById('analyzerIp');
  const maskSelect = document.getElementById('analyzerMask');
  const calcBtn = document.getElementById('analyzerCalcBtn');
  const presetChips = document.querySelectorAll('.preset-chip');

  if (!ipInput || !maskSelect || !calcBtn) return;

  function toBin8(num) {
    return num.toString(2).padStart(8, '0');
  }

  function ipToLong(ipStr) {
    const parts = ipStr.trim().split('.');
    if (parts.length !== 4) return null;
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const octet = parseInt(parts[i], 10);
      if (isNaN(octet) || octet < 0 || octet > 255) return null;
      n = (n << 8) | octet;
    }
    return n >>> 0;
  }

  function longToIp(n) {
    return [
      (n >>> 24) & 255,
      (n >>> 16) & 255,
      (n >>> 8) & 255,
      n & 255
    ].join('.');
  }

  function longToBin(n) {
    return [
      toBin8((n >>> 24) & 255),
      toBin8((n >>> 16) & 255),
      toBin8((n >>> 8) & 255),
      toBin8(n & 255)
    ].join(' . ');
  }

  function classifyAddress(longVal) {
    const o1 = (longVal >>> 24) & 255;
    const o2 = (longVal >>> 16) & 255;

    // Loopback
    if (o1 === 127) {
      return { type: 'Speciální: Loopback (Zpětná smyčka)', class: 'info-warning', scope: 'Lokální uzel (localhost)' };
    }
    // APIPA Link-Local
    if (o1 === 169 && o2 === 254) {
      return { type: 'Speciální: APIPA (Link-Local auto-IP)', class: 'info-warning', scope: 'Lokální L2 segment (bez DHCP)' };
    }
    // RFC 1918 Private
    if (o1 === 10) {
      return { type: 'Privátní adresa (RFC 1918 Třída A)', class: 'info-success', scope: 'Lokální privátní LAN (nesměrovatelná v Internetu)' };
    }
    if (o1 === 172 && o2 >= 16 && o2 <= 31) {
      return { type: 'Privátní adresa (RFC 1918 Třída B)', class: 'info-success', scope: 'Lokální privátní LAN (nesměrovatelná v Internetu)' };
    }
    if (o1 === 192 && o2 === 168) {
      return { type: 'Privátní adresa (RFC 1918 Třída C)', class: 'info-success', scope: 'Domácí / firemní LAN (nesměrovatelná v Internetu)' };
    }
    // Multicast
    if (o1 >= 224 && o1 <= 239) {
      return { type: 'Multicast skupina (Třída D)', class: 'info-danger', scope: 'Skupinové vysílání' };
    }
    // Experimental
    if (o1 >= 240) {
      return { type: 'Experimentální / Rezervovaná (Třída E)', class: 'info-warning', scope: 'Rezervováno' };
    }
    // TEST-NET documentation
    if ((o1 === 192 && o2 === 0) || (o1 === 198 && o2 === 51) || (o1 === 203 && o2 === 0)) {
      return { type: 'Dokumentační adresa (TEST-NET)', class: 'info-box', scope: 'Výukové příklady a dokumentace RFC 5737' };
    }

    return { type: 'Globální veřejná IP adresa', class: 'info-box', scope: 'Globálně unikátní a směrovatelná v celosvětovém Internetu' };
  }

  function calculate() {
    const ipStr = ipInput.value.trim();
    const prefix = parseInt(maskSelect.value, 10);
    const ipLong = ipToLong(ipStr);

    const outMath = document.getElementById('analyzerMath');
    const outNet = document.getElementById('resNet');
    const outBcast = document.getElementById('resBcast');
    const outRange = document.getElementById('resRange');
    const outHosts = document.getElementById('resHosts');
    const outType = document.getElementById('resType');

    if (!outMath || !outNet) return;

    if (ipLong === null) {
      outMath.innerHTML = `<span style="color: #f87171;">Chyba: Zadejte platnou IPv4 adresu (čtyři čísla 0–255 oddělená tečkou).</span>`;
      return;
    }

    const maskLong = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const netLong = (ipLong & maskLong) >>> 0;
    const wildcardLong = (~maskLong) >>> 0;
    const bcastLong = (netLong | wildcardLong) >>> 0;

    const hostBits = 32 - prefix;
    const totalAddresses = Math.pow(2, hostBits);
    const usableHosts = hostBits <= 1 ? 0 : totalAddresses - 2;

    const firstHost = hostBits <= 1 ? netLong : netLong + 1;
    const lastHost = hostBits <= 1 ? bcastLong : bcastLong - 1;

    // Vykreslení bitového součinu AND
    outMath.innerHTML = `
      <div class="and-line">
        <span style="color: #60a5fa;">IP adresa:</span>
        <span>${longToBin(ipLong)} &nbsp;(${ipStr})</span>
      </div>
      <div class="and-line">
        <span style="color: #f59e0b;">Maska podsítě:</span>
        <span>${longToBin(maskLong)} &nbsp;(${longToIp(maskLong)})</span>
      </div>
      <div class="and-line divider"></div>
      <div class="and-line" style="font-weight: 700;">
        <span style="color: #34d399;">Bitový součin (AND):</span>
        <span style="color: #34d399;">${longToBin(netLong)} &nbsp;(${longToIp(netLong)})</span>
      </div>
    `;

    outNet.textContent = `${longToIp(netLong)} /${prefix}`;
    outBcast.textContent = longToIp(bcastLong);
    
    if (usableHosts > 0) {
      outRange.textContent = `${longToIp(firstHost)} – ${longToIp(lastHost)}`;
      outHosts.textContent = `${usableHosts.toLocaleString('cs-CZ')} počítačů (celkem ${totalAddresses} adres)`;
    } else {
      outRange.textContent = 'Speciální spoj Point-to-Point';
      outHosts.textContent = `${totalAddresses} adres`;
    }

    const classification = classifyAddress(ipLong);
    outType.innerHTML = `<span style="color: #38bdf8; font-weight:700;">${classification.type}</span><br><small style="color: #94a3b8;">${classification.scope}</small>`;
  }

  calcBtn.addEventListener('click', calculate);

  ipInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculate();
  });

  maskSelect.addEventListener('change', calculate);

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const ip = chip.getAttribute('data-ip');
      const mask = chip.getAttribute('data-mask');
      if (ip && mask) {
        ipInput.value = ip;
        maskSelect.value = mask;
        calculate();
      }
    });
  });

  // První výpočet při startu
  calculate();
}

/* ==========================================================================
   2. Interaktivní IPv6 Zkracovací trenažér
   ========================================================================== */
function initIpv6Playground() {
  const v6Input = document.getElementById('v6Input');
  const v6Btn = document.getElementById('v6Btn');
  const step1El = document.getElementById('v6Step1');
  const step2El = document.getElementById('v6Step2');
  const finalEl = document.getElementById('v6Final');
  const presetBtns = document.querySelectorAll('.v6-preset-btn');

  if (!v6Input || !v6Btn || !step1El) return;

  function processIpv6() {
    let raw = v6Input.value.trim().toLowerCase();

    // Pokud uživatel zadá zkrácenou, nejdřív ji rozbalíme na 8 plných hextetů
    let fullHextets = expandIpv6(raw);

    if (!fullHextets || fullHextets.length !== 8) {
      step1El.textContent = 'Chyba: Zadejte platnou IPv6 adresu v hextetech (např. 2001:0db8:0000:0000:0008:0800:200c:417a)';
      step2El.textContent = '—';
      finalEl.textContent = '—';
      return;
    }

    // Krok 1: Odstranění úvodních nul v každém hextetu (Pravidlo 1)
    const rule1Hextets = fullHextets.map(h => {
      const stripped = h.replace(/^0+/, '');
      return stripped === '' ? '0' : stripped;
    });
    const step1Str = rule1Hextets.join(':');
    step1El.textContent = step1Str;

    // Krok 2: Nahrazení nejdelší souvislé řady nul dvojtečkou :: (Pravidlo 2 dle RFC 5952)
    const step2Str = compressZeroes(rule1Hextets);
    step2El.textContent = step2Str;
    finalEl.textContent = step2Str;
  }

  function expandIpv6(ip) {
    if (ip.includes(':::')) return null;

    let parts = ip.split('::');
    if (parts.length > 2) return null; // více než jedno :: je neplatné

    if (parts.length === 2) {
      let left = parts[0] ? parts[0].split(':') : [];
      let right = parts[1] ? parts[1].split(':') : [];
      let missing = 8 - (left.length + right.length);
      if (missing < 1) return null;
      let mid = Array(missing).fill('0000');
      let combined = left.concat(mid).concat(right);
      return combined.map(pad4);
    } else {
      let hextets = ip.split(':');
      if (hextets.length !== 8) return null;
      return hextets.map(pad4);
    }
  }

  function pad4(h) {
    if (h.length > 4) return null;
    return h.padStart(4, '0');
  }

  function compressZeroes(hextets) {
    // Hledáme nejdelší souvislou řadu "0"
    let maxLen = 0;
    let maxStart = -1;
    let curLen = 0;
    let curStart = -1;

    for (let i = 0; i < hextets.length; i++) {
      if (hextets[i] === '0') {
        if (curStart === -1) curStart = i;
        curLen++;
        if (curLen > maxLen) {
          maxLen = curLen;
          maxStart = curStart;
        }
      } else {
        curStart = -1;
        curLen = 0;
      }
    }

    // RFC 5952: zkracujeme pouze sekvenci alespoň 2 nul za sebou
    if (maxLen >= 2) {
      let left = hextets.slice(0, maxStart).join(':');
      let right = hextets.slice(maxStart + maxLen).join(':');
      return (left ? left : '') + '::' + (right ? right : '');
    }

    return hextets.join(':');
  }

  v6Btn.addEventListener('click', processIpv6);

  v6Input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') processIpv6();
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-v6');
      if (v) {
        v6Input.value = v;
        processIpv6();
      }
    });
  });

  // Prvotní běh
  processIpv6();
}

/* ==========================================================================
   3. Prověření znalostí – Kvízové karty
   ========================================================================== */
function initQuizQuestions() {
  const cards = document.querySelectorAll('.question-card');
  cards.forEach(card => {
    const btn = card.querySelector('.question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isRevealed = card.classList.contains('revealed');
        if (isRevealed) {
          card.classList.remove('revealed');
          btn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <span>Zobrazit odpověď</span>
          `;
        } else {
          card.classList.add('revealed');
          btn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>Skrýt odpověď</span>
          `;
        }
      });
    }
  });
}
