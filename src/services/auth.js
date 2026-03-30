/**
 * Google OAuth2 authentication using Google Identity Services (GIS).
 * Uses the implicit token flow — suitable for a pure client-side SPA.
 * Access token is stored in sessionStorage (cleared on tab/window close).
 *
 * Required Google Cloud Console setup:
 *   1. Create an OAuth2 Client ID (Web application type)
 *   2. Add your domain to "Authorized JavaScript origins"
 *   3. No redirect URIs needed for implicit flow
 */

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
const TOKEN_KEY = 'gapi_access_token'
const TOKEN_EXPIRY_KEY = 'gapi_token_expiry'

let tokenClient = null

/** Read stored token from sessionStorage. Returns null if missing or expired. */
export function getStoredToken() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!token || !expiry) return null
  if (Date.now() > parseInt(expiry, 10)) {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
    return null
  }
  return token
}

/** Persist a new access token. expiresIn is in seconds. */
function storeToken(token, expiresIn = 3600) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
}

/** Remove token (sign out). */
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Initialize the GIS token client. Must be called once after the GIS script
 * has loaded (window.google is defined).
 *
 * @param {string} clientId - Google OAuth2 client ID
 * @param {function} onTokenReceived - called with the access token string
 * @param {function} onError - called on auth error
 */
export function initTokenClient(clientId, onTokenReceived, onError) {
  if (!window.google?.accounts?.oauth2) {
    onError(new Error('Google Identity Services not loaded. Check your network connection.'))
    return
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        onError(new Error(response.error_description || response.error))
        return
      }
      storeToken(response.access_token, response.expires_in)
      onTokenReceived(response.access_token)
    },
  })
}

/**
 * Trigger the OAuth2 popup to request a token. If a valid token is already
 * in sessionStorage, calls onTokenReceived immediately without a popup.
 */
export function requestToken(clientId, onTokenReceived, onError) {
  const existing = getStoredToken()
  if (existing) {
    onTokenReceived(existing)
    return
  }

  // Ensure client is initialized
  if (!tokenClient) {
    initTokenClient(clientId, onTokenReceived, onError)
  }

  if (!tokenClient) return // GIS not loaded yet
  tokenClient.requestAccessToken({ prompt: '' })
}

/** Sign out: revoke token and clear sessionStorage. */
export function signOut(onDone) {
  const token = getStoredToken()
  clearToken()

  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {
      if (onDone) onDone()
    })
  } else {
    if (onDone) onDone()
  }
}
