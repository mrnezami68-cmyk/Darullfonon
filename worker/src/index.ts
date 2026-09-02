export interface Env {
  DB: D1Database
  ENVIRONMENT?: string
  ALLOWED_ORIGIN?: string
}

type ContentType = 'courses' | 'lessons' | 'questions' | 'glossary' | 'library'

const contentTables: Record<ContentType, { table: string; fields: string; values: string[] }> = {
  courses: {
    table: 'courses',
    fields: 'id, slug, title, summary, level, status, duration_minutes, lesson_count',
    values: ['id', 'slug', 'title', 'summary', 'level', 'status', 'durationMinutes', 'lessonCount'],
  },
  lessons: {
    table: 'lessons',
    fields: 'id, slug, chapter_id, title, summary, body, reading_minutes, status, sort_order',
    values: ['id', 'slug', 'chapterId', 'title', 'summary', 'body', 'readingMinutes', 'status', 'sortOrder'],
  },
  questions: {
    table: 'questions',
    fields: 'id, quiz_id, prompt, options_json, correct_option, explanation, difficulty, status',
    values: ['id', 'quizId', 'prompt', 'options', 'correctOption', 'explanation', 'difficulty', 'status'],
  },
  glossary: {
    table: 'glossary_entries',
    fields: 'id, slug, term, full_name, simple_definition, expert_definition, category, status',
    values: ['id', 'slug', 'term', 'fullName', 'simpleDefinition', 'expertDefinition', 'category', 'status'],
  },
  library: {
    table: 'library_resources',
    fields: 'id, slug, title, author, summary, category, level, resource_type, access_type, status',
    values: ['id', 'slug', 'title', 'author', 'summary', 'category', 'level', 'resourceType', 'accessType', 'status'],
  },
}

const JSON_LIMIT = 64 * 1024

function corsHeaders(request: Request, env: Env): HeadersInit {
  const requestOrigin = request.headers.get('Origin')
  const allowedOrigin = env.ALLOWED_ORIGIN || (env.ENVIRONMENT === 'development' ? requestOrigin || '*' : '*')
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Demo-Role, X-Demo-User',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(request: Request, env: Env, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function error(request: Request, env: Env, message: string, status: number, code: string): Response {
  return json(request, env, { error: { code, message } }, status)
}

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{2,80}$/.test(value)
}

function isValidSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{1,100}$/.test(value)
}

function stringField(value: unknown, maxLength = 5000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function requireMaster(request: Request, env: Env): Response | null {
  if (env.ENVIRONMENT === 'development' && request.headers.get('X-Demo-Role') === 'master') return null
  return error(request, env, 'دسترسی مدیریتی برای این عملیات لازم است.', 403, 'MASTER_ROLE_REQUIRED')
}

async function parseBody(request: Request, env: Env): Promise<{ body?: Record<string, unknown>; response?: Response }> {
  const contentLength = Number(request.headers.get('Content-Length') || 0)
  if (contentLength > JSON_LIMIT) return { response: error(request, env, 'حجم درخواست بیش از حد مجاز است.', 413, 'PAYLOAD_TOO_LARGE') }
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { response: error(request, env, 'بدنه درخواست معتبر نیست.', 400, 'INVALID_BODY') }
    }
    return { body: body as Record<string, unknown> }
  } catch {
    return { response: error(request, env, 'بدنه درخواست باید JSON معتبر باشد.', 400, 'INVALID_JSON') }
  }
}

