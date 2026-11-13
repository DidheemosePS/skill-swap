import { createContext } from 'react'

export interface ToastApi {
  // A failed action, said in one line. Retry adds a "Try again" that reruns it.
  error: (message: string, retry?: () => void) => void
  // A finished action whose result isn't otherwise visible (a row moved, a form saved), said in one line.
  success: (message: string) => void
  // A new message from someone, with their face and a way straight into the conversation.
  message: (from: { name: string; avatarUrl: string | null }, preview: string, onOpen: () => void) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
