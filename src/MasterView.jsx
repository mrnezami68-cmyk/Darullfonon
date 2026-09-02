import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  BarChart3,
  BookMarked,
  BookOpen,
  Check,
  ChevronLeft,
  ClipboardCheck,
  FileQuestion,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Library,
  Layers3,
  Link2,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { archiveMasterContent, createMasterContent, getMasterContent, updateMasterContent } from './api'
import { useApiResource } from './useApiResource'

const masterNav = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'faculties', label: 'دانشکده‌ها', icon: Library },
  { id: 'courses', label: 'دوره‌ها', icon: GraduationCap },
  { id: 'levels', label: 'سطوح و فصل‌ها', icon: Layers3 },
  { id: 'lessons', label: 'درس‌ها', icon: BookOpen },
  { id: 'quizzes', label: 'آزمون‌ها', icon: ClipboardCheck },
  { id: 'assessments', label: 'Self Assessments', icon: FlaskConical },
  { id: 'questions', label: 'Question Bank', icon: FileQuestion },
  { id: 'glossary', label: 'Glossary', icon: BookMarked },
  { id: 'library', label: 'کتابخانه', icon: Library },
  { id: 'relations', label: 'روابط محتوا', icon: Link2 },
  { id: 'gamification', label: 'مدال‌ها و Achievement', icon: Trophy },
  { id: 'analytics', label: 'تحلیل', icon: BarChart3 },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
]

const initialRecords = {
  courses: [
    { id: 'cr-01', title: 'مبانی کریپتو', detail: 'کریپتو · مقدماتی · ۲۴ درس', status: 'Published', updated: 'امروز، ۱۰:۲۵' },
    { id: 'cr-02', title: 'اقتصاد برای تصمیم‌گیری', detail: 'اقتصاد کلان · مقدماتی · ۱۸ درس', status: 'Review', updated: 'دیروز، ۱۵:۰۸' },
    { id: 'cr-03', title: 'شروع تحلیل بنیادی', detail: 'تحلیل · متوسط · ۲۱ درس', status: 'Draft', updated: '۲۸ آگوست ۲۰۲۶' },
  ],
  lessons: [
    { id: 'ls-01', title: 'نگهداری امن دارایی', detail: 'مبانی کریپتو · فصل ۳ · ۱۲ دقیقه', status: 'Published', updated: 'امروز، ۰۹:۴۰' },
    { id: 'ls-02', title: 'کیف پول چیست؟', detail: 'مبانی کریپتو · فصل ۳ · ۸ دقیقه', status: 'Published', updated: 'امروز، ۰۹:۳۵' },
    { id: 'ls-03', title: 'چرخه‌های اقتصادی', detail: 'اقتصاد کلان · فصل ۱ · ۱۵ دقیقه', status: 'Review', updated: 'دیروز، ۱۲:۱۶' },
  ],
  quizzes: [
    { id: 'qz-01', title: 'آزمون فصل ۰۳ کریپتو', detail: 'مبانی کریپتو · ۸ سؤال · حدنصاب ۷۰٪', status: 'Published', updated: 'امروز، ۰۹:۱۵' },
    { id: 'qz-02', title: 'آزمون مقدماتی اقتصاد', detail: 'اقتصاد کلان · ۱۰ سؤال · حدنصاب ۷۰٪', status: 'Draft', updated: '۲۹ آگوست ۲۰۲۶' },
  ],
  questions: [
    { id: 'qn-01', title: 'عبارت بازیابی را کجا باید نگهداری کرد؟', detail: 'کریپتو · مقدماتی · آسان', status: 'Published', updated: 'امروز، ۰۹:۱۰' },
    { id: 'qn-02', title: 'تورم چه اثری بر قدرت خرید دارد؟', detail: 'اقتصاد · مقدماتی · متوسط', status: 'Review', updated: 'دیروز، ۱۱:۴۰' },
  ],
  glossary: [
    { id: 'gl-01', title: 'CPI', detail: 'اقتصاد · Consumer Price Index', status: 'Published', updated: '۲۸ آگوست ۲۰۲۶' },
    { id: 'gl-02', title: 'نرخ بهره', detail: 'اقتصاد · Interest Rate', status: 'Published', updated: '۲۷ آگوست ۲۰۲۶' },
    { id: 'gl-03', title: 'DXY', detail: 'بازارها · US Dollar Index', status: 'Draft', updated: '۲۶ آگوست ۲۰۲۶' },
  ],
  library: [
    { id: 'lb-01', title: 'راهنمای شروع تحلیل بنیادی', detail: 'مقاله · تحلیل · مقدماتی', status: 'Published', updated: '۲۹ آگوست ۲۰۲۶' },
    { id: 'lb-02', title: 'چک‌لیست مدیریت ریسک', detail: 'برگه تمرین · ریسک · همه سطوح', status: 'Review', updated: '۲۸ آگوست ۲۰۲۶' },
  ],
}

