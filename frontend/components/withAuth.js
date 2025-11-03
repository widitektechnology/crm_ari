import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
      const checkAuth = () => {
        const auth = localStorage.getItem('isAuthenticated')
        
        if (auth === 'true') {
          setIsAuthenticated(true)
        } else {
          router.push('/auth/login')
          return
        }
        
        setIsLoading(false)
      }

      checkAuth()
    }, [router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth