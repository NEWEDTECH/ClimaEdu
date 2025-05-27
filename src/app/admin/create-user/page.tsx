'use client'

import { useState } from 'react'
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
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container/symbols'
import { CreateUserUseCase } from '@/_core/modules/user/core/use-cases/create-user/create-user.use-case'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { ArrowLeftIcon } from 'lucide-react'

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  //password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  //confirmPassword: z.string(),
  role: z.enum([UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMINISTRATOR])
})//.refine((data) => data.password === data.confirmPassword, {
  //message: "As senhas não coincidem",
  //path: ["confirmPassword"],
//});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

export default function CreateUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

      const createUserUseCase = container.get<CreateUserUseCase>(
        Register.user.useCase.CreateUserUseCase
      )
      
      await createUserUseCase.execute({
        name: data.name,
        email: data.email,
        password: '',
        type: data.role
      })
      
      setSuccess(true)
      
      reset()
      
    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'Falha ao criar usuário. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="mb-6">
            <Button
              icon={<ArrowLeftIcon size={16} />}
              iconPosition="start"
              onClick={() => router.push('/admin')}
            >
              Voltar para o painel
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Criar Novo Usuário</CardTitle>
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
                
                {/*<div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Senha
                  </label>
                  <InputText
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Digite a senha"
                    className={errors.password ? 'border-red-500' : ''}
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Confirmar Senha
                  </label>
                  <InputText
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Confirme a senha"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                */}
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium">
                    Tipo de Usuário
                  </label>
                  <select
                    id="role"
                    {...register('role')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value={UserRole.STUDENT}>Estudante</option>
                    <option value={UserRole.TUTOR}>Tutor</option>
                    <option value={UserRole.ADMINISTRATOR}>Administrador</option>
                  </select>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="border border-gray-300 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-bold"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
