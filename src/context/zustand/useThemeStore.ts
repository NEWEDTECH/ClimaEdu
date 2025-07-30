'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      
      toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        
        // Aplicar ao documento
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      setTheme: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        
        // Aplicar ao documento
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      initializeTheme: () => {
        const { isDarkMode } = get();
        
        // Verificar preferência do sistema se não houver tema salvo
        if (typeof window !== 'undefined') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          // Se não há tema persistido, usar preferência do sistema
          const savedTheme = localStorage.getItem('theme-storage');
          if (!savedTheme) {
            set({ isDarkMode: prefersDark });
            
            if (prefersDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } else {
            // Aplicar tema salvo
            if (isDarkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);
