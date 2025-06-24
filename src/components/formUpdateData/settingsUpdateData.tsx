'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from '@/components/ui/input/input-text';
import { Button } from '@/components/ui/button/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { useProfile } from '@/context/zustand/useProfile';

type SettingsFormValues = {
    nome: string;
    sobrenome: string;
    dataNascimento: string;
    email: string;
};

const settingsFormSchema = z.object({
    nome: z.string()
        .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
        .max(50, { message: 'Nome deve ter no máximo 50 caracteres' }),
    sobrenome: z.string()
        .min(2, { message: 'Sobrenome deve ter pelo menos 2 caracteres' })
        .max(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' }),
    dataNascimento: z.string()
        .refine((date: string) => {
            const parsedDate = new Date(date);
            const today = new Date();
            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 100);
            const maxDate = new Date();
            maxDate.setFullYear(today.getFullYear() - 10);

            return !isNaN(parsedDate.getTime()) && parsedDate >= minDate && parsedDate <= maxDate;
        }, { message: 'Data de nascimento inválida' }),
    email: z.string()
        .email({ message: 'Email inválido' })
});

export default function FormUpdateData() {
    const profile = useProfile();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            nome: '',
            sobrenome: '',
            dataNascimento: '',
            email: ''
        }
    });

    useEffect(() => {
        if (profile) {
            setValue('nome', 'luan');
            setValue('sobrenome', 'portugal');
            setValue('dataNascimento', '13/12/2000');
            setValue('email', 'teste@gmail.com');
        }
    }, [profile, setValue]);

    const onSubmit = async () => {
        try {
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erro ao salvar configurações. Por favor, tente novamente.');
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
                                <label htmlFor="dataNascimento" className="block text-sm font-medium mb-1">
                                    Data de Nascimento
                                </label>
                                <InputText
                                    id="dataNascimento"
                                    type="date"
                                    {...register('dataNascimento')}
                                    className={errors.dataNascimento ? 'border-red-500' : ''}
                                    aria-invalid={errors.dataNascimento ? 'true' : 'false'}
                                />
                                {errors.dataNascimento && (
                                    <p className="mt-1 text-sm text-red-500">{errors.dataNascimento.message}</p>
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
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
