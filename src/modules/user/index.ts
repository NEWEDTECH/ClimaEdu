// This file serves as the public API for the User module

// Re-export entities
export * from './core/entities/User';

// Re-export use cases
export * from './core/use-cases/create-user/create-user.use-case';
export * from './core/use-cases/create-user/create-user.input';
export * from './core/use-cases/create-user/create-user.output';
// export * from './core/use-cases/authenticate-user/authenticate-user.use-case';

// Re-export repository interfaces
export * from './infrastructure/repositories/UserRepository';

// Re-export repository implementations
export * from './infrastructure/repositories/implementations/FirebaseUserRepository';
