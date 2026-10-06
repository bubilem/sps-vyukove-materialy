/**
 * Téma 040: Síťová vrstva (Network Layer) - Interaktivní výukový engine
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initPacketHeaderExplorer();
  initRoutingSimulator();
  initQuizQuestions();
});

/* ==========================================================================
   1. Interaktivní Packet Header Explorer (IPv4 & IPv6)
   ========================================================================== */
function initPacketHeaderExplorer() {
  const cells = document.querySelectorAll('.hdr-cell');
  const titleEl = document.getElementById('hdrDetailTitle');
  const descEl = document.getElementById('hdrDetailDesc');
  const rfcEl = document.getElementById('hdrDetailRfc');

  if (!cells.length || !titleEl || !descEl) return;

  const headerInfo = {
    'ver': {
      title: 'Version (Verze) – 4 bity',
      desc: 'Určuje verzi IP protokolu. Pro IPv4 má hodnotu binárně 0100 (4). Router podle tohoto pole okamžitě ví, jak má zbývající část paketu interpretovat.',
      rfc: 'RFC 791 • Hodnota: 4 (0100)'
    },
    'ihl': {
      title: 'IHL (Internet Header Length) – 4 bity',
      desc: 'Délka záhlaví IPv4 paketu vyjádřená v 32bitových slovech (4bajtových blocích). Minimální hodnota je 5 (5 × 4 = 20 bajtů bez volitelných voleb), maximální 15 (60 bajtů).',
      rfc: 'RFC 791 • Standard: 5 (20 bajtů)'
    },
    'dscp': {
      title: 'DSCP / ECN (Diferencované služby / QoS) – 8 bitů',
      desc: 'Původně Type of Service (ToS). Prvních 6 bitů (DSCP) slouží pro klasifikaci kvality služeb (QoS – např. priorita pro hlas VoIP nebo video). Poslední 2 bity (ECN) umožňují signalizovat přetížení sítě bez nutnosti zahazovat pakety.',
      rfc: 'RFC 2474, RFC 3168 • QoS řízení priorit'
    },
    'len': {
      title: 'Total Length (Celková délka) – 16 bitů',
      desc: 'Udává celkovou délku celého IP paketu v bajtech (včetně záhlaví i užitečných dat L4). Maximální teoretická velikost je 65 535 bajtů, v praxi omezena hodnotou MTU sítě (např. Ethernet MTU 1500 bajtů).',
      rfc: 'RFC 791 • Rozsah: 20 až 65 535 B'
    },
    'id': {
      title: 'Identification (Identifikace) – 16 bitů',
      desc: 'Jedinečné číslo přidělené odesílatelem, které slouží ke složení fragmentovaného paketu na straně příjemce. Všechny úlomky (fragmenty) původního paketu sdílejí stejné ID.',
      rfc: 'RFC 791 • Slouží při fragmentaci paketu'
    },
    'flags': {
      title: 'Flags (Příznaky fragmentace) – 3 bity',
      desc: 'Řídí fragmentaci paketu: 1. bit je rezervován (musí být 0). 2. bit je DF (Don\'t Fragment – zakazuje dělení paketu). 3. bit je MF (More Fragments – 1 = za tímto paketem následují další fragmenty, 0 = poslední fragment).',
      rfc: 'RFC 791 • DF (Don\'t Fragment), MF (More Fragments)'
    },
    'offset': {
      title: 'Fragment Offset (Posun fragmentu) – 13 bitů',
      desc: 'Udává pozici dat v původním nefragmentovaném paketu v jednotkách po 8 bajtech. Příjemce podle něj dokáže fragmenty správně poskládat ve správném pořadí, i když dorazí přeházené.',
      rfc: 'RFC 791 • Jednotka: 8 bajtů (64 bitů)'
    },
    'ttl': {
      title: 'TTL (Time to Live) – 8 bitů',
      desc: 'Kritická ochrana proti nekonečným smyčkám v síti! Čítač skoků: každý router, přes který paket projde, sníží TTL o 1. Pokud hodnota klesne na 0, router paket zahodí a odesílateli vrátí zprávu ICMP Time Exceeded (na tom je založen příkaz traceroute). Výchozí hodnoty v OS: Windows 128, Linux 64.',
      rfc: 'RFC 791 • Klíčová prevence smyček L3'
    },
    'proto': {
      title: 'Protocol (Protokol vyšší vrstvy) – 8 bitů',
      desc: 'Identifikuje protokol transportní vrstvy L4, kterému má router/hostitel předat užitečný náklad paketu. Mezi nejznámější čísla patří: 1 = ICMP, 6 = TCP, 17 = UDP, 89 = OSPF.',
      rfc: 'RFC 790, RFC 791 • Hodnoty: 6=TCP, 17=UDP, 1=ICMP'
    },
    'chk': {
      title: 'Header Checksum (Kontrolní součet záhlaví) – 16 bitů',
      desc: 'Kontrolní součet počítaný POUZE přes záhlaví paketu (nikoliv užitečná data). Protože se TTL na každém routeru snižuje, musí KAŽDÝ router tuto kontrolní sumu přepočítat! V IPv6 byl tento součet zcela zrušen pro zrychlení směrování.',
      rfc: 'RFC 791 • Přepočítává se na každém skoku'
    },
    'src': {
      title: 'Source IP Address (Zdrojová IP adresa) – 32 bitů',
      desc: 'Globální logická adresa zařízení, které paket původně odeslalo. Zůstává neměnná po celé trase sítě (pokud paket neprochází překladem adres NAT).',
      rfc: 'RFC 791 • 4 bajty (např. 192.168.1.10)'
    },
    'dst': {
      title: 'Destination IP Address (Cílová IP adresa) – 32 bitů',
      desc: 'Globální logická adresa koncového příjemce paketu. Směrovače (routery) se dívají primárně na tuto adresu při vyhledávání v routovací tabulce.',
      rfc: 'RFC 791 • 4 bajty (např. 93.184.216.34)'
    },
    'opt': {
      title: 'Options & Padding (Volitelné volby a zarovnání) – proměnná',
      desc: 'Volitelné informace (např. záznam trasy, časová razítka, security). Padding zarovnává celkovou délku záhlaví na násobek 32 bitů. V běžném provozu se téměř nepoužívá.',
      rfc: 'RFC 791 • 0 až 40 bajtů'
    },
    /* IPv6 Pole */
    'v6-ver': {
      title: 'Version (Verze IPv6) – 4 bity',
      desc: 'Určuje verzi protokolu IPv6. Má pevnou binární hodnotu 0110 (6).',
      rfc: 'RFC 8200 • Hodnota: 6 (0110)'
    },
    'v6-tc': {
      title: 'Traffic Class (Třída provozu) – 8 bitů',
      desc: 'Ekvivalent pole DSCP/ECN z IPv4. Slouží ke značkování priorit provozu pro Quality of Service (QoS).',
      rfc: 'RFC 8200 • QoS řízení priorit v IPv6'
    },
    'v6-fl': {
      title: 'Flow Label (Značka toku) – 20 bitů',
      desc: 'Umožňuje označit pakety patřící do stejného komunikačního toku (např. realtime stream). Routery mohou všechny pakety toku odbavit stejnou cestou bez opakované hloubkové analýzy.',
      rfc: 'RFC 6437, RFC 8200 • Rychlé odbavení toků'
    },
    'v6-pl': {
      title: 'Payload Length (Délka užitečného zatížení) – 16 bitů',
      desc: 'Udává délku dat za 40bajtovým pevným záhlavím (včetně případných rozšiřujících Extension Headers).',
      rfc: 'RFC 8200 • Data za fixní 40B hlavičkou'
    },
    'v6-nh': {
      title: 'Next Header (Následující záhlaví) – 8 bitů',
      desc: 'Geniální koncept IPv6! Nahrazuje pole Protocol z IPv4. Udává buď protokol vyšší vrstvy (6=TCP, 17=UDP), NEBO typ zřetězeného rozšiřujícího záhlaví (Extension Header: např. Routing, Fragmentace, IPSec ESP/AH).',
      rfc: 'RFC 8200 • Řetězení rozšiřujících hlaviček'
    },
    'v6-hl': {
      title: 'Hop Limit (Limit skoků) – 8 bitů',
      desc: 'Přímý ekvivalent pole TTL z IPv4. Každý router sníží hodnotu o 1. Při dosažení 0 je paket zahozen a odesílateli vrácena zpráva ICMPv6 Time Exceeded.',
      rfc: 'RFC 8200 • Prevence smyček v IPv6'
    },
    'v6-src': {
      title: 'Source IPv6 Address (Zdrojová adresa) – 128 bitů',
      desc: 'Globální 128bitová adresa odesílatele (16 bajtů). Poskytuje gigantický adresní prostor ($2^{128}$ unikátních adres).',
      rfc: 'RFC 4291, RFC 8200 • 16 bajtů (128 bitů)'
    },
    'v6-dst': {
      title: 'Destination IPv6 Address (Cílová adresa) – 128 bitů',
      desc: 'Globální 128bitová adresa koncového příjemce paketu. Routery provádějí směrování podle cílového prefixu.',
      rfc: 'RFC 4291, RFC 8200 • 16 bajtů (128 bitů)'
    }
  };

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      cells.forEach(c => c.classList.remove('active'));
      cell.classList.add('active');

      const field = cell.getAttribute('data-field');
      const data = headerInfo[field];

      if (data) {
        titleEl.textContent = data.title;
        descEl.textContent = data.desc;
        if (rfcEl) rfcEl.textContent = data.rfc;
      }
    });
  });
}