async function listCourses(request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT f.slug AS faculty_slug, f.title AS faculty_title, c.id, c.slug, c.title, c.summary, c.level, c.status, c.duration_minutes, c.lesson_count
     FROM courses c JOIN faculties f ON f.id = c.faculty_id
     WHERE c.status = 'Published' ORDER BY c.sort_order, c.title`,
  ).all()
  return json(request, env, { data: results })
}

async function courseDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const course = await env.DB.prepare(
    `SELECT f.slug AS faculty_slug, f.title AS faculty_title, c.id, c.slug, c.title, c.summary, c.level, c.status, c.duration_minutes, c.lesson_count
     FROM courses c JOIN faculties f ON f.id = c.faculty_id WHERE c.slug = ? AND c.status = 'Published' LIMIT 1`,
  ).bind(slug).first()
  if (!course) return error(request, env, 'دوره موردنظر پیدا نشد.', 404, 'COURSE_NOT_FOUND')
  const { results: levels } = await env.DB.prepare(
    `SELECT id, title, medal, sort_order FROM levels WHERE course_id = ? ORDER BY sort_order`,
  ).bind(course.id).all()
  const { results: chapters } = await env.DB.prepare(
    `SELECT ch.id, ch.level_id, ch.title, ch.summary, ch.sort_order,
       (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = ch.id AND l.status = 'Published') AS lesson_count
     FROM chapters ch WHERE ch.course_id = ? ORDER BY ch.sort_order`,
  ).bind(course.id).all()
  return json(request, env, { data: { course, levels, chapters } })
}

async function chapterDetail(request: Request, env: Env, chapterId: string): Promise<Response> {
  const chapter = await env.DB.prepare(
    `SELECT id, course_id, level_id, title, summary, objective, estimated_minutes, sort_order
     FROM chapters WHERE id = ? LIMIT 1`,
  ).bind(chapterId).first()
  if (!chapter) return error(request, env, 'فصل موردنظر پیدا نشد.', 404, 'CHAPTER_NOT_FOUND')
  const { results: lessons } = await env.DB.prepare(
    `SELECT id, slug, title, summary, reading_minutes, status, sort_order
     FROM lessons WHERE chapter_id = ? ORDER BY sort_order`,
  ).bind(chapterId).all()
  return json(request, env, { data: { chapter, lessons } })
}

async function lessonDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const lesson = await env.DB.prepare(
    `SELECT l.id, l.slug, l.chapter_id, l.title, l.summary, l.body, l.reading_minutes, l.status, l.sort_order,
       c.title AS chapter_title, co.slug AS course_slug, co.title AS course_title
     FROM lessons l JOIN chapters c ON c.id = l.chapter_id JOIN courses co ON co.id = c.course_id
     WHERE l.slug = ? AND l.status = 'Published' LIMIT 1`,
  ).bind(slug).first()
  if (!lesson) return error(request, env, 'درس موردنظر پیدا نشد.', 404, 'LESSON_NOT_FOUND')
  return json(request, env, { data: lesson })
}

async function updateProgress(request: Request, env: Env): Promise<Response> {
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const lessonId = body.lessonId
  const status = body.status
  const userId = request.headers.get('X-Demo-User') || 'demo-student'
  const allowedStatuses = ['InProgress', 'Studied', 'Passed', 'NeedsReview']
  if (!isValidId(lessonId) || typeof status !== 'string' || !allowedStatuses.includes(status)) {
    return error(request, env, 'lessonId یا وضعیت پیشرفت معتبر نیست.', 400, 'INVALID_PROGRESS')
  }
  const lesson = await env.DB.prepare('SELECT id FROM lessons WHERE id = ? LIMIT 1').bind(lessonId).first()
  if (!lesson) return error(request, env, 'درس موردنظر پیدا نشد.', 404, 'LESSON_NOT_FOUND')
  await env.DB.prepare(
    `INSERT INTO progress (user_id, lesson_id, status, completed_at, updated_at)
     VALUES (?, ?, ?, CASE WHEN ? IN ('Studied', 'Passed') THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = excluded.status, completed_at = excluded.completed_at, updated_at = CURRENT_TIMESTAMP`,
  ).bind(userId, lessonId, status, status).run()
  return json(request, env, { data: { userId, lessonId, status } }, 201)
}

async function listMasterContent(request: Request, env: Env, type: ContentType): Promise<Response> {
  const permission = requireMaster(request, env)
  if (permission) return permission
  const config = contentTables[type]
  const { results } = await env.DB.prepare(`SELECT ${config.fields} FROM ${config.table} ORDER BY created_at DESC LIMIT 200`).all()
  return json(request, env, { data: results })
}

async function createMasterContent(request: Request, env: Env, type: ContentType): Promise<Response> {
  const permission = requireMaster(request, env)
  if (permission) return permission
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const config = contentTables[type]
  const requiredFields: Record<ContentType, string[]> = {
    courses: ['title'],
    lessons: ['title'],
    questions: ['prompt'],
    glossary: ['term'],
    library: ['title'],
  }
  for (const field of requiredFields[type]) {
    if (!stringField(body[field], field === 'body' ? 30000 : 5000)) {
      return error(request, env, `فیلد ${field} الزامی است.`, 400, 'VALIDATION_ERROR')
    }
  }
  const id = isValidId(body.id) ? body.id : `${type.slice(0, 2)}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`
  const slug = isValidSlug(body.slug) ? body.slug : id.toLowerCase().replaceAll('_', '-')
  try {
    if (type === 'courses') {
      await env.DB.prepare(
        `INSERT INTO courses (id, faculty_id, slug, title, summary, level, status, duration_minutes, lesson_count, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM courses), 1))`,
      ).bind(id, body.facultyId || 'faculty-market', slug, body.title, body.summary, body.level || 'Beginner', body.status || 'Draft', Number(body.durationMinutes) || 0, Number(body.lessonCount) || 0).run()
    } else if (type === 'lessons') {
      await env.DB.prepare(
        `INSERT INTO lessons (id, chapter_id, slug, title, summary, body, reading_minutes, status, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM lessons WHERE chapter_id = ?), 1))`,
      ).bind(id, body.chapterId || 'chapter-crypto-03', slug, body.title, body.summary || '', body.body || '', Number(body.readingMinutes) || 10, body.status || 'Draft', body.chapterId || 'chapter-crypto-03').run()
    } else if (type === 'questions') {
      const options = Array.isArray(body.options) ? JSON.stringify(body.options) : body.options
      await env.DB.prepare(
        `INSERT INTO questions (id, quiz_id, prompt, options_json, correct_option, explanation, difficulty, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(id, body.quizId || 'quiz-crypto-03', body.prompt, options || '[]', body.correctOption || '0', body.explanation || '', body.difficulty || 'Medium', body.status || 'Draft').run()
    } else if (type === 'glossary') {
      await env.DB.prepare(
        `INSERT INTO glossary_entries (id, slug, term, full_name, simple_definition, expert_definition, category, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(id, slug, body.term || body.title, body.fullName || '', body.simpleDefinition || body.summary || '', body.expertDefinition || '', body.category || 'General', body.status || 'Draft').run()
    } else {
      await env.DB.prepare(
        `INSERT INTO library_resources (id, slug, title, author, summary, category, level, resource_type, access_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(id, slug, body.title, body.author || '', body.summary || '', body.category || 'General', body.level || 'All', body.resourceType || 'Article', body.accessType || 'LegalLink', body.status || 'Draft').run()
    }
  } catch {
    return error(request, env, 'ذخیره محتوا انجام نشد؛ شناسه یا slug تکراری است.', 409, 'CONTENT_CONFLICT')
  }
  return json(request, env, { data: { id, slug, type }, message: 'محتوا با موفقیت ایجاد شد.' }, 201)
}

