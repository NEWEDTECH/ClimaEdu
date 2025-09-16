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

export default function CreateUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(false)
  const { infoUser } = useProfile()

  const currentUserRole: UserRole = UserRole.SUPER_ADMIN;

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

  const handleCSVUpload = async (file: File, data: any[]) => {
    console.log('📊 CSV Upload recebido:', {
      arquivo: file.name,
      totalRegistros: data.length,
      primeiroRegistro: data[0],
      todosOsDados: data
    });

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
        const selectedInstitution = institutions.find(inst => inst.id); // You might want to add institution selection for CSV
        if (!selectedInstitution) {
          throw new Error('Por favor, selecione uma instituição para associar os usuários do CSV');
        }
        institutionId = selectedInstitution.id;
      } else {
        throw new Error('Usuário não tem permissão para criar usuários via CSV');
      }

      // Validate CSV has email column
      if (data.length === 0) {
        throw new Error('CSV data is empty');
      }

      const firstRow = data[0];
      const hasEmailColumn = Object.keys(firstRow).some(key => 
        key.toLowerCase().trim() === 'email'
      );

      if (!hasEmailColumn) {
        throw new Error('CSV must contain an "email" column');
      }

      const createdUsers: any[] = [];
      const failedEmails: Array<{ email: string; error: string }> = [];

      // Process each row manually using existing CreateUserUseCase
      const createUserUseCase = container.get<CreateUserUseCase>(
        Register.user.useCase.CreateUserUseCase
      );

      for (const row of data) {
        try {
          // Extract email from CSV row (case-insensitive)
          const emailKey = Object.keys(row).find(key => 
            key.toLowerCase().trim() === 'email'
          );
          const emailValue = emailKey ? row[emailKey].trim() : '';
          
          if (!emailValue || emailValue.trim() === '') {
            failedEmails.push({
              email: 'empty',
              error: 'Email is empty or missing'
            });
            continue;
          }

          // Extract name from CSV or use email as fallback
          const nameKey = Object.keys(row).find(key => {
            const lowerKey = key.toLowerCase().trim();
            return lowerKey === 'name' || lowerKey === 'nome' || lowerKey === 'full_name' || lowerKey === 'fullname';
          });

          const userName = (nameKey && row[nameKey].trim()) ? row[nameKey].trim() : emailValue.split('@')[0];

          // Create user
          const createUserResult = await createUserUseCase.execute({
            name: userName,
            email: emailValue,
            password: '',
            type: UserRole.STUDENT // Default role
          });

          if (createUserResult.user) {
            createdUsers.push(createUserResult.user);
          }

        } catch (error) {
          const emailKey = Object.keys(row).find(key => 
            key.toLowerCase().trim() === 'email'
          );
          const emailValue = emailKey ? row[emailKey].trim() : 'unknown';
          
          failedEmails.push({
            email: emailValue,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      }

      const result = {
        createdUsers,
        failedEmails,
        totalProcessed: data.length,
        totalCreated: createdUsers.length,
        totalFailed: failedEmails.length
      };

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

      // Show results
      if (result.totalCreated > 0) {
        setSuccess(true);
        console.log(`✅ ${result.totalCreated} usuários criados com sucesso!`);
        
        if (result.totalFailed > 0) {
          console.warn(`⚠️ ${result.totalFailed} usuários falharam:`, result.failedEmails);
          setError(`${result.totalCreated} usuários criados, mas ${result.totalFailed} falharam. Verifique o console para detalhes.`);
        }
      } else {
        throw new Error('Nenhum usuário foi criado. Verifique o formato do CSV.');
      }

    } catch (err) {
      console.error('Erro ao processar CSV:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar CSV. Tente novamente.');
    } finally {
      setIsSubmitting(false);
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
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

            <div className="lg:col-span-1">
              <CSVUpload onFileUpload={handleCSVUpload} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
