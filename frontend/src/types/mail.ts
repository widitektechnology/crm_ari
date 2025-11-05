// Tipos para el sistema de correo electrónico

export interface MailAccount {
  id: string
  name: string
  email: string
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap' | 'pop3' | 'exchange'
  settings: {
    incoming: {
      server: string
      port: number
      ssl: boolean
      username: string
      password: string // En producción debería estar encriptado
    }
    outgoing: {
      server: string
      port: number
      ssl: boolean
      username: string
      password: string
    }
  }
  isActive: boolean
  isDefault: boolean
  lastSync: Date
  unreadCount: number
  totalCount: number
  avatar?: string
  signature?: string
  created_at: Date
}

export interface MailMessage {
  id: string
  accountId: string
  messageId: string // ID único del servidor
  subject: string
  from: MailContact
  to: MailContact[]
  cc?: MailContact[]
  bcc?: MailContact[]
  replyTo?: MailContact
  body: {
    text: string
    html: string
  }
  attachments: MailAttachment[]
  isRead: boolean
  isStarred: boolean
  isFlagged: boolean
  isImportant: boolean
  labels: string[]
  folderId: string
  threadId?: string
  inReplyTo?: string
  references?: string
  receivedAt: Date
  sentAt?: Date
  size: number
  hasAttachments: boolean
  snippet: string // Preview del contenido
}

export interface MailContact {
  name?: string
  email: string
  avatar?: string
}

export interface MailAttachment {
  id: string
  filename: string
  contentType: string
  size: number
  contentId?: string // Para imágenes inline
  url?: string
  isInline: boolean
  downloadUrl?: string
}

export interface MailFolder {
  id: string
  accountId: string
  name: string
  displayName: string
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom' | 'archive'
  color?: string
  icon?: string
  unreadCount: number
  totalCount: number
  isSelectable: boolean
  parentId?: string
  path: string // Para carpetas anidadas
  attributes: string[] // \Drafts, \Sent, etc.
}

export interface MailThread {
  id: string
  subject: string
  messages: MailMessage[]
  participants: MailContact[]
  lastMessageDate: Date
  messageCount: number
  unreadCount: number
  isStarred: boolean
  labels: string[]
}

export interface MailLabel {
  id: string
  name: string
  color: string
  isSystem: boolean // true para labels del sistema
  messageCount: number
}

export interface MailFilter {
  id: string
  name: string
  conditions: {
    field: 'from' | 'to' | 'subject' | 'body' | 'has_attachment'
    operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex'
    value: string
  }[]
  actions: {
    type: 'move_to_folder' | 'add_label' | 'mark_read' | 'mark_important' | 'delete'
    value: string
  }[]
  isActive: boolean
}

export interface MailSearchQuery {
  q: string // Búsqueda general
  from?: string
  to?: string
  subject?: string
  body?: string
  hasAttachment?: boolean
  isRead?: boolean
  isStarred?: boolean
  folderId?: string
  accountId?: string
  dateFrom?: Date
  dateTo?: Date
  labels?: string[]
  size?: 'small' | 'medium' | 'large'
}

export interface MailComposerData {
  id?: string // Para borradores
  accountId: string
  to: MailContact[]
  cc?: MailContact[]
  bcc?: MailContact[]
  subject: string
  body: {
    text: string
    html: string
  }
  attachments: File[]
  priority: 'low' | 'normal' | 'high'
  requestReadReceipt: boolean
  sendAt?: Date // Para programar envío
  signature?: string
  replyToMessageId?: string
  forwardMessageId?: string
  isDraft: boolean
}

export interface MailSettings {
  general: {
    defaultAccount: string
    checkInterval: number // minutos
    showDesktopNotifications: boolean
    playSound: boolean
    markAsReadDelay: number // segundos
    autoMarkRead: boolean
    deleteConfirmation: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    density: 'comfortable' | 'compact'
    showAvatars: boolean
    showPreview: boolean
    previewLines: number
    dateFormat: string
    timeFormat: '12h' | '24h'
  }
  composer: {
    defaultFont: string
    defaultFontSize: number
    autoSave: boolean
    autoSaveInterval: number // minutos
    spellCheck: boolean
    showRichTextToolbar: boolean
    defaultSignature: string
    requestReadReceipt: boolean
  }
  security: {
    blockRemoteImages: boolean
    warnExternalLinks: boolean
    encryptStoredPasswords: boolean
    autoLockTimeout: number // minutos
  }
}

