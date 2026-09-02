import { useState } from 'react'
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Check,
  ChevronLeft,
  Clock3,
  Download,
  FileText,
  FlaskConical,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { getGlossary, getGlossaryEntry, getLibrary, getLibraryEntry, getProgress } from './api'
import { ApiState, useApiResource } from './useApiResource'

const assessments = [
  { title: 'آزمون ریسک‌پذیری', description: 'سبک مواجهه خودت با ریسک را بهتر بشناس.', time: '۱۲ دقیقه', questions: '۱۵ سؤال', icon: ShieldCheck, accent: 'teal' },
  { title: 'روان‌شناسی مالی', description: 'الگوهای ذهنی خودت هنگام تصمیم‌گیری را ببین.', time: '۱۰ دقیقه', questions: '۱۲ سؤال', icon: Sparkles, accent: 'gold' },
  { title: 'آمادگی معامله‌گری', description: 'آمادگی دانش و انضباطت را بررسی کن.', time: '۱۵ دقیقه', questions: '۱۸ سؤال', icon: Target, accent: 'blue' },
  { title: 'تحمل زیان', description: 'واکنشت به نوسان و عدم قطعیت را بسنج.', time: '۸ دقیقه', questions: '۱۰ سؤال', icon: BarChart3, accent: 'purple' },
]

function PageHeading({ kicker, title, description, action }) {
  return <div className="simple-page-heading"><div><span className="section-kicker">{kicker}</span><h1 className="inner-page-title">{title}</h1><p className="inner-page-lead">{description}</p></div>{action}</div>
}

function KnowledgePage({ onGo }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('همه')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const { data, loading, error, reload } = useApiResource(() => getGlossary({ query, category }), [query, category])
  const { data: entryDetail, loading: detailLoading, error: detailError, reload: reloadDetail } = useApiResource(() => selectedEntry ? getGlossaryEntry(selectedEntry.slug) : Promise.resolve(null), [selectedEntry?.slug])
  const entries = data || []
  const detail = entryDetail || selectedEntry
  const categories = ['همه', 'اقتصاد', 'بازارها', 'کریپتو', 'ریسک', 'روان‌شناسی']
  return <div className="knowledge-page page-container"><PageHeading kicker="مرجع مفاهیم" title="دانشنامه دارالفنون" description="وقتی یک مفهوم مبهم است، از همین‌جا شروع کن؛ ساده، دقیق و متصل به مسیر یادگیری." /><div className="knowledge-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی مفهوم یا اصطلاح..." aria-label="جست‌وجوی دانشنامه" /><kbd>⌘ K</kbd></div><div className="knowledge-categories"><span>دسته‌بندی:</span>{categories.map((value) => <button type="button" className={category === value ? 'active' : ''} key={value} onClick={() => setCategory(value)}>{value}</button>)}</div><div className="knowledge-layout"><section><div className="view-heading"><div><span className="section-kicker">نتایج منتخب</span><h2>{query || category !== 'همه' ? `${entries.length} نتیجه پیدا شد` : 'مفهوم‌های پرکاربرد'}</h2></div></div><ApiState loading={loading} error={error} onRetry={reload}><div className="glossary-list">{entries.length ? entries.map((entry) => <button className="glossary-card" type="button" key={entry.id} onClick={() => setSelectedEntry(entry)}><span className="glossary-term">{entry.term}</span><div><span className="glossary-category">{entry.category}</span><h3>{entry.full_name}</h3><p>{entry.simple_definition}</p></div><ChevronLeft size={17} /></button>) : <div className="empty-card"><BookMarked size={23} /><h3>نتیجه‌ای پیدا نشد</h3><p>عبارت دیگری را امتحان کن یا از دسته‌بندی‌ها شروع کن.</p></div>}</div></ApiState>{selectedEntry && <div className="entry-detail-card"><button type="button" onClick={() => setSelectedEntry(null)} aria-label="بستن">×</button><ApiState loading={detailLoading} error={detailError} onRetry={reloadDetail}><div><span className="section-kicker">مدخل دانشنامه</span><h3>{detail?.term}</h3><p>{detail?.expert_definition || detail?.simple_definition}</p><button className="quiet-link" type="button" onClick={() => onGo('learning')}>درس‌های مرتبط <ArrowLeft size={14} /></button></div></ApiState></div>}</section><aside className="knowledge-aside"><div className="concept-feature"><span className="section-kicker">از همین‌جا شروع کن</span><h3>CPI</h3><p>شاخص قیمت مصرف‌کننده یکی از مهم‌ترین مفاهیم برای فهم تورم و واکنش بازار است.</p><div className="relation-chain"><span>CPI</span><i>↓</i><span>تورم</span><i>↓</i><span>نرخ بهره</span></div><button className="quiet-link" type="button" onClick={() => setQuery('CPI')}>جست‌وجوی CPI <ArrowLeft size={14} /></button></div><div className="knowledge-tip"><Sparkles size={18} /><span>هر اصطلاح، یک در به سمت درس‌های عمیق‌تر است.</span></div></aside></div></div>
}

