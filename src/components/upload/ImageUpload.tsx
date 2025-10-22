'use client';

import { useState } from 'react';
import { Button } from '@/components/button';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { UploadImageUseCase } from '@/_core/modules/storage/core/use-cases/upload-image/upload-image.use-case';
import { ImageType } from '@/_core/modules/storage/core/use-cases/upload-image/upload-image.input';

interface ImageUploadProps {
  /**
   * Type of image being uploaded (podcast, course, trail, institution-logo)
   */
  imageType: ImageType;
  
  /**
   * Institution ID that owns this image
   */
  institutionId: string;
  
  /**
   * Callback when image is successfully uploaded
   * @param downloadUrl The URL of the uploaded image
   */
  onUploadSuccess: (downloadUrl: string) => void;
  
  /**
   * Current image URL (for editing existing items)
   */
  currentImageUrl?: string;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Label to display above the upload area
   */
  label?: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
}

export function ImageUpload({
  imageType,
  institutionId,
  onUploadSuccess,
  currentImageUrl,
  className = '',
  label = 'Imagem',
  required = false,
}: ImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>(currentImageUrl || '');
  const [useUpload, setUseUpload] = useState<boolean>(true);
  const [manualUrl, setManualUrl] = useState<string>(currentImageUrl || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo inválido. Use JPEG, PNG ou WEBP');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      alert('Selecione uma imagem primeiro');
      return;
    }

    setIsUploading(true);

    try {
      const uploadImageUseCase = container.get<UploadImageUseCase>(
        Register.storage.useCase.UploadImageUseCase
      );

      const result = await uploadImageUseCase.execute({
        file: imageFile,
        imageType,
        institutionId,
      });

      if (result.success && result.downloadUrl) {
        setUploadedUrl(result.downloadUrl);
        onUploadSuccess(result.downloadUrl);
        alert('Imagem enviada com sucesso!');
      } else {
        alert(result.message || 'Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadedUrl('');
    setManualUrl('');
    onUploadSuccess('');
  };

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);
    if (url) {
      setImagePreview(url);
      onUploadSuccess(url);
    } else {
      setImagePreview('');
      onUploadSuccess('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium">
          {label} {required && '*'}
        </label>
        
        {/* Toggle entre Upload e URL Manual */}
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setUseUpload(true);
              setManualUrl('');
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              useUpload
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            📤 Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setUseUpload(false);
              setImageFile(null);
              setUploadedUrl('');
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              !useUpload
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🔗 URL
          </button>
        </div>
      </div>
      
      {/* Preview da imagem */}
      {(imagePreview || uploadedUrl || manualUrl) && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 mb-3">
          <img 
            src={imagePreview || uploadedUrl} 
            alt="Preview da imagem" 
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            disabled={isUploading}
            className="cursor-pointer absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remover imagem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Modo Upload */}
      {useUpload ? (
        <>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading}
            />
            {imageFile && !uploadedUrl && (
              <Button
                type="button"
                onClick={handleUploadImage}
                disabled={isUploading}
                variant="primary"
                className="whitespace-nowrap cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Imagem'
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Formatos aceitos: JPEG, PNG, WEBP (máx. 5MB)
          </p>
        </>
      ) : (
        /* Modo URL Manual */
        <>
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => handleManualUrlChange(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
          <p className="text-xs text-gray-500">
            Cole a URL da imagem aqui
          </p>
        </>
      )}
    </div>
  );
}
