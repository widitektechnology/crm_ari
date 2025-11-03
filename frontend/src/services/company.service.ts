import { ApiService } from '@/lib/api-client'
import { 
  Company, 
  CreateCompanyRequest, 
  UpdateCompanyRequest,
  PaginatedResponse,
  FilterOptions,
  SortOptions,
  PaginationOptions 
} from '@/types'

class CompanyService extends ApiService {
  constructor() {
    super('/api/companies')
  }

  async getCompanies(
    pagination?: PaginationOptions,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<PaginatedResponse<Company>> {
    const params = {
      ...(pagination && { page: pagination.page, per_page: pagination.per_page }),
      ...(filters && filters),
      ...(sort && { sort_by: sort.field, order: sort.order })
    }
    
    return this.get<PaginatedResponse<Company>>('', params)
  }

  async getCompany(id: number): Promise<Company> {
    return this.get<Company>(`/${id}`)
  }

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    return this.post<Company>('', data)
  }

  async updateCompany(id: number, data: UpdateCompanyRequest): Promise<Company> {
    return this.put<Company>(`/${id}`, data)
  }

  async deleteCompany(id: number): Promise<void> {
    return this.delete<void>(`/${id}`)
  }

  async getCompanyStats(id: number) {
    return this.get(`/${id}/stats`)
  }
}

export const companyService = new CompanyService()