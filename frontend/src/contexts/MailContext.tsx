import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { mailConnection } from '../services/mailConnection'
import type { 
  MailContextType, 
  MailAccount, 
  MailMessage, 
  MailFolder, 
  MailSettings,
  MailSearchQuery,
  MailSyncStatus,
  MailComposerData
} from '../types/mail'

interface MailState {
  accounts: MailAccount[]
  currentAccount: MailAccount | null
  messages: MailMessage[]
  currentMessage: MailMessage | null
  folders: MailFolder[]
  currentFolder: MailFolder | null
  isLoading: boolean
  currentSearch: MailSearchQuery | null
  syncStatus: Record<string, MailSyncStatus>
  settings: MailSettings
}

type MailAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACCOUNTS'; payload: MailAccount[] }
  | { type: 'ADD_ACCOUNT'; payload: MailAccount }
  | { type: 'UPDATE_ACCOUNT'; payload: { id: string; account: Partial<MailAccount> } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_CURRENT_ACCOUNT'; payload: MailAccount | null }
  | { type: 'SET_MESSAGES'; payload: MailMessage[] }
  | { type: 'SET_CURRENT_MESSAGE'; payload: MailMessage | null }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; message: Partial<MailMessage> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_FOLDERS'; payload: MailFolder[] }
  | { type: 'SET_CURRENT_FOLDER'; payload: MailFolder | null }
  | { type: 'SET_CURRENT_SEARCH'; payload: MailSearchQuery | null }
  | { type: 'SET_SYNC_STATUS'; payload: { accountId: string; status: MailSyncStatus } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<MailSettings> }

const initialSettings: MailSettings = {
  general: {
    defaultAccount: '',
    checkInterval: 5,
    showDesktopNotifications: true,
    playSound: true,
    markAsReadDelay: 3,
    autoMarkRead: true,
    deleteConfirmation: true
  },
  display: {
    theme: 'light',
    density: 'comfortable',
    showAvatars: true,
    showPreview: true,
    previewLines: 2,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  },
  composer: {
    defaultFont: 'Arial',
    defaultFontSize: 14,
    autoSave: true,
    autoSaveInterval: 1,
    spellCheck: true,
    showRichTextToolbar: true,
    defaultSignature: '',
    requestReadReceipt: false
  },
  security: {
    blockRemoteImages: true,
    warnExternalLinks: true,
    encryptStoredPasswords: true,
    autoLockTimeout: 30
  }
}

const initialState: MailState = {
  accounts: [],
  currentAccount: null,
  messages: [],
  currentMessage: null,
  folders: [],
  currentFolder: null,
  isLoading: false,
  currentSearch: null,
  syncStatus: {},
  settings: initialSettings
}

function mailReducer(state: MailState, action: MailAction): MailState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload }
    
    case 'ADD_ACCOUNT':
      return { 
        ...state, 
        accounts: [...state.accounts, action.payload]
      }
    
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id
            ? { ...account, ...action.payload.account }
            : account
        ),
        currentAccount: state.currentAccount?.id === action.payload.id
          ? { ...state.currentAccount, ...action.payload.account }
          : state.currentAccount
      }
    
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        currentAccount: state.currentAccount?.id === action.payload ? null : state.currentAccount
      }
    
    case 'SET_CURRENT_ACCOUNT':
      return { ...state, currentAccount: action.payload }
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    
    case 'SET_CURRENT_MESSAGE':
      return { ...state, currentMessage: action.payload }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.id
            ? { ...message, ...action.payload.message }
            : message
        ),
        currentMessage: state.currentMessage?.id === action.payload.id
          ? { ...state.currentMessage, ...action.payload.message }
          : state.currentMessage
      }
    
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(message => message.id !== action.payload),
        currentMessage: state.currentMessage?.id === action.payload ? null : state.currentMessage
      }
    
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload }
    
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolder: action.payload }
    
    case 'SET_CURRENT_SEARCH':
      return { ...state, currentSearch: action.payload }
    
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          [action.payload.accountId]: action.payload.status
        }
      }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
          general: { ...state.settings.general, ...action.payload.general },
          display: { ...state.settings.display, ...action.payload.display },
          composer: { ...state.settings.composer, ...action.payload.composer },
          security: { ...state.settings.security, ...action.payload.security }
        }
      }
    
    default:
      return state
  }
}

const MailContext = createContext<MailContextType | null>(null)

interface MailProviderProps {
  children: React.ReactNode
}

