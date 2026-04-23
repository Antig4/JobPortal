import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MapPin, Briefcase, DollarSign, Calendar, ShieldCheck, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { incrementJobView, applyToJob } from '../../actions'
import { SubmitButton } from '@/components/submit-button'
import { formatCurrency } from '@/lib/formatters'

export const dynamic = 'force-dynamic'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Increment view count immediately
  await incrementJobView(id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status')
    .eq('id', user!.id)
    .single()

  // Employers should be redirected to their management page
  if (profile?.role === 'employer') redirect('/dashboard/jobs/employer')

  const isVerified = profile?.verification_status === 'verified'

  // Fetch job details
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`*, profiles:employer_id (first_name, last_name, company_name, verification_status, avatar_url, bio)`)
    .eq('id', id)
    .single()

  if (error || !job) notFound()


  // Check if already applied
  const { data: application } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', id)
    .eq('seeker_id', user!.id)
    .single()

  const employer = job.profiles as any

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Browse Jobs
      </Link>

      <div className="bg-background rounded-3xl border border-border overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="p-8 border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold tracking-tight">{job.title}</h1>
                {employer?.verification_status === 'verified' && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Employer
                  </span>
                )}
                {job.is_premium && (
                  <span className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">Featured</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {employer?.avatar_url ? (
                      <img src={employer.avatar_url} alt="Company" className="h-full w-full object-cover" />
                    ) : (
                      <Briefcase className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{employer?.company_name || 'Company'}</span>
                </div>
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}{job.is_remote ? ' (Remote)' : ''}</div>
                <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /><span className="capitalize">{job.job_type?.replace('_', ' ')}</span></div>
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Posted {new Date(job.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            {job.salary_min && (
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center min-w-[160px]">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Salary Range</p>
                <div className="flex items-center justify-center gap-1 text-xl font-extrabold">
                  {formatCurrency(job.salary_min, job.salary_currency)}
                  {job.salary_max && ` – ${formatCurrency(job.salary_max, job.salary_currency)}`}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{job.salary_currency} / YEAR</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="lg:col-span-2 p-8 space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-4">Job Description</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Application Section */}
          <div className="p-8 bg-muted/10 space-y-8">
            <div>
              <h3 className="font-bold mb-4">Apply for this position</h3>
              {!isVerified ? (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-4 w-4 mb-2" />
                  You must be <Link href="/dashboard/verify" className="underline font-bold">verified</Link> to apply for this job.
                </div>
              ) : application ? (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-center">
                  <ShieldCheck className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Application Submitted</p>
                  <p className="text-xs text-muted-foreground mt-1">You've already applied for this job. Check your <Link href="/dashboard/applications" className="underline">applications</Link> for updates.</p>
                </div>
              ) : (
                <form action={applyToJob} className="space-y-4">
                  <input type="hidden" name="job_id" value={job.id} />
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Letter</label>
                    <textarea 
                      name="cover_letter" 
                      rows={5} 
                      placeholder="Tell the employer why you're a great fit…" 
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resume (PDF/DOCX)</label>
                    <input 
                      type="file" 
                      name="resume" 
                      accept=".pdf,.doc,.docx" 
                      className="text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer w-full"
                    />
                  </div>
                  <SubmitButton className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]" pendingText="Submitting...">
                    Submit Application
                  </SubmitButton>
                </form>
              )}
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="font-bold mb-4">About the Company</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {employer?.bio || `${employer?.company_name || 'The company'} is a verified employer on our platform committed to professional hiring standards.`}
              </p>
              <Link href={`/dashboard/messages?chat=${job.employer_id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Ask a question →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
