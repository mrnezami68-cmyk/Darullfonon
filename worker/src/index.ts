export interface Env {
  DB: D1Database
  ENVIRONMENT?: string
  ALLOWED_ORIGIN?: string
  CLERK_JWT_KEY?: string
  CLERK_JWT_ISSUER?: string
  CLERK_JWT_AUDIENCE?: string
  CLERK_AUTHORIZED_PARTIES?: string
  BOOTSTRAP_ADMIN_PROVIDER_SUBJECT?: string
}

type ContentType = 'courses' | 'lessons' | 'questions' | 'glossary' | 'library'
type AppRole = 'student' | 'teacher' | 'master' | 'admin'
type AppStatus = 'active' | 'pending' | 'rejected' | 'suspended'

type ClerkClaims = {
  sub?: unknown
  iss?: unknown
  exp?: unknown
  nbf?: unknown
  jti?: unknown
  azp?: unknown
  aud?: unknown
  email?: unknown
  email_verified?: unknown
  first_name?: unknown
  last_name?: unknown
  given_name?: unknown
  family_name?: unknown
  name?: unknown
}

type AuthIdentity = {
  subject: string
  provider: 'clerk'
  email: string | null
  emailVerified: boolean
  firstName: string
  lastName: string
  jti: string
  expiresAt: number
}

type AppUser = {
  id: string
  provider: 'clerk'
  provider_subject: string
  role: AppRole
  status: AppStatus
  email: string | null
  email_verified: number
  login_identifier: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
}

type AuthContext = { identity: AuthIdentity; user: AppUser }
type GuardResult = AuthContext | Response

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
const AUTH_TOKEN_LIMIT = 16 * 1024
const identifierTransliteration: Record<string, string> = {
  آ: 'a', ا: 'a', ب: 'b', پ: 'p', ت: 't', ث: 's', ج: 'j', چ: 'ch', ح: 'h', خ: 'kh', د: 'd', ذ: 'z', ر: 'r', ز: 'z', ژ: 'zh', س: 's', ش: 'sh', ص: 's', ض: 'z', ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'gh', ک: 'k', گ: 'g', ل: 'l', م: 'm', ن: 'n', و: 'v', ه: 'h', ی: 'y', ي: 'y', ئ: 'y', ء: '', ة: 'h', ٱ: 'a',
}

function allowedOrigin(request: Request, env: Env): string {
  const origin = request.headers.get('Origin')
  const configured = (env.ALLOWED_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean)
  if (!configured.length) return 'null'
  if (origin && configured.includes(origin)) return origin
  return 'null'
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(request, env),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'Retry-After',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    Vary: 'Origin',
  }
}

function json(request: Request, env: Env, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request, env), 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function empty(request: Request, env: Env, status = 204): Response {
  return new Response(null, { status, headers: corsHeaders(request, env) })
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

function isValidEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function optionalString(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === '') return ''
  return typeof value === 'string' && value.trim().length <= maxLength ? value.trim() : null
}

async function hashRateKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function enforceRateLimit(request: Request, env: Env, key: string, maxRequests: number, windowSeconds: number): Promise<Response | null> {
  const now = Math.floor(Date.now() / 1000)
  const windowStarted = Math.floor(now / windowSeconds) * windowSeconds
  const bucketKey = await hashRateKey(`${key}:${windowSeconds}`)
  await env.DB.prepare(
    `INSERT INTO rate_limit_buckets (bucket_key, window_started, request_count)
     VALUES (?, ?, 1)
     ON CONFLICT(bucket_key) DO UPDATE SET
       window_started = CASE WHEN rate_limit_buckets.window_started = ? THEN rate_limit_buckets.window_started ELSE ? END,
       request_count = CASE WHEN rate_limit_buckets.window_started = ? THEN rate_limit_buckets.request_count + 1 ELSE 1 END,
       updated_at = CURRENT_TIMESTAMP`,
  ).bind(bucketKey, windowStarted, windowStarted, windowStarted, windowStarted).run()
  const bucket = await env.DB.prepare('SELECT request_count FROM rate_limit_buckets WHERE bucket_key = ? LIMIT 1').bind(bucketKey).first<{ request_count: number }>()
  if (!bucket || Number(bucket.request_count) <= maxRequests) return null
  const retryAfter = Math.max(1, windowStarted + windowSeconds - now)
  return new Response(JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'تعداد درخواست‌ها بیش از حد مجاز است.' } }), {
    status: 429,
    headers: { ...corsHeaders(request, env), 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': String(retryAfter) },
  })
}

function requestIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown'
}

function base64UrlBytes(value: string): Uint8Array {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function decodeJwtPart<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(value))) as T
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/g, '').replace(/\s/g, '')
  return base64UrlBytes(base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')).buffer as ArrayBuffer
}

function claimString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function claimBoolean(value: unknown): boolean {
  return value === true || value === 'true'
}

