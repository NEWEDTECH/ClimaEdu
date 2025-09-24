 'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { useRouter, useParams } from 'next/navigation';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { 
  CreateInstitutionUseCase, 
  CreateInstitutionInput,
  InstitutionRepository,
  Institution,
  UpdateInstitutionSettingsUseCase,
  UpdateInstitutionSettingsInput,
  UpdateInstitutionAdvancedSettingsUseCase,
  UpdateInstitutionAdvancedSettingsInput,
  AssociateUserToInstitutionUseCase,
  UserInstitution
} from '@/_core/modules/institution';
import { User, UserRole } from '@/_core/modules/user/core/entities/User';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import type { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { FormSection } from '@/components/form'
import { Button } from "@/components/button";
import { InputText } from '@/components/ui/input/input-text/InputText';
import { AdvancedSettingsSection } from '@/components/institution/AdvancedSettingsSection';
import { Tooltip } from '@/components/tooltip';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { InstitutionSettings as GlobalSettings } from '@/_core/shared/config/settings.config';

type InputFieldMeta = {
  label: string;
  placeholder: string;
  description: string;
  colorPreview?: boolean;
};

type InstitutionFormFields = {
  name: string;
  domain: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

type FormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome da instituição é obrigatório' }),
  domain: z
    .string()
    .min(1, { message: 'O domínio da instituição é obrigatório' })
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, {
      message: 'Formato de domínio inválido (ex: exemplo.com)',
    }),
  logoUrl: z.string().url({ message: 'URL inválida' }).optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Formato de cor inválido (ex: #FF5733)',
    })
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Formato de cor inválido (ex: #FF5733)',
    })
    .optional()
    .or(z.literal('')),
});

const inputFields: Record<keyof InstitutionFormFields, InputFieldMeta> = {
  name: {
    label: "Nome da Instituição *",
    placeholder: "Digite o nome da instituição",
    description: "",
  },
  domain: {
    label: "Domínio *",
    placeholder: "exemplo.com",
    description: "O domínio deve estar no formato: exemplo.com",
  },
  logoUrl: {
    label: "URL do Logo",
    placeholder: "https://exemplo.com/logo.png",
    description: "URL da imagem do logo da instituição",
  },
  primaryColor: {
    label: "Cor Primária",
    placeholder: "#FF5733",
    description: "Código hexadecimal da cor primária (ex: #FF5733)",
    colorPreview: true,
  },
  secondaryColor: {
    label: "Cor Secundária",
    placeholder: "#33FF57",
    description: "Código hexadecimal da cor secundária (ex: #33FF57)",
    colorPreview: true,
  },
};

