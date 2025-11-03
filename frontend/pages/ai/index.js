import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/layout/Layout'
import { 
  SparklesIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CogIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

// Componente para clasificación de emails
function EmailClassifier() {
  const [emailText, setEmailText] = useState('')
  const [subject, setSubject] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleClassify = async () => {
    if (!emailText.trim()) return

    setLoading(true)
    try {
      // Aquí llamarías a tu endpoint real: POST /api/ai/classify-email
      // const response = await fetch('/api/ai/classify-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email_content: emailText,
      //     subject: subject,
      //     sender_email: senderEmail
      //   })
      // })
      // const data = await response.json()

      // Simulamos la respuesta
      setTimeout(() => {
        setResult({
          predicted_category: 'soporte_tecnico',
          confidence: 0.87,
          probabilities: {
            soporte_tecnico: 0.87,
            finanzas: 0.08,
            ventas: 0.03,
            recursos_humanos: 0.01,
            general: 0.01
          },
          processing_time: 0.245
        })
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error clasificando email:', error)
      setLoading(false)
    }
  }

  const getCategoryName = (category) => {
    const names = {
      soporte_tecnico: 'Soporte Técnico',
      finanzas: 'Finanzas',
      ventas: 'Ventas',
      recursos_humanos: 'Recursos Humanos',
      general: 'General'
    }
    return names[category] || category
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-600" />
          Clasificación de Emails
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Clasifica automáticamente emails por departamento usando IA
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Asunto del Email</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Problema con el servidor..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email del Remitente</label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="cliente@empresa.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contenido del Email</label>
          <textarea
            rows={6}
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Escribe aquí el contenido del email que quieres clasificar..."
          />
        </div>
        <button
          onClick={handleClassify}
          disabled={!emailText.trim() || loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
              Clasificando...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Clasificar Email
            </>
          )}
        </button>

        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Resultado de la Clasificación</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categoría Predicha:</span>
                <span className="font-medium text-blue-600">{getCategoryName(result.predicted_category)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confianza:</span>
                <span className="font-medium text-green-600">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-2">Probabilidades por Categoría:</span>
                <div className="space-y-1">
                  {Object.entries(result.probabilities).map(([category, prob]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{getCategoryName(category)}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${prob * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">{(prob * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">Tiempo de procesamiento:</span>
                <span className="text-xs text-gray-500">{result.processing_time}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para chat con IA
function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '¡Hola! Soy tu asistente de IA para el CRM. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      // Aquí llamarías a tu endpoint real: POST /api/ai/chat
      // const response = await fetch('/api/ai/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: inputMessage })
      // })
      // const data = await response.json()

      // Simulamos la respuesta
      setTimeout(() => {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Entiendo tu consulta sobre "${inputMessage}". Como asistente del CRM, puedo ayudarte con:\n\n• Información sobre empleados y empresas\n• Estadísticas de facturación\n• Análisis de datos del sistema\n• Automatización de tareas\n\n¿Te gustaría que profundice en algún tema específico?`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-purple-600" />
          Chat con IA
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Conversa con el asistente inteligente del CRM
        </p>
      </div>
      <div className="flex flex-col h-96">
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">Escribiendo...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
              placeholder="Escribe tu mensaje..."
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para estadísticas de IA
function AIAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Aquí llamarías a tus endpoints reales:
        // const classificationResponse = await fetch('/api/ai/analytics/classification')
        // const responsesResponse = await fetch('/api/ai/analytics/responses')
        
        setTimeout(() => {
          setAnalytics({
            classification: {
              total_classifications: 1247,
              category_distribution: {
                soporte_tecnico: 312,
                finanzas: 249,
                ventas: 374,
                recursos_humanos: 125,
                general: 187
              },
              accuracy: 0.89,
              average_confidence: 0.82
            },
            responses: {
              total_responses_generated: 1089,
              human_review_rate: 0.15,
              response_satisfaction: 0.92,
              average_response_time: 0.34
            }
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error cargando analytics:', error)
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
          Estadísticas de IA
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Estadísticas de clasificación */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Clasificación de Emails</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold text-blue-900">{analytics.classification.total_classifications}</p>
              <p className="text-xs text-blue-600">Emails Clasificados</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-900">{(analytics.classification.accuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-green-600">Precisión</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Distribución por Categoría</p>
            <div className="space-y-2">
              {Object.entries(analytics.classification.category_distribution).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / analytics.classification.total_classifications) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estadísticas de respuestas */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Generación de Respuestas</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-lg font-semibold text-purple-900">{analytics.responses.total_responses_generated}</p>
              <p className="text-xs text-purple-600">Respuestas Generadas</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-lg font-semibold text-yellow-900">{(analytics.responses.response_satisfaction * 100).toFixed(1)}%</p>
              <p className="text-xs text-yellow-600">Satisfacción</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{(analytics.responses.human_review_rate * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Requiere Revisión</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{analytics.responses.average_response_time}s</p>
              <p className="text-xs text-gray-600">Tiempo Promedio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AI() {
  return (
    <>
      <Head>
        <title>Herramientas IA - CRM System</title>
        <meta name="description" content="Herramientas de inteligencia artificial del CRM" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Encabezado */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Herramientas de IA</h1>
            <p className="mt-1 text-sm text-gray-500">
              Aprovecha la inteligencia artificial para automatizar tareas del CRM
            </p>
          </div>

          {/* Resumen de capacidades */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-lg">
            <div className="px-6 py-8 text-white">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-8 w-8 mr-3" />
                <h2 className="text-2xl font-bold">Sistema de IA Empresarial</h2>
              </div>
              <p className="text-purple-100 mb-6">
                Nuestro sistema de IA te ayuda a clasificar emails automáticamente, generar respuestas inteligentes 
                y obtener insights valiosos de tus datos empresariales.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <EnvelopeIcon className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold mb-1">Clasificación</h3>
                  <p className="text-sm text-purple-100">Clasifica emails por departamento automáticamente</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold mb-1">Asistente</h3>
                  <p className="text-sm text-purple-100">Chat inteligente para consultas del CRM</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <ChartBarIcon className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold mb-1">Analytics</h3>
                  <p className="text-sm text-purple-100">Estadísticas detalladas del rendimiento</p>
                </div>
              </div>
            </div>
          </div>

          {/* Herramientas principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clasificador de emails */}
            <EmailClassifier />
            
            {/* Chat con IA */}
            <AIChat />
          </div>

          {/* Estadísticas de IA */}
          <AIAnalytics />
        </div>
      </Layout>
    </>
  )
}