import { createClient } from '@/lib/supabase/server'
import { Users, FileText, CheckCircle2, Eye, XCircle, ShieldCheck, MessageSquare } from 'lucide-react'
import { updateApplicationStatus, viewResumeAndMarkViewed } from '../actions'
import { SubmitButton } from '@/components/submit-button'
import { ResumeViewButton } from '@/components/ResumeViewButton'

export default async function ApplicantsPage({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  // Get employer's jobs
  const { data: myJobs } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('employer_id', user!.id)

  const jobIds = myJobs?.map(j => j.id) ?? []

  let query = supabase
    .from('applications')
    .select(`
      *,
      jobs (id, title),
      profiles:seeker_id (id, first_name, last_name, bio, skills, location, avatar_url, verification_status)
    `)
    .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })

  if (params.job) query = query.eq('job_id', params.job)

  const { data: applications } = await query

  const statusConfig = {
    applied:     { label: 'Applied',     color: 'text-blue-500   bg-blue-500/10   border-blue-500/30',   next: 'viewed'      },
    viewed:      { label: 'Viewed',      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30', next: 'shortlisted' },
    shortlisted: { label: 'Shortlisted', color: 'text-green-500  bg-green-500/10  border-green-500/30',  next: 'rejected'    },
    rejected:    { label: 'Rejected',    color: 'text-red-500    bg-red-500/10    border-red-500/30',    next: 'applied'     },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Applicants</h1>
          <p className="text-muted-foreground mt-1">Review and manage candidates for your postings.</p>
        </div>
        <span className="text-sm font-semibold text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
          <Users className="h-4 w-4 inline-block mr-1" /> {applications?.length ?? 0} total
        </span>
      </div>

      {/* Job filter */}
      {myJobs && myJobs.length > 1 && (
        <form method="GET" className="flex items-center gap-3">
          <select name="job" defaultValue={params.job ?? ''} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Job Posts</option>
            {myJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">Filter</button>
        </form>
      )}

      {applications?.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No applicants yet for {params.job ? 'this job' : 'any of your jobs'}.</p>
        </div>
      )}

      <div className="space-y-4">
        {applications && await Promise.all(applications.map(async app => {
          const seeker = app.profiles as { id: string; first_name: string; last_name: string; bio: string; skills: string[]; location: string; avatar_url: string; verification_status: string }
          const job = app.jobs as { title: string }
          const cfg = statusConfig[app.status as keyof typeof statusConfig]

          let resumeUrl = app.resume_url;
          if (resumeUrl && resumeUrl.includes('/public/resumes/')) {
            const path = resumeUrl.split('/public/resumes/')[1];
            if (path) {
              const { data } = await supabase.storage.from('resumes').createSignedUrl(path, 3600);
              if (data?.signedUrl) {
                resumeUrl = data.signedUrl;
              }
            }
          }

          return (
            <div key={app.id} className="rounded-2xl border border-border bg-background p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden border border-border">
                    {seeker?.avatar_url ? (
                      <img 
                        src={seeker.avatar_url} 
                        alt={`${seeker.first_name} ${seeker.last_name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>{seeker?.first_name?.[0]}{seeker?.last_name?.[0]}</>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{seeker?.first_name} {seeker?.last_name}</p>
                      {seeker?.verification_status === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-medium">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{seeker?.location ?? 'Location not set'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Applied for: <span className="font-medium text-foreground">{job?.title}</span></p>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${cfg?.color}`}>
                  {cfg?.label}
                </div>
              </div>

              {seeker?.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 rounded-lg px-4 py-3">{seeker.bio}</p>
              )}

              {seeker?.skills && seeker.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {seeker.skills.slice(0, 8).map(skill => (
                    <span key={skill} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                {resumeUrl && (
                <ResumeViewButton applicationId={app.id} resumeUrl={resumeUrl} />
                )}

                {/* Status update actions */}
                <form action={updateApplicationStatus} className="inline">
                  <input type="hidden" name="application_id" value={app.id} />
                  <input type="hidden" name="status" value="viewed" />
                  <SubmitButton className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-colors" disabled={app.status !== 'applied'} pendingText={<><Eye className="h-3.5 w-3.5" /> Mark Viewed</>}>
                    <Eye className="h-3.5 w-3.5" /> Mark Viewed
                  </SubmitButton>
                </form>
                <form action={updateApplicationStatus} className="inline">
                  <input type="hidden" name="application_id" value={app.id} />
                  <input type="hidden" name="status" value="shortlisted" />
                  <SubmitButton className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-500 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 px-3 py-1.5 rounded-lg transition-colors" disabled={app.status === 'shortlisted'} pendingText={<><CheckCircle2 className="h-3.5 w-3.5" /> Shortlist</>}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Shortlist
                  </SubmitButton>
                </form>
                {app.status === 'shortlisted' && (
                  <a href={`/dashboard/messages?chat=${seeker.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" /> Message Applicant
                  </a>
                )}
                <form action={updateApplicationStatus} className="inline">
                  <input type="hidden" name="application_id" value={app.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <SubmitButton className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors" disabled={app.status === 'rejected'} pendingText={<><XCircle className="h-3.5 w-3.5" /> Reject</>}>
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </SubmitButton>
                </form>
              </div>
            </div>
          )
        }))}
      </div>
    </div>
  )
}
