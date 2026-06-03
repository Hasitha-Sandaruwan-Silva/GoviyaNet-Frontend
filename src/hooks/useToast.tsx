import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function useToast() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, {
        description,
        icon: <CheckCircle2 className="h-4 w-4" />,
      }),
    error: (message: string, description?: string) =>
      toast.error(message, {
        description,
        icon: <AlertCircle className="h-4 w-4" />,
      }),
    warning: (message: string, description?: string) =>
      toast.warning(message, {
        description,
        icon: <AlertTriangle className="h-4 w-4" />,
      }),
    info: (message: string, description?: string) =>
      toast.info(message, {
        description,
        icon: <Info className="h-4 w-4" />,
      }),
  }
}
