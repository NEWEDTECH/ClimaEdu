# Active Context

## Directory Structure Change

The project structure has been updated. The `modules` and `shared` directories have been moved from `/src` to `/src/_core`. This means all import paths need to be updated to reflect this change.

## Import Path Updates

All imports from the core modules and shared code should use the following paths:

- Core modules: `@/_core/modules/...`
- Shared code: `@/_core/shared/...`

For example:
```typescript
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { SignInWithEmailLinkUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-email-link/sign-in-with-email-link.use-case';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
```

## Current Issues

## Authentication System

The authentication system has been implemented with the following features:

1. **Email Link Authentication**:
   - Users can sign in with a magic link sent to their email
   - In development mode, the links are displayed on the login page
   - The authentication process happens on a dedicated page at `/auth/confirm`

2. **Firebase Emulator Support**:
   - Special handling for the Firebase emulator's limitations
   - Fake user IDs are generated for authentication in development mode
   - Authentication state is persisted in localStorage

3. **Singleton Pattern for AuthService**:
   - Ensures only one instance of the service exists throughout the application
   - Maintains authentication state across different components
   - Provides methods for checking authentication status and user ID
