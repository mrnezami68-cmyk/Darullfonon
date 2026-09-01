import { useMemo, useState } from 'react'
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

const glossaryEntries = [
  { term: 'CPI', full: 'Consumer Price Index', description: 'شاخصی برای اندازه‌گیری تغییرات سطح عمومی قیمت کالاها و خدمات.', category: 'اقتصاد' },
  { term: 'تورم', full: 'Inflation', description: 'افزایش پیوسته و عمومی سطح قیمت‌ها در یک بازه زمانی.', category: 'اقتصاد' },
  { term: 'نرخ بهره', full: 'Interest Rate', description: 'هزینه استفاده از پول یا بازدهی نگهداری آن در یک دوره مشخص.', category: 'اقتصاد' },
  { term: 'DXY', full: 'US Dollar Index', description: 'شاخصی برای سنجش ارزش دلار آمریکا در برابر سبدی از ارزها.', category: 'بازارها' },
]

const resources = [
  { title: 'راهنمای شروع تحلیل بنیادی', author: 'کتابخانه دارالفنون', type: 'مقاله', level: 'مقدماتی', category: 'تحلیل', canDownload: true, accent: 'blue' },
  { title: 'شناخت چرخه‌های اقتصادی', author: 'مرکز محتوای دارالفنون', type: 'جزوه', level: 'متوسط', category: 'اقتصاد', canDownload: true, accent: 'gold' },
  { title: 'فرهنگ اصطلاحات بازار فارکس', author: 'کتابخانه دارالفنون', type: 'راهنما', level: 'مقدماتی', category: 'فارکس', canDownload: false, accent: 'teal' },
  { title: 'چک‌لیست مدیریت ریسک', author: 'دارالفنون', type: 'برگه تمرین', level: 'همه سطوح', category: 'ریسک', canDownload: true, accent: 'rose' },
  { title: 'روان‌شناسی تصمیم‌گیری', author: 'مرکز محتوای دارالفنون', type: 'مقاله', level: 'پیشرفته', category: 'روان‌شناسی', canDownload: true, accent: 'purple' },
  { title: 'آشنایی با دارایی دیجیتال', author: 'کتابخانه دارالفنون', type: 'ویدئو', level: 'مقدماتی', category: 'کریپتو', canDownload: false, accent: 'slate' },
]

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
  const filtered = useMemo(() => glossaryEntries.filter((entry) => `${entry.term} ${entry.full} ${entry.description}`.toLowerCase().includes(query.toLowerCase())), [query])
  return <div className="knowledge-page page-container"><PageHeading kicker="مرجع مفاهیم" title="دانشنامه دارالفنون" description="وقتی یک مفهوم مبهم است، از همین‌جا شروع کن؛ ساده، دقیق و متصل به مسیر یادگیری." /><div className="knowledge-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی مفهوم یا اصطلاح..." aria-label="جست‌وجوی دانشنامه" /><kbd>⌘ K</kbd></div><div className="knowledge-categories"><span>دسته‌بندی:</span>{['همه', 'اقتصاد', 'بازارها', 'کریپتو', 'ریسک', 'روان‌شناسی'].map((category, index) => <button type="button" className={index === 0 ? 'active' : ''} key={category}>{category}</button>)}</div><div className="knowledge-layout"><section><div className="view-heading"><div><span className="section-kicker">نتایج منتخب</span><h2>{query ? `${filtered.length} نتیجه برای «${query}»` : 'مفهوم‌های پرکاربرد'}</h2></div></div><div className="glossary-list">{filtered.length ? filtered.map((entry) => <button className="glossary-card" type="button" key={entry.term} onClick={() => onGo('learning')}><span className="glossary-term">{entry.term}</span><div><span className="glossary-category">{entry.category}</span><h3>{entry.full}</h3><p>{entry.description}</p></div><ChevronLeft size={17} /></button>) : <div className="empty-card"><BookMarked size={23} /><h3>نتیجه‌ای پیدا نشد</h3><p>عبارت دیگری را امتحان کن یا از دسته‌بندی‌ها شروع کن.</p></div>}</div></section><aside className="knowledge-aside"><div className="concept-feature"><span className="section-kicker">از همین‌جا شروع کن</span><h3>CPI</h3><p>شاخص قیمت مصرف‌کننده یکی از مهم‌ترین مفاهیم برای فهم تورم و واکنش بازار است.</p><div className="relation-chain"><span>CPI</span><i>↓</i><span>تورم</span><i>↓</i><span>نرخ بهره</span></div><button className="quiet-link" type="button" onClick={() => onGo('learning')}>درس‌های مرتبط <ArrowLeft size={14} /></button></div><div className="knowledge-tip"><Sparkles size={18} /><span>هر اصطلاح، یک در به سمت درس‌های عمیق‌تر است.</span></div></aside></div></div>
}

