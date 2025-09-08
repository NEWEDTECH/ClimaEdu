'use client'

import Link from 'next/link'
import { Button } from '@/components/button'
import type { Podcast } from '@/_core/modules/podcast/core/entities/Podcast'

interface PodcastTableProps {
  podcasts: Podcast[]
  loading: boolean
  onDelete: (podcastId: string, title: string) => void
}

const TABLE_COLUMNS = [
  'Título',
  'Tipo',
  'Descrição',
  'Tags',
  'Criado em',
  'Status',
  'Ações'
]

export function PodcastTable({ podcasts, loading, onDelete }: PodcastTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando podcasts...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {TABLE_COLUMNS.map(column => (
              <th className="text-left py-3 px-4" key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {podcasts.map((podcast) => (
            <tr key={podcast.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {podcast.mediaType === 'AUDIO' ? '🎧' : '📹'}
                  </span>
                  <span className="font-medium">{podcast.title}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  podcast.mediaType === 'AUDIO' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {podcast.mediaType === 'AUDIO' ? 'Áudio' : 'Vídeo'}
                </span>
              </td>
              <td className="py-3 px-4 max-w-xs">
                <div className="truncate" title={podcast.description}>
                  {podcast.description}
                </div>
              </td>
              <td className="py-3 px-4">
                {podcast.tags && podcast.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {podcast.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {podcast.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{podcast.tags.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Sem tags</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {new Date(podcast.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Ativo
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex gap-2">
                  <Link href={`/admin/podcast/${podcast.id}/edit`}>
                    <Button className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
                      ✏️ Editar
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => onDelete(podcast.id, podcast.title)}
                    className="bg-red-600 hover:bg-red-700 text-white h-8 rounded-md gap-1.5 px-3"
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {podcasts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum podcast encontrado
        </div>
      )}
    </div>
  )
}
