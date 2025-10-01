// Shared symbols for dependency injection
export const services = {
  EventBus: Symbol.for('EventBus'),
};

// Export all symbols for this module
export const SharedSymbols = {
  services,
};