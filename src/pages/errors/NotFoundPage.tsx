import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
        <FileQuestion className="h-10 w-10 text-brand-500" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-2 max-w-md text-slate-600">This page doesn&apos;t exist or has been moved.</p>
      <Button className="mt-8" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}
