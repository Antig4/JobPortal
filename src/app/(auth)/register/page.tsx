import { register } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/submit-button'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">Join the verified professional network</p>
      </div>

      {params?.message && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-lg text-center">
          {params.message}
        </div>
      )}

      <form action={register} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium leading-none">I am a</label>
          <select 
            id="role" 
            name="role" 
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <option value="seeker">Job Seeker</option>
            <option value="employer">Employer / Recruiter</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium leading-none">First Name</label>
            <input
              id="firstName" name="firstName" required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name</label>
            <input
              id="lastName" name="lastName" required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
          <input
            id="email" name="email" type="email" required
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            placeholder="m@example.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
          <input
            id="password" name="password" type="password" required
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>
        
        <SubmitButton
          className="inline-flex w-full mt-4 items-center justify-center rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          pendingText="Creating Account..."
        >
          Create Account
        </SubmitButton>
      </form>
      
      <div className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
