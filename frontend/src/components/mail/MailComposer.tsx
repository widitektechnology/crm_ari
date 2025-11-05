import { useState, useEffect } from 'react'
import type { MailComposerProps, MailComposerData, MailContact } from '../../types/mail'

export default function MailComposer({
  initialData,
  mode,
  onSend,
  onSaveDraft,
  onCancel,
  className = ''
}: MailComposerProps) {
  const [formData, setFormData] = useState<MailComposerData>({
    accountId: '',
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: { text: '', html: '' },
    attachments: [],
    priority: 'normal',
    requestReadReceipt: false,
    isDraft: false
  })

  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [toInput, setToInput] = useState('')
  const [ccInput, setCcInput] = useState('')
  const [bccInput, setBccInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
      
      if (initialData.cc && initialData.cc.length > 0) {
        setShowCC(true)
      }
      if (initialData.bcc && initialData.bcc.length > 0) {
        setShowBCC(true)
      }
    }
  }, [initialData])

  const parseEmails = (input: string): MailContact[] => {
    if (!input.trim()) return []
    
    return input.split(',').map(email => {
      const trimmed = email.trim()
      const match = trimmed.match(/^(.+?)\s*<(.+?)>$/)
      
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() }
      } else {
        return { email: trimmed }
      }
    }).filter(contact => contact.email)
  }

  const formatContacts = (contacts: MailContact[]): string => {
    return contacts.map(contact => 
      contact.name ? `${contact.name} <${contact.email}>` : contact.email
    ).join(', ')
  }

  const handleToChange = (value: string) => {
    setToInput(value)
    setFormData(prev => ({ ...prev, to: parseEmails(value) }))
  }

  const handleCcChange = (value: string) => {
    setCcInput(value)
    setFormData(prev => ({ ...prev, cc: parseEmails(value) }))
  }

  const handleBccChange = (value: string) => {
    setBccInput(value)
    setFormData(prev => ({ ...prev, bcc: parseEmails(value) }))
  }

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }))
  }

  const handleBodyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      body: {
        text: value,
        html: value.replace(/\n/g, '<br>')
      }
    }))
  }

  const handleSend = async () => {
    if (!formData.to.length) {
      alert('Debes especificar al menos un destinatario')
      return
    }

    setIsSending(true)
    try {
      await onSend(formData)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await onSaveDraft({ ...formData, isDraft: true })
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Error al guardar el borrador')
    }
  }

  const getModeTitle = () => {
    switch (mode) {
      case 'reply': return 'Responder'
      case 'reply-all': return 'Responder a todos'
      case 'forward': return 'Reenviar'
      case 'draft': return 'Editar borrador'
      default: return 'Nuevo mensaje'
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {getModeTitle()}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Recipients */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* To */}
          <div className="flex items-center">
            <label className="w-16 text-sm font-medium text-gray-700">Para:</label>
            <input
              type="text"
              value={toInput || formatContacts(formData.to)}
              onChange={(e) => handleToChange(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="destinatario@ejemplo.com"
            />
            <div className="ml-3 flex items-center space-x-2">
              <button
                onClick={() => setShowCC(!showCC)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                CC
              </button>
              <button
                onClick={() => setShowBCC(!showBCC)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                CCO
              </button>
            </div>
          </div>

          {/* CC */}
          {showCC && (
            <div className="flex items-center">
              <label className="w-16 text-sm font-medium text-gray-700">CC:</label>
              <input
                type="text"
                value={ccInput || formatContacts(formData.cc || [])}
                onChange={(e) => handleCcChange(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="copia@ejemplo.com"
              />
            </div>
          )}

          {/* BCC */}
          {showBCC && (
            <div className="flex items-center">
              <label className="w-16 text-sm font-medium text-gray-700">CCO:</label>
              <input
                type="text"
                value={bccInput || formatContacts(formData.bcc || [])}
                onChange={(e) => handleBccChange(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="copia.oculta@ejemplo.com"
              />
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center">
            <label className="w-16 text-sm font-medium text-gray-700">Asunto:</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Asunto del mensaje"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={formData.body.text}
            onChange={(e) => handleBodyChange(e.target.value)}
            className="flex-1 p-4 text-sm border-none resize-none focus:outline-none"
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>

        {/* Attachments */}
        {formData.attachments.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Archivos adjuntos ({formData.attachments.length})
            </h4>
            <div className="space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">📎</span>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700 text-sm">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSend}
                disabled={isSending || !formData.to.length}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  '📤 Enviar'
                )}
              </button>
              
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                💾 Guardar borrador
              </button>

              <input
                type="file"
                multiple
                className="hidden"
                id="attachments"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setFormData(prev => ({
                    ...prev,
                    attachments: [...prev.attachments, ...files]
                  }))
                }}
              />
              <label
                htmlFor="attachments"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                📎 Adjuntar
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'low' | 'normal' | 'high' 
                }))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Prioridad baja</option>
                <option value="normal">Prioridad normal</option>
                <option value="high">Prioridad alta</option>
              </select>

              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.requestReadReceipt}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requestReadReceipt: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Solicitar confirmación de lectura</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}