import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react'
import { approveVerification, rejectVerification } from '../actions'
import { SubmitButton } from '@/components/submit-button'

const statusConfig = {
  pending:  { label: 'Pending',  icon: Clock,         color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  approved: { label: 'Approved', icon: CheckCircle2,  color: 'text-green-400  bg-green-500/10  border-green-500/30'  },
  rejected: { label: 'Rejected', icon: XCircle,       color: 'text-red-400    bg-red-500/10    border-red-500/30'    },
}

export default async function VerificationQueuePage() {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('verification_requests')
    .select(`
      *,
      profiles:user_id (
        id, first_name, last_name, company_name, role, avatar_url
      )
    `)
    .order('created_at', { ascending: true })

  const pending = requests?.filter(r => r.status === 'pending') ?? []
  const resolved = requests?.filter(r => r.status !== 'pending') ?? []

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Verification Queue</h1>
          <p className="text-zinc-400 mt-1">Review and approve identity and company documents.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full font-semibold">
          <Clock className="h-4 w-4" /> {pending.length} pending
        </div>
      </div>

      {pending.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-white">All caught up!</p>
          <p className="text-zinc-400 text-sm mt-1">No pending verification requests at this time.</p>
        </div>
      )}

      <div className="space-y-4">
        {await Promise.all(pending.map(async (req) => {
          const profile = req.profiles as { id: string; first_name: string; last_name: string; company_name: string; role: string; avatar_url: string }
          
          let docUrl = req.document_url;
          if (docUrl.includes('/public/verification_docs/')) {
            const path = docUrl.split('/public/verification_docs/')[1];
            if (path) {
              const { data } = await supabase.storage.from('verification_docs').createSignedUrl(path, 3600);
              if (data?.signedUrl) {
                docUrl = data.signedUrl;
              }
            }
          }

          return (
            <div key={req.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg shrink-0">
                    {profile?.first_name?.[0] ?? '?'}{profile?.last_name?.[0] ?? ''}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {profile?.first_name} {profile?.last_name}
                      {profile?.company_name && <span className="text-zinc-400 font-normal"> · {profile.company_name}</span>}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${profile?.role === 'employer' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 'text-purple-400 bg-purple-500/10 border-purple-500/30'}`}>
                      {profile?.role}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 shrink-0">{new Date(req.created_at!).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Submitted Document</p>
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  View Document ({req.document_type}) ↗
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-800">
                <form action={approveVerification} className="flex-1">
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="userId" value={req.user_id} />
                  <SubmitButton className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold py-2.5 text-sm transition-colors" pendingText={<><CheckCircle2 className="h-4 w-4" /> Approving...</>}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </SubmitButton>
                </form>
                <form action={rejectVerification} className="flex-1">
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="userId" value={req.user_id} />
                  <input
                    type="text"
                    name="notes"
                    placeholder="Rejection reason (optional)"
                    className="w-full mb-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                  <SubmitButton className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-2.5 text-sm transition-colors" pendingText={<><XCircle className="h-4 w-4" /> Rejecting...</>}>
                    <XCircle className="h-4 w-4" /> Reject
                  </SubmitButton>
                </form>
              </div>
            </div>
          )
        }))}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-zinc-400 mb-4">Previously Resolved</h2>
          <div className="space-y-3">
            {resolved.map((req) => {
              const profile = req.profiles as { first_name: string; last_name: string; role: string }
              const cfg = statusConfig[req.status as keyof typeof statusConfig]
              return (
                <div key={req.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 flex items-center justify-between">
                  <p className="text-sm text-zinc-300 font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                    <cfg.icon className="h-3 w-3" /> {cfg.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
