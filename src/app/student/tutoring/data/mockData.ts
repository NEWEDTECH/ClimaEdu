export interface Course {
  id: string
  name: string
  tutor: string
  description: string
}

export interface ScheduledSession {
  id: string
  courseId: string
  courseName: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  tutorName: string
  notes?: string
}

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Matemática Básica',
    tutor: 'Prof. João Silva',
    description: 'Fundamentos de matemática para iniciantes'
  },
  {
    id: 'course-2',
    name: 'Física Aplicada',
    tutor: 'Prof. Maria Santos',
    description: 'Conceitos fundamentais de física'
  },
  {
    id: 'course-3',
    name: 'Química Orgânica',
    tutor: 'Prof. Carlos Lima',
    description: 'Introdução à química orgânica'
  },
  {
    id: 'course-4',
    name: 'História do Brasil',
    tutor: 'Prof. Ana Costa',
    description: 'História do Brasil colonial ao contemporâneo'
  },
  {
    id: 'course-5',
    name: 'Inglês Intermediário',
    tutor: 'Prof. Robert Johnson',
    description: 'Desenvolvimento de habilidades em inglês'
  }
]

export const mockScheduledSessions: ScheduledSession[] = [
  {
    id: 'session-1',
    courseId: 'course-1',
    courseName: 'Matemática Básica',
    date: '2025-01-20',
    time: '14:00',
    status: 'scheduled',
    tutorName: 'Prof. João Silva',
    notes: 'Revisar equações do segundo grau'
  },
  {
    id: 'session-2',
    courseId: 'course-2',
    courseName: 'Física Aplicada',
    date: '2025-01-22',
    time: '10:30',
    status: 'scheduled',
    tutorName: 'Prof. Maria Santos',
    notes: 'Dúvidas sobre cinemática'
  },
  {
    id: 'session-3',
    courseId: 'course-1',
    courseName: 'Matemática Básica',
    date: '2025-01-15',
    time: '15:00',
    status: 'completed',
    tutorName: 'Prof. João Silva',
    notes: 'Sessão sobre logaritmos - concluída'
  }
]

// Available time slots (9:00 - 17:00)
export const availableTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
]
