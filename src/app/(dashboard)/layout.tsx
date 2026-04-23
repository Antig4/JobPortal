import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck, LogOut, User, Briefcase, FileText,
  Bookmark, Search, MessageSquare, Bell, PlusCircle, Users
} from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status, first_name, last_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')

  const isSeeker = profile?.role === 'seeker'
  const isVerified = profile?.verification_status === 'verified'

  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  let unreadApplicants = 0
  if (!isSeeker) {
    const { data: myJobs } = await supabase.from('jobs').select('id').eq('employer_id', user.id)
    const jobIds = myJobs?.map(j => j.id) ?? []
    if (jobIds.length > 0) {
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds)
        .eq('status', 'applied')
      unreadApplicants = count ?? 0
    }
  }

  const seekerLinks = [
    { href: '/dashboard', label: 'Overview', icon: Briefcase },
    { href: '/dashboard/verify', label: 'Verification', icon: ShieldCheck },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/jobs', label: 'Browse Jobs', icon: Search },
    { href: '/dashboard/applications', label: 'My Applications', icon: FileText },
    { href: '/dashboard/saved', label: 'Saved Jobs', icon: Bookmark },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages && unreadMessages > 0 ? unreadMessages : undefined },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications && unreadNotifications > 0 ? unreadNotifications : undefined },
  ]

  const employerLinks = [
    { href: '/dashboard', label: 'Overview', icon: Briefcase },
    { href: '/dashboard/verify', label: 'Verification', icon: ShieldCheck },
    { href: '/dashboard/profile', label: 'Company Profile', icon: User },
    { href: '/dashboard/jobs/post', label: 'Post a Job', icon: PlusCircle },
    { href: '/dashboard/jobs', label: 'My Job Posts', icon: FileText },
    { href: '/dashboard/applicants', label: 'Applicants', icon: Users, badge: unreadApplicants > 0 ? unreadApplicants : undefined },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages && unreadMessages > 0 ? unreadMessages : undefined },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications && unreadNotifications > 0 ? unreadNotifications : undefined },
  ]

  const navLinks = isSeeker ? seekerLinks : employerLinks

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 bg-background border-r border-border flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <ShieldCheck className="h-6 w-6" /> VerifyJob
          </Link>
        </div>

        {/* Verification status banner */}
        {!isVerified && (
          <Link href="/dashboard/verify" className="mx-3 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs font-semibold hover:bg-yellow-500/20 transition-colors">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {profile?.verification_status === 'pending' ? 'Verification pending…' : 'Complete verification →'}
          </Link>
        )}

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </div>
              {badge && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <>{profile?.first_name?.[0] ?? user.email?.[0]?.toUpperCase()}</>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  )
}
