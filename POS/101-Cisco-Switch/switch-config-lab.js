/**
 * ==========================================================================
 * POS Téma 101: Cisco Switch Configuration Lab & Task Validator
 * Interaktivní validátor laboratorních kroků a generátor skriptů pro SPŠ
 * 100% Offline, Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // Stav switche a splněných úkolů
  const labState = {
    hostname: 'Switch',
    mode: 'user', // 'user', 'privileged', 'config', 'config-if', 'config-line'
    currentIf: '',
    currentLine: '',
    history: [],
    historyIndex: -1,
    tasks: {
      hostname: false,
      noDomainLookup: false,
      banner: false,
      enableSecret: false,
      lineConsole: false,
      serviceEncryption: false,
      sshDomainKey: false,
      adminUser: false,
      vtySsh: false,
      vlan1Ip: false,
      defaultGateway: false,
      saved: false
    },
    // Lokální data
    domainSet: false,
    rsaGenerated: false,
    lineConPassword: false,
    lineConLogin: false,
    vlan1NoShut: false
  };

  // DOM elementy
  let outputEl = null;
  let promptEl = null;
  let inputEl = null;
  let checklistContainer = null;
  let progressCountEl = null;

  /**
   * Získání promptu podle stavu switche
   */
  function getPrompt() {
    switch (labState.mode) {
      case 'user':
        return `${labState.hostname}>`;
      case 'privileged':
        return `${labState.hostname}#`;
      case 'config':
        return `${labState.hostname}(config)#`;
      case 'config-if':
        return `${labState.hostname}(config-if)#`;
      case 'config-line':
        return `${labState.hostname}(config-line)#`;
      default:
        return `${labState.hostname}>`;
    }
  }

  function updatePrompt() {
    if (promptEl) {
      promptEl.textContent = getPrompt();
    }
  }

  function printLine(text, className = '') {
    if (!outputEl) return;
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    div.textContent = text;
    outputEl.appendChild(div);
    if (outputEl.parentElement) {
      outputEl.parentElement.scrollTop = outputEl.parentElement.scrollHeight;
    }
  }

  /**
   * Aktualizace zaškrtávátek v checklistu
   */
  function updateChecklistUI() {
    let completedCount = 0;
    const totalCount = Object.keys(labState.tasks).length;

    for (const [taskId, isDone] of Object.entries(labState.tasks)) {
      const itemEl = document.getElementById(`task-${taskId}`);
      if (itemEl) {
        if (isDone) {
          itemEl.classList.add('completed');
          const checkIcon = itemEl.querySelector('.task-checkbox');
          if (checkIcon) {
            checkIcon.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="width:12px;height:12px;stroke-width:3;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          }
          completedCount++;
        } else {
          itemEl.classList.remove('completed');
          const checkIcon = itemEl.querySelector('.task-checkbox');
          if (checkIcon) {
            checkIcon.innerHTML = '';
          }
        }
      }
    }

    if (progressCountEl) {
      progressCountEl.textContent = `${completedCount} / ${totalCount}`;
    }
  }

  /**
   * Zpracování příkazu
   */
  function executeCommand(raw) {
    const cmd = raw.trim();
    printLine(`${getPrompt()} ${raw}`);

    if (!cmd) return;

    labState.history.push(cmd);
    labState.historyIndex = labState.history.length;

    const lower = cmd.toLowerCase();
    const parts = cmd.split(/\s+/);
    const m = parts[0].toLowerCase();
    const s = parts[1] ? parts[1].toLowerCase() : '';

    // Globální navigace
    if (m === 'exit' || m === 'quit') {
      if (labState.mode === 'config-if' || labState.mode === 'config-line') {
        labState.mode = 'config';
      } else if (labState.mode === 'config') {
        labState.mode = 'privileged';
        printLine('%SYS-5-CONFIG_I: Configured from console by console', 'line-system');
      } else if (labState.mode === 'privileged') {
        labState.mode = 'user';
      } else {
        printLine('% Relace ukončena. Stiskněte Enter pro pokračování.', 'line-system');
      }
      updatePrompt();
      return;
    }

    if (m === 'end' || cmd === '^Z') {
      if (labState.mode.startsWith('config')) {
        labState.mode = 'privileged';
        printLine('%SYS-5-CONFIG_I: Configured from console by console', 'line-system');
        updatePrompt();
        return;
      }
    }

    if (m === 'enable' || m === 'en') {
      labState.mode = 'privileged';
      printLine('Přepnuto do Privileged EXEC (#)', 'line-success');
      updatePrompt();
      return;
    }

    if (m === 'disable') {
      labState.mode = 'user';
      updatePrompt();
      return;
    }

    if (m === 'conf' || m === 'configure' || cmd === 'conf t') {
      if (labState.mode === 'privileged') {
        labState.mode = 'config';
        printLine('Enter configuration commands, one per line. End with CNTL/Z.');
        updatePrompt();
        return;
      }
    }

    // Uložení konfigurace
    if ((m === 'copy' && lower.includes('run') && lower.includes('start')) || m === 'wr' || m === 'write') {
      if (labState.mode === 'privileged') {
        labState.tasks.saved = true;
        printLine('Building configuration...');
        printLine('[OK]', 'line-success');
        printLine('Konfigurace úspěšně uložena do NVRAM!', 'line-success');
        updateChecklistUI();
        return;
      }
    }

    // Příkazy v config módu
    if (labState.mode === 'config') {
      // 1. Hostname
      if (m === 'hostname') {
        const hName = parts[1];
        if (hName && hName.toLowerCase() !== 'switch') {
          labState.hostname = hName;
          labState.tasks.hostname = true;
          printLine(`Hostname změněn na: ${labState.hostname}`, 'line-success');
          updatePrompt();
          updateChecklistUI();
          return;
        }
      }

      // 2. No IP domain-lookup
      if (lower.startsWith('no ip domain-lookup') || lower.startsWith('no ip domain')) {
        labState.tasks.noDomainLookup = true;
        printLine('DNS domain-lookup deaktivován.', 'line-success');
        updateChecklistUI();
        return;
      }

      // 3. Banner MOTD
      if (m === 'banner' && s === 'motd') {
        labState.tasks.banner = true;
        printLine('Banner MOTD byl úspěšně nastaven.', 'line-success');
        updateChecklistUI();
        return;
      }

      // 4. Enable Secret
      if (m === 'enable' && s === 'secret') {
        if (parts[2]) {
          labState.tasks.enableSecret = true;
          printLine('Enable secret úspěšně nastaven a zašifrován.', 'line-success');
          updateChecklistUI();
          return;
        }
      }

      // 5. Service password-encryption
      if (lower.startsWith('service password-encryption') || lower.startsWith('service pass')) {
        labState.tasks.serviceEncryption = true;
        printLine('Služba service password-encryption aktivována.', 'line-success');
        updateChecklistUI();
        return;
      }

      // 6. IP domain-name
      if (m === 'ip' && s === 'domain-name') {
        labState.domainSet = true;
        printLine(`IP doména nastavena na: ${parts[2]}`, 'line-success');
        if (labState.domainSet && labState.rsaGenerated) {
          labState.tasks.sshDomainKey = true;
          updateChecklistUI();
        }
        return;
      }

      // 7. Crypto key generate rsa
      if (lower.startsWith('crypto key generate rsa') || lower.startsWith('crypto key gen rsa')) {
        labState.rsaGenerated = true;
        printLine('The name for the keys will be: ' + labState.hostname + '.sps-skola.cz');
        printLine('% The key-pair has been generated. Key modulus: 2048 bits', 'line-success');
        printLine('% SSH 1.99 has been enabled to SSH 2.0', 'line-success');
        if (labState.domainSet && labState.rsaGenerated) {
          labState.tasks.sshDomainKey = true;
          updateChecklistUI();
        }
        return;
      }

      // 8. Username admin ... secret ...
      if (m === 'username' && lower.includes('secret')) {
        labState.tasks.adminUser = true;
        printLine(`Lokální uživatel ${parts[1]} s tajným heslem vytvořen.`, 'line-success');
        updateChecklistUI();
        return;
      }

      // 9. Line console 0
      if (m === 'line' && s.startsWith('con')) {
        labState.mode = 'config-line';
        labState.currentLine = 'console';
        printLine('Vstup do konfigurace Line console 0', 'line-system');
        updatePrompt();
        return;
      }

      // 10. Line vty 0 15
      if (m === 'line' && s.startsWith('vty')) {
        labState.mode = 'config-line';
        labState.currentLine = 'vty';
        printLine('Vstup do konfigurace Line VTY 0 15', 'line-system');
        updatePrompt();
        return;
      }

      // 11. Interface vlan 1
      if ((m === 'interface' || m === 'int') && s.startsWith('vlan')) {
        labState.mode = 'config-if';
        labState.currentIf = 'Vlan1';
        printLine('Vstup do konfigurace rozhraní SVI VLAN 1', 'line-system');
        updatePrompt();
        return;
      }

      // 12. IP default-gateway
      if (m === 'ip' && s === 'default-gateway') {
        const gw = parts[2];
        if (gw) {
          labState.tasks.defaultGateway = true;
          printLine(`Výchozí brána pro správu nastavena na: ${gw}`, 'line-success');
          updateChecklistUI();
          return;
        }
      }
    }

    // V podrežimu Interface
    if (labState.mode === 'config-if') {
      if (m === 'ip' && s === 'address') {
        const ip = parts[2];
        const mask = parts[3];
        if (ip && mask) {
          printLine(`IP adresa ${ip} ${mask} přiřazena na ${labState.currentIf}`, 'line-success');
          if (labState.vlan1NoShut) {
            labState.tasks.vlan1Ip = true;
            updateChecklistUI();
          }
          return;
        }
      }

      if (lower === 'no shutdown' || lower === 'no sh') {
        labState.vlan1NoShut = true;
        printLine('%LINK-3-UPDOWN: Interface Vlan1, changed state to up', 'line-success');
        printLine('%LINEPROTO-5-UPDOWN: Line protocol on Interface Vlan1, changed state to up', 'line-success');
        labState.tasks.vlan1Ip = true;
        updateChecklistUI();
        return;
      }
    }

    // V podrežimu Line
    if (labState.mode === 'config-line') {
      if (m === 'password') {
        labState.lineConPassword = true;
        printLine(`Heslo nastaveno.`, 'line-success');
        if (labState.currentLine === 'console' && labState.lineConLogin) {
          labState.tasks.lineConsole = true;
          updateChecklistUI();
        }
        return;
      }

      if (m === 'login') {
        if (s === 'local' && labState.currentLine === 'vty') {
          printLine('Přihlašování přes lokální databázi uživatelů zapnuto.', 'line-success');
        } else {
          labState.lineConLogin = true;
          printLine('Ověřování přihlášení heslem aktivováno.', 'line-success');
          if (labState.currentLine === 'console' && labState.lineConPassword) {
            labState.tasks.lineConsole = true;
            updateChecklistUI();
          }
        }
        return;
      }

      if (m === 'transport' && s === 'input') {
        const proto = parts[2] ? parts[2].toLowerCase() : '';
        if (proto.includes('ssh') && labState.currentLine === 'vty') {
          labState.tasks.vtySsh = true;
          printLine('Vzdálený přístup na linky VTY omezen pouze na protokol SSH.', 'line-success');
          updateChecklistUI();
          return;
        }
      }
    }

    // Obecná reakce
    printLine(`% Příkaz '${cmd}' byl zpracován v simulátoru.`, 'line-system');
  }

  /**
   * Generátor kompletního Cisco skriptu podle parametrů
   */
  function generateFullScript() {
    const hostname = (document.getElementById('genHostname') || {}).value || 'SW-PATER-01';
    const domain = (document.getElementById('genDomain') || {}).value || 'sps-skola.cz';
    const secretPass = (document.getElementById('genSecretPass') || {}).value || 'CiscoSecretPass2026!';
    const conPass = (document.getElementById('genConPass') || {}).value || 'KonzolePass123!';
    const adminUser = (document.getElementById('genAdminUser') || {}).value || 'admin';
    const adminPass = (document.getElementById('genAdminPass') || {}).value || 'AdminSSHPass987!';
    const ip = (document.getElementById('genIp') || {}).value || '192.168.10.2';
    const mask = (document.getElementById('genMask') || {}).value || '255.255.255.0';
    const gateway = (document.getElementById('genGateway') || {}).value || '192.168.10.1';

    const script = `! ==============================================================
! Cisco Catalyst Switch - Základní konfigurační šablona SPŠ
! ==============================================================
enable
configure terminal

! 1. Základní identita zařízení a ochrana před překlepy
hostname ${hostname}
no ip domain-lookup
banner motd #
****************************************************************
*  VAROVANI: VYHRAZENO POUZE PRO AUTORIZOVANY PERSONAL SKOLY!  *
*  NEOPRAVNENY PRISTUP BUDE TRESTNE STIHAN DLE ZAKONA CR!      *
****************************************************************
#

! 2. Zabezpečení priviligovaného režimu (Enable Secret)
enable secret ${secretPass}

! 3. Globální zašifrování všech hesel v konfiguraci
service password-encryption

! 4. Fyzická konzole (Line Console 0)
line console 0
 password ${conPass}
 login
 logging synchronous
 exec-timeout 5 0
exit

! 5. Konfigurace SSH v2 a lokálního správce
ip domain-name ${domain}
crypto key generate rsa modulus 2048
ip ssh version 2
username ${adminUser} privilege 15 secret ${adminPass}

! 6. Zabezpečení virtuálních terminálů (Line VTY 0 15)
line vty 0 15
 transport input ssh
 login local
 exec-timeout 10 0
 logging synchronous
exit

! 7. Management rozhraní SVI (VLAN 1)
interface vlan 1
 description MANAZERSKE ROZHRANI SPRAVY SWITCH
 ip address ${ip} ${mask}
 no shutdown
exit

! 8. Výchozí brána pro vzdálenou správu mimo podsíť
ip default-gateway ${gateway}

! 9. Zabezpečení nepoužívaných portů (Příklad pro porty 10-24)
interface range fastethernet 0/10 - 24
 description NEPOUZIVANE PORTY - SECURITY SHUTDOWN
 switchport mode access
 shutdown
exit

! 10. Uložení běžící konfigurace do paměti NVRAM
end
copy running-config startup-config
`;

    const outputBox = document.getElementById('generatedConfigOutput');
    if (outputBox) {
      outputBox.value = script;
    }
  }

  /**
   * Inicializace
   */
  function init() {
    outputEl = document.getElementById('switchLabOutput');
    promptEl = document.getElementById('switchLabPrompt');
    inputEl = document.getElementById('switchLabInput');
    checklistContainer = document.getElementById('switchTasksChecklist');
    progressCountEl = document.getElementById('labProgressCount');

    if (!inputEl || !outputEl) return;

    updatePrompt();
    updateChecklistUI();

    printLine('Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4', 'line-system');
    printLine('Laboratorní simulátor switche aktivní. Postupujte podle kontrolního seznamu vpravo!\n', 'line-system');

    // Kliknutí do okna terminálu automaticky zaměří input
    const terminalBox = document.getElementById('switchTerminalContainer') || document.querySelector('.ios-terminal-container');
    if (terminalBox) {
      terminalBox.addEventListener('click', () => {
        if (inputEl) inputEl.focus();
      });
    }

    // Input klávesnice
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const v = inputEl.value;
        inputEl.value = '';
        executeCommand(v);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (labState.history.length > 0 && labState.historyIndex > 0) {
          labState.historyIndex--;
          inputEl.value = labState.history[labState.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (labState.historyIndex < labState.history.length - 1) {
          labState.historyIndex++;
          inputEl.value = labState.history[labState.historyIndex] || '';
        } else {
          labState.historyIndex = labState.history.length;
          inputEl.value = '';
        }
      }
    });

    // Tlačítko generátoru
    const btnGen = document.getElementById('btnGenerateScript');
    if (btnGen) {
      btnGen.addEventListener('click', generateFullScript);
      generateFullScript(); // Vygenerovat výchozí
    }

    // Tlačítko kopírování generovaného skriptu
    const btnCopy = document.getElementById('btnCopyGeneratedScript');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const outputBox = document.getElementById('generatedConfigOutput');
        if (outputBox) {
          navigator.clipboard.writeText(outputBox.value).then(() => {
            const orig = btnCopy.innerHTML;
            btnCopy.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Zkopírováno!`;
            setTimeout(() => { btnCopy.innerHTML = orig; }, 2000);
          });
        }
      });
    }

    // Rychlá předvolená tlačítka pro studenty v labu
    document.querySelectorAll('.lab-quick-cmd').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          inputEl.value = cmd;
          inputEl.focus();
          executeCommand(cmd);
          inputEl.value = '';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
