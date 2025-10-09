'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { UploadIcon, FileTextIcon, XIcon } from 'lucide-react';
import { SelectComponent } from '@/components/select/select';

interface CSVUploadProps {
  onFileUpload?: (file: File, data: Record<string, string>[], enrollmentType: 'course' | 'trail', enrollmentId: string) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // em MB
  courses?: Array<{ id: string; title: string }>;
  trails?: Array<{ id: string; name: string }>;
}

export function CSVUpload({ 
  onFileUpload,
  acceptedFileTypes = '.csv',
  maxFileSize = 5,
  courses = [],
  trails = []
}: CSVUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentType, setEnrollmentType] = useState<'course' | 'trail'>('course');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
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
      // Validate enrollment selection
      if (!selectedEnrollmentId) {
        throw new Error(`Por favor, selecione ${enrollmentType === 'course' ? 'um curso' : 'uma trilha'} antes de processar o CSV.`);
      }

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
      const data = lines.slice(1).map((line) => {
        const values = line.split(separator).map(value => value.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        
        return row;
      });

      if (onFileUpload) {
        onFileUpload(file, data, enrollmentType, selectedEnrollmentId);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="w-5 h-5" />
          Upload de Planilha CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-base font-medium mb-1">
              Arraste e solte seu arquivo CSV aqui
            </p>
            <p className="text-xs text-gray-500 mb-3">
              ou clique no botão abaixo para selecionar
            </p>
            <div className="flex justify-center">
              <Button onClick={handleUploadClick} className='flex items-center text-sm'>
                Selecionar Arquivo CSV
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-3">
              Tamanho máximo: {maxFileSize}MB • Formato: CSV
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileTextIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-gray-500">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processando...' : 'Processar CSV'}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3 pt-3 border-t">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Tipo de Matrícula
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="enrollmentType"
                  value="course"
                  checked={enrollmentType === 'course'}
                  onChange={(e) => {
                    setEnrollmentType('course');
                    setSelectedEnrollmentId('');
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Curso</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="enrollmentType"
                  value="trail"
                  checked={enrollmentType === 'trail'}
                  onChange={(e) => {
                    setEnrollmentType('trail');
                    setSelectedEnrollmentId('');
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Trilha</span>
              </label>
            </div>
          </div>

          {enrollmentType === 'course' ? (
            <div className="space-y-1.5">
              <label htmlFor="courseSelect" className="block text-sm font-medium">
                Selecionar Curso
              </label>
              <SelectComponent
                value={selectedEnrollmentId}
                onChange={setSelectedEnrollmentId}
                options={courses.map(course => ({
                  value: course.id,
                  label: course.title
                }))}
                placeholder="Selecione um curso"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label htmlFor="trailSelect" className="block text-sm font-medium">
                Selecionar Trilha
              </label>
              <SelectComponent
                value={selectedEnrollmentId}
                onChange={setSelectedEnrollmentId}
                options={trails.map(trail => ({
                  value: trail.id,
                  label: trail.name
                }))}
                placeholder="Selecione uma trilha"
              />
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p className="font-medium">Instruções:</p>
          <p>• Primeira linha: cabeçalhos (nome, email)</p>
          <p>• Separador: vírgula ou ponto e vírgula</p>
          <p>• Todos cadastrados como <strong>estudantes</strong></p>
          {enrollmentType === 'course' && selectedEnrollmentId && (
            <p className="text-blue-600">• Matriculados no curso selecionado</p>
          )}
          {enrollmentType === 'trail' && selectedEnrollmentId && (
            <p className="text-blue-600">• Matriculados em todos os cursos da trilha</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