const sectionMeta = {
  courses: { title: 'دوره‌ها', singular: 'دوره', action: 'دوره جدید' },
  lessons: { title: 'درس‌ها', singular: 'درس', action: 'درس جدید' },
  quizzes: { title: 'آزمون‌ها', singular: 'آزمون', action: 'آزمون جدید' },
  questions: { title: 'Question Bank', singular: 'سؤال', action: 'سؤال جدید' },
  glossary: { title: 'Glossary', singular: 'مدخل', action: 'مدخل جدید' },
  library: { title: 'کتابخانه', singular: 'منبع', action: 'منبع جدید' },
}

function statusTone(status) {
  return status === 'Published' ? 'published' : status === 'Review' ? 'review' : status === 'Archived' ? 'archived' : 'draft'
}

function StatusTag({ status }) {
  const labels = { Published: 'منتشر شده', Review: 'در بررسی', Draft: 'پیش‌نویس', Archived: 'بایگانی شده' }
  return <span className={`master-status ${statusTone(status)}`}><span />{labels[status] || status}</span>
}

function normalizeMasterRecord(section, record) {
  if (section === 'courses') return { ...record, title: record.title, detail: `${record.faculty_title || 'آموزش'} · ${record.level || 'Beginner'} · ${record.lesson_count || 0} درس`, updated: record.updated_at || 'از API' }
  if (section === 'lessons') return { ...record, title: record.title, detail: `${record.chapter_id || 'فصل آموزشی'} · ${record.reading_minutes || 0} دقیقه`, updated: record.updated_at || 'از API' }
  if (section === 'questions') return { ...record, title: record.prompt, detail: `${record.difficulty || 'Medium'} · ${record.quiz_id || 'آزمون'}`, status: record.status, updated: record.created_at || 'از API' }
  if (section === 'glossary') return { ...record, title: record.term, detail: `${record.category || 'General'} · ${record.full_name || ''}`, updated: record.updated_at || 'از API' }
  return { ...record, title: record.title, detail: `${record.resource_type || 'Article'} · ${record.category || 'General'} · ${record.level || 'All'}`, updated: record.updated_at || 'از API' }
}

function masterPayload(section, record) {
  if (section === 'courses') return { title: record.title, summary: record.detail, status: record.status }
  if (section === 'lessons') return { title: record.title, summary: record.detail, status: record.status }
  if (section === 'questions') return { prompt: record.title, explanation: record.detail, status: record.status }
  if (section === 'glossary') return { term: record.title, simpleDefinition: record.detail, status: record.status }
  return { title: record.title, summary: record.detail, status: record.status }
}

function MasterApiBanner({ loading, error, onRetry }) {
  if (loading) return <div className="master-api-banner master-api-loading" role="status"><span className="loading-spinner" /> در حال همگام‌سازی با Worker و D1...</div>
  if (error) return <div className="master-api-banner master-api-fallback" role="alert"><span>داده مدیریت محتوا از Backend دریافت نشد؛ اطلاعات محلی به‌عنوان منبع اعتماد نمایش داده نمی‌شود.</span><button type="button" onClick={onRetry}>تلاش دوباره</button></div>
  return <div className="master-api-banner master-api-live" role="status"><Check size={13} /> متصل به Worker و D1 · تغییرات این بخش در API ذخیره می‌شوند.</div>
}

