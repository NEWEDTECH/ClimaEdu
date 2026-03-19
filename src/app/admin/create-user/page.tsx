'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { FormSection } from '@/components/form'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { CSVUpload } from '@/components/admin/CSVUpload'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container/symbols'
import { ProcessCSVUsersUseCase } from '@/_core/modules/user/core/use-cases/process-csv-users/process-csv-users.use-case'
import { AssociateUserToInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/associate-user-to-institution/associate-user-to-institution.use-case'
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { Institution } from '@/_core/modules/institution/core/entities/Institution'
import { useProfile } from '@/context/zustand/useProfile'
import { ArrowLeftIcon } from 'lucide-react'
import { ListCoursesByInstitutionUseCase } from '@/_core/modules/content/core/use-cases/list-courses-by-institution/list-courses-by-institution.use-case'
import { ListTrailsUseCase } from '@/_core/modules/content/core/use-cases/list-trails/list-trails.use-case'
import { EnrollInCourseUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-course/enroll-in-course.use-case'
import { EnrollInTrailUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-trail/enroll-in-trail.use-case'
import { ContentSymbols } from '@/_core/shared/container/modules/content/symbols'
import { EnrollmentSymbols } from '@/_core/shared/container/modules/enrollment/symbols'


const allowedRoles = [
  UserRole.STUDENT,
  UserRole.TUTOR,
  UserRole.LOCAL_ADMIN,
  UserRole.CONTENT_MANAGER,
] as const;

const roleLabels: Partial<Record<UserRole, string>> = {
  [UserRole.SYSTEM_ADMIN]: 'Administrador do Sistema',
  [UserRole.LOCAL_ADMIN]: 'Administrador',
  [UserRole.CONTENT_MANAGER]: 'Gestor de Conteúdo',
  [UserRole.TUTOR]: 'Tutor',
  [UserRole.STUDENT]: 'Estudante',
};

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  //password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  //confirmPassword: z.string(),
  role: z.enum(allowedRoles),
  institutionId: z.string().optional()
})//.refine((data) => data.password === data.confirmPassword, {
//message: "As senhas não coincidem",
//path: ["confirmPassword"],
//});

type FormValues = z.infer<typeof formSchema>;

const getAllowedRolesToCreate = (creatorRole: UserRole): UserRole[] => {
  switch (creatorRole) {
    case UserRole.SUPER_ADMIN:
      return [
        UserRole.SYSTEM_ADMIN,
        UserRole.LOCAL_ADMIN,
        UserRole.CONTENT_MANAGER,
        UserRole.TUTOR,
        UserRole.STUDENT,
      ];
    case UserRole.SYSTEM_ADMIN:
      return [
        UserRole.LOCAL_ADMIN,
        UserRole.CONTENT_MANAGER,
        UserRole.TUTOR,
        UserRole.STUDENT,
      ];
    case UserRole.LOCAL_ADMIN:
      return [
        UserRole.CONTENT_MANAGER,
        UserRole.TUTOR,
        UserRole.STUDENT,
      ];
    default:
      return [];
  }
};

export default function CreateUserPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'individual' | 'csv'>('individual')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(false)
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [trails, setTrails] = useState<Array<{ id: string; name: string }>>([])
  const [csvProgress, setCsvProgress] = useState<{
    current: number;
    total: number;
    isProcessing: boolean;
    currentEmail: string;
  }>({
    current: 0,
    total: 0,
    isProcessing: false,
    currentEmail: ''
  })
  const { infoUser } = useProfile()

  const currentUserRole = infoUser.currentRole as UserRole;

  const allowedRoles = getAllowedRolesToCreate(currentUserRole);

  // Fetch institutions for SUPER_ADMIN and SYSTEM_ADMIN
  useEffect(() => {
    const fetchInstitutions = async () => {
      if (currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === UserRole.SYSTEM_ADMIN) {
        setIsLoadingInstitutions(true)
        try {
          const listInstitutionsUseCase = container.get<ListInstitutionsUseCase>(
            Register.institution.useCase.ListInstitutionsUseCase
          )
          const result = await listInstitutionsUseCase.execute({})
          setInstitutions(result.institutions)
        } catch (err) {
          console.error('Error fetching institutions:', err)
        } finally {
          setIsLoadingInstitutions(false)
        }
      }
    }

    fetchInstitutions()
  }, [currentUserRole])

  // Fetch courses and trails only when the user switches to CSV mode
  useEffect(() => {
    if (mode !== 'csv') return

    const fetchCoursesAndTrails = async () => {
      try {
        const listCoursesUseCase = container.get<ListCoursesByInstitutionUseCase>(
          ContentSymbols.useCases.ListCoursesByInstitutionUseCase
        )
        const listTrailsUseCase = container.get<ListTrailsUseCase>(
          ContentSymbols.useCases.ListTrailsUseCase
        )

        let institutionId: string | null = null

        if (infoUser.currentRole === UserRole.LOCAL_ADMIN || infoUser.currentRole === UserRole.CONTENT_MANAGER) {
          institutionId = infoUser.currentIdInstitution
        } else if ((infoUser.currentRole === UserRole.SUPER_ADMIN || infoUser.currentRole === UserRole.SYSTEM_ADMIN) && institutions.length > 0) {
          institutionId = institutions[0].id
        }

        if (institutionId) {
          const [coursesResult, trailsResult] = await Promise.all([
            listCoursesUseCase.execute({ institutionId }),
            listTrailsUseCase.execute({ institutionId })
          ])

          setCourses(coursesResult.courses.map(course => ({
            id: course.id,
            title: course.title
          })))

          setTrails(trailsResult.trails.map(trail => ({
            id: trail.id,
            name: trail.title
          })))
        }
      } catch (err) {
        console.error('Erro ao buscar cursos e trilhas:', err)
      }
    }

    if (infoUser.id) {
      fetchCoursesAndTrails()
    }
  }, [mode, infoUser.id, infoUser.currentRole, infoUser.currentIdInstitution, institutions])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      //password: '',
      //confirmPassword: '',
      role: UserRole.STUDENT
    }
  });

  const onSubmit = async (data: FormValues) => {
    setError(null)
    setIsSubmitting(true)

    try {
      // Criar o usuário via API server-side (Admin SDK não faz auto-login)
      const createResponse = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, role: data.role }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Falha ao criar usuário')
      }

      const { userId, temporaryPassword } = await createResponse.json()

      // Associar usuário à instituição
      const associateUserUseCase = container.get<AssociateUserToInstitutionUseCase>(
        Register.institution.useCase.AssociateUserToInstitutionUseCase
      )

      const institutionId =
        infoUser.currentRole === UserRole.LOCAL_ADMIN || infoUser.currentRole === UserRole.CONTENT_MANAGER
          ? infoUser.currentIdInstitution
          : data.institutionId

      if (institutionId) {
        await associateUserUseCase.execute({
          userId,
          institutionId,
          userRole: data.role
        })
      }

      // Enviar senha temporária por email
      if (temporaryPassword) {
        try {
          const emailResponse = await fetch('/api/send-password-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: temporaryPassword, userName: data.name }),
          })

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json()
            setError(`Usuário criado com sucesso, mas houve um erro ao enviar o email: ${errorData.error || 'Erro desconhecido'}`)
          }
        } catch {
          setError('Usuário criado com sucesso, mas houve um erro ao enviar o email.')
        }
      }

      setSuccess(true)
      reset()

    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'Falha ao criar usuário. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCSVUpload = async (
    _file: File,
    data: Record<string, string>[], 
    enrollmentType: 'course' | 'trail', 
    enrollmentId: string
  ) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Determine institution ID based on user role
      let institutionId: string;

      if (infoUser.currentRole === UserRole.LOCAL_ADMIN || infoUser.currentRole === UserRole.CONTENT_MANAGER) {
        // Admin users: use their institution ID
        if (!infoUser.currentIdInstitution) {
          throw new Error('Usuário admin deve estar associado a uma instituição');
        }
        institutionId = infoUser.currentIdInstitution;
      } else if (infoUser.currentRole === UserRole.SUPER_ADMIN || infoUser.currentRole === UserRole.SYSTEM_ADMIN) {
        // Root users: need to select an institution
        const selectedInstitution = institutions.find(inst => inst.id);
        if (!selectedInstitution) {
          throw new Error('Por favor, selecione uma instituição para associar os usuários do CSV');
        }
        institutionId = selectedInstitution.id;
      } else {
        throw new Error('Usuário não tem permissão para criar usuários via CSV');
      }

      // Initialize progress
      setCsvProgress({
        current: 0,
        total: data.length,
        isProcessing: true,
        currentEmail: ''
      });

      // Use the ProcessCSVUsersUseCase to handle all the logic
      const processCSVUseCase = container.get<ProcessCSVUsersUseCase>(
        Register.user.useCase.ProcessCSVUsersUseCase
      );

      const result = await processCSVUseCase.execute({
        csvData: data,
        institutionId,
        createdByUserId: infoUser.id,
        createdByUserRole: infoUser.currentRole as UserRole,
        onProgress: (current, total, currentEmail) => {
          setCsvProgress(prev => ({ ...prev, current, total, currentEmail }));
        }
      });

      // Associa e matricula todos os usuários em paralelo
      const associateUserUseCase = container.get<AssociateUserToInstitutionUseCase>(
        Register.institution.useCase.AssociateUserToInstitutionUseCase
      );
      const enrollInCourseUseCase = container.get<EnrollInCourseUseCase>(
        EnrollmentSymbols.useCases.EnrollInCourseUseCase
      );
      const enrollInTrailUseCase = container.get<EnrollInTrailUseCase>(
        EnrollmentSymbols.useCases.EnrollInTrailUseCase
      );

      const enrollmentFailures: Array<{ email: string; error: string }> = [];
      const emailFailures: Array<{ email: string; error: string }> = [];

      const settledResults = await Promise.allSettled(
        result.createdUsers.map(async (userWithPassword) => {
          const { user, temporaryPassword, email, name } = userWithPassword;

          await associateUserUseCase.execute({
            userId: user.id,
            institutionId,
            userRole: user.role
          });

          if (enrollmentType === 'course') {
            await enrollInCourseUseCase.execute({
              userId: user.id,
              courseId: enrollmentId,
              institutionId
            });
          } else if (enrollmentType === 'trail') {
            await enrollInTrailUseCase.execute({
              userId: user.id,
              trailId: enrollmentId,
              institutionId
            });
          }

          if (temporaryPassword) {
            try {
              const emailResponse = await fetch('/api/send-password-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: temporaryPassword, userName: name }),
              });
              if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                emailFailures.push({
                  email,
                  error: `Falha ao enviar e-mail: ${errorData.error || 'Erro desconhecido'}`
                });
              }
            } catch {
              emailFailures.push({ email, error: 'Falha ao enviar e-mail de boas-vindas' });
            }
          }
        })
      );

      settledResults.forEach((settled, index) => {
        if (settled.status === 'rejected') {
          const email = result.createdUsers[index]?.email || 'desconhecido';
          const errorMessage = settled.reason instanceof Error ? settled.reason.message : 'Erro desconhecido';
          enrollmentFailures.push({ email, error: errorMessage });
        }
      });

      if (emailFailures.length > 0) {
        console.warn(`⚠️ ${emailFailures.length} e-mails falharam ao enviar:`, emailFailures);
      }

      if (enrollmentFailures.length > 0) {
        result.failedEmails.push(...enrollmentFailures);
        result.totalFailed += enrollmentFailures.length;
      }

      // Analyze results for better messaging
      const existingUsersCount = result.failedEmails.filter(failure => 
        failure.error.toLowerCase().includes('already exists') || 
        failure.error.toLowerCase().includes('já existe')
      ).length;

      const otherErrorsCount = result.totalFailed - existingUsersCount;

      // Show results with detailed messaging
      if (result.totalCreated > 0) {
        setSuccess(true);
        console.log(`✅ ${result.totalCreated} usuários criados com sucesso!`);
        
        if (existingUsersCount > 0 && otherErrorsCount === 0) {
          // Only existing users as errors
          setError(`✅ ${result.totalCreated} usuários foram cadastrados com sucesso! ${existingUsersCount} já estavam cadastrados na plataforma.`);
        } else if (existingUsersCount > 0 && otherErrorsCount > 0) {
          // Mixed errors
          setError(`✅ ${result.totalCreated} usuários foram cadastrados com sucesso! ${existingUsersCount} já estavam cadastrados e ${otherErrorsCount} falharam por outros motivos.`);
        } else if (otherErrorsCount > 0) {
          // Only other errors
          setError(`✅ ${result.totalCreated} usuários foram cadastrados com sucesso! ${otherErrorsCount} falharam por outros motivos.`);
        }
      } else {
        // No users created
        if (existingUsersCount > 0 && otherErrorsCount === 0) {
          // All users already exist
          setError(`ℹ️ Todos os ${result.totalProcessed} usuários da planilha já estão cadastrados na plataforma. Nenhum usuário novo foi criado.`);
        } else if (existingUsersCount > 0 && otherErrorsCount > 0) {
          // Mixed: some exist, some failed
          setError(`❌ Nenhum usuário foi criado. ${existingUsersCount} já estavam cadastrados e ${otherErrorsCount} falharam por outros motivos.`);
        } else if (otherErrorsCount > 0) {
          // Only other errors
          console.warn('❌ Falhas no processamento:', result.failedEmails);
          setError(`❌ Nenhum usuário foi criado. ${result.totalFailed} usuários falharam no processamento.`);
        } else {
          setError('❌ Nenhum usuário foi criado. Verifique o formato do CSV.');
        }
      }

    } catch (err) {
      console.error('Erro ao processar CSV:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar CSV. Tente novamente.');
    } finally {
      setIsSubmitting(false);
      setCsvProgress({
        current: 0,
        total: 0,
        isProcessing: false,
        currentEmail: ''
      });
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 max-w-2xl space-y-6">
          <div>
            <Button
              icon={<ArrowLeftIcon size={16} />}
              variant='primary'
              iconPosition="start"
              onClick={() => router.push('/')}
            >
              Voltar para o painel
            </Button>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg border border-input bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => { setMode('individual'); setError(null); setSuccess(false); }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'individual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cadastro Individual
            </button>
            <button
              type="button"
              onClick={() => { setMode('csv'); setError(null); setSuccess(false); }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'csv'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upload via CSV
            </button>
          </div>

          {mode === 'individual' && (
            <Card>
              <CardHeader>
                <CardTitle>Criar Usuário Individual</CardTitle>
                <CardDescription>
                  Preencha os dados para criar um novo usuário no sistema
                </CardDescription>
              </CardHeader>

              <FormSection onSubmit={handleSubmit(onSubmit)} error={error}>
                <CardContent className="space-y-4">
                  {success && (
                    <div className="p-3 rounded-md bg-green-100 text-green-800">
                      Usuário criado com sucesso!
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Nome Completo
                    </label>
                    <InputText
                      id="name"
                      {...register('name')}
                      placeholder="Digite o nome completo"
                      className={errors.name ? 'border-red-500' : ''}
                      aria-invalid={errors.name ? 'true' : 'false'}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <InputText
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Digite o email"
                      className={errors.email ? 'border-red-500' : ''}
                      aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium">
                      Tipo de Usuário
                    </label>
                    <select
                      id="role"
                      {...register('role')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {allowedRoles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === UserRole.SYSTEM_ADMIN) && (
                    <div className="space-y-2">
                      <label htmlFor="institutionId" className="block text-sm font-medium">
                        Instituição
                      </label>
                      {isLoadingInstitutions ? (
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm items-center">
                          Carregando instituições...
                        </div>
                      ) : (
                        <select
                          id="institutionId"
                          {...register('institutionId')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Selecione uma instituição</option>
                          {institutions.map((institution) => (
                            <option key={institution.id} value={institution.id}>
                              {institution.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.institutionId && (
                        <p className="text-red-500 text-xs mt-1">{errors.institutionId.message}</p>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => router.push('/')}
                    variant='secondary'
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant='primary'
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </CardFooter>
              </FormSection>
            </Card>
          )}

          {mode === 'csv' && (
            <div className="space-y-4">
              <CSVUpload
                onFileUpload={handleCSVUpload}
                courses={courses}
                trails={trails}
              />

              {csvProgress.isProcessing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processando Planilha</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{csvProgress.current} / {csvProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: `${csvProgress.total > 0 ? (csvProgress.current / csvProgress.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        Processando: {csvProgress.currentEmail}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <div className="p-3 rounded-md bg-red-100 text-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
