'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '@/_core/shared/firebase/firebase-client';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs/tabs';
import { Badge } from '@/components/ui/badge';
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
  const [name, setName] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [existingScorms, setExistingScorms] = useState<ScormContent[]>([]);
  const [selectedScorm, setSelectedScorm] = useState<string>('');
  const [mode, setMode] = useState<'upload' | 'select'>('upload');
  const [loadingScorms, setLoadingScorms] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExistingScorms = async () => {
      setLoadingScorms(true);
      try {
        const response = await fetch(`/api/scorm/list/${institutionId}`);
        if (response.ok) {
          const data = await response.json();
          setExistingScorms(data);
        }
      } catch (err) {
        console.error('Failed to fetch existing SCORMs', err);
      } finally {
        setLoadingScorms(false);
      }
    };
    fetchExistingScorms();
  }, [institutionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      // Auto-preencher nome se estiver vazio
      if (!name) {
        setName(selectedFile.name.replace('.zip', ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !name.trim()) {
      setError('Por favor, selecione um arquivo e forneça um nome.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Upload direto para Firebase Storage
      const storage = getStorage(app);
      const timestamp = Date.now();
      const fileName = `scorm/${institutionId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Criar upload task com monitoramento de progresso
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Aguardar conclusão do upload
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Calcular progresso
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          () => {
            // Upload completo
            resolve();
          }
        );
      }).then(async () => {
        // Processar SCORM via API que usa o caso de uso
        const fileUrl = `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${fileName}`;
        const payload = {
          name: name.trim(),
          institutionId,
          fileUrl,
          storagePath: fileName,
        };

        console.log('📤 [ScormUploadForm] Sending payload to /api/scorm/register:', payload);

        const response = await fetch('/api/scorm/upload-and-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao processar SCORM.');
        }

        await associateScorm(data.id, name.trim());
      });
    } catch (err) {
      console.error('Error uploading SCORM:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha no upload. Por favor, tente novamente.');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedScorm) {
      setError('Por favor, selecione um pacote SCORM.');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const selectedScormData = existingScorms.find(s => s.id === selectedScorm);
      if (!selectedScormData) throw new Error('SCORM selecionado não encontrado.');
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
      throw new Error(data.error || 'Falha ao associar SCORM à lição.');
    }

    router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);
    router.refresh();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Seção de Cabeçalho */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16.5 9.4 7.55 4.24"/>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.29 7 12 12 20.71 7"/>
              <line x1="12" x2="12" y1="22" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Adicionar Conteúdo SCORM</h1>
            <p className="text-muted-foreground">
              Faça upload de um novo pacote SCORM ou selecione um conteúdo existente
            </p>
          </div>
        </div>
      </div>

      {/* Card Principal */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Gerenciamento de Pacotes SCORM</CardTitle>
          <CardDescription>
            Pacotes SCORM (Sharable Content Object Reference Model) permitem adicionar conteúdo de aprendizagem interativo às suas aulas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'upload' | 'select')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                Fazer Upload
              </TabsTrigger>
              <TabsTrigger value="select" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Selecionar Existente
              </TabsTrigger>
            </TabsList>

            {/* Aba de Upload */}
            <TabsContent value="upload" className="space-y-6">
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Input de Nome do Conteúdo */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" x2="8" y1="13" y2="13"/>
                      <line x1="16" x2="8" y1="17" y2="17"/>
                      <line x1="10" x2="8" y1="9" y2="9"/>
                    </svg>
                    Nome do Conteúdo
                  </label>
                  <InputText
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Introdução à Programação"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Um nome descritivo para o seu conteúdo SCORM
                  </p>
                </div>

                {/* Seção de Upload de Arquivo */}
                <div className="space-y-2">
                  <label htmlFor="file" className="text-sm font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                    Pacote SCORM (.zip)
                  </label>
                  
                  <div className="relative">
                    <label
                      htmlFor="file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted-foreground">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" x2="12" y1="3" y2="15"/>
                        </svg>
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-muted-foreground">Arquivo ZIP (SCORM 1.2 ou 2004)</p>
                      </div>
                      <input
                        id="file"
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                      />
                    </label>
                  </div>

                  {file && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Pronto
                      </Badge>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Apenas arquivos .zip contendo conteúdo compatível com SCORM são aceitos
                  </p>
                </div>

                {/* Barra de Progresso */}
                {uploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso do upload</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Botão de Envio */}
                <div className="flex items-center gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={uploading || !file || !name.trim()}
                    className="flex-1 sm:flex-initial"
                  >
                    {uploading ? (
                      <>
                        {uploadProgress > 0 && uploadProgress < 100 ? `Enviando... ${uploadProgress}%` : 'Processando...'}
                      </>
                    ) : (
                      <>
                        Enviar e Associar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    disabled={uploading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Aba de Seleção Existente */}
            <TabsContent value="select" className="space-y-6">
              {loadingScorms ? (
                <div className="flex items-center justify-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-muted-foreground">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
              ) : existingScorms.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="M16.5 9.4 7.55 4.24"/>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.29 7 12 12 20.71 7"/>
                        <line x1="12" x2="12" y1="22" y2="12"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Nenhum pacote SCORM disponível</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Faça upload do seu primeiro pacote SCORM usando a aba &quot;Fazer Upload&quot;
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSelectSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="scorm-select" className="text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16.5 9.4 7.55 4.24"/>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.29 7 12 12 20.71 7"/>
                        <line x1="12" x2="12" y1="22" y2="12"/>
                      </svg>
                      Pacotes SCORM Disponíveis
                    </label>
                    
                    <select
                      id="scorm-select"
                      value={selectedScorm}
                      onChange={(e) => setSelectedScorm(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">-- Selecione um pacote SCORM --</option>
                      {existingScorms.map((scorm) => (
                        <option key={scorm.id} value={scorm.id}>
                          {scorm.name}
                        </option>
                      ))}
                    </select>

                    {selectedScorm && (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border mt-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M16.5 9.4 7.55 4.24"/>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.29 7 12 12 20.71 7"/>
                            <line x1="12" x2="12" y1="22" y2="12"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {existingScorms.find(s => s.id === selectedScorm)?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Este pacote será associado à aula atual
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {existingScorms.length} {existingScorms.length === 1 ? 'pacote' : 'pacotes'} disponível{existingScorms.length === 1 ? '' : 'is'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={uploading || !selectedScorm}
                      className="flex-1 sm:flex-initial"
                    >
                      {uploading ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 animate-spin">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Associando...
                        </>
                      ) : (
                        <>
                          Associar
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      disabled={uploading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Exibição de Erro */}
          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" x2="12" y1="8" y2="12"/>
                <line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">Erro</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Informações */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Sobre Conteúdo SCORM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Pacotes SCORM são conteúdos de e-learning padronizados que podem rastrear o progresso e interações dos alunos.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Versões suportadas: SCORM 1.2 e SCORM 2004</li>
            <li>Os arquivos devem estar no formato .zip</li>
            <li>O conteúdo é reutilizável em múltiplas aulas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
