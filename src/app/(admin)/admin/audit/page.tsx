import { createClient } from '@/lib/supabase/server'
import { ClipboardList } from 'lucide-react'

const actionColors: Record<string, string> = {
  approve_verification: 'text-green-400 bg-green-500/10',
  reject_verification: 'text-red-400 bg-red-500/10',
  approve_job: 'text-blue-400 bg-blue-500/10',
  reject_job: 'text-orange-400 bg-orange-500/10',
  update_user_role: 'text-purple-400 bg-purple-500/10',
}

export default async function AuditLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`*, profiles:actor_id (first_name, last_name, role)`)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Audit Logs</h1>
        <p className="text-zinc-400 mt-1">Complete history of all admin actions on the platform.</p>
      </div>

      {(!logs || logs.length === 0) ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No audit log entries yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actor</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {logs.map((log) => {
                const actor = log.profiles as { first_name: string; last_name: string; role: string }
                const colorClass = actionColors[log.action] ?? 'text-zinc-400 bg-zinc-700/30'
                return (
                  <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3 text-zinc-500 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-white font-medium">
                      {actor ? `${actor.first_name} ${actor.last_name}` : 'System'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400 font-mono text-xs">
                      {log.target_table ?? '—'} {log.target_id ? `· ${log.target_id.slice(0, 8)}…` : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