function MasterDashboard({ onSelect }) {
  return <div className="master-dashboard"><div className="master-welcome"><div><span className="master-kicker">پنل مدیریت دارالفنون</span><h1>صبح بخیر، استاد.</h1><p>از آخرین وضعیت مسیرهای یادگیری و محتوای امروز باخبر شو.</p></div><div className="master-date"><span>امروز</span><strong>۱۱ شهریور ۱۴۰۵</strong></div></div><div className="metric-grid"><Metric icon={Users} label="کاربران فعال" value="۱٬۲۸۴" trend="۱۲٪ بیشتر از ماه قبل" tone="blue" /><Metric icon={GraduationCap} label="دوره‌های تکمیل‌شده" value="۳۴۶" trend="۸٪ بیشتر از ماه قبل" tone="teal" /><Metric icon={ClipboardCheck} label="آزمون‌های انجام‌شده" value="۲٬۸۹۲" trend="۲۱٪ بیشتر از ماه قبل" tone="gold" /><Metric icon={AwardIcon} label="گواهی‌های صادرشده" value="۱۸۷" trend="۵٪ بیشتر از ماه قبل" tone="purple" /></div><div className="master-dashboard-grid"><section className="master-panel"><div className="master-panel-heading"><div><span className="master-kicker">فعالیت اخیر</span><h2>اتفاقات امروز</h2></div><button type="button" onClick={() => onSelect('analytics')}>گزارش کامل <ArrowLeft size={14} /></button></div><div className="activity-list"><Activity icon={BookOpen} title="درس «نگهداری امن دارایی» منتشر شد." meta="توسط شما · ۲۴ دقیقه پیش" tone="teal" /><Activity icon={ClipboardCheck} title="آزمون فصل ۰۳ به ۱۲ کاربر پیشنهاد شد." meta="سیستم یادگیری · ۱ ساعت پیش" tone="gold" /><Activity icon={BookMarked} title="مدخل CPI برای بازبینی آماده است." meta="توسط سارا مرادی · ۲ ساعت پیش" tone="blue" /><Activity icon={Users} title="۲۳ کاربر جدید به مسیر کریپتو پیوستند." meta="سیستم · ۳ ساعت پیش" tone="purple" /></div></section><section className="master-panel quick-actions"><div className="master-panel-heading"><div><span className="master-kicker">دسترسی سریع</span><h2>ساختن ادامه دارد</h2></div></div><button type="button" onClick={() => onSelect('lessons')}><span><Plus size={17} /></span><div><strong>درس جدید</strong><small>یک مفهوم تازه اضافه کن</small></div><ChevronLeft size={15} /></button><button type="button" onClick={() => onSelect('questions')}><span><FileQuestion size={17} /></span><div><strong>سؤال جدید</strong><small>Question Bank را کامل کن</small></div><ChevronLeft size={15} /></button><button type="button" onClick={() => onSelect('glossary')}><span><BookMarked size={17} /></span><div><strong>مدخل دانشنامه</strong><small>دانش را قابل کشف کن</small></div><ChevronLeft size={15} /></button></section></div><div className="master-bottom-panels"><section className="master-panel status-summary"><div className="master-panel-heading"><div><span className="master-kicker">محتوا</span><h2>وضعیت انتشار</h2></div><button type="button" onClick={() => onSelect('lessons')}>مشاهده محتوا <ArrowLeft size={14} /></button></div><div className="status-summary-bars"><SummaryBar label="منتشر شده" value="۷۶٪" width="76%" tone="published" /><SummaryBar label="در بررسی" value="۱۶٪" width="16%" tone="review" /><SummaryBar label="پیش‌نویس" value="۸٪" width="8%" tone="draft" /></div></section><section className="master-panel integrity-panel"><span className="integrity-icon"><Shield size={19} /></span><span className="master-kicker">سلامت محتوا</span><strong>همه‌چیز مرتب است.</strong><p>محتوای منتشرشده بدون خطای دسترسی آماده نمایش است.</p><span className="integrity-check"><Check size={13} /> بررسی آخرین: امروز ۰۸:۳۰</span></section></div></div>
}

