'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { TutoringScheduleForm } from '@/components/tutoring/student/TutoringScheduleForm'
import { ScheduledSessionsList } from '@/components/tutoring/student/ScheduledSessionsList'
import { useStudentEnrolledCourses, useStudentSessions } from '@/hooks/tutoring'
import { useProfile } from '@/context/zustand/useProfile'

export default function TutoringPage() {
  const { infoUser } = useProfile()
  const studentId = infoUser.id
  
  const { courses, loading: coursesLoading, error: coursesError } = useStudentEnrolledCourses({ studentId: studentId || '' })
  const { 
    sessions, 
    loading: sessionsLoading, 
    error: sessionsError, 
    refetch: refetchSessions 
  } = useStudentSessions({ 
    studentId: studentId || '',
    autoRefresh: false 
  })
  
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

  const handleScheduleSession = async () => {
    // After successful scheduling, refetch sessions
    await refetchSessions()
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Agendamento de Tutoria</h1>
            <p className="text-gray-600 mt-2">
              Agende sessões de tutoria com seus professores para tirar dúvidas e aprofundar seus conhecimentos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule Form */}
            <Card>
              <CardHeader>
                <CardTitle>Agendar Nova Sessão</CardTitle>
                <CardDescription>
                  Selecione o curso, data e horário para sua sessão de tutoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TutoringScheduleForm 
                  courses={courses}
                  loading={coursesLoading}
                  error={coursesError}
                  onSchedule={handleScheduleSession}
                  studentId={studentId}
                />
              </CardContent>
            </Card>

            {/* Scheduled Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Sessões Agendadas</CardTitle>
                <CardDescription>
                  Suas próximas sessões de tutoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduledSessionsList 
                  sessions={sessions}
                  loading={sessionsLoading}
                  error={sessionsError}
                  studentId={studentId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
