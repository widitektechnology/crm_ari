import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/layout/Layout'
import { 
  PlusIcon, 
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// Componente para la tabla de facturas
function InvoicesTable({ invoices, onView, onSend, onMarkPaid }) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva factura.</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagada'
      case 'pending':
        return 'Pendiente'
      case 'overdue':
        return 'Vencida'
      case 'draft':
        return 'Borrador'
      default:
        return status
    }
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Factura
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vencimiento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Importe
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
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                    <div className="text-sm text-gray-500">
                      {invoice.is_electronic ? '📧 Electrónica' : '📄 Física'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
                <div className="text-sm text-gray-500">{invoice.customer_tax_id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {new Date(invoice.issue_date).toLocaleDateString('es-ES')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {new Date(invoice.due_date).toLocaleDateString('es-ES')}
                  {new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && (
                    <ExclamationTriangleIcon className="h-4 w-4 ml-1 text-red-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center">
                  <CurrencyEuroIcon className="h-4 w-4 mr-1 text-green-600" />
                  €{parseFloat(invoice.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onView(invoice)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Ver
                </button>
                {invoice.status !== 'paid' && (
                  <>
                    <button
                      onClick={() => onSend(invoice)}
                      className="text-green-600 hover:text-green-900 inline-flex items-center"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                      Enviar
                    </button>
                    <button
                      onClick={() => onMarkPaid(invoice)}
                      className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Marcar Pagada
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Componente para el formulario de nueva factura
function InvoiceForm({ companies, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    company_id: 1,
    customer_name: '',
    customer_tax_id: '',
    customer_email: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_days: 30
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Factura</h3>
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
              <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NIF/CIF del Cliente</label>
              <input
                type="text"
                required
                value={formData.customer_tax_id}
                onChange={(e) => setFormData({...formData, customer_tax_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email del Cliente</label>
              <input
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Emisión</label>
              <input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Días de Vencimiento</label>
              <select
                value={formData.due_days}
                onChange={(e) => setFormData({...formData, due_days: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
                <option value={90}>90 días</option>
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
                Crear Factura
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Finance() {
  const [invoices, setInvoices] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Datos simulados (en producción vendrían de la API)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Aquí llamarías a tus endpoints reales:
        // const invoicesResponse = await fetch('/api/finance/invoices')
        // const companiesResponse = await fetch('/api/companies')
        
        // Por ahora simulamos los datos
        setTimeout(() => {
          setCompanies([
            { id: 1, name: 'ARI Family Assets S.L.' },
            { id: 2, name: 'TechCorp Solutions' },
            { id: 3, name: 'Global Services Ltd' }
          ])

          setInvoices([
            {
              id: 1,
              company_id: 1,
              invoice_number: 'FAC-2024-001',
              customer_name: 'Cliente ABC S.L.',
              customer_tax_id: 'B12345678',
              customer_email: 'facturacion@clienteabc.com',
              issue_date: '2024-11-01',
              due_date: '2024-12-01',
              status: 'pending',
              subtotal: '2000.00',
              tax_amount: '420.00',
              total: '2420.00',
              is_electronic: true,
              created_at: '2024-11-01T10:00:00Z'
            },
            {
              id: 2,
              company_id: 1,
              invoice_number: 'FAC-2024-002',
              customer_name: 'Empresa XYZ Ltd',
              customer_tax_id: 'A87654321',
              customer_email: 'admin@empresaxyz.com',
              issue_date: '2024-10-15',
              due_date: '2024-11-15',
              status: 'paid',
              subtotal: '1500.00',
              tax_amount: '315.00',
              total: '1815.00',
              is_electronic: true,
              created_at: '2024-10-15T14:30:00Z'
            },
            {
              id: 3,
              company_id: 1,
              invoice_number: 'FAC-2024-003',
              customer_name: 'Servicios 123',
              customer_tax_id: 'C11223344',
              customer_email: 'contacto@servicios123.com',
              issue_date: '2024-09-20',
              due_date: '2024-10-20',
              status: 'overdue',
              subtotal: '3000.00',
              tax_amount: '630.00',
              total: '3630.00',
              is_electronic: false,
              created_at: '2024-09-20T09:15:00Z'
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
    setShowForm(true)
  }

  const handleView = (invoice) => {
    // Aquí abriríamos una vista detallada de la factura
    alert(`Ver factura ${invoice.invoice_number}`)
  }

  const handleSend = async (invoice) => {
    try {
      // Aquí llamarías a tu endpoint: POST /api/finance/invoices/{id}/send
      alert(`Factura ${invoice.invoice_number} enviada por email`)
    } catch (error) {
      console.error('Error enviando factura:', error)
    }
  }

  const handleMarkPaid = async (invoice) => {
    try {
      // Aquí llamarías a tu endpoint: POST /api/finance/invoices/{id}/mark-paid
      setInvoices(invoices.map(inv => 
        inv.id === invoice.id ? { ...inv, status: 'paid' } : inv
      ))
    } catch (error) {
      console.error('Error marcando como pagada:', error)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      // Crear nueva factura
      // const response = await fetch('/api/finance/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      const dueDate = new Date(formData.issue_date)
      dueDate.setDate(dueDate.getDate() + formData.due_days)
      
      const newInvoice = {
        id: Date.now(),
        ...formData,
        invoice_number: `FAC-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'draft',
        subtotal: '0.00',
        tax_amount: '0.00',
        total: '0.00',
        is_electronic: true,
        created_at: new Date().toISOString()
      }
      
      setInvoices([...invoices, newInvoice])
      setShowForm(false)
    } catch (error) {
      console.error('Error creando factura:', error)
    }
  }

  // Calcular estadísticas
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total), 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.total), 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total), 0)

  return (
    <>
      <Head>
        <title>Finanzas - CRM System</title>
        <meta name="description" content="Gestión financiera y facturación del CRM" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestión de facturas y reportes financieros
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Factura
            </button>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Facturas</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalInvoices}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Facturado</p>
                    <p className="text-2xl font-semibold text-gray-900">€{totalAmount.toLocaleString('es-ES')}</p>
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
                    <p className="text-sm font-medium text-gray-500">Cobrado</p>
                    <p className="text-2xl font-semibold text-gray-900">€{paidAmount.toLocaleString('es-ES')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Por Cobrar</p>
                    <p className="text-2xl font-semibold text-gray-900">€{(pendingAmount + overdueAmount).toLocaleString('es-ES')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de estado de facturas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estado de Facturas</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Pagadas</p>
                  <p className="text-xl font-semibold text-green-900">
                    {invoices.filter(inv => inv.status === 'paid').length}
                  </p>
                  <p className="text-sm text-green-600">€{paidAmount.toLocaleString('es-ES')}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                  <p className="text-xl font-semibold text-yellow-900">
                    {invoices.filter(inv => inv.status === 'pending').length}
                  </p>
                  <p className="text-sm text-yellow-600">€{pendingAmount.toLocaleString('es-ES')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-600">Vencidas</p>
                  <p className="text-xl font-semibold text-red-900">
                    {invoices.filter(inv => inv.status === 'overdue').length}
                  </p>
                  <p className="text-sm text-red-600">€{overdueAmount.toLocaleString('es-ES')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Borradores</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {invoices.filter(inv => inv.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de facturas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lista de Facturas</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando facturas...</p>
                </div>
              ) : (
                <InvoicesTable
                  invoices={invoices}
                  onView={handleView}
                  onSend={handleSend}
                  onMarkPaid={handleMarkPaid}
                />
              )}
            </div>
          </div>
        </div>

        {/* Formulario modal */}
        <InvoiceForm
          companies={companies}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      </Layout>
    </>
  )
}