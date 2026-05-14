'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LineType = 'input' | 'output' | 'error' | 'system';

interface TerminalLine {
  id: number;
  text: string;
  type: LineType;
}

// ---------------------------------------------------------------------------
// Command outputs
// ---------------------------------------------------------------------------

const IPCONFIG_OUTPUT = `Windows IP Configuration

Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : certquest.local
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Ethernet adapter Loopback Pseudo-Interface 1:
   Connection-specific DNS Suffix  . :
   IPv6 Address. . . . . . . . . . . : ::1
   IPv4 Address. . . . . . . . . . . : 127.0.0.1
   Subnet Mask . . . . . . . . . . . : 255.0.0.0
   Default Gateway . . . . . . . . . :`;

const IFCONFIG_OUTPUT = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 18432  bytes 14729812 (14.7 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 9821  bytes 1394720 (1.3 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 2341  bytes 209891 (209.8 KB)
        TX packets 2341  bytes 209891 (209.8 KB)`;

function pingOutput(target: string): string {
  const rtt = target === '192.168.1.1' ? '1' : '12';
  return `Pinging ${target} with 32 bytes of data:
Reply from ${target}: bytes=32 time=${rtt}ms TTL=64
Reply from ${target}: bytes=32 time=${rtt}ms TTL=64
Reply from ${target}: bytes=32 time=${rtt}ms TTL=64
Reply from ${target}: bytes=32 time=${rtt}ms TTL=64

Ping statistics for ${target}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = ${rtt}ms, Maximum = ${rtt}ms, Average = ${rtt}ms`;
}

const TRACEROUTE_OUTPUT = `traceroute to 8.8.8.8, 30 hops max, 60 byte packets
 1  192.168.1.1 (192.168.1.1)  1.203 ms  1.084 ms  1.023 ms
 2  10.0.0.1 (10.0.0.1)  8.417 ms  8.329 ms  8.244 ms
 3  8.8.8.8 (8.8.8.8)  12.581 ms  12.491 ms  12.403 ms`;

const NSLOOKUP_OUTPUT = `Server:         192.168.1.1
Address:        192.168.1.1#53

Non-authoritative answer:
Name:   google.com
Address: 142.250.80.46
Name:   google.com
Address: 142.250.80.78`;

const NETSTAT_OUTPUT = `Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING
  TCP    192.168.1.100:49152    142.250.80.46:443      ESTABLISHED
  TCP    192.168.1.100:49153    104.16.85.20:443       ESTABLISHED
  TCP    192.168.1.100:49154    13.107.42.14:443       TIME_WAIT
  UDP    0.0.0.0:53             *:*
  UDP    0.0.0.0:67             *:*`;

const ARP_OUTPUT = `Interface: 192.168.1.100 --- 0x3
  Internet Address      Physical Address      Type
  192.168.1.1           00-50-56-c0-00-01     dynamic
  192.168.1.101         00-0c-29-ab-cd-ef     dynamic
  192.168.1.255         ff-ff-ff-ff-ff-ff     static
  224.0.0.22            01-00-5e-00-00-16     static
  255.255.255.255       ff-ff-ff-ff-ff-ff     static`;

const ROUTE_PRINT_OUTPUT = `===========================================================================
Interface List
  3...08 00 27 4e 66 a1 ......Ethernet0
  1...........................Software Loopback Interface 1
===========================================================================

IPv4 Route Table
===========================================================================
Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
          0.0.0.0          0.0.0.0      192.168.1.1  192.168.1.100      25
        127.0.0.0        255.0.0.0         On-link       127.0.0.1     331
        127.0.0.1  255.255.255.255         On-link       127.0.0.1     331
      192.168.1.0    255.255.255.0         On-link   192.168.1.100     281
    192.168.1.100  255.255.255.255         On-link   192.168.1.100     281
    192.168.1.255  255.255.255.255         On-link   192.168.1.100     281
        224.0.0.0        240.0.0.0         On-link       127.0.0.1     331
  255.255.255.255  255.255.255.255         On-link       127.0.0.1     331
===========================================================================`;

const IP_ROUTE_OUTPUT = `default via 192.168.1.1 dev eth0 proto static metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100
192.168.1.1 dev eth0 proto static scope link metric 100`;

// CCNA-specific outputs
const SHOW_IP_INT_BRIEF = `Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0        192.168.1.100   YES NVRAM  up                    up
GigabitEthernet0/1        unassigned      YES NVRAM  administratively down down
Loopback0                 10.0.0.1        YES NVRAM  up                    up`;

const SHOW_IP_ROUTE = `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2

Gateway of last resort is 192.168.1.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 192.168.1.1
      10.0.0.0/32 is subnetted, 1 subnets
C        10.0.0.1/32 is directly connected, Loopback0
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/0
L        192.168.1.100/32 is directly connected, GigabitEthernet0/0`;

const SHOW_RUNNING_CONFIG = `Building configuration...

Current configuration : 1124 bytes
!
version 15.7
service timestamps debug datetime msec
service timestamps log datetime msec
!
hostname Router1
!
boot-start-marker
boot-end-marker
!
enable secret 5 $1$mERr$3kHDzMy9TlCCfTEKS5P3F/
!
no aaa new-model
!
interface Loopback0
 ip address 10.0.0.1 255.255.255.255
!
interface GigabitEthernet0/0
 description LAN Interface
 ip address 192.168.1.100 255.255.255.0
 duplex auto
 speed auto
 media-type rj45
!
interface GigabitEthernet0/1
 no ip address
 shutdown
 duplex auto
 speed auto
 media-type rj45
!
ip route 0.0.0.0 0.0.0.0 192.168.1.1
!
line con 0
 logging synchronous
line aux 0
line vty 0 4
 password cisco
 login
 transport input telnet ssh
!
end`;

const SHOW_VERSION = `Cisco IOS Software, Version 15.7(3)M3, RELEASE SOFTWARE (fc2)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2018 by Cisco Systems, Inc.
Compiled Wed 21-Nov-18 05:32 by prod_rel_team

ROM: System Bootstrap, Version 15.6(3r)T, RELEASE SOFTWARE

Router1 uptime is 2 days, 14 hours, 33 minutes
System returned to ROM by power-on
System image file is "flash:c2900-universalk9-mz.SPA.157-3.M3.bin"

Cisco CISCO2901/K9 (revision 1.0) with 483328K/40960K bytes of memory.
Processor board ID FCZ1852C0MJ

2 Gigabit Ethernet interfaces
1 terminal line
1 Virtual Private Network (VPN) Module
256K bytes of non-volatile configuration memory.
2000640K bytes of ATA System CompactFlash 0 (Read/Write)

License Info:

License UDI:
-------------------------------------------------
Device#   PID                   SN
-------------------------------------------------
*0        CISCO2901/K9          FCZ1852C0MJ

Technology Package License Information for Module:'c2900'

-----------------------------------------------------------------
Technology    Technology-package           Technology-package
              Current       Type           Next reboot
-----------------------------------------------------------------
ipbase        ipbasek9      Permanent      ipbasek9
data          datak9        Permanent      datak9

Configuration register is 0x2102`;

const SHOW_VLAN_BRIEF = `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/1, Gi0/2, Gi0/3
10   MGMT                             active    Gi0/0
20   DATA                             active    Gi0/4, Gi0/5
30   VOICE                            active    Gi0/6, Gi0/7
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`;

const SHOW_INT_GIG00 = `GigabitEthernet0/0 is up, line protocol is up
  Hardware is CN Gigabit Ethernet, address is c201.04d4.0000 (bia c201.04d4.0000)
  Description: LAN Interface
  Internet address is 192.168.1.100/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Full Duplex, 1Gbps, media type is RJ45
  output flow-control is unsupported, input flow-control is unsupported
  ARP type: ARPA, ARP Timeout 04:00:00
  Last input 00:00:01, output 00:00:00, output hang never
  Last clearing of "show interface" counters never
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
  Queueing strategy: fifo
  Output queue: 0/40 (size/max)
  5 minute input rate 42000 bits/sec, 35 packets/sec
  5 minute output rate 18000 bits/sec, 14 packets/sec
     82341 packets input, 14729812 bytes, 0 no buffer
     Received 1204 broadcasts (0 IP multicasts)
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 watchdog, 1204 multicast, 0 pause input
     18293 packets output, 1394720 bytes, 0 underruns
     0 output errors, 0 collisions, 0 interface resets`;

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

function buildHelp(isCcna: boolean): string {
  const base = `Available Commands:
  help                    Show this help message
  clear                   Clear the terminal screen
  ipconfig                Display IP configuration (Windows-style)
  ifconfig                Display IP configuration (Linux-style)
  ping <host>             Ping a host (try 8.8.8.8 or 192.168.1.1)
  traceroute <host>       Trace network path to host
  tracert <host>          Trace network path to host (Windows alias)
  nslookup <domain>       DNS lookup (try google.com)
  netstat -an             Display active network connections
  arp -a                  Display ARP cache table
  route print             Display routing table (Windows-style)
  ip route                Display routing table (Linux-style)`;

  const ccna = `
  show ip interface brief  Display interface summary
  show ip route            Display IP routing table (Cisco format)
  show running-config      Display current running configuration
  show version             Display IOS version and hardware info
  show vlan brief          Display VLAN table
  show interfaces GigabitEthernet0/0  Display interface details
  configure terminal       Enter global configuration mode
  exit                     Exit configuration mode`;

  return isCcna ? base + ccna : base;
}

// ---------------------------------------------------------------------------
// Command processor
// ---------------------------------------------------------------------------

type ConfigMode = boolean;

function processCommand(
  raw: string,
  isCcna: boolean,
  configMode: ConfigMode,
): { lines: Array<{ text: string; type: LineType }>; nextConfigMode: ConfigMode } {
  const cmd = raw.trim().toLowerCase();
  const nextConfigMode = configMode;

  // Config mode prompt handling
  if (configMode) {
    if (cmd === 'exit' || cmd === 'end') {
      return {
        lines: [{ text: 'Exiting configuration mode...', type: 'system' }],
        nextConfigMode: false,
      };
    }
    // Accept any input in config mode as acknowledged
    return {
      lines: [{ text: `Router1(config)# ${raw}`, type: 'output' }],
      nextConfigMode: true,
    };
  }

  if (cmd === 'help' || cmd === '?') {
    return { lines: [{ text: buildHelp(isCcna), type: 'output' }], nextConfigMode };
  }

  if (cmd === 'clear') {
    return { lines: [], nextConfigMode };
  }

  if (cmd === 'ipconfig' || cmd === 'ipconfig /all') {
    return { lines: [{ text: IPCONFIG_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd === 'ifconfig') {
    return { lines: [{ text: IFCONFIG_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd.startsWith('ping ')) {
    const target = raw.trim().split(/\s+/)[1] ?? '8.8.8.8';
    const known = ['8.8.8.8', '192.168.1.1', '192.168.1.100', '127.0.0.1', 'localhost'];
    if (known.includes(target) || /^\d+\.\d+\.\d+\.\d+$/.test(target)) {
      return { lines: [{ text: pingOutput(target), type: 'output' }], nextConfigMode };
    }
    return {
      lines: [{ text: `Ping request could not find host ${target}. Please check the name and try again.`, type: 'error' }],
      nextConfigMode,
    };
  }

  if (cmd.startsWith('traceroute ') || cmd.startsWith('tracert ')) {
    return { lines: [{ text: TRACEROUTE_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd.startsWith('nslookup ')) {
    return { lines: [{ text: NSLOOKUP_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd === 'netstat -an' || cmd === 'netstat') {
    return { lines: [{ text: NETSTAT_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd === 'arp -a' || cmd === 'arp') {
    return { lines: [{ text: ARP_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd === 'route print') {
    return { lines: [{ text: ROUTE_PRINT_OUTPUT, type: 'output' }], nextConfigMode };
  }

  if (cmd === 'ip route' || cmd === 'ip route show') {
    return { lines: [{ text: IP_ROUTE_OUTPUT, type: 'output' }], nextConfigMode };
  }

  // CCNA commands
  if (isCcna) {
    if (cmd === 'show ip interface brief' || cmd === 'sh ip int br') {
      return { lines: [{ text: SHOW_IP_INT_BRIEF, type: 'output' }], nextConfigMode };
    }

    if (cmd === 'show ip route' || cmd === 'sh ip route') {
      return { lines: [{ text: SHOW_IP_ROUTE, type: 'output' }], nextConfigMode };
    }

    if (cmd === 'show running-config' || cmd === 'sh run') {
      return { lines: [{ text: SHOW_RUNNING_CONFIG, type: 'output' }], nextConfigMode };
    }

    if (cmd === 'show version' || cmd === 'sh ver') {
      return { lines: [{ text: SHOW_VERSION, type: 'output' }], nextConfigMode };
    }

    if (cmd === 'show vlan brief' || cmd === 'sh vlan br') {
      return { lines: [{ text: SHOW_VLAN_BRIEF, type: 'output' }], nextConfigMode };
    }

    if (
      cmd === 'show interfaces gigabitethernet0/0' ||
      cmd === 'show interfaces gi0/0' ||
      cmd === 'sh int gi0/0' ||
      cmd === 'sh interfaces gi0/0'
    ) {
      return { lines: [{ text: SHOW_INT_GIG00, type: 'output' }], nextConfigMode };
    }

    if (cmd === 'configure terminal' || cmd === 'conf t') {
      return {
        lines: [
          { text: 'Enter configuration commands, one per line.  End with CNTL/Z.', type: 'system' },
          { text: 'Router1(config)#', type: 'system' },
        ],
        nextConfigMode: true,
      };
    }

    if (cmd === 'exit') {
      return { lines: [{ text: 'Use "configure terminal" to enter config mode first.', type: 'system' }], nextConfigMode };
    }
  }

  if (cmd === 'exit' || cmd === 'logout') {
    return {
      lines: [{ text: 'Type "exit" only applies inside config mode. Use the Exit button to leave.', type: 'system' }],
      nextConfigMode,
    };
  }

  // Unknown command
  return {
    lines: [{ text: `Command not recognized: '${raw}'. Type 'help' for available commands.`, type: 'error' }],
    nextConfigMode,
  };
}

// ---------------------------------------------------------------------------
// Cert name lookup
// ---------------------------------------------------------------------------

function getCertName(certId: string): string {
  const id = certId.toLowerCase();
  if (id.includes('ccna')) return 'CCNA 200-301';
  if (id.includes('network') || id.includes('net+') || id.includes('n10')) return 'CompTIA Network+';
  if (id.includes('security') || id.includes('sec+')) return 'CompTIA Security+';
  if (id.includes('a+')) return 'CompTIA A+';
  return certId.toUpperCase();
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const MAX_LINES = 200;
const MAX_HISTORY = 20;

let lineCounter = 0;
function nextId() {
  return ++lineCounter;
}

export default function TerminalPage() {
  const params = useParams<{ certId: string }>();
  const router = useRouter();
  const certId = params.certId ?? '';
  const isCcna = certId.toLowerCase().includes('ccna');
  const certName = getCertName(certId);

  const [lines, setLines] = useState<TerminalLine[]>(() => [
    { id: nextId(), text: `CertQuest OS Terminal Simulator`, type: 'system' },
    { id: nextId(), text: `Cert: ${getCertName(certId)}`, type: 'system' },
    { id: nextId(), text: `Type 'help' for available commands.`, type: 'system' },
    { id: nextId(), text: '', type: 'system' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [configMode, setConfigMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom after lines change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const appendLines = useCallback((newLines: Array<{ text: string; type: LineType }>) => {
    setLines((prev) => {
      const combined = [
        ...prev,
        ...newLines.map((l) => ({ ...l, id: nextId() })),
      ];
      // Truncate to MAX_LINES
      return combined.length > MAX_LINES ? combined.slice(combined.length - MAX_LINES) : combined;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const raw = input.trim();
    if (!raw) return;

    // Add input line
    const prompt = configMode ? 'Router1(config)#' : 'user@certquest:~$';
    appendLines([{ text: `${prompt} ${raw}`, type: 'input' }]);

    // Update history
    setHistory((prev) => {
      const next = [raw, ...prev.filter((h) => h !== raw)].slice(0, MAX_HISTORY);
      return next;
    });
    setHistoryIndex(-1);

    // Special case: clear
    if (raw.toLowerCase() === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    // Process command
    const { lines: outputLines, nextConfigMode } = processCommand(raw, isCcna, configMode);
    setConfigMode(nextConfigMode);
    if (outputLines.length > 0) {
      appendLines(outputLines);
    }
    // Add blank line after output for spacing
    appendLines([{ text: '', type: 'output' }]);

    setInput('');
  }, [input, configMode, isCcna, appendLines]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const next = Math.min(prev + 1, history.length - 1);
          setInput(history[next] ?? '');
          return next;
        });
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const next = Math.max(prev - 1, -1);
          setInput(next === -1 ? '' : (history[next] ?? ''));
          return next;
        });
        return;
      }
    },
    [handleSubmit, history],
  );

  const lineColor: Record<LineType, string> = {
    input: 'text-green-300',
    output: 'text-green-400',
    error: 'text-red-400',
    system: 'text-yellow-400',
  };

  const prompt = configMode ? 'Router1(config)#' : 'user@certquest:~$';

  return (
    <div
      className="fixed inset-0 flex flex-col bg-black font-mono text-green-400 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-green-900/60 select-none">
        <div className="flex items-center gap-3">
          <span className="text-green-500 text-xs tracking-widest uppercase font-bold">{certName}</span>
          <span className="text-green-900">|</span>
          <span className="text-green-600 text-xs tracking-[0.3em] uppercase">Terminal Simulator</span>
        </div>
        <div className="flex items-center gap-3">
          {configMode && (
            <span className="text-yellow-400 text-xs tracking-widest uppercase animate-pulse">
              CONFIG MODE
            </span>
          )}
          <button
            onClick={() => router.back()}
            className="text-green-700 hover:text-green-400 text-xs tracking-widest uppercase border border-green-900 hover:border-green-600 px-3 py-1 transition-colors"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`text-xs leading-5 whitespace-pre-wrap break-words ${lineColor[line.type]}`}
          >
            {line.text || ' '}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-green-900/60 bg-[#050505] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-xs shrink-0 select-none">{prompt}</span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setHistoryIndex(-1); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-green-400 text-xs outline-none caret-green-400 placeholder-green-900"
              placeholder=""
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Terminal input"
            />
            {/* Blinking cursor block */}
            <span className="inline-block w-2 h-3.5 bg-green-400 ml-0.5 animate-pulse align-middle" />
          </div>
        </div>
      </div>
    </div>
  );
}
