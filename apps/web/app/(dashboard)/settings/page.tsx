import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { Card, CardTitle } from '@/components/Card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="text-textMuted mt-2">
          Settings are stored on the device. The web mirror is read-only; change them on mobile.
        </p>
      </div>

      <Card>
        <CardTitle>Study Intensity</CardTitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="border border-border p-3 text-center">
            <p className="font-semibold">CHILL</p>
            <p className="text-textMuted text-xs mt-1">~15 min · 3 tasks</p>
          </div>
          <div className="border border-gold p-3 text-center">
            <p className="font-semibold text-gold">NORMAL</p>
            <p className="text-textMuted text-xs mt-1">~30 min · 5 tasks</p>
          </div>
          <div className="border border-border p-3 text-center">
            <p className="font-semibold">AGGRESSIVE</p>
            <p className="text-textMuted text-xs mt-1">~60 min · 8 tasks</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Exam Dates</CardTitle>
        <div className="mt-3 space-y-2">
          {certDisplayOrder.map((cid) => {
            const pack = certPacks[cid]!;
            const lore = getCertLore(cid)!;
            return (
              <div key={cid} className="flex justify-between items-center border-b border-border pb-2">
                <div>
                  <p className="font-semibold text-sm">{pack.meta.examCode}</p>
                  <p className="text-textMuted text-xs">{lore.worldName}</p>
                </div>
                <p className="text-textMuted text-xs italic">Set on mobile</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Cloud Sync</CardTitle>
        <p className="text-textMuted text-sm mt-2">
          Optional Supabase sync. Currently disabled. The app runs fully local. Sync support will
          allow study sessions to merge across devices when available.
        </p>
      </Card>
    </div>
  );
}
