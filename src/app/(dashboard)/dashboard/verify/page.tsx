import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, CheckCircle2, Clock, XCircle, Upload } from 'lucide-react'
import { uploadVerificationDoc } from '../actions'
import { SubmitButton } from '@/components/submit-button'

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status, verification_notes')
    .eq('id', user!.id)
    .single()

  const { data: requests } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const isVerified = profile?.verification_status === 'verified'
  const isPending = profile?.verification_status === 'pending'
  const isSeeker = profile?.role === 'seeker'

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Identity Verification</h1>
        <p className="text-muted-foreground mt-1">Submit documents to unlock full platform access.</p>
      </div>

      {params?.message && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-xl">
          {params.message}
        </div>
      )}

      {/* Status card */}
      <div className={`rounded-2xl border p-6 flex items-center gap-4 ${
        isVerified ? 'border-green-500/30 bg-green-500/5' :
        isPending   ? 'border-yellow-500/30 bg-yellow-500/5' :
                      'border-red-500/30 bg-red-500/5'
      }`}>
        {isVerified && <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />}
        {isPending  && <Clock className="h-8 w-8 text-yellow-500 shrink-0" />}
        {!isVerified && !isPending && <XCircle className="h-8 w-8 text-red-500 shrink-0" />}
        <div>
          <h3 className="font-bold text-lg">
            {isVerified ? 'Account Verified ✓' : isPending ? 'Under Review' : 'Verification Required'}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isVerified && 'You have full access to all platform features.'}
            {isPending  && 'Your documents are being reviewed. This usually takes 1-2 business days.'}
            {!isVerified && !isPending && (profile?.verification_notes
              ? `Rejected: ${profile.verification_notes}. Please re-submit corrected documents.`
              : 'Submit your documents below to begin the verification process.'
            )}
          </p>
        </div>
      </div>

      {/* What you unlock */}
      {!isVerified && (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-3">
          <h2 className="font-semibold text-base">What you unlock after verification</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {isSeeker ? (
              <>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Apply to verified job postings</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Message employers who shortlist you</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Display a Verified Candidate badge</li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Post job listings</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Message verified candidates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Display a Verified Employer badge</li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Upload form */}
      {!isVerified && (
        <form action={uploadVerificationDoc} className="rounded-2xl border border-border bg-background p-6 space-y-5">
          <h2 className="font-bold text-lg">{isPending ? 'Re-submit Documents' : 'Upload Documents'}</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <select name="document_type" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {isSeeker ? (
                <>
                  <option value="government_id">Government-issued ID (Passport, Driver&apos;s License, etc.)</option>
                  <option value="national_id">National ID Card</option>
                </>
              ) : (
                <>
                  <option value="business_registration">Business Registration Certificate</option>
                  <option value="tax_document">Tax Registration Document</option>
                  <option value="company_license">Company License</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload File</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Click to select or drag & drop</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG – max 10MB</p>
              <input
                type="file"
                name="document"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                className="mt-3 text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
            </div>
          </div>

          <SubmitButton className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:bg-primary/90 transition-colors" pendingText={<><ShieldCheck className="h-5 w-5" /> Submitting...</>}>
            <ShieldCheck className="h-5 w-5" /> Submit for Verification
          </SubmitButton>
        </form>
      )}

      {/* Previous requests */}
      {requests && requests.length > 0 && (
        <div>
          <h2 className="font-bold text-base mb-3 text-muted-foreground uppercase text-xs tracking-wider">Submission History</h2>
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-background px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{r.document_type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at!).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  r.status === 'approved' ? 'text-green-500 bg-green-500/10' :
                  r.status === 'pending'  ? 'text-yellow-500 bg-yellow-500/10' :
                                            'text-red-500 bg-red-500/10'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
