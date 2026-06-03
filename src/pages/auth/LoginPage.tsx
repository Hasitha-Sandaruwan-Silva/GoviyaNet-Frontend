import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { FloatingInput } from '@/components/shared/FloatingInput'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { ROLE_DASHBOARD_PATH, UNSPLASH_IMAGES, type UserRole } from '@/lib/constants'
import { shakeAnimation } from '@/lib/animations'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data)
      toast.success('Welcome back!', `Signed in as ${user.fullName}`)
      const role = user.role.toUpperCase() as UserRole
      const dashboard = ROLE_DASHBOARD_PATH[role]
      if (dashboard) {
        navigate(dashboard, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      toast.error('Login failed', parseApiError(error))
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 lg:block">
        <img
          src={UNSPLASH_IMAGES.farmer}
          alt="Sri Lankan farmer"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex w-full items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <motion.div
          animate={shake ? shakeAnimation : {}}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft"
        >
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mb-8 text-center text-slate-500">Sign in to your GoviyaNet account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FloatingInput
              label="Username"
              error={errors.username?.message}
              {...register('username')}
            />
            <FloatingInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={errors.password?.message}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal text-slate-600">
                  Remember me
                </Label>
              </div>
              <Link to="#" className="text-sm text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button" disabled>
            Google (coming soon)
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