function LibraryPage({ onGo }) {
  const [filter, setFilter] = useState('همه')
  const filtered = filter === 'همه' ? resources : resources.filter((resource) => resource.category === filter || resource.type === filter)
  return <div className="library-page page-container"><PageHeading kicker="آرشیو مطالعه" title="کتابخانه دارالفنون" description="منابعی دست‌چین‌شده برای وقتی که می‌خواهی عمیق‌تر بخوانی و بهتر تصمیم بگیری." action={<button className="outline-button" type="button" onClick={() => onGo('knowledge')}><BookMarked size={16} /> رفتن به دانشنامه</button>} /><div className="library-toolbar"><div className="library-tabs">{['همه', 'اقتصاد', 'تحلیل', 'کریپتو', 'ریسک', 'روان‌شناسی'].map((value) => <button type="button" className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{value}</button>)}</div><span>{filtered.length} منبع</span></div><div className="resource-library-grid">{filtered.map((resource) => <article className="library-card" key={resource.title}><div className={`library-cover cover-${resource.accent}`}><BookOpen size={22} strokeWidth={1.3} /><span>{resource.type}</span></div><div className="library-card-content"><div className="library-card-meta"><span>{resource.category}</span><span>{resource.level}</span></div><h3>{resource.title}</h3><p>{resource.author}</p><div className="library-actions"><button className="primary-button tiny-button" type="button" onClick={() => onGo('knowledge')}>مشاهده <ArrowLeft size={13} /></button>{resource.canDownload ? <button className="download-button" type="button"><Download size={14} /> دریافت</button> : <span className="legal-note"><LockKeyhole size={12} /> لینک قانونی</span>}</div></div></article>)}</div></div>
}

function LabPage({ onGo }) {
  const [assessment, setAssessment] = useState(null)
  const [selected, setSelected] = useState(assessments[0])
  if (assessment === 'result') return <div className="lab-page page-container"><div className="assessment-result-card"><div className="result-seal"><BarChart3 size={30} strokeWidth={1.3} /><span>✓</span></div><span className="section-kicker">گزارش خودارزیابی</span><h1 className="inner-page-title">شناخت ریسک‌پذیری تو</h1><p className="inner-page-lead">این گزارش یک آینه است، نه حکم نهایی؛ با آن مسیر یادگیری‌ات را شخصی‌تر کن.</p><div className="assessment-score-grid"><div><strong>۶۸</strong><span>ریسک‌پذیری</span></div><div><strong>۵۱</strong><span>تحمل زیان</span></div><div><strong>۷۲</strong><span>کنترل هیجان</span></div><div><strong>۴۳</strong><span>انضباط</span></div></div><div className="recommendation-card"><Sparkles size={18} /><div><strong>پیشنهاد آموزشی</strong><p>برای تقویت مدیریت ریسک و انضباط، مطالعه این مسیرها پیشنهاد می‌شود.</p><button className="quiet-link" type="button" onClick={() => onGo('learning')}>مشاهده دوره‌های پیشنهادی <ArrowLeft size={14} /></button></div></div><button className="text-button" type="button" onClick={() => setAssessment(null)}><RotateIcon /> بازگشت به آزمایشگاه</button></div></div>
  if (assessment === 'intro') return <div className="lab-page page-container"><button className="back-text" type="button" onClick={() => setAssessment(null)}><ArrowLeft size={15} /> بازگشت به آزمایشگاه</button><div className="assessment-intro-card"><span className="assessment-big-icon"><ShieldCheck size={30} /></span><span className="section-kicker">خودارزیابی رفتاری</span><h1 className="inner-page-title">{selected.title}</h1><p className="inner-page-lead">{selected.description} پاسخ درست یا غلطی وجود ندارد؛ مهم این است که خودت را صادقانه ببینی.</p><div className="assessment-facts"><span><Clock3 size={15} /> {selected.time}</span><span><FileText size={15} /> {selected.questions}</span><span><ShieldCheck size={15} /> ذخیره در پروفایل</span></div><button className="primary-button" type="button" onClick={() => setAssessment('result')}>شروع خودارزیابی <ArrowLeft size={17} /></button></div></div>
  return <div className="lab-page page-container"><PageHeading kicker="خودت را بهتر بشناس" title="آزمایشگاه دارالفنون" description="پاسخ‌هایت را به شناخت تبدیل کن؛ نتیجه‌ها برای قضاوت نیستند، برای ساختن قدم بعدی‌اند." /><div className="lab-intro-note"><FlaskConical size={22} /><div><strong>یک مکث کوتاه، یک شناخت تازه</strong><p>خودارزیابی‌ها مستقل از آزمون‌های آموزشی‌اند و نتیجه‌شان در پروفایل تو ذخیره می‌شود.</p></div></div><div className="view-heading"><div><span className="section-kicker">آزمایش‌های پیشنهادی</span><h2>از کدام شروع کنیم؟</h2></div></div><div className="assessment-grid">{assessments.map((item) => { const Icon = item.icon; return <button className="assessment-card" type="button" key={item.title} onClick={() => { setSelected(item); setAssessment('intro') }}><span className={`assessment-icon assessment-${item.accent}`}><Icon size={21} /></span><h3>{item.title}</h3><p>{item.description}</p><span className="assessment-meta"><span>{item.time}</span><span>{item.questions}</span></span><span className="assessment-link">شروع <ArrowLeft size={14} /></span></button> })}</div></div>
}

