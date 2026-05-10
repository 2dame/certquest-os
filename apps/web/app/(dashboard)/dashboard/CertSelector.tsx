'use client'

import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { certPacks, certDisplayOrder } from '@certquest/content'

interface Props {
  activeCertId: string
}

export function CertSelector({ activeCertId }: Props) {
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCertId = e.target.value
    const supabase = getBrowserSupabase()
    if (supabase) await supabase.auth.updateUser({ data: { activeCertId: newCertId } })
    router.refresh()
  }

  return (
    <select
      value={activeCertId}
      onChange={handleChange}
      className="bg-bgCard border border-border text-text text-sm px-3 py-1.5 focus:outline-none focus:border-gold"
    >
      {certDisplayOrder.map((cid) => {
        const pack = certPacks[cid]!
        return (
          <option key={cid} value={cid}>
            {pack.meta.examCode} — {pack.meta.examName}
          </option>
        )
      })}
    </select>
  )
}
