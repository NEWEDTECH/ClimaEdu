# Exemplos de Uso - Módulo Podcast

**Data de Criação**: 27/01/2025  
**Versão**: 1.0

## 📋 Visão Geral

Este documento apresenta exemplos práticos de como usar o módulo podcast no projeto ClimaEdu, incluindo casos de uso comuns, integração com o frontend e padrões de implementação.

## 🎯 Casos de Uso Básicos

### 1. Criando um Podcast

```typescript
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CreatePodcastUseCase, PodcastMediaType } from '@/_core/modules/podcast';

// Resolver o caso de uso via DI
const createPodcastUseCase = container.get<CreatePodcastUseCase>(
  Register.podcast.useCase.CreatePodcastUseCase
);

// Executar criação
const result = await createPodcastUseCase.execute({
  institutionId: 'ins_abc123',
  title: 'Introdução às Mudanças Climáticas',
  description: 'Um podcast educativo sobre os fundamentos das mudanças climáticas e seus impactos no meio ambiente.',
  tags: ['clima', 'educação', 'meio-ambiente'],
  coverImageUrl: 'https://storage.googleapis.com/bucket/cover.jpg',
  mediaUrl: 'https://storage.googleapis.com/bucket/audio.mp3',
  mediaType: PodcastMediaType.AUDIO
});

console.log('Podcast criado:', result.podcast);
```

### 2. Listando Podcasts

```typescript
import { ListPodcastsUseCase } from '@/_core/modules/podcast';

const listPodcastsUseCase = container.get<ListPodcastsUseCase>(
  Register.podcast.useCase.ListPodcastsUseCase
);

// Listar com paginação
const result = await listPodcastsUseCase.execute({
  institutionId: 'ins_abc123',
  page: 1,
  limit: 10,
  tags: ['clima'] // Filtro opcional por tags
});

console.log('Podcasts encontrados:', result.podcasts);
console.log('Total:', result.total);
console.log('Tem mais páginas:', result.hasMore);
```

### 3. Atualizando um Podcast

```typescript
import { UpdatePodcastUseCase } from '@/_core/modules/podcast';

const updatePodcastUseCase = container.get<UpdatePodcastUseCase>(
  Register.podcast.useCase.UpdatePodcastUseCase
);

const result = await updatePodcastUseCase.execute({
  podcastId: 'pod_xyz789',
  title: 'Mudanças Climáticas - Versão Atualizada',
  description: 'Versão atualizada com as últimas descobertas científicas.',
  tags: ['clima', 'educação', 'ciência', 'atualizado']
});

console.log('Podcast atualizado:', result.podcast);
```

## 📊 Sistema de Monitoramento

### 1. Registrando uma Visualização

```typescript
import { AddViewToPodcastUseCase } from '@/_core/modules/podcast';

const addViewUseCase = container.get<AddViewToPodcastUseCase>(
  Register.podcast.useCase.AddViewToPodcastUseCase
);

const result = await addViewUseCase.execute({
  podcastId: 'pod_xyz789',
  userId: 'usr_abc123'
});

if (result.isNewView) {
  console.log('Nova visualização registrada:', result.view);
} else {
  console.log('Visualização já existente (throttling ativo):', result.view);
}
```

### 2. Toggle de Like

```typescript
import { ToggleLikePodcastUseCase } from '@/_core/modules/podcast';

const toggleLikeUseCase = container.get<ToggleLikePodcastUseCase>(
  Register.podcast.useCase.ToggleLikePodcastUseCase
);

const result = await toggleLikeUseCase.execute({
  podcastId: 'pod_xyz789',
  userId: 'usr_abc123'
});

if (result.action === 'liked') {
  console.log('Podcast curtido:', result.like);
} else {
  console.log('Like removido');
}

console.log('Status atual:', result.isLiked);
```

### 3. Obtendo Analytics

```typescript
import { GetPodcastAnalyticsUseCase } from '@/_core/modules/podcast';

const analyticsUseCase = container.get<GetPodcastAnalyticsUseCase>(
  Register.podcast.useCase.GetPodcastAnalyticsUseCase
);

const analytics = await analyticsUseCase.execute({
  podcastId: 'pod_xyz789',
  timeRange: 'month'
});

console.log('Analytics do podcast:');
console.log('- Total de views:', analytics.totalViews);
console.log('- Viewers únicos:', analytics.uniqueViewers);
console.log('- Total de likes:', analytics.totalLikes);
console.log('- Taxa de engajamento:', analytics.engagementRate + '%');
console.log('- Views ao longo do tempo:', analytics.viewsOverTime);
console.log('- Likes ao longo do tempo:', analytics.likesOverTime);
```

