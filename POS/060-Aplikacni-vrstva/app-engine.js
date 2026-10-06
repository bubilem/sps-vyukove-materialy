/**
 * ==========================================================================
 * Téma 060: Aplikační vrstva (Application Layer) - Interaktivní engine
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  const APP_PROTOCOLS = [
    { name: 'HTTP', port: '80', proto: 'TCP', cat: 'web', desc: 'Hypertext Transfer Protocol – nešifrovaný přenos webových stránek a REST API.', rfc: 'RFC 9110' },
    { name: 'HTTPS', port: '443', proto: 'TCP / UDP', cat: 'web', desc: 'HTTP Secure – šifrovaná webová komunikace chráněná protokolem TLS.', rfc: 'RFC 9110 / 9000' },
    { name: 'DNS', port: '53', proto: 'UDP / TCP', cat: 'infra', desc: 'Domain Name System – hierarchický překlad doménových jmen na IP adresy.', rfc: 'RFC 1035' },
    { name: 'DHCP', port: '67 / 68', proto: 'UDP', cat: 'infra', desc: 'Dynamic Host Configuration Protocol – automatické přidělování IP adres a síťových parametrů.', rfc: 'RFC 2131' },
    { name: 'SMTP', port: '25 / 587', proto: 'TCP', cat: 'mail', desc: 'Simple Mail Transfer Protocol – odesílání a směrování elektronické pošty mezi servery.', rfc: 'RFC 5321' },
    { name: 'IMAP', port: '143 / 993', proto: 'TCP', cat: 'mail', desc: 'Internet Message Access Protocol – online správa e-mailových schránek na serveru.', rfc: 'RFC 9051' },
    { name: 'POP3', port: '110 / 995', proto: 'TCP', cat: 'mail', desc: 'Post Office Protocol v3 – stahování e-mailů ze serveru do lokálního klienta.', rfc: 'RFC 1939' },
    { name: 'SSH', port: '22', proto: 'TCP', cat: 'remote', desc: 'Secure Shell – bezpečný šifrovaný vzdálený přístup k příkazové řádce a přenos SFTP.', rfc: 'RFC 4251' },
    { name: 'Telnet', port: '23', proto: 'TCP', cat: 'remote', desc: 'Nešifrovaný vzdálený textový terminál (dnes nahrazen bezpečným SSH).', rfc: 'RFC 854' },
    { name: 'RDP', port: '3389', proto: 'TCP / UDP', cat: 'remote', desc: 'Remote Desktop Protocol – grafická vzdálená plocha systémů Microsoft Windows.', rfc: 'Microsoft MS-RDPBCGR' },
    { name: 'FTP', port: '20 / 21', proto: 'TCP', cat: 'file', desc: 'File Transfer Protocol – oddělený přenos řídicích příkazů (21) a datových souborů (20).', rfc: 'RFC 959' },
    { name: 'TFTP', port: '69', proto: 'UDP', cat: 'file', desc: 'Trivial FTP – jednoduchý přenos souborů bez autentizace (PXE boot, Cisco zálohy).', rfc: 'RFC 1350' },
    { name: 'SMB', port: '445', proto: 'TCP', cat: 'file', desc: 'Server Message Block – sdílení souborů a tiskáren v sítích Microsoft Windows.', rfc: 'MS-SMB2' },
    { name: 'NTP', port: '123', proto: 'UDP', cat: 'mgmt', desc: 'Network Time Protocol – vysoce přesná hierarchická synchronizace času v síti.', rfc: 'RFC 5905' },
    { name: 'SNMP', port: '161 / 162', proto: 'UDP', cat: 'mgmt', desc: 'Simple Network Management Protocol – monitorování a dohled aktivních síťových prvků.', rfc: 'RFC 3411' },
    { name: 'Syslog', port: '514', proto: 'UDP', cat: 'mgmt', desc: 'Standardizovaný centrální sběr a logování systémových událostí v síti.', rfc: 'RFC 5424' }
  ];

  function initAppExplorer() {
    const searchInput = document.getElementById('protoSearchInput');
    const cardsGrid = document.getElementById('protoCardsGrid');
    const filterBtns = document.querySelectorAll('.proto-filter-btn');
    const detailBox = document.getElementById('protoDetailBox');

    if (!cardsGrid) return;

    let currentFilter = 'all';

    function renderProtocols() {
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      cardsGrid.innerHTML = '';

      const filtered = APP_PROTOCOLS.filter(p => {
        if (currentFilter === 'web' && p.cat !== 'web') return false;
        if (currentFilter === 'mail' && p.cat !== 'mail') return false;
        if (currentFilter === 'infra' && p.cat !== 'infra') return false;
        if (currentFilter === 'file' && p.cat !== 'file' && p.cat !== 'remote') return false;
        if (currentFilter === 'mgmt' && p.cat !== 'mgmt') return false;

        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.port.includes(q) ||
          p.proto.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q)
        );
      });

      if (filtered.length === 0) {
        cardsGrid.innerHTML = `<div style="grid-column: span 3; padding: 1.5rem; text-align: center; color: var(--text-muted);">
          Žádný protokol neodpovídá hledání "${q}".
        </div>`;
        return;
      }

      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'proto-card-item';
        item.innerHTML = `
          <div>
            <div class="proto-card-top">
              <span class="proto-name">${p.name}</span>
              <span class="proto-port">Port ${p.port}</span>
            </div>
            <p class="proto-desc">${p.desc}</p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; font-size: 0.72rem; color: var(--text-muted);">
            <span>Transport: <strong style="color: #c084fc;">${p.proto}</strong></span>
            <span>${p.rfc}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          if (detailBox) {
            detailBox.innerHTML = `
              <h4 style="color:#c084fc; margin-bottom: 0.35rem;">${p.name} (Port ${p.port} / ${p.proto})</h4>
              <p style="font-size:0.85rem; color:var(--text-secondary); line-height: 1.5;">${p.desc}</p>
              <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
                Norma: <strong>${p.rfc}</strong> &bull; Kategorie: <strong>${p.cat.toUpperCase()}</strong>
              </div>
            `;
          }
        });
        cardsGrid.appendChild(item);
      });
    }

    if (searchInput) searchInput.addEventListener('input', renderProtocols);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProtocols();
      });
    });

    renderProtocols();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppExplorer);
  } else {
    initAppExplorer();
  }
})();
