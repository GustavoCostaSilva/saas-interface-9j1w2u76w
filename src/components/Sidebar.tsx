import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, MailCheck, Sheet as SheetIcon, Users } from 'lucide-react'

interface SidebarProps {
  className?: string
  onLinkClick?: () => void
}

const navigation = [
  { name: 'Dibai Hub', href: '/', icon: Home },
  { name: 'Validador de E-mail', href: '/email-validator', icon: MailCheck },
  {
    name: 'Conversor de Planilhas',
    href: '/spreadsheet-converter',
    icon: SheetIcon,
  },
  {
    name: 'Processador de Contatos',
    href: '/partner-contact-extractor',
    icon: Users,
  },
]

export function Sidebar({ className, onLinkClick }: SidebarProps) {
  return (
    <nav className={cn('flex flex-col space-y-2', className)}>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onLinkClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
          end={item.href === '/'}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  )
}