function resourceAccent(category) {
  if (category === 'اقتصاد') return 'gold'
  if (category === 'ریسک') return 'rose'
  if (category === 'تحلیل') return 'blue'
  if (category === 'روان‌شناسی') return 'purple'
  if (category === 'کریپتو') return 'slate'
  return 'teal'
}

function LibraryPage({ onGo }) {
  const [filter, setFilter] = useState('همه')
  const [downloaded, setDownloaded] = useState('')
  const [selectedResource, setSelectedResource] = useState(null)
  const { data, loading, error, reload } = useApiResource(() => getLibrary({ category: filter }), [filter])
  const { data: resourceDetail, loading: detailLoading, error: detailError, reload: reloadDetail } = useApiResource(() => selectedResource ? getLibraryEntry(selectedResource.slug) : Promise.resolve(null), [selectedResource?.slug])
  const resources = data || []
  const detail = resourceDetail || selectedResource
  const filters = ['همه', 'اقتصاد', 'تحلیل', 'کریپتو', 'ریسک', 'روان‌شناسی']
  return <div className="library-page page-container"><PageHeading kicker="آرشیو مطالعه" title="کتابخانه دارالفنون" description="منابعی دست‌چین‌شده برای وقتی که می‌خواهی عمیق‌تر بخوانی و بهتر تصمیم بگیری." action={<button className="outline-button" type="button" onClick={() => onGo('knowledge')}><BookMarked size={16} /> رفتن به دانشنامه</button>} /><div className="library-toolbar"><div className="library-tabs">{filters.map((value) => <button type="button" className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{value}</button>)}</div><span>{resources.length} منبع</span></div><ApiState loading={loading} error={error} onRetry={reload}><div className="resource-library-grid">{resources.map((resource) => { const canDownload = resource.access_type === 'Downloadable'; return <article className="library-card" key={resource.id}><div className={`library-cover cover-${resourceAccent(resource.category)}`}><BookOpen size={22} strokeWidth={1.3} /><span>{resource.resource_type}</span></div><div className="library-card-content"><div className="library-card-meta"><span>{resource.category}</span><span>{resource.level}</span></div><h3>{resource.title}</h3><p>{resource.author}</p><div className="library-actions"><button className="primary-button tiny-button" type="button" onClick={() => setSelectedResource(resource)}>مشاهده <ArrowLeft size={13} /></button>{canDownload ? <button className="download-button" type="button" onClick={() => setDownloaded(resource.title)}><Download size={14} /> دریافت</button> : <span className="legal-note"><LockKeyhole size={12} /> لینک قانونی</span>}</div>{downloaded === resource.title && <span className="download-note"><Check size={12} /> دریافت نمونه برای محیط Demo ثبت شد.</span>}</div></article> })}</div>{selectedResource && <div className="entry-detail-card"><button type="button" onClick={() => setSelectedResource(null)} aria-label="بستن">×</button><ApiState loading={detailLoading} error={detailError} onRetry={reloadDetail}><div><span className="section-kicker">جزئیات منبع</span><h3>{detail?.title}</h3><p>{detail?.summary}</p><small className="muted-caption">{detail?.author} · {detail?.resource_type} · {detail?.access_type}</small></div></ApiState></div>}</ApiState></div>
}

