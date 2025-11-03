import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/layout/Layout'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

// Componente para la tabla de empleados
function EmployeesTable({ employees, onEdit, onDelete }) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza añadiendo un nuevo empleado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empleado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departamento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Puesto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Ingreso
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
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      {employee.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.employee_code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.department || 'Sin asignar'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.position || 'Sin asignar'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                {new Date(employee.hire_date).toLocaleDateString('es-ES')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(employee)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(employee)}
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

// Componente para el formulario de empleado
function EmployeeForm({ employee, companies, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    company_id: 1,
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    hire_date: '',
    department: '',
    position: ''
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        company_id: employee.company_id || 1,
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        hire_date: employee.hire_date || '',
        department: employee.department || '',
        position: employee.position || ''
      })
    } else {
      setFormData({
        company_id: 1,
        employee_code: '',
        first_name: '',
        last_name: '',
        email: '',
        hire_date: '',
        department: '',
        position: ''
      })
    }
  }, [employee])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({...formData, company_id: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Empleado</label>
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="EMP001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
              <input
                type="date"
                required
                value={formData.hire_date}
                onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Departamento</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccionar departamento</option>
                <option value="Administración">Administración</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="IT">IT</option>
                <option value="Ventas">Ventas</option>
                <option value="Marketing">Marketing</option>
                <option value="Operaciones">Operaciones</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Puesto</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Desarrollador, Analista, etc."
              />
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
                {employee ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  // Datos simulados (en producción vendrían de la API)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Aquí llamarías a tus endpoints reales:
        // const employeesResponse = await fetch('/api/payroll/employees')
        // const companiesResponse = await fetch('/api/companies')
        
        // Por ahora simulamos los datos
        setTimeout(() => {
          setCompanies([
            { id: 1, name: 'ARI Family Assets S.L.' },
            { id: 2, name: 'TechCorp Solutions' },
            { id: 3, name: 'Global Services Ltd' }
          ])

          setEmployees([
            {
              id: 1,
              company_id: 1,
              employee_code: 'EMP001',
              first_name: 'Juan',
              last_name: 'Pérez García',
              email: 'juan.perez@company.com',
              hire_date: '2024-01-15',
              department: 'IT',
              position: 'Desarrollador Senior',
              status: 'active',
              created_at: '2024-01-15T10:00:00Z'
            },
            {
              id: 2,
              company_id: 1,
              employee_code: 'EMP002',
              first_name: 'María',
              last_name: 'González López',
              email: 'maria.gonzalez@company.com',
              hire_date: '2024-02-01',
              department: 'Finanzas',
              position: 'Contable',
              status: 'active',
              created_at: '2024-02-01T09:30:00Z'
            },
            {
              id: 3,
              company_id: 2,
              employee_code: 'EMP003',
              first_name: 'Carlos',
              last_name: 'Martín Ruiz',
              email: 'carlos.martin@techcorp.com',
              hire_date: '2024-01-20',
              department: 'Ventas',
              position: 'Account Manager',
              status: 'active',
              created_at: '2024-01-20T14:15:00Z'
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error cargando datos:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = () => {
    setEditingEmployee(null)
    setShowForm(true)
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const handleDelete = async (employee) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${employee.first_name} ${employee.last_name}?`)) {
      try {
        // Aquí llamarías a tu endpoint: DELETE /api/payroll/employees/{id}
        setEmployees(employees.filter(e => e.id !== employee.id))
      } catch (error) {
        console.error('Error eliminando empleado:', error)
      }
    }
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingEmployee) {
        // Actualizar empleado existente
        setEmployees(employees.map(e => 
          e.id === editingEmployee.id ? { ...e, ...formData } : e
        ))
      } else {
        // Crear nuevo empleado
        const newEmployee = {
          id: Date.now(),
          ...formData,
          status: 'active',
          created_at: new Date().toISOString()
        }
        setEmployees([...employees, newEmployee])
      }
      
      setShowForm(false)
      setEditingEmployee(null)
    } catch (error) {
      console.error('Error guardando empleado:', error)
    }
  }

  const departmentStats = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Sin asignar'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <Head>
        <title>Empleados - CRM System</title>
        <meta name="description" content="Gestión de empleados del CRM" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona los empleados y recursos humanos
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Empleado
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                    <p className="text-2xl font-semibold text-gray-900">{employees.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BriefcaseIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Departamentos</p>
                    <p className="text-2xl font-semibold text-gray-900">{Object.keys(departmentStats).length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Nuevos este mes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {employees.filter(e => {
                        const hireDate = new Date(e.hire_date)
                        const now = new Date()
                        return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Activos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {employees.filter(e => e.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución por departamentos */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Distribución por Departamentos</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(departmentStats).map(([dept, count]) => (
                  <div key={dept} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">{dept}</p>
                    <p className="text-xl font-semibold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de empleados */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lista de Empleados</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando empleados...</p>
                </div>
              ) : (
                <EmployeesTable
                  employees={employees}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>

        {/* Formulario modal */}
        <EmployeeForm
          employee={editingEmployee}
          companies={companies}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingEmployee(null)
          }}
          onSubmit={handleSubmit}
        />
      </Layout>
    </>
  )
}