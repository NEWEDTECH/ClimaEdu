'use client'

import React from 'react'
import { toast, ToastContainer, ToastOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export type ToastType = 'success' | 'warning' | 'error' | 'loading'

interface ToastConfig {
  autoClose?: number | false
  hideProgressBar?: boolean
  closeOnClick?: boolean
  pauseOnHover?: boolean
  draggable?: boolean
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
  containerId?: string
}

const defaultConfig: ToastConfig = {
  autoClose: 3000,
  hideProgressBar: false,
  position: 'top-right'
}

const loadingConfig: ToastConfig = {
  autoClose: false,
  hideProgressBar: true,
  position: 'top-right'
}

export const showToast = {
  success: (message: string | React.ReactNode, config?: Partial<ToastConfig>) => {
    const options: ToastOptions = {
      ...defaultConfig,
      ...config,
      type: 'success'
    }
    return toast.success(message, options)
  },

  warning: (message: string | React.ReactNode, config?: Partial<ToastConfig>) => {
    const options: ToastOptions = {
      ...defaultConfig,
      ...config,
      type: 'warning'
    }
    return toast.warning(message, options)
  },

  error: (message: string | React.ReactNode, config?: Partial<ToastConfig>) => {
    const options: ToastOptions = {
      ...defaultConfig,
      ...config,
      type: 'error'
    }
    return toast.error(message, options)
  },

  loading: (message: string | React.ReactNode, config?: Partial<ToastConfig>) => {
    const options: ToastOptions = {
      ...loadingConfig,
      ...config,
      type: 'info'
    }
    return toast.loading(message, options)
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  },

  update: (toastId: string | number, options: {
    render?: string
    type?: 'success' | 'warning' | 'error' | 'info'
    autoClose?: number | false
  }) => {
    // Se estamos mudando de loading para success/error/warning, precisamos dismiss e criar novo
    if (options.type && options.type !== 'info') {
      toast.dismiss(toastId)
      
      // Pequeno delay para garantir que o toast anterior foi removido
      setTimeout(() => {
        if (options.type === 'success') {
          toast.success(options.render || '')
        } else if (options.type === 'error') {
          toast.error(options.render || '')
        } else if (options.type === 'warning') {
          toast.warning(options.render || '')
        }
      }, 100)
    } else {
      // Para outros casos, usa update normal
      toast.update(toastId, {
        render: options.render,
        type: options.type,
        autoClose: options.autoClose ?? false
      })
    }
  }
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
        closeButton={true}
        enableMultiContainer={false}
        containerId="main-toast-container"
      />
    </>
  )
}
