import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../lib/theme';
import { Card } from '../../components/Card';
import { useStore } from '../../lib/store';
import type { CertId } from '@certquest/types';

interface World {
  id: CertId;
  name: string;
  theme: string;
  blurb: string;
  available: boolean;
}

const WORLDS: World[] = [
  { id: 'a-plus-core1', name: 'CompTIA A+ Core 1', theme: 'Help Desk Guild I', blurb: 'Hardware, networking, mobile, virtualization.', available: true },
  { id: 'a-plus-core2', name: 'CompTIA A+ Core 2', theme: 'Help Desk Guild II', blurb: 'OS, security, software troubleshooting, scripting.', available: false },
  { id: 'network-plus', name: 'CompTIA Network+', theme: 'Packet Seas', blurb: 'Routers, switches, DNS, DHCP, firewalls.', available: false },
  { id: 'aws-ccp', name: 'AWS Cloud Practitioner', theme: 'Cloud Village', blurb: 'AWS basics, billing, regions, shared responsibility.', available: false },
  { id: 'aws-saa', name: 'AWS Solutions Architect', theme: 'Architect Trials', blurb: 'High availability, security, cost, scale.', available: false },
  { id: 'ccna', name: 'Cisco CCNA', theme: 'Router Kingdom', blurb: 'VLANs, OSPF, ACLs, NAT, CLI mastery.', available: false },
];

export default function WorldsScreen() {
  const activeCertId = useStore((s) => s.activeCertId);
  const setActiveCertId = useStore((s) => s.setActiveCert);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: theme.space(4), gap: theme.space(3) }}>
        <Text style={{ color: theme.colors.textMuted, letterSpacing: 1 }}>SELECT A WORLD</Text>
        {WORLDS.map((w) => {
          const active = w.id === activeCertId;
          return (
            <Pressable key={w.id} onPress={() => w.available && setActiveCertId(w.id)} disabled={!w.available}>
              <Card style={{
                borderColor: active ? theme.colors.gold : theme.colors.border,
                opacity: w.available ? 1 : 0.45,
              }}>
                <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 1 }}>
                  {w.theme.toUpperCase()}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginTop: 4 }}>
                  {w.name}
                </Text>
                <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>{w.blurb}</Text>
                <Text style={{ color: w.available ? theme.colors.success : theme.colors.textDim, marginTop: 8, fontSize: 11, letterSpacing: 1 }}>
                  {w.available ? (active ? 'ACTIVE' : 'AVAILABLE') : 'COMING SOON'}
                </Text>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