async function verifyClerkToken(request: Request, env: Env): Promise<AuthIdentity | Response> {
  const authorization = request.headers.get('Authorization') || ''
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i)
  if (!match) return error(request, env, 'ورود به حساب لازم است.', 401, 'AUTHENTICATION_REQUIRED')
  const token = match[1]
  if (token.length > AUTH_TOKEN_LIMIT) return error(request, env, 'توکن معتبر نیست.', 401, 'INVALID_TOKEN')
  if (!env.CLERK_JWT_KEY || !env.CLERK_JWT_ISSUER) return error(request, env, 'سرویس احراز هویت پیکربندی نشده است.', 503, 'AUTH_CONFIGURATION_REQUIRED')
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('invalid token shape')
    const header = decodeJwtPart<{ alg?: string }>(parts[0])
    const claims = decodeJwtPart<ClerkClaims>(parts[1])
    if (header.alg !== 'RS256') throw new Error('unsupported algorithm')
    const key = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(env.CLERK_JWT_KEY),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const signatureValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      base64UrlBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    )
    const now = Math.floor(Date.now() / 1000)
    const subject = claimString(claims.sub)
    const issuer = claimString(claims.iss)
    const expiresAt = typeof claims.exp === 'number' ? claims.exp : 0
    const notBefore = typeof claims.nbf === 'number' ? claims.nbf : 0
    const jti = claimString(claims.jti)
    const authorizedParties = (env.CLERK_AUTHORIZED_PARTIES || env.ALLOWED_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean)
    const azp = claimString(claims.azp)
    const expectedAudience = (env.CLERK_JWT_AUDIENCE || '').trim()
    const tokenAudiences = Array.isArray(claims.aud) ? claims.aud.map(claimString).filter((value): value is string => Boolean(value)) : [claimString(claims.aud)].filter((value): value is string => Boolean(value))
    if (!signatureValid || !subject || !issuer || issuer !== env.CLERK_JWT_ISSUER || typeof claims.exp !== 'number' || expiresAt <= now || typeof claims.nbf !== 'number' || notBefore > now || !jti) throw new Error('invalid claims')
    if (expectedAudience && !tokenAudiences.includes(expectedAudience)) throw new Error('invalid audience')
    if (!azp || !authorizedParties.length || !authorizedParties.includes(azp)) throw new Error('invalid authorized party')
    return {
      subject,
      provider: 'clerk',
      email: claimString(claims.email),
      emailVerified: claimBoolean(claims.email_verified),
      firstName: claimString(claims.first_name) || claimString(claims.given_name) || '',
      lastName: claimString(claims.last_name) || claimString(claims.family_name) || '',
      jti,
      expiresAt,
    }
  } catch {
    return error(request, env, 'توکن معتبر نیست.', 401, 'INVALID_TOKEN')
  }
}

async function getAuthContext(request: Request, env: Env): Promise<AuthContext | Response> {
  const identity = await authenticateIdentity(request, env)
  if (identity instanceof Response) return identity
  let user = await findUserBySubject(env, identity.subject)
  if (!user && !identity.emailVerified) return error(request, env, 'حساب باید ایمیل تأییدشده داشته باشد.', 403, 'EMAIL_VERIFICATION_REQUIRED')
  if (!user && env.BOOTSTRAP_ADMIN_PROVIDER_SUBJECT === identity.subject) {
    const created = await createUser(request, env, identity, 'admin', 'active')
    if (created instanceof Response) return created
    user = created
    await env.DB.prepare(`INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata_json) VALUES (?, ?, 'admin.bootstrap', 'user', ?, '{}')`).bind(crypto.randomUUID(), user.id, user.id).run()
  }
  if (!user) return error(request, env, 'ثبت‌نام این حساب هنوز تکمیل نشده است.', 403, 'ONBOARDING_REQUIRED')
  if (user.status === 'suspended') return error(request, env, 'این حساب موقتاً غیرفعال است.', 403, 'ACCOUNT_SUSPENDED')
  if (!identity.emailVerified) return error(request, env, 'حساب باید ایمیل تأییدشده داشته باشد.', 403, 'EMAIL_VERIFICATION_REQUIRED')
  return { identity, user }
}

async function requireUserRole(request: Request, env: Env, roles: AppRole[]): Promise<GuardResult> {
  const auth = await getAuthContext(request, env)
  if (auth instanceof Response) return auth
  if (!roles.includes(auth.user.role)) return error(request, env, 'برای این عملیات مجوز کافی ندارید.', 403, 'INSUFFICIENT_ROLE')
  return auth
}

async function requireRole(request: Request, env: Env, roles: AppRole[]): Promise<GuardResult> {
  const auth = await requireUserRole(request, env, roles)
  if (auth instanceof Response) return auth
  if (auth.user.status !== 'active') return error(request, env, 'برای این عملیات مجوز کافی ندارید.', 403, 'INSUFFICIENT_ROLE')
  return auth
}

function canonicalIdentifierBase(identity: AuthIdentity): string {
  const raw = `${identity.firstName} ${identity.lastName}`.trim() || (identity.email || '').split('@')[0]
  const transliterated = Array.from(raw.normalize('NFKC')).map((character) => identifierTransliteration[character] ?? character).join('')
  const base = transliterated.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36)
  return base || `user-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`
}

function identifierSuffix(role: AppRole): string {
  if (role === 'student') return '@sd'
  if (role === 'teacher' || role === 'master') return '@mt'
  return '@internal'
}

function userFields(identity: AuthIdentity, role: AppRole, status: AppStatus, identifier: string, id: string): unknown[] {
  return [id, identity.provider, identity.subject, role, status, identity.email, identity.emailVerified ? 1 : 0, identifier, identity.firstName, identity.lastName]
}

