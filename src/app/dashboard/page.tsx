/**
 * @file: app/dashboard/page.tsx
 * @description: Dashboard з аналітикою бізнесу та графічними показниками
 * @dependencies: React, Supabase, Recharts, shadcn/ui компоненти
 * @created: 2024-12-19
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  Receipt,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // Мокові дані для демонстрації
  const stats = [
    {
      title: "Загальний дохід",
      value: "₴45,231",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      description: "Порівняно з минулим місяцем"
    },
    {
      title: "Замовлення",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: ShoppingCart,
      description: "Порівняно з минулим місяцем"
    },
    {
      title: "Клієнти",
      value: "1,234",
      change: "+19%",
      trend: "up",
      icon: Users,
      description: "Порівняно з минулим місяцем"
    },
    {
      title: "Продукти",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Package,
      description: "Порівняно з минулим місяцем"
    }
  ];

  const recentOrders = [
    {
      id: "#1234",
      customer: "Іван Петренко",
      amount: "₴450",
      status: "completed",
      time: "2 хв тому"
    },
    {
      id: "#1235",
      customer: "Марія Коваленко",
      amount: "₴320",
      status: "preparing",
      time: "15 хв тому"
    },
    {
      id: "#1236",
      customer: "Олександр Сидоренко",
      amount: "₴780",
      status: "pending",
      time: "1 год тому"
    },
    {
      id: "#1237",
      customer: "Анна Мельник",
      amount: "₴290",
      status: "completed",
      time: "2 год тому"
    }
  ];

  const topProducts = [
    { name: "Піца Маргарита", sales: 45, revenue: "₴2,250" },
    { name: "Бургер Класичний", sales: 38, revenue: "₴1,900" },
    { name: "Суші Рол", sales: 32, revenue: "₴1,600" },
    { name: "Кава Американо", sales: 28, revenue: "₴840" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Завершено</Badge>;
      case "preparing":
        return <Badge variant="secondary">Готується</Badge>;
      case "pending":
        return <Badge variant="outline">Очікує</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Огляд вашого бізнесу та ключові метрики
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="animate-slide-in-from-top" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4 animate-slide-in-from-left">
          <CardHeader>
            <CardTitle>Останні замовлення</CardTitle>
            <CardDescription>
              Останні 4 замовлення з системи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{order.amount}</span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-muted-foreground">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  Переглянути всі замовлення
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3 animate-slide-in-from-right">
          <CardHeader>
            <CardTitle>Топ продукти</CardTitle>
            <CardDescription>
              Найпопулярніші продукти цього місяця
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales} продажів
                    </p>
                  </div>
                  <div className="text-sm font-medium">{product.revenue}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/menu">
                <Button variant="outline" className="w-full">
                  Управляти меню
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Chart Placeholder */}
        <Card className="col-span-2 animate-slide-in-from-bottom">
          <CardHeader>
            <CardTitle>Доход за останні 7 днів</CardTitle>
            <CardDescription>
              Графік показує динаміку доходу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center space-y-2">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Графік доходу</p>
                <p className="text-xs text-muted-foreground">Тут буде відображатися графік</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="animate-slide-in-from-bottom">
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
            <CardDescription>
              Часто використовувані функції
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/pos">
              <Button className="w-full justify-start" size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Новий заказ
              </Button>
            </Link>
            <Link href="/menu/products">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Package className="mr-2 h-4 w-4" />
                Додати продукт
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Новий клієнт
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="animate-slide-in-from-bottom">
        <CardHeader>
          <CardTitle>Продуктивність системи</CardTitle>
          <CardDescription>
            Ключові показники ефективності
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Середній час обслуговування</span>
                <span className="font-medium">3.2 хв</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Задоволеність клієнтів</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Відкритість закладу</span>
                <span className="font-medium">12 год</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>9:00 - 21:00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
