import { createClient } from '@/lib/supabase/server'
import { postJob } from '../../actions'
import { redirect } from 'next/navigation'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { SubmitButton } from '@/components/submit-button'

export default async function PostJobPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role, verification_status').eq('id', user!.id).single()

  if (profile?.role === 'seeker') redirect('/dashboard/jobs')
  const isVerified = profile?.verification_status === 'verified'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground mt-1">Fill in the details for your open position.</p>
      </div>

      {!isVerified && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3 text-red-500">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Verification Required</p>
            <p className="text-sm mt-0.5">You must be a <a href="/dashboard/verify" className="underline font-bold">verified employer</a> to post jobs. Your posting will only become visible after verification.</p>
          </div>
        </div>
      )}

      <form action={postJob} className="space-y-6">
        <div className="rounded-2xl border border-border bg-background p-6 space-y-5">
          <h2 className="font-bold text-base">Job Details</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job Title <span className="text-red-500">*</span></label>
            <input name="title" required placeholder="e.g. Senior Frontend Engineer" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job Description <span className="text-red-500">*</span></label>
            <textarea name="description" required rows={6} placeholder="Describe the role, responsibilities, and what a day looks like…" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Requirements</label>
            <textarea name="requirements" rows={4} placeholder="List required qualifications, experience, education…" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 space-y-5">
          <h2 className="font-bold text-base">Location & Type</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <input name="location" placeholder="e.g. Manila, Philippines" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Job Type</label>
              <select name="job_type" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Industry</label>
              <input name="industry" placeholder="e.g. Technology, Finance" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Experience Level</label>
              <select name="experience_level" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" name="is_remote" value="true" id="is_remote" className="h-4 w-4 accent-primary" />
            <label htmlFor="is_remote" className="text-sm font-medium cursor-pointer">Remote work available</label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 space-y-5">
          <h2 className="font-bold text-base">Compensation</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Currency</label>
              <select name="salary_currency" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="USD">USD</option>
                <option value="PHP">PHP</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="SGD">SGD</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Min Salary / yr</label>
              <input name="salary_min" type="number" min="0" placeholder="e.g. 50000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max Salary / yr</label>
              <input name="salary_max" type="number" min="0" placeholder="e.g. 80000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-3 text-sm text-yellow-600 dark:text-yellow-400">
          <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
          Your job post will be reviewed by our admin team before going live. This usually takes a few hours.
        </div>

        <SubmitButton className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-3.5 text-base hover:bg-primary/90 transition-transform hover:scale-[1.01] active:scale-[0.99]" pendingText="Submitting Job Posting...">
          Submit Job Posting
        </SubmitButton>
      </form>
    </div>
  )
}
