'use client'

import { InputText } from '@/components/input'

interface TrailFormProps {
  title: string
  description: string
  coverImageUrl: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCoverImageUrlChange: (value: string) => void
}

export function TrailForm({
  title,
  description,
  coverImageUrl,
  onTitleChange,
  onDescriptionChange,
  onCoverImageUrlChange
}: TrailFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Título *
        </label>
        <InputText
          id="title"
          type="text"
          placeholder="Digite o título da trilha..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Descrição *
        </label>
        <textarea
          id="description"
          placeholder="Digite a descrição da trilha..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[100px]"
          required
        />
      </div>

      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium mb-2">
          URL da Imagem de Capa
        </label>
        <InputText
          id="coverImageUrl"
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={coverImageUrl}
          onChange={(e) => onCoverImageUrlChange(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Opcional. Insira a URL de uma imagem para usar como capa da trilha.
        </p>
      </div>
    </div>
  )
}
