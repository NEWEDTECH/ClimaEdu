// Storage module symbols
export const services = {
  StorageService: Symbol.for('StorageService'),
};

export const useCases = {
  UploadImageUseCase: Symbol.for('UploadImageUseCase'),
};

// Export all symbols for this module
export const StorageSymbols = {
  services,
  useCases,
};
