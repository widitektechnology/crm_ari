import { ApiService } from '@/lib/api-client'
import { 
  EmailClassificationRequest,
  EmailClassificationResponse,
  ChatRequest,
  ChatResponse,
  ChatMessage
} from '@/types'

class AIService extends ApiService {
  constructor() {
    super('/api/ai')
  }

  // Email classification
  async classifyEmail(data: EmailClassificationRequest): Promise<EmailClassificationResponse> {
    return this.post<EmailClassificationResponse>('/emails/classify', data)
  }

  async batchClassifyEmails(emails: EmailClassificationRequest[]): Promise<EmailClassificationResponse[]> {
    return this.post<EmailClassificationResponse[]>('/emails/classify-batch', { emails })
  }

  async getEmailClassificationStats(companyId?: number) {
    const params = companyId ? { company_id: companyId } : {}
    return this.get('/emails/stats', params)
  }

  // Conversational agent
  async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.post<ChatResponse>('/chat/message', data)
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`/chat/history/${sessionId}`)
  }

  async clearChatHistory(sessionId: string): Promise<void> {
    return this.delete<void>(`/chat/history/${sessionId}`)
  }

  async createChatSession(): Promise<{ session_id: string }> {
    return this.post<{ session_id: string }>('/chat/session')
  }

  // AI insights and suggestions
  async getBusinessInsights(companyId: number) {
    return this.get('/insights/business', { company_id: companyId })
  }

  async getPayrollInsights(companyId: number) {
    return this.get('/insights/payroll', { company_id: companyId })
  }

  async getFinanceInsights(companyId: number) {
    return this.get('/insights/finance', { company_id: companyId })
  }

  // Document processing
  async processDocument(data: {
    document_type: 'invoice' | 'receipt' | 'contract'
    file_url: string
    company_id: number
  }) {
    return this.post('/documents/process', data)
  }

  async getProcessedDocuments(companyId: number) {
    return this.get('/documents/processed', { company_id: companyId })
  }

  // Predictive analytics
  async getPredictiveAnalytics(data: {
    company_id: number
    analysis_type: 'revenue' | 'expenses' | 'cash_flow'
    period: string
  }) {
    return this.post('/analytics/predict', data)
  }

  // AI model training and configuration
  async getModelStatus() {
    return this.get('/models/status')
  }

  async retrainModel(modelType: 'email_classifier' | 'chat_agent') {
    return this.post(`/models/${modelType}/retrain`)
  }

  async getModelMetrics(modelType: 'email_classifier' | 'chat_agent') {
    return this.get(`/models/${modelType}/metrics`)
  }
}

export const aiService = new AIService()