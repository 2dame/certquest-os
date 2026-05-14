/**
 * Daily Digest — Supabase Edge Function
 *
 * Sends a study-plan email to all users who have opted in to notifications
 * and have an exam date set. Triggered by a Supabase cron job or pg_cron.
 *
 * Setup:
 *   1. Deploy: supabase functions deploy daily-digest
 *   2. Set secrets: supabase secrets set RESEND_API_KEY=re_xxxx SITE_URL=https://your-site.com
 *   3. Schedule via Supabase Dashboard → Edge Functions → Schedule
 *      or via pg_cron: select cron.schedule('digest', '0 8 * * *', $$
 *        select net.http_post(
 *          url := 'https://<project-ref>.functions.supabase.co/daily-digest',
 *          headers := '{"Authorization":"Bearer <service-role-key>"}'::jsonb
 *        ) $$);
 *
 * Required Supabase table:
 *   create table user_preferences (
 *     user_id uuid references auth.users primary key,
 *     notifications_enabled boolean default false,
 *     exam_dates jsonb default '{}',
 *     streak integer default 0,
 *     xp integer default 0,
 *     active_cert_id text
 *   );
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://certquest.app';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface UserPref {
  user_id: string;
  email: string;
  streak: number;
  xp: number;
  active_cert_id: string | null;
  exam_dates: Record<string, string>;
}

async function sendDigestEmail(to: string, pref: UserPref): Promise<void> {
  const certId = pref.active_cert_id ?? 'your cert';
  const examDate = pref.active_cert_id ? pref.exam_dates[pref.active_cert_id] : null;
  const daysLeft = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000)
    : null;

  const streakLine = pref.streak > 0
    ? `🔥 ${pref.streak}-day streak — keep it going!`
    : `Start a new streak today!`;

  const examLine = daysLeft !== null && daysLeft > 0
    ? `📅 ${daysLeft} days until your exam. Stay on pace.`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="background:#0B0B10;color:#F5F1E6;font-family:Manrope,system-ui,sans-serif;padding:2rem;max-width:560px;margin:0 auto;">
      <p style="color:#E5C97B;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">CERTQUEST OS</p>
      <h1 style="font-family:Georgia,serif;font-size:2rem;margin:0.5rem 0;">Your Daily Study Brief</h1>
      <p style="color:#A8A2B2;font-size:0.875rem;margin-bottom:2rem;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

      <div style="border:1px solid #2A2A38;padding:1.5rem;margin-bottom:1rem;">
        <p style="color:#A8A2B2;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 0.5rem;">Today's Snapshot</p>
        <p style="margin:0.25rem 0;">${streakLine}</p>
        <p style="margin:0.25rem 0;">⚡ ${pref.xp.toLocaleString()} XP earned</p>
        ${examLine ? `<p style="margin:0.25rem 0;">${examLine}</p>` : ''}
      </div>

      <a href="${SITE_URL}/dashboard"
         style="display:inline-block;background:#E5C97B;color:#0B0B10;font-weight:bold;padding:0.75rem 2rem;text-decoration:none;letter-spacing:0.15em;text-transform:uppercase;font-size:0.875rem;">
        OPEN TODAY'S PLAN →
      </a>

      <p style="color:#6B6878;font-size:10px;margin-top:2rem;">
        You're receiving this because notifications are enabled in CertQuest OS settings.
        <a href="${SITE_URL}/settings" style="color:#A8A2B2;">Manage preferences →</a>
      </p>
    </body>
    </html>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CertQuest OS <digest@certquest.app>',
      to,
      subject: `Your ${certId.toUpperCase()} study brief — ${pref.streak > 0 ? `${pref.streak}d streak` : 'start today'}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to send to ${to}:`, err);
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch all users with notifications enabled
  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .select('user_id, streak, xp, active_cert_id, exam_dates')
    .eq('notifications_enabled', true);

  if (error) {
    console.error('DB error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!prefs || prefs.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No opted-in users' }), { status: 200 });
  }

  // Fetch emails from auth.users (admin API)
  let sent = 0;
  for (const pref of prefs) {
    const { data: { user } } = await supabase.auth.admin.getUserById(pref.user_id);
    if (!user?.email) continue;
    await sendDigestEmail(user.email, { ...pref, email: user.email });
    sent++;
  }

  return new Response(JSON.stringify({ sent, total: prefs.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
