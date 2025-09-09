"use client"

// Hook de toast inspirado en la librería react-hot-toast
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Configuración del sistema de toasts
const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

/**
 * Tipo extendido para toasts con ID y acciones
 * Combina las props del toast con funcionalidades adicionales
 */
type ToasterToast = ToastProps & {
  /** ID único del toast */
  id: string
  /** Título del toast */
  title?: React.ReactNode
  /** Descripción del toast */
  description?: React.ReactNode
  /** Acción asociada al toast */
  action?: ToastActionElement
}

/**
 * Tipos de acciones para el reducer del sistema de toasts
 * Define todas las acciones posibles en el estado de toasts
 */
const actionTypes = {
  /** Agregar un nuevo toast */
  ADD_TOAST: "ADD_TOAST",
  /** Actualizar un toast existente */
  UPDATE_TOAST: "UPDATE_TOAST",
  /** Descartar un toast (ocultar) */
  DISMISS_TOAST: "DISMISS_TOAST",
  /** Remover un toast del estado */
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// Contador global para generar IDs únicos
let count = 0

// Función para generar IDs únicos para los toasts
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

/**
 * Tipos para las acciones del reducer
 * Define la estructura de las acciones que puede procesar el reducer
 */
type ActionType = typeof actionTypes

/**
 * Unión de tipos para todas las acciones posibles
 * Cada acción tiene un tipo específico y datos asociados
 */
type Action =
  | {
      /** Acción para agregar un nuevo toast */
      type: ActionType["ADD_TOAST"]
      /** Datos del toast a agregar */
      toast: ToasterToast
    }
  | {
      /** Acción para actualizar un toast existente */
      type: ActionType["UPDATE_TOAST"]
      /** Datos parciales del toast a actualizar */
      toast: Partial<ToasterToast>
    }
  | {
      /** Acción para descartar un toast */
      type: ActionType["DISMISS_TOAST"]
      /** ID del toast a descartar (opcional, si no se especifica se descartan todos) */
      toastId?: ToasterToast["id"]
    }
  | {
      /** Acción para remover un toast del estado */
      type: ActionType["REMOVE_TOAST"]
      /** ID del toast a remover (opcional, si no se especifica se remueven todos) */
      toastId?: ToasterToast["id"]
    }

/**
 * Estado del sistema de toasts
 * Contiene la lista actual de toasts activos
 */
interface State {
  /** Array de toasts actualmente activos */
  toasts: ToasterToast[]
}

// Mapa para almacenar timeouts de eliminación
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Función para agregar un toast a la cola de eliminación
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Reducer para manejar las acciones del sistema de toasts
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Agregar a la cola de eliminación
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Array de listeners para notificar cambios de estado
const listeners: Array<(state: State) => void> = []

// Estado global en memoria
let memoryState: State = { toasts: [] }

// Función para despachar acciones y notificar a los listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/**
 * Tipo para crear nuevos toasts (sin ID)
 * Se usa para crear toasts donde el ID se genera automáticamente
 */
type Toast = Omit<ToasterToast, "id">

// Función para crear y mostrar un nuevo toast
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Hook principal para usar el sistema de toasts
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
