import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ReportCard = ({ title, description, icon: Icon, color, onGenerate, onView, lastGenerated }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`${color} p-3 rounded-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{description}</dd>
          </dl>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between items-center">
          {lastGenerated && (
            <p className="text-sm text-gray-500">
              Último: {new Date(lastGenerated).toLocaleDateString('es-ES')}
            </p>
          )}
          <div className="flex space-x-2">
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Ver
            </button>
            <button
              onClick={onGenerate}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Generar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ChartComponent = ({ title, data, type = 'bar' }) => {
  // Simulación de datos para gráficos
  const renderChart = () => {
    if (type === 'pie') {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="10" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent" 
                stroke="#3b82f6" 
                strokeWidth="10"
                strokeDasharray="80 20"
                strokeDashoffset="0"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent" 
                stroke="#10b981" 
                strokeWidth="10"
                strokeDasharray="15 85"
                strokeDashoffset="-80"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">Total</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-48 flex items-end justify-around p-4">
        {[65, 40, 80, 30, 50].map((height, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="bg-indigo-500 w-8 rounded-t"
              style={{ height: `${height}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-2">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May'][index]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

const MetricCard = ({ title, value, change, changeType }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
        </div>
        {change && (
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              changeType === 'positive' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {changeType === 'positive' ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportHistory] = useState([
    {
      id: 1,
      name: 'Reporte Financiero Noviembre',
      type: 'Financiero',
      date: '2024-11-30',
      status: 'Completado',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Análisis de Empleados Q4',
      type: 'RRHH',
      date: '2024-11-28',
      status: 'Completado',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Reporte de Ventas Mensual',
      type: 'Ventas',
      date: '2024-11-25',
      status: 'En Proceso',
      size: '3.1 MB'
    }
  ]);

  const reports = [
    {
      title: 'Reporte Financiero',
      description: 'Análisis completo de ingresos y gastos',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      lastGenerated: '2024-11-30'
    },
    {
      title: 'Reporte de Empleados',
      description: 'Estadísticas de personal y departamentos',
      icon: UsersIcon,
      color: 'bg-blue-500',
      lastGenerated: '2024-11-28'
    },
    {
      title: 'Reporte de Empresas',
      description: 'Estado y análisis de empresas cliente',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
      lastGenerated: '2024-11-27'
    },
    {
      title: 'Reporte de Performance',
      description: 'KPIs y métricas de rendimiento',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      lastGenerated: '2024-11-29'
    }
  ];

  const metrics = [
    { title: 'Ingresos Totales', value: '$2,450,000', change: 12.5, changeType: 'positive' },
    { title: 'Clientes Activos', value: '1,247', change: 8.2, changeType: 'positive' },
    { title: 'Empleados Activos', value: '89', change: -2.1, changeType: 'negative' },
    { title: 'Proyectos Completados', value: '156', change: 15.3, changeType: 'positive' }
  ];

  const handleGenerateReport = (reportTitle) => {
    alert(`Generando reporte: ${reportTitle}`);
  };

  const handleViewReport = (reportTitle) => {
    alert(`Visualizando reporte: ${reportTitle}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Centro de Reportes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Genera y gestiona reportes personalizados del sistema
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Gráficos de Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartComponent title="Ingresos Mensuales" type="bar" />
          <ChartComponent title="Distribución por Departamento" type="pie" />
        </div>

        {/* Reportes Disponibles */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Reportes Disponibles</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {reports.map((report, index) => (
              <ReportCard
                key={index}
                {...report}
                onGenerate={() => handleGenerateReport(report.title)}
                onView={() => handleViewReport(report.title)}
              />
            ))}
          </div>
        </div>

        {/* Historial de Reportes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Historial de Reportes
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Reportes generados recientemente
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {reportHistory.map((report) => (
              <li key={report.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentChartBarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-sm text-gray-500">
                        {report.type} • {new Date(report.date).toLocaleDateString('es-ES')} • {report.size}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'Completado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Descargar
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Reportes Programados */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Reportes Programados
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Reporte Financiero Mensual</h4>
                  <p className="text-sm text-gray-500">Cada primer día del mes a las 9:00 AM</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    Editar
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Análisis de Performance Semanal</h4>
                  <p className="text-sm text-gray-500">Cada lunes a las 8:00 AM</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Pausado
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    Activar
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Crear Reporte Programado
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}