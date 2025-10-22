'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Plus, 
  Users, 
  User, 
  LogOut,
  MapPin
} from 'lucide-react'

export function CollectorNavbar() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/collector', label: 'Campanhas', icon: Home },
    { href: '/collector/add-contact', label: 'Adicionar Contato', icon: Plus },
    { href: '/collector/my-contacts', label: 'Meus Contatos', icon: Users },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Marca com ícone */}
          <Link href="/collector" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900">
                  Equipe de Rua
                </span>
                <p className="text-xs text-gray-500 -mt-1">Sistema de Coleta</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Menu do Usuário */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {profile?.full_name || profile?.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/collector/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sem menu hambúrguer no mobile; navegação inferior já existe */}
      </div>
    </nav>
  )
}