## 🎨 Integração com React

### 1. Hook Personalizado para Podcasts

```typescript
// hooks/usePodcasts.ts
import { useState, useEffect } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ListPodcastsUseCase, Podcast } from '@/_core/modules/podcast';

interface UsePodcastsOptions {
  institutionId: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export function usePodcasts(options: UsePodcastsOptions) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const listPodcastsUseCase = container.get<ListPodcastsUseCase>(
    Register.podcast.useCase.ListPodcastsUseCase
  );

  useEffect(() => {
    async function loadPodcasts() {
      try {
        setLoading(true);
        setError(null);

        const result = await listPodcastsUseCase.execute({
          institutionId: options.institutionId,
          page: options.page || 1,
          limit: options.limit || 10,
          tags: options.tags
        });

        setPodcasts(result.podcasts);
        setHasMore(result.hasMore);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar podcasts');
      } finally {
        setLoading(false);
      }
    }

    loadPodcasts();
  }, [options.institutionId, options.page, options.limit, options.tags?.join(',')]);

  return {
    podcasts,
    loading,
    error,
    hasMore,
    total,
    refetch: () => loadPodcasts()
  };
}
```

### 2. Hook para Analytics

```typescript
// hooks/usePodcastAnalytics.ts
import { useState, useEffect } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { 
  GetPodcastAnalyticsUseCase, 
  GetPodcastAnalyticsOutput,
  AnalyticsTimeRange 
} from '@/_core/modules/podcast';

export function usePodcastAnalytics(podcastId: string, timeRange: AnalyticsTimeRange = 'month') {
  const [analytics, setAnalytics] = useState<GetPodcastAnalyticsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsUseCase = container.get<GetPodcastAnalyticsUseCase>(
    Register.podcast.useCase.GetPodcastAnalyticsUseCase
  );

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const result = await analyticsUseCase.execute({
          podcastId,
          timeRange
        });

        setAnalytics(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
      } finally {
        setLoading(false);
      }
    }

    if (podcastId) {
      loadAnalytics();
    }
  }, [podcastId, timeRange]);

  return { analytics, loading, error };
}
```

### 3. Componente de Lista de Podcasts

```typescript
// components/PodcastList.tsx
import React from 'react';
import { usePodcasts } from '../hooks/usePodcasts';
import { PodcastCard } from './PodcastCard';

interface PodcastListProps {
  institutionId: string;
  tags?: string[];
}

export function PodcastList({ institutionId, tags }: PodcastListProps) {
  const { podcasts, loading, error, hasMore, total } = usePodcasts({
    institutionId,
    tags,
    limit: 12
  });

  if (loading) {
    return <div className="text-center py-8">Carregando podcasts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro: {error}
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum podcast encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Podcasts</h2>
        <span className="text-sm text-gray-500">
          {total} podcast{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 4. Componente de Card do Podcast

```typescript
// components/PodcastCard.tsx
import React from 'react';
import { Podcast, PodcastMediaType } from '@/_core/modules/podcast';
import { usePodcastInteractions } from '../hooks/usePodcastInteractions';

interface PodcastCardProps {
  podcast: Podcast;
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  const { addView, toggleLike, isLiked, isLoading } = usePodcastInteractions(podcast.id);

  const handlePlay = async () => {
    await addView();
    // Lógica para reproduzir o podcast
  };

