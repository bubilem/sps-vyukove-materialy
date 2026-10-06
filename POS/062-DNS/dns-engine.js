/**
 * ==========================================================================
 * Téma 062: Protokol DNS - Interaktivní engine simulátoru překladu domén
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  const DNS_RECORDS_DATA = {
    A: {
      name: 'A záznam (Host IPv4 Address)',
      badge: 'Adresní záznam • IPv4',
      badgeColor: '#38bdf8',
      purpose: 'Základní a nejfrekventovanější záznam v DNS. Mapuje doménové jméno nebo subdoménu přímo na 32bitovou číselnou adresu IPv4.',
      examples: [
        {
          title: 'Ukázka 1: Základní webový server (Root zóny @ a subdoména www)',
          code: '; Mapování domény sps.cz a www.sps.cz na stejný webový server\n@              3600  IN  A  194.108.4.12\nwww.sps.cz.    3600  IN  A  194.108.4.12',
          explanation: 'Symbol @ zastupuje samotný kořen zóny (sps.cz.). Prohlížeč po zadání adresy bez www i s www získá IP adresu 194.108.4.12. TTL 3600 udává platnost 1 hodinu.'
        },
        {
          title: 'Ukázka 2: Rozložení zátěže (DNS Round-Robin Load Balancing)',
          code: '; Tři různé IP adresy pro jedno doménové jméno clusteru\napi.sps.cz.    300   IN  A  194.108.4.51\napi.sps.cz.    300   IN  A  194.108.4.52\napi.sps.cz.    300   IN  A  194.108.4.53',
          explanation: 'DNS server vrací v odpovědích seznam všech tří IP adres v rotujícím pořadí. Klienti se tak přirozeně připojují k různým serverům a zátěž se dělí.'
        },
        {
          title: 'Ukázka 3: Hvězdičkový zástupný záznam (Wildcard A)',
          code: '; Jakákoli neuvedená subdoména skončí na záložním rozcestníku\n*.sps.cz.      1800  IN  A  194.108.4.99',
          explanation: 'Pokud uživatel překlepem zadá např. neexistujici.sps.cz, DNS server vrátí IP 194.108.4.99, kde běží např. centrální informační rozcestník.'
        }
      ],
      fields: [
        { name: 'Vlastník (Name)', desc: 'FQDN jméno s koncovou tečkou (sps.cz.) nebo symbol @ (počátek zóny).' },
        { name: 'TTL', desc: 'Doba uložení v cache resolveru v sekundách (např. 3600 = 1 hodina).' },
        { name: 'Třída (Class)', desc: 'Internetová třída – prakticky výhradně IN.' },
        { name: 'Typ (Type)', desc: 'Identifikátor A (Address).' },
        { name: 'Hodnota (RDATA)', desc: 'Plná 32bitová IPv4 adresa v dekadickém tečkovém formátu.' }
      ],
      adminTip: 'Nezapomínejte na tečku na konci FQDN! Pokud napíšete "www.sps.cz" bez koncové tečky, BIND server k němu automaticky připojí název zóny a vznikne chybný záznam "www.sps.cz.sps.cz."'
    },
    AAAA: {
      name: 'AAAA záznam (Host IPv6 Address)',
      badge: 'Adresní záznam • IPv6',
      badgeColor: '#818cf8',
      purpose: 'Obdoba A záznamu pro moderní protokol IPv6. Přenáší 128bitovou hexadecimální adresu (tzv. Quad-A, protože 128 bitů je čtyřnásobek 32bitového A).',
      examples: [
        {
          title: 'Ukázka 1: Standardní webový server v IPv6 síti',
          code: '; Plná globální unicastová IPv6 adresa pro web\nwww.sps.cz.    3600  IN  AAAA  2001:db8:85a3:0000:0000:8a2e:0370:7334',
          explanation: 'Přiřazuje plnou 128bitovou IPv6 adresu. Zapisuje se v hexadecimálním formátu odděleném dvojtečkami.'
        },
        {
          title: 'Ukázka 2: Zkrácený zápis nul a loopback',
          code: '; Zkrácení po sobě jdoucích bloků nul dvojtečkou ::\nsps.cz.        3600  IN  AAAA  2001:db8::1\nrouter.sps.cz. 3600  IN  AAAA  2001:db8:fe10::100',
          explanation: 'Pro zjednodušení konfigurace lze v IPv6 nejdelší souvislou skupinu nulových bloků nahradit dvěma dvojtečkami (::).'
        },
        {
          title: 'Ukázka 3: Duální provoz (Dual-Stack IPv4 + IPv6)',
          code: '; Stejné doménové jméno má současně A i AAAA záznam\nportal.sps.cz. 3600  IN  A     194.108.4.55\nportal.sps.cz. 3600  IN  AAAA  2001:db8:acad::55',
          explanation: 'Klient s podporou IPv6 preferuje AAAA záznam. Pokud IPv6 selže, algoritmus Happy Eyeballs v prohlížeči bleskově přepne na IPv4 adresu.'
        }
      ],
      fields: [
        { name: 'Vlastník', desc: 'Doménové jméno uzlu v zóně.' },
        { name: 'TTL / Třída', desc: 'Čas vypršení v mezipaměti / Třída IN.' },
        { name: 'Typ', desc: 'AAAA (IPv6 Address).' },
        { name: 'Hodnota', desc: '128bitová IPv6 adresa (např. 2001:db8::1).' }
      ],
      adminTip: 'V moderních sítích vždy konfigurujte současně A i AAAA záznamy (Dual-Stack), aby stanice s nativní IPv6 konektivitou nebyly nuceny procházet přes NAT64 překladače.'
    },
    CNAME: {
      name: 'CNAME záznam (Canonical Name)',
      badge: 'Alias • Přesměrování',
      badgeColor: '#34d399',
      purpose: 'Definuje kanonické jméno (alias). Umožňuje odkázat jedno doménové jméno na jiné existující jméno, které už má své vlastní adresní záznamy.',
      examples: [
        {
          title: 'Ukázka 1: Běžný alias www na kořenovou doménu',
          code: '; sps.cz je kanonický cíl, www je pouze alias\nsps.cz.        3600  IN  A      194.108.4.12\nwww.sps.cz.    3600  IN  CNAME  sps.cz.',
          explanation: 'Pokud se změní IP adresa serveru, stačí změnit jediný A záznam u sps.cz. Záznam www.sps.cz automaticky ukáže na novou IP bez nutnosti úprav.'
        },
        {
          title: 'Ukázka 2: Propojení subdomény na externí cloud / CDN',
          code: '; Směrování médií na obsahovou distribuční síť (CloudFront/Cloudflare)\ncdn.sps.cz.    1800  IN  CNAME  d123456abcdef.cloudfront.net.',
          explanation: 'Umožňuje delegovat provoz celé subdomény na externí službu, jejíž IP adresy se dynamicky mění na základě geolokace návštěvníka.'
        },
        {
          title: 'Ukázka 3: Subdoména pro dokumentaci na GitHub Pages',
          code: '; Školní dokumentační web hostovaný na GitHubu\ndocs.sps.cz.   3600  IN  CNAME  sps-skola.github.io.',
          explanation: 'Uživatel zadá docs.sps.cz, DNS resolver přeloží CNAME na sps-skola.github.io a následně přeloží jeho finální IP adresu.'
        }
      ],
      fields: [
        { name: 'Alias jméno', desc: 'Subdoména, pro kterou alias vytváříme (např. www.sps.cz.).' },
        { name: 'TTL / Třída', desc: 'Platnost v sekundách / Třída IN.' },
        { name: 'Typ', desc: 'CNAME.' },
        { name: 'Kanonický cíl', desc: 'Cílové FQDN jméno zakončené tečkou (nikdy ne číselná IP adresa!).' }
      ],
      adminTip: 'ZÁKAZ CNAME NA APEXU (RFC 1034): CNAME nesmí existovat na kořeni domény (sps.cz.), protože CNAME vylučuje jakýkoli jiný záznam stejného jména (znemožnil by existenci SOA, NS a MX!). Na apexu používejte A/AAAA nebo technologie ALIAS/ANAME.'
    },
    MX: {
      name: 'MX záznam (Mail Exchange)',
      badge: 'Poštovní směrování',
      badgeColor: '#f59e0b',
      purpose: 'Určuje poštovní servery (MTA) pověřené přijímat elektronickou poštu pro celou doménu, včetně celočíselné priority doručení.',
      examples: [
        {
          title: 'Ukázka 1: Primární a záložní firemní poštovní server',
          code: '; sps.cz přijímá poštu na dvou serverech s různou prioritou\nsps.cz.        3600  IN  MX  10  mail1.sps.cz.\nsps.cz.        3600  IN  MX  20  mail2.sps.cz.\nmail1.sps.cz.  3600  IN  A   194.108.4.25\nmail2.sps.cz.  3600  IN  A   194.108.4.26',
          explanation: 'Odesílající SMTP server se pokusí doručit e-mail na server s nejnižším číslem priority (10). Pokud je mail1 nedostupný, doručí zprávu na záložní mail2 (priorita 20).'
        },
        {
          title: 'Ukázka 2: Cloudová pošta Google Workspace (Gmail)',
          code: '; Skupina MX serverů společnosti Google s prioritami\nsps.cz.        3600  IN  MX  1   aspmx.l.google.com.\nsps.cz.        3600  IN  MX  5   alt1.aspmx.l.google.com.\nsps.cz.        3600  IN  MX  5   alt2.aspmx.l.google.com.\nsps.cz.        3600  IN  MX  10  alt3.aspmx.l.google.com.',
          explanation: 'Typická konfigurace školního cloudu. Servery se stejnou prioritou (5) si dělí zátěž přirozeným náhodným výběrem.'
        },
        {
          title: 'Ukázka 3: Microsoft 365 (Exchange Online)',
          code: '; Směrování školní pošty do Microsoft cloudu\nsps.cz.        3600  IN  MX  0   sps-cz.mail.protection.outlook.com.',
          explanation: 'Priorita 0 je nejvyšší možná hodnota. Všechny příchozí e-maily jsou směřovány přímo na bránu Exchange Online Protection.'
        }
      ],
      fields: [
        { name: 'Vlastník', desc: 'Doména, pro kterou pošta platí (např. sps.cz).' },
        { name: 'Priorita (Pref)', desc: 'Celé číslo 0 až 65535. Nižší číslo = vyšší přednost doručení.' },
        { name: 'Typ', desc: 'MX.' },
        { name: 'Cílový host', desc: 'FQDN jméno mailserveru (POZOR: musí mít A/AAAA záznam, nikdy CNAME!).' }
      ],
      adminTip: 'Cíl MX záznamu nesmí být nikdy CNAME alias (porušení RFC 2181 a RFC 5321). Vždy musí ukazovat na doménové jméno, které má přímý A/AAAA záznam!'
    },
    NS: {
      name: 'NS záznam (Name Server)',
      badge: 'Delegace autority',
      badgeColor: '#ec4899',
      purpose: 'Deleguje pravomoc nad zónou na konkrétní autoritativní DNS servery. Říká zbytku světa, které servery mají definitivní a pravdivá data o doméně.',
      examples: [
        {
          title: 'Ukázka 1: Autoritativní servery pro celou doménu',
          code: '; Zóna sps.cz je obsluhována dvěma autoritativními servery\nsps.cz.        86400  IN  NS  ns1.sps.cz.\nsps.cz.        86400  IN  NS  ns2.sps.cz.',
          explanation: 'Světové rekurzivní resolvery se budou ptát ns1 nebo ns2. TTL 86400 (24 hodin) zajišťuje stabilitu při zátěži.'
        },
        {
          title: 'Ukázka 2: Glue Records (Lepidlové záznamy u registrátora)',
          code: '; V zóně .cz (CZ.NIC) musí být NS i doprovodný A záznam\nsps.cz.        IN  NS  ns1.sps.cz.\nns1.sps.cz.    IN  A   194.108.4.2',
          explanation: 'Pokud jmenný server leží uvnitř domény, kterou sám obsluhuje (ns1.sps.cz v sps.cz), vzniká cyklus slepice a vejce. Nadřazená zóna .cz proto musí obsahovat i "lepidlovou" IP adresu.'
        },
        {
          title: 'Ukázka 3: Delegace samostatné subdomény (např. studentská laboratoř)',
          code: '; Správa subdomény lab.sps.cz je předána serveru studentů\nlab.sps.cz.    3600   IN  NS  ns.studenti-lab.cz.',
          explanation: 'Školní DNS server nemusí znát jednotlivé počítače v laboratorní síti. Jakýkoli dotaz na *.lab.sps.cz přeposílá na server ns.studenti-lab.cz.'
        }
      ],
      fields: [
        { name: 'Zóna', desc: 'Doménová zóna nebo subdoména (např. sps.cz. nebo lab.sps.cz.).' },
        { name: 'TTL / Třída', desc: 'Typicky vysoké TTL (86400 = 24 h) kvůli stabilitě / Třída IN.' },
        { name: 'Typ', desc: 'NS.' },
        { name: 'Jmenný server', desc: 'FQDN jméno autoritativního serveru (např. ns1.sps.cz.).' }
      ],
      adminTip: 'Pravidlo redundance: Každá doména musí mít minimálně 2 nezávislé NS servery. Správci národních domén (CZ.NIC) dokonce vyžadují, aby servery ležely v odlišných autonomních systémech (AS) a různých IP podsítích.'
    },
    PTR: {
      name: 'PTR záznam (Pointer / Reverse DNS)',
      badge: 'Reverzní překlad IP -> Host',
      badgeColor: '#10b981',
      purpose: 'Zajišťuje zpětný (reverzní) překlad IP adresy na doménové jméno. Ukládá se do speciálních domén in-addr.arpa (IPv4) a ip6.arpa (IPv6).',
      examples: [
        {
          title: 'Ukázka 1: Reverzní překlad IPv4 adresy',
          code: '; Překlad IP 194.108.4.25 zpět na název mail.sps.cz\n25.4.108.194.in-addr.arpa.  3600  IN  PTR  mail.sps.cz.',
          explanation: 'Oktety IPv4 adresy se zapisují v přesně obráceném pořadí (od hostitele k síti) pod doménou in-addr.arpa. Tím se využívá hierarchické větvení DNS stromu.'
        },
        {
          title: 'Ukázka 2: Reverzní překlad IPv6 adresy',
          code: '; Překlad IPv6 adresy 2001:db8::25 v zóně ip6.arpa\n5.2.0.0.0.0.0.0...8.b.d.0.1.0.0.2.ip6.arpa.  IN  PTR  web.sps.cz.',
          explanation: 'U IPv6 se každá jednotlivá hexadecimální číslice stává subdoménou v obráceném pořadí s příponou .ip6.arpa.'
        },
        {
          title: 'Ukázka 3: Antispamová kontrola FCrDNS (Forward Confirmed Reverse DNS)',
          code: '; Dopředný A záznam:\nmail.sps.cz.                IN  A    194.108.4.25\n; Reverzní PTR záznam:\n25.4.108.194.in-addr.arpa.  IN  PTR  mail.sps.cz.',
          explanation: 'Přijímající mailserver provede reverzní dotaz na IP odesílatele a ověří, zda se vrácené jméno po dalším dopředném dotazu přeloží zpět na tutéž IP. Pokud ano, identita je potvrzena.'
        }
      ],
      fields: [
        { name: 'Obrácená IP', desc: 'IP adresa s obrácenými oktety + .in-addr.arpa (např. 25.4.108.194.in-addr.arpa.).' },
        { name: 'TTL / Třída', desc: 'Platnost v sekundách / Třída IN.' },
        { name: 'Typ', desc: 'PTR.' },
        { name: 'Kanonické jméno', desc: 'FQDN jméno serveru zakončené tečkou (např. mail.sps.cz.).' }
      ],
      adminTip: 'Správu reverzních zón (.in-addr.arpa) nespravuje registrátor domény, ale poskytovatel internetového připojení (ISP / LIR), kterému daný IP rozsah patří. Musíte požádat svého ISP o delegaci nebo nastavení PTR.'
    },
    TXT: {
      name: 'TXT záznam (Text Data / SPF, DKIM, DMARC)',
      badge: 'Textová metadata • Antispam',
      badgeColor: '#a855f7',
      purpose: 'Umožňuje vložit libovolný textový řetězec do DNS. Původně určen pro poznámky, dnes je klíčovým pilířem e-mailové bezpečnosti a ověřování domén.',
      examples: [
        {
          title: 'Ukázka 1: SPF záznam (Sender Policy Framework)',
          code: '; Kdo smí odesílat e-maily ze jména domény @sps.cz\nsps.cz.  3600  IN  TXT  "v=spf1 ip4:194.108.4.25 include:_spf.google.com -all"',
          explanation: 'Říká světu: E-maily z domény sps.cz smí odesílat pouze náš server 194.108.4.25 a servery Google. Jakýkoli jiný odesílatel musí být tvrdě odmítnut (-all).'
        },
        {
          title: 'Ukázka 2: DKIM klíč (DomainKeys Identified Mail)',
          code: '; Veřejný kryptografický klíč pro ověření digitálního podpisu e-mailů\ngmail._domainkey.sps.cz.  3600  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ..."',
          explanation: 'Odesílající mailserver podepíše hlavičku e-mailu privátním klíčem. Příjemce si stáhne veřejný klíč z TXT záznamu a ověří, že zpráva nebyla cestou podvržena.'
        },
        {
          title: 'Ukázka 3: DMARC bezpečnostní politika a reporting',
          code: '; Pravidla chování při selhání SPF nebo DKIM\n_dmarc.sps.cz.  3600  IN  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-reports@sps.cz; pct=100"',
          explanation: 'Příkaz p=reject nařizuje příjemcům zahodit jakýkoli podvržený e-mail s naší doménou a zaslat statistický report na adresu dmarc-reports@sps.cz.'
        },
        {
          title: 'Ukázka 4: Ověření vlastnictví domény (Domain Verification Token)',
          code: '; Ověření vlastnictví v Google Search Console / Microsoft 365\nsps.cz.  3600  IN  TXT  "google-site-verification=AbCdEf1234567890XYZ"',
          explanation: 'Cloudová služba vygeneruje unikátní token. Přidáním tohoto TXT záznamu správce prokáže, že má plnou kontrolu nad doménou.'
        }
      ],
      fields: [
        { name: 'Vlastník', desc: 'Doména nebo selektor (např. sps.cz., _dmarc.sps.cz., selector._domainkey.sps.cz.).' },
        { name: 'TTL / Třída', desc: 'Platnost v sekundách / Třída IN.' },
        { name: 'Typ', desc: 'TXT.' },
        { name: 'Textový obsah', desc: 'Řetězec v uvozovkách (např. "v=spf1 ..."). Text delší než 255 B se skládá z více bloků.' }
      ],
      adminTip: 'Doména smí mít pouze JEDINÝ SPF záznam (začínající "v=spf1")! Pokud potřebujete přidat další mailserver, použijte parametr include: nebo ip4: uvnitř stávajícího záznamu. Dva SPF záznamy vedou k vyhodnocení PermError a penalizaci zpráv.'
    },
    SOA: {
      name: 'SOA záznam (Start of Authority)',
      badge: 'Počátek autority zóny',
      badgeColor: '#f43f5e',
      purpose: 'Povinný první záznam každého zónového souboru. Obsahuje základní parametry zóny, kontakt na správce a časovače pro replikaci mezi primárním a sekundárním serverem.',
      examples: [
        {
          title: 'Kompletní autoritativní blok zóny s parametry replikace',
          code: '; Autoritativní zónový počátek pro doménu sps.cz\nsps.cz.   IN   SOA   ns1.sps.cz.  admin.sps.cz. (\n               2026100701   ; Serial: verze zóny (RRRRMMDDnn)\n               7200         ; Refresh: kontrola změn každé 2 hodiny\n               3600         ; Retry: opakování při výpadku po 1 hodině\n               1209600      ; Expire: platnost dat na sekundáru (14 dní)\n               3600 )       ; Minimum TTL: negativní cache NXDOMAIN (1 h)',
          explanation: 'Definuje primární jmenný server ns1.sps.cz a e-mail správce admin@sps.cz (zavináč nahrazen tečkou: admin.sps.cz.). Časovače v závorkách řídí zónové transfery AXFR/IXFR.'
        }
      ],
      fields: [
        { name: 'Primary Master', desc: 'ns1.sps.cz. – hlavní zdrojový server zóny.' },
        { name: 'Responsible Person', desc: 'admin.sps.cz. – e-mail správce (zavináč @ je nahrazen tečkou!).' },
        { name: 'Serial Number', desc: 'Číslo verze zóny. Zvýšení čísla spouští replikaci (AXFR) na sekundární servery.' },
        { name: 'Refresh', desc: 'Jak často se sekundární server dotazuje primárního na změnu Serial.' },
        { name: 'Retry', desc: 'Jak rychle sekundární server zopakuje pokus, pokud byl primární nedostupný.' },
        { name: 'Expire', desc: 'Po jaké době nedostupnosti primárního serveru přestane sekundární odpovídat.' },
        { name: 'Minimum (Negative TTL)', desc: 'Jak dlouho si resolvery smí pamatovat negativní odpověď (doména neexistuje - NXDOMAIN).' }
      ],
      adminTip: 'Při každé změně v zónovém souboru MUSÍTE zvýšit sériové číslo (Serial)! Pokud na to zapomenete, sekundární servery změnu nezaznamenají a budou dál šířit staré záznamy.'
    },
    SRV: {
      name: 'SRV záznam (Service Record)',
      badge: 'Lokalizace síťové služby',
      badgeColor: '#06b6d4',
      purpose: 'Umožňuje lokalizovat konkrétní síťovou službu, protokol a nestandardní port, na kterém server běží. Klíčové pro VoIP (SIP), Active Directory (LDAP/Kerberos) a herní servery.',
      examples: [
        {
          title: 'Ukázka 1: VoIP telefonní ústředna (SIP protokol)',
          code: '; Služba SIP běží nad TCP na portu 5060\n_sip._tcp.sps.cz.  3600  IN  SRV  10  60  5060  sipserver.sps.cz.',
          explanation: 'Formát názvu: _služba._protokol.doména. Priorita je 10, váha 60, port 5060 a cílový server sipserver.sps.cz. IP telefon se automaticky připojí na správný port.'
        },
        {
          title: 'Ukázka 2: Herní server (např. Minecraft)',
          code: '; Minecraft server na nestandardním portu 25565\n_minecraft._tcp.mc.sps.cz.  3600  IN  SRV  0  5  25565  game-node1.sps.cz.',
          explanation: 'Hráč zadá do klienta pouze mc.sps.cz bez zadávání dvojtečky a portu. Herní klient si přes SRV záznam sám zjistí port 25565 i cílový stroj.'
        },
        {
          title: 'Ukázka 3: Vyhledání doménového řadiče Active Directory (LDAP)',
          code: '; Klientské stanice Windows hledají nejbližší doménový řadič DC\n_ldap._tcp.dc._msdcs.firma.local.  600  IN  SRV  0  100  389  dc01.firma.local.',
          explanation: 'Klíčový mechanismus podnikových sítí Windows. Stanice dynamicky vyhledá dostupné autentizační servery LDAP a Kerberos.'
        }
      ],
      fields: [
        { name: '_služba._protokol', desc: 'Symbolické jméno služby a přenosového protokolu (např. _sip._tcp).' },
        { name: 'Priorita', desc: 'Nižší hodnota = vyšší priorita (stejný princip jako u MX).' },
        { name: 'Váha (Weight)', desc: 'Relativní váha pro rozdělení zátěže mezi servery se stejnou prioritou.' },
        { name: 'Port', desc: 'Číslo TCP nebo UDP portu, na kterém služba skutečně naslouchá.' },
        { name: 'Cílový hostitel', desc: 'Kanonické FQDN jméno cílového serveru (musí mít A/AAAA záznam).' }
      ],
      adminTip: 'SRV záznam elegantně řeší situaci, kdy služba neběží na výchozím portu. Uživatel si nemusí pamatovat čísla portů ani IP adresy serverů.'
    }
  };

  function initDnsSimulator() {
    const domainSelect = document.getElementById('dnsDomainSelect');
    const btnStep = document.getElementById('btnDnsStep');
    const btnReset = document.getElementById('btnDnsReset');
    const flowTrack = document.getElementById('dnsFlowTrack');
    const logWrap = document.getElementById('dnsLogWrap');
    const resultBox = document.getElementById('dnsResultBox');

    const nodes = {
      client: document.getElementById('nodeClient'),
      resolver: document.getElementById('nodeResolver'),
      root: document.getElementById('nodeRoot'),
      tld: document.getElementById('nodeTld'),
      auth: document.getElementById('nodeAuth')
    };

    if (!domainSelect || !btnStep || !flowTrack) return;

    let currentStep = 0; // 0=init, 1=client->res, 2=res->root, 3=res->tld, 4=res->auth, 5=res->client

    const SCENARIOS = {
      'portal.sps.cz': {
        ip: '194.108.4.55',
        tld: '.cz (CZ.NIC)',
        auth: 'ns1.sps.cz'
      },
      'mail.google.com': {
        ip: '142.250.186.165',
        tld: '.com (Verisign)',
        auth: 'ns1.google.com'
      },
      'api.github.com': {
        ip: '140.82.121.6',
        tld: '.com (Verisign)',
        auth: 'ns1.github.net'
      }
    };

    function resetNodes() {
      Object.values(nodes).forEach(n => {
        if (n) n.classList.remove('active');
      });
    }

    function addLog(stepText) {
      if (!logWrap) return;
      const entry = document.createElement('div');
      entry.style.padding = '0.2rem 0';
      entry.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      entry.innerHTML = stepText;
      logWrap.prepend(entry);
    }

    function resetSimulation() {
      currentStep = 0;
      resetNodes();
      if (nodes.client) nodes.client.classList.add('active');
      flowTrack.textContent = 'Klikněte na „Další krok resolvingu“ pro zahájení překladu domény.';
      if (resultBox) resultBox.textContent = 'Čekání na spuštění dotazu...';
    }

    btnStep.addEventListener('click', () => {
      const domain = domainSelect.value;
      const data = SCENARIOS[domain];

      currentStep++;
      resetNodes();

      if (currentStep === 1) {
        // Klient -> Resolver
        if (nodes.client) nodes.client.classList.add('active');
        if (nodes.resolver) nodes.resolver.classList.add('active');
        flowTrack.textContent = `Krok 1: Klient posílá rekurzivní dotaz na Resolver (8.8.8.8): „Jaká je IP pro ${domain}?“`;
        addLog(`<span style="color:#60a5fa;">[Klient &rarr; Resolver]</span> Rekurzivní dotaz na <strong>${domain}</strong>`);
      } else if (currentStep === 2) {
        // Resolver -> Root
        if (nodes.resolver) nodes.resolver.classList.add('active');
        if (nodes.root) nodes.root.classList.add('active');
        flowTrack.textContent = `Krok 2: Resolver se ptá Kořenového serveru (.): „Neznám ${domain}, ale pošli dotaz na TLD server ${data.tld}.“`;
        addLog(`<span style="color:#c084fc;">[Resolver &rarr; Root .]</span> Iterativní dotaz &rarr; Návrat delegace na TLD`);
      } else if (currentStep === 3) {
        // Resolver -> TLD
        if (nodes.resolver) nodes.resolver.classList.add('active');
        if (nodes.tld) nodes.tld.classList.add('active');
        flowTrack.textContent = `Krok 3: Resolver se ptá TLD serveru ${data.tld}: „Kdo spravuje ${domain}?“ Odpověď: „Autoritativní server ${data.auth}!“`;
        addLog(`<span style="color:#22d3ee;">[Resolver &rarr; TLD]</span> Iterativní dotaz &rarr; Návrat NS záznamu <strong>${data.auth}</strong>`);
      } else if (currentStep === 4) {
        // Resolver -> Autoritativní server
        if (nodes.resolver) nodes.resolver.classList.add('active');
        if (nodes.auth) nodes.auth.classList.add('active');
        flowTrack.textContent = `Krok 4: Resolver se ptá Autoritativního serveru ${data.auth}: Odpověď A záznamu: ${domain} = ${data.ip} (TTL 3600s)!`;
        addLog(`<span style="color:#34d399;">[Resolver &rarr; Auth NS]</span> Přímá autoritativní odpověď &rarr; <strong>A = ${data.ip}</strong>`);
      } else if (currentStep === 5) {
        // Resolver -> Klient
        if (nodes.resolver) nodes.resolver.classList.add('active');
        if (nodes.client) nodes.client.classList.add('active');
        flowTrack.textContent = `Krok 5: Resolver předává odpověď klientovi a ukládá záznam do své vyrovnávací paměti (DNS Cache).`;
        addLog(`<span style="color:#34d399;">[Resolver &rarr; Klient]</span> Úspěšný překlad dokončen: <strong>${data.ip}</strong>`);
        if (resultBox) {
          resultBox.innerHTML = `<strong style="color:#34d399;">Překlad úspěšný!</strong> ${domain} &rarr; <span style="font-family:var(--font-mono); color:#fff; font-size:1.1rem; padding:0.2rem 0.5rem; background:rgba(59,130,246,0.2); border-radius:4px;">${data.ip}</span> (Záznam uložen v DNS Cache na 3600 s)`;
        }
      } else {
        resetSimulation();
      }
    });

    if (btnReset) btnReset.addEventListener('click', resetSimulation);
    domainSelect.addEventListener('change', resetSimulation);

    resetSimulation();
  }

  // Interaktivní inspektor typů DNS záznamů s detailními scénáři a vysvětlením
  function initDnsRecordViewer() {
    const buttons = document.querySelectorAll('.dns-record-btn');
    const container = document.getElementById('dnsInspectorContainer');

    if (buttons.length === 0 || !container) return;

    let currentRecordKey = 'A';
    let currentScenarioIdx = 0;

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function highlightBindSyntax(rawCode) {
      const lines = rawCode.split('\n');
      return lines.map(line => {
        let codePart = line;
        let commentPart = '';
        const semiIdx = line.indexOf(';');
        if (semiIdx !== -1) {
          codePart = line.substring(0, semiIdx);
          commentPart = line.substring(semiIdx);
        }

        let highlightedCode = '';
        if (codePart.trim().length > 0) {
          const tokens = codePart.split(/("[^"]*"|\s+|[()])/g);
          highlightedCode = tokens.map(tok => {
            if (!tok) return '';
            if (tok.startsWith('"') && tok.endsWith('"')) {
              return `<span class="dns-hl-string">${escapeHtml(tok)}</span>`;
            }
            if (/^(A|AAAA|CNAME|MX|NS|PTR|TXT|SOA|SRV)$/.test(tok)) {
              return `<span class="dns-hl-type">${escapeHtml(tok)}</span>`;
            }
            if (tok === 'IN') {
              return `<span class="dns-hl-class">${escapeHtml(tok)}</span>`;
            }
            if (/^\d+$/.test(tok)) {
              return `<span class="dns-hl-num">${escapeHtml(tok)}</span>`;
            }
            if (tok === '(' || tok === ')') {
              return `<span class="dns-hl-paren">${escapeHtml(tok)}</span>`;
            }
            return escapeHtml(tok);
          }).join('');
        } else {
          highlightedCode = escapeHtml(codePart);
        }

        if (commentPart) {
          return `${highlightedCode}<span class="dns-hl-comment">${escapeHtml(commentPart)}</span>`;
        }
        return highlightedCode;
      }).join('\n');
    }

    function render() {
      const data = DNS_RECORDS_DATA[currentRecordKey];
      if (!data) return;

      const totalScenarios = data.examples.length;
      if (currentScenarioIdx >= totalScenarios) {
        currentScenarioIdx = 0;
      }
      const activeExample = data.examples[currentScenarioIdx];

      let scenarioNavHtml = '';
      if (totalScenarios > 1) {
        scenarioNavHtml = `
          <div class="dns-scenario-nav">
            ${data.examples.map((ex, idx) => `
              <button class="dns-scenario-btn ${idx === currentScenarioIdx ? 'active' : ''}" data-idx="${idx}">
                ${ex.title}
              </button>
            `).join('')}
          </div>
        `;
      } else {
        scenarioNavHtml = `
          <div style="font-size: 0.84rem; font-weight: 700; color: #38bdf8; margin-top: 0.2rem;">
            ${activeExample.title}
          </div>
        `;
      }

      const highlightedCode = highlightBindSyntax(activeExample.code);

      const fieldsHtml = data.fields.map(f => `
        <tr>
          <td class="field-name">${f.name}</td>
          <td>${f.desc}</td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="dns-inspector-header">
          <div>
            <div class="dns-record-title">
              <span>${data.name}</span>
              <span class="badge" style="background: rgba(59, 130, 246, 0.15); color: ${data.badgeColor}; border: 1px solid ${data.badgeColor}; font-size: 0.72rem;">${data.badge}</span>
            </div>
            <p class="dns-record-purpose">${data.purpose}</p>
          </div>
        </div>

        <!-- Přepínač scénářů / ukázek -->
        ${scenarioNavHtml}

        <!-- Plnošířkové okno se zdrojovým kódem -->
        <div class="dns-code-window">
          <div class="dns-code-topbar">
            <span>db.sps.cz &ndash; Zónový soubor BIND (RFC 1035)</span>
            <span style="color: #38bdf8; font-weight: 600;">Ukázka ${currentScenarioIdx + 1} z ${totalScenarios}</span>
          </div>
          <pre class="dns-code-content">${highlightedCode}</pre>
        </div>

        <!-- Dvousloupcový didaktický rozbor pod kódem -->
        <div class="dns-explanation-grid">
          <!-- Levý panel: Didaktické vysvětlení scénáře -->
          <div class="dns-card-panel">
            <div class="dns-panel-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Jak tato konfigurace funguje v síti:
            </div>
            <div class="dns-explanation-text">
              ${activeExample.explanation}
            </div>
          </div>

          <!-- Pravý panel: Struktura polí a doporučení ze síťové praxe -->
          <div class="dns-card-panel">
            <div class="dns-panel-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              Parametry a administrátorské pravidlo:
            </div>
            <table class="dns-fields-table">
              <tbody>
                ${fieldsHtml}
              </tbody>
            </table>
            <div class="dns-tip-box" style="margin-top: 0.35rem;">
              <strong>Best Practice:</strong> ${data.adminTip}
            </div>
          </div>
        </div>
      `;

      const scenarioBtns = container.querySelectorAll('.dns-scenario-btn');
      scenarioBtns.forEach(sBtn => {
        sBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentScenarioIdx = parseInt(sBtn.dataset.idx, 10) || 0;
          render();
        });
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRecordKey = btn.dataset.record;
        currentScenarioIdx = 0;
        render();
      });
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDnsSimulator();
      initDnsRecordViewer();
    });
  } else {
    initDnsSimulator();
    initDnsRecordViewer();
  }
})();