export default function InstitutionPage() {
  const router = useRouter();
  const params = useParams();
  
  const id = params.id as string;
  const isEditMode = !!id;
  const institutionId = id || '';
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [administrators, setAdministrators] = useState<User[]>([]);
  const [filteredAdministrators, setFilteredAdministrators] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedAdministrators, setSelectedAdministrators] = useState<Array<{id: string, email: string}>>([]);
  const [originalAdministrators, setOriginalAdministrators] = useState<Array<{id: string, email: string}>>([]);
  const [advancedSettings, setAdvancedSettings] = useState<Partial<GlobalSettings['settings']>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      domain: '',
      logoUrl: '',
      primaryColor: '',
      secondaryColor: '',
    },
  });

  // Load administrators
  useEffect(() => {
    const fetchAdministrators = async () => {
      try {
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        );
        
        const adminUsers = await userRepository.listByType(UserRole.LOCAL_ADMIN);
        setAdministrators(adminUsers);
        setFilteredAdministrators(adminUsers);
      } catch (err) {
        console.error('Error fetching administrators:', err);
      }
    };
    
    fetchAdministrators();
  }, []);
  
  // Filter administrators based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAdministrators(administrators);
    } else {
      const filtered = administrators.filter(admin => 
        admin.email.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAdministrators(filtered);
    }
  }, [searchTerm, administrators]);

  // Load institution data if in edit mode
  useEffect(() => {
    if (isEditMode && institutionId) {
      const fetchInstitutionData = async () => {
        try {
          setLoading(true);

          const institutionRepository = container.get<InstitutionRepository>(
            Register.institution.repository.InstitutionRepository
          );

          const fetchedInstitution = await institutionRepository.findById(institutionId);

          if (!fetchedInstitution) {
            setError('Instituição não encontrada');
            return;
          }

          setInstitution(fetchedInstitution);
          
          reset({
            name: fetchedInstitution.name,
            domain: fetchedInstitution.domain,
            logoUrl: fetchedInstitution.settings.logoUrl || '',
            primaryColor: fetchedInstitution.settings.primaryColor || '',
            secondaryColor: fetchedInstitution.settings.secondaryColor || '',
          });

          // Fetch administrators associated with this institution
          const userInstitutionRepository = container.get<UserInstitutionRepository>(
            Register.institution.repository.UserInstitutionRepository
          );
          
          const userRepository = container.get<UserRepository>(
            Register.user.repository.UserRepository
          );
          
          // Get all user-institution associations for this institution
          const userInstitutions = await userInstitutionRepository.findByInstitutionId(institutionId);
          
          // For each association, fetch the user details if they are an administrator
          const adminPromises = userInstitutions.map(async (userInst: UserInstitution) => {
            const user = await userRepository.findById(userInst.userId);
            if (user && user.role === UserRole.LOCAL_ADMIN) {
              return { id: user.id, email: user.email.value };
            }
            return null;
          });
          
          const admins = (await Promise.all(adminPromises)).filter((admin: {id: string, email: string} | null) => admin !== null) as Array<{id: string, email: string}>;
          setSelectedAdministrators(admins);
          setOriginalAdministrators(admins);
          
          // Load advanced settings
          setAdvancedSettings(fetchedInstitution.settings.settings || {});
          
        } catch (err: unknown) {
          console.error('Error fetching institution data:', err);
          const errorMessage = err instanceof Error 
            ? `Falha ao carregar dados da instituição: ${err.message}` 
            : 'Falha ao carregar dados da instituição. Por favor, tente novamente.';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchInstitutionData();
    }
  }, [isEditMode, institutionId, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);

      let newInstitutionId = '';
      
      if (isEditMode && institution) {

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        );

        const updateSettingsUseCase = container.get<UpdateInstitutionSettingsUseCase>(
          Register.institution.useCase.UpdateInstitutionSettingsUseCase
        );

        if (data.name !== institution.name || data.domain !== institution.domain) {

          const updatedInstitution = Institution.create({
            id: institution.id,
            name: data.name.trim(),
            domain: data.domain.trim(),
            settings: institution.settings,
            createdAt: institution.createdAt,
            updatedAt: new Date()
          });

          await institutionRepository.save(updatedInstitution);
        }

        const settingsInput: UpdateInstitutionSettingsInput = {
          institutionId: institution.id,
          settings: {
            logoUrl: data.logoUrl || undefined,
            primaryColor: data.primaryColor || undefined,
            secondaryColor: data.secondaryColor || undefined
          }
        };

        await updateSettingsUseCase.execute(settingsInput);

        // Update advanced settings if changed
        if (Object.keys(advancedSettings).length > 0) {
          const updateAdvancedSettingsUseCase = container.get<UpdateInstitutionAdvancedSettingsUseCase>(
            Register.institution.useCase.UpdateInstitutionAdvancedSettingsUseCase
          );

          const advancedSettingsInput: UpdateInstitutionAdvancedSettingsInput = {
            institutionId: institution.id,
            advancedSettings
          };

          await updateAdvancedSettingsUseCase.execute(advancedSettingsInput);
        }
        
        newInstitutionId = institution.id;
      } else {

        const createInstitutionUseCase = container.get<CreateInstitutionUseCase>(
          Register.institution.useCase.CreateInstitutionUseCase
        );

        const input: CreateInstitutionInput = {
          name: data.name.trim(),
          domain: data.domain.trim(),
          logoUrl: data.logoUrl ? data.logoUrl.trim() : undefined,
          primaryColor: data.primaryColor ? data.primaryColor.trim() : undefined,
          secondaryColor: data.secondaryColor ? data.secondaryColor.trim() : undefined,
        };

        const result = await createInstitutionUseCase.execute(input);
        newInstitutionId = result.institution.id;

        // Create advanced settings for new institution if provided
        if (Object.keys(advancedSettings).length > 0) {
          const updateAdvancedSettingsUseCase = container.get<UpdateInstitutionAdvancedSettingsUseCase>(
            Register.institution.useCase.UpdateInstitutionAdvancedSettingsUseCase
          );

          const advancedSettingsInput: UpdateInstitutionAdvancedSettingsInput = {
            institutionId: newInstitutionId,
            advancedSettings
          };

          await updateAdvancedSettingsUseCase.execute(advancedSettingsInput);
        }
      }

      // Handle administrator associations
      if (isEditMode) {
        // Find administrators to remove (in original list but not in new list)
        const adminToRemove = originalAdministrators.find(
          original => !selectedAdministrators.some(selected => selected.id === original.id)
        );
        
        // Find administrators to add (in new list but not in original list)
        const adminToAdd = selectedAdministrators.find(
          selected => !originalAdministrators.some(original => original.id === selected.id)
        );
        
        // Remove administrator if needed
        if (adminToRemove) {
          const userInstitutionRepository = container.get<UserInstitutionRepository>(
            Register.institution.repository.UserInstitutionRepository
          );
          
          try {
            // Find the user-institution association
            const association = await userInstitutionRepository.findByUserAndInstitution(
              adminToRemove.id, 
              newInstitutionId
            );
            
            if (association) {
              // Delete the association
              await userInstitutionRepository.delete(association.id);
              console.log(`Removed administrator ${adminToRemove.email} from institution`);
            }
          } catch (removeErr) {
            console.error(`Error removing administrator:`, removeErr);
          }
        }
        
        // Add administrator if needed
        if (adminToAdd) {
          const associateUserToInstitutionUseCase = container.get<AssociateUserToInstitutionUseCase>(
            Register.institution.useCase.AssociateUserToInstitutionUseCase
          );
          
          try {
            await associateUserToInstitutionUseCase.execute({
              userId: adminToAdd.id,
              institutionId: newInstitutionId,
              userRole: UserRole.LOCAL_ADMIN
            });
            console.log(`Added administrator ${adminToAdd.email} to institution`);
          } catch (addErr) {
            console.error(`Error associating administrator:`, addErr);
          }
        }
      } else if (selectedAdministrators.length > 0) {
        // For new institutions, add the first selected administrator
        const adminToAdd = selectedAdministrators[0];
        const associateUserToInstitutionUseCase = container.get<AssociateUserToInstitutionUseCase>(
          Register.institution.useCase.AssociateUserToInstitutionUseCase
        );
        
        try {
          await associateUserToInstitutionUseCase.execute({
            userId: adminToAdd.id,
            institutionId: newInstitutionId,
            userRole: UserRole.LOCAL_ADMIN
          });
        } catch (associateErr) {
          console.error(`Error associating administrator:`, associateErr);
        }
      }
      
      router.push('/admin/institution');
    } catch (err: unknown) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} institution:`, err);
      const errorMessage = err instanceof Error ? err.message : `Falha ao ${isEditMode ? 'atualizar' : 'criar'} instituição. Por favor, tente novamente.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-blue-200"></div>
            <div className="mt-4 text-gray-500">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && isEditMode && !institution) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
          <div className="mt-4">
            <Button
              onClick={() => router.push('/admin/institution')}
              className="border border-gray-300 bg-white hover:bg-gray-50"
            >
              Voltar para lista de instituições
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <Button
              variant='primary'
              onClick={() => router.push('/admin/institution')}
            >
              Voltar para lista de instituições
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{isEditMode ? 'Editar Instituição' : 'Criar Nova Instituição'}</CardTitle>
            </CardHeader>

            <FormSection onSubmit={handleSubmit(onSubmit)} error={error}>
              <CardContent className="space-y-6">

                {Object.entries(inputFields).map(([key, field]) => {
                  const id = key as keyof InstitutionFormFields;
                  
                  const hasError = !!errors[id];
                  const errorMessage = errors[id]?.message;
                  const value = watch(id);

                  if (field.colorPreview) {
                    return (
                      <div key={id} className="space-y-2">
                        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mt-4">
                          {field.label}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id={`color-${id}`}
                            value={value || '#FFFFFF'}
                            onChange={(e) => setValue(id, e.target.value)}
                            className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          />
                          <InputText
                            id={id}
                            {...register(id)}
                            placeholder={field.placeholder}
                            className={`${hasError ? 'border-red-500' : ''} flex-grow`}
                            aria-invalid={hasError}
                          />
                        </div>
                        {hasError && <p className="text-red-500 text-xs mt-1">{String(errorMessage)}</p>}
                        {field.description && <p className="text-gray-500 text-xs">{field.description}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={id} className="space-y-2">
                      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mt-4">
                        {field.label}
                      </label>
                      <InputText
                        id={id}
                        {...register(id)}
                        placeholder={field.placeholder}
                        className={hasError ? 'border-red-500' : ''}
                        aria-invalid={hasError}
                      />
                      {hasError && <p className="text-red-500 text-xs mt-1">{String(errorMessage)}</p>}
                      {field.description && <p className="text-gray-500 text-xs">{field.description}</p>}
                    </div>
                  );
                })}


                <div className="space-y-2">
                  <label htmlFor="administratorSearch" className="block text-sm font-medium text-gray-700 mt-4">
                    Administradores
                  </label>
                  
                  <div className="flex flex-wrap mb-2">
                    {selectedAdministrators.map((admin) => (
                       <div key={admin.id} className="relative bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <Tooltip label={admin.email} />
                        <Button
                          type="button"
                          onClick={() => {
                            // Only update the UI, backend changes will be made on save
                            setSelectedAdministrators(prev => 
                              prev.filter(a => a.id !== admin.id)
                            );
                          }}
                          className="bg-red-500 text-white rounded-full p-0.5"
                          aria-label="Remover administrador"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <InputText
                      id="administratorSearch"
                      type="text"
                      placeholder="Buscar administrador por email"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="mb-2"
                    />
                    
                    {showDropdown && searchTerm.trim() !== '' && filteredAdministrators.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredAdministrators
                          .filter(admin => !selectedAdministrators.some(selected => selected.id === admin.id))
                          .map((admin) => (
                            <div
                              key={admin.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setSelectedAdministrators(prev => [
                                  ...prev, 
                                  { id: admin.id, email: admin.email.value }
                                ]);
                                setSearchTerm('');
                                setShowDropdown(false);
                              }}
                            >
                              <div className="font-medium">{admin.name}</div>
                              <div className="text-sm text-gray-500">{admin.email.value}</div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    Selecione administradores para associar a esta instituição
                  </p>
                </div>

                {/* Advanced Settings Section */}
                <div className="col-span-full">
                  <AdvancedSettingsSection
                    settings={advancedSettings}
                    onChange={setAdvancedSettings}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button
                  className='font-bold'
                  type="submit"
                  disabled={loading}
                >
                  {loading 
                    ? (isEditMode ? 'Salvando...' : 'Criando...') 
                    : (isEditMode ? 'Salvar Alterações' : 'Criar Instituição')
                  }
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
