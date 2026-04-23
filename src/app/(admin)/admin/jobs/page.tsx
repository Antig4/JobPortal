import { createClient } from '@/lib/supabase/server'
import { Briefcase, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { approveJob, rejectJob } from '../actions'
import { SubmitButton } from '@/components/submit-button'
import { formatCurrency } from '@/lib/formatters'

export default async function JobModerationPage() {
  const supabase = await createClient()

  const { data: pendingJobs } = await supabase
    .from('jobs')
    .select(`*, profiles:employer_id (first_name, last_name, company_name, verification_status)`)
    .eq('status', 'pending_moderation')
    .order('created_at', { ascending: true })

  const { data: activeJobs } = await supabase
    .from('jobs')
    .select(`*, profiles:employer_id (first_name, last_name, company_name, verification_status)`)
    .in('status', ['active', 'closed'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Job Moderation</h1>
          <p className="text-zinc-400 mt-1">Review jobs before they go live on the platform.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-full font-semibold">
          <AlertCircle className="h-4 w-4" /> {pendingJobs?.length ?? 0} pending
        </div>
      </div>

      {pendingJobs?.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <Briefcase className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-white">No jobs pending review</p>
          <p className="text-zinc-400 text-sm mt-1">All job posts have been moderated.</p>
        </div>
      )}

      <div className="space-y-4">
        {pendingJobs?.map((job) => {
          const employer = job.profiles as { first_name: string; last_name: string; company_name: string; verification_status: string }
          return (
            <div key={job.id} className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <p className="text-zinc-400 text-sm mt-0.5">
                    {employer?.company_name ?? `${employer?.first_name} ${employer?.last_name}`}
                    {' · '}{job.location ?? 'Remote'}
                    {' · '}<span className="capitalize">{job.job_type?.replace('_', ' ')}</span>
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${employer?.verification_status === 'verified' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                  {employer?.verification_status === 'verified' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Employer {employer?.verification_status}
                </span>
              </div>

              <div className="text-sm text-zinc-300 bg-zinc-800/50 rounded-xl p-4 line-clamp-3">
                {job.description}
              </div>

              {job.salary_min && (
                <p className="text-sm text-zinc-400">
                  💰 Salary: {formatCurrency(job.salary_min, job.salary_currency)} {job.salary_max ? `– ${formatCurrency(job.salary_max, job.salary_currency)}` : ''} / year
                </p>
              )}

              <div className="flex gap-3 pt-2 border-t border-zinc-800">
                <form action={approveJob} className="flex-1">
                  <input type="hidden" name="jobId" value={job.id} />
                  <SubmitButton className="w-full rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold py-2.5 text-sm transition-colors" pendingText={<><CheckCircle2 className="h-4 w-4" /> Approving...</>}>
                    <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                  </SubmitButton>
                </form>
                <form action={rejectJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <SubmitButton className="rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold px-6 py-2.5 text-sm transition-colors" pendingText={<><XCircle className="h-4 w-4" /> Rejecting...</>}>
                    <XCircle className="h-4 w-4" /> Reject
                  </SubmitButton>
                </form>
              </div>
            </div>
          )
        })}
      </div>

      {(activeJobs?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-lg font-bold text-zinc-400 mb-4">Recently Moderated</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Job</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {activeJobs?.map(job => {
                  const employer = job.profiles as { company_name: string }
                  return (
                    <tr key={job.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{job.title}</td>
                      <td className="px-5 py-3 text-zinc-400">{employer?.company_name ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${job.status === 'active' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-zinc-400 bg-zinc-700/30 border-zinc-700'}`}>
                          {job.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
