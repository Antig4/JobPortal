import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '../actions'
import { CheckCircle2 } from 'lucide-react'
import { SubmitButton } from '@/components/submit-button'
import { AvatarUpload } from '@/components/AvatarUpload'
import { SuccessNotification } from '@/components/SuccessNotification'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const isEmployer = profile?.role === 'employer'
  const isVerified = profile?.verification_status === 'verified'

  const initials = `${profile?.first_name?.[0] ?? '?'}${profile?.last_name?.[0] ?? ''}`

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {params?.message && <SuccessNotification message={params.message} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{isEmployer ? 'Company Profile' : 'My Profile'}</h1>
          <p className="text-muted-foreground mt-1">Keep your information up to date.</p>
        </div>
        {isVerified && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Verified {isEmployer ? 'Employer' : 'Candidate'}
          </div>
        )}
      </div>

      <form action={updateProfile} className="space-y-6">
        {/* Avatar preview */}
        <div className="flex items-center gap-6">
          <AvatarUpload
            initialAvatarUrl={profile?.avatar_url}
            initials={initials}
          />
          <div>
            <p className="font-semibold text-lg">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-muted-foreground text-sm capitalize">{profile?.role} • {profile?.location ?? 'Location not set'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 space-y-5">
          <h2 className="font-bold text-base">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First Name</label>
              <input name="first_name" defaultValue={profile?.first_name ?? ''} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Last Name</label>
              <input name="last_name" defaultValue={profile?.last_name ?? ''} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          {isEmployer && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company Name</label>
              <input name="company_name" defaultValue={profile?.company_name ?? ''} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio / Summary</label>
            <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ''} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Tell us about yourself or your company..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input name="phone" type="tel" defaultValue={profile?.phone ?? ''} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <input name="location" defaultValue={profile?.location ?? ''} placeholder="City, Country" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Website / LinkedIn</label>
            <input name="website" type="url" defaultValue={profile?.website ?? ''} placeholder="https://" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {!isEmployer && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Skills <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
              <input name="skills" defaultValue={profile?.skills?.join(', ') ?? ''} placeholder="React, TypeScript, Node.js..." className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}
        </div>

        <SubmitButton className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:bg-primary/90 transition-transform hover:scale-[1.01] active:scale-[0.99]" pendingText="Saving Profile...">
          Save Profile
        </SubmitButton>
      </form>
    </div>
  )
}
