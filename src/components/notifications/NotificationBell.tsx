'use client'

import { useState, useRef, useEffect } from 'react'
import { FiBell, FiX, FiCheck } from 'react-icons/fi'
import { useNotifications } from '@/hooks/useNotifications'
import { useProfile } from '@/context/zustand/useProfile'
import type { Notification } from '@/_core/modules/notification/core/entities/Notification'

export function NotificationBell() {
  const { infoUser } = useProfile()
  const { notifications, unreadCount, markAsRead, respond, responding } = useNotifications(infoUser.id)
  const isTutor = infoUser.currentRole === 'TUTOR'

  const [open, setOpen] = useState(false)
  const [respondingTo, setRespondingTo] = useState<Notification | null>(null)
  const [responseText, setResponseText] = useState('')

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    if (isTutor && notification.type === 'TUTORING_SCHEDULED') {
      setRespondingTo(notification)
      setResponseText('')
    }
  }

  const handleRespond = async () => {
    if (!respondingTo || !responseText.trim()) return
    try {
      await respond(respondingTo.id, infoUser.name, responseText.trim())
      setRespondingTo(null)
      setResponseText('')
      setOpen(false)
    } catch {
      // error handled in hook
    }
  }

  const handleCloseModal = () => {
    setRespondingTo(null)
    setResponseText('')
  }

  const formatTime = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date)
    const diff = Date.now() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}m atrás`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
        aria-label="Notificações"
      >
        <FiBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 bg-white dark:bg-gray-900 dark:border-gray-700 border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b dark:border-gray-700 border-gray-200 flex items-center justify-between">
            <span className="font-semibold text-sm dark:text-white text-gray-900">Notificações</span>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400">{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y dark:divide-gray-700 divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.read ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.type === 'TUTORING_RESPONDED' && notification.response && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          Resposta: {notification.response}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>

                  {isTutor && notification.type === 'TUTORING_SCHEDULED' && !notification.response && (
                    <span className="mt-1 inline-block text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Clique para responder →
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Responder Tutoria</h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiX className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Solicitação</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  {respondingTo.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">De: {respondingTo.senderName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seu comentário
                  <span className="text-gray-400 font-normal ml-1">(link do meet, zoom, whatsapp...)</span>
                </label>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Ex: https://meet.google.com/abc-xyz ou (11) 99999-9999"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end px-5 py-4 border-t dark:border-gray-700">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg text-sm cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRespond}
                disabled={!responseText.trim() || responding}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiCheck className="w-4 h-4" />
                {responding ? 'Enviando...' : 'Enviar resposta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
