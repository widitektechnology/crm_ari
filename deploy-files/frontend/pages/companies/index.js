import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/layout/Layout'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

// Componente para la tabla de empresas
function CompaniesTable({ companies, onEdit, onDelete, onToggleStatus }) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empresas</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva empresa.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empresa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NIF/CIF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              País
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Moneda
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">Creada: {new Date(company.created_at).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {company.tax_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {company.country_code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {company.currency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleStatus(company)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  } transition-colors cursor-pointer`}
                >
                  {company.status === 'active' ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Inactiva
                    </>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(company)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(company)}
                  className="text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Componente para el formulario de empresa
function CompanyForm({ company, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    country_code: 'ES',
    currency: 'EUR'
  })

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        tax_id: company.tax_id || '',
        country_code: company.country_code || 'ES',
        currency: company.currency || 'EUR'
      })
    } else {
      setFormData({
        name: '',
        tax_id: '',
        country_code: 'ES',
        currency: 'EUR'
      })
    }
  }, [company])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {company ? 'Editar Empresa' : 'Nueva Empresa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NIF/CIF</label>
              <input
                type="text"
                required
                value={formData.tax_id}
                onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">País</label>
              <select
                value={formData.country_code}
                onChange={(e) => setFormData({...formData, country_code: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ES">España</option>
                <option value="FR">Francia</option>
                <option value="DE">Alemania</option>
                <option value="IT">Italia</option>
                <option value="PT">Portugal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Moneda</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dólar</option>
                <option value="GBP">GBP - Libra</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {company ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  // Datos simulados (en producción vendrían de la API)
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        // Aquí llamarías a tu endpoint real: /api/companies
        // const response = await fetch('/api/companies')
        // const data = await response.json()
        
        // Por ahora simulamos los datos
        setTimeout(() => {
          setCompanies([
            {
              id: 1,
              name: 'ARI Family Assets S.L.',
              tax_id: 'B12345678',
              country_code: 'ES',
              currency: 'EUR',
              status: 'active',
              created_at: '2024-01-15T10:00:00Z'
            },
            {
              id: 2,
              name: 'TechCorp Solutions',
              tax_id: 'A87654321',
              country_code: 'ES',
              currency: 'EUR',
              status: 'active',
              created_at: '2024-02-01T14:30:00Z'
            },
            {
              id: 3,
              name: 'Global Services Ltd',
              tax_id: 'C11223344',
              country_code: 'FR',
              currency: 'EUR',
              status: 'inactive',
              created_at: '2024-01-20T09:15:00Z'
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error cargando empresas:', error)
        setLoading(false)
      }
    }

    loadCompanies()
  }, [])

  const handleCreate = () => {
    setEditingCompany(null)
    setShowForm(true)
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setShowForm(true)
  }

  const handleDelete = async (company) => {
    if (confirm(`¿Estás seguro de que quieres eliminar ${company.name}?`)) {
      try {
        // Aquí llamarías a tu endpoint: DELETE /api/companies/{id}
        // await fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
        
        setCompanies(companies.filter(c => c.id !== company.id))
      } catch (error) {
        console.error('Error eliminando empresa:', error)
      }
    }
  }

  const handleToggleStatus = async (company) => {
    try {
      const newStatus = company.status === 'active' ? 'inactive' : 'active'
      
      // Aquí llamarías a tu endpoint: POST /api/companies/{id}/activate o /deactivate
      // await fetch(`/api/companies/${company.id}/${newStatus === 'active' ? 'activate' : 'deactivate'}`, { method: 'POST' })
      
      setCompanies(companies.map(c => 
        c.id === company.id ? { ...c, status: newStatus } : c
      ))
    } catch (error) {
      console.error('Error cambiando estado:', error)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingCompany) {
        // Actualizar empresa existente
        // const response = await fetch(`/api/companies/${editingCompany.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // })
        
        setCompanies(companies.map(c => 
          c.id === editingCompany.id ? { ...c, ...formData } : c
        ))
      } else {
        // Crear nueva empresa
        // const response = await fetch('/api/companies', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // })
        
        const newCompany = {
          id: Date.now(),
          ...formData,
          status: 'active',
          created_at: new Date().toISOString()
        }
        setCompanies([...companies, newCompany])
      }
      
      setShowForm(false)
      setEditingCompany(null)
    } catch (error) {
      console.error('Error guardando empresa:', error)
    }
  }

  return (
    <>
      <Head>
        <title>Empresas - CRM System</title>
        <meta name="description" content="Gestión de empresas del CRM" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona las empresas registradas en el sistema
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Empresa
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Empresas</p>
                    <p className="text-2xl font-semibold text-gray-900">{companies.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {companies.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Inactivas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {companies.filter(c => c.status === 'inactive').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de empresas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lista de Empresas</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando empresas...</p>
                </div>
              ) : (
                <CompaniesTable
                  companies={companies}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              )}
            </div>
          </div>
        </div>

        {/* Formulario modal */}
        <CompanyForm
          company={editingCompany}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingCompany(null)
          }}
          onSubmit={handleSubmit}
        />
      </Layout>
    </>
  )
}