# Active Context

## Current Situation

The project is in development with the base structure implemented.

Completed activities:
- Definition of the general system architecture based on Clean Architecture and SOLID.
- Definition of the Container Pattern for dependency injection with InversifyJS.
- Definition of the technology stack (Next.js 15, React 19, TailwindCSS, shadcn/ui, Firebase, TypeScript).
- Creation of the Memory Bank for the Cline assistant.
- Definition of the modular structure for the main domains: user, content, enrollment, assessment, forum, certificate, and report.
- Initial configuration of the development environment (Next.js 15 + TailwindCSS + Firebase SDK).
- Configuration of the Dependency Injection Container (Inversify) in the frontend.
- Implementation of the first modules:
  - `user`: entities, repositories, and creation use case.
  - `content`: entities, repositories, and creation use case.
- Implementation of repository interfaces and their Firebase implementations.
- Creation of an initial page demonstrating the system architecture.

---

## Ongoing Activities

- Implementation of additional use cases:
  - User authentication (`AuthenticateUserUseCase`).
  - Content listing (`ListContentsUseCase`).
- Development of UI components with shadcn/ui.
- Implementation of pages for user registration and login.
- Implementation of pages for content upload and viewing.

---

## Priorities

1. Implement complete authentication with Firebase Authentication.
2. Develop interface for content upload with Firebase Storage.
3. Create pages for viewing content by category.
4. Implement enrollment system to associate students with content.
5. Develop dashboard for administrators.

---

## Current Restrictions

- Only standard user authentication via Firebase (Google, Email/Password).
- Initially without support for custom domains or whitelabel until the second phase of the schedule.
- Need to configure Firebase environment variables before using the system.

---

## Important Notes

- The project is guided by Memory Bank and custom `.clinerules`.
- All new or refactored code must strictly follow the architecture conventions and patterns defined in the Memory Bank.
- To test the system, it is necessary to configure the environment variables in the `.env.local` file with Firebase credentials.