async function createUser(request: Request, env: Env, identity: AuthIdentity, role: AppRole, status: AppStatus): Promise<AppUser | Response> {
  const base = canonicalIdentifierBase(identity)
  const suffix = identifierSuffix(role)
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const identifier = `${base}${attempt ? `-${attempt + 1}` : ''}${suffix}`
    const id = crypto.randomUUID()
    try {
      await env.DB.prepare(
        `INSERT INTO users (id, provider, provider_subject, role, status, email, email_verified, login_identifier, first_name, last_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(...userFields(identity, role, status, identifier, id)).run()
      const created = await env.DB.prepare(
        `SELECT id, provider, provider_subject, role, status, email, email_verified, login_identifier,
                first_name, last_name, created_at, updated_at, verified_at, verified_by, rejection_reason
         FROM users WHERE id = ? LIMIT 1`,
      ).bind(id).first<AppUser>()
      if (created) return created
    } catch {
      const sameSubject = await env.DB.prepare('SELECT id FROM users WHERE provider_subject = ? LIMIT 1').bind(identity.subject).first()
      if (sameSubject) return error(request, env, 'این حساب قبلاً ثبت شده است.', 409, 'ACCOUNT_ALREADY_EXISTS')
    }
  }
  return error(request, env, 'ساخت شناسه ورود انجام نشد.', 409, 'IDENTIFIER_CONFLICT')
}

async function createTeacherUserAndApplication(request: Request, env: Env, identity: AuthIdentity, teachingField: string, bio: string): Promise<AppUser | Response> {
  const base = canonicalIdentifierBase(identity)
  const suffix = identifierSuffix('teacher')
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const identifier = `${base}${attempt ? `-${attempt + 1}` : ''}${suffix}`
    const userId = crypto.randomUUID()
    const applicationId = crypto.randomUUID()
    try {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO users (id, provider, provider_subject, role, status, email, email_verified, login_identifier, first_name, last_name)
           VALUES (?, ?, ?, 'teacher', 'pending', ?, ?, ?, ?, ?)`,
        ).bind(userId, identity.provider, identity.subject, identity.email, identity.emailVerified ? 1 : 0, identifier, identity.firstName, identity.lastName),
        env.DB.prepare(
          `INSERT INTO teacher_applications (id, user_id, status, teaching_field, bio) VALUES (?, ?, 'pending', ?, ?)`,
        ).bind(applicationId, userId, teachingField, bio),
      ])
      const created = await findUserBySubject(env, identity.subject)
      if (created) return created
    } catch {
      const sameSubject = await findUserBySubject(env, identity.subject)
      if (sameSubject) return error(request, env, 'این حساب قبلاً ثبت شده است.', 409, 'ACCOUNT_ALREADY_EXISTS')
    }
  }
  return error(request, env, 'ساخت شناسه ورود انجام نشد.', 409, 'IDENTIFIER_CONFLICT')
}

async function parseBody(request: Request, env: Env): Promise<{ body?: Record<string, unknown>; response?: Response }> {
  const contentLength = Number(request.headers.get('Content-Length') || 0)
  if (contentLength > JSON_LIMIT) return { response: error(request, env, 'حجم درخواست بیش از حد مجاز است.', 413, 'PAYLOAD_TOO_LARGE') }
  try {
    const bytes = await request.arrayBuffer()
    if (bytes.byteLength > JSON_LIMIT) return { response: error(request, env, 'حجم درخواست بیش از حد مجاز است.', 413, 'PAYLOAD_TOO_LARGE') }
    const body = JSON.parse(new TextDecoder().decode(bytes))
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { response: error(request, env, 'بدنه درخواست معتبر نیست.', 400, 'INVALID_BODY') }
    }
    return { body: body as Record<string, unknown> }
  } catch {
    return { response: error(request, env, 'بدنه درخواست باید JSON معتبر باشد.', 400, 'INVALID_JSON') }
  }
}

function publicUser(user: AppUser): Record<string, unknown> {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    email: user.email,
    emailVerified: Boolean(user.email_verified),
    loginIdentifier: user.role === 'admin' ? null : user.login_identifier,
    firstName: user.first_name,
    lastName: user.last_name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    rejectionReason: user.rejection_reason,
  }
}

function publicIdentity(identity: AuthIdentity): Record<string, unknown> {
  return {
    provider: identity.provider,
    email: identity.email,
    emailVerified: identity.emailVerified,
    firstName: identity.firstName,
    lastName: identity.lastName,
  }
}

async function findUserBySubject(env: Env, subject: string): Promise<AppUser | null> {
  return env.DB.prepare(
    `SELECT id, provider, provider_subject, role, status, email, email_verified, login_identifier,
            first_name, last_name, created_at, updated_at, verified_at, verified_by, rejection_reason
     FROM users WHERE provider_subject = ? LIMIT 1`,
  ).bind(subject).first<AppUser>()
}

async function tokenIsRevoked(env: Env, jti: string): Promise<boolean> {
  const revoked = await env.DB.prepare('SELECT jti FROM auth_revoked_tokens WHERE jti = ? AND expires_at > ? LIMIT 1').bind(jti, Math.floor(Date.now() / 1000)).first()
  return Boolean(revoked)
}