function LabPage({ onGo }) {
  const [assessment, setAssessment] = useState(null)
  const [selected, setSelected] = useState(assessments[0])
  if (assessment === 'result') return <div className="lab-page page-container"><div className="assessment-result-card"><div className="result-seal"><BarChart3 size={30} strokeWidth={1.3} /><span>—</span></div><span className="section-kicker">گزارش خودارزیابی</span><h1 className="inner-page-title">نتیجه در دسترس نیست.</h1><p className="inner-page-lead">نتیجه معتبر خودارزیابی از سرور دریافت نشد؛ این بخش فعلاً قابل نمایش نیست.</p><button className="text-button" type="button" onClick={() => setAssessment(null)}><span className="rotate-symbol">↻</span> بازگشت به آزمایشگاه</button></div></div>
  if (assessment === 'intro') return <div className="lab-page page-container"><button className="back-text" type="button" onClick={() => setAssessment(null)}><ArrowLeft size={15} /> بازگشت به آزمایشگاه</button><div className="assessment-intro-card"><span className="assessment-big-icon"><ShieldCheck size={30} /></span><span className="section-kicker">خودارزیابی رفتاری</span><h1 className="inner-page-title">{selected.title}</h1><p className="inner-page-lead">{selected.description} پاسخ درست یا غلطی وجود ندارد؛ مهم این است که خودت را صادقانه ببینی.</p><div className="assessment-facts"><span><Clock3 size={15} /> {selected.time}</span><span><FileText size={15} /> {selected.questions}</span><span><ShieldCheck size={15} /> ذخیره در پروفایل</span></div><button className="primary-button" type="button" onClick={() => setAssessment('result')}>شروع خودارزیابی <ArrowLeft size={17} /></button></div></div>
  return <div className="lab-page page-container"><PageHeading kicker="خودت را بهتر بشناس" title="آزمایشگاه دارالفنون" description="پاسخ‌هایت را به شناخت تبدیل کن؛ نتیجه‌ها برای قضاوت نیستند، برای ساختن قدم بعدی‌اند." /><div className="lab-intro-note"><FlaskConical size={22} /><div><strong>یک مکث کوتاه، یک شناخت تازه</strong><p>خودارزیابی‌ها مستقل از آزمون‌های آموزشی‌اند و نتیجه‌شان در پروفایل تو ذخیره می‌شود.</p></div></div><div className="view-heading"><div><span className="section-kicker">آزمایش‌های پیشنهادی</span><h2>از کدام شروع کنیم؟</h2></div></div><div className="assessment-grid">{assessments.map((item) => { const Icon = item.icon; return <button className="assessment-card" type="button" key={item.title} onClick={() => { setSelected(item); setAssessment('intro') }}><span className={`assessment-icon assessment-${item.accent}`}><Icon size={21} /></span><h3>{item.title}</h3><p>{item.description}</p><span className="assessment-meta"><span>{item.time}</span><span>{item.questions}</span></span><span className="assessment-link">شروع <ArrowLeft size={14} /></span></button> })}</div></div>
}

