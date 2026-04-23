import { createClient } from '@/lib/supabase/server'
import { Users, Briefcase, FileCheck, TrendingUp, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalJobs },
    { count: pendingVerifications },
    { count: pendingJobs },
    { count: verifiedUsers },
    { count: rejectedUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending_moderation'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified').neq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'rejected').neq('role', 'admin'),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Total Jobs', value: totalJobs ?? 0, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Verifications', value: pendingVerifications ?? 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/admin/verification' },
    { label: 'Jobs Pending Moderation', value: pendingJobs ?? 0, icon: FileCheck, color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/admin/jobs' },
    { label: 'Verified Users', value: verifiedUsers ?? 0, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Rejected Users', value: rejectedUsers ?? 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-1">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
              <p className="text-4xl font-extrabold text-white mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Verification Rate</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-4">Percentage of users who completed verification</p>
        <div className="w-full bg-zinc-800 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
            style={{ width: `${totalUsers ? Math.round(((verifiedUsers ?? 0) / totalUsers) * 100) : 0}%` }}
          />
        </div>
        <p className="text-sm text-zinc-400 mt-2">
          {totalUsers ? Math.round(((verifiedUsers ?? 0) / totalUsers) * 100) : 0}% verified ({verifiedUsers ?? 0} of {totalUsers ?? 0} users)
        </p>
      </div>
    </div>
  )
}
