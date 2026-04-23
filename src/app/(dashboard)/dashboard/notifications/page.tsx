import { createClient } from '@/lib/supabase/server'
import { Bell, CheckCircle2 } from 'lucide-react'
import { markNotificationsRead, markSingleNotificationRead } from '../actions'
import { SubmitButton } from '@/components/submit-button'
import Link from 'next/link'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your account activity.</p>
        </div>
        
        {unreadCount > 0 && (
          <form action={markNotificationsRead}>
            <SubmitButton pendingText="Marking as read..." className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Mark all as read
            </SubmitButton>
          </form>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border bg-background">
          <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <form key={n.id} action={markSingleNotificationRead} className="block w-full">
              <input type="hidden" name="notification_id" value={n.id} />
              <input type="hidden" name="redirect_url" value={n.link || '#'} />
              <button 
                type="submit"
                className={`w-full text-left rounded-2xl border p-5 transition-colors cursor-pointer block ${n.is_read ? 'bg-background border-border hover:bg-muted/50' : 'bg-primary/5 border-primary/20 hover:bg-primary/10'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className={`font-semibold ${n.is_read ? 'text-foreground' : 'text-primary'}`}>{n.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                  </div>
                  {n.created_at && (
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