  const handleLike = async () => {
    await toggleLike();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={podcast.coverImageUrl}
          alt={podcast.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs rounded ${
            podcast.mediaType === PodcastMediaType.AUDIO 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {podcast.mediaType === PodcastMediaType.AUDIO ? 'Áudio' : 'Vídeo'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {podcast.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {podcast.description}
        </p>

        {podcast.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {podcast.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {podcast.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{podcast.tags.length - 3} mais
              </span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            onClick={handlePlay}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Reproduzir</span>
          </Button>

          <Button
            onClick={handleLike}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isLiked 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-gray-400 hover:text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Utilitários e Helpers

### 1. Formatador de Duração

```typescript
// utils/formatDuration.ts
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
```

### 2. Validador de URLs de Mídia

```typescript
// utils/mediaValidation.ts
export function isValidMediaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function getMediaType(url: string): 'audio' | 'video' | 'unknown' {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  
  const lowerUrl = url.toLowerCase();
  
  if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'audio';
  }
  
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'video';
  }
  
  return 'unknown';
}
```

### 3. Formatador de Analytics

```typescript
// utils/analyticsFormatter.ts
import { GetPodcastAnalyticsOutput } from '@/_core/modules/podcast';

export function formatAnalytics(analytics: GetPodcastAnalyticsOutput) {
  return {
    totalViews: analytics.totalViews.toLocaleString(),
    uniqueViewers: analytics.uniqueViewers.toLocaleString(),
    totalLikes: analytics.totalLikes.toLocaleString(),
    engagementRate: `${analytics.engagementRate.toFixed(1)}%`,
    viewsGrowth: calculateGrowth(analytics.viewsOverTime),
    likesGrowth: calculateGrowth(analytics.likesOverTime)
  };
}

function calculateGrowth(data: Array<{ date: string; count: number }>): string {
  if (data.length < 2) return '0%';
  
  const current = data[data.length - 1].count;
  const previous = data[data.length - 2].count;
  
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  
  const growth = ((current - previous) / previous) * 100;
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}
```

## 🎵 Player de Podcast

### 1. Componente de Player

```typescript
// components/PodcastPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Podcast, PodcastMediaType } from '@/_core/modules/podcast';
import { formatDuration } from '../utils/formatDuration';

interface PodcastPlayerProps {
  podcast: Podcast;
  onViewAdded?: () => void;
}

export function PodcastPlayer({ podcast, onViewAdded }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleDurationChange = () => setDuration(media.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      onViewAdded?.();
    };
    const handlePause = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('durationchange', handleDurationChange);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('durationchange', handleDurationChange);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
    };
  }, [onViewAdded]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    media.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    
    const media = mediaRef.current;
    if (media) {
      media.volume = newVolume;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={podcast.coverImageUrl}
          alt={podcast.title}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{podcast.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{podcast.description}</p>
        </div>
      </div>

      {/* Media Element */}
      {podcast.mediaType === PodcastMediaType.AUDIO ? (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={podcast.mediaUrl}
          preload="metadata"
        />
      ) : (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={podcast.mediaUrl}
          className="w-full rounded-lg mb-4"
          preload="metadata"
        />
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => {
              const media = mediaRef.current;
              if (media) media.currentTime = Math.max(0, currentTime - 10);
            }}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
          </Button>

          <Button
            onClick={togglePlay}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </Button>

          <Button
            onClick={() => {
              const media = mediaRef.current;
              if (media) media.currentTime = Math.min(duration, currentTime + 10);
            }}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM16 8a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
```

## 📊 Dashboard de Analytics

### 1. Componente de Dashboard

```typescript
// components/PodcastAnalyticsDashboard.tsx
import React from 'react';
import { usePodcastAnalytics } from '../hooks/usePodcastAnalytics';
import { formatAnalytics } from '../utils/analyticsFormatter';

interface PodcastAnalyticsDashboardProps {
  podcastId: string;
}

export function PodcastAnalyticsDashboard({ podcastId }: PodcastAnalyticsDashboardProps) {
  const { analytics, loading, error } = usePodcastAnalytics(podcastId, 'month');

  if (loading) {
    return <div className="text-center py-8">Carregando analytics...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erro: {error}</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">Nenhum dado disponível</div>;
  }

  const formatted = formatAnalytics(analytics);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics do Podcast</h2>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total de Views</h3>
          <p className="text-2xl font-bold text-blue-600">{formatted.totalViews}</p>
          <p className="text-sm text-green-600">{formatted.viewsGrowth}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Viewers Únicos</h3>
          <p className="text-2xl font-bold text-green-600">{formatted.uniqueViewers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total de Likes</h3>
          <p className="text-2xl font-bold text-red-600">{formatted.totalLikes}</p>
          <p className="text-sm text-green-600">{formatted.likesGrowth}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Taxa de Engajamento</h3>
          <p className="text-2xl font-bold text-purple-600">{formatted.engagementRate}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Views ao Longo do Tempo</h3>
          {/* Aqui você pode integrar uma biblioteca de gráficos como Chart.js ou Recharts */}
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Gráfico de Views</p>
