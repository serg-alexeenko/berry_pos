/**
 * @file: app/settings/page.tsx
 * @description: Сторінка налаштувань бізнесу та користувача
 * @dependencies: React, Supabase, shadcn/ui компоненти
 * @created: 2024-12-19
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBusiness } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Building, 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Monitor, 
  Database,
  Globe,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface BusinessSettings {
  name: string;
  type: string;
  description: string;
  email: string;
  phone: string;
  address: string;
}

interface UserSettings {
  theme: string;
  language: string;
  timezone: string;
  notifications: boolean;
  emailNotifications: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { business, loading } = useBusiness();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('business');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    name: '',
    type: '',
    description: '',
    email: '',
    phone: '',
    address: ''
  });
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'uk',
    timezone: 'Europe/Kiev',
    notifications: true,
    emailNotifications: true
  });

  // Отримуємо всі бізнеси користувача
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Помилка отримання бізнесів:', error);
          return;
        }

        if (data && data.length > 0) {
          setAllBusinesses(data);
          setSelectedBusinessId(data[0].id);
          setBusinessSettings({
            name: data[0].name || '',
            type: data[0].type || '',
            description: data[0].description || '',
            email: data[0].email || '',
            phone: data[0].phone || '',
            address: data[0].address || ''
          });
        }
      } catch (err) {
        console.error('Помилка при отриманні бізнесів:', err);
      }
    };

    fetchBusinesses();
  }, [user]);

  // Отримуємо поточний вибраний бізнес
  const currentBusiness = allBusinesses.find(b => b.id === selectedBusinessId);

  const handleBusinessSave = async () => {
    if (!selectedBusinessId || !currentBusiness) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update(businessSettings)
        .eq('id', selectedBusinessId);

      if (error) {
        console.error('Помилка збереження бізнесу:', error);
        return;
      }

      setIsEditing(false);
      // Оновлюємо локальний стан
      setAllBusinesses(prev => prev.map(b => 
        b.id === selectedBusinessId ? { ...b, ...businessSettings } : b
      ));
    } catch (err) {
      console.error('Помилка при збереженні бізнесу:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSave = async () => {
    // Тут можна додати логіку збереження налаштувань користувача
    console.log('Збереження налаштувань користувача:', userSettings);
  };

  const handleCreateBusiness = () => {
    router.push('/create-business');
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center">
            <p className="text-lg">Будь ласка, увійдіть в систему</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Налаштування</h1>
              <p className="text-gray-600 mt-2">Налаштуйте свій бізнес та особисті параметри</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </div>
          </div>

          {/* Business Selector */}
          {allBusinesses.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Building className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Оберіть бізнес для налаштування</h3>
                    <p className="text-sm text-gray-600">Виберіть бізнес, який хочете налаштувати</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={selectedBusinessId || ''} onValueChange={setSelectedBusinessId}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allBusinesses.map((biz) => (
                        <SelectItem key={biz.id} value={biz.id}>
                          {biz.name} ({biz.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={handleCreateBusiness}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Новий бізнес</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Бізнесів</p>
                  <p className="text-2xl font-bold text-gray-900">{allBusinesses.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <SettingsIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активних</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allBusinesses.filter(b => b.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Користувач</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Monitor className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Тема</p>
                  <p className="text-2xl font-bold text-gray-900">{userSettings.theme}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="business" className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Налаштування бізнесу</span>
                  </TabsTrigger>
                  <TabsTrigger value="user" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Особисті налаштування</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                {/* Business Settings Tab */}
                <TabsContent value="business" className="space-y-6">
                  {currentBusiness ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Профіль бізнесу: {currentBusiness.name}
                          </h3>
                          <p className="text-sm text-gray-600">Налаштуйте основні параметри вашого бізнесу</p>
                        </div>
                        <div className="flex space-x-2">
                          {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                              Редагувати
                            </Button>
                          ) : (
                            <>
                              <Button 
                                onClick={handleBusinessSave} 
                                disabled={isSaving}
                                className="flex items-center space-x-2"
                              >
                                <Save className="h-4 w-4" />
                                <span>{isSaving ? 'Збереження...' : 'Зберегти'}</span>
                              </Button>
                              <Button 
                                onClick={() => setIsEditing(false)} 
                                variant="outline"
                              >
                                Скасувати
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="business-name">Назва бізнесу</Label>
                            <Input
                              id="business-name"
                              value={businessSettings.name}
                              onChange={(e) => setBusinessSettings(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Введіть назву бізнесу"
                              disabled={!isEditing}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="business-type">Тип бізнесу</Label>
                            <Select 
                              value={businessSettings.type || ''} 
                              onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, type: value }))}
                              disabled={!isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Оберіть тип" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="shop">Магазин</SelectItem>
                                <SelectItem value="cafe">Кафе</SelectItem>
                                <SelectItem value="restaurant">Ресторан</SelectItem>
                                <SelectItem value="bar">Бар</SelectItem>
                                <SelectItem value="other">Інше</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="business-description">Опис бізнесу</Label>
                            <Input
                              id="business-description"
                              value={businessSettings.description}
                              onChange={(e) => setBusinessSettings(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Короткий опис вашого бізнесу"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="business-email">Email</Label>
                            <Input
                              id="business-email"
                              type="email"
                              value={businessSettings.email}
                              onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="business@example.com"
                              disabled={!isEditing}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="business-phone">Телефон</Label>
                            <Input
                              id="business-phone"
                              value={businessSettings.phone}
                              onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+380 XX XXX XX XX"
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="business-address">Адреса</Label>
                            <Input
                              id="business-address"
                              value={businessSettings.address}
                              onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Введіть адресу бізнесу"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Бізнес не знайдено</h3>
                      <p className="text-gray-600 mb-4">Створіть свій перший бізнес для початку роботи</p>
                      <Button onClick={handleCreateBusiness}>
                        <Plus className="h-4 w-4 mr-2" />
                        Створити бізнес
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* User Settings Tab */}
                <TabsContent value="user" className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Особисті налаштування</h3>
                      <p className="text-sm text-gray-600">Налаштуйте інтерфейс та сповіщення</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4" />
                            <span>Тема інтерфейсу</span>
                          </Label>
                          <p className="text-sm text-gray-500">Оберіть світлу або темну тему</p>
                        </div>
                        <Select value={userSettings.theme} onValueChange={(value) => setUserSettings(prev => ({ ...prev, theme: value }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Світла</SelectItem>
                            <SelectItem value="dark">Темна</SelectItem>
                            <SelectItem value="auto">Авто</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>Мова інтерфейсу</span>
                          </Label>
                          <p className="text-sm text-gray-500">Оберіть мову для відображення</p>
                        </div>
                        <Select value={userSettings.language} onValueChange={(value) => setUserSettings(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uk">Українська</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Часовий пояс</span>
                          </Label>
                          <p className="text-sm text-gray-500">Оберіть ваш часовий пояс</p>
                        </div>
                        <Select value={userSettings.timezone} onValueChange={(value) => setUserSettings(prev => ({ ...prev, timezone: value }))}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Kiev">Київ (UTC+2)</SelectItem>
                            <SelectItem value="Europe/London">Лондон (UTC+0)</SelectItem>
                            <SelectItem value="America/New_York">Нью-Йорк (UTC-5)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Токіо (UTC+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Bell className="h-4 w-4" />
                            <span>Push сповіщення</span>
                          </Label>
                          <p className="text-sm text-gray-500">Отримувати сповіщення в браузері</p>
                        </div>
                        <Switch
                          checked={userSettings.notifications}
                          onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, notifications: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Bell className="h-4 w-4" />
                            <span>Email сповіщення</span>
                          </Label>
                          <p className="text-sm text-gray-500">Отримувати сповіщення на email</p>
                        </div>
                        <Switch
                          checked={userSettings.emailNotifications}
                          onCheckedChange={(checked) => setUserSettings(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>
                    </div>

                    <Button onClick={handleUserSave} className="w-full">
                      Зберегти особисті налаштування
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
