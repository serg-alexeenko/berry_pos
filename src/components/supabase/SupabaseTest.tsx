/**
 * @file: SupabaseTest.tsx
 * @description: Компонент для тестування підключення до Supabase та управління базою даних
 * @dependencies: @supabase/supabase-js, react
 * @created: 2024-12-19
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Plus, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp?: string;
  tables?: string[];
  summary?: any;
}

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [createTablesStatus, setCreateTablesStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [seedDataStatus, setSeedDataStatus] = useState<'idle' | 'seeding' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [createTablesResult, setCreateTablesResult] = useState<TestResult | null>(null);
  const [seedDataResult, setSeedDataResult] = useState<TestResult | null>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('/api/supabase/test');
      const result = await response.json();
      setTestResult(result);
      setConnectionStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Помилка підключення до API'
      });
      setConnectionStatus('error');
    }
  };

  const createTables = async () => {
    setCreateTablesStatus('creating');
    try {
      const response = await fetch('/api/supabase/create-tables-simple', {
        method: 'POST'
      });
      const result = await response.json();
      setCreateTablesResult(result);
      setCreateTablesStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setCreateTablesResult({
        success: false,
        message: 'Помилка перевірки таблиць'
      });
      setCreateTablesStatus('error');
    }
  };

  const seedData = async () => {
    setSeedDataStatus('seeding');
    try {
      const response = await fetch('/api/supabase/seed-data', {
        method: 'POST'
      });
      const result = await response.json();
      setSeedDataResult(result);
      setSeedDataStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setSeedDataResult({
        success: false,
        message: 'Помилка додавання тестових даних'
      });
      setSeedDataStatus('error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'testing':
      case 'creating':
      case 'seeding':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'testing':
      case 'creating':
      case 'seeding':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Тест підключення */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Тест підключення до Supabase
          </CardTitle>
          <CardDescription>
            Перевірте підключення до бази даних та отримайте статус
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="flex items-center gap-2"
            >
              {connectionStatus === 'testing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Server className="h-4 w-4" />
              )}
              Тестувати підключення
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setConnectionStatus('idle');
                setTestResult(null);
              }}
              disabled={connectionStatus === 'testing'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Очистити
            </Button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(connectionStatus)}
                <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
                  {testResult.success ? 'Підключення успішне' : 'Помилка підключення'}
                </span>
              </div>
              <p className="text-sm text-gray-700">{testResult.message}</p>
              {testResult.data && (
                <div className="mt-3 text-xs text-gray-600">
                  <p><strong>Знайдено тенантів:</strong> {testResult.data.count}</p>
                  <p><strong>Тестовано:</strong> {new Date(testResult.timestamp || '').toLocaleString('uk-UA')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Створення таблиць */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Перевірка та створення таблиць бази даних
          </CardTitle>
          <CardDescription>
            Перевірте наявність таблиць та отримайте інструкції по створенню
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={createTables}
              disabled={createTablesStatus === 'creating'}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {createTablesStatus === 'creating' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Перевірити таблиці
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setCreateTablesStatus('idle');
                setCreateTablesResult(null);
              }}
              disabled={createTablesStatus === 'creating'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Очистити
            </Button>
          </div>

          {createTablesResult && (
            <div className={`p-4 rounded-lg border ${createTablesResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(createTablesStatus)}
                <span className={`font-medium ${getStatusColor(createTablesStatus)}`}>
                  {createTablesResult.success ? 'Таблиці створені' : 'Помилка створення'}
                </span>
              </div>
              <p className="text-sm text-gray-700">{createTablesResult.message}</p>
              {createTablesResult.success && createTablesResult.tables && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Створені таблиці:</p>
                  <div className="flex flex-wrap gap-1">
                    {createTablesResult.tables.map((table: string) => (
                      <Badge key={table} variant="secondary" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Додавання тестових даних */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Додавання тестових даних
          </CardTitle>
          <CardDescription>
            Додайте приклади категорій, продуктів, клієнтів та замовлень
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={seedData}
              disabled={seedDataStatus === 'seeding'}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {seedDataStatus === 'seeding' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Додати тестові дані
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setSeedDataStatus('idle');
                setSeedDataResult(null);
              }}
              disabled={seedDataStatus === 'seeding'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Очистити
            </Button>
          </div>

          {seedDataResult && (
            <div className={`p-4 rounded-lg border ${seedDataResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(seedDataStatus)}
                <span className={`font-medium ${getStatusColor(seedDataStatus)}`}>
                  {seedDataResult.success ? 'Дані додано' : 'Помилка додавання'}
                </span>
              </div>
              <p className="text-sm text-gray-700">{seedDataResult.message}</p>
              {seedDataResult.success && seedDataResult.summary && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Додано записів:</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="text-center">
                      <Badge variant="outline" className="w-full justify-center">
                        {seedDataResult.summary.categories} категорій
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="w-full justify-center">
                        {seedDataResult.summary.products} продуктів
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="w-full justify-center">
                        {seedDataResult.summary.customers} клієнтів
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="w-full justify-center">
                        {seedDataResult.summary.orders} замовлень
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="w-full justify-center">
                        {seedDataResult.summary.orderItems} елементів
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Інструкції */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Інструкції по налаштуванню</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Спочатку натисніть "Тестувати підключення" для перевірки з'єднання</li>
            <li>Потім натисніть "Створити таблиці" для створення структури БД</li>
            <li>Нарешті натисніть "Додати тестові дані" для заповнення прикладами</li>
            <li>Після цього можете тестувати всі компоненти системи</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
