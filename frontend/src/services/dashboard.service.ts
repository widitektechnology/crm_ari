import { ApiService } from '@/lib/api-client'
import { DashboardStats, Activity } from '@/types'

class DashboardService extends ApiService {
  constructor() {
    super('/api')
  }

  async getDashboardStats(companyId?: number): Promise<DashboardStats> {
    // Since we don't have a specific dashboard endpoint in the backend,
    // we'll aggregate data from multiple services
    const params = companyId ? { company_id: companyId } : {}
    
    // This would typically be a single endpoint call
    // For now, we'll simulate the response structure
    return {
      total_companies: 5,
      total_employees: 45,
      total_invoices: 128,
      monthly_revenue: 125000,
      pending_invoices: 12,
      active_integrations: 8,
      ai_classifications: 1250,
      recent_activities: [
        {
          id: '1',
          type: 'invoice_created',
          description: 'Nueva factura creada para Cliente ABC',
          timestamp: new Date().toISOString(),
          user: 'Admin',
          entity_type: 'invoice',
          entity_id: '128'
        },
        {
          id: '2',
          type: 'employee_added',
          description: 'Nuevo empleado Juan Pérez agregado',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'HR Manager',
          entity_type: 'employee',
          entity_id: '45'
        },
        {
          id: '3',
          type: 'email_classified',
          description: 'Email clasificado automáticamente como "Soporte"',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'AI System',
          entity_type: 'email',
          entity_id: '1250'
        }
      ]
    }
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    const params = { limit }
    
    // Simulate recent activities
    return [
      {
        id: '1',
        type: 'invoice_created',
        description: 'Nueva factura creada para Cliente ABC',
        timestamp: new Date().toISOString(),
        user: 'Admin',
        entity_type: 'invoice',
        entity_id: '128'
      },
      {
        id: '2',
        type: 'employee_added',
        description: 'Nuevo empleado Juan Pérez agregado',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'HR Manager',
        entity_type: 'employee',
        entity_id: '45'
      },
      {
        id: '3',
        type: 'email_classified',
        description: 'Email clasificado automáticamente como "Soporte"',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'AI System',
        entity_type: 'email',
        entity_id: '1250'
      },
      {
        id: '4',
        type: 'integration_executed',
        description: 'Integración CRM ejecutada exitosamente',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        user: 'System',
        entity_type: 'integration',
        entity_id: 'crm_contact_fetch'
      },
      {
        id: '5',
        type: 'payroll_calculated',
        description: 'Nómina calculada para el departamento de Ventas',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        user: 'Payroll Manager',
        entity_type: 'payroll',
        entity_id: 'sales_dept_jan_2024'
      }
    ]
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    services: Array<{
      name: string
      status: 'up' | 'down' | 'degraded'
      response_time?: number
      last_check: string
    }>
  }> {
    return {
      status: 'healthy',
      services: [
        {
          name: 'Database',
          status: 'up',
          response_time: 45,
          last_check: new Date().toISOString()
        },
        {
          name: 'AI Services',
          status: 'up',
          response_time: 120,
          last_check: new Date().toISOString()
        },
        {
          name: 'External APIs',
          status: 'up',
          response_time: 200,
          last_check: new Date().toISOString()
        },
        {
          name: 'Email Service',
          status: 'up',
          response_time: 80,
          last_check: new Date().toISOString()
        }
      ]
    }
  }
}

export const dashboardService = new DashboardService()