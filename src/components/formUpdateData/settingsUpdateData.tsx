'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from '@/components/ui/input/input-text';
import { Button } from '@/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { UploadImageUseCase } from '@/_core/modules/storage/core/use-cases/upload-image/upload-image.use-case';
import { Profile } from '@/_core/modules/user/core/entities/Profile';
import { showToast } from '@/components/toast';
import { RxAvatar } from 'react-icons/rx';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const settingsFormSchema = z.object({
  nome: z.string()
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(50, { message: 'Nome deve ter no máximo 50 caracteres' }),
  sobrenome: z.string()
    .min(2, { message: 'Sobrenome deve ter pelo menos 2 caracteres' })
    .max(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' }),
  email: z.string()
    .email({ message: 'Email inválido' }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function FormUpdateData() {
  const { infoUser, setInfoUser } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      nome: '',
      sobrenome: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!infoUser.id) return;

    const nameParts = infoUser.name?.split(' ') ?? [];
    setValue('nome', nameParts[0] ?? '');
    setValue('sobrenome', nameParts.slice(1).join(' ') ?? '');
    setAvatarPreview(infoUser.avatarUrl ?? null);

    const userRepository = container.get<UserRepository>(
      Register.user.repository.UserRepository
    );

    userRepository.findById(infoUser.id).then((user) => {
      if (user) {
        setValue('email', user.email.value);
      }
    });
  }, [infoUser.id, infoUser.name, infoUser.avatarUrl, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Formato inválido. Use JPEG, PNG ou WEBP.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: SettingsFormValues) => {
    if (!infoUser.id) return;

    const loadingToastId = showToast.loading('Salvando configurações...');

    try {
      const userRepository = container.get<UserRepository>(
        Register.user.repository.UserRepository
      );

      const user = await userRepository.findById(infoUser.id);
      if (!user) throw new Error('Usuário não encontrado');

      const fullName = `${data.nome} ${data.sobrenome}`.trim();
      user.updateName(fullName);

      let newAvatarUrl = user.profile?.avatarUrl;

      if (selectedFile) {
        const uploadUseCase = container.get<UploadImageUseCase>(
          Register.storage.useCase.UploadImageUseCase
        );

        const uploadResult = await uploadUseCase.execute({
          file: selectedFile,
          imageType: 'avatar',
          userId: infoUser.id,
        });

        if (!uploadResult.success || !uploadResult.downloadUrl) {
          throw new Error(uploadResult.message);
        }

        newAvatarUrl = uploadResult.downloadUrl;
      }

      const updatedProfile = Profile.create({
        bio: user.profile?.bio,
        linkedinUrl: user.profile?.linkedinUrl,
        avatarUrl: newAvatarUrl,
      });

      user.attachProfile(updatedProfile);
      await userRepository.save(user);

      setInfoUser({
        ...infoUser,
        name: fullName,
        avatarUrl: newAvatarUrl,
      });

      setSelectedFile(null);

      showToast.update(loadingToastId, {
        render: 'Configurações salvas com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast.update(loadingToastId, {
        render: `Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <RxAvatar className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={handleFileChange}
              />

              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? 'Alterar foto' : 'Adicionar foto'}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPEG, PNG ou WEBP · Máximo {MAX_SIZE_MB}MB
              </p>

              {fileError && (
                <p className="text-sm text-red-500">{fileError}</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium mb-1">
                  Nome
                </label>
                <InputText
                  id="nome"
                  {...register('nome')}
                  placeholder="Digite seu nome"
                  className={errors.nome ? 'border-red-500' : ''}
                  aria-invalid={errors.nome ? 'true' : 'false'}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-500">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="sobrenome" className="block text-sm font-medium mb-1">
                  Sobrenome
                </label>
                <InputText
                  id="sobrenome"
                  {...register('sobrenome')}
                  placeholder="Digite seu sobrenome"
                  className={errors.sobrenome ? 'border-red-500' : ''}
                  aria-invalid={errors.sobrenome ? 'true' : 'false'}
                />
                {errors.sobrenome && (
                  <p className="mt-1 text-sm text-red-500">{errors.sobrenome.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <InputText
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Digite seu email"
                  className={errors.email ? 'border-red-500' : ''}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !!fileError}>
                {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
