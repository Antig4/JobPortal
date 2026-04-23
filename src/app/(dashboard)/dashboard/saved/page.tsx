import { createClient } from '@/lib/supabase/server'
import { Bookmark, MapPin, Briefcase, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react'
import { unsaveJob, applyToJob } from '../actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/submit-button'

export default async function SavedJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('verification_status').eq('id', user!.id).single()
  const isVerified = profile?.verification_status === 'verified'

  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select(`*, jobs (*, profiles:employer_id (company_name, verification_status))`)
    .eq('seeker_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: appliedJobs } = await supabase.from('applications').select('job_id').eq('seeker_id', user!.id)
  const appliedIds = new Set(appliedJobs?.map(a => a.job_id))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground mt-1">Jobs you&apos;ve bookmarked for later.</p>
        </div>
        <span className="text-sm font-semibold text-pink-500 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-full">{savedJobs?.length ?? 0} saved</span>
      </div>

      {savedJobs?.length === 0 && (
        <div className="text-center py-20 rounded-2xl border border-border">
          <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No saved jobs yet. <Link href="/dashboard/jobs" className="text-primary font-semibold underline">Browse jobs →</Link></p>
        </div>
      )}

      <div className="space-y-4">
        {savedJobs?.map(saved => {
          const job = saved.jobs as { id: string; title: string; description: string; location: string; job_type: string; salary_min: number; salary_max: number; salary_currency: string; is_remote: boolean; profiles: { company_name: string; verification_status: string } }
          if (!job) return null
          const isApplied = appliedIds.has(job.id)
          const employer = job.profiles
          return (
            <div key={saved.id} className="rounded-2xl border border-border bg-background p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    {employer?.verification_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-medium">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{employer?.company_name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                    {job.job_type && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /><span className="capitalize">{job.job_type.replace('_', ' ')}</span></span>}
                    {job.salary_min && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{job.salary_currency} {job.salary_min.toLocaleString()}{job.salary_max ? `–${job.salary_max.toLocaleString()}` : '+'}</span>}
                  </div>
                </div>
                <form action={unsaveJob}>
                  <input type="hidden" name="job_id" value={job.id} />
                  <SubmitButton className="text-xs text-red-400 hover:text-red-500 font-medium hover:underline shrink-0" pendingText="Removing...">Remove</SubmitButton>
                </form>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

              {isVerified && !isApplied && (
                <details>
                  <summary className="cursor-pointer list-none">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Apply Now <ArrowRight className="h-4 w-4" /></span>
                  </summary>
                  <form action={applyToJob} encType="multipart/form-data" className="mt-3 space-y-3 border-t border-border pt-3">
                    <input type="hidden" name="job_id" value={job.id} />
                    <textarea name="cover_letter" rows={3} placeholder="Cover letter (optional)…" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    <input type="file" name="resume" accept=".pdf,.doc,.docx" className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
                    <SubmitButton className="rounded-lg bg-primary flex items-center justify-center gap-2 text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors" pendingText="Submitting...">Submit Application</SubmitButton>
                  </form>
                </details>
              )}
              {isApplied && <p className="text-xs text-indigo-500 font-semibold">✓ Already applied</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
