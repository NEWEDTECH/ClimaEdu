'use client'

import { InputText } from '@/components/input'
import { SelectComponent } from '@/components/select'
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
        <SelectComponent
          value={mediaTypeFilter}
          onChange={(value) => onMediaTypeChange(value)}
          options={[
            { value: "all", label: "Todos os tipos" },
            { value: PodcastMediaType.AUDIO, label: "🎧 Podcasts de Áudio" },
            { value: PodcastMediaType.VIDEO, label: "📹 Vídeo Podcasts" }
          ]}
          placeholder="Selecione o tipo de mídia"
          className="w-full"
        />
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
