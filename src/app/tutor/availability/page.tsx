'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { AvailabilityManager } from '@/components/tutoring/tutor/AvailabilityManager'
import { useProfile } from '@/context/zustand/useProfile'

export default function TutorAvailabilityPage() {
  const { infoUser } = useProfile()
  const tutorId = infoUser.id

  if (!tutorId) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando informações do usuário...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <AvailabilityManager tutorId={tutorId} />
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
