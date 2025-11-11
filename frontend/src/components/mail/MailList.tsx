import type { MailListProps } from '../../types/mail'

export default function MailList({ 
  messages, 
  currentMessage, 
  onMessageSelect, 
  isLoading = false,
  className = '' 
}: MailListProps) {

  const formatDate = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    
    // Si es hoy, mostrar solo la hora
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    // Si es esta semana, mostrar el día
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString('es-ES', { weekday: 'short' })
    }
    
    // Si es más antiguo, mostrar la fecha
    return messageDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Verificación de seguridad: asegurar que messages sea un array
  const safeMessages = Array.isArray(messages) ? messages : []

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  if (safeMessages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📭</span>
          </div>
          <p className="text-gray-500 font-medium">No hay mensajes</p>
          <p className="text-gray-400 text-sm">Tu bandeja de entrada está vacía</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-y-auto ${className}`}>
      <div className="divide-y divide-gray-100">
        {safeMessages.map((message) => {
          const isSelected = currentMessage?.id === message.id
          const isUnread = !message.isRead
          
          return (
            <div
              key={message.id}
              className={`p-4 cursor-pointer transition-all duration-150 hover:bg-gray-50 ${
                isSelected 
                  ? 'bg-blue-50 border-r-4 border-blue-500' 
                  : isUnread 
                    ? 'bg-white' 
                    : 'bg-gray-25'
              }`}
              onClick={() => onMessageSelect(message)}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar del remitente */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUnread ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  <span className="text-white text-sm font-medium">
                    {message.from.avatar || message.from.name?.charAt(0).toUpperCase() || message.from.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Header del mensaje */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm truncate ${
                        isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                      }`}>
                        {message.from.name || message.from.email}
                      </p>
                      
                      {/* Indicadores */}
                      <div className="flex items-center space-x-1">
                        {message.isStarred && (
                          <span className="text-yellow-400 text-xs">⭐</span>
                        )}
                        {message.isFlagged && (
                          <span className="text-red-500 text-xs">🚩</span>
                        )}
                        {message.isImportant && (
                          <span className="text-orange-500 text-xs">❗</span>
                        )}
                        {message.hasAttachments && (
                          <span className="text-gray-500 text-xs">📎</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {formatDate(message.receivedAt)}
                    </div>
                  </div>
                  
                  {/* Asunto */}
                  <h3 className={`text-sm mb-1 truncate ${
                    isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
                  }`}>
                    {message.subject || '(Sin asunto)'}
                  </h3>
                  
                  {/* Preview del contenido */}
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {message.snippet}
                  </p>
                  
                  {/* Footer del mensaje */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {/* Labels */}
                      {message.labels.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {message.labels.slice(0, 2).map((label, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {label}
                            </span>
                          ))}
                          {message.labels.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{message.labels.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {message.hasAttachments && (
                        <span>📎 {message.attachments.length}</span>
                      )}
                      <span>{formatFileSize(message.size)}</span>
                      {isUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}