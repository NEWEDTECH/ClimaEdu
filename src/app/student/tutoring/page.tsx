'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { TutoringScheduleForm } from '@/components/tutoring/student/TutoringScheduleForm'
import { ScheduledSessionsList } from '@/components/tutoring/student/ScheduledSessionsList'
import { mockCourses, mockScheduledSessions } from './data/mockData'

export default function TutoringPage() {
  const [scheduledSessions, setScheduledSessions] = useState(mockScheduledSessions)

  const handleScheduleSession = (sessionData: {
    courseId: string
    date: string
    time: string
    notes?: string
  }) => {
    const newSession = {
      id: `session-${Date.now()}`,
      courseId: sessionData.courseId,
      courseName: mockCourses.find(course => course.id === sessionData.courseId)?.name || '',
      date: sessionData.date,
      time: sessionData.time,
      status: 'scheduled' as const,
      tutorName: 'Prof. João Silva', // Mock tutor name
      notes: sessionData.notes
    }

    setScheduledSessions(prev => [...prev, newSession])
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
                  courses={mockCourses}
                  onSchedule={handleScheduleSession}
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
                <ScheduledSessionsList sessions={scheduledSessions} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
