import { createClient } from '@/lib/supabase/server'
import { FileText, Clock, Eye, CheckCircle2, XCircle, Briefcase } from 'lucide-react'

const statusConfig = {
  applied:     { label: 'Applied',     icon: FileText,     color: 'text-blue-500   bg-blue-500/10   border-blue-500/30'   },
  viewed:      { label: 'Viewed',      icon: Eye,          color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle2, color: 'text-green-500  bg-green-500/10  border-green-500/30'  },
  rejected:    { label: 'Rejected',    icon: XCircle,      color: 'text-red-500    bg-red-500/10    border-red-500/30'    },
}

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications } = await supabase
    .from('applications')
    .select(`*, jobs (title, location, job_type, profiles:employer_id (company_name, verification_status))`)
    .eq('seeker_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of all your job applications.</p>
        </div>
        <span className="text-sm font-semibold text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">{applications?.length ?? 0} total</span>
      </div>

      {applications?.length === 0 && (
        <div className="text-center py-20 rounded-2xl border border-border">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No applications yet. <a href="/dashboard/jobs" className="text-primary font-semibold underline">Browse open jobs</a></p>
        </div>
      )}

      <div className="space-y-3">
        {applications?.map(app => {
          const job = app.jobs as { title: string; location: string; job_type: string; profiles: { company_name: string; verification_status: string } }
          const cfg = statusConfig[app.status as keyof typeof statusConfig]
          return (
            <div key={app.id} className="rounded-2xl border border-border bg-background p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{job?.title}</p>
                  <p className="text-sm text-muted-foreground">{job?.profiles?.company_name ?? '—'} {job?.location ? `· ${job.location}` : ''}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Applied {new Date(app.created_at!).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${cfg?.color}`}>
                {cfg && <cfg.icon className="h-3.5 w-3.5" />} {cfg?.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
