import 'reflect-metadata';
import { Container } from 'inversify';

// Create and export the DI container
const container = new Container({
  defaultScope: 'Singleton',
});

export { container };
