import { use } from 'react'
import { ToastContext } from '../context/ToastContext'

export function useToast() {
  const value = use(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
