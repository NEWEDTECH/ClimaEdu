'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../button';
import { InputText } from '../input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScormContent } from '@/_core/modules/content/core/entities';

interface ScormUploadFormProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  institutionId: string;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  const [existingScorms, setExistingScorms] = useState<ScormContent[]>([]);
  const [selectedScorm, setSelectedScorm] = useState('');
  const [mode, setMode] = useState<'upload' | 'select'>('upload');
  const router = useRouter();

  useEffect(() => {
    const fetchExistingScorms = async () => {
      try {
        const response = await fetch(`/api/scorm/list/${institutionId}`);
        if (response.ok) {
          const data = await response.json();
          setExistingScorms(data);
        }
      } catch (err) {
        console.error('Failed to fetch existing SCORMs', err);
      }
    };
    fetchExistingScorms();
  }, [institutionId]);

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed.');
      }

      // Agora, associamos o novo SCORM à lição
      await associateScorm(data.id, name);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedScorm) {
      setError('Please select a SCORM package.');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const selectedScormData = existingScorms.find(s => s.id === selectedScorm);
      if (!selectedScormData) throw new Error("Selected SCORM not found.");
      await associateScorm(selectedScormData.id, selectedScormData.name);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const associateScorm = async (scormContentId: string, scormName: string) => {
    const response = await fetch('/api/lessons/add-scorm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId,
        scormContentId,
        name: scormName,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to associate SCORM with lesson.');
    }

    router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add SCORM Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4 border-b">
          <button onClick={() => setMode('upload')}>Upload New</button>
          <button onClick={() => setMode('select')}>Select Existing</button>
        </div>

        {mode === 'upload' ? (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label htmlFor="name">Content Name</label>
              <InputText id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="file">SCORM File (.zip)</label>
              <InputText id="file" type="file" accept=".zip" onChange={handleFileChange} required />
            </div>
            <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
          </form>
        ) : (
          <form onSubmit={handleSelectSubmit} className="space-y-4">
            <div>
              <label htmlFor="scorm-select">Existing SCORM Packages</label>
              <select id="scorm-select" value={selectedScorm} onChange={(e) => setSelectedScorm(e.target.value)}>
                <option value="">-- Select a package --</option>
                {existingScorms.map((scorm) => (
                  <option key={scorm.id} value={scorm.id}>{scorm.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={uploading}>{uploading ? 'Associating...' : 'Associate'}</Button>
          </form>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  );
}
