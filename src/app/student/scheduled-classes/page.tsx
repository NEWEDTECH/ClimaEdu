'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { ArrowLeftIcon } from 'lucide-react'
import { StudentClassesCards } from '@/components/scheduled-class/student/StudentClassesCards'
import { useStudentScheduledClasses } from '@/hooks/scheduled-class'
import { useProfile } from '@/context/zustand/useProfile'

export default function StudentScheduledClassesPage() {
  const { infoUser } = useProfile()
  const studentId = infoUser.id

  const {
    upcomingItems,
    pastItems,
    loading,
    error,
    refetch
  } = useStudentScheduledClasses({
    studentId: studentId,
    institutionId: infoUser.currentIdInstitution
  })

  // Upcoming classes first (soonest first), then past/cancelled (most recent first)
  const allItems = [...upcomingItems, ...pastItems]

  if (!studentId) {
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
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <Link href="/student/tutoring">
              <Button
                variant="secondary"
                className="border border-gray-300"
                icon={<ArrowLeftIcon size={16} />}
              >
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aulas Agendadas</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Suas Aulas</CardTitle>
              <CardDescription>
                Aulas ao vivo agendadas pelo tutor para suas turmas. Clique em
                &quot;Entrar na aula&quot; no horário marcado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Erro ao carregar aulas: {error}</p>
                  <Button onClick={refetch} className="mt-4">
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <StudentClassesCards items={allItems} loading={loading} error={null} />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
