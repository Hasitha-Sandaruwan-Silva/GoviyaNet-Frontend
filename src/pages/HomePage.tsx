import { motion } from 'framer-motion'
import {
  Leaf,
  DollarSign,
  Truck,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Bike,
  ArrowRight,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { AppCard } from '@/components/shared/AppCard'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { UNSPLASH_IMAGES } from '@/lib/constants'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    icon: Leaf,
    title: 'Direct from Farm',
    desc: 'Buy straight from verified local farmers.',
  },
  {
    icon: DollarSign,
    title: 'Fair Prices',
    desc: 'Farmers keep more — buyers pay less.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Trusted riders deliver fresh to your door.',
  },
]

const steps = [
  {
    icon: Store,
    title: 'Farmers list fresh produce',
    desc: 'Post available harvests, update quantities, and sell directly without unnecessary middlemen.',
  },
  {
    icon: Users,
    title: 'Buyers place orders easily',
    desc: 'Browse trusted local produce, compare prices, and order fresh goods in a few clicks.',
  },
  {
    icon: Bike,
    title: 'Riders deliver islandwide',
    desc: 'Reliable delivery riders bring produce to homes and businesses while it is still fresh.',
  },
]

export function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50">
      {/* Lightweight background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-80px] top-[-40px] h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute right-[-80px] top-[120px] h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute bottom-[-80px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Logo size="md" />

          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 pb-24">
        {/* Hero */}
        <section className="grid min-h-[calc(100vh-88px)] items-center gap-14 py-10 lg:grid-cols-2 lg:py-16">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div
              variants={staggerItem}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              From Farm. To Table. Directly.
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="mb-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl"
            >
              Cut the Middlemen.{' '}
              <span className="text-gradient">Empower Sri Lankan Farmers.</span>
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mb-8 max-w-xl text-lg leading-8 text-slate-600"
            >
              GoviyaNet connects farmers, buyers, and delivery riders — fair prices, fresh
              produce, zero unnecessary middlemen.
            </motion.p>

            <motion.div variants={staggerItem} className="mb-8 flex flex-wrap gap-4">
              <Button size="lg" asChild className="shadow-md">
                <Link to="/register" className="inline-flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </motion.div>

            <motion.div variants={staggerItem} className="mb-10 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: 'Verified farmers' },
                { icon: Leaf, label: 'Fresh daily produce' },
                { icon: Truck, label: 'Doorstep delivery' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
                >
                  <Icon className="h-4 w-4 text-brand-600" />
                  {label}
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                { value: '1,200+', label: 'Farmers' },
                { value: '5,400+', label: 'Buyers' },
                { value: '50,000+', label: 'kg delivered' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="block text-3xl font-bold text-slate-900">{stat.value}</span>
                  <span className="text-sm text-slate-600">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative mx-auto w-full max-w-2xl"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-100/60 via-emerald-50/60 to-sky-100/60 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/70 bg-white/70 p-3 shadow-xl">
              <img
                src={UNSPLASH_IMAGES.hero}
                alt="Fresh Sri Lankan produce"
                className="h-full w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
            >
              <p className="text-xs text-slate-500">Live order</p>
              <p className="font-semibold text-slate-900">2kg Tomatoes → Colombo</p>
              <p className="text-sm text-brand-600">Rs. 340.00</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -right-4 top-10 rounded-2xl bg-slate-900 p-4 text-white shadow-lg"
            >
              <p className="text-xs text-slate-300">Farmer earnings</p>
              <p className="text-lg font-semibold">+18% more income</p>
              <p className="text-sm text-emerald-300">Less dependency on middlemen</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10"
        >
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              Why GoviyaNet
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              A smarter marketplace for Sri Lanka’s agricultural future
            </h2>
            <p className="text-slate-600">
              Built to support farmers, simplify buying, and make delivery smoother for everyone.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={staggerItem} whileHover={{ y: -6 }}>
                <AppCard
                  hover
                  className="h-full border-0 bg-white p-6 shadow-md ring-1 ring-slate-200/70"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-emerald-50">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
                  <p className="leading-7 text-slate-600">{desc}</p>
                </AppCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              How it works
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Simple flow. Real impact.
            </h2>
            <p className="text-slate-600">
              Everyone wins when the process is transparent, direct, and efficient.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }, index) => (
              <motion.div key={title} variants={staggerItem} whileHover={{ y: -6 }}>
                <AppCard className="relative h-full border-0 bg-white p-6 shadow-md ring-1 ring-slate-200/70">
                  <div className="absolute right-5 top-5 text-5xl font-bold text-slate-100">
                    0{index + 1}
                  </div>

                  <div className="relative z-10">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="leading-7 text-slate-600">{desc}</p>
                  </div>
                </AppCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-12 shadow-2xl md:px-10 md:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_30%)]" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
                  Join the movement
                </p>
                <h3 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Help build a fairer digital marketplace for Sri Lankan agriculture
                </h3>
                <p className="text-slate-300">
                  Whether you’re a farmer, buyer, or rider — GoviyaNet helps you connect faster,
                  trade fairer, and grow together.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="shadow-md">
                  <Link to="/register" className="inline-flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-sm text-slate-500">
        Made in Sri Lanka 🇱🇰 · © {new Date().getFullYear()} GoviyaNet · NIBM EAD II
      </footer>
    </div>
  )
}