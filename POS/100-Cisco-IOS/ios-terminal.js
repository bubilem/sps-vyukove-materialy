/**
 * ==========================================================================
 * POS Téma 100: Cisco IOS CLI Simulator & Interactive Playground
 * Interaktivní emulátor příkazové řádky Cisco IOS pro výuku SPŠ
 * 100% Offline, Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // Stav simulátoru
  const state = {
    mode: 'user', // 'user', 'privileged', 'config', 'config-if', 'config-line'
    hostname: 'Router',
    currentInterface: '',
    currentLine: '',
    history: [],
    historyIndex: -1,
    savedToNvram: false,
    interfaces: {
      'GigabitEthernet0/0': { ip: 'unassigned', status: 'administratively down', proto: 'down' },
      'GigabitEthernet0/1': { ip: 'unassigned', status: 'administratively down', proto: 'down' },
      'Vlan1': { ip: 'unassigned', status: 'administratively down', proto: 'down' }
    },
    passwords: {
      enableSecret: null,
      consolePass: null
    },
    banner: null
  };

  // DOM prvky
  let outputEl = null;
  let promptEl = null;
  let inputEl = null;
  let terminalContainer = null;

  /**
   * Získání textu promptu podle aktuálního režimu
   */
  function getPromptText() {
    switch (state.mode) {
      case 'user':
        return `${state.hostname}>`;
      case 'privileged':
        return `${state.hostname}#`;
      case 'config':
        return `${state.hostname}(config)#`;
      case 'config-if':
        return `${state.hostname}(config-if)#`;
      case 'config-line':
        return `${state.hostname}(config-line)#`;
      default:
        return `${state.hostname}>`;
    }
  }

  /**
   * Aktualizace promptu v UI
   */
  function updatePrompt() {
    if (promptEl) {
      promptEl.textContent = getPromptText();
    }
  }

  /**
   * Výpis řádku do terminálu
   */
  function printLine(text, className = '') {
    if (!outputEl) return;
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    div.textContent = text;
    outputEl.appendChild(div);
    scrollToBottom();
  }

  function printHtml(html) {
    if (!outputEl) return;
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.innerHTML = html;
    outputEl.appendChild(div);
    scrollToBottom();
  }

  function scrollToBottom() {
    if (outputEl) {
      outputEl.parentElement.scrollTop = outputEl.parentElement.scrollHeight;
    }
  }

  /**
   * Vyčištění obrazovky
   */
  function clearScreen() {
    if (outputEl) {
      outputEl.innerHTML = '';
    }
  }

  /**
   * Zpracování příkazu uživatele
   */
  function handleCommand(rawCmd) {
    const cmd = rawCmd.trim();

    // Výpis zadaného řádku do historie terminálu
    printLine(`${getPromptText()} ${rawCmd}`);

    if (cmd.length === 0) {
      return;
    }

    // Uložení do historie
    state.history.push(cmd);
    state.historyIndex = state.history.length;

    // Zpracování kontextové nápovědy '?' na konci nebo samostatně
    if (cmd === '?') {
      showHelp();
      return;
    }

    const parts = cmd.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const subCmd = parts[1] ? parts[1].toLowerCase() : '';
    const arg = parts.slice(2).join(' ');

    // 1. Zpracování příkazu 'do <cmd>' v konfiguračních režimech
    if (mainCmd === 'do' && state.mode.startsWith('config')) {
      const doCmd = parts.slice(1).join(' ');
      executePrivilegedCommand(doCmd);
      return;
    }

    // 2. Globální navigační příkazy (exit, end)
    if (mainCmd === 'exit' || mainCmd === 'quit') {
      handleExit();
      return;
    }

    if (mainCmd === 'end' || cmd === '^Z') {
      if (state.mode.startsWith('config')) {
        state.mode = 'privileged';
        printLine('%SYS-5-CONFIG_I: Configured from console by console', 'line-system');
        updatePrompt();
        return;
      }
    }

    // 3. Řešení podle aktuálního režimu
    switch (state.mode) {
      case 'user':
        handleUserMode(cmd, parts, mainCmd, subCmd);
        break;

      case 'privileged':
        handlePrivilegedMode(cmd, parts, mainCmd, subCmd, arg);
        break;

      case 'config':
        handleConfigMode(cmd, parts, mainCmd, subCmd, arg);
        break;

      case 'config-if':
        handleConfigIfMode(cmd, parts, mainCmd, subCmd, arg);
        break;

      case 'config-line':
        handleConfigLineMode(cmd, parts, mainCmd, subCmd, arg);
        break;

      default:
        printLine(`% Unknown mode error`, 'line-error');
    }

    updatePrompt();
  }

  /**
   * Zpracování příkazu exit
   */
  function handleExit() {
    switch (state.mode) {
      case 'config-if':
      case 'config-line':
        state.mode = 'config';
        break;
      case 'config':
        state.mode = 'privileged';
        printLine('%SYS-5-CONFIG_I: Configured from console by console', 'line-system');
        break;
      case 'privileged':
        state.mode = 'user';
        break;
      case 'user':
        printLine('% Connection closed by foreign host.', 'line-warning');
        printLine('\nPress RETURN to get started!\n', 'line-system');
        break;
    }
    updatePrompt();
  }

  /**
   * Režim User EXEC
   */
  function handleUserMode(cmd, parts, mainCmd, subCmd) {
    if (mainCmd === 'enable' || mainCmd === 'en') {
      state.mode = 'privileged';
      printLine(`Vítejte v privilegovaném režimu (Privileged EXEC #)`, 'line-success');
    } else if (mainCmd === 'show' || mainCmd === 'sh') {
      if (subCmd.startsWith('ver')) {
        showVersionOutput();
      } else if (subCmd.startsWith('ip') || subCmd.startsWith('int')) {
        printLine('% Pouze základní dohled. Pro kompletní informace zadejte nejdříve "enable".', 'line-warning');
      } else {
        printLine('% Neúplný nebo nepovolený příkaz v uživatelském režimu. Zadejte "enable".', 'line-error');
      }
    } else if (mainCmd === 'ping') {
      const target = parts[1] || '8.8.8.8';
      simulatePing(target);
    } else if (mainCmd === 'clear') {
      clearScreen();
    } else {
      printLine(`% Unknown command or computer name, or unable to find computer address`, 'line-error');
      printLine(`Tip: V uživatelském režimu zadejte 'enable' pro přístup ke všem příkazům.`, 'line-system');
    }
  }

  /**
   * Režim Privileged EXEC
   */
  function handlePrivilegedMode(cmd, parts, mainCmd, subCmd, arg) {
    if (mainCmd === 'disable' || mainCmd === 'dis') {
      state.mode = 'user';
      printLine('Návrat do uživatelského režimu User EXEC (>).', 'line-system');
    } else if (mainCmd === 'configure' || mainCmd === 'conf' || cmd === 'conf t' || cmd === 'config t') {
      if (subCmd.startsWith('t') || cmd === 'conf t' || cmd === 'config t' || parts.length === 1) {
        state.mode = 'config';
        printLine('Enter configuration commands, one per line. End with CNTL/Z.');
      } else {
        printLine('% Incomplete command. Správně: configure terminal', 'line-error');
      }
    } else if (mainCmd === 'show' || mainCmd === 'sh') {
      executeShow(parts.slice(1).join(' '));
    } else if (mainCmd === 'copy') {
      const rest = parts.slice(1).join(' ').toLowerCase();
      if (rest.includes('run') && rest.includes('start')) {
        state.savedToNvram = true;
        printLine('Destination filename [startup-config]? ');
        printLine('Building configuration...');
        printLine('[OK]', 'line-success');
        printLine('Konfigurace byla úspěšně uložena z RAM do NVRAM!', 'line-success');
      } else {
        printLine('% Incomplete command. Správně: copy running-config startup-config', 'line-error');
      }
    } else if (mainCmd === 'write' || mainCmd === 'wr') {
      if (subCmd === 'erase') {
        state.savedToNvram = false;
        printLine('Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]');
        printLine('[OK]', 'line-success');
        printLine('Erase of nvram: complete', 'line-system');
      } else {
        state.savedToNvram = true;
        printLine('Building configuration...');
        printLine('[OK]', 'line-success');
      }
    } else if (mainCmd === 'erase') {
      state.savedToNvram = false;
      printLine('Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]');
      printLine('[OK]', 'line-success');
    } else if (mainCmd === 'reload') {
      printLine('Proceed with reload? [confirm]');
      printLine('\nSystem Bootstrap, Version 15.1(4)M4, RELEASE SOFTWARE\nInitializing memory...\nLoading IOS flash:c2900-universalk9-mz.SPA.151-4.M4.bin...\n[OK]\n', 'line-system');
      if (!state.savedToNvram) {
        state.hostname = 'Router';
        printLine('% Neuložené změny byly ztraceny. Zařízení nastartovalo s čistým startup-configem.', 'line-warning');
      } else {
        printLine(`% Konfigurace byla načtena z NVRAM. Hostname: ${state.hostname}`, 'line-success');
      }
    } else if (mainCmd === 'ping') {
      const target = parts[1] || '192.168.1.1';
      simulatePing(target);
    } else if (mainCmd === 'terminal' && subCmd === 'length') {
      printLine('Stránkování výstupu bylo vypnuto (terminal length 0).', 'line-system');
    } else if (mainCmd === 'clear') {
      clearScreen();
    } else {
      printLine(`% Invalid input detected at '^' marker.`, 'line-error');
      printLine(`Tip: V privileged režimu zadejte 'configure terminal' nebo 'show running-config'.`, 'line-system');
    }
  }

  /**
   * Zpracování privileged příkazů (používáno i pro 'do <cmd>')
   */
  function executePrivilegedCommand(cmdStr) {
    const p = cmdStr.split(/\s+/);
    const m = p[0].toLowerCase();
    const s = p[1] ? p[1].toLowerCase() : '';

    if (m === 'sh' || m === 'show') {
      executeShow(p.slice(1).join(' '));
    } else if (m === 'wr' || m === 'write' || (m === 'copy' && cmdStr.includes('start'))) {
      state.savedToNvram = true;
      printLine('Building configuration... [OK]', 'line-success');
    } else if (m === 'ping') {
      simulatePing(p[1] || '192.168.1.1');
    } else {
      printLine(`% Příkaz 'do ${cmdStr}' vykonán v privilegovaném kontextu.`, 'line-system');
    }
  }

  /**
   * Zpracování příkazů show
   */
  function executeShow(subStr) {
    const s = subStr.toLowerCase();
    if (s.startsWith('run') || s.startsWith('running')) {
      showRunningConfig();
    } else if (s.startsWith('start') || s.startsWith('startup')) {
      if (state.savedToNvram) {
        showRunningConfig(true);
      } else {
        printLine('%% Non-volatile configuration memory invalid or not present', 'line-warning');
        printLine('(Konfigurace zatím nebyla uložena do NVRAM pomocí copy run start)', 'line-system');
      }
    } else if (s.startsWith('ip int') || s.startsWith('ip interface')) {
      showIpInterfaceBrief();
    } else if (s.startsWith('ver') || s.startsWith('version')) {
      showVersionOutput();
    } else {
      printLine(`% Incomplete show command. Vyzkoušejte: 'show run', 'show ip int brief' nebo 'show version'.`, 'line-error');
    }
  }

  /**
   * Režim Global Configuration
   */
  function handleConfigMode(cmd, parts, mainCmd, subCmd, arg) {
    if (mainCmd === 'hostname') {
      const newName = parts[1];
      if (newName) {
        state.hostname = newName;
        printLine(`Hostname změněn na: ${state.hostname}`, 'line-success');
        updatePrompt();
      } else {
        printLine('% Incomplete command: zadejte nové jméno (např. hostname R1-PRAHA)', 'line-error');
      }
    } else if (mainCmd === 'interface' || mainCmd === 'int') {
      const ifName = parts[1];
      if (ifName) {
        let normalized = 'GigabitEthernet0/0';
        if (ifName.toLowerCase().startsWith('g0/1') || ifName.toLowerCase().includes('0/1')) {
          normalized = 'GigabitEthernet0/1';
        } else if (ifName.toLowerCase().startsWith('vlan')) {
          normalized = 'Vlan1';
        }
        state.currentInterface = normalized;
        state.mode = 'config-if';
        printLine(`Vstup do konfigurace rozhraní ${normalized}`, 'line-system');
      } else {
        printLine('% Incomplete command. Zadejte např. interface GigabitEthernet0/0', 'line-error');
      }
    } else if (mainCmd === 'line') {
      const lineType = parts[1] ? parts[1].toLowerCase() : '';
      if (lineType.startsWith('con')) {
        state.currentLine = 'console 0';
        state.mode = 'config-line';
        printLine('Vstup do konfigurace fyzické konzole (line console 0)', 'line-system');
      } else if (lineType.startsWith('vty')) {
        state.currentLine = 'vty 0 15';
        state.mode = 'config-line';
        printLine('Vstup do konfigurace vzdálených terminálů (line vty 0 15)', 'line-system');
      } else {
        printLine('% Incomplete command. Zadejte: line console 0 nebo line vty 0 15', 'line-error');
      }
    } else if (mainCmd === 'enable') {
      if (subCmd === 'secret') {
        const pass = parts.slice(2).join(' ');
        if (pass) {
          state.passwords.enableSecret = pass;
          printLine(`Enable secret úspěšně nastaven a zašifrován pomocí MD5/scrypt.`, 'line-success');
        } else {
          printLine('% Incomplete command. Zadejte heslo: enable secret <heslo>', 'line-error');
        }
      } else {
        printLine('Tip: Použijte raději bezpečnější "enable secret <heslo>" namísto slabého "enable password".', 'line-warning');
      }
    } else if (mainCmd === 'service' && subCmd === 'password-encryption') {
      printLine('Služba šifrování hesel aktivována (všechna čistá hesla převedena na Type 7).', 'line-success');
    } else if (cmd.toLowerCase().startsWith('no ip domain-lookup') || cmd.toLowerCase().startsWith('no ip domain')) {
      printLine('Vyhledávání překlepů v DNS bylo vypnuto (CLI se již nebude zasekávat!).', 'line-success');
    } else if (mainCmd === 'banner' && subCmd === 'motd') {
      const bText = parts.slice(2).join(' ');
      state.banner = bText.replace(/#/g, '');
      printLine(`MOTD banner úspěšně nastaven.`, 'line-success');
    } else {
      printLine(`% Invalid input detected at '^' marker.`, 'line-error');
      printLine(`Tip: V config režimu můžete zkusit 'hostname MojRouter', 'interface g0/0', 'line con 0' nebo 'exit'.`, 'line-system');
    }
  }

  /**
   * Režim Interface Configuration
   */
  function handleConfigIfMode(cmd, parts, mainCmd, subCmd, arg) {
    const ifObj = state.interfaces[state.currentInterface] || { ip: 'unassigned', status: 'up', proto: 'up' };

    if (mainCmd === 'ip' && subCmd === 'address') {
      const ip = parts[2];
      const mask = parts[3];
      if (ip && mask) {
        ifObj.ip = `${ip}/${mask}`;
        printLine(`IP adresa ${ip} ${mask} nastavena na rozhraní ${state.currentInterface}.`, 'line-success');
      } else {
        printLine('% Incomplete command. Správně: ip address 192.168.1.1 255.255.255.0', 'line-error');
      }
    } else if (cmd.toLowerCase() === 'no shutdown' || cmd.toLowerCase() === 'no sh') {
      ifObj.status = 'up';
      ifObj.proto = 'up';
      printLine(`%LINK-3-UPDOWN: Interface ${state.currentInterface}, changed state to up`, 'line-success');
      printLine(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${state.currentInterface}, changed state to up`, 'line-success');
    } else if (cmd.toLowerCase() === 'shutdown' || cmd.toLowerCase() === 'sh') {
      ifObj.status = 'administratively down';
      ifObj.proto = 'down';
      printLine(`%LINK-5-CHANGED: Interface ${state.currentInterface}, changed state to administratively down`, 'line-warning');
    } else if (mainCmd === 'description') {
      printLine(`Popis rozhraní uložen: "${parts.slice(1).join(' ')}"`, 'line-system');
    } else {
      printLine(`% Invalid command in interface mode. Vyzkoušejte: 'ip address ...', 'no shutdown' nebo 'exit'.`, 'line-error');
    }
  }

  /**
   * Režim Line Configuration
   */
  function handleConfigLineMode(cmd, parts, mainCmd, subCmd, arg) {
    if (mainCmd === 'password') {
      const pass = parts.slice(1).join(' ');
      state.passwords.consolePass = pass;
      printLine(`Heslo linky nastaveno na: ${pass}`, 'line-success');
    } else if (mainCmd === 'login') {
      if (subCmd === 'local') {
        printLine('Ověřování přepnuto na lokální databázi uživatelů (login local).', 'line-success');
      } else {
        printLine('Požadavek na heslo při přihlášení aktivován (login).', 'line-success');
      }
    } else if (mainCmd === 'logging' && (subCmd === 'synchronous' || subCmd === 'sync')) {
      printLine('Logging synchronous zapnut (systémové hlášky nebudou přerušovat psaní příkazu!).', 'line-success');
    } else if (mainCmd === 'transport' && subCmd === 'input') {
      const proto = parts.slice(2).join(' ');
      printLine(`Povolené protokoly pro vzdálené připojení: ${proto || 'ssh'}`, 'line-success');
    } else {
      printLine(`% Invalid command in line mode. Zadejte např. 'password heslo', 'login', 'logging sync' nebo 'exit'.`, 'line-error');
    }
  }

  /**
   * Výpis show running-config
   */
  function showRunningConfig(isStartup = false) {
    const title = isStartup ? 'startup-config' : 'running-config';
    printLine(`Building configuration...`);
    printLine(`Current configuration : 1084 bytes`);
    printLine(`!`);
    printLine(`version 15.1`);
    printLine(`service timestamps debug datetime msec`);
    printLine(`service timestamps log datetime msec`);
    printLine(`no service password-encryption`);
    printLine(`!`);
    printLine(`hostname ${state.hostname}`);
    printLine(`!`);
    if (state.passwords.enableSecret) {
      printLine(`enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0`);
    }
    printLine(`!`);
    if (state.banner) {
      printLine(`banner motd #${state.banner}#`);
      printLine(`!`);
    }
    for (const [ifName, ifData] of Object.entries(state.interfaces)) {
      printLine(`interface ${ifName}`);
      if (ifData.ip !== 'unassigned') {
        printLine(` ip address ${ifData.ip.replace('/', ' ')}`);
      } else {
        printLine(` no ip address`);
      }
      if (ifData.status.includes('down')) {
        printLine(` shutdown`);
      }
      printLine(`!`);
    }
    printLine(`line con 0`);
    if (state.passwords.consolePass) {
      printLine(` password ${state.passwords.consolePass}`);
      printLine(` login`);
    }
    printLine(` logging synchronous`);
    printLine(`line vty 0 4`);
    printLine(` login`);
    printLine(`!`);
    printLine(`end`);
  }

  /**
   * Výpis show ip interface brief
   */
  function showIpInterfaceBrief() {
    printLine('Interface              IP-Address      OK? Method Status                Protocol');
    for (const [ifName, ifData] of Object.entries(state.interfaces)) {
      const namePad = ifName.padEnd(22, ' ');
      const ipPad = ifData.ip.padEnd(15, ' ');
      const okPad = 'YES '.padEnd(4, ' ');
      const methPad = 'manual '.padEnd(7, ' ');
      const statPad = ifData.status.padEnd(21, ' ');
      const protoPad = ifData.proto;
      printLine(`${namePad} ${ipPad} ${okPad} ${methPad} ${statPad} ${protoPad}`);
    }
  }

  /**
   * Výpis show version
   */
  function showVersionOutput() {
    printLine(`Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4, RELEASE SOFTWARE`);
    printLine(`Technical Support: http://www.cisco.com/techsupport`);
    printLine(`ROM: System Bootstrap, Version 15.1(4)M4, RELEASE SOFTWARE`);
    printLine(`${state.hostname} uptime is 42 minutes`);
    printLine(`System returned to ROM by power-on`);
    printLine(`System image file is "flash:c2900-universalk9-mz.SPA.151-4.M4.bin"`);
    printLine(`Cisco CISCO2901/K9 (revision 1.0) with 491520K/32768K bytes of memory.`);
    printLine(`2 Gigabit Ethernet interfaces`);
    printLine(`255K bytes of non-volatile configuration memory (NVRAM).`);
    printLine(`249856K bytes of ATA System CompactFlash 0 (Read/Write)`);
    printLine(`Configuration register is 0x2102`);
  }

  /**
   * Simulace pingu
   */
  function simulatePing(target) {
    printLine(`Type escape sequence to abort.`);
    printLine(`Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`);
    printLine(`!!!!!`, 'line-success');
    printLine(`Success rate is 100 percent (5/5), round-trip min/avg/max = 1/3/8 ms`);
  }

  /**
   * Kontextová nápověda '?'
   */
  function showHelp() {
    printLine('\nDostupné příkazy v tomto režimu:', 'line-system');
    switch (state.mode) {
      case 'user':
        printLine('  enable              Přechod do privilegovaného režimu (Privileged EXEC #)');
        printLine('  ping <cíl>          Ověření dostupnosti uzlu pomocí ICMP Echo');
        printLine('  show version        Zobrazení verze IOS a hardwarových parametrů');
        printLine('  exit                Odhlášení z relace');
        break;

      case 'privileged':
        printLine('  configure terminal  Vstup do režimu globální konfigurace (config)');
        printLine('  copy run start      Uložení konfigurace z RAM do NVRAM');
        printLine('  disable             Návrat do uživatelského režimu (User EXEC >)');
        printLine('  erase startup-cfg   Smazání uložené konfigurace v NVRAM');
        printLine('  ping <cíl>          Odeslání testovacích ICMP paketů');
        printLine('  reload              Restartování zařízení');
        printLine('  show running-config Zobrazení aktuální běžící konfigurace v RAM');
        printLine('  show ip int brief   Stručný přehled stavu rozhraní a IP adres');
        printLine('  show version        Hardwarová a softwarová specifikace prvku');
        printLine('  write memory        Uložení změn (zkráceně "wr")');
        printLine('  exit                Ukončení privilegované relace');
        break;

      case 'config':
        printLine('  banner motd #text#  Nastavení uvítacího a varovného banneru');
        printLine('  enable secret <hes> Zabezpečení priviligovaného režimu MD5/scrypt heslem');
        printLine('  hostname <jméno>    Změna síťového názvu prvku');
        printLine('  interface <id>      Konfigurace portu (např. g0/0, g0/1, vlan 1)');
        printLine('  line <typ>          Konfigurace linek (console 0, vty 0 15)');
        printLine('  no ip domain-lookup Vypnutí zasekávání CLI při překlepu v příkazu');
        printLine('  service pass-enc    Globální zašifrování hesel v konfiguraci');
        printLine('  do <příkaz>         Vykonání privileged příkazu přímo z konfigurace');
        printLine('  exit                Návrat do privilegovaného režimu (#)');
        printLine('  end                 Okamžitý návrat do Privileged EXEC (#)');
        break;

      case 'config-if':
        printLine('  ip address <ip> <m> Nastavení IP adresy a masky podsítě');
        printLine('  no shutdown         Zapnutí / aktivace síťového rozhraní');
        printLine('  shutdown            Vypnutí síťového rozhraní');
        printLine('  description <popis> Popis účelu rozhraní v dokumentaci');
        printLine('  exit                Návrat do globální konfigurace (config)');
        printLine('  end                 Skok přímo do privilegovaného režimu (#)');
        break;

      case 'config-line':
        printLine('  password <heslo>    Nastavení hesla pro přihlášení na linku');
        printLine('  login               Požadavek na ověření heslem');
        printLine('  login local         Ověřování proti lokální databázi uživatelů');
        printLine('  logging synchronous Zabránění rozbíjení promptu systémovými logy');
        printLine('  transport input ssh Povolení pouze zabezpečeného protokolu SSH');
        printLine('  exit                Návrat do globální konfigurace (config)');
        break;
    }
    printLine('');
  }

  /**
   * Klávesa Tab - automatické doplňování jednoznačných příkazů
   */
  function handleTabCompletion() {
    if (!inputEl) return;
    const currentVal = inputEl.value;
    if (!currentVal.trim()) return;

    const parts = currentVal.split(/\s+/);
    const lastPart = parts[parts.length - 1].toLowerCase();

    // Slovníky pro doplňování dle režimu
    const vocabularies = {
      user: ['enable', 'ping', 'show', 'version', 'exit', 'clear'],
      privileged: ['configure', 'terminal', 'copy', 'running-config', 'startup-config', 'disable', 'erase', 'reload', 'show', 'version', 'interfaces', 'write', 'memory', 'clear', 'exit'],
      config: ['hostname', 'interface', 'GigabitEthernet0/0', 'GigabitEthernet0/1', 'line', 'console', 'vty', 'enable', 'secret', 'password', 'service', 'password-encryption', 'banner', 'motd', 'exit', 'end', 'do'],
      'config-if': ['ip', 'address', 'no', 'shutdown', 'description', 'exit', 'end'],
      'config-line': ['password', 'login', 'local', 'logging', 'synchronous', 'transport', 'input', 'ssh', 'exit', 'end']
    };

    const currentVocab = vocabularies[state.mode] || [];
    const matches = currentVocab.filter(w => w.toLowerCase().startsWith(lastPart));

    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      inputEl.value = parts.join(' ') + ' ';
    } else if (matches.length > 1) {
      printLine(`${getPromptText()} ${currentVal}`);
      printLine(`Možnosti: ${matches.join('  ')}`, 'line-system');
    }
  }

  /**
   * Inicializace DOM a posluchačů událostí
   */
  function init() {
    outputEl = document.getElementById('iosTerminalOutput');
    promptEl = document.getElementById('iosTerminalPrompt');
    inputEl = document.getElementById('iosTerminalInput');
    terminalContainer = document.getElementById('iosTerminalContainer');

    if (!inputEl || !outputEl) return;

    updatePrompt();

    // Uvítací řádek
    printLine('Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4', 'line-system');
    printLine('Konzolové spojení aktivní (Line con0, 9600 baud, 8-N-1).', 'line-system');
    printLine('Zadejte "enable" pro vstup do priviligovaného režimu nebo "?" pro nápovědu.\n', 'line-system');

    // Kliknutí do okna terminálu automaticky zaměří input
    if (terminalContainer) {
      terminalContainer.addEventListener('click', () => {
        if (inputEl) inputEl.focus();
      });
    }

    // Klávesnice v inputu
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = inputEl.value;
        inputEl.value = '';
        handleCommand(cmd);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTabCompletion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.history.length > 0 && state.historyIndex > 0) {
          state.historyIndex--;
          inputEl.value = state.history[state.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          inputEl.value = state.history[state.historyIndex] || '';
        } else {
          state.historyIndex = state.history.length;
          inputEl.value = '';
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (state.mode.startsWith('config')) {
          state.mode = 'privileged';
          printLine('%SYS-5-CONFIG_I: Configured from console by console', 'line-system');
          updatePrompt();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        printLine(`^C`, 'line-warning');
        inputEl.value = '';
      }
    });

    // Registrace předvolených rychlých tlačítek (Preset buttons)
    document.querySelectorAll('.terminal-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmd = btn.getAttribute('data-cmd');
        if (cmd === '__RESET__') {
          state.mode = 'user';
          state.hostname = 'Router';
          state.savedToNvram = false;
          clearScreen();
          printLine('Terminál byl restartován do výchozího stavu.', 'line-warning');
          printLine('Zadejte "enable" pro přechod do privilegovaného režimu.', 'line-system');
          updatePrompt();
          if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
          }
          return;
        }

        if (cmd) {
          if (inputEl) {
            inputEl.value = cmd;
            inputEl.focus();
            handleCommand(cmd);
            inputEl.value = '';
          }
        }
      });
    });
  }

  // Spuštění po načtení DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