function Metric({ icon: Icon, label, value, trend, tone }) { return <div className="metric-card"><span className={`metric-icon metric-${tone}`}><Icon size={19} /></span><span className="metric-label">{label}</span><strong>{value}</strong><small><span>↗</span> {trend}</small></div> }
function AwardIcon(props) { return <Award {...props} /> }
function Activity({ icon: Icon, title, meta, tone }) { return <div className="activity-item"><span className={`activity-icon activity-${tone}`}><Icon size={16} /></span><div><strong>{title}</strong><small>{meta}</small></div><ChevronLeft size={14} /></div> }
function SummaryBar({ label, value, width, tone }) { return <div className="summary-bar"><div><span>{label}</span><strong>{value}</strong></div><div><span className={`summary-fill ${tone}`} style={{ width }} /></div></div> }

function RecordsPage({ section, records, onAdd, onEdit, onArchive }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const meta = sectionMeta[section]
  const filtered = records.filter((record) => {
    const matchesQuery = `${record.title} ${record.detail}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesQuery && matchesStatus
  })
  return <div className="records-page"><div className="records-heading"><div><span className="master-kicker">مدیریت محتوا</span><h1>{meta.title}</h1><p>{filtered.length} {meta.singular} در این بخش</p></div><button className="master-primary-button" type="button" onClick={onAdd}><Plus size={17} /> {meta.action}</button></div><div className="records-toolbar"><div className="records-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`جست‌وجوی ${meta.singular}...`} aria-label={`جست‌وجوی ${meta.singular}`} /></div><select className="master-filter-button" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="فیلتر وضعیت"><option value="all">همه وضعیت‌ها</option><option value="Published">منتشر شده</option><option value="Review">در بررسی</option><option value="Draft">پیش‌نویس</option><option value="Archived">بایگانی شده</option></select><span className="records-count">آخرین تغییرات</span></div><div className="records-table"><div className="records-table-head"><span>عنوان</span><span>جزئیات</span><span>وضعیت</span><span>آخرین تغییر</span><span>عملیات</span></div>{filtered.length ? filtered.map((record) => <div className="record-row" key={record.id}><div className="record-title"><span className={`record-symbol record-${statusTone(record.status)}`}>{section === 'questions' ? '?' : section === 'glossary' ? 'Aa' : section === 'library' ? '▤' : '◈'}</span><strong>{record.title}</strong></div><span className="record-detail">{record.detail}</span><StatusTag status={record.status} /><span className="record-updated">{record.updated}</span><div className="record-actions"><button type="button" aria-label={`ویرایش ${record.title}`} onClick={() => onEdit(record)}><Pencil size={14} /></button><button type="button" aria-label={`بایگانی ${record.title}`} onClick={() => onArchive(record.id)}><Archive size={14} /></button></div></div>) : <div className="master-empty"><Search size={23} /><strong>نتیجه‌ای پیدا نشد</strong><span>عبارت دیگری را امتحان کن.</span></div>}</div></div>
}

function RecordForm({ section, record, onCancel, onSave }) {
  const meta = sectionMeta[section]
  const [title, setTitle] = useState(record?.title || '')
  const [detail, setDetail] = useState(record?.detail || '')
  const [status, setStatus] = useState(record?.status || 'Draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      await onSave({ id: record?.id || `${section}-${Date.now()}`, title: title.trim(), detail: detail.trim() || 'بدون توضیح تکمیلی', status, updated: 'همین حالا' })
    } catch (saveError) {
      setError(saveError.message || 'ذخیره محتوا انجام نشد.')
    } finally {
      setSaving(false)
    }
  }
  return <div className="master-form-overlay"><div className="master-form-card"><div className="master-form-head"><div><span className="master-kicker">{record ? 'ویرایش محتوا' : 'ایجاد محتوای جدید'}</span><h2>{record ? `ویرایش ${meta.singular}` : meta.action}</h2></div><button type="button" className="icon-button" onClick={onCancel} aria-label="بستن"><X size={19} /></button></div><form onSubmit={submit}><label>عنوان<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`عنوان ${meta.singular}`} autoFocus required /></label><label>خلاصه / جزئیات<textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="یک توضیح کوتاه برای مدیریت محتوا" rows="3" /></label><label>وضعیت انتشار<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="Draft">پیش‌نویس</option><option value="Review">در بررسی</option><option value="Published">منتشر شده</option><option value="Archived">بایگانی شده</option></select></label>{error && <div className="master-form-error" role="alert">{error}</div>}<div className="master-form-note"><Sparkles size={15} /><span>بعد از ذخیره می‌توانی روابط و جزئیات این محتوا را کامل کنی.</span></div><div className="master-form-actions"><button className="master-secondary-button" type="button" onClick={onCancel} disabled={saving}>انصراف</button><button className="master-primary-button" type="submit" disabled={saving}><Check size={16} /> {saving ? 'در حال ذخیره...' : `ذخیره ${meta.singular}`}</button></div></form></div></div>
}
function RelationsPage() {
  const [relations, setRelations] = useState([
    { id: 'r-1', left: 'Lesson', leftValue: 'نگهداری امن دارایی', connector: 'مرتبط با', right: 'Glossary', rightValue: 'کیف پول', tone: 'teal' },
    { id: 'r-2', left: 'Lesson', leftValue: 'چرخه‌های اقتصادی', connector: 'مطالعه بیشتر', right: 'Library', rightValue: 'شناخت چرخه‌های اقتصادی', tone: 'gold' },
    { id: 'r-3', left: 'Course', leftValue: 'مبانی کریپتو', connector: 'پیشنهاد بعدی', right: 'Course', rightValue: 'مدیریت ریسک', tone: 'blue' },
  ])
  function addRelation() {
    setRelations((current) => [...current, { id: `r-${Date.now()}`, left: 'Lesson', leftValue: 'درس جدید', connector: 'مرتبط با', right: 'Glossary', rightValue: 'مفهوم جدید', tone: 'teal' }])
  }
  return <div className="relations-page"><div className="records-heading"><div><span className="master-kicker">Knowledge Graph پایه</span><h1>روابط محتوا</h1><p>محتواها را به هم متصل کن تا کاربر مسیرهای بیشتری برای کشف داشته باشد.</p></div><button className="master-primary-button" type="button" onClick={addRelation}><Plus size={17} /> رابطه جدید</button></div><div className="relation-board">{relations.map((relation) => <RelationCard key={relation.id} {...relation} onRemove={() => setRelations((current) => current.filter((item) => item.id !== relation.id))} />)}</div><div className="relation-empty"><Link2 size={22} /><strong>رابطه‌ها به یادگیری عمق می‌دهند.</strong><p>از هر درس، یک مسیر کوتاه به مفهوم‌ها و منابع مرتبط بساز.</p></div></div>
}
function RelationCard({ left, leftValue, connector, right, rightValue, tone, onRemove }) { return <div className="relation-card"><div className={`relation-node node-${tone}`}><span>{left}</span><strong>{leftValue}</strong></div><div className="relation-connector"><span>{connector}</span><i>↔</i></div><div className={`relation-node node-${tone}`}><span>{right}</span><strong>{rightValue}</strong></div><button type="button" aria-label="حذف رابطه" onClick={onRemove}><X size={14} /></button></div> }

function SimpleMasterPage({ section }) { const item = masterNav.find((entry) => entry.id === section); const Icon = item?.icon || Settings; return <div className="master-simple-page"><span className="master-simple-icon"><Icon size={25} /></span><span className="master-kicker">پنل مدیریت</span><h1>{item?.label || 'بخش'}</h1><p>این بخش در ادامه MVP با همان زبان کاربردی و یکپارچه تکمیل می‌شود.</p></div> }

export default function MasterView({ onExit, appUser }) {
  const [section, setSection] = useState('dashboard')
  const [records, setRecords] = useState(initialRecords)
  const [form, setForm] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mutationNotice, setMutationNotice] = useState('')
  const apiSection = sectionMeta[section] ? section : null
  const { data: remotePayload, loading: apiLoading, error: apiError, reload } = useApiResource(
    () => apiSection ? getMasterContent(apiSection).then((items) => ({ section: apiSection, items })) : Promise.resolve({ section: null, items: [] }),
    [apiSection],
  )
  useEffect(() => {
    if (remotePayload?.section !== apiSection || !Array.isArray(remotePayload.items)) return
    setRecords((current) => ({ ...current, [apiSection]: remotePayload.items.map((item) => normalizeMasterRecord(apiSection, item)) }))
    setMutationNotice('')
  }, [remotePayload, apiSection])
  const activeLabel = masterNav.find((entry) => entry.id === section)?.label || 'داشبورد'
  function select(next) { setSection(next); setForm(null); setMutationNotice(''); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function updateLocalRecord(type, record) {
    setRecords((current) => ({ ...current, [type]: record.id && current[type].some((item) => item.id === record.id) ? current[type].map((item) => item.id === record.id ? record : item) : [record, ...current[type]] }))
  }
  async function saveRecord(record) {
    const type = form?.section || section
    const exists = records[type].some((item) => item.id === record.id)
    try {
      const result = exists ? await updateMasterContent(type, record.id, masterPayload(type, record)) : await createMasterContent(type, masterPayload(type, record))
      const saved = exists ? record : { ...record, id: result?.id || record.id }
      updateLocalRecord(type, saved)
      setMutationNotice('')
      setForm(null)
      await reload()
    } catch (error) {
      setMutationNotice(`ذخیره در Backend انجام نشد. ${error.message || ''}`)
    }
  }
  async function archiveRecord(id) {
    const type = section
    try {
      await archiveMasterContent(type, id)
      updateLocalRecord(type, { ...records[type].find((item) => item.id === id), status: 'Archived', updated: 'همین حالا' })
      setMutationNotice('')
      await reload()
    } catch (error) {
      setMutationNotice(`بایگانی در Backend انجام نشد. ${error.message || ''}`)
    }
  }
  return <div className="master-shell"><aside className={`master-sidebar ${sidebarOpen ? 'open' : ''}`}><div className="master-brand"><span className="master-logo">✦</span><div><strong>دارالفنون</strong><small>پنل مدیریت</small></div><button type="button" className="master-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div><div className="master-profile"><span>{(appUser?.firstName || 'م').slice(0, 1)}</span><div><strong>{[appUser?.firstName, appUser?.lastName].filter(Boolean).join(' ') || 'Master'}</strong><small>دسترسی مدیریت محتوا</small></div></div><nav className="master-nav">{masterNav.map((item) => { const Icon = item.icon; return <button type="button" className={section === item.id ? 'active' : ''} key={item.id} onClick={() => select(item.id)}><Icon size={17} /><span>{item.label}</span>{section === item.id && <ChevronLeft size={14} />}</button> })}</nav><div className="master-sidebar-bottom"><button type="button" onClick={onExit}><ArrowLeft size={16} /> خروج از حساب</button><span>دارالفنون · Master 1.0</span></div></aside><div className="master-main"><header className="master-header"><button type="button" className="master-menu-button" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div><span className="master-breadcrumb">Master / {activeLabel}</span><h2>{activeLabel}</h2></div><div className="master-header-actions"><div className="master-header-search" role="search" aria-label="جست‌وجوی محتوا"><Search size={17} /><span>جست‌وجوی محتوا</span></div><span className="master-bell" role="img" aria-label="اعلان‌ها">◌</span><span className="master-header-avatar">م</span></div></header><main className="master-content">{section === 'dashboard' ? <MasterDashboard onSelect={select} /> : section === 'relations' ? <RelationsPage /> : sectionMeta[section] ? <><MasterApiBanner loading={apiLoading} error={apiError} onRetry={reload} />{mutationNotice && <div className="master-api-banner master-api-fallback" role="alert">{mutationNotice}</div>}{apiLoading ? <div className="admin-empty"><span className="loading-spinner" /><strong>در حال دریافت محتوای Backend...</strong></div> : apiError ? <div className="admin-empty"><Shield size={24} /><strong>منبع مدیریت محتوا در دسترس نیست.</strong><span>تا بازگشت Backend، تغییر یا نمایش داده محلی غیرفعال است.</span></div> : <RecordsPage section={section} records={records[section]} onAdd={() => setForm({ section })} onEdit={(record) => setForm({ section, record })} onArchive={archiveRecord} />}</> : <SimpleMasterPage section={section} />}</main></div>{form && <RecordForm section={form.section} record={form.record} onCancel={() => setForm(null)} onSave={saveRecord} />}</div>
}
