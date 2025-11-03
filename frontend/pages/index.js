import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return (
    <>
      <Head>
        <title>CRM System - Redirigiendo...</title>
        <meta name="description" content="Redirigiendo al dashboard del CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando CRM System...</p>
        </div>
      </div>
    </>
  )
}