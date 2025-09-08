'use client'

import { InputText } from '@/components/input'
import { PodcastMediaType } from '@/_core/modules/podcast/core/entities/PodcastMediaType'

interface PodcastFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  mediaTypeFilter: string
  onMediaTypeChange: (value: string) => void
  tagFilter: string
  onTagChange: (value: string) => void
}

export function PodcastFilters({
  searchTerm,
  onSearchChange,
  mediaTypeFilter,
  onMediaTypeChange,
  tagFilter,
  onTagChange
}: PodcastFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <InputText
          id="search"
          type="text"
          placeholder="Pesquise por título ou descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex-1">
        <select
          value={mediaTypeFilter}
          onChange={(e) => onMediaTypeChange(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        >
          <option value="all" className='dark:text-black'>Todos os tipos</option>
          <option value={PodcastMediaType.AUDIO} className='dark:text-black'>🎧 Podcasts de Áudio</option>
          <option value={PodcastMediaType.VIDEO} className='dark:text-black'>📹 Vídeo Podcasts</option>
        </select>
      </div>
      
      <div className="flex-1">
        <InputText
          id="tagFilter"
          type="text"
          placeholder="Filtrar por tag..."
          value={tagFilter}
          onChange={(e) => onTagChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}
