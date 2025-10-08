'use client';

import { useEffect } from 'react';
import { useProfile } from '@/context/zustand/useProfile';

// Função para converter HEX para HSL

export function useThemeColors() {
  const { infoInstitutions } = useProfile();
  
  useEffect(() => {
    const institution = infoInstitutions.institutions;
    
    if (institution.primary_color && institution.secondary_color) {
      console.log('🎨 Aplicando cores do tema:', {
        primary: institution.primary_color,
        secondary: institution.secondary_color
      });
      
      // Aplica as cores CSS customizadas
      const root = document.documentElement;

      // Cores primárias
      root.style.setProperty('--primary', institution.primary_color);
      root.style.setProperty('--primary-foreground', institution.secondary_color);
      
      // Cores secundárias
      root.style.setProperty('--secondary', institution.secondary_color);
      root.style.setProperty('--secondary-foreground', institution.secondary_color);
      
      // Aplica também para sidebar se necessário
      root.style.setProperty('--sidebar-primary', institution.primary_color);
      root.style.setProperty('--sidebar-primary-foreground', institution.secondary_color);
      
      
      console.log('✅ Cores aplicadas com sucesso:', {
        '--primary': institution.primary_color,
        '--secondary': institution.secondary_color,
        '--accent': institution.primary_color
      });
    } else {
      console.log('⚠️ Cores da instituição não encontradas');
    }
  }, [infoInstitutions.institutions.primary_color, infoInstitutions.institutions.secondary_color, infoInstitutions.institutions]);
  
  return {
    primaryColor: infoInstitutions.institutions.primary_color,
    secondaryColor: infoInstitutions.institutions.secondary_color,
  };
}
