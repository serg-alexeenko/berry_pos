/**
 * @file: components/business/CategoryManagement.tsx
 * @description: Компонент управління категоріями з підтримкою підкатегорій
 * @dependencies: useCategories, shadcn/ui компоненти
 * @created: 2024-12-19
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/useSupabase'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Category {
  id: string
  business_id: string
  parent_id?: string
  name: string
  description?: string
  sort_order: number
  level: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CategoryFormData {
  name: string
  description: string
  parent_id: string
  sort_order: number
}

export default function CategoryManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_id: '',
    sort_order: 0
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories()

  // Групування категорій по рівнях
  const groupedCategories = categories.reduce((acc, category) => {
    if (category.level === 0) {
      acc[category.id] = {
        ...category,
        children: categories.filter(c => c.parent_id === category.id)
      }
    }
    return acc
  }, {} as Record<string, Category & { children?: Category[] }>)

  const mainCategories = Object.values(groupedCategories).sort((a, b) => a.sort_order - b.sort_order)

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(message)
      setErrorMessage(null)
    } else {
      setErrorMessage(message)
      setSuccessMessage(null)
    }
    
    // Автоматично приховуємо повідомлення через 5 секунд
    setTimeout(() => {
      if (type === 'success') {
        setSuccessMessage(null)
      } else {
        setErrorMessage(null)
      }
    }, 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          ...formData,
          level: formData.parent_id ? 1 : 0,
          sort_order: editingCategory.sort_order // Зберігаємо поточний порядок при редагуванні
        })
        showMessage('Категорію успішно оновлено!', 'success')
      } else {
        // Автоматично встановлюємо sort_order для нової категорії
        const nextSortOrder = categories.length + 1
        await createCategory({
          ...formData,
          level: formData.parent_id ? 1 : 0,
          sort_order: nextSortOrder
        })
        showMessage('Категорію успішно створено!', 'success')
      }
      
      resetForm()
    } catch (error) {
      console.error('Помилка збереження категорії:', error)
      const errorMsg = error instanceof Error ? error.message : 'Невідома помилка'
      showMessage(errorMsg, 'error')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      sort_order: 0 // Не використовуємо в UI, але зберігаємо в стані
    })
    setIsFormOpen(true)
    // Очищаємо повідомлення при відкритті форми редагування
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      try {
        setErrorMessage(null)
        await deleteCategory(categoryId)
        showMessage('Категорію успішно видалено!', 'success')
      } catch (error) {
        console.error('Помилка видалення категорії:', error)
        const errorMsg = error instanceof Error ? error.message : 'Невідома помилка'
        showMessage(errorMsg, 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      sort_order: 0
    })
    setEditingCategory(null)
    setIsFormOpen(false)
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategory = (category: Category & { children?: Category[] }, isChild = false) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)

    return (
      <div key={category.id} className={`${isChild ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-5 w-5 text-blue-600" />
              ) : (
                <Folder className="h-5 w-5 text-blue-600" />
              )
            ) : (
              <Package className="h-5 w-5 text-gray-600" />
            )}
            
            <div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children!.map(child => renderCategory(child, true))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження категорій...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Помилка завантаження</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управління категоріями</h1>
              <p className="text-gray-600 mt-2">Керуйте структурою категорій та підкатегорій</p>
            </div>
            <Button onClick={() => {
              setIsFormOpen(true)
              setErrorMessage(null)
              setSuccessMessage(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Додати категорію
            </Button>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="inline-flex text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex text-green-400 hover:text-green-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Структура категорій</h2>
            </div>
            <div className="p-6">
              {mainCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Категорії не знайдено</h3>
                  <p className="text-gray-600 mb-4">Створіть першу категорію для організації меню</p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Створити категорію
                  </Button>
                </div>
              ) : (
                <div>
                  {mainCategories.map(category => renderCategory(category))}
                </div>
              )}
            </div>
          </div>

          {/* Category Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  {editingCategory ? 'Редагувати категорію' : 'Створити категорію'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Назва категорії *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Опис</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parent_id">Батьківська категорія</Label>
                    <select
                      id="parent_id"
                      value={formData.parent_id}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Головна категорія</option>
                      {categories
                        .filter(c => c.level === 0)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingCategory ? 'Зберегти' : 'Створити'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      Скасувати
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
