/**
 * @file: pos/page.tsx
 * @description: Сторінка POS системи без навігації (окрема навігація буде створена пізніше)
 * @dependencies: POSInterface компонент
 * @created: 2024-12-19
 */

import POSInterface from '@/components/business/POSInterface'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function POSPage() {
  return (
    <DashboardLayout>
      <POSInterface />
    </DashboardLayout>
  )
}
