"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut } from "react-icons/fi";

import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button/button'
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';

export function ButtonLogout({}) {

    const router = useRouter();

    const handleLogout = async () => {
        try {
            const authService = container.get<AuthService>(Register.auth.service.AuthService);
            await authService.signOut();

            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (

        <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full justify-start cursor-pointer"
        >
            <FiLogOut className="w-4 h-4" />
            <span>Sair</span>
        </Button>
    );
}
