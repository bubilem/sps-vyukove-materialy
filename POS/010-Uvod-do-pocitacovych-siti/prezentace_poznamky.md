# Metodické poznámky k prezentaci 010: Úvod do počítačových sítí

Výukový modul pro předmět **Počítačové sítě (POS)** na Střední průmyslové škole (SPŠ).  
Cílová skupina: Žáci 2. až 4. ročníku SPŠ (obory IT, Kybernetická bezpečnost, Elektrotechnika).  
Doporučená časová dotace: 3 až 4 vyučovací hodiny (výklad + laboratorní demonstrace a cvičení).

---

## Didaktické cíle modulu

Po absolvování této prezentace a navazujících cvičení žák:
1. **Definuje pojem počítačová síť** a vysvětlí klíčové přínosy (sdílení hardware, centralizace dat, redundance) i kritická rizika (kybernetické útoky, ransomwary, DDoS, závislost společnosti na konektivitě).
2. **Rozlišuje základní síťové metriky** (Bandwidth, Throughput, Latency/RTT, Packet Loss, Jitter) a chápe jejich vliv na uživatelskou zkušenost (web vs. video vs. VoIP).
3. **Pojmenuje a charakterizuje 4 pilíře sítě:** Zařízení (Hardware), Média (přenosové trasy), Protokoly (pravidla komunikace) a Zprávy (struktura PDU).
4. **Rozliší koncová zařízení (Host)** od **zprostředkujících aktivních prvků** (Switch L2, Router L3, Access Point, Firewall) a popíše jejich primární funkci.
5. **Porovná přenosová média:** Metalická kroucená dvojlinka (UTP/STP, Cat5e/6/6a, limit 100 m), optická vlákna (Single-mode vs. Multi-mode, imunita vůči EMI) a bezdrátová média (Wi-Fi pásma 2.4 GHz, 5 GHz, 6 GHz, útlum a bezpečnost).
6. **Vysvětlí princip multiplexingu:** Proč je nutný pro sdílení linek, rozdíly mezi TDM, FDM/WDM a moderním statistickým paketovým multiplexováním (Packet Switching).
7. **Pochopí proces enkapsulace a dekapsulace dat** a správně přiřadí názvy PDU k jednotlivým vrstvám (Data -> Segment -> Paket -> Rámec -> Bity).
8. **Porovná referenční model ISO/OSI (7 vrstev)** a **praktický model TCP/IP (4/5 vrstev)** a objasní výhody vrstvené architektury pro technologické inovace.

---

## Přehled snímků a metodické pokyny pro vyučujícího

### Snímek 1: Titulní snímek (Úvod do počítačových sítí)
- **Cíl:** Zaujmout žáky moderní vizuální formou, představit osnovu tématu a provázání s kurikulem Cisco CCNA: Introduction to Networks (CCNA:ITN).
- **Tip do výuky:** Položte žákům úvodní otázku: *"Co všechno by dnes ve městě přestalo fungovat, kdyby na 24 hodin zcela vypadl Internet a mobilní sítě?"*

### Snímek 2: K čemu sítě slouží? Přínosy, metriky a kybernetická rizika
- **Cíl:** Pochopení dvousečnosti síťové technologie. Přínosy (sdílení zdrojů, cloud) vs. hrozby (malware, vyděračský ransomware, DDoS).
- **Důraz na metriky:** Vysvětlit rozdíl mezi teoretickou šířkou pásma (Bandwidth, např. 1 Gb/s) a reálnou propustností (Throughput, ovlivněnou režií protokolů a latencí).
- **Terminologie:** Latency (zpoždění), RTT (Round-Trip Time), Jitter (rozptyl zpoždění – zásadní pro online hry a VoIP).

### Snímek 3: Čtyři pilíře síťové komunikace
- **Cíl:** Zavedení základní mentální mapy. Vše v síti lze rozdělit do 4 kategorií: Zařízení, Média, Protokoly a Zprávy.
- **Aktivita pro žáky:** Nechte žáky na tabuli roztřídit běžné pojmy (např. *kabel Cat6*, *Wi-Fi karta*, *IP adresa*, *HTTP*, *switch*, *MP4 video*) do těchto 4 pilířů.

