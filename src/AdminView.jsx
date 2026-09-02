import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Check, Clock3, RefreshCw, ShieldCheck, UserRound, Users, X } from 'lucide-react'
import { approveTeacherApplication, getTeacherApplications, rejectTeacherApplication } from './api'

function displayApplicant(application) {
  return [application.first_name, application.last_name].filter(Boolean).join(' ') || application.email || application.login_identifier
}

export default function AdminView({ appUser, onSignOut }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [rejectingId, setRejectingId] = useState('')
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setApplications(await getTeacherApplications('pending')) } catch (requestError) { setError(requestError.message || 'فهرست درخواست‌ها دریافت نشد.') } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(id) {
    setBusyId(id)
    setError('')
    try { await approveTeacherApplication(id); setApplications((current) => current.filter((item) => item.id !== id)) } catch (requestError) { setError(requestError.message || 'تأیید درخواست انجام نشد.') } finally { setBusyId('') }
  }

  async function reject(id) {
    if (!reason.trim()) return
    setBusyId(id)
    setError('')
    try { await rejectTeacherApplication(id, reason.trim()); setApplications((current) => current.filter((item) => item.id !== id)); setRejectingId(''); setReason('') } catch (requestError) { setError(requestError.message || 'رد درخواست انجام نشد.') } finally { setBusyId('') }
  }

  return <div className="master-shell admin-shell"><aside className="master-sidebar"><div className="master-brand"><span className="master-logo">✦</span><div><strong>دارالفنون</strong><small>پنل Admin</small></div></div><div className="master-profile"><span><ShieldCheck size={18} /></span><div><strong>{appUser?.firstName || 'Admin'}</strong><small>هویت و دسترسی</small></div></div><nav className="master-nav"><button type="button" className="active"><Users size={17} /><span>درخواست‌های Teacher</span><Clock3 size={14} /></button></nav><div className="master-sidebar-bottom"><button type="button" onClick={onSignOut}><ArrowLeft size={16} /> خروج از حساب</button><span>Authorization فقط سمت Worker</span></div></aside><div className="master-main"><header className="master-header"><div><span className="master-breadcrumb">Admin / Teacher Applications</span><h2>درخواست‌های Teacher</h2></div><div className="master-header-actions"><button type="button" className="admin-refresh-button" onClick={load} disabled={loading} aria-label="به‌روزرسانی"><RefreshCw size={17} className={loading ? 'rotate-180' : ''} /></button><span className="master-header-avatar"><UserRound size={16} /></span></div></header><main className="master-content admin-content"><div className="admin-intro"><div><span className="master-kicker">بررسی عضویت آموزشی</span><h1>درخواست‌های در انتظار</h1><p>Teacher حساب فعال را از Client دریافت نمی‌کند؛ فعال‌سازی فقط با تصمیم Backend و Admin انجام می‌شود.</p></div><div className="admin-count"><strong>{applications.length}</strong><span>در انتظار</span></div></div>{error && <div className="master-api-banner master-api-fallback" role="alert">{error}<button type="button" onClick={load}>تلاش دوباره</button></div>}{loading ? <div className="admin-empty"><span className="loading-spinner" /><strong>در حال دریافت درخواست‌ها...</strong></div> : applications.length === 0 ? <div className="admin-empty"><Check size={24} /><strong>درخواستی در انتظار نیست.</strong><span>هر درخواست جدید پس از ثبت در اینجا نمایش داده می‌شود.</span></div> : <div className="admin-application-list">{applications.map((application) => <article className="admin-application-card" key={application.id}><div className="admin-application-head"><span className="admin-applicant-avatar"><UserRound size={18} /></span><div><h3>{displayApplicant(application)}</h3><p>{application.email || 'ایمیل از Provider دریافت نشده'} · {application.login_identifier}</p></div><span className="admin-pending-tag"><Clock3 size={13} /> pending</span></div><div className="admin-application-details"><div><span>حوزه تدریس</span><strong>{application.teaching_field}</strong></div><div><span>تاریخ درخواست</span><strong>{application.created_at}</strong></div></div>{application.bio && <p className="admin-application-bio">{application.bio}</p>}{rejectingId === application.id && <div className="admin-reject-form"><label>دلیل رد درخواست<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength="1000" rows="3" autoFocus placeholder="دلیل قابل نمایش برای متقاضی" /></label><div><button type="button" className="admin-secondary-button" onClick={() => { setRejectingId(''); setReason('') }}>انصراف</button><button type="button" className="admin-danger-button" disabled={busyId === application.id || !reason.trim()} onClick={() => reject(application.id)}>{busyId === application.id ? 'در حال ثبت...' : 'تأیید رد درخواست'}</button></div></div>}{rejectingId !== application.id && <div className="admin-application-actions"><button type="button" className="admin-danger-button" disabled={busyId === application.id} onClick={() => { setRejectingId(application.id); setReason('') }}><X size={15} /> رد درخواست</button><button type="button" className="admin-primary-button" disabled={busyId === application.id} onClick={() => approve(application.id)}><Check size={15} /> {busyId === application.id ? 'در حال ثبت...' : 'تأیید و فعال‌سازی'}</button></div>}</article>)}</div>}</main></div></div>
}
