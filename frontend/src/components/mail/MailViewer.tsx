import { useState } from 'react'
import type { MailViewerProps } from '../../types/mail'

export default function MailViewer({
  message,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onMarkRead,
  onMarkStarred,
  className = ''
}: MailViewerProps) {
  const [showFullHeaders, setShowFullHeaders] = useState(false)
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html')

  if (!message) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📧</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona un mensaje
          </h3>
          <p className="text-gray-500">
            Elige un mensaje de la lista para verlo aquí
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleMarkReadToggle = () => {
    onMarkRead(message, !message.isRead)
  }

  const handleMarkStarredToggle = () => {
    onMarkStarred(message, !message.isStarred)
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      onDelete(message)
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReply(message)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ↩️ Responder
            </button>
            <button
              onClick={() => onReplyAll(message)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ↩️📧 Responder a todos
            </button>
            <button
              onClick={() => onForward(message)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ➡️ Reenviar
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkStarredToggle}
              className={`p-2 rounded-md ${
                message.isStarred 
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
              }`}
            >
              ⭐
            </button>
            <button
              onClick={handleMarkReadToggle}
              className={`p-2 rounded-md ${
                message.isRead 
                  ? 'text-gray-400 hover:text-blue-500 hover:bg-gray-50' 
                  : 'text-blue-500 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              {message.isRead ? '📧' : '✉️'}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Subject */}
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          {message.subject || '(Sin asunto)'}
        </h1>

        {/* Message info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {message.from.avatar || message.from.name?.charAt(0).toUpperCase() || message.from.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-gray-900">
                    {message.from.name || message.from.email}
                  </p>
                  {message.from.email !== message.from.name && (
                    <p className="text-sm text-gray-500">
                      &lt;{message.from.email}&gt;
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Para:</span>{' '}
                    {message.to.map(to => to.name || to.email).join(', ')}
                  </p>
                  {message.cc && message.cc.length > 0 && (
                    <p>
                      <span className="font-medium">CC:</span>{' '}
                      {message.cc.map(cc => cc.name || cc.email).join(', ')}
                    </p>
                  )}
                  <p className="mt-1">
                    <span className="font-medium">Fecha:</span>{' '}
                    {formatDate(message.receivedAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowFullHeaders(!showFullHeaders)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showFullHeaders ? 'Ocultar detalles' : 'Mostrar detalles'}
            </button>
          </div>

          {/* Full headers */}
          {showFullHeaders && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">ID del mensaje:</span>
                    <p className="text-xs font-mono break-all">{message.messageId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tamaño:</span>
                    <p>{formatFileSize(message.size)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Carpeta:</span>
                    <p>{message.folderId}</p>
                  </div>
                </div>
                {message.labels.length > 0 && (
                  <div>
                    <span className="font-medium">Etiquetas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.labels.map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Archivos adjuntos ({message.attachments.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-blue-600">📎</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* View mode toggle */}
          {message.body.html && message.body.text && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">Ver como:</span>
              <button
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'html'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'text'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Texto plano
              </button>
            </div>
          )}

          {/* Message body */}
          <div className="bg-white">
            {viewMode === 'html' && message.body.html ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: message.body.html }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {message.body.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}