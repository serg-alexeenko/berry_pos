/**
 * @file: CustomerManagement.tsx
 * @description: Компонент для управління клієнтами ресторану
 * @dependencies: @/hooks/useSupabase, @/components/ui, react
 * @created: 2024-12-19
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  RefreshCw,
  Download
} from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { Customer, CustomerInsert, CustomerUpdate } from '@/lib/supabase/types'

export default function CustomerManagement() {
  const { supabase } = useSupabase()
  
  // Стан компонента
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerInsert>({
    name: '',
    phone: '',
    email: '',
    address: '',
    loyalty_points: 0
  })

  // Завантаження даних
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name')
        
        if (error) {
          console.warn('Таблиця customers ще не створена:', error.message)
          setCustomers([])
          return
        }
        
        setCustomers(data || [])
      } catch (error) {
        console.warn('Помилка завантаження клієнтів (таблиця може не існувати):', error)
        setCustomers([])
      }
    } catch (error) {
      console.error('Помилка завантаження клієнтів:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Фільтрація клієнтів
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers
    
    const query = searchQuery.toLowerCase()
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.address?.toLowerCase().includes(query)
    )
  }, [customers, searchQuery])

  // Обробка форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCustomer) {
        // Оновлення існуючого клієнта
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id)
        
        if (error) throw error
        
        // Оновлення локального стану
        setCustomers(customers.map(customer => 
          customer.id === editingCustomer.id 
            ? { ...customer, ...formData }
            : customer
        ))
      } else {
        // Створення нового клієнта
        const { data, error } = await supabase
          .from('customers')
          .insert(formData)
          .select()
          .single()
        
        if (error) throw error
        
        // Додавання до локального стану
        setCustomers([...customers, data])
      }
      
      // Очищення форми
      resetForm()
      
    } catch (error) {
      console.error('Помилка збереження клієнта:', error)
      alert('Помилка збереження клієнта')
    }
  }

  // Редагування клієнта
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      loyalty_points: customer.loyalty_points
    })
    setShowForm(true)
  }

  // Видалення клієнта
  const handleDelete = async (customerId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього клієнта?')) return
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
      
      if (error) throw error
      
      // Видалення з локального стану
      setCustomers(customers.filter(customer => customer.id !== customerId))
      
    } catch (error) {
      console.error('Помилка видалення клієнта:', error)
      alert('Помилка видалення клієнта')
    }
  }

  // Скидання форми
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      loyalty_points: 0
    })
    setEditingCustomer(null)
    setShowForm(false)
  }

  // Експорт клієнтів
  const exportCustomers = () => {
    const csvContent = [
      ['Ім\'я', 'Телефон', 'Email', 'Адреса', 'Бонусні бали', 'Дата реєстрації'].join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.phone || '',
        customer.email || '',
        customer.address || '',
        customer.loyalty_points.toString(),
        new Date(customer.created_at).toLocaleDateString('uk-UA')
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `клієнти_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Статистика
  const statistics = useMemo(() => {
    const total = customers.length
    const withPhone = customers.filter(c => c.phone).length
    const withEmail = customers.filter(c => c.email).length
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0)
    
    return { total, withPhone, withEmail, totalLoyaltyPoints }
  }, [customers])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок та статистика */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління клієнтами</h1>
          <p className="text-gray-600">База даних клієнтів та програма лояльності</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCustomers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
          <Button variant="outline" onClick={exportCustomers}>
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новий клієнт
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Всього клієнтів</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">З телефоном</p>
                <p className="text-2xl font-bold">{statistics.withPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">З email</p>
                <p className="text-2xl font-bold">{statistics.withEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Бонусних балів</p>
                <p className="text-2xl font-bold">{statistics.totalLoyaltyPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Пошук */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Пошук по імені, телефону, email або адресі..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Форма створення/редагування */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCustomer ? 'Редагування клієнта' : 'Новий клієнт'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ім'я *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+380991234567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="loyalty_points">Бонусні бали</Label>
                  <Input
                    id="loyalty_points"
                    type="number"
                    value={formData.loyalty_points}
                    onChange={(e) => setFormData({ ...formData, loyalty_points: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Адреса</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Повна адреса клієнта"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCustomer ? 'Оновити' : 'Створити'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Скасувати
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список клієнтів */}
      <Card>
        <CardHeader>
          <CardTitle>Клієнти ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Клієнти не знайдено</h3>
                <p className="text-sm mb-4">Таблиця клієнтів ще не створена в базі даних</p>
                <p className="text-xs text-gray-400 mb-4">
                  Для створення таблиці клієнтів виконайте SQL скрипт pos-schema.sql
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/pos'}
                >
                  Перейти до POS системи
                </Button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Клієнти не знайдено</p>
                {searchQuery && (
                  <p className="text-sm">Спробуйте змінити пошуковий запит</p>
                )}
              </div>
            ) : (
              filteredCustomers.map(customer => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        <Badge variant="secondary">
                          {customer.loyalty_points} балів
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        
                        {customer.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Зареєстровано: {new Date(customer.created_at).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
