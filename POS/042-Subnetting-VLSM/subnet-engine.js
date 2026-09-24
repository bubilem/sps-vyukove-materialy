/**
 * ============================================================================
 * Téma 042: Subnetting a VLSM – Interaktivní výpočetní a vizualizační engine
 * Pro výukové materiály SPŠ (Počítačové sítě)
 * 100% Vanilla JS, 0 závislostí, offline provoz
 * ============================================================================
 */

(function () {
  'use strict';

  // --- 1. MATEMATICKÉ A IP POMOCNÉ FUNKCE ---
  const IP = {
    // Převede řetězec IPv4 na 32bitové bezznaménkové číslo
    toLong(ipStr) {
      const parts = ipStr.trim().split('.').map(p => parseInt(p, 10));
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        return null;
      }
      return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    },

    // Převede 32bitové číslo na IPv4 tvar "a.b.c.d"
    fromLong(longVal) {
      return [
        (longVal >>> 24) & 255,
        (longVal >>> 16) & 255,
        (longVal >>> 8) & 255,
        longVal & 255
      ].join('.');
    },

    // Vrátí 32bitovou masku pro zadaný CIDR prefix (0-32)
    cidrToMaskLong(cidr) {
      if (cidr === 0) return 0;
      return ((0xFFFFFFFF << (32 - cidr)) >>> 0);
    },

    // Převede desítkovou masku na CIDR číslo
    maskToCidr(maskLong) {
      let count = 0;
      let m = maskLong;
      while (m & 0x80000000) {
        count++;
        m = (m << 1) >>> 0;
      }
      return count;
    },

    // Převede číslo na 8bitový binární řetězec
    toBin8(num) {
      return (num >>> 0).toString(2).padStart(8, '0');
    },

    // Převede 32bitové číslo na 4 binární oktety oddělené tečkami
    toBin32(longVal) {
      return [
        IP.toBin8((longVal >>> 24) & 255),
        IP.toBin8((longVal >>> 16) & 255),
        IP.toBin8((longVal >>> 8) & 255),
        IP.toBin8(longVal & 255)
      ].join('.');
    },

    // Určí třídu IP adresy (A, B, C, D, E) dle RFC 791
    getClass(firstOctet) {
      if (firstOctet < 128) return 'A (Výchozí /8)';
      if (firstOctet < 192) return 'B (Výchozí /16)';
      if (firstOctet < 224) return 'C (Výchozí /24)';
      if (firstOctet < 240) return 'D (Multicast)';
      return 'E (Experimentální)';
    },

    // Zjistí, zda jde o privátní IP adresu dle RFC 1918
    isPrivate(longVal) {
      const o1 = (longVal >>> 24) & 255;
      const o2 = (longVal >>> 16) & 255;
      if (o1 === 10) return 'Privátní síť (RFC 1918: 10.0.0.0/8)';
      if (o1 === 172 && (o2 >= 16 && o2 <= 31)) return 'Privátní síť (RFC 1918: 172.16.0.0/12)';
      if (o1 === 192 && o2 === 168) return 'Privátní síť (RFC 1918: 192.168.0.0/16)';
      if (o1 === 127) return 'Loopback / Zpětná smyčka (127.0.0.0/8)';
      if (o1 === 169 && o2 === 254) return 'APIPA / Link-local (169.254.0.0/16)';
      return 'Veřejná globální IP adresa (Internet)';
    }
  };

  // Paleta harmonických barev pro výseče koláče
  const PALETTE = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
    '#6366f1', '#84cc16', '#a855f7', '#0284c7',
    '#d97706', '#059669', '#e11d48', '#4f46e5'
  ];

  // --- 2. SNÍMEK 2: INTERAKTIVNÍ BITWISE AND DEMONSTRÁTOR ---
  function initBitwiseAndDemo() {
    const ipInput = document.getElementById('andIpInput');
    const cidrSelect = document.getElementById('andCidrSelect');
    const outIpBin = document.getElementById('andIpBin');
    const outMaskBin = document.getElementById('andMaskBin');
    const outNetBin = document.getElementById('andNetBin');
    const outNetDec = document.getElementById('andNetDec');
    const outBoundaryInfo = document.getElementById('andBoundaryInfo');

    if (!ipInput || !cidrSelect) return;

    function update() {
      const ipLong = IP.toLong(ipInput.value) || IP.toLong('192.168.10.130');
      const cidr = parseInt(cidrSelect.value, 10);
      const maskLong = IP.cidrToMaskLong(cidr);
      const netLong = (ipLong & maskLong) >>> 0;

      const ipBinStr = IP.toBin32(ipLong).replace(/\./g, '');
      const maskBinStr = IP.toBin32(maskLong).replace(/\./g, '');
      const netBinStr = IP.toBin32(netLong).replace(/\./g, '');

      // Vykreslení s barevným odlišením síťových bitů (cyan) a hostitelských bitů (oranžová)
      function formatBits(binStr) {
        let html = '';
        for (let i = 0; i < 32; i++) {
          if (i > 0 && i % 8 === 0) {
            html += '<span class="octet-dot">.</span>';
          }
          const isNet = i < cidr;
          const isBoundary = (i === cidr - 1);
          const cls = isNet ? 'color: var(--sn-net-bit); font-weight: 800;' : 'color: var(--sn-host-bit); opacity: 0.85;';
          const borderStyle = isBoundary ? 'border-right: 2px solid var(--sn-purple); padding-right: 2px;' : '';
          html += `<span style="${cls} ${borderStyle}">${binStr[i]}</span>`;
        }
        return html;
      }

      if (outIpBin) outIpBin.innerHTML = formatBits(ipBinStr);
      if (outMaskBin) outMaskBin.innerHTML = formatBits(maskBinStr);
      if (outNetBin) outNetBin.innerHTML = formatBits(netBinStr);
      if (outNetDec) outNetDec.textContent = `${IP.fromLong(netLong)} /${cidr}`;
      if (outBoundaryInfo) {
        outBoundaryInfo.innerHTML = `Maska <strong>/${cidr}</strong> dělí 32 bitů na <span style="color: var(--sn-net-bit); font-weight: 700;">${cidr} síťových bitů</span> a <span style="color: var(--sn-host-bit); font-weight: 700;">${32 - cidr} hostitelských bitů</span>. Výpočet: <strong>${ipInput.value} AND ${IP.fromLong(maskLong)} = ${IP.fromLong(netLong)}</strong>.`;
      }
    }

    ipInput.addEventListener('input', update);
    cidrSelect.addEventListener('change', update);
    update();
  }

  // --- 3. SNÍMEK 3: PŘEPÍNAČ BITŮ OKTETU (KOUZELNÉ MOCNINY 2) ---
  function initOctetSwitchDemo() {
    const container = document.getElementById('octetSwitchContainer');
    const outDec = document.getElementById('switchDecValue');
    const outCidr = document.getElementById('switchCidr');
    const outHostBits = document.getElementById('switchHostBits');
    const outMaxHosts = document.getElementById('switchMaxHosts');
    const outSubnets = document.getElementById('switchSubnets');
    const outBlockSize = document.getElementById('switchBlockSize');

    if (!container) return;

    const weights = [128, 64, 32, 16, 8, 4, 2, 1];
    let bitStates = [1, 1, 0, 0, 0, 0, 0, 0]; // default: 128+64 = 192 (/26)

    function render() {
      container.innerHTML = '';
      weights.forEach((w, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `octet-switch-btn ${bitStates[idx] ? 'active' : ''}`;
        btn.innerHTML = `
          <span class="octet-switch-bit">${bitStates[idx]}</span>
          <span class="octet-switch-weight">${w}</span>
        `;
        btn.title = `Bit ${idx + 1} s váhou ${w}. Kliknutím přepnete 0/1`;
        btn.addEventListener('click', () => {
          bitStates[idx] = bitStates[idx] === 1 ? 0 : 1;
          render();
        });
        container.appendChild(btn);
      });

      // Výpočet parametrů
      let decVal = 0;
      let netBitsCount = 0;
      weights.forEach((w, idx) => {
        if (bitStates[idx]) {
          decVal += w;
          netBitsCount++;
        }
      });

      // Zkontrolujeme souvislost masky zleva
      let isContiguous = true;
      let seenZero = false;
      for (let i = 0; i < 8; i++) {
        if (bitStates[i] === 0) seenZero = true;
        if (seenZero && bitStates[i] === 1) isContiguous = false;
      }

      if (outDec) outDec.textContent = decVal;
      const cidrPrefix = 24 + netBitsCount;
      if (outCidr) {
        outCidr.textContent = isContiguous ? `/${cidrPrefix}` : 'Nesouvislá maska';
      }
      const hostBits = 8 - netBitsCount;
      if (outHostBits) outHostBits.textContent = hostBits;
      const maxHosts = hostBits >= 2 ? Math.pow(2, hostBits) - 2 : (hostBits === 1 ? 2 : 1);
      if (outMaxHosts) outMaxHosts.textContent = maxHosts;
      if (outSubnets) outSubnets.textContent = Math.pow(2, netBitsCount);
      const blockSize = 256 - decVal;
      if (outBlockSize) outBlockSize.textContent = blockSize > 0 ? blockSize : 256;
    }

    render();
  }

  // --- 4. SNÍMEK 5: INTERAKTIVNÍ FLSM KRUHOVÝ GRAF (KOLÁČ) ---
  function initFlsmPie() {
    const svgEl = document.getElementById('flsmPieSvg');
    const pillsContainer = document.getElementById('flsmCidrPills');
    const detailTitle = document.getElementById('flsmDetailTitle');
    const detailNet = document.getElementById('flsmDetailNet');
    const detailRange = document.getElementById('flsmDetailRange');
    const detailBcast = document.getElementById('flsmDetailBcast');
    const detailHosts = document.getElementById('flsmDetailHosts');
    const detailPct = document.getElementById('flsmDetailPct');
    const baseIpInput = document.getElementById('flsmBaseIp');

    if (!svgEl) return;

    let currentCidr = 26;
    let baseIp = '192.168.1.0';
    let selectedSlice = 0;

    const cidrList = [24, 25, 26, 27, 28, 29, 30];

    // Vytvoření přepínacích tlačítek CIDR
    if (pillsContainer) {
      pillsContainer.innerHTML = '';
      cidrList.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pie-cidr-pill ${c === currentCidr ? 'active' : ''}`;
        const subnetsCount = Math.pow(2, c - 24);
        btn.textContent = `/${c} (${subnetsCount} ${subnetsCount === 1 ? 'síť' : (subnetsCount < 5 ? 'podsítě' : 'podsítí')})`;
        btn.addEventListener('click', () => {
          currentCidr = c;
          selectedSlice = 0;
          document.querySelectorAll('.pie-cidr-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderPie();
        });
        pillsContainer.appendChild(btn);
      });
    }

    if (baseIpInput) {
      baseIpInput.addEventListener('change', () => {
        const parsed = IP.toLong(baseIpInput.value);
        if (parsed !== null) {
          baseIp = IP.fromLong(parsed & 0xFFFFFF00); // zaokrouhlit na /24
          baseIpInput.value = baseIp;
          renderPie();
        }
      });
    }

    function renderPie() {
      const baseLong = IP.toLong(baseIp) || IP.toLong('192.168.1.0');
      const numSubnets = Math.pow(2, currentCidr - 24);
      const totalAddressesPerSubnet = 256 / numSubnets;
      const usableHosts = totalAddressesPerSubnet >= 4 ? totalAddressesPerSubnet - 2 : (totalAddressesPerSubnet === 2 ? 2 : 1);

      svgEl.innerHTML = '';

      const cx = 200;
      const cy = 200;
      const radius = 175;
      const innerRadius = 65;

      const anglePerSubnet = (2 * Math.PI) / numSubnets;

      for (let i = 0; i < numSubnets; i++) {
        const startAngle = i * anglePerSubnet - Math.PI / 2;
        const endAngle = (i + 1) * anglePerSubnet - Math.PI / 2;

        const subNetLong = baseLong + (i * totalAddressesPerSubnet);
        const bcastLong = subNetLong + totalAddressesPerSubnet - 1;
        const firstHostLong = subNetLong + 1;
        const lastHostLong = bcastLong - 1;

        const color = PALETTE[i % PALETTE.length];

        // Výpočet SVG kruhové výseče
        let pathD = '';
        if (numSubnets === 1) {
          // Celý kruh jako mezikruží
          pathD = `
            M ${cx} ${cy - radius}
            A ${radius} ${radius} 0 1 0 ${cx} ${cy + radius}
            A ${radius} ${radius} 0 1 0 ${cx} ${cy - radius}
            Z
          `;
        } else {
          const x1 = cx + radius * Math.cos(startAngle);
          const y1 = cy + radius * Math.sin(startAngle);
          const x2 = cx + radius * Math.cos(endAngle);
          const y2 = cy + radius * Math.sin(endAngle);

          const x3 = cx + innerRadius * Math.cos(endAngle);
          const y3 = cy + innerRadius * Math.sin(endAngle);
          const x4 = cx + innerRadius * Math.cos(startAngle);
          const y4 = cy + innerRadius * Math.sin(startAngle);

          const largeArc = anglePerSubnet > Math.PI ? 1 : 0;

          pathD = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z
          `;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD.trim());
        path.setAttribute('fill', color);
        path.setAttribute('class', `pie-slice ${i === selectedSlice ? 'active-slice' : ''}`);
        path.setAttribute('data-index', i);

        path.addEventListener('click', () => {
          selectedSlice = i;
          document.querySelectorAll('.pie-slice').forEach(s => s.classList.remove('active-slice'));
          path.classList.add('active-slice');
          updateDetail(i, subNetLong, firstHostLong, lastHostLong, bcastLong, usableHosts, totalAddressesPerSubnet, color);
        });

        svgEl.appendChild(path);

        // Textové popisky na výsečích, pokud je v nich dost místa
        if (numSubnets <= 16) {
          const midAngle = startAngle + anglePerSubnet / 2;
          const textR = (radius + innerRadius) / 2;
          const tx = cx + textR * Math.cos(midAngle);
          const ty = cy + textR * Math.sin(midAngle);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', tx);
          text.setAttribute('y', ty);
          text.setAttribute('fill', '#ffffff');
          text.setAttribute('font-size', numSubnets <= 4 ? '13' : (numSubnets <= 8 ? '10' : '8'));
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'central');
          text.setAttribute('pointer-events', 'none');
          text.textContent = numSubnets <= 4 ? `${IP.fromLong(subNetLong)}` : `#${i + 1}`;
          svgEl.appendChild(text);
        }
      }

      // Středový kruh (Donut Hole)
      const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerCircle.setAttribute('cx', cx);
      centerCircle.setAttribute('cy', cy);
      centerCircle.setAttribute('r', innerRadius - 4);
      centerCircle.setAttribute('class', 'pie-center-circle');
      svgEl.appendChild(centerCircle);

      const centerTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerTitle.setAttribute('x', cx);
      centerTitle.setAttribute('y', cy - 8);
      centerTitle.setAttribute('class', 'pie-center-title');
      centerTitle.textContent = `/${currentCidr}`;
      svgEl.appendChild(centerTitle);

      const centerSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerSub.setAttribute('x', cx);
      centerSub.setAttribute('y', cy + 12);
      centerSub.setAttribute('class', 'pie-center-sub');
      centerSub.textContent = `${numSubnets} ${numSubnets === 1 ? 'podsíť' : (numSubnets < 5 ? 'podsítě' : 'podsítí')}`;
      svgEl.appendChild(centerSub);

      // Aktualizovat detail pro výchozí vybranou výseč
      const firstSubNet = baseLong + (selectedSlice * totalAddressesPerSubnet);
      updateDetail(
        selectedSlice,
        firstSubNet,
        firstSubNet + 1,
        firstSubNet + totalAddressesPerSubnet - 2,
        firstSubNet + totalAddressesPerSubnet - 1,
        usableHosts,
        totalAddressesPerSubnet,
        PALETTE[selectedSlice % PALETTE.length]
      );
    }

    function updateDetail(idx, netLong, firstLong, lastLong, bcastLong, hosts, totalIps, color) {
      if (detailTitle) {
        detailTitle.innerHTML = `
          <span class="slice-tag" style="background: ${color}25; color: ${color}; border: 1px solid ${color};">
            Podsíť #${idx + 1}
          </span>
          <span style="font-weight: 800; font-family: var(--font-mono);">${IP.fromLong(netLong)} /${currentCidr}</span>
        `;
      }
      if (detailNet) detailNet.textContent = `${IP.fromLong(netLong)}`;
      if (detailRange) detailRange.textContent = `${IP.fromLong(firstLong)} – ${IP.fromLong(lastLong)}`;
      if (detailBcast) detailBcast.textContent = `${IP.fromLong(bcastLong)}`;
      if (detailHosts) detailHosts.textContent = `${hosts} použitelných hostů (${totalIps} IP celkem)`;
      if (detailPct) {
        const pct = ((totalIps / 256) * 100).toFixed(1);
        detailPct.textContent = `${pct} % z celého bloku /24`;
      }
    }

    renderPie();
  }

  // --- 5. SNÍMEK 8: INTERAKTIVNÍ ASYMETRICKÝ VLSM KOLÁČ & SCÉNÁŘE ---
  function initVlsmPie() {
    const svgEl = document.getElementById('vlsmPieSvg');
    const tableBody = document.getElementById('vlsmTableBody');
    const tabs = document.querySelectorAll('.vlsm-tab-btn');

    if (!svgEl || !tableBody) return;

    // Přednastavené didaktické scénáře
    const SCENARIOS = {
      school: {
        name: 'Školní síť SPŠ',
        baseIp: '192.168.10.0',
        subnets: [
          { name: 'Učebny informatiky', hostsNeeded: 60 },
          { name: 'Kabinety a administrativa', hostsNeeded: 25 },
          { name: 'Školní servery & DMZ', hostsNeeded: 12 },
          { name: 'Spoj Router-Router (P2P WAN)', hostsNeeded: 2 },
          { name: 'Záložní spojení ISP (WAN 2)', hostsNeeded: 2 }
        ]
      },
      company: {
        name: 'Firemní kampus (Enterprise)',
        baseIp: '172.16.1.0',
        subnets: [
          { name: 'Vývojové oddělení (R&D)', hostsNeeded: 110 },
          { name: 'Obchod & Marketing', hostsNeeded: 55 },
          { name: 'Vedení firmy & Finance', hostsNeeded: 20 },
          { name: 'Pobočka Brno (WAN spoj)', hostsNeeded: 2 }
        ]
      }
    };

    let activeScenario = 'school';

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeScenario = tab.getAttribute('data-scenario');
        renderVlsm();
      });
    });

    function calculateVlsm(baseIpStr, requirements) {
      // ZLATÉ PRAVIDLO VLSM: Seřadit sestupně podle počtu hostů!
      const sorted = [...requirements].sort((a, b) => b.hostsNeeded - a.hostsNeeded);

      let currentBaseLong = IP.toLong(baseIpStr) || IP.toLong('192.168.10.0');
      const results = [];

      sorted.forEach((req, idx) => {
        // Nalezení nejmenší mocniny dvou vyhovující vzorci: 2^h - 2 >= hostsNeeded
        let h = 2; // minimálně 2 bity pro 2 hosty (/30)
        while ((Math.pow(2, h) - 2) < req.hostsNeeded && h < 30) {
          h++;
        }

        const cidr = 32 - h;
        const totalIps = Math.pow(2, h);
        const usableHosts = totalIps - 2;

        const netLong = currentBaseLong;
        const maskLong = IP.cidrToMaskLong(cidr);
        const bcastLong = netLong + totalIps - 1;
        const firstHostLong = netLong + 1;
        const lastHostLong = bcastLong - 1;

        results.push({
          index: idx + 1,
          name: req.name,
          hostsNeeded: req.hostsNeeded,
          cidr: cidr,
          totalIps: totalIps,
          usableHosts: usableHosts,
          netLong: netLong,
          maskLong: maskLong,
          firstHostLong: firstHostLong,
          lastHostLong: lastHostLong,
          bcastLong: bcastLong,
          color: PALETTE[idx % PALETTE.length]
        });

        currentBaseLong += totalIps;
      });

      // Zbytek adresního prostoru
      const totalUsedIps = results.reduce((acc, r) => acc + r.totalIps, 0);
      const freeIps = Math.max(0, 256 - totalUsedIps);

      return { results, freeIps, currentBaseLong };
    }

    function renderVlsm() {
      const scenario = SCENARIOS[activeScenario];
      if (!scenario) return;

      const { results, freeIps } = calculateVlsm(scenario.baseIp, scenario.subnets);

      // 1. Vykreslení SVG koláče
      svgEl.innerHTML = '';
      const cx = 200;
      const cy = 200;
      const radius = 175;
      const innerRadius = 60;

      let currentAngle = -Math.PI / 2;

      // Přidání alokovaných výsečí
      results.forEach(sub => {
        const sweepAngle = (sub.totalIps / 256) * (2 * Math.PI);
        const endAngle = currentAngle + sweepAngle;

        const x1 = cx + radius * Math.cos(currentAngle);
        const y1 = cy + radius * Math.sin(currentAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);

        const x3 = cx + innerRadius * Math.cos(endAngle);
        const y3 = cy + innerRadius * Math.sin(endAngle);
        const x4 = cx + innerRadius * Math.cos(currentAngle);
        const y4 = cy + innerRadius * Math.sin(currentAngle);

        const largeArc = sweepAngle > Math.PI ? 1 : 0;

        const pathD = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          L ${x3} ${y3}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
          Z
        `;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD.trim());
        path.setAttribute('fill', sub.color);
        path.setAttribute('class', 'pie-slice');
        path.setAttribute('title', `${sub.name}: ${IP.fromLong(sub.netLong)}/${sub.cidr}`);
        svgEl.appendChild(path);

        // Popisek na výseči, pokud má aspoň 12.5% (32 IP)
        if (sub.totalIps >= 32) {
          const midAngle = currentAngle + sweepAngle / 2;
          const textR = (radius + innerRadius) / 2;
          const tx = cx + textR * Math.cos(midAngle);
          const ty = cy + textR * Math.sin(midAngle);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', tx);
          text.setAttribute('y', ty);
          text.setAttribute('fill', '#ffffff');
          text.setAttribute('font-size', '11');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'central');
          text.setAttribute('pointer-events', 'none');
          text.textContent = `/${sub.cidr}`;
          svgEl.appendChild(text);
        }

        currentAngle = endAngle;
      });

      // Zbytek (volný adresní prostor)
      if (freeIps > 0) {
        const sweepAngle = (freeIps / 256) * (2 * Math.PI);
        const endAngle = currentAngle + sweepAngle;

        const x1 = cx + radius * Math.cos(currentAngle);
        const y1 = cy + radius * Math.sin(currentAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);

        const x3 = cx + innerRadius * Math.cos(endAngle);
        const y3 = cy + innerRadius * Math.sin(endAngle);
        const x4 = cx + innerRadius * Math.cos(currentAngle);
        const y4 = cy + innerRadius * Math.sin(currentAngle);

        const largeArc = sweepAngle > Math.PI ? 1 : 0;

        const pathD = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          L ${x3} ${y3}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
          Z
        `;

        const freePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        freePath.setAttribute('d', pathD.trim());
        freePath.setAttribute('fill', 'rgba(255, 255, 255, 0.06)');
        freePath.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
        freePath.setAttribute('stroke-dasharray', '4,3');
        freePath.setAttribute('class', 'pie-slice');
        svgEl.appendChild(freePath);
      }

      // Středový kruh
      const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerCircle.setAttribute('cx', cx);
      centerCircle.setAttribute('cy', cy);
      centerCircle.setAttribute('r', innerRadius - 4);
      centerCircle.setAttribute('class', 'pie-center-circle');
      svgEl.appendChild(centerCircle);

      const centerTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerTitle.setAttribute('x', cx);
      centerTitle.setAttribute('y', cy - 8);
      centerTitle.setAttribute('class', 'pie-center-title');
      centerTitle.textContent = 'VLSM';
      svgEl.appendChild(centerTitle);

      const centerSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerSub.setAttribute('x', cx);
      centerSub.setAttribute('y', cy + 12);
      centerSub.setAttribute('class', 'pie-center-sub');
      centerSub.textContent = `${results.length} podsítí`;
      svgEl.appendChild(centerSub);

      // 2. Vykreslení přehledné tabulky VLSM
      tableBody.innerHTML = '';
      results.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${r.color}; margin-right: 6px;"></span>
            <strong>${r.name}</strong>
          </td>
          <td>${r.hostsNeeded} PC</td>
          <td><strong>${IP.fromLong(r.netLong)}</strong></td>
          <td>/${r.cidr} (${IP.fromLong(r.maskLong)})</td>
          <td>${IP.fromLong(r.firstHostLong)} – ${IP.fromLong(r.lastHostLong)}</td>
          <td>${IP.fromLong(r.bcastLong)}</td>
          <td>${r.usableHosts} (${r.totalIps} IP)</td>
        `;
        tableBody.appendChild(tr);
      });

      if (freeIps > 0) {
        const freeTr = document.createElement('tr');
        freeTr.style.opacity = '0.75';
        freeTr.innerHTML = `
          <td colspan="2" style="font-style: italic;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #64748b; margin-right: 6px;"></span>
            Volná rezerva pro rozšíření
          </td>
          <td colspan="4" style="font-style: italic;">Nealokovaný adresní prostor</td>
          <td><strong>${freeIps} volných IP</strong></td>
        `;
        tableBody.appendChild(freeTr);
      }
    }

    renderVlsm();
  }

  // --- 6. SNÍMEK 9: UNIVERZÁLNÍ KALKULAČKA PODSÍTÍ SPŠ ---
  function initSubnetCalculator() {
    const ipInput = document.getElementById('calcIpInput');
    const cidrSelect = document.getElementById('calcCidrSelect');
    const btnCalc = document.getElementById('calcSubmitBtn');

    // Výstupní prvky
    const resNet = document.getElementById('calcResNet');
    const resBcast = document.getElementById('calcResBcast');
    const resRange = document.getElementById('calcResRange');
    const resMask = document.getElementById('calcResMask');
    const resWildcard = document.getElementById('calcResWildcard');
    const resHosts = document.getElementById('calcResHosts');
    const resClass = document.getElementById('calcResClass');
    const resScope = document.getElementById('calcResScope');
    const resBinary = document.getElementById('calcResBinary');

    if (!ipInput || !cidrSelect) return;

    // Naplnění výběru CIDR /8 až /30
    if (cidrSelect.options.length <= 1) {
      cidrSelect.innerHTML = '';
      for (let c = 8; c <= 30; c++) {
        const opt = document.createElement('option');
        opt.value = c;
        const maskLong = IP.cidrToMaskLong(c);
        opt.textContent = `/${c} — ${IP.fromLong(maskLong)}`;
        if (c === 26) opt.selected = true;
        cidrSelect.appendChild(opt);
      }
    }

    function calculate() {
      const rawIp = ipInput.value.trim();
      const ipLong = IP.toLong(rawIp);
      if (ipLong === null) {
        alert('Zadejte platnou IPv4 adresu ve tvaru a.b.c.d (např. 192.168.10.150)!');
        return;
      }

      const cidr = parseInt(cidrSelect.value, 10);
      const maskLong = IP.cidrToMaskLong(cidr);
      const wildcardLong = (~maskLong) >>> 0;

      const netLong = (ipLong & maskLong) >>> 0;
      const bcastLong = (netLong | wildcardLong) >>> 0;

      const totalIps = Math.pow(2, 32 - cidr);
      const usableHosts = cidr <= 30 ? (cidr === 30 ? 2 : totalIps - 2) : 1;

      const firstHostLong = cidr <= 30 ? netLong + 1 : netLong;
      const lastHostLong = cidr <= 30 ? bcastLong - 1 : bcastLong;

      if (resNet) resNet.textContent = `${IP.fromLong(netLong)} /${cidr}`;
      if (resBcast) resBcast.textContent = IP.fromLong(bcastLong);
      if (resRange) resRange.textContent = `${IP.fromLong(firstHostLong)} – ${IP.fromLong(lastHostLong)}`;
      if (resMask) resMask.textContent = `${IP.fromLong(maskLong)}`;
      if (resWildcard) resWildcard.textContent = IP.fromLong(wildcardLong);
      if (resHosts) resHosts.textContent = `${usableHosts.toLocaleString('cs-CZ')} (celkem ${totalIps.toLocaleString('cs-CZ')})`;

      const firstOctet = (ipLong >>> 24) & 255;
      if (resClass) resClass.textContent = IP.getClass(firstOctet);
      if (resScope) resScope.textContent = IP.isPrivate(ipLong);

      // Binární rozpad s vizuální hranicí
      if (resBinary) {
        const ipBin = IP.toBin32(ipLong).replace(/\./g, '');
        const maskBin = IP.toBin32(maskLong).replace(/\./g, '');
        const netBin = IP.toBin32(netLong).replace(/\./g, '');

        function buildBinaryHtml(label, binStr) {
          let html = `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.82rem;">`;
          html += `<span style="width: 100px; font-weight: 700; color: var(--text-secondary);">${label}</span>`;
          html += `<div style="display: flex; gap: 2px; align-items: center;">`;

          for (let i = 0; i < 32; i++) {
            if (i > 0 && i % 8 === 0) {
              html += `<span style="padding: 0 4px; font-weight: 800; color: var(--text-muted);">.</span>`;
            }
            const isNet = i < cidr;
            const isBorder = i === cidr - 1;
            const bg = isNet ? 'rgba(56, 189, 248, 0.2)' : 'rgba(251, 146, 60, 0.2)';
            const color = isNet ? 'var(--sn-net-bit)' : 'var(--sn-host-bit)';
            const borderR = isBorder ? 'border-right: 3px solid var(--sn-purple);' : '';
            html += `<span style="display: inline-block; width: 14px; text-align: center; background: ${bg}; color: ${color}; font-weight: 700; border-radius: 2px; ${borderR}">${binStr[i]}</span>`;
          }

          html += `</div></div>`;
          return html;
        }

        resBinary.innerHTML = `
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.6rem; font-weight: 700; display: flex; justify-content: space-between;">
            <span>Binární 32bitový rozklad</span>
            <span><span style="color: var(--sn-net-bit);">■ Síť (${cidr} bitů)</span> &bull; <span style="color: var(--sn-host-bit);">■ Hostitelé (${32 - cidr} bitů)</span></span>
          </div>
          ${buildBinaryHtml('IP adresa:', ipBin)}
          ${buildBinaryHtml('Maska:', maskBin)}
          ${buildBinaryHtml('Síť (AND):', netBin)}
        `;
      }
    }

    if (btnCalc) btnCalc.addEventListener('click', calculate);
    ipInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calculate();
    });
    cidrSelect.addEventListener('change', calculate);

    calculate();
  }

  // --- 7. SNÍMEK 10: KROKOVAČ ŘEŠENÉHO PŘÍKLADU VLSM (CCNA) ---
  function initWalkthroughStepper() {
    const stepBtns = document.querySelectorAll('.step-btn');
    const stepContents = document.querySelectorAll('.step-content-pane');

    if (stepBtns.length === 0) return;

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepId = btn.getAttribute('data-step');
        stepBtns.forEach(b => b.classList.remove('active'));
        stepContents.forEach(c => c.style.display = 'none');

        btn.classList.add('active');
        const targetPane = document.getElementById(`stepPane-${stepId}`);
        if (targetPane) targetPane.style.display = 'block';
      });
    });
  }

  // --- 8. SNÍMEK 11: INTERAKTIVNÍ TRÉNINKOVÝ TRENAŽÉR A KVÍZ ---
  function initSubnetQuiz() {
    const questionEl = document.getElementById('quizQuestion');
    const optionsGrid = document.getElementById('quizOptions');
    const explanationBox = document.getElementById('quizExplanation');
    const btnNext = document.getElementById('quizNextBtn');
    const scoreEl = document.getElementById('quizScore');

    if (!questionEl || !optionsGrid) return;

    const QUESTIONS = [
      {
        q: 'Jaká je síťová adresa pro hostitele s IP 192.168.1.150 a maskou podsítě 255.255.255.192 (/26)?',
        options: ['192.168.1.0', '192.168.1.64', '192.168.1.128', '192.168.1.192'],
        correct: 2,
        exp: 'Maska /26 má krok (block size) 256 - 192 = 64. Podsítě tedy začínají na násobcích 64: .0, .64, .128, .192. Adresa .150 spadá do intervalu 128 až 191, proto její síťová adresa je 192.168.1.128.'
      },
      {
        q: 'Kolik použitelných hostů lze připojit k podsíti s maskou 255.255.255.224 (/27)?',
        options: ['32 hostů', '30 hostů', '62 hostů', '14 hostů'],
        correct: 1,
        exp: 'Maska /27 ponechává na hosty 32 - 27 = 5 bitů. Celkový počet adres je 2^5 = 32. Po odečtení síťové adresy a broadcastu (2^5 - 2) získáme přesně 30 použitelných hostů.'
      },
      {
        q: 'Jaká je broadcast adresa podsítě 10.10.5.64/28?',
        options: ['10.10.5.79', '10.10.5.80', '10.10.5.127', '10.10.5.95'],
        correct: 0,
        exp: 'Prefix /28 dává 2^(32-28) = 16 adres. Síť začíná na .64, takže broadcast adresa je 64 + 16 - 1 = .79.'
      },
      {
        q: 'Proč je nutné při návrhu VLSM řadit požadavky sestupně (od největší sítě k nejmenší)?',
        options: [
          'Protože to vyžaduje standard IEEE 802.3 pro Ethernet.',
          'Aby se zabránilo fragmentaci a překryvu adresního prostoru velkých podsítí.',
          'Aby routery Cisco fungovaly rychleji.',
          'Není to nutné, sítě lze přidělovat v libovolném pořadí.'
        ],
        correct: 1,
        exp: 'Pokud bychom začali alokovat malé podsítě (např. /30), rozbili bychom souvislé binární bloky a velká podsíť (/25 vyžadující 128 souvislých adres) by se na žádnou zarovnanou hranici nevešla.'
      },
      {
        q: 'Jakou minimální masku podsítě musíme zvolit pro propojení dvou routerů (bod-bod WAN linka), kde potřebujeme pouze 2 IP adresy?',
        options: ['/28', '/29', '/30', '/31'],
        correct: 2,
        exp: 'Pro 2 hosty potřebujeme 2^h - 2 >= 2, tedy h = 2 bity. 32 - 2 = /30 (4 adresy celkem: 1 síťová, 2 použitelné pro rozhraní routerů, 1 broadcast).'
      }
    ];

    let currentQIdx = 0;
    let score = 0;
    let totalAnswered = 0;

    function renderQuestion() {
      const qData = QUESTIONS[currentQIdx];
      questionEl.textContent = `${currentQIdx + 1}. ${qData.q}`;
      optionsGrid.innerHTML = '';
      if (explanationBox) {
        explanationBox.classList.remove('show');
        explanationBox.innerHTML = '';
      }

      qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt;

        btn.addEventListener('click', () => {
          // Zablokovat další klikání
          const allBtns = optionsGrid.querySelectorAll('.quiz-opt-btn');
          allBtns.forEach(b => b.style.pointerEvents = 'none');

          totalAnswered++;
          if (idx === qData.correct) {
            btn.classList.add('correct');
            score++;
          } else {
            btn.classList.add('wrong');
            allBtns[qData.correct].classList.add('correct');
          }

          if (scoreEl) scoreEl.textContent = `Úspěšnost: ${score} z ${totalAnswered}`;

          if (explanationBox) {
            explanationBox.innerHTML = `<strong>Vysvětlení:</strong> ${qData.exp}`;
            explanationBox.classList.add('show');
          }
        });

        optionsGrid.appendChild(btn);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        currentQIdx = (currentQIdx + 1) % QUESTIONS.length;
        renderQuestion();
      });
    }

    renderQuestion();
  }

  // --- 8b. SNÍMEK 8: INTERAKTIVNÍ DYNAMICKÉ PORCOVÁNÍ ROZSAHU (SLICING GRID) ---
  function initPortionGrid() {
    const canvasEl = document.getElementById('portionGridCanvas');
    const tableBody = document.getElementById('portionTableBody');
    const badgeEl = document.getElementById('portionSummaryBadge');
    const baseIpInput = document.getElementById('portionBaseIp');
    const resetBtn = document.getElementById('portionResetBtn');
    const presetSchoolBtn = document.getElementById('portionPresetSchool');
    const presetQuartersBtn = document.getElementById('portionPresetQuarters');

    if (!canvasEl) return;

    const LEVELS = [
      { level: 0, cidr: 24, count: 1, size: 256, label: '/24' },
      { level: 1, cidr: 25, count: 2, size: 128, label: '/25' },
      { level: 2, cidr: 26, count: 4, size: 64, label: '/26' },
      { level: 3, cidr: 27, count: 8, size: 32, label: '/27' },
      { level: 4, cidr: 28, count: 16, size: 16, label: '/28' }
    ];

    let baseIp = '192.168.10.0';
    let allocatedList = []; // { id, level, cidr, offset, size, color, name }

    if (baseIpInput) {
      baseIpInput.addEventListener('change', () => {
        const parsed = IP.toLong(baseIpInput.value);
        if (parsed !== null) {
          baseIp = IP.fromLong(parsed & 0xFFFFFF00); // zaokrouhlit na /24
          baseIpInput.value = baseIp;
          renderGrid();
        }
      });
    }

    function checkBlockStatus(offset, size, level) {
      // 1. Zda je přímo tento blok alokován
      const exactMatch = allocatedList.find(a => a.offset === offset && a.size === size);
      if (exactMatch) {
        return { status: 'allocated', alloc: exactMatch };
      }

      // 2. Zda blok koliduje s jakoukoli existující alokací
      for (const a of allocatedList) {
        const overlaps = !(offset + size <= a.offset || a.offset + a.size <= offset);
        if (overlaps) {
          const isDescendant = a.size > size;
          const label = isDescendant ? `Zahrnuto v /${a.cidr}` : `Obsazeno (/24)`;
          return { status: 'blocked', reason: label, blockingAlloc: a };
        }
      }

      return { status: 'free' };
    }

    function renderGrid() {
      canvasEl.innerHTML = '';
      const baseLong = IP.toLong(baseIp) || IP.toLong('192.168.10.0');

      LEVELS.forEach(lvl => {
        const row = document.createElement('div');
        row.className = 'portion-row';

        const tag = document.createElement('div');
        tag.className = 'portion-level-tag';
        tag.textContent = lvl.label;
        row.appendChild(tag);

        const blocksContainer = document.createElement('div');
        blocksContainer.className = 'portion-blocks-container';

        for (let i = 0; i < lvl.count; i++) {
          const offset = i * lvl.size;
          const blockNetLong = baseLong + offset;
          const statusObj = checkBlockStatus(offset, lvl.size, lvl.level);

          const block = document.createElement('div');
          block.className = 'portion-block';
          block.setAttribute('data-level', lvl.level);
          block.setAttribute('data-offset', offset);
          block.setAttribute('data-size', lvl.size);

          // Čistý a minimalistický obsah buňky pro perfektní zarovnání bez přetékání
          const netLabel = (lvl.level === 0) ? `${IP.fromLong(blockNetLong)}` : `.${offset}`;
          const sizeLabel = `${lvl.size} IP`;

          if (statusObj.status === 'allocated') {
            block.classList.add('allocated');
            block.style.background = statusObj.alloc.color;
            block.innerHTML = `
              <div class="portion-block-net">${netLabel}</div>
              <div class="portion-block-info">${sizeLabel}</div>
            `;
            block.title = `${statusObj.alloc.name}: ${IP.fromLong(blockNetLong)}/${lvl.cidr} (${lvl.size} IP). Kliknutím uvolníte.`;

            block.addEventListener('click', () => {
              allocatedList = allocatedList.filter(a => a !== statusObj.alloc);
              renderGrid();
            });

          } else if (statusObj.status === 'blocked') {
            block.classList.add('blocked');
            block.innerHTML = `
              <div class="portion-block-net">${netLabel}</div>
              <div class="portion-block-info">${sizeLabel}</div>
            `;
            block.title = `Tento rozsah je zablokován kolizí s vybranou podsítí ${statusObj.blockingAlloc.name}.`;

          } else {
            // Volný blok k alokaci
            block.innerHTML = `
              <div class="portion-block-net">${netLabel}</div>
              <div class="portion-block-info">${sizeLabel}</div>
            `;
            block.title = `Kliknutím alokujete podsíť ${IP.fromLong(blockNetLong)}/${lvl.cidr} (${lvl.size} IP).`;

            block.addEventListener('click', () => {
              const newSubnet = {
                id: `sub-${Date.now()}-${Math.random()}`,
                level: lvl.level,
                cidr: lvl.cidr,
                offset: offset,
                size: lvl.size,
                color: PALETTE[allocatedList.length % PALETTE.length],
                name: `Podsíť #${allocatedList.length + 1}`
              };
              allocatedList.push(newSubnet);
              allocatedList.sort((a, b) => a.offset - b.offset);
              renderGrid();
            });
          }

          blocksContainer.appendChild(block);
        }

        row.appendChild(blocksContainer);
        canvasEl.appendChild(row);
      });

      renderTable();
      updateBadge();
    }

    function renderTable() {
      if (!tableBody) return;
      tableBody.innerHTML = '';
      const baseLong = IP.toLong(baseIp) || IP.toLong('192.168.10.0');

      if (allocatedList.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 1.5rem;">
              Zatím nebyla alokována žádná podsíť. Klikněte na libovolný blok v obdélníkové mřížce výše nebo zvolte ukázku.
            </td>
          </tr>
        `;
        return;
      }

      allocatedList.forEach((sub, idx) => {
        const netLong = baseLong + sub.offset;
        const maskLong = IP.cidrToMaskLong(sub.cidr);
        const bcastLong = netLong + sub.size - 1;
        const firstHostLong = netLong + 1;
        const lastHostLong = bcastLong - 1;
        const usableHosts = sub.size >= 4 ? sub.size - 2 : sub.size;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 4px; background: ${sub.color}; margin-right: 8px; vertical-align: middle;"></span>
            <strong>${sub.name}</strong>
          </td>
          <td>
            <strong style="color: ${sub.color}; font-size: 0.95rem;">${IP.fromLong(netLong)}/${sub.cidr}</strong>
            <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 4px;">(${sub.size} IP)</span>
          </td>
          <td>${IP.fromLong(firstHostLong)} – ${IP.fromLong(lastHostLong)} (${usableHosts} hostů)</td>
          <td>${IP.fromLong(bcastLong)}</td>
          <td>${IP.fromLong(maskLong)}</td>
          <td>
            <button type="button" class="btn-tool btn-tool-danger btn-tool-sm" title="Uvolnit tuto podsíť">
              <svg class="icon" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Uvolnit
            </button>
          </td>
        `;

        const btnRemove = tr.querySelector('button');
        if (btnRemove) {
          btnRemove.addEventListener('click', () => {
            allocatedList = allocatedList.filter(a => a !== sub);
            renderGrid();
          });
        }

        tableBody.appendChild(tr);
      });
    }

    function updateBadge() {
      if (!badgeEl) return;
      const totalUsedIps = allocatedList.reduce((acc, a) => acc + a.size, 0);
      const pct = ((totalUsedIps / 256) * 100).toFixed(1);
      badgeEl.innerHTML = `Alokováno: <strong>${totalUsedIps} / 256 IP</strong> (${pct} %) &bull; ${allocatedList.length} podsítí`;
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        allocatedList = [];
        renderGrid();
      });
    }

    if (presetSchoolBtn) {
      presetSchoolBtn.addEventListener('click', () => {
        allocatedList = [
          { id: 'p1', level: 1, cidr: 25, offset: 0, size: 128, color: PALETTE[0], name: 'Učebny PC (/25)' },
          { id: 'p2', level: 2, cidr: 26, offset: 128, size: 64, color: PALETTE[1], name: 'Kabinety (/26)' },
          { id: 'p3', level: 4, cidr: 28, offset: 192, size: 16, color: PALETTE[2], name: 'Servery (/28)' },
          { id: 'p4', level: 4, cidr: 28, offset: 208, size: 16, color: PALETTE[3], name: 'Wi-Fi Hosté (/28)' }
        ];
        renderGrid();
      });
    }

    if (presetQuartersBtn) {
      presetQuartersBtn.addEventListener('click', () => {
        allocatedList = [
          { id: 'q1', level: 2, cidr: 26, offset: 0, size: 64, color: PALETTE[0], name: 'Pobočka 1 (/26)' },
          { id: 'q2', level: 2, cidr: 26, offset: 64, size: 64, color: PALETTE[1], name: 'Pobočka 2 (/26)' },
          { id: 'q3', level: 2, cidr: 26, offset: 128, size: 64, color: PALETTE[2], name: 'Pobočka 3 (/26)' },
          { id: 'q4', level: 2, cidr: 26, offset: 192, size: 64, color: PALETTE[3], name: 'Pobočka 4 (/26)' }
        ];
        renderGrid();
      });
    }

    renderGrid();
  }

  // --- 9. INICIALIZACE VŠECH MODULŮ PO NAČTENÍ DOM ---
  document.addEventListener('DOMContentLoaded', () => {
    initBitwiseAndDemo();
    initOctetSwitchDemo();
    initFlsmPie();
    initVlsmPie();
    initPortionGrid();
    initSubnetCalculator();
    initWalkthroughStepper();
    initSubnetQuiz();
  });

})();

