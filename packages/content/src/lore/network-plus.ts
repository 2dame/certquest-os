import type { CertLore } from '@certquest/types/src/lore-schemas';

export const networkPlusLore: CertLore = {
  worldName: 'The Packet Seas',
  userRole: 'Network Cartographer',
  tagline: 'Chart the routes. Read the tides. Find the break before the ship sinks.',
  tone: 'Nautical, precise, methodical. A navigator\'s patience.',
  mentor: {
    name: 'Admiral Ping',
    title: 'Charter of the Packet Seas',
    voice: 'Slow, exact, never raises a voice. Knows every protocol by sound.',
    catchphrase: 'When in doubt, ping the gateway first.',
  },
  rival: {
    name: 'The Latency Kraken',
    title: 'The Beast of Slow Connections',
    purpose: 'Drags packets to the depths. Manifests as 30% loss on Tuesdays. Vanishes when senior engineers arrive.',
  },
  regions: [
    {
      domainId: 'netplus-fund',
      regionName: 'OSI Tower',
      description: 'A seven-floor lighthouse. Each floor is a layer. Each layer has its own keepers.',
      threat: 'Mistaking Layer 2 problems for Layer 7 problems. Wasted hours on the wrong floor.',
      unlockMessage: 'Admiral Ping points up. "Floor 2 first. Then 3. Then 7. Never skip."',
      completionMessage: 'You name the layer before you name the protocol. The Tower lights for you.',
    },
    {
      domainId: 'netplus-impl',
      regionName: 'Wireless Skybridge',
      description: 'The air above the harbor. Channels overlap, interference is everywhere.',
      threat: 'WPA mistakes. Rogue APs. Channel 4 in a 1-6-11 environment.',
      unlockMessage: 'The Skybridge tolerates only WPA3. Anything older, the Kraken finds it.',
      completionMessage: 'You design wireless that survives a busy office. The Skybridge holds.',
    },
    {
      domainId: 'netplus-ops',
      regionName: 'Routing Current',
      description: 'The shipping lanes between subnets. Where packets go to find their way.',
      threat: 'Routing loops. Default gateway drift. ACLs blocking what should pass.',
      unlockMessage: 'Plot a course. show ip route is your compass.',
      completionMessage: 'You read a routing table the way captains read tides.',
    },
    {
      domainId: 'netplus-sec',
      regionName: 'Firewall Reef',
      description: 'A jagged barrier. Every port a passage. Every rule a sharp edge.',
      threat: 'Open ports nobody documented. Implicit denies blocking legitimate traffic.',
      unlockMessage: 'The Reef keeps the harbor safe. Memorize the ports or the Reef cuts you.',
      completionMessage: 'You know which port belongs in which rule. The Reef stands.',
    },
    {
      domainId: 'netplus-trbl',
      regionName: 'Subnet Isles',
      description: 'A scattered archipelago. Each island a /something. Get the math wrong and ships dock at the wrong port.',
      threat: 'Off-by-one host counts. Wildcard masks confused with subnet masks.',
      unlockMessage: 'The Isles do not forgive bad math. Calculate twice.',
      completionMessage: 'You subnet on instinct. The Isles sail with you.',
    },
  ],
  rankTitles: ['Deckhand', 'Mate', 'Cartographer', 'Navigator', 'Captain', 'Fleet Commander', 'Admiral'],
  dailyMessageTemplates: [
    'Tide is calm. {nextLesson} is your chart for today.',
    'The Kraken stirs near {weakDomain}. {dueReviews} drills before you sail.',
    'Admiral Ping: "{weakDomain} is where the last three rookies sank. Don\'t join them."',
    'Trial Readiness: {readiness}%. The {nextTrial} unlocks at 80%.',
    'Subnet quiz waiting. Five questions. Five minutes. Sharpen the math.',
  ],
};
