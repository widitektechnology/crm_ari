// Tipos de autenticación
export interface User {
  id: string
  username: string
  email?: string
  full_name?: string
  is_active: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

// Tipos de empresa
export interface Company {
  id: string
  name: string
  description?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface CreateCompanyData {
  name: string
  description?: string
  email?: string
  phone?: string
  address?: string
  website?: string
}

// Tipos de empleado
export interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  position?: string
  department?: string
  salary?: number
  hire_date?: string
  company_id?: string
  company?: Company
  created_at: string
  updated_at: string
}

export interface CreateEmployeeData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  position?: string
  department?: string
  salary?: number
  hire_date?: string
  company_id?: string
}

// Tipos de contexto de autenticación
export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

// Tipos de API
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  detail?: string
  status: number
}

// Tipos de componentes
export interface ProtectedRouteProps {
  children: React.ReactNode
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

// Tipos de estado
export interface AppState {
  companies: Company[]
  employees: Employee[]
  loading: boolean
  error: string | null
}