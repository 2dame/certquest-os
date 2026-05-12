'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function GlossaryIndexPage() {
  const router = useRouter();
  const activeCertId = useStore((s) => s.activeCertId);

  useEffect(() => {
    router.replace(`/glossary/${activeCertId}`);
  }, [activeCertId, router]);

  return <div className="text-textMuted p-10">Loading…</div>;
}
