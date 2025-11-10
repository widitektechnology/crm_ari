import { useEffect, useState } from 'react'
import { useMail } from '../../contexts/MailContext'
import MailSidebar from './MailSidebar'
import MailList from './MailList'
import MailViewer from './MailViewer'
import MailComposer from './MailComposer'
import AccountSetup from './AccountSetup'
import ConnectionStatus from './ConnectionStatus'
import type { MailMessage, MailComposerData } from '../../types/mail'

interface MailDashboardProps {
  className?: string
}

export default function MailDashboard({ className = '' }: MailDashboardProps) {
  const {
    accounts,
    currentAccount,
    messages,
    isLoading,
    loadMessages,
    getMessage,
    sendMessage,
    markAsRead,
    markAsStarred,
    deleteMessage
  } = useMail()

  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [composerMode, setComposerMode] = useState<'new' | 'reply' | 'reply-all' | 'forward' | 'draft'>('new')
  const [composerInitialData, setComposerInitialData] = useState<Partial<MailComposerData> | undefined>()
  const [showAccountSetup, setShowAccountSetup] = useState(false)

  // Cargar mensajes cuando cambie la cuenta actual
  useEffect(() => {
    if (currentAccount) {
      loadMessages()
    }
  }, [currentAccount, loadMessages])

  // Mostrar configuración de cuenta si no hay cuentas
  useEffect(() => {
    if (accounts.length === 0) {
      setShowAccountSetup(true)
    }
  }, [accounts.length])

  const handleMessageSelect = async (message: MailMessage) => {
    try {
      const fullMessage = await getMessage(message.id)
      setSelectedMessage(fullMessage)
      
      // Marcar como leído si no lo está
      if (!fullMessage.isRead) {
        markAsRead(fullMessage.id, true)
      }
    } catch (error) {
      console.error('Error loading message:', error)
    }
  }

  const handleReply = (message: MailMessage) => {
    setComposerInitialData({
      accountId: message.accountId,
      to: [message.from],
      subject: message.subject.startsWith('Re: ') ? message.subject : `Re: ${message.subject}`,
      replyToMessageId: message.id
    })
    setComposerMode('reply')
    setShowComposer(true)
  }

  const handleReplyAll = (message: MailMessage) => {
    const allRecipients = [message.from, ...message.to.filter(to => to.email !== currentAccount?.email)]
    setComposerInitialData({
      accountId: message.accountId,
      to: allRecipients,
      cc: message.cc,
      subject: message.subject.startsWith('Re: ') ? message.subject : `Re: ${message.subject}`,
      replyToMessageId: message.id
    })
    setComposerMode('reply-all')
    setShowComposer(true)
  }

  const handleForward = (message: MailMessage) => {
    setComposerInitialData({
      accountId: message.accountId,
      subject: message.subject.startsWith('Fwd: ') ? message.subject : `Fwd: ${message.subject}`,
      body: {
        text: `\n\n---------- Forwarded message ----------\nFrom: ${message.from.name || message.from.email}\nDate: ${message.receivedAt.toLocaleString()}\nSubject: ${message.subject}\nTo: ${message.to.map(to => to.email).join(', ')}\n\n${message.body.text}`,
        html: `<br><br>---------- Forwarded message ----------<br><strong>From:</strong> ${message.from.name || message.from.email}<br><strong>Date:</strong> ${message.receivedAt.toLocaleString()}<br><strong>Subject:</strong> ${message.subject}<br><strong>To:</strong> ${message.to.map(to => to.email).join(', ')}<br><br>${message.body.html}`
      },
      forwardMessageId: message.id
    })
    setComposerMode('forward')
    setShowComposer(true)
  }

  const handleDelete = async (message: MailMessage) => {
    try {
      await deleteMessage(message.id)
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleMarkRead = async (message: MailMessage, isRead: boolean) => {
    try {
      await markAsRead(message.id, isRead)
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleMarkStarred = async (message: MailMessage, isStarred: boolean) => {
    try {
      await markAsStarred(message.id, isStarred)
    } catch (error) {
      console.error('Error starring message:', error)
    }
  }

  const handleNewMessage = () => {
    setComposerInitialData({
      accountId: currentAccount?.id || '',
      to: [],
      subject: '',
      body: { text: '', html: '' }
    })
    setComposerMode('new')
    setShowComposer(true)
  }

  const handleSendMessage = async (messageData: MailComposerData) => {
    try {
      await sendMessage(messageData)
      setShowComposer(false)
      setComposerInitialData(undefined)
      
      // Recargar mensajes para mostrar el mensaje enviado
      if (currentAccount) {
        loadMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const handleSaveDraft = async (messageData: MailComposerData) => {
    try {
      // TODO: Implementar guardado de borrador
      console.log('Saving draft:', messageData)
    } catch (error) {
      console.error('Error saving draft:', error)
      throw error
    }
  }

  const handleComposerCancel = () => {
    setShowComposer(false)
    setComposerInitialData(undefined)
  }

  const handleAccountAdded = () => {
    setShowAccountSetup(false)
  }

  if (showAccountSetup) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`} style={{ height: '700px' }}>
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl text-white">📧</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Configurar Sistema de Correo
              </h1>
              <p className="text-gray-600">
                Agrega tu primera cuenta de correo para empezar a gestionar tus mensajes
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">💡 Tip:</span> Soportamos Gmail, Outlook, Yahoo y otros proveedores IMAP/SMTP
                </p>
              </div>
            </div>
            <AccountSetup
              onAccountAdded={handleAccountAdded}
              onCancel={() => setShowAccountSetup(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`} style={{ height: '700px' }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <button
            onClick={handleNewMessage}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            ✉️ Nuevo Mensaje
          </button>
          
          {/* Estado de conexión */}
          <ConnectionStatus className="w-full" />
        </div>
        <MailSidebar className="flex-1" />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Message List */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          <div className="h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">
                {currentAccount ? (
                  <>
                    📥 {currentAccount.name}
                    <span className="text-sm text-gray-500 block">
                      {currentAccount.email}
                    </span>
                  </>
                ) : (
                  'Selecciona una cuenta'
                )}
              </h2>
            </div>
            <MailList
              messages={messages}
              currentMessage={selectedMessage}
              onMessageSelect={handleMessageSelect}
              isLoading={isLoading}
              className="h-full"
            />
          </div>
        </div>

        {/* Message Viewer */}
        <div className="flex-1 bg-white">
          <MailViewer
            message={selectedMessage}
            onReply={handleReply}
            onReplyAll={handleReplyAll}
            onForward={handleForward}
            onDelete={handleDelete}
            onMarkRead={handleMarkRead}
            onMarkStarred={handleMarkStarred}
            className="h-full"
          />
        </div>
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <MailComposer
              initialData={composerInitialData}
              mode={composerMode}
              onSend={handleSendMessage}
              onSaveDraft={handleSaveDraft}
              onCancel={handleComposerCancel}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">Cargando...</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}