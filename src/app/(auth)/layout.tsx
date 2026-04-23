import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 text-primary font-bold text-xl transition-transform hover:scale-105">
             <ShieldCheck className="h-6 w-6" /> VerifyJob
          </Link>
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-center p-12 bg-muted/30 border-l border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-md mx-auto space-y-4 backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl">
          <h2 className="text-3xl font-bold">The Trusted Professionals Network</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of verified employers and candidates. Our mutual legitimacy protocol ensures you only interact with real, vetted professionals.
          </p>
        </div>
      </div>
    </div>
  )
}
