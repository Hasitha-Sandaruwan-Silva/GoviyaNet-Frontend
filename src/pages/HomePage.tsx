import { motion } from 'framer-motion'
import { Leaf, DollarSign, Truck } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { AppCard } from '@/components/shared/AppCard'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { UNSPLASH_IMAGES } from '@/lib/constants'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <Logo size="md" />
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 pb-20">
        <section className="grid min-h-[calc(100vh-120px)] items-center gap-12 lg:grid-cols-2">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600">
              From Farm. To Table. Directly.
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
              Cut the Middlemen.{' '}
              <span className="text-gradient">Empower Sri Lankan Farmers.</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-slate-600">
              GoviyaNet connects farmers, buyers, and delivery riders — fair prices, fresh produce,
              zero unnecessary middlemen.
            </p>
            <div className="mb-10 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-slate-600">
              <div>
                <span className="block text-2xl font-bold text-slate-900">1,200+</span>
                Farmers
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">5,400+</span>
                Buyers
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">50,000+</span>
                kg delivered
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src={UNSPLASH_IMAGES.hero}
              alt="Fresh Sri Lankan produce"
              className="rounded-3xl shadow-2xl"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-4 -left-4 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-lg backdrop-blur-md"
            >
              <p className="text-xs text-slate-500">Live order</p>
              <p className="font-semibold text-slate-900">2kg Tomatoes → Colombo</p>
              <p className="text-sm text-brand-600">Rs. 340.00</p>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-24 grid gap-6 md:grid-cols-3"
        >
          {[
            { icon: Leaf, title: 'Direct from Farm', desc: 'Buy straight from verified local farmers.' },
            { icon: DollarSign, title: 'Fair Prices', desc: 'Farmers keep more — buyers pay less.' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Trusted riders deliver fresh to your door.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={staggerItem}>
              <AppCard hover className="h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <Icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                <p className="text-slate-600">{desc}</p>
              </AppCard>
            </motion.div>
          ))}
        </motion.section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        Made in Sri Lanka 🇱🇰 · © {new Date().getFullYear()} GoviyaNet · NIBM EAD II
      </footer>
    </div>
  )
}