/* ==========================================================================
   2. Interaktivní simulátor směrovací tabulky a rozhodování routeru
   ========================================================================== */
function initRoutingSimulator() {
  const inputEl = document.getElementById('simDestIp');
  const btnEl = document.getElementById('simRouteBtn');
  const logEl = document.getElementById('simLog');
  const presetBtns = document.querySelectorAll('.sim-preset-btn');
  const tableRows = document.querySelectorAll('.routing-table-mini tbody tr');

  if (!inputEl || !btnEl || !logEl) return;

  // Ukázková směrovací tabulka Cisco routeru R1
  const routes = [
    { network: '192.168.1.0', prefix: 24, nextHop: 'Přímo připojená', iface: 'GigabitEthernet0/0/0', type: 'C', metric: 0 },
    { network: '192.168.1.32', prefix: 27, nextHop: '10.0.0.2', iface: 'Serial0/1/0', type: 'S', metric: 1 },
    { network: '192.168.1.48', prefix: 28, nextHop: '10.0.0.6', iface: 'GigabitEthernet0/0/1', type: 'O', metric: 110 },
    { network: '10.0.0.0', prefix: 8, nextHop: '192.168.100.1', iface: 'GigabitEthernet0/0/2', type: 'O', metric: 110 },
    { network: '172.16.0.0', prefix: 16, nextHop: '10.0.0.2', iface: 'Serial0/1/0', type: 'D', metric: 90 },
    { network: '0.0.0.0', prefix: 0, nextHop: '203.0.113.1', iface: 'GigabitEthernet0/1/0 (WAN)', type: 'S*', metric: 1 }
  ];

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

  function runSimulation() {
    const targetIpStr = inputEl.value.trim();
    const targetLong = ipToLong(targetIpStr);

    tableRows.forEach(r => {
      r.classList.remove('matched', 'candidate');
    });

    logEl.innerHTML = '';

    if (targetLong === null) {
      logEl.innerHTML = `<div class="sim-step" style="border-color: #f43f5e; color: #fca5a5;">Chyba: Zadejte platnou IPv4 adresu ve formátu X.X.X.X!</div>`;
      return;
    }

    appendLog(`[1] Přijat ethernetový rámec na rozhraní Gi0/0/0. Kontrola integrity FCS: OK.`, 'highlight');
    appendLog(`[2] Deenkapsulace: sejmuto L2 záhlaví, vyjmut IPv4 paket. Cílová IP: ${targetIpStr}.`);
    appendLog(`[3] Kontrola záhlaví IPv4: Verze=4, Checksum=Platný, TTL=64.`);
    appendLog(`[4] Dekrementace čítače TTL: 64 &rarr; 63 (paket neexpiroval).`, 'highlight');
    appendLog(`[5] Prohledávání směrovací tabulky (Routing Table Lookup)...`);

    let bestMatch = null;
    let bestPrefix = -1;
    let bestRowIdx = -1;

    routes.forEach((route, idx) => {
      const netLong = ipToLong(route.network);
      const maskLong = route.prefix === 0 ? 0 : (~0 << (32 - route.prefix)) >>> 0;
      const targetSubnet = (targetLong & maskLong) >>> 0;

      if (targetSubnet === netLong) {
        // Shoda
        if (tableRows[idx]) tableRows[idx].classList.add('candidate');
        appendLog(`&nbsp;&nbsp;&bull; Shoda s trasou: ${route.network}/${route.prefix} (délka shody prefixu = ${route.prefix})`);
        if (route.prefix > bestPrefix) {
          bestPrefix = route.prefix;
          bestMatch = route;
          bestRowIdx = idx;
        }
      }
    });

    if (bestMatch && bestRowIdx >= 0) {
      if (tableRows[bestRowIdx]) {
        tableRows[bestRowIdx].classList.remove('candidate');
        tableRows[bestRowIdx].classList.add('matched');
      }

      appendLog(`[6] VÍTĚZ: Longest Prefix Match &rarr; ${bestMatch.network}/${bestMatch.prefix} (${bestMatch.type})!`, 'success');
      appendLog(`[7] Rozhodnutí směrovače: Cesta přes Next-Hop [${bestMatch.nextHop}], odchozí rozhraní [${bestMatch.iface}].`, 'success');
      appendLog(`[8] ARP Lookup pro Next-Hop &rarr; zjištěna cílová MAC adresa.`, 'highlight');
      appendLog(`[9] Nová L2 enkapsulace: vytvořen nový Ethernet II rámec s novým FCS.`);
      appendLog(`[10] Odeslání paketu po fyzické lince přes ${bestMatch.iface}. Přeposlání dokončeno!`, 'success');
    } else {
      appendLog(`[6] Žádná trasa nenalezena (ani výchozí brána). Paket zahozen! Odesílám ICMP Destination Host Unreachable.`, 'highlight');
    }
  }

  function appendLog(text, className = '') {
    const div = document.createElement('div');
    div.className = 'sim-step ' + className;
    div.innerHTML = text;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  btnEl.addEventListener('click', runSimulation);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runSimulation();
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const ip = btn.getAttribute('data-ip');
      if (ip) {
        inputEl.value = ip;
        runSimulation();
      }
    });
  });
}

/* ==========================================================================
   3. Prověření znalostí – Interaktivní kvízové karty
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
