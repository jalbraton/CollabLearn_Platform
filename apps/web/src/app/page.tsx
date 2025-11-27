import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Users, 
  Zap, 
  Lock, 
  Globe, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CollabLearn</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span>Powered by AI & Real-time Collaboration</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Team&apos;s
              <br />
              <span className="text-primary">Knowledge Hub</span>
            </h1>
            
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              Collaborate in real-time, organize your knowledge, and build
              documentation that grows with your team. The modern platform for
              learning and collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Unlimited Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Powerful features for modern teams
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Real-time Collaboration"
              description="Edit documents together with your team in real-time. See cursor positions and changes instantly."
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Enterprise Security"
              description="2FA, SSO, encryption at rest and in transit. Your data is always protected."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Workspaces"
              description="Organize your team with workspaces, roles, and granular permissions."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Public & Private Pages"
              description="Share knowledge publicly or keep it private within your workspace."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="AI-Powered"
              description="Smart suggestions, auto-tagging, and content generation with AI."
            />
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Rich Content Editor"
              description="Create beautiful documentation with our powerful block-based editor."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="rounded-lg border bg-card p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using CollabLearn to organize their
              knowledge and collaborate more effectively.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Create Your Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">CollabLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 CollabLearn Platform. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-primary">
                Docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4 hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center rounded-md bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
