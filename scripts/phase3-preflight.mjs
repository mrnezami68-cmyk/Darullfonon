import { readFileSync } from 'node:fs'

const production = process.argv.includes('--production')
const failures = []

function required(name) {
  if (!process.env[name]?.trim()) failures.push(`${name} is missing`)
}

function origins(name, requireHttps = false) {
  const values = (process.env[name] || '').split(',').map((value) => value.trim()).filter(Boolean)
  if (!values.length) {
    failures.push(`${name} is missing`)
    return
  }
  for (const value of values) {
    try {
      const parsed = new URL(value)
      const validProtocol = parsed.protocol === 'https:' || (!requireHttps && parsed.protocol === 'http:')
      if (!validProtocol || parsed.origin !== value || parsed.username || parsed.password || parsed.pathname !== '/' && parsed.pathname !== '') {
        failures.push(`${name} contains a non-origin value`)
      }
    } catch {
      failures.push(`${name} contains an invalid URL`)
    }
  }
}

if (!production) {
  console.log('Phase 3 preflight: development mode; use --production for the release gate.')
  process.exit(0)
}

const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || ''
if (!publishableKey.startsWith('pk_live_')) failures.push('VITE_CLERK_PUBLISHABLE_KEY must be a live Clerk publishable key')
required('VITE_CLERK_JWT_TEMPLATE')
required('CLERK_JWT_KEY')
required('CLERK_JWT_ISSUER')
required('BOOTSTRAP_ADMIN_PROVIDER_SUBJECT')
origins('ALLOWED_ORIGIN', true)
origins('CLERK_AUTHORIZED_PARTIES', true)

try {
  const wrangler = readFileSync('wrangler.toml', 'utf8')
  const match = wrangler.match(/^database_id\s*=\s*"([^"]+)"/m)
  if (!match || !match[1] || match[1] === 'REPLACE_WITH_D1_DATABASE_ID') failures.push('wrangler.toml database_id is not configured')
  if (!/ENVIRONMENT\s*=\s*"production"/.test(wrangler)) failures.push('wrangler.toml ENVIRONMENT is not production')
} catch {
  failures.push('wrangler.toml could not be read')
}

if (failures.length) {
  console.error('Phase 3 production preflight: BLOCKED')
  for (const failure of failures) console.error(`- ${failure}`)
  console.error('No secret values were printed.')
  process.exit(1)
}

console.log('Phase 3 production preflight: PASS (presence/shape checks only)')
console.log('Provider API, Remote D1, OAuth browser flow and WAF still require live verification.')
