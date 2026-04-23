import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Clock, XCircle, CheckCircle2, Users } from 'lucide-react'
import { updateUserRole } from '../actions'
import { SubmitButton } from '@/components/submit-button'

const verificationBadge = {
  verified: { label: 'Verified',  color: 'text-green-400  bg-green-500/10  border-green-500/30'  },
  pending:  { label: 'Pending',   color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  rejected: { label: 'Rejected',  color: 'text-red-400    bg-red-500/10    border-red-500/30'    },
}

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
          <p className="text-zinc-400 mt-1">Manage all job seekers and employers on the platform.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-full font-semibold">
          <Users className="h-4 w-4" /> {profiles?.length ?? 0} users
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verification</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>

            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {profiles?.map((profile) => {
              const badge = verificationBadge[profile.verification_status as keyof typeof verificationBadge]
              return (
                <tr key={profile.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 overflow-hidden border border-zinc-700">
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={`${profile.first_name} ${profile.last_name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          profile.first_name?.[0] ?? '?'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{profile.first_name} {profile.last_name}</p>
                        {profile.company_name && <p className="text-xs text-zinc-500">{profile.company_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${profile.role === 'employer' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 'text-purple-400 bg-purple-500/10 border-purple-500/30'}`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge?.color}`}>
                      {profile.verification_status === 'verified' && <CheckCircle2 className="h-3 w-3" />}
                      {profile.verification_status === 'pending'  && <Clock className="h-3 w-3" />}
                      {profile.verification_status === 'rejected' && <XCircle className="h-3 w-3" />}
                      {badge?.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                  </td>

                </tr>
              )
            })}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
