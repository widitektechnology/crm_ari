import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  UserIcon, 
  BellIcon, 
  CogIcon, 
  KeyIcon, 
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const settingsTabs = [
  { name: 'Perfil', id: 'profile', icon: UserIcon },
  { name: 'Notificaciones', id: 'notifications', icon: BellIcon },
  { name: 'Sistema', id: 'system', icon: CogIcon },
  { name: 'Seguridad', id: 'security', icon: KeyIcon },
  { name: 'Permisos', id: 'permissions', icon: ShieldCheckIcon },
  { name: 'Reportes', id: 'reports', icon: DocumentTextIcon },
];

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: 'Admin Usuario',
    email: 'admin@crm.com',
    phone: '+56 9 1234 5678',
    role: 'Administrador',
    avatar: null
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
        <p className="mt-1 text-sm text-gray-500">
          Actualiza tu información personal y detalles de contacto.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false,
    security: true,
    updates: true
  });

  const updateNotification = (key, value) => {
    setNotifications({...notifications, [key]: value});
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configura cómo y cuándo quieres recibir notificaciones.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notificaciones por Email</h4>
              <p className="text-sm text-gray-500">Recibe actualizaciones por correo electrónico</p>
            </div>
            <button
              onClick={() => updateNotification('email', !notifications.email)}
              className={`${notifications.email ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${notifications.email ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notificaciones Push</h4>
              <p className="text-sm text-gray-500">Recibe notificaciones en el navegador</p>
            </div>
            <button
              onClick={() => updateNotification('push', !notifications.push)}
              className={`${notifications.push ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${notifications.push ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SMS</h4>
              <p className="text-sm text-gray-500">Recibe alertas importantes por SMS</p>
            </div>
            <button
              onClick={() => updateNotification('sms', !notifications.sms)}
              className={`${notifications.sms ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${notifications.sms ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Marketing</h4>
              <p className="text-sm text-gray-500">Recibe información sobre nuevas funciones</p>
            </div>
            <button
              onClick={() => updateNotification('marketing', !notifications.marketing)}
              className={`${notifications.marketing ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${notifications.marketing ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Seguridad</h4>
              <p className="text-sm text-gray-500">Alertas de seguridad y acceso</p>
            </div>
            <button
              onClick={() => updateNotification('security', !notifications.security)}
              className={`${notifications.security ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${notifications.security ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    language: 'es',
    timezone: 'America/Santiago',
    currency: 'CLP',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light'
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza la configuración regional y de interfaz.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Idioma</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zona Horaria</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="America/Santiago">Santiago (GMT-3)</option>
              <option value="America/Lima">Lima (GMT-5)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Moneda</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="CLP">CLP - Peso Chileno</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
              <option value="PEN">PEN - Sol Peruano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Formato de Fecha</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportsSettings = () => {
  const reportTypes = [
    {
      name: 'Reporte de Empresas',
      description: 'Listado completo de empresas con estadísticas',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Reporte de Empleados',
      description: 'Información detallada de empleados por departamento',
      icon: UsersIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Reporte Financiero',
      description: 'Análisis de ingresos, gastos y facturación',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Reporte de Performance',
      description: 'Métricas de rendimiento y KPIs del sistema',
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ];

  const [reportHistory] = useState([
    {
      id: 1,
      name: 'Reporte Mensual - Noviembre 2024',
      type: 'Financiero',
      date: '2024-11-30',
      status: 'Completado',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Análisis de Empleados Q4',
      type: 'Empleados',
      date: '2024-11-28',
      status: 'Completado',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Reporte de Empresas Activas',
      type: 'Empresas',
      date: '2024-11-25',
      status: 'En Proceso',
      size: '3.1 MB'
    }
  ]);

  const generateReport = (reportType) => {
    alert(`Generando reporte: ${reportType}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Centro de Reportes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Genera y gestiona reportes personalizados del sistema.
        </p>
      </div>

      {/* Tipos de Reportes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Generar Nuevo Reporte</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reportTypes.map((report) => (
            <div key={report.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`${report.color} p-2 rounded-lg`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{report.name}</h5>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
                <button
                  onClick={() => generateReport(report.name)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                >
                  Generar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Reportes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Historial de Reportes</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportHistory.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'Completado' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Descargar
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginNotifications: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona la seguridad de tu cuenta y del sistema.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Autenticación de Dos Factores</h4>
              <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
            </div>
            <button
              onClick={() => setSecurity({...security, twoFactor: !security.twoFactor})}
              className={`${security.twoFactor ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${security.twoFactor ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tiempo de Sesión (minutos)</label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="480">8 horas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiración de Contraseña (días)</label>
            <select
              value={security.passwordExpiry}
              onChange={(e) => setSecurity({...security, passwordExpiry: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="30">30 días</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
              <option value="180">180 días</option>
              <option value="365">1 año</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notificaciones de Acceso</h4>
              <p className="text-sm text-gray-500">Recibe alertas cuando alguien acceda a tu cuenta</p>
            </div>
            <button
              onClick={() => setSecurity({...security, loginNotifications: !security.loginNotifications})}
              className={`${security.loginNotifications ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className={`${security.loginNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionsSettings = () => {
  const [users] = useState([
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@empresa.com',
      role: 'Administrador',
      permissions: ['read', 'write', 'delete', 'admin'],
      status: 'Activo'
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@empresa.com',
      role: 'Editor',
      permissions: ['read', 'write'],
      status: 'Activo'
    },
    {
      id: 3,
      name: 'María Rodríguez',
      email: 'maria.rodriguez@empresa.com',
      role: 'Visor',
      permissions: ['read'],
      status: 'Inactivo'
    }
  ]);

  const roleColors = {
    'Administrador': 'bg-red-100 text-red-800',
    'Editor': 'bg-blue-100 text-blue-800',
    'Visor': 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Gestión de Permisos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Administra los roles y permisos de los usuarios del sistema.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Usuarios y Roles</h4>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Añadir Usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {user.permissions.map((permission) => (
                        <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Activo' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Editar
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      {user.status === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Definición de Roles</h4>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900">Administrador</h5>
            <p className="text-sm text-gray-500 mt-1">Acceso completo al sistema, incluyendo configuración y gestión de usuarios.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Lectura</span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Escritura</span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Eliminación</span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Administración</span>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900">Editor</h5>
            <p className="text-sm text-gray-500 mt-1">Puede crear y modificar contenido, pero no eliminar ni acceder a configuraciones.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Lectura</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Escritura</span>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900">Visor</h5>
            <p className="text-sm text-gray-500 mt-1">Solo puede visualizar información, sin capacidad de modificación.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Lectura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'system':
        return <SystemSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'permissions':
        return <PermissionsSettings />;
      case 'reports':
        return <ReportsSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona la configuración del sistema y tu perfil de usuario.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Sidebar de Configuración */}
          <div className="lg:w-64 mb-6 lg:mb-0">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                >
                  <tab.icon
                    className={`${
                      activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                  />
                  <span className="truncate">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de la Configuración */}
          <div className="flex-1 max-w-4xl">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
}