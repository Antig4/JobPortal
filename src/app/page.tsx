import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex-1 flex flex-col pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-24 sm:py-32 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center z-10 space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            <ShieldCheck className="mr-2 h-4 w-4" /> Fully Verified Network
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            The Safe Standard in <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              Professional Hiring
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Connect with pre-verified employers and job seekers. No spam, no scams. Just legitimate opportunities backed by our mutual legitimacy protocol.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-base font-medium text-background shadow-lg transition-transform hover:scale-105">
              Find Your Next Job
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/register?role=employer" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-background/50 backdrop-blur-sm px-8 py-4 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
              Post a Position
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 relative z-10 w-full px-4">
          {[
            { title: "Verified Identity", desc: "Every user submits legal documents for vetting, ensuring a spam-free environment." },
            { title: "Secure Communications", desc: "Encrypted, real-time messaging between shortlisted candidates and recruiters." },
            { title: "Smart Matching", desc: "Advanced AI filters connect the best candidates with top legitimate companies." }
          ].map((feature, i) => (
            <div key={i} className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl p-8 transition-transform hover:-translate-y-1 shadow-sm">
              <CheckCircle className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
