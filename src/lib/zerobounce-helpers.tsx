import {
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Ban,
  MailWarning,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ValidationStatus } from '@/types/zerobounce'

export const statusConfig: Record<
  ValidationStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  valid: { icon: CheckCircle, color: 'text-success', label: 'Válido' },
  invalid: { icon: XCircle, color: 'text-destructive', label: 'Inválido' },
  'catch-all': {
    icon: AlertCircle,
    color: 'text-yellow-500',
    label: 'Catch-all',
  },
  unknown: {
    icon: HelpCircle,
    color: 'text-muted-foreground',
    label: 'Desconhecido',
  },
  spamtrap: { icon: ShieldAlert, color: 'text-orange-500', label: 'Spamtrap' },
  abuse: { icon: Ban, color: 'text-red-600', label: 'Abuso' },
  do_not_mail: {
    icon: MailWarning,
    color: 'text-gray-500',
    label: 'Não Enviar',
  },
}

export const renderStatus = (status: ValidationStatus) => {
  const config = statusConfig[status] || statusConfig.unknown
  return (
    <div className={cn('flex items-center gap-2', config.color)}>
      <config.icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  )
}
