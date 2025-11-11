import axios from 'axios'

// Configuración base de la API - FORZAR HTTPS SIEMPRE
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api` 
  : 'https://crm.arifamilyassets.com/api'  // HARDCODED HTTPS

// Doble seguridad: asegurar que siempre sea HTTPS
const SECURE_API_BASE_URL = API_BASE_URL.replace(/^http:/, 'https:')

console.log('🔧 API_BASE_URL configurada:', SECURE_API_BASE_URL)

// Crear instancia de axios
const api = axios.create({
  baseURL: SECURE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken')
      localStorage.removeItem('tokenType')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Funciones de la API
export const apiService = {
  // Verificar salud del backend
  checkHealth: async () => {
    // Health endpoint - FORZAR HTTPS SIEMPRE
    const healthUrl = import.meta.env.VITE_API_BASE_URL 
      ? `${import.meta.env.VITE_API_BASE_URL}/health`
      : 'https://crm.arifamilyassets.com/health'  // HARDCODED HTTPS
    
    // Doble seguridad: forzar HTTPS
    const secureHealthUrl = healthUrl.replace(/^http:/, 'https:')
    
    console.log('🩺 Verificando salud en:', secureHealthUrl)
    const response = await axios.get(secureHealthUrl, { timeout: 5000 })
    return response.data
  },

  // Autenticación
  login: async (username: string, password: string) => {
    const response = await api.post('/token', 
      new URLSearchParams({
        username,
        password,
        grant_type: 'password'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    return response.data
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  // Empresas
  getCompanies: async () => {
    const response = await api.get('/companies')
    return response.data
  },

  createCompany: async (company: any) => {
    const response = await api.post('/companies', company)
    return response.data
  },

  updateCompany: async (id: string, company: any) => {
    const response = await api.put(`/companies/${id}`, company)
    return response.data
  },

  deleteCompany: async (id: string) => {
    const response = await api.delete(`/companies/${id}`)
    return response.data
  },

  // Empleados  
  getEmployees: async () => {
    const response = await api.get('/employees')
    return response.data
  },

  createEmployee: async (employee: any) => {
    const response = await api.post('/employees', employee)
    return response.data
  },

  updateEmployee: async (id: string, employee: any) => {
    const response = await api.put(`/employees/${id}`, employee)
    return response.data
  },

  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`)
    return response.data
  },
}

export default api