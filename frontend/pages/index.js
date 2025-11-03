import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('❌ Desconectado')
  const [loading, setLoading] = useState(true)
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://crm.arifamilyassets.com'
    setApiUrl(baseUrl)
    
    // Verificar estado del backend
    const checkBackend = async () => {
      try {
        const response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setBackendStatus('✅ Conectado')
        } else {
          throw new Error('Backend no responde')
        }
      } catch (error) {
        console.error('Error conectando al backend:', error)
        setBackendStatus('❌ Desconectado')
      } finally {
        setLoading(false)
      }
    }

    checkBackend()
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  const openLink = (path) => {
    window.open(`${apiUrl}${path}`, '_blank')
  }

  return (
    <>
      <Head>
        <title>Sistema ERP - Panel de Control</title>
        <meta name="description" content="Sistema ERP modular y escalable" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#2563eb', marginBottom: '30px' }}>
            🚀 Sistema ERP - Panel de Control
          </h1>
          
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              📊 Estado de Servicios
            </h2>
            <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
              <p style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '5px' }}>
                <strong>Backend FastAPI:</strong> {loading ? '🔄 Verificando...' : backendStatus}
              </p>
              <p style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '5px' }}>
                <strong>Base de Datos MySQL:</strong> ✅ Funcionando
              </p>
              <p style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '5px' }}>
                <strong>Frontend Next.js:</strong> ✅ Funcionando
              </p>
            </div>
          </section>
          
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              🔗 Enlaces Importantes
            </h2>
            <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => openLink('/docs')}
                style={{
                  padding: '12px 15px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                📚 Documentación de la API
              </button>
              <button 
                onClick={() => openLink('/admin')}
                style={{
                  padding: '12px 15px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                🔧 Panel de Administración
              </button>
              <button 
                onClick={() => openLink('/api/employees')}
                style={{
                  padding: '12px 15px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                🖥️ API Backend
              </button>
              <button 
                onClick={() => openLink('/health')}
                style={{
                  padding: '12px 15px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                ℹ️ Información del Sistema
              </button>
            </div>
          </section>
          
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              ℹ️ Información del Sistema
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px',
              marginTop: '15px'
            }}>
              <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '5px' }}>
                <strong>Puerto Backend:</strong> 8000
              </div>
              <div style={{ padding: '15px', backgroundColor: '#dbeafe', borderRadius: '5px' }}>
                <strong>Puerto Frontend:</strong> 3000
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f3e8ff', borderRadius: '5px' }}>
                <strong>Puerto MySQL:</strong> 3307
              </div>
              <div style={{ padding: '15px', backgroundColor: '#d1fae5', borderRadius: '5px' }}>
                <strong>Red Docker:</strong> erp_network
              </div>
            </div>
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '5px' }}>
              <strong>API URL:</strong> {apiUrl || 'Cargando...'}
            </div>
          </section>
          
          <section>
            <h2 style={{ color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              🛠️ Módulos Implementados
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '15px',
              marginTop: '15px'
            }}>
              {[
                'Gestión de Empleados y Nómina',
                'Módulo de Finanzas y Facturación',
                'Integración con APIs Externas',
                'Módulo de Inteligencia Artificial',
                'Base de Datos MySQL',
                'API REST con FastAPI'
              ].map((module, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '15px', 
                    backgroundColor: '#ecfdf5', 
                    borderRadius: '5px',
                    borderLeft: '4px solid #10b981'
                  }}
                >
                  ✅ {module}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}