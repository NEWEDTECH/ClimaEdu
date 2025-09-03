import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import React from 'react'

export const getContentTypeLabel = (type: ContentType): string => {
  switch (type) {
    case ContentType.VIDEO:
      return 'Vídeo'
    case ContentType.PDF:
      return 'PDF'
    case ContentType.PODCAST:
      return 'Podcast'
    case ContentType.SCORM:
      return 'SCORM'
    case ContentType.AUDIO:
      return 'Áudio'
    default:
      return 'Conteúdo'
  }
}

export const getContentTypeIcon = (type: ContentType): React.ReactNode => {
  switch (type) {
    case ContentType.VIDEO:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    case ContentType.PDF:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case ContentType.PODCAST:
    case ContentType.AUDIO:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    case ContentType.SCORM:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l-4 4-4-4 4-4" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

export const getContentTypeColor = (type: ContentType): string => {
  switch (type) {
    case ContentType.VIDEO:
      return 'from-blue-500 to-indigo-600'
    case ContentType.PDF:
      return 'from-red-500 to-pink-600'
    case ContentType.PODCAST:
      return 'from-purple-500 to-violet-600'
    case ContentType.SCORM:
      return 'from-green-500 to-teal-600'
    default:
      return 'from-gray-500 to-slate-600'
  }
}
