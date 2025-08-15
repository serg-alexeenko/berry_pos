/**
 * @file: app/menu/products/page.tsx
 * @description: Сторінка управління продуктами з повним функціоналом CRUD
 * @dependencies: ProductManagement компонент, DashboardLayout
 * @created: 2024-12-19
 */

import ProductManagement from '@/components/business/ProductManagement';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ProductManagement />
      </div>
    </DashboardLayout>
  );
}
