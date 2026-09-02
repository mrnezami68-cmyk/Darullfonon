const API_BASE = '/api'

export class ApiError extends Error {
  constructor(message, status = 500, code = 'UNKNOWN_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
    headers: { 'X-Demo-User': 'demo-student' },
    body: JSON.stringify({ answers }),
  })
}

export function getProgress() {
  return request('/v1/progress', { headers: { 'X-Demo-User': 'demo-student' } })
}

export function saveProgress(lessonId, status) {
  return request('/v1/progress', {
    method: 'POST',
    headers: { 'X-Demo-User': 'demo-student' },
    body: JSON.stringify({ lessonId, status }),
  })
}

export function getMasterContent(type) {
  return request(`/v1/master/content/${type}`, { headers: { 'X-Demo-Role': 'master' } })
}

export function createMasterContent(type, payload) {
  return request(`/v1/master/content/${type}`, {
    method: 'POST',
    headers: { 'X-Demo-Role': 'master' },
    body: JSON.stringify(payload),
  })
}

export function updateMasterContent(type, id, payload) {
  return request(`/v1/master/content/${type}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'X-Demo-Role': 'master' },
    body: JSON.stringify(payload),
  })
}

export function archiveMasterContent(type, id) {
  return request(`/v1/master/content/${type}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'X-Demo-Role': 'master' },
  })
}
