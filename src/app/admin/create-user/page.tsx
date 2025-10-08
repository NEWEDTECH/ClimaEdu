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
import { CreateUserUseCase } from '@/_core/modules/user/core/use-cases/create-user/create-user.use-case'
import { ProcessCSVUsersUseCase } from '@/_core/modules/user/core/use-cases/process-csv-users/process-csv-users.use-case'
import { AssociateUserToInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/associate-user-to-institution/associate-user-to-institution.use-case'
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { Institution } from '@/_core/modules/institution/core/entities/Institution'
import { useProfile } from '@/context/zustand/useProfile'
import { ArrowLeftIcon } from 'lucide-react'


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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(false)
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

  const currentUserRole: UserRole = UserRole.SUPER_ADMIN;

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
      // Criar o usuário
      const createUserUseCase = container.get<CreateUserUseCase>(
        Register.user.useCase.CreateUserUseCase
      )

      const createUserResult = await createUserUseCase.execute({
        name: data.name,
        email: data.email,
        password: '',
        type: data.role
      })

      // Associate user to institution based on user role and selected institution
      if (infoUser.currentRole === UserRole.LOCAL_ADMIN || infoUser.currentRole === UserRole.CONTENT_MANAGER) {
        if (infoUser.currentIdInstitution && createUserResult.user) {
          const associateUserUseCase = container.get<AssociateUserToInstitutionUseCase>(
            Register.institution.useCase.AssociateUserToInstitutionUseCase
          )

          await associateUserUseCase.execute({
            userId: createUserResult.user.id,
            institutionId: infoUser.currentIdInstitution,
            userRole: data.role
          })
        }
      } else if ((infoUser.currentRole === UserRole.SUPER_ADMIN || infoUser.currentRole === UserRole.SYSTEM_ADMIN) && data.institutionId && createUserResult.user) {
        const associateUserUseCase = container.get<AssociateUserToInstitutionUseCase>(
          Register.institution.useCase.AssociateUserToInstitutionUseCase
        )

        await associateUserUseCase.execute({
          userId: createUserResult.user.id,
          institutionId: data.institutionId,
          userRole: data.role
        })
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

  const handleCSVUpload = async (file: File, data: Record<string, string>[]) => {
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

      console.log(data)

      const result = await processCSVUseCase.execute({
        csvData: data,
        institutionId,
        createdByUserId: infoUser.id,
        createdByUserRole: infoUser.currentRole as UserRole,
        onProgress: (current, total, currentEmail) => {
          console.log(`🎯 Frontend received progress update: ${current}/${total} - ${currentEmail}`);
          setCsvProgress(prev => {
            console.log(`📱 Updating state from ${prev.current}/${prev.total} to ${current}/${total}`);
            return {
              ...prev,
              current,
              total,
              currentEmail
            };
          });
        }
      });

      // Associate each created user to the institution
      const associateUserUseCase = container.get<AssociateUserToInstitutionUseCase>(
        Register.institution.useCase.AssociateUserToInstitutionUseCase
      );

      const associationFailures: Array<{ email: string; error: string }> = [];
      
      for (const user of result.createdUsers) {
        try {
          await associateUserUseCase.execute({
            userId: user.id,
            institutionId,
            userRole: user.role
          });
        } catch (error) {
          associationFailures.push({
            email: user.email.value,
            error: `Failed to associate user to institution: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }

      // Update result with association failures
      if (associationFailures.length > 0) {
        result.failedEmails.push(...associationFailures);
        result.totalFailed += associationFailures.length;
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
        <div className="container mx-auto p-6 space-y-6">
          <div className="mb-6">
            <Button
              icon={<ArrowLeftIcon size={16} />}
              variant='primary'
              iconPosition="start"
              onClick={() => router.push('/')}
            >
              Voltar para o painel
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Criar Usuário Individual</CardTitle>
                <CardDescription>
                  Preencha os dados para criar um novo usuário no sistema
                </CardDescription>
              </CardHeader>

              <FormSection onSubmit={handleSubmit(onSubmit)} error={error}>
                <CardContent className="space-y-4">
                  {success && (
                    <div className="p-3 rounded-md bg-green-100 text-green-800 mb-4">
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

            <div className="flex-1 flex flex-col">
              <CSVUpload onFileUpload={handleCSVUpload} />

              {/* Progress Bar */}
              {csvProgress.isProcessing && (
                <Card className="mt-4">
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
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Processando: {csvProgress.currentEmail}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
