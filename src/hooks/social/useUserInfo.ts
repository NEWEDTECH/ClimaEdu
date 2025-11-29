'use client';

import { useState, useEffect } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container/symbols';
import type { GetUserByIdUseCase } from '@/_core/modules/user/core/use-cases/get-user-by-id/get-user-by-id.use-case';

interface UserInfo {
  name: string;
  email?: string;
}

// Cache to avoid redundant fetches
const userCache = new Map<string, UserInfo>();

export function useUserInfo(userId: string | undefined) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUserInfo(null);
      return;
    }

    // Check cache first
    if (userCache.has(userId)) {
      setUserInfo(userCache.get(userId)!);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        
        // Get use case from container
        const getUserByIdUseCase = container.get<GetUserByIdUseCase>(
          Register.user.useCase.GetUserByIdUseCase
        );
        
        // Execute use case
        const result = await getUserByIdUseCase.execute({ userId });
        
        if (result.user) {
          const info: UserInfo = {
            name: result.user.name || 'Usuário',
            email: result.user.email?.value
          };
          
          // Cache the result
          userCache.set(userId, info);
          setUserInfo(info);
        } else {
          setUserInfo({ name: 'Usuário' });
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo({ name: 'Usuário' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return { userInfo, loading };
}
