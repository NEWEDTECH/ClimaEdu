# ClimaEdu - Learning Content Management Portal

A complete digital education platform that allows management of users, content, enrollments, assessments, forums, and certificates.

## Project Structure

The project follows Clean Architecture principles with a modular structure:

```
src/
  modules/
    user/
      core/
        entities/
        use-cases/
      infrastructure/
        repositories/
        implementations/
      index.ts
    content/
      (similar structure)
  shared/
    firebase/
    container/
  components/
  app/
```

## Technologies

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Architecture**: Clean Architecture, SOLID, Object Calisthenics
- **Dependency Injection**: InversifyJS

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### Firebase Emulators

This project uses Firebase emulators for local development. The emulators allow you to develop and test your application without connecting to the production Firebase services.

#### Starting the Emulators

To start the Firebase emulators:

```bash
npm run emulators
```

This will start the following emulators:
- Authentication: http://localhost:9099
- Firestore: http://localhost:8080
- Storage: http://localhost:9199
- Emulator UI: http://localhost:4000

#### Development with Emulators

To run the Next.js development server with the Firebase emulators:

```bash
npm run dev:emulators
```

This will start both the Firebase emulators and the Next.js development server concurrently.

#### Emulator UI

The Firebase Emulator UI provides a graphical interface to view and manage your emulated Firebase services. You can access it at http://localhost:4000 when the emulators are running.

### Development without Emulators

If you want to develop using the production Firebase services instead of the emulators:

```bash
npm run dev
```

## Project Structure

The project follows a modular architecture based on Clean Architecture principles:

- **Entities**: Core business objects
- **Use Cases**: Application-specific business rules
- **Repositories**: Interfaces for data access
- **Implementations**: Concrete implementations of repositories

## Contributing

1. Follow the established architecture and patterns
2. Maintain strict TypeScript typing
3. Follow Object Calisthenics principles
4. Write tests for new features

## License

This project is licensed under the MIT License.