export function MailProvider({ children }: MailProviderProps) {
  const [state, dispatch] = useReducer(mailReducer, initialState)

  // Account management
  const addAccount = useCallback(async (accountData: Omit<MailAccount, 'id' | 'created_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Registrar cuenta en el backend
      const newAccount = await mailConnection.registerAccount(accountData)
      
      dispatch({ type: 'ADD_ACCOUNT', payload: newAccount })
      
      // Si no hay cuenta por defecto, hacer esta la por defecto
      if (state.accounts.length === 0) {
        dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: newAccount })
        
        // Cargar carpetas automáticamente
        try {
          const folders = await mailConnection.syncFolders(newAccount.id)
          dispatch({ type: 'SET_FOLDERS', payload: folders })
          
          // Seleccionar inbox por defecto
          const inbox = folders.find(f => f.type === 'inbox')
          if (inbox) {
            dispatch({ type: 'SET_CURRENT_FOLDER', payload: inbox })
          }
        } catch (error) {
          console.error('Error loading folders:', error)
        }
      }
    } catch (error) {
      console.error('Error adding account:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.accounts.length])

  const updateAccount = useCallback(async (id: string, accountData: Partial<MailAccount>) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Actualizar cuenta en el backend
      const updatedAccount = await mailConnection.updateAccount(id, accountData)
      
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { id, account: updatedAccount } })
    } catch (error) {
      console.error('Error updating account:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const deleteAccount = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Eliminar cuenta del backend
      await mailConnection.deleteAccount(id)
      
      dispatch({ type: 'DELETE_ACCOUNT', payload: id })
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const setCurrentAccount = useCallback((accountId: string) => {
    const account = state.accounts.find(acc => acc.id === accountId)
    dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: account || null })
  }, [state.accounts])

  // Message management
  const loadMessages = useCallback(async (folderId?: string, accountId?: string) => {
    const targetAccountId = accountId || state.currentAccount?.id
    const targetFolderId = folderId || state.currentFolder?.id
    
    if (!targetAccountId || !targetFolderId) {
      console.warn('No account or folder selected')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Cargar mensajes reales desde el servidor
      const messages = await mailConnection.syncMessages(targetAccountId, targetFolderId, 50, 0)
      
      dispatch({ type: 'SET_MESSAGES', payload: messages })
    } catch (error) {
      console.error('Error loading messages:', error)
      
      // Fallback: mostrar mensaje de error
      const errorMessage: MailMessage = {
        id: 'error-1',
        accountId: targetAccountId,
        messageId: 'error-msg',
        subject: 'Error de conexión',
        from: { name: 'Sistema', email: 'sistema@crm.com' },
        to: [{ name: 'Usuario', email: state.currentAccount?.email || 'user@example.com' }],
        body: {
          text: `No se pudieron cargar los mensajes: ${error}`,
          html: `<p><strong>Error:</strong> No se pudieron cargar los mensajes.<br><br><em>${error}</em></p>`
        },
        attachments: [],
        isRead: true,
        isStarred: false,
        isFlagged: true,
        isImportant: false,
        labels: ['error'],
        folderId: targetFolderId,
        receivedAt: new Date(),
        size: 512,
        hasAttachments: false,
        snippet: `No se pudieron cargar los mensajes: ${error}`
      }
      
      dispatch({ type: 'SET_MESSAGES', payload: [errorMessage] })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentAccount?.id, state.currentAccount?.email, state.currentFolder?.id])

  const getMessage = useCallback(async (messageId: string): Promise<MailMessage> => {
    // Primero buscar en caché local
    const cachedMessage = state.messages.find(msg => msg.id === messageId)
    
    if (!state.currentAccount) {
      throw new Error('No account selected')
    }

    try {
      // Obtener mensaje completo del servidor
      const fullMessage = await mailConnection.getMessage(state.currentAccount.id, messageId)
      
      dispatch({ type: 'SET_CURRENT_MESSAGE', payload: fullMessage })
      
      // Actualizar en la lista local si existe
      if (cachedMessage) {
        dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, message: fullMessage } })
      }
      
      return fullMessage
    } catch (error) {
      console.error('Error fetching message:', error)
      
      // Usar mensaje en caché si está disponible
      if (cachedMessage) {
        dispatch({ type: 'SET_CURRENT_MESSAGE', payload: cachedMessage })
        return cachedMessage
      }
      
      throw new Error('Message not found')
    }
  }, [state.messages, state.currentAccount])

  const sendMessage = useCallback(async (messageData: MailComposerData) => {
    if (!messageData.accountId) {
      throw new Error('No account specified for sending')
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Enviar mensaje real via SMTP
      await mailConnection.sendMessage(messageData.accountId, messageData)
      
      console.log('✅ Message sent successfully')
      
      // Opcional: recargar mensajes para mostrar el mensaje enviado
      if (state.currentFolder?.type === 'sent') {
        await loadMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentFolder?.type, loadMessages])

  const markAsRead = useCallback(async (messageId: string, isRead: boolean) => {
    if (!state.currentAccount) {
      throw new Error('No account selected')
    }

    try {
      // Actualizar localmente primero para respuesta inmediata
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, message: { isRead } } })
      
      // Sincronizar con el servidor
      await mailConnection.markAsRead(state.currentAccount.id, messageId, isRead)
    } catch (error) {
      console.error('Error marking message as read:', error)
      
      // Revertir el cambio local si el servidor falló
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, message: { isRead: !isRead } } })
      throw error
    }
  }, [state.currentAccount])

  const markAsStarred = useCallback(async (messageId: string, isStarred: boolean) => {
    if (!state.currentAccount) {
      throw new Error('No account selected')
    }

    try {
      // Actualizar localmente primero para respuesta inmediata
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, message: { isStarred } } })
      
      // Sincronizar con el servidor
      await mailConnection.markAsStarred(state.currentAccount.id, messageId, isStarred)
    } catch (error) {
      console.error('Error starring message:', error)
      
      // Revertir el cambio local si el servidor falló
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, message: { isStarred: !isStarred } } })
      throw error
    }
  }, [state.currentAccount])

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!state.currentAccount) {
      throw new Error('No account selected')
    }

    try {
      // Eliminar localmente primero
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId })
      
      // Eliminar en el servidor
      await mailConnection.deleteMessage(state.currentAccount.id, messageId, false)  // false = mover a papelera
    } catch (error) {
      console.error('Error deleting message:', error)
      
      // En caso de error, recargar mensajes para restaurar el estado
      await loadMessages()
      throw error
    }
  }, [state.currentAccount, loadMessages])

  const moveMessage = useCallback(async (messageId: string, folderId: string) => {
    if (!state.currentAccount) {
      throw new Error('No account selected')
    }

    try {
      // Actualizar localmente primero
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, message: { folderId } } })
      
      // Mover en el servidor
      await mailConnection.moveMessage(state.currentAccount.id, messageId, folderId)
      
      // Si estamos viendo la carpeta actual, remover el mensaje de la vista
      const currentMessage = state.messages.find(m => m.id === messageId)
      if (currentMessage && currentMessage.folderId !== state.currentFolder?.id) {
        dispatch({ type: 'DELETE_MESSAGE', payload: messageId })
      }
    } catch (error) {
      console.error('Error moving message:', error)
      
      // Recargar mensajes en caso de error
      await loadMessages()
      throw error
    }
  }, [state.currentAccount, state.messages, state.currentFolder?.id, loadMessages])

  // Folder management
  const setCurrentFolder = useCallback((folderId: string) => {
    const folder = state.folders.find(f => f.id === folderId)
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folder || null })
  }, [state.folders])

  const createFolder = useCallback(async (folderData: Omit<MailFolder, 'id'>) => {
    try {
      const newFolder: MailFolder = {
        ...folderData,
        id: Date.now().toString()
      }
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      dispatch({ type: 'SET_FOLDERS', payload: [...state.folders, newFolder] })
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }, [state.folders])

  const updateFolder = useCallback(async (id: string, folderData: Partial<MailFolder>) => {
    try {
      const updatedFolders = state.folders.map(folder =>
        folder.id === id ? { ...folder, ...folderData } : folder
      )
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      dispatch({ type: 'SET_FOLDERS', payload: updatedFolders })
    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  }, [state.folders])

  const deleteFolder = useCallback(async (id: string) => {
    try {
      const updatedFolders = state.folders.filter(folder => folder.id !== id)
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      dispatch({ type: 'SET_FOLDERS', payload: updatedFolders })
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }, [state.folders])

  // Search
  const searchMessages = useCallback(async (query: MailSearchQuery): Promise<MailMessage[]> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Simular búsqueda en los mensajes actuales
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const results = state.messages.filter(message => {
        if (query.q) {
          const searchText = query.q.toLowerCase()
          return (
            message.subject.toLowerCase().includes(searchText) ||
            message.body.text.toLowerCase().includes(searchText) ||
            message.from.email.toLowerCase().includes(searchText) ||
            message.from.name?.toLowerCase().includes(searchText)
          )
        }
        return true
      })
      
      return results
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.messages])

  const setCurrentSearch = useCallback((query: MailSearchQuery | null) => {
    dispatch({ type: 'SET_CURRENT_SEARCH', payload: query })
  }, [])

  // Sync
  const syncAccount = useCallback(async (accountId: string) => {
    const syncStatus: MailSyncStatus = {
      accountId,
      isActive: true,
      lastSync: new Date(),
      progress: {
        current: 0,
        total: 100,
        stage: 'connecting'
      }
    }
    
    dispatch({ type: 'SET_SYNC_STATUS', payload: { accountId, status: syncStatus } })
    
    try {
      // Simular sincronización
      for (const stage of ['connecting', 'authenticating', 'syncing_folders', 'syncing_messages', 'complete'] as const) {
        syncStatus.progress!.stage = stage
        syncStatus.progress!.current += 20
        dispatch({ type: 'SET_SYNC_STATUS', payload: { accountId, status: { ...syncStatus } } })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      syncStatus.isActive = false
      dispatch({ type: 'SET_SYNC_STATUS', payload: { accountId, status: syncStatus } })
    } catch (error) {
      syncStatus.isActive = false
      syncStatus.error = 'Error de sincronización'
      dispatch({ type: 'SET_SYNC_STATUS', payload: { accountId, status: syncStatus } })
      throw error
    }
  }, [])

  const syncAllAccounts = useCallback(async () => {
    const promises = state.accounts.map(account => syncAccount(account.id))
    await Promise.allSettled(promises)
  }, [state.accounts, syncAccount])

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<MailSettings>) => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings })
      // Simular guardado en API
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }, [])

  // Cargar cuentas registradas al inicializar
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accounts = await mailConnection.getAccounts()
        dispatch({ type: 'SET_ACCOUNTS', payload: accounts })
        
        // Seleccionar la primera cuenta por defecto
        if (accounts.length > 0 && !state.currentAccount) {
          dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: accounts[0] })
        }
      } catch (error) {
        console.error('Error loading accounts:', error)
      }
    }

    loadAccounts()
  }, [state.currentAccount])

  // Cargar carpetas cuando se selecciona una cuenta
  useEffect(() => {
    const loadFolders = async () => {
      if (state.currentAccount && state.folders.length === 0) {
        try {
          const folders = await mailConnection.syncFolders(state.currentAccount.id)
          dispatch({ type: 'SET_FOLDERS', payload: folders })
          
          // Seleccionar inbox por defecto
          const inbox = folders.find(f => f.type === 'inbox')
          if (inbox) {
            dispatch({ type: 'SET_CURRENT_FOLDER', payload: inbox })
          }
        } catch (error) {
          console.error('Error loading folders:', error)
          
          // Fallback: crear carpetas por defecto si no se pueden cargar
          const defaultFolders: MailFolder[] = [
            {
              id: 'inbox',
              accountId: state.currentAccount.id,
              name: 'INBOX',
              displayName: 'Bandeja de entrada',
              type: 'inbox',
              unreadCount: 0,
              totalCount: 0,
              isSelectable: true,
              path: 'INBOX',
              attributes: []
            },
            {
              id: 'sent',
              accountId: state.currentAccount.id,
              name: 'Sent',
              displayName: 'Enviados',
              type: 'sent',
              unreadCount: 0,
              totalCount: 0,
              isSelectable: true,
              path: 'Sent',
              attributes: ['\\Sent']
            },
            {
              id: 'drafts',
              accountId: state.currentAccount.id,
              name: 'Drafts',
              displayName: 'Borradores',
              type: 'drafts',
              unreadCount: 0,
              totalCount: 0,
              isSelectable: true,
              path: 'Drafts',
              attributes: ['\\Drafts']
            },
            {
              id: 'trash',
              accountId: state.currentAccount.id,
              name: 'Trash',
              displayName: 'Papelera',
              type: 'trash',
              unreadCount: 0,
              totalCount: 0,
              isSelectable: true,
              path: 'Trash',
              attributes: ['\\Trash']
            }
          ]
          
          dispatch({ type: 'SET_FOLDERS', payload: defaultFolders })
          dispatch({ type: 'SET_CURRENT_FOLDER', payload: defaultFolders[0] })
        }
      }
    }

    loadFolders()
  }, [state.currentAccount, state.folders.length])

  const contextValue: MailContextType = {
    // State
    accounts: state.accounts,
    currentAccount: state.currentAccount,
    messages: state.messages,
    currentMessage: state.currentMessage,
    folders: state.folders,
    currentFolder: state.currentFolder,
    isLoading: state.isLoading,
    currentSearch: state.currentSearch,
    syncStatus: state.syncStatus,
    settings: state.settings,
    
    // Account methods
    addAccount,
    updateAccount,
    deleteAccount,
    setCurrentAccount,
    
    // Message methods
    loadMessages,
    getMessage,
    sendMessage,
    markAsRead,
    markAsStarred,
    deleteMessage,
    moveMessage,
    
    // Folder methods
    setCurrentFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    
    // Search methods
    searchMessages,
    setCurrentSearch,
    
    // Sync methods
    syncAccount,
    syncAllAccounts,
    
    // Settings methods
    updateSettings
  }

  return (
    <MailContext.Provider value={contextValue}>
      {children}
    </MailContext.Provider>
  )
}

export function useMail(): MailContextType {
  const context = useContext(MailContext)
  if (!context) {
    throw new Error('useMail must be used within a MailProvider')
  }
  return context
}

export { MailContext }