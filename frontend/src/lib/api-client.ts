import axios, { AxiosError, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error)
    
    // Handle common errors
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.')
    } else if (error.response?.status === 404) {
      toast.error('Recurso no encontrado.')
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde.')
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Error de conexión. Verifica tu conexión a internet.')
    } else {
      const message = error.response?.data?.detail || error.message || 'Error desconocido'
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Generic API service class
export class ApiService {
  protected baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await apiClient.get(`${this.baseUrl}${endpoint}`, { params })
    return response.data
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.post(`${this.baseUrl}${endpoint}`, data)
    return response.data
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.put(`${this.baseUrl}${endpoint}`, data)
    return response.data
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.patch(`${this.baseUrl}${endpoint}`, data)
    return response.data
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await apiClient.delete(`${this.baseUrl}${endpoint}`)
    return response.data
  }
}

export default apiClient