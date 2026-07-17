const API_BASE = 'http://localhost:4000/api/v1'

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed (${response.status})`)
  }
  return data
}

export function getSeniors() {
  return apiFetch('/seniors')
}

export function getAlerts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/alerts${qs ? `?${qs}` : ''}`)
}
