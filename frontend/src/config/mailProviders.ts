import type { MailProviderConfig } from '../types/mail'

export const MAIL_PROVIDERS: Record<string, MailProviderConfig> = {
  gmail: {
    name: 'Gmail',
    domains: ['gmail.com', 'googlemail.com'],
    incoming: {
      server: 'imap.gmail.com',
      port: 993,
      ssl: true
    },
    outgoing: {
      server: 'smtp.gmail.com',
      port: 587,
      ssl: true
    },
    authType: 'oauth2',
    icon: '📧',
    color: '#EA4335'
  },
  
  outlook: {
    name: 'Outlook',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
    incoming: {
      server: 'outlook.office365.com',
      port: 993,
      ssl: true
    },
    outgoing: {
      server: 'smtp-mail.outlook.com',
      port: 587,
      ssl: true
    },
    authType: 'oauth2',
    icon: '📮',
    color: '#0078D4'
  },
  
  yahoo: {
    name: 'Yahoo Mail',
    domains: ['yahoo.com', 'yahoo.es', 'ymail.com', 'rocketmail.com'],
    incoming: {
      server: 'imap.mail.yahoo.com',
      port: 993,
      ssl: true
    },
    outgoing: {
      server: 'smtp.mail.yahoo.com',
      port: 587,
      ssl: true
    },
    authType: 'password',
    icon: '💜',
    color: '#6001D2'
  },
  
  icloud: {
    name: 'iCloud Mail',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    incoming: {
      server: 'imap.mail.me.com',
      port: 993,
      ssl: true
    },
    outgoing: {
      server: 'smtp.mail.me.com',
      port: 587,
      ssl: true
    },
    authType: 'password',
    icon: '☁️',
    color: '#007AFF'
  },
  
  // Proveedores empresariales
  office365: {
    name: 'Office 365',
    domains: [],
    incoming: {
      server: 'outlook.office365.com',
      port: 993,
      ssl: true
    },
    outgoing: {
      server: 'smtp.office365.com',
      port: 587,
      ssl: true
    },
    authType: 'oauth2',
    icon: '🏢',
    color: '#0078D4'
  },
  
  exchange: {
    name: 'Microsoft Exchange',
    domains: [],
    incoming: {
      server: '',
      port: 993,
      ssl: true
    },
    outgoing: {
      server: '',
      port: 587,
      ssl: true
    },
    authType: 'password',
    icon: '🔄',
    color: '#106EBE'
  }
}

/**
 * Detecta automáticamente el proveedor basado en el email
 */
export function detectProvider(email: string): MailProviderConfig | null {
  const domain = email.split('@')[1]?.toLowerCase()
  
  for (const [, config] of Object.entries(MAIL_PROVIDERS)) {
    if (config.domains.includes(domain)) {
      return config
    }
  }
  
  return null
}

/**
 * Genera configuración automática para un email
 */
export function generateAutoConfig(email: string, name: string): Partial<import('../types/mail').MailAccount> | null {
  const provider = detectProvider(email)
  
  if (!provider) return null
  
  const providerKey = Object.keys(MAIL_PROVIDERS).find(
    key => MAIL_PROVIDERS[key] === provider
  ) as keyof typeof MAIL_PROVIDERS
  
  return {
    name,
    email,
    provider: providerKey as any,
    settings: {
      incoming: {
        server: provider.incoming.server,
        port: provider.incoming.port,
        ssl: provider.incoming.ssl,
        username: email,
        password: '' // El usuario deberá ingresarla
      },
      outgoing: {
        server: provider.outgoing.server,
        port: provider.outgoing.port,
        ssl: provider.outgoing.ssl,
        username: email,
        password: '' // El usuario deberá ingresarla
      }
    },
    isActive: true,
    isDefault: false,
    lastSync: new Date(),
    unreadCount: 0,
    totalCount: 0,
    created_at: new Date()
  }
}

/**
 * Configuraciones IMAP/SMTP comunes para empresas
 */
