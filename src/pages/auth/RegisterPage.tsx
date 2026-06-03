import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Sprout, ShoppingBag, Bike } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { FloatingInput } from '@/components/shared/FloatingInput'
import { StepProgress } from '@/components/shared/StepProgress'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { PHONE_REGEX } from '@/lib/constants'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    role: z.enum(['FARMER', 'BUYER', 'RIDER']),
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().regex(PHONE_REGEX, 'Invalid Sri Lankan phone number'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const STEPS = ['Choose Role', 'Personal Info', 'Account Setup']
const ROLES = [
  { value: 'FARMER' as const, label: "I'm a Farmer", desc: 'Sell produce directly', icon: Sprout },
  { value: 'BUYER' as const, label: "I'm a Buyer", desc: 'Buy fresh from farms', icon: ShoppingBag },
  { value: 'RIDER' as const, label: "I'm a Rider", desc: 'Earn by delivering', icon: Bike },
]

export function RegisterPage() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const registerUser = useAuthStore((s) => s.register)
  const toast = useToast()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'BUYER' },
    mode: 'onChange',
  })

  const { register, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = form
  const selectedRole = watch('role')

  const nextStep = async () => {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      const valid = await trigger(['fullName', 'email', 'phone'])
      if (valid) setStep(3)
      return
    }
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      })
      toast.success('Account created!', 'Please sign in with your credentials.')
      navigate('/login')
    } catch (error) {
      toast.error('Registration failed', parseApiError(error))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">Create your account</h1>
        <p className="mb-8 text-center text-slate-500">Join GoviyaNet in a few steps</p>

        <StepProgress steps={STEPS} currentStep={step} className="mb-8" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {ROLES.map(({ value, label, desc, icon: Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all',
                      selectedRole === value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 hover:border-brand-200',
                    )}
                  >
                    <input type="radio" value={value} className="sr-only" {...register('role')} />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                      <Icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{label}</p>
                      <p className="text-sm text-slate-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <FloatingInput label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
                <FloatingInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <FloatingInput label="Phone" error={errors.phone?.message} {...register('phone')} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <FloatingInput label="Username" error={errors.username?.message} {...register('username')} />
                <FloatingInput
                  label="Password"
                  type="password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <FloatingInput
                  label="Confirm Password"
                  type="password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : null}
            {step < 3 ? (
              <Button type="button" className="flex-1" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1" loading={isSubmitting}>
                Create Account
              </Button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
