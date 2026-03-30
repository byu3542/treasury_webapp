import { useState, useEffect, useCallback } from 'react'
import { getStoredToken, requestToken, signOut, clearToken } from '../services/auth.js'
import { getMeta } from '../services/db.js'

/**
 * Manages Google OAuth2 auth state.
 * Config (clientId, spreadsheetId, sheetName) is read from IndexedDB metadata.
 */
export function useAuth() {
  const [token, setToken] = useState(() => getStoredToken())
  const [config, setConfig] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // Load config from IndexedDB on mount
  useEffect(() => {
    Promise.all([
      getMeta('clientId'),
      getMeta('spreadsheetId'),
      getMeta('sheetName'),
    ]).then(([clientId, spreadsheetId, sheetName]) => {
      if (clientId) {
        setConfig({ clientId, spreadsheetId, sheetName: sheetName ?? 'Sheet1' })
      }
    })
  }, [])

  // Re-check token validity every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getStoredToken()
      if (!current && token) setToken(null)
    }, 60_000)
    return () => clearInterval(interval)
  }, [token])

  const signIn = useCallback(() => {
    if (!config?.clientId) {
      setAuthError('Google Client ID not configured. Go to Settings.')
      return
    }
    setIsAuthLoading(true)
    setAuthError(null)
    requestToken(
      config.clientId,
      (t) => { setToken(t); setIsAuthLoading(false) },
      (err) => { setAuthError(err.message); setIsAuthLoading(false) }
    )
  }, [config])

  const handleSignOut = useCallback(() => {
    signOut(() => setToken(null))
  }, [])

  const refreshConfig = useCallback(async () => {
    const [clientId, spreadsheetId, sheetName] = await Promise.all([
      getMeta('clientId'),
      getMeta('spreadsheetId'),
      getMeta('sheetName'),
    ])
    setConfig(clientId ? { clientId, spreadsheetId, sheetName: sheetName ?? 'Sheet1' } : null)
    clearToken()
    setToken(null)
  }, [])

  return {
    isAuthed: !!token,
    token,
    config,
    authError,
    isAuthLoading,
    signIn,
    signOut: handleSignOut,
    refreshConfig,
  }
}
