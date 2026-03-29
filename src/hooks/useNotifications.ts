'use client'

import { useState, useEffect } from 'react'
import { container, Register } from '@/_core/shared/container'
import type { NotificationRepository } from '@/_core/modules/notification/infrastructure/repositories/NotificationRepository'
import type { Notification } from '@/_core/modules/notification/core/entities/Notification'
import { MarkNotificationReadUseCase, MarkNotificationReadInput } from '@/_core/modules/notification/core/use-cases/mark-notification-read'
import { RespondToNotificationUseCase, RespondToNotificationInput } from '@/_core/modules/notification/core/use-cases/respond-to-notification'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    if (!userId) return

    const repo = container.get<NotificationRepository>(
      Register.notification.repository.NotificationRepository
    )

    const unsubscribe = repo.subscribeByRecipient(userId, (updated) => {
      setNotifications(updated)
    })

    return unsubscribe
  }, [userId])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (notificationId: string) => {
    try {
      const useCase = container.get<MarkNotificationReadUseCase>(
        Register.notification.useCase.MarkNotificationReadUseCase
      )
      await useCase.execute(new MarkNotificationReadInput(notificationId))
      // onSnapshot will automatically reflect the change
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const respond = async (notificationId: string, responderName: string, responseText: string) => {
    try {
      setResponding(true)
      const useCase = container.get<RespondToNotificationUseCase>(
        Register.notification.useCase.RespondToNotificationUseCase
      )
      await useCase.execute(
        new RespondToNotificationInput(notificationId, responderName, responseText)
      )
    } catch (err) {
      console.error('Error responding to notification:', err)
      throw err
    } finally {
      setResponding(false)
    }
  }

  return { notifications, unreadCount, markAsRead, respond, responding }
}
