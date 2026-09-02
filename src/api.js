const API_BASE = '/api'

let authTokenGetter = null

export class ApiError extends Error {
  constructor(message, status = 500, code = 'UNKNOWN_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function setAuthTokenGetter(getToken) {
  authTokenGetter = typeof getToken === 'function' ? getToken : null
}

async function authHeaders() {
  if (!authTokenGetter) return {}
  try {
    const token = await authTokenGetter()
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

function pathRequiresAuth(path, method = 'GET') {
  return path.startsWith('/v1/auth/') || path.startsWith('/v1/admin/') || path.startsWith('/v1/master/') || path === '/v1/progress' || (path.startsWith('/v1/quizzes/') && method !== 'GET')
}

async function request(path, options = {}) {
  const tokenHeaders = pathRequiresAuth(path, options.method || 'GET') ? await authHeaders() : {}
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...tokenHeaders,
      ...(options.headers || {}),
    },
  })
  let payload = null
  try { payload = await response.json() } catch { payload = null }
  if (!response.ok) {
    throw new ApiError(payload?.error?.message || 'ارتباط با سرویس انجام نشد.', response.status, payload?.error?.code || 'HTTP_ERROR')
  }
  return payload?.data ?? payload
}

export function getAuthMe() {
  return request('/v1/auth/me')
}

export function onboardStudent() {
  return request('/v1/auth/onboarding/student', { method: 'POST' })
}

export function applyTeacher(application) {
  return request('/v1/auth/teacher/application', { method: 'POST', body: JSON.stringify(application) })
}

export function getTeacherApplication() {
  return request('/v1/auth/teacher/application')
}

export function logout() {
  return request('/v1/auth/logout', { method: 'POST' })
}

export function getTeacherApplications(status = 'pending') {
  return request(`/v1/admin/teacher-applications?status=${encodeURIComponent(status)}`)
}

export function approveTeacherApplication(id) {
  return request(`/v1/admin/teacher-applications/${encodeURIComponent(id)}/approve`, { method: 'POST' })
}

export function rejectTeacherApplication(id, reason) {
  return request(`/v1/admin/teacher-applications/${encodeURIComponent(id)}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
}

export function suspendUser(id) {
  return request(`/v1/admin/users/${encodeURIComponent(id)}/suspend`, { method: 'POST' })
}

export function provisionMaster(data) {
  return request('/v1/admin/master-provision', { method: 'POST', body: JSON.stringify(data) })
}

export function getCourses() {
  return request('/v1/courses')
}

export function getCourse(slug) {
  return request(`/v1/courses/${encodeURIComponent(slug)}`)
}

export function getChapter(id) {
  return request(`/v1/chapters/${encodeURIComponent(id)}`)
}

export function getLesson(slug) {
  return request(`/v1/lessons/${encodeURIComponent(slug)}`)
}

export function getGlossary(params = {}) {
  const query = new URLSearchParams()
  if (params.query) query.set('q', params.query)
  if (params.category && params.category !== 'همه') query.set('category', params.category)
  return request(`/v1/glossary${query.toString() ? `?${query}` : ''}`)
}

export function getGlossaryEntry(slug) {
  return request(`/v1/glossary/${encodeURIComponent(slug)}`)
}

export function getLibrary(params = {}) {
  const query = new URLSearchParams()
  if (params.category && params.category !== 'همه') query.set('category', params.category)
  if (params.level) query.set('level', params.level)
  if (params.type) query.set('type', params.type)
  return request(`/v1/library${query.toString() ? `?${query}` : ''}`)
}

export function getLibraryEntry(slug) {
  return request(`/v1/library/${encodeURIComponent(slug)}`)
}

export function getQuiz(id) {
  return request(`/v1/quizzes/${encodeURIComponent(id)}`)
}

export function submitQuiz(id, answers) {
  return request(`/v1/quizzes/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export function getProgress() {
  return request('/v1/progress')
}

export function saveProgress(lessonId, status) {
  return request('/v1/progress', {
    method: 'POST',
    body: JSON.stringify({ lessonId, status }),
  })
}

export function getMasterContent(type) {
  return request(`/v1/master/content/${type}`)
}

export function createMasterContent(type, payload) {
  return request(`/v1/master/content/${type}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateMasterContent(type, id, payload) {
  return request(`/v1/master/content/${type}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function archiveMasterContent(type, id) {
  return request(`/v1/master/content/${type}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
