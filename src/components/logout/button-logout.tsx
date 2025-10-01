"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut } from "react-icons/fi";

import { Button } from '@/components/ui/button/button'
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';

export function ButtonLogout({}) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            console.log('🚪 ButtonLogout: Starting logout process...');
            setIsLoggingOut(true);

            const authService = container.get<AuthService>(Register.auth.service.AuthService);
            
            console.log('🔓 ButtonLogout: Calling Firebase signOut...');
            await authService.signOut();
            
            console.log('✅ ButtonLogout: Firebase signOut completed');
            console.log('🔄 ButtonLogout: Redirecting to login page...');
            
            router.push('/login');
            
        } catch (error) {
            console.error('❌ ButtonLogout: Error during logout:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start cursor-pointer"
        >
            <FiLogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
        </Button>
    );
}
