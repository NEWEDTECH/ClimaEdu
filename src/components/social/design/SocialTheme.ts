// Social Module Design System
// Inspired by Medium.com with ClimaEdu branding

export const socialTheme = {
  // Color Palette
  colors: {
    // Primary colors (aligned with ClimaEdu brand)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Secondary colors (greens for environmental theme)
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Accent colors for interactions
    accent: {
      like: '#ef4444', // Red for likes
      comment: '#6366f1', // Indigo for comments
      share: '#8b5cf6', // Purple for sharing
      bookmark: '#f59e0b', // Amber for bookmarks
    },
    
    // Neutral colors (enhanced for better readability)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Status colors
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Background variations
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
      }
    }
  },
  
  // Typography (Medium-inspired)
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Charter', 'Georgia', 'serif'], // For article content
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  // Spacing (8px base grid)
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // Shadows (subtle and elegant)
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',   // Small devices
    md: '768px',   // Medium devices
    lg: '1024px',  // Large devices
    xl: '1280px',  // Extra large devices
    '2xl': '1536px', // 2X large devices
  },
  
  // Animation durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  // Component-specific styles
  components: {
    // Post card styling
    postCard: {
      padding: '1.5rem', // 24px
      borderRadius: '0.75rem', // 12px
      shadow: 'md',
      border: '1px solid rgb(229 231 235)', // gray-200
      background: '#ffffff',
      hover: {
        shadow: 'lg',
        transform: 'translateY(-2px)',
      }
    },
    
    // Button variants
    button: {
      primary: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        shadow: 'md',
        hover: {
          background: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
          shadow: 'lg',
        }
      },
      
      secondary: {
        background: '#f8fafc',
        color: '#475569',
        border: '1px solid #e2e8f0',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '500',
        hover: {
          background: '#f1f5f9',
          color: '#334155',
        }
      },
      
      ghost: {
        background: 'transparent',
        color: '#64748b',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontWeight: '500',
        hover: {
          background: '#f8fafc',
          color: '#475569',
        }
      }
    },
    
    // Input styling
    input: {
      base: {
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid #d1d5db',
        background: '#ffffff',
        fontSize: '1rem',
        lineHeight: '1.5',
        focus: {
          outline: 'none',
          borderColor: '#0ea5e9',
          boxShadow: '0 0 0 3px rgb(14 165 233 / 0.1)',
        }
      }
    },
    
    // Avatar styling
    avatar: {
      sizes: {
        xs: '1.5rem',   // 24px
        sm: '2rem',     // 32px
        md: '2.5rem',   // 40px
        lg: '3rem',     // 48px
        xl: '4rem',     // 64px
      }
    }
  }
};

// CSS Custom Properties for dynamic theming
export const socialCSSVariables = {
  light: {
    '--social-bg-primary': socialTheme.colors.background.primary,
    '--social-bg-secondary': socialTheme.colors.background.secondary,
    '--social-bg-tertiary': socialTheme.colors.background.tertiary,
    '--social-text-primary': socialTheme.colors.neutral[900],
    '--social-text-secondary': socialTheme.colors.neutral[600],
    '--social-text-tertiary': socialTheme.colors.neutral[500],
    '--social-border-primary': socialTheme.colors.neutral[200],
    '--social-border-secondary': socialTheme.colors.neutral[100],
    '--social-accent-like': socialTheme.colors.accent.like,
    '--social-accent-comment': socialTheme.colors.accent.comment,
    '--social-accent-share': socialTheme.colors.accent.share,
  },
  
  dark: {
    '--social-bg-primary': socialTheme.colors.background.dark.primary,
    '--social-bg-secondary': socialTheme.colors.background.dark.secondary,
    '--social-bg-tertiary': socialTheme.colors.background.dark.tertiary,
    '--social-text-primary': socialTheme.colors.neutral[50],
    '--social-text-secondary': socialTheme.colors.neutral[300],
    '--social-text-tertiary': socialTheme.colors.neutral[400],
    '--social-border-primary': socialTheme.colors.neutral[700],
    '--social-border-secondary': socialTheme.colors.neutral[800],
    '--social-accent-like': socialTheme.colors.accent.like,
    '--social-accent-comment': socialTheme.colors.accent.comment,
    '--social-accent-share': socialTheme.colors.accent.share,
  }
};

// Utility functions for theme usage
export const getSocialColor = (path: string, opacity?: number) => {
  const keys = path.split('.');
  let value: unknown = socialTheme.colors;
  
  for (const key of keys) {
    value = (value as Record<string, unknown>)[key];
  }
  
  if (opacity && typeof value === 'string' && value.startsWith('#')) {
    // Convert hex to rgba
    const hex = value.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return value;
};

export const getSocialSpacing = (size: keyof typeof socialTheme.spacing) => {
  return socialTheme.spacing[size];
};

export const getSocialBreakpoint = (size: keyof typeof socialTheme.breakpoints) => {
  return socialTheme.breakpoints[size];
};

// Responsive utilities
export const mediaQueries = {
  sm: `@media (min-width: ${socialTheme.breakpoints.sm})`,
  md: `@media (min-width: ${socialTheme.breakpoints.md})`,
  lg: `@media (min-width: ${socialTheme.breakpoints.lg})`,
  xl: `@media (min-width: ${socialTheme.breakpoints.xl})`,
  '2xl': `@media (min-width: ${socialTheme.breakpoints['2xl']})`,
};

export default socialTheme;
