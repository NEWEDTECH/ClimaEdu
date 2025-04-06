# Tech Context

## Technology Stack

- **Frontend Framework**:  
  [Next.js 15](https://nextjs.org/) with App Router and React Server Components support.

- **Interface Library**:  
  [React 19](https://react.dev/).

- **Styling**:  
  [TailwindCSS](https://tailwindcss.com/) for utility-first and responsive CSS.

- **UI Components**:  
  [shadcn/ui](https://ui.shadcn.dev/) for rapid building of accessible, beautiful, and consistent components.

- **Authentication**:  
  [Firebase Authentication](https://firebase.google.com/products/auth) for login, registration, and access control.

- **Data Persistence**:  
  [Firebase Firestore](https://firebase.google.com/products/firestore) for scalable, real-time database.

- **File Storage**:  
  [Firebase Storage](https://firebase.google.com/products/storage) for uploading and downloading videos, PDFs, and podcasts.

- **Push Notifications**:  
  [Firebase Cloud Messaging (FCM)](https://firebase.google.com/products/cloud-messaging) for alerts and reminders to users.

- **Dependency Injection (DI)**:  
  [InversifyJS](https://inversify.io/) to manage dependencies in a decoupled way using the Container Pattern.

- **Language**:  
  [TypeScript](https://www.typescriptlang.org/) — using strict mode (`strict: true` in `tsconfig.json`).

---

## Important Configurations

- **Next.js App Router**:  
  The project uses the standard Next.js 15 App Router. All pages are in `src/app/`.

- **React Server Components**:  
  Used where appropriate to improve performance on pages that don't require immediate interactivity.

- **TailwindCSS**:  
  Customized via the `tailwind.config.ts` file.  
  Additional plugins like `@tailwindcss/forms` and `@tailwindcss/typography` can be used.

- **shadcn/ui**:  
  All components are generated and placed inside `src/components/ui/`.

- **Firebase SDK**:  
  Firebase access is done in a modularized way in `src/shared/firebase/firebase-client.ts`.

- **ESLint + Prettier**:  
  Configured to maintain clean and formatted code standards.

- **Composition via DI Container**:  
  All UseCases and Repositories are resolved in the Frontend by the `container` (Inversify) through Symbols.

- **Memory Bank and Cline**:  
  The platform is built with support for Cline, using Memory Bank and custom project rules.

---

## Conventions

- **Strict TypeScript Usage**:  
  No part of the code should ignore type errors (`any`, `@ts-ignore` should be avoided).

- **Modular Architecture**:  
  Each domain (user, content, enrollment, assessment, forum, certificate, report) has its own folder organization.

- **Clean Code**:  
  Rigorous application of Clean Architecture, SOLID, and Object Calisthenics.
