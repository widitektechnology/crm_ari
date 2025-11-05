import { useEffect } from 'react'
import { useMail } from '../../contexts/MailContext'
import type { MailSidebarProps } from '../../types/mail'

export default function MailSidebar({ className = '' }: MailSidebarProps) {
  const {
    accounts,
    currentAccount,
    folders,
    currentFolder,
    setCurrentAccount,
    setCurrentFolder,
    syncStatus,
    syncAccount
  } = useMail()

  useEffect(() => {
    // Si no hay cuenta seleccionada y hay cuentas disponibles, seleccionar la primera
    if (!currentAccount && accounts.length > 0) {
      setCurrentAccount(accounts[0].id)
    }
  }, [currentAccount, accounts, setCurrentAccount])

  const handleAccountChange = (accountId: string) => {
    setCurrentAccount(accountId)
  }

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId)
  }

  const handleSyncAccount = (accountId: string) => {
    syncAccount(accountId)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Cuentas */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Cuentas</h3>
        <div className="space-y-2">
          {accounts.map((account) => {
            const sync = syncStatus[account.id]
            const isActive = currentAccount?.id === account.id
            
            return (
              <div
                key={account.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleAccountChange(account.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white bg-opacity-20' : 'bg-blue-100'
                    }`}>
                      <span className={`text-sm ${isActive ? 'text-white' : 'text-blue-600'}`}>
                        {account.avatar || account.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isActive ? 'text-white' : 'text-gray-900'
                      }`}>
                        {account.name}
                      </p>
                      <p className={`text-xs truncate ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {account.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Contador de mensajes no leídos */}
                    {account.unreadCount > 0 && (
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                        isActive 
                          ? 'bg-white text-blue-600' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {account.unreadCount > 99 ? '99+' : account.unreadCount}
                      </span>
                    )}
                    
                    {/* Botón de sincronizar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSyncAccount(account.id)
                      }}
                      className={`p-1 rounded transition-all duration-200 ${
                        isActive 
                          ? 'hover:bg-white hover:bg-opacity-20' 
                          : 'hover:bg-gray-200'
                      } ${sync?.isActive ? 'animate-spin' : ''}`}
                      disabled={sync?.isActive}
                    >
                      <span className={`text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        🔄
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Barra de progreso de sincronización */}
                {sync?.isActive && sync.progress && (
                  <div className="mt-2">
                    <div className={`w-full bg-opacity-30 rounded-full h-1 ${
                      isActive ? 'bg-white' : 'bg-gray-300'
                    }`}>
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          isActive ? 'bg-white' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(sync.progress.current / sync.progress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {sync.progress.stage === 'connecting' && 'Conectando...'}
                      {sync.progress.stage === 'authenticating' && 'Autenticando...'}
                      {sync.progress.stage === 'syncing_folders' && 'Sincronizando carpetas...'}
                      {sync.progress.stage === 'syncing_messages' && 'Sincronizando mensajes...'}
                      {sync.progress.stage === 'complete' && 'Completado'}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Carpetas */}
      {currentAccount && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Carpetas</h3>
          <div className="space-y-1">
            {folders
              .filter(folder => folder.accountId === currentAccount.id)
              .map((folder) => {
                const isActive = currentFolder?.id === folder.id
                
                return (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm">
                        {folder.type === 'inbox' && '📥'}
                        {folder.type === 'sent' && '📤'}
                        {folder.type === 'drafts' && '📝'}
                        {folder.type === 'trash' && '🗑️'}
                        {folder.type === 'spam' && '🚫'}
                        {folder.type === 'archive' && '📦'}
                        {folder.type === 'custom' && '📁'}
                      </span>
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {folder.displayName}
                      </span>
                    </div>
                    
                    {/* Contador de mensajes no leídos */}
                    {folder.unreadCount > 0 && (
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {folder.unreadCount > 99 ? '99+' : folder.unreadCount}
                      </span>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {currentAccount && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Total de mensajes:</span>
              <span className="font-medium">{currentAccount.totalCount}</span>
            </div>
            <div className="flex justify-between">
              <span>No leídos:</span>
              <span className="font-medium text-red-600">{currentAccount.unreadCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Última sincronización:</span>
              <span className="font-medium">
                {currentAccount.lastSync
                  ? new Date(currentAccount.lastSync).toLocaleTimeString()
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}