function RotateIcon() { return <RotateCcwIcon /> }
function RotateCcwIcon() { return <span className="rotate-symbol">↻</span> }

function ProfilePage({ onGo }) {
  const [certificate, setCertificate] = useState(false)
  return <div className="profile-page page-container"><div className="profile-hero"><div className="profile-identity"><span className="profile-avatar-large">ن</span><div><span className="section-kicker">گذرنامه یادگیری</span><h1 className="inner-page-title">سلام نیما، آماده‌ای ادامه بدهی؟</h1><p className="inner-page-lead">هر روز لازم نیست زیاد جلو بروی؛ فقط کافی است مسیرت را رها نکنی.</p></div></div><button className="outline-button" type="button" onClick={() => onGo('home')}>ویرایش پروفایل</button></div><div className="profile-stats"><div><span>پیشرفت کلی</span><strong>۳۴٪</strong></div><div><span>زمان یادگیری</span><strong>۴۲ ساعت</strong></div><div><span>روزهای فعال</span><strong>۲۷ روز</strong></div><div><span>مدال‌ها</span><strong>۵</strong></div></div><div className="profile-grid"><section><div className="view-heading"><div><span className="section-kicker">پیشرفت آموزشی</span><h2>مسیرهای تو</h2></div><button className="quiet-link" type="button" onClick={() => onGo('learning')}>مشاهده آموزش <ArrowLeft size={14} /></button></div><div className="profile-progress-list"><ProgressLine title="اقتصاد کلان" value="۳۰٪" width="30%" /><ProgressLine title="بورس" value="۱۵٪" width="15%" /><ProgressLine title="فارکس" value="۲۰٪" width="20%" /><ProgressLine title="کریپتو" value="۷۲٪" width="72%" /><ProgressLine title="تحلیل بنیادی" value="۵۰٪" width="50%" /></div></section><aside><div className="profile-achievement-card"><span className="achievement-medal"><Trophy size={22} strokeWidth={1.4} /></span><span className="section-kicker">آخرین دستاورد</span><h3>هفت روز پیوسته</h3><p>هفت روز است که برای ساختن دانشت وقت گذاشته‌ای.</p><span className="achievement-date">امروز، ساعت ۰۹:۴۲</span></div></aside></div><div className="profile-lower-grid"><div className="passport-card"><div><span className="section-kicker">گواهی‌ها</span><h2>گواهی‌های من</h2><p>مبانی کریپتو · تکمیل‌شده در ۲۹ آگوست ۲۰۲۶</p></div><button className="outline-button" type="button" onClick={() => setCertificate(true)}><Award size={16} /> مشاهده پیش‌نمایش</button></div><div className="passport-card assessment-history"><div><span className="section-kicker">آخرین خودارزیابی</span><h2>ریسک‌پذیری</h2><p>گزارش ذخیره‌شده · امتیاز کلی ۶۸ از ۱۰۰</p></div><button className="quiet-link" type="button" onClick={() => onGo('lab')}>مشاهده گزارش <ArrowLeft size={14} /></button></div></div>{certificate && <div className="certificate-preview"><div className="certificate-head"><span className="section-kicker">پیش‌نمایش گواهی</span><button type="button" className="icon-button" onClick={() => setCertificate(false)}>×</button></div><div className="certificate-frame"><span className="certificate-ornament">✦</span><span className="certificate-small">دارالفنون · مدرسه دانش مدرن</span><h2>گواهی تکمیل مسیر</h2><p>این گواهی به</p><strong>نیما رضایی</strong><p>برای تکمیل دوره</p><h3>مبانی کریپتو</h3><div className="certificate-footer"><span>DF-CRYPTO-0268</span><span>۲۹ آگوست ۲۰۲۶</span></div></div><div className="certificate-note"><FileText size={15} /> این گواهی نشان‌دهنده تکمیل یک مسیر آموزشی غیرآکادمیک در دارالفنون است.</div></div>}</div>
}

function ProgressLine({ title, value, width }) { return <div className="profile-progress-line"><div><span>{title}</span><strong>{value}</strong></div><div className="progress-bar"><span style={{ width }} /></div></div> }

export default function StudentViews({ active, onGo }) {
  if (active === 'knowledge') return <KnowledgePage onGo={onGo} />
  if (active === 'library') return <LibraryPage onGo={onGo} />
  if (active === 'lab') return <LabPage onGo={onGo} />
  if (active === 'profile') return <ProfilePage onGo={onGo} />
  return null
}