export interface MailSyncStatus {
  accountId: string
  isActive: boolean
  lastSync: Date
  nextSync?: Date
  error?: string
  progress?: {
    current: number
    total: number
    stage: 'connecting' | 'authenticating' | 'syncing_folders' | 'syncing_messages' | 'complete'
  }
}

// Context types
export interface MailContextType {
  // Accounts
  accounts: MailAccount[]
  currentAccount: MailAccount | null
  addAccount: (account: Omit<MailAccount, 'id' | 'created_at'>) => Promise<void>
  updateAccount: (id: string, account: Partial<MailAccount>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  setCurrentAccount: (accountId: string) => void
  
  // Messages
  messages: MailMessage[]
  currentMessage: MailMessage | null
  isLoading: boolean
  loadMessages: (folderId?: string, accountId?: string) => Promise<void>
  getMessage: (messageId: string) => Promise<MailMessage>
  sendMessage: (message: MailComposerData) => Promise<void>
  markAsRead: (messageId: string, isRead: boolean) => Promise<void>
  markAsStarred: (messageId: string, isStarred: boolean) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  moveMessage: (messageId: string, folderId: string) => Promise<void>
  
  // Folders
  folders: MailFolder[]
  currentFolder: MailFolder | null
  setCurrentFolder: (folderId: string) => void
  createFolder: (folder: Omit<MailFolder, 'id'>) => Promise<void>
  updateFolder: (id: string, folder: Partial<MailFolder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  
  // Search & Filters
  searchMessages: (query: MailSearchQuery) => Promise<MailMessage[]>
  currentSearch: MailSearchQuery | null
  setCurrentSearch: (query: MailSearchQuery | null) => void
  
  // Sync
  syncStatus: Record<string, MailSyncStatus>
  syncAccount: (accountId: string) => Promise<void>
  syncAllAccounts: () => Promise<void>
  
  // Settings
  settings: MailSettings
  updateSettings: (settings: Partial<MailSettings>) => Promise<void>
}

// Component props types
export interface MailSidebarProps {
  className?: string
}

export interface MailListProps {
  messages: MailMessage[]
  currentMessage?: MailMessage | null
  onMessageSelect: (message: MailMessage) => void
  isLoading?: boolean
  className?: string
}

export interface MailViewerProps {
  message: MailMessage | null
  onReply: (message: MailMessage) => void
  onReplyAll: (message: MailMessage) => void
  onForward: (message: MailMessage) => void
  onDelete: (message: MailMessage) => void
  onMarkRead: (message: MailMessage, isRead: boolean) => void
  onMarkStarred: (message: MailMessage, isStarred: boolean) => void
  className?: string
}

export interface MailComposerProps {
  initialData?: Partial<MailComposerData>
  mode: 'new' | 'reply' | 'reply-all' | 'forward' | 'draft'
  onSend: (message: MailComposerData) => Promise<void>
  onSaveDraft: (message: MailComposerData) => Promise<void>
  onCancel: () => void
  className?: string
}

export interface AccountSetupProps {
  onAccountAdded: (account: MailAccount) => void
  onCancel: () => void
  initialData?: Partial<MailAccount>
}

// Provider configurations
export interface MailProviderConfig {
  name: string
  domains: string[]
  incoming: {
    server: string
    port: number
    ssl: boolean
  }
  outgoing: {
    server: string
    port: number
    ssl: boolean
  }
  authType: 'password' | 'oauth2'
  icon: string
  color: string
}

// API Response types
export interface MailApiResponse<T> {
  success: boolean
  data: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface MailApiError {
  code: string
  message: string
  details?: any
}