async function updateMasterContent(request: Request, env: Env, type: ContentType, id: string): Promise<Response> {
  const permission = requireMaster(request, env)
  if (permission) return permission
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const allowedFields: Record<ContentType, Record<string, { column: string; maxLength: number }>> = {
    courses: {
      slug: { column: 'slug', maxLength: 100 }, title: { column: 'title', maxLength: 300 }, summary: { column: 'summary', maxLength: 5000 }, level: { column: 'level', maxLength: 50 }, status: { column: 'status', maxLength: 20 }, durationMinutes: { column: 'duration_minutes', maxLength: 6 }, lessonCount: { column: 'lesson_count', maxLength: 6 },
    },
    lessons: {
      slug: { column: 'slug', maxLength: 100 }, title: { column: 'title', maxLength: 300 }, summary: { column: 'summary', maxLength: 5000 }, body: { column: 'body', maxLength: 30000 }, readingMinutes: { column: 'reading_minutes', maxLength: 6 }, status: { column: 'status', maxLength: 20 },
    },
    questions: {
      prompt: { column: 'prompt', maxLength: 5000 }, options: { column: 'options_json', maxLength: 10000 }, correctOption: { column: 'correct_option', maxLength: 10 }, explanation: { column: 'explanation', maxLength: 5000 }, difficulty: { column: 'difficulty', maxLength: 30 }, status: { column: 'status', maxLength: 20 },
    },
    glossary: {
      slug: { column: 'slug', maxLength: 100 }, term: { column: 'term', maxLength: 200 }, fullName: { column: 'full_name', maxLength: 300 }, simpleDefinition: { column: 'simple_definition', maxLength: 5000 }, expertDefinition: { column: 'expert_definition', maxLength: 10000 }, category: { column: 'category', maxLength: 100 }, status: { column: 'status', maxLength: 20 },
    },
    library: {
      slug: { column: 'slug', maxLength: 100 }, title: { column: 'title', maxLength: 300 }, author: { column: 'author', maxLength: 300 }, summary: { column: 'summary', maxLength: 5000 }, category: { column: 'category', maxLength: 100 }, level: { column: 'level', maxLength: 50 }, resourceType: { column: 'resource_type', maxLength: 50 }, accessType: { column: 'access_type', maxLength: 50 }, status: { column: 'status', maxLength: 20 },
    },
  }
  const fields = allowedFields[type]
  const updates: string[] = []
  const values: unknown[] = []
  for (const [key, definition] of Object.entries(fields)) {
    if (!(key in body)) continue
    if (key === 'status' && (typeof body[key] !== 'string' || !['Draft', 'Review', 'Published', 'Archived'].includes(body[key] as string))) {
      return error(request, env, 'وضعیت انتشار معتبر نیست.', 400, 'INVALID_STATUS')
    }
    if (key === 'slug' && !isValidSlug(body[key])) return error(request, env, 'slug معتبر نیست.', 400, 'INVALID_SLUG')
    if (key !== 'durationMinutes' && key !== 'lessonCount' && key !== 'readingMinutes' && key !== 'options' && !stringField(body[key], definition.maxLength)) {
      return error(request, env, `فیلد ${key} معتبر نیست.`, 400, 'VALIDATION_ERROR')
    }
    if (key === 'durationMinutes' || key === 'lessonCount' || key === 'readingMinutes') {
      const numeric = Number(body[key])
      if (!Number.isInteger(numeric) || numeric < 0 || numeric > 100000) return error(request, env, `فیلد ${key} معتبر نیست.`, 400, 'VALIDATION_ERROR')
      values.push(numeric)
    } else if (key === 'options') {
      values.push(Array.isArray(body[key]) ? JSON.stringify(body[key]) : body[key])
    } else {
      values.push(body[key])
    }
    updates.push(`${definition.column} = ?`)
  }
  if (!updates.length) return error(request, env, 'حداقل یک فیلد برای ویرایش لازم است.', 400, 'NO_UPDATES')
  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)
  try {
    const result = await env.DB.prepare(`UPDATE ${contentTables[type].table} SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
    if (!result.meta.changes) return error(request, env, 'محتوای موردنظر پیدا نشد.', 404, 'CONTENT_NOT_FOUND')
  } catch {
    return error(request, env, 'ویرایش محتوا انجام نشد؛ مقدار تکراری یا نامعتبر است.', 409, 'CONTENT_CONFLICT')
  }
  return json(request, env, { data: { id, type }, message: 'محتوا با موفقیت ویرایش شد.' })
}

async function archiveMasterContent(request: Request, env: Env, type: ContentType, id: string): Promise<Response> {
  const permission = requireMaster(request, env)
  if (permission) return permission
  const result = await env.DB.prepare(`UPDATE ${contentTables[type].table} SET status = 'Archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run()
  if (!result.meta.changes) return error(request, env, 'محتوای موردنظر پیدا نشد.', 404, 'CONTENT_NOT_FOUND')
  return json(request, env, { data: { id, type, status: 'Archived' }, message: 'محتوا بایگانی شد.' })
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) })
  if (path === '/api/health' && request.method === 'GET') {
    try {
      await env.DB.prepare('SELECT 1 AS ok').first()
      return json(request, env, { status: 'ok', environment: env.ENVIRONMENT || 'unknown', database: 'connected' })
    } catch {
      return error(request, env, 'اتصال پایگاه داده برقرار نیست.', 503, 'DATABASE_UNAVAILABLE')
    }
  }
  if (path === '/api/v1/courses' && request.method === 'GET') return listCourses(request, env)
  const courseMatch = path.match(/^\/api\/v1\/courses\/([a-z0-9-]+)$/)
  if (courseMatch && request.method === 'GET') return courseDetail(request, env, courseMatch[1])
  const chapterMatch = path.match(/^\/api\/v1\/chapters\/([a-zA-Z0-9_-]+)$/)
  if (chapterMatch && request.method === 'GET') return chapterDetail(request, env, chapterMatch[1])
  const lessonMatch = path.match(/^\/api\/v1\/lessons\/([a-z0-9-]+)$/)
  if (lessonMatch && request.method === 'GET') return lessonDetail(request, env, lessonMatch[1])
  if (path === '/api/v1/progress' && request.method === 'POST') return updateProgress(request, env)
  const contentMatch = path.match(/^\/api\/v1\/master\/content\/(courses|lessons|questions|glossary|library)$/)
  if (contentMatch && (request.method === 'GET' || request.method === 'POST')) {
    const type = contentMatch[1] as ContentType
    return request.method === 'GET' ? listMasterContent(request, env, type) : createMasterContent(request, env, type)
  }
  const contentDetailMatch = path.match(/^\/api\/v1\/master\/content\/(courses|lessons|questions|glossary|library)\/([a-zA-Z0-9_-]{2,80})$/)
  if (contentDetailMatch && (request.method === 'PATCH' || request.method === 'DELETE')) {
    const type = contentDetailMatch[1] as ContentType
    const id = contentDetailMatch[2]
    return request.method === 'PATCH' ? updateMasterContent(request, env, type, id) : archiveMasterContent(request, env, type, id)
  }
  return error(request, env, 'مسیر موردنظر پیدا نشد.', 404, 'NOT_FOUND')
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handleRequest(request, env)
    } catch {
      return error(request, env, 'خطای داخلی سرویس.', 500, 'INTERNAL_ERROR')
    }
  },
}
