/**
 * @file: components/business/CreateBusiness.tsx
 * @description: Компонент для створення бізнесу
 * @dependencies: React, Supabase, UI компоненти
 * @created: 2024-12-19
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/providers/AuthProvider';

interface BusinessFormData {
  name: string;
  type: 'restaurant' | 'cafe' | 'shop' | 'bar' | 'other';
  description: string;
  address: string;
  phone: string;
  email: string;
}

export default function CreateBusiness() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setBusinessFormData] = useState<BusinessFormData>({
    name: '',
    type: 'restaurant',
    description: '',
    address: '',
    phone: '',
    email: user?.email || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value: string) => {
    setBusinessFormData(prev => ({
      ...prev,
      type: value as BusinessFormData['type']
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setMessage('');
      setError('');

      // Створюємо бізнес
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          primary_color: '#3B82F6',
          secondary_color: '#8B5CF6',
          is_active: true
        })
        .select()
        .single();

      if (businessError) {
        throw businessError;
      }

      setMessage('Бізнес успішно створено!');
      
      // Перенаправляємо на dashboard через 2 секунди
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Помилка створення бізнесу:', error);
      setError(error.message || 'Помилка створення бізнесу');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Будь ласка, увійдіть в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Створити бізнес</h1>
          <p className="text-gray-600">Налаштуйте свій перший бізнес у системі</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Інформація про бізнес</CardTitle>
            <CardDescription>
              Заповніть основну інформацію про ваш бізнес
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Назва бізнесу *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Мій Ресторан"
                />
              </div>

              <div>
                <Label htmlFor="type">Тип бізнесу *</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть тип бізнесу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Ресторан</SelectItem>
                    <SelectItem value="cafe">Кафе</SelectItem>
                    <SelectItem value="shop">Магазин</SelectItem>
                    <SelectItem value="bar">Бар</SelectItem>
                    <SelectItem value="other">Інше</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Опис</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Короткий опис вашого бізнесу"
                />
              </div>

              <div>
                <Label htmlFor="address">Адреса</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Вулиця, номер, місто"
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+380"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="business@example.com"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {message && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Створення...' : 'Створити бізнес'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
