/**
 * @file: components/business/ProductManagement.tsx
 * @description: Компонент для управління продуктами
 * @dependencies: useProducts, useCategories, shadcn/ui
 * @created: 2024-12-19
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useProducts } from '@/hooks/useSupabase';
import { useCategories } from '@/hooks/useSupabase';
import { useBusiness } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Package, Tag, DollarSign, Hash, Box, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  sku: string;
  barcode: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  category_id: string;
  image_url: string;
}

export default function ProductManagement() {
  const { business } = useBusiness();
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProducts(business?.id);
  const { categories } = useCategories(business?.id);

  // Додаємо логування для діагностики завантаження категорій
  console.log('ProductManagement: business?.id:', business?.id);
  console.log('ProductManagement: categories:', categories);
  console.log('ProductManagement: categories.length:', categories?.length);

  // Стан для пошуку та фільтрації
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    sku: '',
    barcode: '',
    stock_quantity: 0,
    min_stock_level: 0,
    unit: 'шт',
    category_id: 'none',
    image_url: ''
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Функція для сортування категорій з урахуванням ієрархії
  const sortedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Додаємо логування для діагностики
    console.log('Оригінальні категорії (детально):');
    categories.forEach((c, index) => {
      console.log(`  ${index + 1}. ID: ${c.id}, Назва: "${c.name}", Рівень: ${c.level}, Parent ID: ${c.parent_id}`);
    });
    
    // Створюємо копію масиву для сортування
    const categoriesCopy = [...categories];
    
      // Сортуємо категорії з урахуванням ієрархії
  const sorted = categoriesCopy.sort((a, b) => {
    // Якщо a є підкатегорією b, то a повинна бути після b
    if (a.parent_id === b.id) return 1;
    
    // Якщо b є підкатегорією a, то b повинна бути після a
    if (b.parent_id === a.id) return -1;
    
    // Якщо обидві категорії мають однакового батька, сортуємо за назвою
    if (a.parent_id === b.parent_id) {
      return a.name.localeCompare(b.name);
    }
    
    // Якщо одна категорія є батьком іншої, батько повинен бути першим
    if (a.id === b.parent_id) return -1;
    if (b.id === a.parent_id) return 1;
    
    // Якщо категорії не пов'язані, сортуємо за рівнем, потім за назвою
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    
    return a.name.localeCompare(b.name);
  });
    
    console.log('Відсортовані категорії (детально):');
    sorted.forEach((c, index) => {
      console.log(`  ${index + 1}. ID: ${c.id}, Назва: "${c.name}", Рівень: ${c.level}, Parent ID: ${c.parent_id}`);
    });
    return sorted;
  }, [categories]);



  const showMessage = useCallback((message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage(null);
    } else {
      setErrorMessage(message);
      setSuccessMessage(null);
    }
    
    setTimeout(() => {
      if (type === 'success') {
        setSuccessMessage(null);
      } else {
        setErrorMessage(null);
      }
    }, 5000);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...formData,
          category_id: formData.category_id === 'none' ? null : formData.category_id
        });
        showMessage('Продукт успішно оновлено!', 'success');
      } else {
        await createProduct({
          ...formData,
          category_id: formData.category_id === 'none' ? null : formData.category_id
        });
        showMessage('Продукт успішно створено!', 'success');
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      showMessage(errorMessage, 'error');
    }
  }, [editingProduct, formData, createProduct, updateProduct, showMessage]);

  const handleEdit = useCallback((product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      cost: product.cost || 0,
      sku: product.sku || '',
      barcode: product.barcode || '',
      stock_quantity: product.stock_quantity || 0,
      min_stock_level: product.min_stock_level || 0,
      unit: product.unit || 'шт',
      category_id: product.category_id || 'none',
      image_url: product.image_url || ''
    });
    setIsFormOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleDelete = useCallback(async (productId: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей продукт?')) {
      try {
        await deleteProduct(productId);
        showMessage('Продукт успішно видалено!', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
        showMessage(errorMessage, 'error');
      }
    }
  }, [deleteProduct, showMessage]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      cost: 0,
      sku: '',
      barcode: '',
      stock_quantity: 0,
      min_stock_level: 0,
      unit: 'шт',
      category_id: 'none',
      image_url: ''
    });
  }, []);

  const openCreateForm = useCallback(() => {
    setIsFormOpen(true);
    setEditingProduct(null);
    resetForm();
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [resetForm]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingProduct(null);
    resetForm();
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [resetForm]);

  const getCategoryName = useCallback((categoryId: string | null) => {
    if (!categoryId) return 'Без категорії';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Без категорії';
  }, [categories]);

  const getStockStatus = useCallback((quantity: number, minLevel: number) => {
    if (quantity === 0) return { text: 'Немає в наявності', color: 'destructive' };
    if (quantity <= minLevel) return { text: 'Закінчується', color: 'destructive' };
    if (quantity <= minLevel * 2) return { text: 'Мало', color: 'default' };
    return { text: 'В наявності', color: 'secondary' };
  }, []);

  // Фільтрація та сортування продуктів
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Фільтрація по пошуку
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)
      );
    }

    // Фільтрація по категорії
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Сортування
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock_quantity;
          bValue = b.stock_quantity;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Пагінація
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Скидання пагінації при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  if (!business) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Бізнес не знайдено</h3>
          <p className="mt-1 text-sm text-gray-500">Спочатку створіть або виберіть бізнес</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Заголовок та кнопка створення */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управління продуктами</h1>
          <p className="text-muted-foreground">
            Створюйте та керуйте продуктами для вашого бізнесу
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => {
              // Експорт в CSV (заглушка)
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Назва,Опис,Ціна,SKU,Штрих-код,Наявність,Одиниця,Категорія\n" +
                filteredAndSortedProducts.map(p => 
                  `"${p.name}","${p.description || ''}","${p.price}","${p.sku || ''}","${p.barcode || ''}","${p.stock_quantity}","${p.unit}","${getCategoryName(p.category_id)}"`
                ).join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "products.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2"
          >
            <Hash className="h-4 w-4" />
            Експорт CSV
          </Button>
          <Button onClick={openCreateForm} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Додати продукт
          </Button>
        </div>
      </div>

      {/* Статистика продуктів */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-600">Всього продуктів</p>
                <p className="text-2xl font-bold text-blue-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Box className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-600">В наявності</p>
                <p className="text-2xl font-bold text-green-900">
                  {products.filter(p => p.stock_quantity > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-600">Закінчується</p>
                <p className="text-2xl font-bold text-orange-900">
                  {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hash className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-600">Без наявності</p>
                <p className="text-2xl font-bold text-red-900">
                  {products.filter(p => p.stock_quantity === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Швидкі дії */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          onClick={() => setSelectedCategory('all')}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Всі продукти
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSelectedCategory('all') && setSearchTerm('')}
          className="flex items-center gap-2"
        >
          <Box className="h-4 w-4" />
          В наявності
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setSortBy('stock');
            setSortOrder('asc');
          }}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Закінчується
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSortBy('name');
            setSortOrder('asc');
          }}
          className="flex items-center gap-2"
        >
          <Hash className="h-4 w-4" />
          Скинути фільтри
        </Button>
      </div>

      {/* Панель пошуку та фільтрів */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Пошук */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Пошук</Label>
              <Input
                id="search"
                placeholder="Назва, SKU або штрих-код..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Фільтр по категорії */}
            <div>
              <Label htmlFor="category-filter" className="text-sm font-medium">Категорія</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Всі категорії</SelectItem>
                  {sortedCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.level === 0 ? category.name : `- ${category.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Сортування */}
            <div>
              <Label htmlFor="sort-by" className="text-sm font-medium">Сортувати по</Label>
              <Select
                value={sortBy}
                onValueChange={(value: 'name' | 'price' | 'stock') => setSortBy(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="name">Назва</SelectItem>
                  <SelectItem value="price">Ціна</SelectItem>
                  <SelectItem value="stock">Наявність</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Порядок сортування */}
            <div>
              <Label htmlFor="sort-order" className="text-sm font-medium">Порядок</Label>
              <Select
                value={sortOrder}
                onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="asc">За зростанням</SelectItem>
                  <SelectItem value="desc">За спаданням</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Повідомлення про помилки та успіх */}
      {errorMessage && (
        <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
          <Package className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Форма створення/редагування */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Редагувати продукт' : 'Створити новий продукт'}
            </CardTitle>
            <CardDescription>
              {editingProduct ? 'Внесіть зміни до продукту' : 'Заповніть інформацію про продукт'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Назва продукту *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Введіть назву продукту"
                  />
                </div>

                <div>
                  <Label htmlFor="category_id">Категорія</Label>
                  <Select
                    value={formData.category_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть категорію" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">Без категорії</SelectItem>
                      {sortedCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.level === 0 ? category.name : `- ${category.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Ціна продажу *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Собівартість</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Введіть SKU"
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">Штрих-код</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Введіть штрих-код"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Кількість на складі</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="min_stock_level">Мінімальний залишок</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    min="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Одиниця виміру</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="шт">Штука</SelectItem>
                      <SelectItem value="кг">Кілограм</SelectItem>
                      <SelectItem value="л">Літр</SelectItem>
                      <SelectItem value="м">Метр</SelectItem>
                      <SelectItem value="пак">Пакет</SelectItem>
                      <SelectItem value="бан">Банка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image_url">URL зображення</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишіть продукт..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit">
                  {editingProduct ? 'Оновити' : 'Створити'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Скасувати
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список продуктів */}
      <div className="space-y-4">
        {/* Інформація про результати */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Знайдено {filteredAndSortedProducts.length} з {products.length} продуктів
            {searchTerm && ` по запиту "${searchTerm}"`}
            {selectedCategory !== 'all' && ` в категорії "${categories.find(c => c.id === selectedCategory)?.name}"`}
            {totalPages > 1 && ` • Сторінка ${currentPage} з ${totalPages}`}
          </div>
          {filteredAndSortedProducts.length > 0 && (
            <div className="text-sm text-gray-500">
              Сортовано по {sortBy === 'name' ? 'назві' : sortBy === 'price' ? 'ціні' : 'наявності'} 
              ({sortOrder === 'asc' ? 'за зростанням' : 'за спаданням'})
              {totalPages > 1 && ` • Показано ${startIndex + 1}-${Math.min(endIndex, filteredAndSortedProducts.length)} з ${filteredAndSortedProducts.length}`}
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Package className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Завантаження продуктів...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
            Помилка завантаження: {error}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedCategory !== 'all' ? 'Продуктів не знайдено за критеріями пошуку' : 'Продуктів не знайдено'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' ? 'Спробуйте змінити критерії пошуку' : 'Почніть з створення першого продукту'}
            </p>
            <div className="mt-6 space-x-3">
              {(searchTerm || selectedCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Очистити фільтри
                </Button>
              )}
              <Button onClick={openCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Додати продукт
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);
                
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {product.description || 'Без опису'}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Категорія */}
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {getCategoryName(product.category_id)}
                          </span>
                        </div>

                        {/* Ціна */}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">
                            {product.price.toFixed(2)} грн
                          </span>
                        </div>

                        {/* SKU та штрих-код */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {product.sku && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {product.sku}
                            </div>
                          )}
                          {product.barcode && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {product.barcode}
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Складський облік */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">На складі:</span>
                            <div className="flex items-center gap-2">
                              <Box className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {product.stock_quantity} {product.unit}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Статус:</span>
                            <Badge variant={stockStatus.color as any}>
                              {stockStatus.text}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Пагінація */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Попередня
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    if (totalPages <= 5) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    
                    // Показуємо перші 3, останні 2 та поточну з сусідніми
                    if (pageNum === 1 || pageNum === totalPages || 
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Наступна
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