async function authenticateIdentity(request: Request, env: Env): Promise<AuthIdentity | Response> {
  const identity = await verifyClerkToken(request, env)
  if (identity instanceof Response) return identity
  if (await tokenIsRevoked(env, identity.jti)) return error(request, env, 'نشست معتبر نیست.', 401, 'SESSION_REVOKED')
  return identity
}

async function authMe(request: Request, env: Env): Promise<Response> {
  const identity = await authenticateIdentity(request, env)
  if (identity instanceof Response) return identity
  let user = await findUserBySubject(env, identity.subject)
  if (!user && !identity.emailVerified) return error(request, env, 'حساب باید ایمیل تأییدشده داشته باشد.', 403, 'EMAIL_VERIFICATION_REQUIRED')
  if (!user && env.BOOTSTRAP_ADMIN_PROVIDER_SUBJECT === identity.subject) {
    const created = await createUser(request, env, identity, 'admin', 'active')
    if (created instanceof Response) return created
    user = created
    await env.DB.prepare(`INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata_json) VALUES (?, ?, 'admin.bootstrap', 'user', ?, '{}')`).bind(crypto.randomUUID(), user.id, user.id).run()
  }
  if (user && !identity.emailVerified) return error(request, env, 'حساب باید ایمیل تأییدشده داشته باشد.', 403, 'EMAIL_VERIFICATION_REQUIRED')
  return json(request, env, {
    data: {
      authenticated: true,
      onboarded: Boolean(user),
      identity: publicIdentity(identity),
      user: user ? publicUser(user) : null,
    },
  })
}

async function onboardStudent(request: Request, env: Env): Promise<Response> {
  const identity = await authenticateIdentity(request, env)
  if (identity instanceof Response) return identity
  const rate = await enforceRateLimit(request, env, `student-onboarding:${identity.subject}`, 5, 3600)
  if (rate) return rate
  if (!identity.emailVerified) return error(request, env, 'حساب OAuth باید ابتدا تأیید ایمیل داشته باشد.', 403, 'EMAIL_VERIFICATION_REQUIRED')
  const existing = await findUserBySubject(env, identity.subject)
  if (existing) {
    if (existing.role !== 'student') return error(request, env, 'این هویت قبلاً برای یک حساب Staff یا Teacher استفاده شده است.', 409, 'ACCOUNT_ROLE_CONFLICT')
    return json(request, env, { data: publicUser(existing) })
  }
  const created = await createUser(request, env, identity, 'student', 'active')
  if (created instanceof Response) return created
  return json(request, env, { data: publicUser(created), message: 'حساب Student فعال شد.' }, 201)
}

async function applyTeacher(request: Request, env: Env): Promise<Response> {
  const identity = await authenticateIdentity(request, env)
  if (identity instanceof Response) return identity
  const subjectRate = await enforceRateLimit(request, env, `teacher-application:${identity.subject}`, 3, 3600)
  if (subjectRate) return subjectRate
  const ipRate = await enforceRateLimit(request, env, `teacher-application-ip:${requestIp(request)}`, 20, 3600)
  if (ipRate) return ipRate
  if (!identity.emailVerified) return error(request, env, 'حساب OAuth باید ابتدا تأیید ایمیل داشته باشد.', 403, 'EMAIL_VERIFICATION_REQUIRED')
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const teachingField = optionalString(body.teachingField, 160)
  const bio = optionalString(body.bio, 2000)
  if (teachingField === null || bio === null || !teachingField) return error(request, env, 'حوزه تدریس معتبر و الزامی است.', 400, 'VALIDATION_ERROR')
  const existing = await findUserBySubject(env, identity.subject)
  if (existing) {
    if (existing.role !== 'teacher') return error(request, env, 'این هویت قبلاً برای یک حساب دیگر ثبت شده است.', 409, 'ACCOUNT_ROLE_CONFLICT')
    if (existing.status === 'pending') return json(request, env, { data: publicUser(existing), message: 'درخواست Teacher قبلاً ثبت شده است.' })
    if (existing.status === 'active') return error(request, env, 'حساب Teacher شما قبلاً فعال است.', 409, 'APPLICATION_ALREADY_APPROVED')
    if (existing.status === 'suspended') return error(request, env, 'این حساب موقتاً غیرفعال است.', 403, 'ACCOUNT_SUSPENDED')
    const application = await env.DB.prepare('SELECT id FROM teacher_applications WHERE user_id = ? LIMIT 1').bind(existing.id).first<{ id: string }>()
    if (!application) return error(request, env, 'درخواست Teacher پیدا نشد.', 409, 'APPLICATION_NOT_FOUND')
    await env.DB.batch([
      env.DB.prepare(`UPDATE users SET status = 'pending', rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'rejected'`).bind(existing.id),
      env.DB.prepare(`UPDATE teacher_applications SET status = 'pending', teaching_field = ?, bio = ?, rejection_reason = NULL, reviewed_at = NULL, reviewed_by = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'rejected'`).bind(teachingField, bio, application.id),
    ])
    const refreshed = await findUserBySubject(env, identity.subject)
    return json(request, env, { data: refreshed ? publicUser(refreshed) : null, message: 'درخواست Teacher دوباره در وضعیت بررسی قرار گرفت.' })
  }
  const created = await createTeacherUserAndApplication(request, env, identity, teachingField, bio)
  if (created instanceof Response) return created
  return json(request, env, { data: publicUser(created), message: 'درخواست Teacher ثبت شد و در انتظار بررسی Admin است.' }, 201)
}