### Snímek 4: Pilíř 1 – Síťový hardware a zařízení
- **Cíl:** Důsledné rozlišení koncového zařízení (Host) a zprostředkujícího prvku.
- **Klíčové prvky:**
  - *Switch (L2):* Pracuje v lokální síti, učí se MAC adresy a ukládá je do CAM tabulky.
  - *Router (L3):* Odděluje sítě, rozhoduje o nejlepší cestě dle IP směrovacích tabulek.
  - *Access Point (AP):* Převodník L2 rámců mezi Ethernetem a rádiovým spektrem 802.11.

### Snímek 5: Pilíř 2 – Přenosová média
- **Cíl:** Fyzikální a technické vlastnosti metaliky, optiky a bezdrátu.
- **Důležitá fakta pro testy:**
  - Proč se kroutí páry u UTP? (Diferenciální signalizace – rušení naindukované do obou vodičů se na přijímači vzájemně odečte).
  - Limit 100 metrů pro metalický Ethernet.
  - Rozdíl SMF (9 um jádro, laser, dlouhé trasy) vs. MMF (50 um, LED, datacentra).
  - Výhody optiky: nulové vyzařování, 100% galvanické oddělení (žádné zemní smyčky a blesky), odolnost vůči odposlechu.

### Snímek 6: Pilíř 3 – Síťové protokoly
- **Cíl:** Pochopení konceptu protokolu jako formálního jazyka a pravidel.
- **Srovnání TCP vs. UDP:**
  - TCP: Spolehlivý, spojený (3-way handshake SYN/ACK), potvrzovaný, řazení paketů. Vhodný pro web, soubory, e-mail.
  - UDP: Nespojený, rychlý, bez garance doručení. Vhodný pro DNS dotazy, streaming videa a online hry.

### Snímek 7: Multiplexing v síťové komunikaci
- **Cíl:** Objasnění, jak může tisíc uživatelů komunikovat přes jedno fyzické vedení.
- **Interaktivní widget na slidu:** Žáci si přepínají TDM (časové sloty), FDM/WDM (spektrální kanály / barvy světla) a Statistické paketové multiplexování.
- **Klíčová myšlenka:** Paketové přepínání eliminuje plýtvání časovými sloty a je základním principem globálního Internetu.

### Snímek 8: Pilíř 4 – Zprávy, PDU a proces Enkapsulace
- **Cíl:** Dokonalé zvládnutí pojmů PDU (Protocol Data Unit).
- **Závazná tabulka pro žáky:**
  - Aplikační vrstva = **Data** (Payload)
  - Transportní vrstva = **Segment** (TCP) / **Datagram** (UDP)
  - Síťová vrstva = **Paket (Packet)**
  - Linková vrstva = **Rámec (Frame)**
  - Fyzická vrstva = **Bity (Bits)**
- **Interaktivní widget:** Kliknutím na vrstvu se žákům zobrazí reálné hlavičky (porty, IP, MAC adresy, FCS).

### Snímek 9: Referenční síťové modely: ISO/OSI vs. TCP/IP
- **Cíl:** Srovnání 7 vrstev ISO/OSI a 4/5 vrstev TCP/IP.
- **Mnemotechnická pomůcka:** *"Ať Přítel Radek Trpělivě Sbírá Luční Fialky"* (Aplikační, Prezenční, Relační, Transportní, Síťová, Linková, Fyzická).
- **Praktická poznámka:** ISO/OSI slouží jako teoretický referenční model pro výuku a certifikace, zatímco TCP/IP je skutečný protokolový stack, na kterém funguje Internet.

### Snímek 10: Shrnutí tématu a kontrolní otázky SPŠ
- **Cíl:** Upevnění a rekapitulace látky před praktickými laboratorními úlohami.
- Otázky pokrývají rozdíl L2 vs. L3, limity metaliky (100 m), přiřazení PDU a výhody paketového přepínání.

---

## Návaznost na další témata v předmětu POS

- **Téma 020: IP adresace a podsítě (IPv4 / IPv6)** – podrobný rozbor síťové vrstvy L3, binární logika, masky podsítě, VLSM a CIDR.
- **Téma 030: Přepínání v lokální síti (LAN Switching)** – detailní práce se switchem, CAM tabulka, VLANy a trunking 802.1Q.
- **Téma 040: Směrování a směrovače (Routing)** – statické směrování, dynamické protokoly OSPF a NAT překlad adres.
