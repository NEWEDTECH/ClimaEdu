'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { PodcastViewer } from '@/components/podcast'

interface PodcastPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PodcastPage({ params }: PodcastPageProps) {
  const resolvedParams = use(params)

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header com navegação */}
          <div className="flex justify-between items-center px-6 pt-6">
            <h1 className="text-3xl font-bold">🎧 Podcast</h1>
            <Link href="/">
              <Button className="bg-black text-white dark:bg-white dark:text-black border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 rounded-md gap-1.5 px-3">
                Voltar ao Início
              </Button>
            </Link>
          </div>

          {/* Componente de visualização do podcast */}
          <PodcastViewer podcastId={resolvedParams.id} />
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