async function teacherApplication(request: Request, env: Env): Promise<Response> {
  const auth = await requireUserRole(request, env, ['teacher'])
  if (auth instanceof Response) return auth
  const application = await env.DB.prepare(
    `SELECT id, status, teaching_field, bio, reviewed_at, rejection_reason, created_at, updated_at
     FROM teacher_applications WHERE user_id = ? LIMIT 1`,
  ).bind(auth.user.id).first()
  if (!application) return error(request, env, 'درخواست Teacher پیدا نشد.', 404, 'APPLICATION_NOT_FOUND')
  return json(request, env, { data: application })
}

async function logout(request: Request, env: Env): Promise<Response> {
  const identity = await authenticateIdentity(request, env)
  if (identity instanceof Response) return identity
  await env.DB.prepare('INSERT OR REPLACE INTO auth_revoked_tokens (jti, expires_at) VALUES (?, ?)').bind(identity.jti, identity.expiresAt).run()
  await env.DB.prepare('DELETE FROM auth_revoked_tokens WHERE expires_at <= ?').bind(Math.floor(Date.now() / 1000)).run()
  return empty(request, env)
}

async function listTeacherApplications(request: Request, env: Env): Promise<Response> {
  const auth = await requireRole(request, env, ['admin'])
  if (auth instanceof Response) return auth
  const url = new URL(request.url)
  const requestedStatus = url.searchParams.get('status') || 'pending'
  const statuses: AppStatus[] = ['active', 'pending', 'rejected', 'suspended']
  if (!statuses.includes(requestedStatus as AppStatus)) return error(request, env, 'وضعیت درخواست معتبر نیست.', 400, 'INVALID_STATUS')
  const requestedLimit = Number(url.searchParams.get('limit') || 50)
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50
  const { results } = await env.DB.prepare(
    `SELECT ta.id, ta.user_id, ta.status, ta.teaching_field, ta.bio, ta.reviewed_at, ta.rejection_reason,
            ta.created_at, ta.updated_at, u.email, u.login_identifier, u.first_name, u.last_name
     FROM teacher_applications ta JOIN users u ON u.id = ta.user_id
     WHERE ta.status = ? ORDER BY ta.created_at ASC LIMIT ?`,
  ).bind(requestedStatus, limit).all()
  return json(request, env, { data: results })
}

