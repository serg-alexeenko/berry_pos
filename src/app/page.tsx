import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Berry POS</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Можливості
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Ціни
            </Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Про нас
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Увійти
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Почати безкоштовно
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              🚀 Нова версія 2.0
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Сучасна система управління{" "}
              <span className="gradient-text">рестораном</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Berry POS - це інтелектуальна платформа для управління закладом харчування. 
              Від замовлень до аналітики - все в одному місці з сучасним дизайном.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                Почати безкоштовно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Демо доступ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container px-4 py-24">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Можливості системи
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Всі необхідні інструменти для успішного управління вашим бізнесом
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>POS Система</CardTitle>
                <CardDescription>
                  Швидке оформлення замовлень, різні способи оплати, управління меню та запасами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Швидкий пошук товарів
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Різні способи оплати
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Управління запасами
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Аналітика та звіти</CardTitle>
                <CardDescription>
                  Детальні звіти по продажах, популярні продукти, статистика відвідувачів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Звіти по продажах
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Аналіз популярності
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    KPI метрики
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>CRM система</CardTitle>
                <CardDescription>
                  Управління клієнтами, програма лояльності, персональні пропозиції
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    База клієнтів
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Програма лояльності
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Маркетингові кампанії
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Швидкість та продуктивність</CardTitle>
                <CardDescription>
                  Оптимізована система для швидкої роботи та обслуговування клієнтів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Швидкий старт
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Оптимізований UI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Мінімум натискань
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Безпека та надійність</CardTitle>
                <CardDescription>
                  Захист даних, резервне копіювання, контроль доступу користувачів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Шифрування даних
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Резервне копіювання
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Контроль доступу
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Мобільна адаптація</CardTitle>
                <CardDescription>
                  Повністю адаптивний дизайн для всіх пристроїв та розмірів екрану
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Адаптивний дизайн
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Touch-friendly
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Всі розміри екрану
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-24">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Готові почати?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Приєднуйтесь до тисяч ресторанів, які вже використовують Berry POS
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                Створити акаунт
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Спробувати демо
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Berry POS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Сучасна система управління рестораном та закладами харчування
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Продукт</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Можливості</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Ціни</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Документація</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Підтримка</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Допомога</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Контакти</Link></li>
                <li><Link href="/status" className="hover:text-foreground transition-colors">Статус системи</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Компанія</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">Про нас</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Блог</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Кар'єра</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Berry POS. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
