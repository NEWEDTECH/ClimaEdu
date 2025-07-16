export interface TutorSession {
  id: string
  studentName: string
  studentEmail: string
  courseName: string
  courseId: string
  date: string
  time: string
  duration: number // in minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  studentQuestion: string
  tutorNotes?: string
  sessionSummary?: string
  materials?: string[]
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export const mockTutorSessions: TutorSession[] = [
  {
    id: 'session-1',
    studentName: 'Ana Silva',
    studentEmail: 'ana.silva@email.com',
    courseName: 'Matemática Básica',
    courseId: 'course-1',
    date: '2025-01-18',
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    studentQuestion: 'Estou com dificuldades para resolver equações do segundo grau. Principalmente quando o discriminante é negativo. Poderia me ajudar a entender melhor esse conceito?',
    priority: 'high',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 'session-2',
    studentName: 'Carlos Santos',
    studentEmail: 'carlos.santos@email.com',
    courseName: 'Física Aplicada',
    courseId: 'course-2',
    date: '2025-01-18',
    time: '15:30',
    duration: 45,
    status: 'scheduled',
    studentQuestion: 'Preciso de ajuda com cinemática, especificamente movimento uniformemente variado. Não consigo entender as fórmulas e quando aplicar cada uma.',
    priority: 'medium',
    createdAt: '2025-01-16T09:15:00Z',
    updatedAt: '2025-01-16T09:15:00Z'
  },
  {
    id: 'session-3',
    studentName: 'Maria Oliveira',
    studentEmail: 'maria.oliveira@email.com',
    courseName: 'Química Orgânica',
    courseId: 'course-3',
    date: '2025-01-19',
    time: '10:00',
    duration: 60,
    status: 'scheduled',
    studentQuestion: 'Tenho dúvidas sobre nomenclatura de compostos orgânicos. Especialmente sobre ramificações e grupos funcionais. Podemos revisar alguns exemplos?',
    priority: 'medium',
    createdAt: '2025-01-17T14:20:00Z',
    updatedAt: '2025-01-17T14:20:00Z'
  },
  {
    id: 'session-4',
    studentName: 'João Pedro',
    studentEmail: 'joao.pedro@email.com',
    courseName: 'História do Brasil',
    courseId: 'course-4',
    date: '2025-01-19',
    time: '16:00',
    duration: 45,
    status: 'in_progress',
    studentQuestion: 'Estou estudando sobre o período colonial e tenho dúvidas sobre as capitanias hereditárias e o governo-geral. Qual a diferença entre eles?',
    tutorNotes: 'Aluno demonstra interesse no assunto. Preparar material visual sobre a organização administrativa colonial.',
    priority: 'low',
    createdAt: '2025-01-17T16:45:00Z',
    updatedAt: '2025-01-19T16:00:00Z'
  },
  {
    id: 'session-5',
    studentName: 'Beatriz Costa',
    studentEmail: 'beatriz.costa@email.com',
    courseName: 'Inglês Intermediário',
    courseId: 'course-5',
    date: '2025-01-17',
    time: '11:00',
    duration: 60,
    status: 'completed',
    studentQuestion: 'Preciso melhorar minha pronúncia e também tenho dúvidas sobre o uso dos tempos verbais, principalmente present perfect vs simple past.',
    tutorNotes: 'Sessão focada em pronúncia e tempos verbais. Aluna mostrou boa evolução.',
    sessionSummary: 'Trabalhamos exercícios de pronúncia com foco nos sons /θ/ e /ð/. Revisamos a diferença entre present perfect e simple past com exemplos práticos. Aluna demonstrou boa compreensão e melhorou significativamente a pronúncia durante a sessão.',
    materials: ['pronunciation_guide.pdf', 'verb_tenses_exercises.docx'],
    priority: 'medium',
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-01-17T12:00:00Z'
  },
  {
    id: 'session-6',
    studentName: 'Rafael Lima',
    studentEmail: 'rafael.lima@email.com',
    courseName: 'Matemática Básica',
    courseId: 'course-1',
    date: '2025-01-16',
    time: '09:30',
    duration: 45,
    status: 'no_show',
    studentQuestion: 'Dúvidas sobre funções logarítmicas e suas propriedades.',
    tutorNotes: 'Aluno não compareceu à sessão. Enviar mensagem para reagendar.',
    priority: 'low',
    createdAt: '2025-01-14T13:15:00Z',
    updatedAt: '2025-01-16T09:45:00Z'
  },
  {
    id: 'session-7',
    studentName: 'Larissa Ferreira',
    studentEmail: 'larissa.ferreira@email.com',
    courseName: 'Física Aplicada',
    courseId: 'course-2',
    date: '2025-01-20',
    time: '13:30',
    duration: 60,
    status: 'scheduled',
    studentQuestion: 'Estou com dificuldades em óptica geométrica. Principalmente em lentes e formação de imagens. Podemos fazer alguns exercícios práticos?',
    priority: 'high',
    createdAt: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-18T10:00:00Z'
  },
  {
    id: 'session-8',
    studentName: 'Pedro Henrique',
    studentEmail: 'pedro.henrique@email.com',
    courseName: 'Química Orgânica',
    courseId: 'course-3',
    date: '2025-01-15',
    time: '14:30',
    duration: 45,
    status: 'cancelled',
    studentQuestion: 'Dúvidas sobre reações de substituição e eliminação.',
    tutorNotes: 'Sessão cancelada pelo aluno por motivos pessoais.',
    priority: 'medium',
    createdAt: '2025-01-13T11:20:00Z',
    updatedAt: '2025-01-15T13:00:00Z'
  }
]
