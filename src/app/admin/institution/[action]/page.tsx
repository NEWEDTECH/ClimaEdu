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
  UpdateInstitutionSettingsInput
} from '@/_core/modules/institution';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { FormSection } from '@/components/form'
import { Button } from "@/components/button";
import { InputText } from '@/components/ui/input/input-text/InputText';
import { InputMedia } from '@/components/ui/input/input-media/InputMedia';
import { ArrowLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
  const institutionId = params.id as string;
  const isEditMode = !!institutionId;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

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

  // Load institution data if in edit mode
  useEffect(() => {
    if (isEditMode && institutionId) {
      const fetchInstitution = async () => {
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
          setLogoUrl(fetchedInstitution.settings.logoUrl);
          
          reset({
            name: fetchedInstitution.name,
            domain: fetchedInstitution.domain,
            logoUrl: fetchedInstitution.settings.logoUrl || '',
            primaryColor: fetchedInstitution.settings.primaryColor || '',
            secondaryColor: fetchedInstitution.settings.secondaryColor || '',
          });
        } catch (err: unknown) {
          console.error('Error fetching institution:', err);
          const errorMessage = err instanceof Error 
            ? `Falha ao carregar instituição: ${err.message}` 
            : 'Falha ao carregar instituição. Por favor, tente novamente.';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchInstitution();
    }
  }, [isEditMode, institutionId, reset]);

  const handleLogoUpload = (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: () => void
  ) => {

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setLogoUrl(result);
          setValue('logoUrl', result);
          onComplete();
        };
        reader.readAsDataURL(file);
      }
    }, 200);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);

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

        await createInstitutionUseCase.execute(input);
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
              icon={<ArrowLeftIcon size={16} />}
              iconPosition="start"
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
                  
                  if (id === 'logoUrl') return null;
                  
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
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mt-4">
                    Logo da Instituição
                  </label>
                  <div className="max-w-xs">
                    <InputMedia
                      aspect="1:1"
                      maxWidth={400}
                      initialImageSrc={logoUrl}
                      allowedExtensions="png,jpg,jpeg"
                      maxFileSizeMB={2}
                      uploadFunction={handleLogoUpload}
                      deleteFunction={() => {
                        setLogoUrl(undefined);
                        setValue('logoUrl', '');
                      }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs">Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 2MB</p>
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