async function reviewTeacherApplication(request: Request, env: Env, id: string, decision: 'approve' | 'reject'): Promise<Response> {
  const auth = await requireRole(request, env, ['admin'])
  if (auth instanceof Response) return auth
  const rate = await enforceRateLimit(request, env, `admin-review:${auth.user.id}`, 60, 60)
  if (rate) return rate
  const application = await env.DB.prepare('SELECT id, user_id, status FROM teacher_applications WHERE id = ? LIMIT 1').bind(id).first<{ id: string; user_id: string; status: AppStatus }>()
  if (!application) return error(request, env, 'درخواست Teacher پیدا نشد.', 404, 'APPLICATION_NOT_FOUND')
  if (application.status !== 'pending') return error(request, env, 'این درخواست قبلاً بررسی شده است.', 409, 'INVALID_STATUS_TRANSITION')
  let rejectionReason = ''
  if (decision === 'reject') {
    const parsed = await parseBody(request, env)
    if (parsed.response) return parsed.response
    const body = parsed.body || {}
    const value = optionalString(body.reason, 1000)
    if (value === null || !value) return error(request, env, 'دلیل رد درخواست الزامی است.', 400, 'VALIDATION_ERROR')
    rejectionReason = value
  }
  const nextStatus: AppStatus = decision === 'approve' ? 'active' : 'rejected'
  const updateUser = env.DB.prepare(
    `UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP, rejection_reason = ?
     WHERE id = ? AND role = 'teacher' AND status = 'pending'`,
  ).bind(nextStatus, rejectionReason || null, application.user_id)
  const updateApplication = env.DB.prepare(
    `UPDATE teacher_applications SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'pending'`,
  ).bind(nextStatus, auth.user.id, rejectionReason || null, id)
  const results = await env.DB.batch([updateUser, updateApplication])
  if (Number(results[0]?.meta?.changes || 0) !== 1 || Number(results[1]?.meta?.changes || 0) !== 1) return error(request, env, 'درخواست هم‌زمان تغییر کرده است.', 409, 'INVALID_STATUS_TRANSITION')
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata_json) VALUES (?, ?, ?, 'teacher_application', ?, ?)`,
  ).bind(crypto.randomUUID(), auth.user.id, decision === 'approve' ? 'teacher.approve' : 'teacher.reject', id, JSON.stringify({ userId: application.user_id })).run()
  return json(request, env, { data: { applicationId: id, status: nextStatus }, message: decision === 'approve' ? 'درخواست Teacher تأیید شد.' : 'درخواست Teacher رد شد.' })
}

async function suspendUser(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireRole(request, env, ['admin'])
  if (auth instanceof Response) return auth
  const rate = await enforceRateLimit(request, env, `admin-suspend:${auth.user.id}`, 30, 60)
  if (rate) return rate
  if (auth.user.id === id) return error(request, env, 'Admin نمی‌تواند حساب خودش را Suspend کند.', 400, 'SELF_SUSPENSION_NOT_ALLOWED')
  const result = await env.DB.batch([
    env.DB.prepare(`UPDATE users SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'suspended'`).bind(id),
    env.DB.prepare(`UPDATE teacher_applications SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status = 'active'`).bind(id),
  ])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return error(request, env, 'کاربر موردنظر پیدا نشد یا قبلاً Suspend است.', 404, 'USER_NOT_FOUND')
  await env.DB.prepare(`INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata_json) VALUES (?, ?, 'user.suspend', 'user', ?, '{}')`).bind(crypto.randomUUID(), auth.user.id, id).run()
  return json(request, env, { data: { id, status: 'suspended' }, message: 'حساب Suspend شد.' })
}

async function provisionMaster(request: Request, env: Env): Promise<Response> {
  const auth = await requireRole(request, env, ['admin'])
  if (auth instanceof Response) return auth
  const rate = await enforceRateLimit(request, env, `admin-provision:${auth.user.id}`, 10, 3600)
  if (rate) return rate
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const providerSubject = typeof body.providerSubject === 'string' ? body.providerSubject.trim() : ''
  const email = optionalString(body.email, 320)
  const firstName = optionalString(body.firstName, 120)
  const lastName = optionalString(body.lastName, 120)
  if (!/^[a-zA-Z0-9_:-]{8,160}$/.test(providerSubject) || email === null || (email !== '' && !isValidEmail(email)) || firstName === null || lastName === null) return error(request, env, 'اطلاعات دعوت Master معتبر نیست.', 400, 'VALIDATION_ERROR')
  if (await findUserBySubject(env, providerSubject)) return error(request, env, 'این هویت قبلاً Provision شده است.', 409, 'ACCOUNT_ALREADY_EXISTS')
  const identity: AuthIdentity = { subject: providerSubject, provider: 'clerk', email: email || null, emailVerified: false, firstName: firstName || '', lastName: lastName || '', jti: crypto.randomUUID(), expiresAt: Math.floor(Date.now() / 1000) + 60 }
  const created = await createUser(request, env, identity, 'master', 'active')
  if (created instanceof Response) return created
  await env.DB.prepare(`INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata_json) VALUES (?, ?, 'master.provision', 'user', ?, '{}')`).bind(crypto.randomUUID(), auth.user.id, created.id).run()
  return json(request, env, { data: publicUser(created), message: 'Master Provision شد. دعوت Provider باید جداگانه انجام شده باشد.' }, 201)
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
    `SELECT ch.id, ch.course_id, ch.level_id, ch.title, ch.summary, ch.objective, ch.estimated_minutes, ch.sort_order
     FROM chapters ch JOIN courses co ON co.id = ch.course_id
     WHERE ch.id = ? AND co.status = 'Published' LIMIT 1`,
  ).bind(chapterId).first()
  if (!chapter) return error(request, env, 'فصل موردنظر پیدا نشد.', 404, 'CHAPTER_NOT_FOUND')
  const { results: lessons } = await env.DB.prepare(
    `SELECT id, slug, title, summary, reading_minutes, status, sort_order
     FROM lessons WHERE chapter_id = ? AND status = 'Published' ORDER BY sort_order`,
  ).bind(chapterId).all()
  return json(request, env, { data: { chapter, lessons } })
}

async function lessonDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const lesson = await env.DB.prepare(
    `SELECT l.id, l.slug, l.chapter_id, l.title, l.summary, l.body, l.reading_minutes, l.status, l.sort_order,
       c.title AS chapter_title, co.slug AS course_slug, co.title AS course_title
     FROM lessons l JOIN chapters c ON c.id = l.chapter_id JOIN courses co ON co.id = c.course_id
     WHERE l.slug = ? AND l.status = 'Published' AND co.status = 'Published' LIMIT 1`,
  ).bind(slug).first()
  if (!lesson) return error(request, env, 'درس موردنظر پیدا نشد.', 404, 'LESSON_NOT_FOUND')
  return json(request, env, { data: lesson })
}

async function listGlossary(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const query = (url.searchParams.get('q') || '').trim()
  const category = (url.searchParams.get('category') || '').trim()
  const clauses = ["status = 'Published'"]
  const bindings: string[] = []
  if (query) {
    clauses.push('(term LIKE ? OR full_name LIKE ? OR simple_definition LIKE ?)')
    const pattern = `%${query}%`
    bindings.push(pattern, pattern, pattern)
  }
  if (category) {
    clauses.push('category = ?')
    bindings.push(category)
  }
  const { results } = await env.DB.prepare(
    `SELECT id, slug, term, full_name, simple_definition, expert_definition, category FROM glossary_entries WHERE ${clauses.join(' AND ')} ORDER BY term LIMIT 100`,
  ).bind(...bindings).all()
  return json(request, env, { data: results })
}

async function glossaryDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const entry = await env.DB.prepare(
    `SELECT id, slug, term, full_name, simple_definition, expert_definition, category FROM glossary_entries WHERE slug = ? AND status = 'Published' LIMIT 1`,
  ).bind(slug).first()
  if (!entry) return error(request, env, 'مدخل دانشنامه پیدا نشد.', 404, 'GLOSSARY_NOT_FOUND')
  return json(request, env, { data: entry })
}

async function listLibrary(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const category = (url.searchParams.get('category') || '').trim()
  const level = (url.searchParams.get('level') || '').trim()
  const type = (url.searchParams.get('type') || '').trim()
  const clauses = ["status = 'Published'"]
  const bindings: string[] = []
  if (category) { clauses.push('category = ?'); bindings.push(category) }
  if (level) { clauses.push('level = ?'); bindings.push(level) }
  if (type) { clauses.push('resource_type = ?'); bindings.push(type) }
  const { results } = await env.DB.prepare(
    `SELECT id, slug, title, author, summary, category, level, resource_type, access_type FROM library_resources WHERE ${clauses.join(' AND ')} ORDER BY title LIMIT 100`,
  ).bind(...bindings).all()
  return json(request, env, { data: results })
}

async function libraryDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const resource = await env.DB.prepare(
    `SELECT id, slug, title, author, summary, category, level, resource_type, access_type FROM library_resources WHERE slug = ? AND status = 'Published' LIMIT 1`,
  ).bind(slug).first()
  if (!resource) return error(request, env, 'منبع موردنظر پیدا نشد.', 404, 'LIBRARY_NOT_FOUND')
  return json(request, env, { data: resource })
}

async function quizDetail(request: Request, env: Env, id: string): Promise<Response> {
  const quiz = await env.DB.prepare(
    `SELECT q.id, q.chapter_id, q.title, q.passing_score, q.time_limit_minutes, q.attempts_allowed
     FROM quizzes q JOIN chapters ch ON ch.id = q.chapter_id JOIN courses co ON co.id = ch.course_id
     WHERE q.id = ? AND q.status = 'Published' AND co.status = 'Published' LIMIT 1`,
  ).bind(id).first()
  if (!quiz) return error(request, env, 'آزمون موردنظر پیدا نشد.', 404, 'QUIZ_NOT_FOUND')
  const { results } = await env.DB.prepare(
    `SELECT id, prompt, options_json, explanation, difficulty FROM questions WHERE quiz_id = ? AND status = 'Published' ORDER BY created_at, id`,
  ).bind(id).all()
  const questions = results.map((question) => {
    let options: unknown[] = []
    try { options = JSON.parse(String(question.options_json || '[]')) } catch { options = [] }
    return { id: question.id, prompt: question.prompt, options, explanation: question.explanation, difficulty: question.difficulty }
  })
  return json(request, env, { data: { ...quiz, questions } })
}

async function submitQuiz(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireRole(request, env, ['student', 'teacher'])
  if (auth instanceof Response) return auth
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const answers = body.answers
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return error(request, env, 'پاسخ‌های آزمون معتبر نیستند.', 400, 'INVALID_ANSWERS')
  const quiz = await env.DB.prepare(
    `SELECT q.id, q.passing_score
     FROM quizzes q JOIN chapters ch ON ch.id = q.chapter_id JOIN courses co ON co.id = ch.course_id
     WHERE q.id = ? AND q.status = 'Published' AND co.status = 'Published' LIMIT 1`,
  ).bind(id).first<{ id: string; passing_score: number }>()
  if (!quiz) return error(request, env, 'آزمون موردنظر پیدا نشد.', 404, 'QUIZ_NOT_FOUND')
  const { results: questions } = await env.DB.prepare(
    `SELECT id, correct_option FROM questions WHERE quiz_id = ? AND status = 'Published' ORDER BY created_at, id`,
  ).bind(id).all<{ id: string; correct_option: string }>()
  if (!questions.length) return error(request, env, 'این آزمون هنوز سؤال منتشرشده ندارد.', 409, 'QUIZ_EMPTY')
  const answerMap = answers as Record<string, unknown>
  let correct = 0
  for (const question of questions) {
    const submitted = answerMap[question.id]
    if (String(submitted) === String(question.correct_option)) correct += 1
  }
  const score = Math.round((correct / questions.length) * 100)
  const passed = score >= Number(quiz.passing_score)
  await env.DB.prepare(
    `INSERT INTO quiz_attempts (id, user_id, quiz_id, score, passed, answers_json) VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(`attempt-${crypto.randomUUID()}`, auth.user.id, id, score, passed ? 1 : 0, JSON.stringify(answers)).run()
  return json(request, env, { data: { quizId: id, score, passingScore: quiz.passing_score, passed, correct, total: questions.length } }, 201)
}

