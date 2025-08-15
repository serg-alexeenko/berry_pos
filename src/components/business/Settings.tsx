/**
 * @file: Settings.tsx
 * @description: Компонент для налаштувань системи ресторану
 * @dependencies: @/components/ui, react
 * @created: 2024-12-19
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon,
  Store,
  CreditCard,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Загальні', icon: SettingsIcon },
    { id: 'business', label: 'Бізнес', icon: Store },
    { id: 'payment', label: 'Оплата', icon: CreditCard },
    { id: 'notifications', label: 'Сповіщення', icon: Bell },
    { id: 'security', label: 'Безпека', icon: Shield },
    { id: 'appearance', label: 'Зовнішній вигляд', icon: Palette },
    { id: 'data', label: 'Дані', icon: Database }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Реалізувати збереження налаштувань
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Назва ресторану</label>
          <Input defaultValue="Berry Cafe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input type="email" defaultValue="info@berrycafe.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Телефон</label>
          <Input defaultValue="+380501234567" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Адреса</label>
          <Input defaultValue="вул. Хрещатик, 1, Київ" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Опис</label>
        <Input defaultValue="Сучасний ресторан з авторською кухнею" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Часовий пояс</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option>Europe/Kiev (UTC+2)</option>
            <option>Europe/London (UTC+0)</option>
            <option>America/New_York (UTC-5)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Мова</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option>Українська</option>
            <option>English</option>
            <option>Русский</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Податок (%)</label>
          <Input type="number" defaultValue="20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Валюта</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option>Гривня (₴)</option>
            <option>Долар ($)</option>
            <option>Євро (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Мінімальна сума замовлення</label>
          <Input type="number" defaultValue="100" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Максимальна знижка (%)</label>
          <Input type="number" defaultValue="15" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Робочі години</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Відкриття</label>
            <Input type="time" defaultValue="08:00" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Закриття</label>
            <Input type="time" defaultValue="23:00" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="delivery" defaultChecked />
        <label htmlFor="delivery" className="text-sm">Доставка доступна</label>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" id="cash" defaultChecked />
          <label htmlFor="cash" className="text-sm">Готівка</label>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="card" defaultChecked />
          <label htmlFor="card" className="text-sm">Банківська карта</label>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="online" />
          <label htmlFor="online" className="text-sm">Онлайн оплата</label>
        </div>
      </div>

      <Separator />

      <div>
        <label className="block text-sm font-medium mb-2">API ключ для онлайн оплати</label>
        <Input type="password" placeholder="Введіть API ключ" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Webhook URL</label>
        <Input placeholder="https://your-domain.com/webhook" />
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Нові замовлення</label>
            <p className="text-xs text-gray-600">Сповіщення про нові замовлення</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Зміна статусу</label>
            <p className="text-xs text-gray-600">Сповіщення про зміну статусу замовлення</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Низький запас</label>
            <p className="text-xs text-gray-600">Сповіщення про низький запас товарів</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Щоденний звіт</label>
            <p className="text-xs text-gray-600">Щоденний звіт про продажі</p>
          </div>
          <input type="checkbox" />
        </div>
      </div>

      <Separator />

      <div>
        <label className="block text-sm font-medium mb-2">Email для сповіщень</label>
        <Input type="email" defaultValue="manager@berrycafe.com" />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Поточний пароль</label>
        <Input type="password" placeholder="Введіть поточний пароль" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Новий пароль</label>
        <Input type="password" placeholder="Введіть новий пароль" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Підтвердження пароля</label>
        <Input type="password" placeholder="Підтвердіть новий пароль" />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Двофакторна аутентифікація</label>
            <p className="text-xs text-gray-600">Додатковий рівень безпеки</p>
          </div>
          <input type="checkbox" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Автоматичне блокування</label>
            <p className="text-xs text-gray-600">Блокування після невдалих спроб</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Основна тема</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option>Світла</option>
          <option>Темна</option>
          <option>Автоматично</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Основний колір</label>
        <div className="flex gap-2">
          {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
            <div
              key={color}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Розмір шрифту</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option>Малий</option>
          <option>Середній</option>
          <option>Великий</option>
        </select>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Небезпечна зона</CardTitle>
          <CardDescription>Ці дії не можна скасувати</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Database className="h-4 w-4 mr-2" />
              Експорт всіх даних
            </Button>
            <p className="text-xs text-gray-600 mt-1">Завантажити всі дані у форматі JSON</p>
          </div>
          
          <div>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Скинути налаштування
            </Button>
            <p className="text-xs text-gray-600 mt-1">Повернути всі налаштування до початкових</p>
          </div>
          
          <Separator />
          
          <div>
            <Button variant="destructive">
              <Database className="h-4 w-4 mr-2" />
              Видалити всі дані
            </Button>
            <p className="text-xs text-gray-600 mt-1">⚠️ Це дія видалить ВСІ дані без можливості відновлення</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'business':
        return renderBusinessSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationsSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Налаштування</h1>
          <p className="text-gray-600">Налаштування системи та параметрів ресторану</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Скинути
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Бічна панель з вкладками */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Основний контент */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const IconComponent = tabs.find(t => t.id === activeTab)?.icon || SettingsIcon;
                  return <IconComponent className="h-5 w-5" />;
                })()}
                {tabs.find(t => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                Налаштування для розділу "{tabs.find(t => t.id === activeTab)?.label.toLowerCase()}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
