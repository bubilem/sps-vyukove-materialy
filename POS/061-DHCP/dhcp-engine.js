/**
 * ==========================================================================
 * Téma 061: Protokol DHCP - Interaktivní engine simulátoru DORA
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  function initDhcpSimulator() {
    const clientStateEl = document.getElementById('dhcpClientState');
    const clientIpEl = document.getElementById('dhcpClientIp');
    const serverStateEl = document.getElementById('dhcpServerState');
    const bubbleEl = document.getElementById('dhcpBubble');
    const logWrapEl = document.getElementById('dhcpLogWrap');
    const statusNoteEl = document.getElementById('dhcpStatusNote');
    const leaseTableEl = document.getElementById('dhcpLeaseTable');

    const btnDiscover = document.getElementById('btnDhcpDiscover');
    const btnOffer = document.getElementById('btnDhcpOffer');
    const btnRequest = document.getElementById('btnDhcpRequest');
    const btnAck = document.getElementById('btnDhcpAck');
    const btnRenew = document.getElementById('btnDhcpRenew');
    const btnRelease = document.getElementById('btnDhcpRelease');

    if (!clientStateEl || !serverStateEl || !bubbleEl) return;

    let state = 'INIT'; // INIT, SELECTING, REQUESTING, BOUND
    let offeredIp = '192.168.1.105';
    let isBusy = false;

    let hasLogs = false;

    function addLog(dir, type, src, dst, details) {
      if (!logWrapEl) return;
      if (!hasLogs) {
        logWrapEl.innerHTML = '';
        hasLogs = true;
      }
      const now = new Date();
      const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;

      const entry = document.createElement('div');
      entry.className = 'sim-log-entry';
      const isClient = dir.includes('C ->');
      const dirClass = isClient ? 'dir-client' : 'dir-server';

      entry.innerHTML = `
        <span class="sniff-time">${timeStr}</span>
        <strong class="sniff-dir ${dirClass}">${dir}</strong>
        <span class="sniff-type">[${type}]</span>
        <span class="sniff-endpoints">${src} &rarr; ${dst}</span>
        <span class="sniff-details">${details}</span>
      `;
      logWrapEl.prepend(entry);
    }

    function animatePacket(dir, text) {
      return new Promise(resolve => {
        bubbleEl.className = 'sim-packet-bubble ' + (dir === 'c2s' ? 'dir-right' : 'dir-left');
        bubbleEl.textContent = text;
        bubbleEl.style.opacity = '1';

        const startX = dir === 'c2s' ? '20px' : 'calc(100% - 170px)';
        const endX = dir === 'c2s' ? 'calc(100% - 170px)' : '20px';

        bubbleEl.style.left = startX;

        requestAnimationFrame(() => {
          setTimeout(() => {
            bubbleEl.style.left = endX;
            setTimeout(() => {
              bubbleEl.style.opacity = '0';
              resolve();
            }, 800);
          }, 30);
        });
      });
    }

    // 1. DISCOVER
    async function doDiscover() {
      if (isBusy) return;
      isBusy = true;
      state = 'SELECTING';
      clientStateEl.textContent = 'SELECTING';
      clientStateEl.style.color = '#fbbf24';
      clientIpEl.textContent = '0.0.0.0 (Nenastaveno)';

      statusNoteEl.textContent = '1. Krok: Klient vysílá DHCPDISCOVER broadcastem na port 67...';
      addLog('C -> All', 'DHCPDISCOVER', '0.0.0.0:68', '255.255.255.255:67', 'Klient (MAC: 00:1A:2B:3C:4D:5E) hledá dostupný DHCP server');
      await animatePacket('c2s', 'DHCPDISCOVER (Broadcast)');

      statusNoteEl.innerHTML = 'DHCP server zachytil dotaz. Nyní klikněte na <strong>2. DHCPOFFER</strong>.';
      isBusy = false;
    }

    // 2. OFFER
    async function doOffer() {
      if (isBusy) return;
      if (state !== 'SELECTING') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Nejprve musíte vyslat DHCPDISCOVER.</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = '2. Krok: Server nabízí volnou IP adresu z fondu (DHCPOFFER)...';

      addLog('S -> C', 'DHCPOFFER', '192.168.1.1:67', '255.255.255.255:68', `Nabídka IP: ${offeredIp}, Maska: /24, GW: 192.168.1.1, DNS: 8.8.8.8, Lease: 86400s`);
      await animatePacket('s2c', `DHCPOFFER (${offeredIp})`);

      state = 'REQUESTING';
      clientStateEl.textContent = 'REQUESTING';
      statusNoteEl.innerHTML = `Klient obdržel nabídku IP ${offeredIp}. Nyní klikněte na <strong>3. DHCPREQUEST</strong> pro akceptaci.`;
      isBusy = false;
    }

    // 3. REQUEST
    async function doRequest() {
      if (isBusy) return;
      if (state !== 'REQUESTING') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Nejprve musíte obdržet DHCPOFFER.</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = '3. Krok: Klient broadcastem potvrzuje zájem o nabízenou IP (DHCPREQUEST)...';

      addLog('C -> All', 'DHCPREQUEST', '0.0.0.0:68', '255.255.255.255:67', `Klient žádá o ${offeredIp} od serveru 192.168.1.1`);
      await animatePacket('c2s', `DHCPREQUEST (${offeredIp})`);

      statusNoteEl.innerHTML = 'Server obdržel požadavek. Klikněte na <strong>4. DHCPACK</strong> pro zápis zápůjčky.';
      isBusy = false;
    }

    // 4. ACK
    async function doAck() {
      if (isBusy) return;
      if (state !== 'REQUESTING') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Nejprve musí proběhnout DHCPREQUEST.</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = '4. Krok: Server finálně potvrzuje zápůjčku (DHCPACK)...';

      addLog('S -> C', 'DHCPACK', '192.168.1.1:67', '255.255.255.255:68', `Zápůjčka potvrzena na 24 hodin (86 400 s)`);
      await animatePacket('s2c', 'DHCPACK (Potvrzeno)');

      state = 'BOUND';
      clientStateEl.textContent = 'BOUND (Aktivní)';
      clientStateEl.style.color = '#34d399';
      clientIpEl.textContent = `${offeredIp} / 24 (GW: 192.168.1.1)`;

      if (leaseTableEl) {
        leaseTableEl.innerHTML = `
          <tr style="color: #34d399;">
            <td>192.168.1.105</td>
            <td>00:1A:2B:3C:4D:5E</td>
            <td>86 400 s (24 h)</td>
            <td>Aktivní (BOUND)</td>
          </tr>
        `;
      }

      statusNoteEl.innerHTML = '<strong style="color:#34d399;">Proces DORA úspěšně dokončen!</strong> Síťová karta klienta je plně nakonfigurována a může komunikovat s Internetem.';
      isBusy = false;
    }

    // 5. RENEW (T1)
    async function doRenew() {
      if (isBusy) return;
      if (state !== 'BOUND') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Klient nemá aktivní zápůjčku. Nejprve proveďte DORA proces.</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = 'Časovač T1 (50% lease time): Klient posílá unicast DHCPREQUEST pro prodloužení...';

      addLog('C -> S', 'DHCPREQUEST (Renew)', `${offeredIp}:68`, '192.168.1.1:67', 'Unicast žádost o obnovení zápůjčky na dalších 24 hodin');
      await animatePacket('c2s', 'DHCPREQUEST (Unicast)');

      addLog('S -> C', 'DHCPACK', '192.168.1.1:67', `${offeredIp}:68`, 'Zápůjčka prodloužena o plných 86 400 sekund');
      await animatePacket('s2c', 'DHCPACK (Renewed)');

      statusNoteEl.innerHTML = '<strong style="color:#38bdf8;">Zápůjčka úspěšně obnovena!</strong> Klient pokračuje v provozu bez přerušení spojení.';
      isBusy = false;
    }

    // 6. RELEASE
    async function doRelease() {
      if (isBusy) return;
      if (state !== 'BOUND') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Klient nemá žádnou přidělenou adresu k uvolnění.</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = 'Klient se korektně odhlašuje ze sítě (DHCPRELEASE)...';

      addLog('C -> S', 'DHCPRELEASE', `${offeredIp}:68`, '192.168.1.1:67', `Klient dobrovolně vrací IP adresu ${offeredIp} zpět do fondu`);
      await animatePacket('c2s', 'DHCPRELEASE');

      state = 'INIT';
      clientStateEl.textContent = 'INIT';
      clientStateEl.style.color = '#94a3b8';
      clientIpEl.textContent = '0.0.0.0 (Uvolněno)';

      if (leaseTableEl) {
        leaseTableEl.innerHTML = `
          <tr style="color: var(--text-muted);">
            <td colspan="4" style="text-align: center; padding: 0.5rem;">Žádná aktivní zápůjčka v tabulce.</td>
          </tr>
        `;
      }

      statusNoteEl.innerHTML = 'IP adresa byla vrácena do fondu volných adres serveru.';
      isBusy = false;
    }

    if (btnDiscover) btnDiscover.addEventListener('click', doDiscover);
    if (btnOffer) btnOffer.addEventListener('click', doOffer);
    if (btnRequest) btnRequest.addEventListener('click', doRequest);
    if (btnAck) btnAck.addEventListener('click', doAck);
    if (btnRenew) btnRenew.addEventListener('click', doRenew);
    if (btnRelease) btnRelease.addEventListener('click', doRelease);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDhcpSimulator);
  } else {
    initDhcpSimulator();
  }
})();
