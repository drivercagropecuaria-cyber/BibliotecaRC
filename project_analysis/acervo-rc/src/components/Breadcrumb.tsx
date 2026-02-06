import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2">
      <Link
        to="/"
        className="flex items-center gap-1 text-rc-text-muted hover:text-rc-gold transition-colors flex-shrink-0"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-rc-text-muted" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-rc-text-muted hover:text-rc-gold transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-rc-text font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
