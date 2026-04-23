import { createClient } from '@/lib/supabase/server'
import { Briefcase, MapPin, Users, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react'
import Link from 'next/link'

const statusColors = {
  active: 'text-green-500 bg-green-500/10 border-green-500/30',
  pending_moderation: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  closed: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30',
  draft: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
}

export default async function EmployerJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role, verification_status').eq('id', user!.id).single()

  // Seekers see the job browse page instead
  if (profile?.role === 'seeker') {
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`*, profiles:employer_id (company_name, verification_status)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Browse Jobs</h1>
        <div className="space-y-4">
          {jobs?.map(job => {
            const employer = job.profiles as { company_name: string; verification_status: string }
            return (
              <div key={job.id} className="rounded-2xl border border-border bg-background p-6">
                <h3 className="font-bold text-lg">{job.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{employer?.company_name} {job.location ? `· ${job.location}` : ''}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, applications(count)')
    .eq('employer_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Job Posts</h1>
          <p className="text-muted-foreground mt-1">Manage all your job listings.</p>
        </div>
        <Link href="/dashboard/jobs/post" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          + Post New Job
        </Link>
      </div>

      {jobs?.length === 0 && (
        <div className="text-center py-20 rounded-2xl border border-border">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No jobs posted yet. <Link href="/dashboard/jobs/post" className="text-primary font-semibold underline">Post your first job →</Link></p>
        </div>
      )}

      <div className="space-y-4">
        {jobs?.map(job => {
          const appCount = (job.applications as { count: number }[])?.[0]?.count ?? 0
          const statusColor = statusColors[job.status as keyof typeof statusColors] ?? statusColors.draft
          return (
            <div key={job.id} className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                    <span className="flex items-center gap-1 capitalize"><Briefcase className="h-3.5 w-3.5" />{job.job_type?.replace('_', ' ')}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-semibold ${statusColor}`}>
                      {job.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                      {job.status === 'pending_moderation' && <Clock className="h-3 w-3" />}
                      {job.status === 'closed' && <XCircle className="h-3 w-3" />}
                      <span className="capitalize">{job.status?.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <Users className="h-4 w-4" /> {appCount} applicants
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Eye className="h-3.5 w-3.5" /> {job.views_count ?? 0} views
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
              <Link href={`/dashboard/applicants?job=${job.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                View Applicants →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
