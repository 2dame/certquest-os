import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-gold text-xs tracking-[0.3em]">CERTQUEST OS</p>
        <h1 className="font-serif text-5xl mt-4">Train. Earn proof. Pass the exam.</h1>
        <p className="text-textMuted mt-6 leading-relaxed">
          A private certification training system that drills you on real exam objectives,
          tracks evidence of mastery, and adapts your daily plan to the time you have.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/dashboard" className="bg-gold text-bg px-6 py-3 font-semibold tracking-widest text-sm">
            ENTER
          </Link>
          <Link href="/login" className="border border-border px-6 py-3 tracking-widest text-sm">
            SIGN IN
          </Link>
        </div>
      </div>
    </main>
  );
}
