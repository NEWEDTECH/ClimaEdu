'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { UploadIcon, FileTextIcon, XIcon } from 'lucide-react';

interface CSVUploadProps {
  onFileUpload?: (file: File, data: any[]) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // em MB
}

export function CSVUpload({ 
  onFileUpload,
  acceptedFileTypes = '.csv',
  maxFileSize = 5 
}: CSVUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Validar tipo de arquivo
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor, selecione apenas arquivos CSV.');
      return;
    }

    // Validar tamanho do arquivo
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`O arquivo deve ter no máximo ${maxFileSize}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const processCSV = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        throw new Error('O arquivo CSV está vazio.');
      }

      // Detectar separador (vírgula ou ponto e vírgula)
      const separator = lines[0].includes(';') ? ';' : ',';
      
      // Processar cabeçalho
      const headers = lines[0].split(separator).map(header => header.trim().replace(/"/g, ''));
      
      // Processar dados
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(separator).map(value => value.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        
        return row;
      });

      if (onFileUpload) {
        onFileUpload(file, data);
      }

    } catch (err) {
      console.error('Erro ao processar CSV:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar o arquivo CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUploadClick = () => {
    // Remove existing file and clear any errors
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Open file selection dialog
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = () => {
    if (selectedFile) {
      processCSV(selectedFile);
    }
  };

  return (
    <Card className='h-[500px]'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="w-5 h-5" />
          Upload de Planilha CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Arraste e solte seu arquivo CSV aqui
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou clique no botão abaixo para selecionar
            </p>
            <Button onClick={handleUploadClick}>
              Selecionar Arquivo CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-4">
              Tamanho máximo: {maxFileSize}MB • Formato: CSV
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileTextIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-foreground dark:text-gray-500">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-700"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleProcessFile}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processando...' : 'Processar CSV'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Formato esperado:</strong></p>
          <p>• Primeira linha deve conter os cabeçalhos das colunas</p>
          <p>• Dados separados por vírgula ou ponto e vírgula</p>
          <p>• Colunas obrigatórias: <strong>nome, email</strong></p>
          <p>• Exemplo: nome,email</p>
          <p>• Todos os usuários serão cadastrados como <strong>estudantes</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}
