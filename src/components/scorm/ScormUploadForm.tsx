'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../button';
import { InputText } from '../input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ScormUploadFormProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  institutionId: string; // Supondo que este ID esteja disponível
}

export function ScormUploadForm({
  courseId,
  moduleId,
  lessonId,
  institutionId,
}: ScormUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !name) {
      setError('Please select a file and provide a name.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('institutionId', institutionId);

    try {
      const response = await fetch('/api/scorm/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed.');
      }

      // O upload foi bem-sucedido, mas precisamos associar o contentId à lição.
      // Esta lógica precisará ser implementada.
      // Por enquanto, apenas redirecionamos de volta.
      router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);
      router.refresh(); // Para recarregar os dados na página de edição
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload SCORM Package (.zip)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name">Content Name</label>
            <InputText
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="file">SCORM File (.zip)</label>
            <InputText
              id="file"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              required
            />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
