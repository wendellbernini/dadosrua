'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/collector', label: 'Campanhas', icon: Home },
    { href: '/collector/add-contact', label: 'Adicionar', icon: Plus },
    { href: '/collector/my-contacts', label: 'Meus Contatos', icon: Users },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
