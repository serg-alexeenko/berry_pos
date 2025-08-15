'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Menu, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings,
  Building,
  LogOut,
  ChevronDown
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  description: string
  submenu?: Array<{
    name: string
    href: string
    description: string
  }>
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Головна панель'
    },
    {
      name: 'Меню',
      href: '/menu',
      icon: Menu,
      description: 'Управління меню',
      submenu: [
        { name: 'Огляд', href: '/menu', description: 'Загальний огляд меню' },
        { name: 'Категорії', href: '/menu/categories', description: 'Управління категоріями' },
        { name: 'Продукти', href: '/menu/products', description: 'Управління продуктами' }
      ]
    },

    {
      name: 'Замовлення',
      href: '/orders',
      icon: ShoppingCart,
      description: 'Управління замовленнями'
    },
    {
      name: 'Клієнти',
      href: '/customers',
      icon: Users,
      description: 'Управління клієнтами'
    },
    {
      name: 'Аналітика',
      href: '/analytics',
      icon: BarChart3,
      description: 'Звіти та статистика'
    },
    {
      name: 'POS',
      href: '/pos',
      icon: CreditCard,
      description: 'Точка продажу'
    },
    {
      name: 'Налаштування',
      href: '/settings',
      icon: Settings,
      description: 'Налаштування системи'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed */}
      <div className={`bg-white transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-50 ${
        sidebarCollapsed 
          ? 'w-16 shadow-[2px_0_8px_rgba(0,0,0,0.1)]' 
          : 'w-64 shadow-lg'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-20">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Berry POS</span>
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href))
            const hasSubmenu = item.submenu && item.submenu.length > 0
            
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.description : ''}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{item.name}</span>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                      {hasSubmenu && (
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                          isActive ? 'rotate-180' : ''
                        }`} />
                      )}
                    </>
                  )}
                </Link>
                
                {/* Submenu */}
                {!sidebarCollapsed && hasSubmenu && isActive && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu!.map((subItem) => {
                      const isSubActive = pathname === subItem.href
                      
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                            isSubActive 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                          title={subItem.description}
                        >
                          <span className="font-medium">{subItem.name}</span>
                          <p className="text-xs text-gray-500 truncate">{subItem.description}</p>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Section - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Користувач</p>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="p-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title={sidebarCollapsed ? 'Вийти' : ''}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - With margin for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Top Header - Fixed */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-0 z-40 transition-all duration-300 ease-in-out h-20 flex items-center" style={{
          left: sidebarCollapsed ? '64px' : '256px'
        }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navigationItems.find(item => pathname === item.href)?.name || 'Berry POS'}
                </h1>
                <p className="text-sm text-gray-500">
                  {navigationItems.find(item => pathname === item.href)?.description || 'Система управління бізнесом'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Building className="h-4 w-4" />
                <span>Бізнес</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - With top margin for fixed header */}
        <main className="flex-1 overflow-auto pt-20">
          {children}
        </main>
      </div>
    </div>
  )
}
