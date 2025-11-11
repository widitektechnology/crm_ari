import type { MailAccount, MailMessage, MailFolder, MailComposerData } from '../types/mail'

/**
 * Servicio para conectividad real con servidores IMAP/SMTP
 */
export class MailConnectionService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api/mail` 
    : `${window.location.protocol}//${window.location.hostname}/api/mail`

  /**
   * Prueba la conectividad real con el servidor IMAP/SMTP
   */
  async testConnection(account: Partial<MailAccount>): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incoming: account.settings?.incoming,
          outgoing: account.settings?.outgoing,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error de conexión' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error testing connection:', error)
      return { success: false, error: 'Error de conectividad' }
    }
  }

  /**
   * Sincroniza carpetas desde el servidor IMAP
   */
  async syncFolders(accountId: string): Promise<MailFolder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/folders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error syncing folders')
      }

      const folders: MailFolder[] = await response.json()
      return folders
    } catch (error) {
      console.error('Error syncing folders:', error)
      throw error
    }
  }

  /**
   * Sincroniza mensajes desde el servidor IMAP
   */
  async syncMessages(
    accountId: string, 
    folderId: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<MailMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/folders/${folderId}/messages?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error syncing messages')
      }

      const data = await response.json()
      
      // Asegurar que siempre devolvemos un array válido
      if (Array.isArray(data)) {
        return data
      } else if (data && Array.isArray(data.messages)) {
        return data.messages
      } else if (data && Array.isArray(data.value)) {
        return data.value
      } else {
        console.warn('syncMessages: Response is not an array:', data)
        return []
      }
    } catch (error) {
      console.error('Error syncing messages:', error)
      throw error
    }
  }

  /**
   * Obtiene un mensaje completo con cuerpo y archivos adjuntos
   */
  async getMessage(accountId: string, messageId: string): Promise<MailMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/messages/${messageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error fetching message')
      }

      const message: MailMessage = await response.json()
      return message
    } catch (error) {
      console.error('Error fetching message:', error)
      throw error
    }
  }

  /**
   * Marca un mensaje como leído/no leído
   */
  async markAsRead(accountId: string, messageId: string, isRead: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead }),
      })

      if (!response.ok) {
        throw new Error('Error marking message as read')
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  /**
   * Marca un mensaje como destacado/no destacado
   */
  async markAsStarred(accountId: string, messageId: string, isStarred: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/messages/${messageId}/star`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isStarred }),
      })

      if (!response.ok) {
        throw new Error('Error starring message')
      }
    } catch (error) {
      console.error('Error starring message:', error)
      throw error
    }
  }

  /**
   * Mueve un mensaje a otra carpeta
   */
  async moveMessage(accountId: string, messageId: string, targetFolderId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/messages/${messageId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetFolderId }),
      })

      if (!response.ok) {
        throw new Error('Error moving message')
      }
    } catch (error) {
      console.error('Error moving message:', error)
      throw error
    }
  }

  /**
   * Elimina un mensaje (mueve a papelera o elimina permanentemente)
   */
  async deleteMessage(accountId: string, messageId: string, permanent: boolean = false): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permanent }),
      })

      if (!response.ok) {
        throw new Error('Error deleting message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  /**
   * Envía un mensaje usando SMTP
   */
  async sendMessage(accountId: string, message: MailComposerData): Promise<void> {
    try {
      const formData = new FormData()
      
      // Datos básicos del mensaje
      formData.append('accountId', accountId)
      formData.append('to', JSON.stringify(message.to))
      formData.append('subject', message.subject)
      formData.append('body', JSON.stringify(message.body))
      
      // Datos opcionales
      if (message.cc && message.cc.length > 0) {
        formData.append('cc', JSON.stringify(message.cc))
      }
      if (message.bcc && message.bcc.length > 0) {
        formData.append('bcc', JSON.stringify(message.bcc))
      }
      if (message.replyToMessageId) {
        formData.append('replyToMessageId', message.replyToMessageId)
      }
      if (message.forwardMessageId) {
        formData.append('forwardMessageId', message.forwardMessageId)
      }
      
      // Archivos adjuntos
      message.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
      
      // Opciones adicionales
      formData.append('priority', message.priority)
      formData.append('requestReadReceipt', message.requestReadReceipt.toString())

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error sending message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Guarda un mensaje como borrador
   */
  async saveDraft(accountId: string, message: MailComposerData): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        throw new Error('Error saving draft')
      }

      const result = await response.json()
      return result.draftId
    } catch (error) {
      console.error('Error saving draft:', error)
      throw error
    }
  }

  /**
   * Busca mensajes en el servidor
   */
  async searchMessages(
    accountId: string,
    query: string,
    folderId?: string,
    limit: number = 50
  ): Promise<MailMessage[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      })
      
      if (folderId) {
        params.append('folderId', folderId)
      }

      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error searching messages')
      }

      const messages: MailMessage[] = await response.json()
      return messages
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  }

  /**
   * Descarga un archivo adjunto
   */
  async downloadAttachment(accountId: string, messageId: string, attachmentId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/messages/${messageId}/attachments/${attachmentId}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Error downloading attachment')
      }

      return await response.blob()
    } catch (error) {
      console.error('Error downloading attachment:', error)
      throw error
    }
  }

  /**
   * Obtiene el estado de sincronización de una cuenta
   */
  async getSyncStatus(accountId: string): Promise<{ isActive: boolean, lastSync: Date, error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/sync/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error getting sync status')
      }

      const status = await response.json()
      return {
        ...status,
        lastSync: new Date(status.lastSync)
      }
    } catch (error) {
      console.error('Error getting sync status:', error)
      throw error
    }
  }

  /**
   * Inicia sincronización manual de una cuenta
   */
  async startSync(accountId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error starting sync')
      }
    } catch (error) {
      console.error('Error starting sync:', error)
      throw error
    }
  }

  /**
   * Registra una cuenta de correo en el backend
   */
  async registerAccount(account: Omit<MailAccount, 'id' | 'created_at'>): Promise<MailAccount> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(account),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error registering account')
      }

      const registeredAccount: MailAccount = await response.json()
      return registeredAccount
    } catch (error) {
      console.error('Error registering account:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las cuentas registradas
   */
  async getAccounts(): Promise<MailAccount[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error fetching accounts')
      }

      const accounts: MailAccount[] = await response.json()
      return accounts
    } catch (error) {
      console.error('Error fetching accounts:', error)
      throw error
    }
  }

  /**
   * Actualiza una cuenta de correo
   */
  async updateAccount(accountId: string, updates: Partial<MailAccount>): Promise<MailAccount> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error updating account')
      }

      const updatedAccount: MailAccount = await response.json()
      return updatedAccount
    } catch (error) {
      console.error('Error updating account:', error)
      throw error
    }
  }

  /**
   * Elimina una cuenta de correo
   */
  async deleteAccount(accountId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error deleting account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    }
  }
}

// Singleton instance
export const mailConnection = new MailConnectionService()