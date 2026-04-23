import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Briefcase, DollarSign, BookmarkPlus, ArrowRight, ShieldCheck, Clock } from 'lucide-react'
import { saveJob, applyToJob } from '../actions'
import { SubmitButton } from '@/components/submit-button'
import { formatCurrency } from '@/lib/formatters'

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; location?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status')
    .eq('id', user!.id)
    .single()

  if (profile?.role === 'employer') redirect('/dashboard/jobs/employer')

  const params = await searchParams
  const isVerified = profile?.verification_status === 'verified'

  let query = supabase
    .from('jobs')
    .select(`*, profiles:employer_id (first_name, last_name, company_name, verification_status, avatar_url)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (params.q) query = query.ilike('title', `%${params.q}%`)
  if (params.type) query = query.eq('job_type', params.type)
  if (params.location) query = query.ilike('location', `%${params.location}%`)

  const { data: jobs } = await query

  // Get saved & applied job IDs
  const { data: savedJobs } = await supabase.from('saved_jobs').select('job_id').eq('seeker_id', user!.id)
  const { data: appliedJobs } = await supabase.from('applications').select('job_id').eq('seeker_id', user!.id)
  const savedIds = new Set(savedJobs?.map(s => s.job_id))
  const appliedIds = new Set(appliedJobs?.map(a => a.job_id))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1">Discover verified opportunities from verified employers.</p>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-5 py-4 flex items-center gap-3 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
          <Clock className="h-4 w-4 shrink-0" />
          You can browse jobs, but you must be <a href="/dashboard/verify" className="underline font-bold ml-1">verified</a>&nbsp;to apply.
        </div>
      )}

      {/* Search & Filters */}
      <form method="GET" className="flex flex-col sm:flex-row gap-3">
        <input name="q" defaultValue={params.q} placeholder="Search by job title…" className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <input name="location" defaultValue={params.location} placeholder="Location…" className="sm:w-44 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <select name="type" defaultValue={params.type} className="sm:w-44 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="freelance">Freelance</option>
        </select>
        <SubmitButton className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors" pendingText="Searching...">Search</SubmitButton>
      </form>

      <div className="space-y-4">
        {jobs?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No jobs found. Try adjusting your filters.</p>
          </div>
        )}
        {jobs?.map(job => {
          const employer = job.profiles as { company_name: string; verification_status: string }
          const isSaved = savedIds.has(job.id)
          const isApplied = appliedIds.has(job.id)
          return (
            <div key={job.id} className="rounded-2xl border border-border bg-background p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    {employer?.verification_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-medium">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                    {isApplied && <span className="text-xs text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-medium">Applied</span>}
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">{employer?.company_name ?? 'Company'}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}{job.is_remote ? ' (Remote OK)' : ''}</span>}
                    {job.job_type && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /><span className="capitalize">{job.job_type.replace('_', ' ')}</span></span>}
                    {job.salary_min && <span className="flex items-center gap-1"><span className="font-bold text-primary">{formatCurrency(job.salary_min, job.salary_currency)}{job.salary_max ? ` – ${formatCurrency(job.salary_max, job.salary_currency)}` : '+'}</span></span>}
                  </div>
                </div>
                <form action={saveJob} className="shrink-0">
                  <input type="hidden" name="job_id" value={job.id} />
                  <SubmitButton title={isSaved ? 'Saved' : 'Save job'} className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}>
                    <BookmarkPlus className="h-5 w-5" />
                  </SubmitButton>
                </form>
              </div>

              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <Link 
                  href={`/dashboard/jobs/${job.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View Details & Apply <ArrowRight className="h-4 w-4" />
                </Link>
                {isApplied && (
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-green-500" /> Application submitted
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
