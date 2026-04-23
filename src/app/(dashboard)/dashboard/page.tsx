import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Briefcase, FileText, Bookmark, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const isSeeker = profile?.role === 'seeker'
  const isVerified = profile?.verification_status === 'verified'

  // Seeker stats
  const [{ count: appliedCount }, { count: savedCount }, { count: postedCount }, { count: applicantsCount }] = await Promise.all([
    isSeeker
      ? supabase.from('applications').select('*', { count: 'exact', head: true }).eq('seeker_id', user!.id)
      : supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', user!.id),
    isSeeker
      ? supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('seeker_id', user!.id)
      : supabase.from('applications').select('*', { count: 'exact', head: true }).in(
          'job_id',
          (await supabase.from('jobs').select('id').eq('employer_id', user!.id)).data?.map(j => j.id) ?? []
        ),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', user!.id),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'shortlisted'),
  ])

  const verificationIcons = {
    verified: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    pending: <Clock className="h-5 w-5 text-yellow-500" />,
    rejected: <XCircle className="h-5 w-5 text-red-500" />,
  }

  const verificationColors = {
    verified: 'border-green-500/30 bg-green-500/5',
    pending: 'border-yellow-500/30 bg-yellow-500/5',
    rejected: 'border-red-500/30 bg-red-500/5',
  }

  const vs = profile?.verification_status as 'verified' | 'pending' | 'rejected'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {profile?.first_name ?? 'there'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening on your account.</p>
      </div>

      {/* Verification status card */}
      <div className={`rounded-2xl border p-6 flex items-start gap-4 ${verificationColors[vs] ?? 'border-border bg-muted/30'}`}>
        <div className="mt-0.5">{verificationIcons[vs] ?? <AlertCircle className="h-5 w-5 text-muted-foreground" />}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg capitalize">
            Account {vs === 'verified' ? 'Verified ✓' : vs === 'pending' ? 'Verification Pending' : 'Verification Rejected'}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vs === 'verified' && 'You have full access to all platform features.'}
            {vs === 'pending' && 'Your documents are under review. You\'ll be notified once approved.'}
            {vs === 'rejected' && `Reason: ${profile?.verification_notes ?? 'Documents did not meet requirements.'}. Please re-submit.`}
          </p>
        </div>
        {vs !== 'verified' && (
          <Link href="/dashboard/verify" className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            {vs === 'pending' ? 'View status →' : 'Re-submit →'}
          </Link>
        )}
      </div>

      {/* Stats */}
      {isSeeker ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Applications Sent', value: appliedCount ?? 0, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10', href: '/dashboard/applications' },
            { label: 'Saved Jobs', value: savedCount ?? 0, icon: Bookmark, color: 'text-pink-500', bg: 'bg-pink-500/10', href: '/dashboard/saved' },
            { label: 'Profile Status', value: isVerified ? 'Ready' : 'Incomplete', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', href: '/dashboard/profile' },
          ].map(s => (
            <Link key={s.label} href={s.href} className="rounded-2xl border border-border bg-background p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className={`p-3 rounded-xl shrink-0 ${s.bg}`}><s.icon className={`h-6 w-6 ${s.color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                <p className="text-3xl font-extrabold mt-0.5">{s.value}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Jobs Posted', value: postedCount ?? 0, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/dashboard/jobs' },
            { label: 'Total Applicants', value: savedCount ?? 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10', href: '/dashboard/applicants' },
            { label: 'Shortlisted', value: applicantsCount ?? 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', href: '/dashboard/applicants' },
          ].map(s => (
            <Link key={s.label} href={s.href} className="rounded-2xl border border-border bg-background p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className={`p-3 rounded-xl shrink-0 ${s.bg}`}><s.icon className={`h-6 w-6 ${s.color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                <p className="text-3xl font-extrabold mt-0.5">{s.value}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isSeeker ? (
            <>
              <Link href="/dashboard/jobs" className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-4 text-sm font-medium hover:bg-muted transition-colors">
                <Briefcase className="h-5 w-5 text-primary" /> Browse open positions
              </Link>
              <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-4 text-sm font-medium hover:bg-muted transition-colors">
                <ShieldCheck className="h-5 w-5 text-purple-500" /> Update my profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/jobs/post" className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-4 text-sm font-medium hover:bg-muted transition-colors">
                <Briefcase className="h-5 w-5 text-primary" /> Post a new job
              </Link>
              <Link href="/dashboard/applicants" className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-4 text-sm font-medium hover:bg-muted transition-colors">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Review applicants
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