export const COMMON_IMAP_CONFIGS = [
  {
    name: 'Generic IMAP',
    incoming: { port: 993, ssl: true },
    outgoing: { port: 587, ssl: true }
  },
  {
    name: 'Generic IMAP (No SSL)',
    incoming: { port: 143, ssl: false },
    outgoing: { port: 25, ssl: false }
  },
  {
    name: 'Generic IMAP (Alternative)',
    incoming: { port: 993, ssl: true },
    outgoing: { port: 465, ssl: true }
  }
]

/**
 * Valida la configuración de una cuenta de correo
 */
export function validateAccountConfig(account: Partial<import('../types/mail').MailAccount>): string[] {
  const errors: string[] = []
  
  if (!account.name?.trim()) {
    errors.push('El nombre de la cuenta es requerido')
  }
  
  if (!account.email?.trim()) {
    errors.push('El email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
    errors.push('El formato del email no es válido')
  }
  
  if (!account.settings?.incoming) {
    errors.push('La configuración del servidor entrante es requerida')
  } else {
    const incoming = account.settings.incoming
    if (!incoming.server?.trim()) {
      errors.push('El servidor IMAP es requerido')
    }
    if (!incoming.port || incoming.port < 1 || incoming.port > 65535) {
      errors.push('El puerto IMAP debe estar entre 1 y 65535')
    }
    if (!incoming.username?.trim()) {
      errors.push('El usuario IMAP es requerido')
    }
    if (!incoming.password?.trim()) {
      errors.push('La contraseña IMAP es requerida')
    }
  }
  
  if (!account.settings?.outgoing) {
    errors.push('La configuración del servidor saliente es requerida')
  } else {
    const outgoing = account.settings.outgoing
    if (!outgoing.server?.trim()) {
      errors.push('El servidor SMTP es requerido')
    }
    if (!outgoing.port || outgoing.port < 1 || outgoing.port > 65535) {
      errors.push('El puerto SMTP debe estar entre 1 y 65535')
    }
    if (!outgoing.username?.trim()) {
      errors.push('El usuario SMTP es requerido')
    }
    if (!outgoing.password?.trim()) {
      errors.push('La contraseña SMTP es requerida')
    }
  }
  
  return errors
}

/**
 * Puertos comunes para diferentes protocolos
 */
export const COMMON_PORTS = {
  IMAP: {
    ssl: [993, 585],
    noSsl: [143, 220]
  },
  POP3: {
    ssl: [995],
    noSsl: [110]
  },
  SMTP: {
    ssl: [465, 587],
    noSsl: [25, 587]
  }
}

/**
 * Lista de carpetas estándar por proveedor
 */
export const STANDARD_FOLDERS = {
  gmail: [
    { name: 'INBOX', displayName: 'Bandeja de entrada', type: 'inbox' as const },
    { name: '[Gmail]/Sent Mail', displayName: 'Enviados', type: 'sent' as const },
    { name: '[Gmail]/Drafts', displayName: 'Borradores', type: 'drafts' as const },
    { name: '[Gmail]/Trash', displayName: 'Papelera', type: 'trash' as const },
    { name: '[Gmail]/Spam', displayName: 'Spam', type: 'spam' as const },
    { name: '[Gmail]/All Mail', displayName: 'Todos', type: 'archive' as const }
  ],
  outlook: [
    { name: 'INBOX', displayName: 'Bandeja de entrada', type: 'inbox' as const },
    { name: 'Sent', displayName: 'Enviados', type: 'sent' as const },
    { name: 'Drafts', displayName: 'Borradores', type: 'drafts' as const },
    { name: 'Deleted', displayName: 'Eliminados', type: 'trash' as const },
    { name: 'Junk', displayName: 'Correo no deseado', type: 'spam' as const }
  ],
  generic: [
    { name: 'INBOX', displayName: 'Bandeja de entrada', type: 'inbox' as const },
    { name: 'Sent', displayName: 'Enviados', type: 'sent' as const },
    { name: 'Drafts', displayName: 'Borradores', type: 'drafts' as const },
    { name: 'Trash', displayName: 'Papelera', type: 'trash' as const }
  ]
}