async function listProgress(request: Request, env: Env): Promise<Response> {
  const auth = await requireRole(request, env, ['student', 'teacher'])
  if (auth instanceof Response) return auth
  const { results } = await env.DB.prepare(
    `SELECT p.user_id, p.lesson_id, p.status, p.completed_at, p.updated_at, l.slug, l.title, l.chapter_id
     FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = ? ORDER BY p.updated_at DESC LIMIT 200`,
  ).bind(auth.user.id).all()
  return json(request, env, { data: results })
}

async function updateProgress(request: Request, env: Env): Promise<Response> {
  const auth = await requireRole(request, env, ['student', 'teacher'])
  if (auth instanceof Response) return auth
  const parsed = await parseBody(request, env)
  if (parsed.response) return parsed.response
  const body = parsed.body || {}
  const lessonId = body.lessonId
  const status = body.status
  const allowedStatuses = ['InProgress', 'Studied', 'Passed', 'NeedsReview']
  if (!isValidId(lessonId) || typeof status !== 'string' || !allowedStatuses.includes(status)) {
    return error(request, env, 'lessonId یا وضعیت پیشرفت معتبر نیست.', 400, 'INVALID_PROGRESS')
  }
  const lesson = await env.DB.prepare("SELECT id FROM lessons WHERE id = ? AND status = 'Published' LIMIT 1").bind(lessonId).first()
  if (!lesson) return error(request, env, 'درس موردنظر پیدا نشد.', 404, 'LESSON_NOT_FOUND')
  await env.DB.prepare(
    `INSERT INTO progress (user_id, lesson_id, status, completed_at, updated_at)
     VALUES (?, ?, ?, CASE WHEN ? IN ('Studied', 'Passed') THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = excluded.status, completed_at = excluded.completed_at, updated_at = CURRENT_TIMESTAMP`,
  ).bind(auth.user.id, lessonId, status, status).run()
  return json(request, env, { data: { userId: auth.user.id, lessonId, status } }, 201)
}

