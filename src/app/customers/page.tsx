/**
 * @file: customers/page.tsx
 * @description: Сторінка управління клієнтами
 * @dependencies: CustomerManagement компонент
 * @created: 2024-12-19
 */

import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerManagement from '@/components/business/CustomerManagement'

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomerManagement />
    </DashboardLayout>
  )
}
