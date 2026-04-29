const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'wra602.token'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly violations?: Array<{ propertyPath: string; message: string }>,
  ) {
    super(message)
  }
}

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  contentType?: string
  auth?: boolean
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, contentType = 'application/ld+json', auth = true } = options

  const headers: Record<string, string> = {
    Accept: 'application/ld+json, application/json',
  }
  if (body !== undefined) {
    headers['Content-Type'] = contentType
  }
  if (auth) {
    const token = tokenStorage.get()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentTypeHeader = response.headers.get('content-type') ?? ''
  const data = contentTypeHeader.includes('json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = (data && (data.detail || data['hydra:description'] || data.message)) || response.statusText
    const violations = data && Array.isArray(data.violations) ? data.violations : undefined
    throw new ApiError(message, response.status, violations)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body, contentType: 'application/merge-patch+json' }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
