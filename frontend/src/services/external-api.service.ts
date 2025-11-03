import { ApiService } from '@/lib/api-client'
import { 
  IntegrationConfig,
  HttpRequestConfig,
  AuthenticationConfig,
  RetryConfig,
  ApiExecutionResponse
} from '@/types'

class ExternalApiService extends ApiService {
  constructor() {
    super('/api/external-api')
  }

  // Execute custom requests
  async executeCustomRequest(data: {
    config: HttpRequestConfig
    auth_config?: AuthenticationConfig
    retry_config?: RetryConfig
  }): Promise<ApiExecutionResponse> {
    return this.post<ApiExecutionResponse>('/execute', data)
  }

  // Integration management
  async getIntegrations(): Promise<any[]> {
    return this.get<any[]>('/integrations')
  }

  async getIntegration(name: string): Promise<any> {
    return this.get<any>(`/integrations/${name}`)
  }

  async registerIntegration(integration: IntegrationConfig): Promise<any> {
    return this.post<any>('/integrations', integration)
  }

  async updateIntegration(name: string, integration: Partial<IntegrationConfig>): Promise<any> {
    return this.put<any>(`/integrations/${name}`, integration)
  }

  async deleteIntegration(name: string): Promise<void> {
    return this.delete<void>(`/integrations/${name}`)
  }

  // Execute registered integrations
  async executeIntegration(
    name: string, 
    variables?: Record<string, any>
  ): Promise<ApiExecutionResponse> {
    return this.post<ApiExecutionResponse>(`/integrations/${name}/execute`, { variables })
  }

  // Test integrations
  async testIntegration(name: string): Promise<{
    integration_name: string
    test_successful: boolean
    status_code?: number
    error?: string
    response_time?: string
    test_timestamp: string
  }> {
    return this.post(`/integrations/${name}/test`)
  }

  // Integration examples and templates
  async getIntegrationExamples(): Promise<Record<string, any>> {
    return this.get<Record<string, any>>('/examples')
  }

  async getIntegrationTemplates(): Promise<any[]> {
    return this.get<any[]>('/templates')
  }

  // Webhook management
  async createWebhook(data: {
    name: string
    url: string
    events: string[]
    secret?: string
    is_active: boolean
  }) {
    return this.post('/webhooks', data)
  }

  async getWebhooks(): Promise<any[]> {
    return this.get<any[]>('/webhooks')
  }

  async updateWebhook(id: string, data: any) {
    return this.put(`/webhooks/${id}`, data)
  }

  async deleteWebhook(id: string): Promise<void> {
    return this.delete<void>(`/webhooks/${id}`)
  }

  // Integration monitoring
  async getIntegrationLogs(
    integrationName?: string,
    limit?: number,
    offset?: number
  ) {
    const params = {
      ...(integrationName && { integration_name: integrationName }),
      ...(limit && { limit }),
      ...(offset && { offset })
    }
    return this.get('/logs', params)
  }

  async getIntegrationMetrics(integrationName: string) {
    return this.get(`/metrics/${integrationName}`)
  }

  // API key management
  async generateApiKey(data: {
    name: string
    permissions: string[]
    expires_at?: string
  }) {
    return this.post('/api-keys', data)
  }

  async getApiKeys(): Promise<any[]> {
    return this.get<any[]>('/api-keys')
  }

  async revokeApiKey(keyId: string): Promise<void> {
    return this.delete<void>(`/api-keys/${keyId}`)
  }
}

export const externalApiService = new ExternalApiService()