"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Package,
  Receipt,
  UserPlus,
  Building2
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Головна панель"
  },
  {
    name: "POS Система",
    href: "/pos",
    icon: ShoppingCart,
    description: "Обслуговування клієнтів"
  },
  {
    name: "Меню",
    href: "/menu",
    icon: Package,
    description: "Управління продуктами"
  },
  {
    name: "Замовлення",
    href: "/orders",
    icon: Receipt,
    description: "Управління замовленнями"
  },
  {
    name: "Клієнти",
    href: "/customers",
    icon: UserPlus,
    description: "База клієнтів"
  },
  {
    name: "Аналітика",
    href: "/analytics",
    icon: BarChart3,
    description: "Звіти та статистика"
  },
  {
    name: "Бізнес",
    href: "/create-business",
    icon: Building2,
    description: "Налаштування бізнесу"
  },
  {
    name: "Налаштування",
    href: "/settings",
    icon: Settings,
    description: "Системні налаштування"
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Berry POS</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            <div className="border-t p-4">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.email || "Користувач"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role || "Роль"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start mt-2"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Вийти
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Berry POS</span>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`sidebar-item ${isActive ? 'active' : ''}`}
                        >
                          <item.icon className="h-5 w-5" />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              <li className="mt-auto">
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.email || "Користувач"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.role || "Роль"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mt-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Вийти
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-border lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              
              {/* Separator */}
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-x-2">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