function ProfilePage({ onGo, appUser }) {
  const [certificate, setCertificate] = useState(false)
  const { data: progress, loading, error, reload } = useApiResource(getProgress, [])
  const displayName = [appUser?.firstName, appUser?.lastName].filter(Boolean).join(' ') || appUser?.email || 'Student'
  const completed = progress?.filter((item) => ['Studied', 'Passed'].includes(item.status)) || []
  const latest = progress?.[0]
  return <div className="profile-page page-container"><div className="profile-hero"><div className="profile-identity"><span className="profile-avatar-large">{displayName.slice(0, 1)}</span><div><span className="section-kicker">گذرنامه یادگیری</span><h1 className="inner-page-title">سلام {displayName}، آماده‌ای ادامه بدهی؟</h1><p className="inner-page-lead">وضعیت آموزشی تو از آخرین داده ثبت‌شده در سرور نمایش داده می‌شود.</p></div></div><button className="outline-button" type="button" onClick={() => onGo('home')}>بازگشت به خانه</button></div><div className="profile-stats"><div><span>دروس ثبت‌شده</span><strong>{progress ? completed.length : '—'}</strong></div><div><span>آخرین وضعیت</span><strong>{latest?.status || '—'}</strong></div><div><span>وضعیت حساب</span><strong>{appUser?.status || '—'}</strong></div><div><span>منبع داده</span><strong>{progress ? 'Server' : '—'}</strong></div></div><div className="profile-grid"><section><div className="view-heading"><div><span className="section-kicker">پیشرفت آموزشی</span><h2>درس‌های ثبت‌شده</h2></div><button className="quiet-link" type="button" onClick={() => onGo('learning')}>مشاهده آموزش <ArrowLeft size={14} /></button></div><ApiState loading={loading} error={error} onRetry={reload}><div className="profile-progress-list">{progress?.length ? progress.map((item) => <ProgressLine key={`${item.lesson_id}-${item.updated_at}`} title={item.title} value={item.status} />) : <div className="empty-card"><BookOpen size={23} /><h3>هنوز پیشرفتی ثبت نشده است</h3><p>پس از مطالعه یک Lesson، وضعیت ثبت‌شده اینجا نمایش داده می‌شود.</p></div>}</div></ApiState></section><aside><div className="profile-achievement-card"><span className="achievement-medal"><Trophy size={22} strokeWidth={1.4} /></span><span className="section-kicker">آخرین ثبت واقعی</span><h3>{latest?.title || 'هنوز ثبت نشده'}</h3><p>{latest ? `وضعیت فعلی: ${latest.status}` : 'بعد از ثبت Progress، آخرین وضعیت اینجا نمایش داده می‌شود.'}</p><span className="achievement-date">{latest?.updated_at || 'زمانی ثبت نشده است'}</span></div></aside></div><div className="profile-lower-grid"><div className="passport-card"><div><span className="section-kicker">گواهی‌ها</span><h2>گواهی‌های من</h2><p>مبانی کریپتو · تکمیل‌شده در ۲۹ آگوست ۲۰۲۶</p></div><button className="outline-button" type="button" onClick={() => setCertificate(true)}><Award size={16} /> مشاهده پیش‌نمایش</button></div><div className="passport-card assessment-history"><div><span className="section-kicker">آخرین خودارزیابی</span><h2>ریسک‌پذیری</h2><p>گزارش ذخیره‌شده · امتیاز کلی ۶۸ از ۱۰۰</p></div><button className="quiet-link" type="button" onClick={() => onGo('lab')}>مشاهده گزارش <ArrowLeft size={14} /></button></div></div>{certificate && <div className="certificate-preview"><div className="certificate-head"><span className="section-kicker">پیش‌نمایش گواهی</span><button type="button" className="icon-button" onClick={() => setCertificate(false)}>×</button></div><div className="certificate-frame"><span className="certificate-ornament">✦</span><span className="certificate-small">دارالفنون · مدرسه دانش مدرن</span><h2>گواهی تکمیل مسیر</h2><p>این گواهی به</p><strong>نیما رضایی</strong><p>برای تکمیل دوره</p><h3>مبانی کریپتو</h3><div className="certificate-footer"><span>DF-CRYPTO-0268</span><span>۲۹ آگوست ۲۰۲۶</span></div></div><div className="certificate-note"><FileText size={15} /> این گواهی نشان‌دهنده تکمیل یک مسیر آموزشی غیرآکادمیک در دارالفنون است.</div></div>}</div>
}
function ProgressLine({ title, value }) { return <div className="profile-progress-line"><div><span>{title}</span><strong>{value}</strong></div></div> }

export default function StudentViews({ active, onGo, appUser }) {
  if (active === 'knowledge') return <KnowledgePage onGo={onGo} />
  if (active === 'library') return <LibraryPage onGo={onGo} />
  if (active === 'lab') return <LabPage onGo={onGo} />
  if (active === 'profile') return <ProfilePage onGo={onGo} appUser={appUser} />
  return null
}
