/**
 * ==========================================================================
 * Téma 050: Transportní vrstva (Transport Layer) - Interaktivní engine
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // Databáze klíčových portů pro SPŠ a CCNA
  const PORTS_DATA = [
    { port: 20, proto: 'TCP', name: 'FTP Data', cat: 'well-known', desc: 'Přenos dat v souborovém protokolu File Transfer Protocol' },
    { port: 21, proto: 'TCP', name: 'FTP Control', cat: 'well-known', desc: 'Řízení relace, přihlášení a příkazy FTP protokolu' },
    { port: 22, proto: 'TCP', name: 'SSH / SFTP', cat: 'well-known', desc: 'Zabezpečený šifrovaný vzdálený přístup (Secure Shell)' },
    { port: 23, proto: 'TCP', name: 'Telnet', cat: 'well-known', desc: 'Nešifrovaný textový vzdálený terminál (historický/zastaralý)' },
    { port: 25, proto: 'TCP', name: 'SMTP', cat: 'well-known', desc: 'Simple Mail Transfer Protocol – odesílání pošty mezi servery' },
    { port: 53, proto: 'BOTH', name: 'DNS', cat: 'well-known', desc: 'Domain Name System – překlad jmen (UDP dotazy, TCP zónové přenosy)' },
    { port: 67, proto: 'UDP', name: 'DHCP Server', cat: 'well-known', desc: 'Server dynamické konfigurace síťových parametrů hostitelů' },
    { port: 68, proto: 'UDP', name: 'DHCP Client', cat: 'well-known', desc: 'Klientský port pro příjem zpráv DHCP (DORA proces)' },
    { port: 69, proto: 'UDP', name: 'TFTP', cat: 'well-known', desc: 'Trivial File Transfer Protocol – bootování ze sítě (PXE), zálohy IOS' },
    { port: 80, proto: 'TCP', name: 'HTTP', cat: 'well-known', desc: 'Hypertext Transfer Protocol – nešifrovaný webový provoz' },
    { port: 110, proto: 'TCP', name: 'POP3', cat: 'well-known', desc: 'Post Office Protocol v3 – stahování e-mailů do lokální aplikace' },
    { port: 123, proto: 'UDP', name: 'NTP', cat: 'well-known', desc: 'Network Time Protocol – přesná synchronizace systémového času' },
    { port: 143, proto: 'TCP', name: 'IMAP', cat: 'well-known', desc: 'Internet Message Access Protocol – správa a synchronizace složek pošty' },
    { port: 161, proto: 'UDP', name: 'SNMP Agent', cat: 'well-known', desc: 'Monitorování a dálková správa aktivních síťových prvků (SNMP dotazy)' },
    { port: 162, proto: 'UDP', name: 'SNMP Trap', cat: 'well-known', desc: 'Příjem asynchronních varovných hlášení (traps) od síťových prvků' },
    { port: 443, proto: 'BOTH', name: 'HTTPS', cat: 'well-known', desc: 'Hypertext Transfer Protocol Secure – šifrovaný web (TLS/SSL; UDP u HTTP/3)' },
    { port: 445, proto: 'TCP', name: 'SMB', cat: 'well-known', desc: 'Server Message Block – sdílení souborů a tiskáren v sítích Windows' },
    { port: 514, proto: 'UDP', name: 'Syslog', cat: 'well-known', desc: 'Centralizovaný sběr a logování systémových zpráv a auditů' },
    { port: 993, proto: 'TCP', name: 'IMAPS', cat: 'well-known', desc: 'Zabezpečený protokol IMAP chráněný TLS/SSL šifrováním' },
    { port: 995, proto: 'TCP', name: 'POP3S', cat: 'well-known', desc: 'Zabezpečený protokol POP3 chráněný TLS/SSL šifrováním' },
    { port: 1433, proto: 'TCP', name: 'MS SQL Server', cat: 'registered', desc: 'Relační databázový stroj Microsoft SQL Server' },
    { port: 1521, proto: 'TCP', name: 'Oracle DB', cat: 'registered', desc: 'Databázový listener firemního systému Oracle' },
    { port: 3306, proto: 'TCP', name: 'MySQL / MariaDB', cat: 'registered', desc: 'Populární relační databázové systémy pro webové a podnikové aplikace' },
    { port: 3389, proto: 'BOTH', name: 'RDP', cat: 'registered', desc: 'Remote Desktop Protocol – vzdálená plocha operačních systémů Windows' },
    { port: 5432, proto: 'TCP', name: 'PostgreSQL', cat: 'registered', desc: 'Pokročilý open-source relační databázový systém' },
    { port: 8080, proto: 'TCP', name: 'HTTP Alternate', cat: 'registered', desc: 'Alternativní vývojářský a proxy webový port (např. Apache Tomcat)' },
    { port: 25565, proto: 'TCP', name: 'Minecraft Server', cat: 'registered', desc: 'Dedikovaný herní server Minecraft Java Edition' },
    { port: 51820, proto: 'UDP', name: 'WireGuard VPN', cat: 'dynamic', desc: 'Moderní rychlá kryptografická virtuální privátní síť (VPN)' }
  ];

  // 1. Inicializace Port Exploreru
  function initPortExplorer() {
    const searchInput = document.getElementById('portSearchInput');
    const tableBody = document.getElementById('portTableBody');
    const filterBtns = document.querySelectorAll('.port-filter-btn');
    if (!searchInput || !tableBody) return;

    let currentFilter = 'all';

    function renderTable() {
      const query = searchInput.value.toLowerCase().trim();
      tableBody.innerHTML = '';

      const filtered = PORTS_DATA.filter(item => {
        // Filtr dle protokolu / kategorie
        if (currentFilter === 'tcp' && item.proto !== 'TCP' && item.proto !== 'BOTH') return false;
        if (currentFilter === 'udp' && item.proto !== 'UDP' && item.proto !== 'BOTH') return false;
        if (currentFilter === 'well-known' && item.cat !== 'well-known') return false;
        if (currentFilter === 'registered' && item.cat !== 'registered') return false;

        // Fulltextové vyhledávání
        if (!query) return true;
        return (
          item.port.toString().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.proto.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query)
        );
      });

      if (filtered.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
          Žádný port neodpovídá zadanému hledání "${query}". Zkuste jiné číslo nebo službu (např. 80, SSH, DNS).
        </td>`;
        tableBody.appendChild(row);
        return;
      }

      filtered.forEach(item => {
        const row = document.createElement('tr');
        let protoBadge = '';
        if (item.proto === 'TCP') {
          protoBadge = '<span class="port-num-badge badge-tcp">TCP</span>';
        } else if (item.proto === 'UDP') {
          protoBadge = '<span class="port-num-badge badge-udp">UDP</span>';
        } else {
          protoBadge = '<span class="port-num-badge badge-both">TCP/UDP</span>';
        }

        row.innerHTML = `
          <td><strong style="font-family: var(--font-mono); color: var(--pos-accent); font-size: 0.95rem;">${item.port}</strong></td>
          <td>${protoBadge}</td>
          <td><strong style="color: var(--text-primary);">${item.name}</strong></td>
          <td>${item.desc}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    searchInput.addEventListener('input', renderTable);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTable();
      });
    });

    renderTable();
  }

  // 2. Simulátor Soketu (Socket Pair Generator)
  function initSocketSimulator() {
    const serviceSelect = document.getElementById('socketServiceSelect');
    const clientIpInput = document.getElementById('socketClientIp');
    const randomPortBtn = document.getElementById('socketRandomPortBtn');
    const srcIpVal = document.getElementById('valSrcIp');
    const srcPortVal = document.getElementById('valSrcPort');
    const dstIpVal = document.getElementById('valDstIp');
    const dstPortVal = document.getElementById('valDstPort');
    const protoVal = document.getElementById('valProto');
    const formulaDisplay = document.getElementById('socketFormulaDisplay');

    if (!serviceSelect || !clientIpInput) return;

    function generateEphemeralPort() {
      // 49152 - 65535
      return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
    }

    let clientPort = generateEphemeralPort();

    function updateSocketView() {
      const selected = serviceSelect.value;
      const parts = selected.split('|'); // Proto|DstPort|DstIp|Name
      const proto = parts[0];
      const dstPort = parts[1];
      const dstIp = parts[2];
      const name = parts[3];
      const clientIp = clientIpInput.value.trim() || '192.168.1.45';

      if (srcIpVal) srcIpVal.textContent = clientIp;
      if (srcPortVal) srcPortVal.textContent = clientPort;
      if (dstIpVal) dstIpVal.textContent = dstIp;
      if (dstPortVal) dstPortVal.textContent = dstPort;
      if (protoVal) protoVal.textContent = proto;

      if (formulaDisplay) {
        formulaDisplay.innerHTML = `
          <strong>[${proto}]</strong> ${clientIp}:<span style="color:#60a5fa;">${clientPort}</span> &harr; ${dstIp}:<span style="color:#f59e0b;">${dstPort}</span> (${name})
        `;
      }
    }

    if (randomPortBtn) {
      randomPortBtn.addEventListener('click', () => {
        clientPort = generateEphemeralPort();
        updateSocketView();
      });
    }

    serviceSelect.addEventListener('change', updateSocketView);
    clientIpInput.addEventListener('input', updateSocketView);

    updateSocketView();
  }

  // 3. Segmentační trenažér a kalkulátor
  function initSegmentationCalc() {
    const fileSizeInput = document.getElementById('calcFileSize');
    const fileUnitSelect = document.getElementById('calcFileUnit');
    const mtuSelect = document.getElementById('calcMtu');
    const protoSelect = document.getElementById('calcProto');

    const mssVal = document.getElementById('valMss');
    const countVal = document.getElementById('valSegmentCount');
    const overheadVal = document.getElementById('valTotalOverhead');
    const ratioVal = document.getElementById('valPayloadRatio');
    const trackContainer = document.getElementById('segmentTrack');

    if (!fileSizeInput || !mtuSelect || !mssVal) return;

    function calculate() {
      const sizeNum = parseFloat(fileSizeInput.value) || 1;
      const unit = fileUnitSelect.value; // B, KB, MB
      let totalBytes = sizeNum;
      if (unit === 'KB') totalBytes = sizeNum * 1024;
      if (unit === 'MB') totalBytes = sizeNum * 1024 * 1024;

      const mtu = parseInt(mtuSelect.value, 10);
      const isTcp = protoSelect.value === 'TCP';
      const l4Header = isTcp ? 20 : 8; // TCP = 20 B, UDP = 8 B
      const l3Header = 20; // IPv4 standardně 20 B
      const l2Header = 18; // Ethernet frame overhead (14 B header + 4 B FCS)

      const mss = mtu - l3Header - l4Header;
      const segmentCount = Math.ceil(totalBytes / mss);
      const totalL4Overhead = segmentCount * l4Header;
      const totalL3Overhead = segmentCount * l3Header;
      const totalL2Overhead = segmentCount * l2Header;
      const totalOverhead = totalL4Overhead + totalL3Overhead + totalL2Overhead;
      const totalWireBytes = totalBytes + totalOverhead;
      const payloadRatio = ((totalBytes / totalWireBytes) * 100).toFixed(1);

      mssVal.textContent = mss + ' B';
      countVal.textContent = segmentCount.toLocaleString('cs-CZ');
      overheadVal.textContent = (totalOverhead / 1024).toFixed(1) + ' kB';
      ratioVal.textContent = payloadRatio + ' %';

      // Vykreslení segmentační lišty (max 24 čipů pro přehlednost)
      if (trackContainer) {
        trackContainer.innerHTML = '';
        const displayCount = Math.min(segmentCount, 20);
        for (let i = 1; i <= displayCount; i++) {
          const chip = document.createElement('div');
          chip.className = 'segment-chip';
          if (i === segmentCount) chip.classList.add('last');
          const isLast = (i === segmentCount);
          const segSize = isLast ? (totalBytes - (segmentCount - 1) * mss) : mss;
          chip.textContent = `#${i} (${segSize} B)`;
          trackContainer.appendChild(chip);
        }
        if (segmentCount > displayCount) {
          const more = document.createElement('div');
          more.className = 'segment-chip';
          more.style.background = 'rgba(255,255,255,0.06)';
          more.style.borderColor = 'rgba(255,255,255,0.2)';
          more.style.color = 'var(--text-muted)';
          more.textContent = `... a dalších ${(segmentCount - displayCount).toLocaleString('cs-CZ')} segmentů`;
          trackContainer.appendChild(more);
        }
      }
    }

    fileSizeInput.addEventListener('input', calculate);
    fileUnitSelect.addEventListener('change', calculate);
    mtuSelect.addEventListener('change', calculate);
    protoSelect.addEventListener('change', calculate);

    calculate();
  }

  // DOM ready hook
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPortExplorer();
      initSocketSimulator();
      initSegmentationCalc();
    });
  } else {
    initPortExplorer();
    initSocketSimulator();
    initSegmentationCalc();
  }

})();
