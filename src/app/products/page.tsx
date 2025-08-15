import ProductManagement from '@/components/business/ProductManagement';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Package, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/dashboard" className="flex items-center hover:text-gray-700 transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Продукти</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Управління продуктами</h1>
              <p className="text-gray-600">Створюйте, редагуйте та управляйте продуктами вашого бізнесу</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <ProductManagement />
      </div>
    </DashboardLayout>
  );
}