async function listMasterContent(request: Request, env: Env, type: ContentType): Promise<Response> {
  const auth = await requireRole(request, env, ['master'])
  if (auth instanceof Response) return auth
  const config = contentTables[type]
  const { results } = await env.DB.prepare(`SELECT ${config.fields} FROM ${config.table} ORDER BY created_at DESC LIMIT 200`).all()
  return json(request, env, { data: results })
}

async function createMasterContent(request: Request, env: Env, type: ContentType): Promise<Response> {
  const auth = await requireRole(request, env, ['master'])
  if (auth instanceof Response) return auth
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
  const auth = await requireRole(request, env, ['master'])
  if (auth instanceof Response) return auth
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
  const auth = await requireRole(request, env, ['master'])
  if (auth instanceof Response) return auth
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
  if (path === '/api/v1/auth/me' && request.method === 'GET') return authMe(request, env)
  if (path === '/api/v1/auth/logout' && request.method === 'POST') return logout(request, env)
  if (path === '/api/v1/auth/onboarding/student' && request.method === 'POST') return onboardStudent(request, env)
  if (path === '/api/v1/auth/teacher/application' && request.method === 'GET') return teacherApplication(request, env)
  if (path === '/api/v1/auth/teacher/application' && request.method === 'POST') return applyTeacher(request, env)
  if (path === '/api/v1/admin/teacher-applications' && request.method === 'GET') return listTeacherApplications(request, env)
  const approveTeacherMatch = path.match(/^\/api\/v1\/admin\/teacher-applications\/([a-zA-Z0-9-]{8,80})\/approve$/)
  if (approveTeacherMatch && request.method === 'POST') return reviewTeacherApplication(request, env, approveTeacherMatch[1], 'approve')
  const rejectTeacherMatch = path.match(/^\/api\/v1\/admin\/teacher-applications\/([a-zA-Z0-9-]{8,80})\/reject$/)
  if (rejectTeacherMatch && request.method === 'POST') return reviewTeacherApplication(request, env, rejectTeacherMatch[1], 'reject')
  const suspendUserMatch = path.match(/^\/api\/v1\/admin\/users\/([a-zA-Z0-9-]{8,80})\/suspend$/)
  if (suspendUserMatch && request.method === 'POST') return suspendUser(request, env, suspendUserMatch[1])
  if (path === '/api/v1/admin/master-provision' && request.method === 'POST') return provisionMaster(request, env)
  if (path === '/api/v1/courses' && request.method === 'GET') return listCourses(request, env)
  const courseMatch = path.match(/^\/api\/v1\/courses\/([a-z0-9-]+)$/)
  if (courseMatch && request.method === 'GET') return courseDetail(request, env, courseMatch[1])
  const chapterMatch = path.match(/^\/api\/v1\/chapters\/([a-zA-Z0-9_-]+)$/)
  if (chapterMatch && request.method === 'GET') return chapterDetail(request, env, chapterMatch[1])
  const lessonMatch = path.match(/^\/api\/v1\/lessons\/([a-z0-9-]+)$/)
  if (lessonMatch && request.method === 'GET') return lessonDetail(request, env, lessonMatch[1])
  const glossaryMatch = path.match(/^\/api\/v1\/glossary\/([a-z0-9-]+)$/)
  if (glossaryMatch && request.method === 'GET') return glossaryDetail(request, env, glossaryMatch[1])
  if (path === '/api/v1/glossary' && request.method === 'GET') return listGlossary(request, env)
  const libraryMatch = path.match(/^\/api\/v1\/library\/([a-z0-9-]+)$/)
  if (libraryMatch && request.method === 'GET') return libraryDetail(request, env, libraryMatch[1])
  if (path === '/api/v1/library' && request.method === 'GET') return listLibrary(request, env)
  const quizMatch = path.match(/^\/api\/v1\/quizzes\/([a-zA-Z0-9_-]+)$/)
  if (quizMatch && request.method === 'GET') return quizDetail(request, env, quizMatch[1])
  const quizSubmitMatch = path.match(/^\/api\/v1\/quizzes\/([a-zA-Z0-9_-]+)\/submit$/)
  if (quizSubmitMatch && request.method === 'POST') return submitQuiz(request, env, quizSubmitMatch[1])
  if (path === '/api/v1/progress' && request.method === 'GET') return listProgress(request, env)
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
