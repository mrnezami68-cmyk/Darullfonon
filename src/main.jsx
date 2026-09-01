import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft,
  ArrowUpLeft,
  Award,
  BookOpen,
  BookMarked,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Compass,
  FlaskConical,
  GraduationCap,
  Home,
  Library,
  Menu,
  Moon,
  MoreHorizontal,
  Play,
  Search,
  Sparkles,
  Sun,
  Target,
  Trophy,
  UserRound,
  X,
} from 'lucide-react'
import './styles.css'
import LearningViews from './LearningViews'
import StudentViews from './StudentViews'
import MasterView from './MasterView'

const themes = {
  light: { label: 'روشن', icon: Sun },
  dark: { label: 'تیره', icon: Moon },
  reading: { label: 'مطالعه', icon: BookOpen },
}

const navItems = [
  { id: 'home', label: 'خانه', icon: Home },
  { id: 'learning', label: 'آموزش', icon: GraduationCap },
  { id: 'knowledge', label: 'دانشنامه', icon: BookMarked },
  { id: 'lab', label: 'آزمایشگاه', icon: FlaskConical },
  { id: 'profile', label: 'پروفایل', icon: UserRound },
]

const faculties = [
  { title: 'اقتصاد کلان', caption: 'از تصویر بزرگ اقتصاد شروع کن', icon: '↗', tone: 'ink' },
  { title: 'بازارهای مالی', caption: 'بورس، فارکس و کریپتو', icon: '◌', tone: 'teal' },
  { title: 'تحلیل و رفتار', caption: 'تصمیم‌های دقیق‌تر، ذهن آرام‌تر', icon: '✦', tone: 'gold' },
]

const resources = [
  { type: 'دانشنامه', title: 'CPI چیست و چرا مهم است؟', detail: 'مفهوم‌های کلیدی اقتصاد', icon: BookMarked },
  { type: 'کتابخانه', title: 'راهنمای شروع تحلیل بنیادی', detail: 'مقاله · سطح مقدماتی', icon: Library },
  { type: 'آزمایشگاه', title: 'آزمون شناخت ریسک‌پذیری', detail: '۱۲ دقیقه · خودارزیابی', icon: FlaskConical },
]

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <span className="logo-arch" />
      <span className="logo-star">✦</span>
    </div>
  )
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <LogoMark />
      <div>
        <strong>دارالفنون</strong>
        {!compact && <span>مدرسه دانش مدرن</span>}
      </div>
    </div>
  )
}

function ThemeMenu({ theme, onChange }) {
  const [open, setOpen] = useState(false)
  const CurrentIcon = themes[theme].icon
  return (
    <div className="theme-control">
      <button
        className="icon-button theme-button"
        type="button"
        aria-label="تغییر پوسته"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <CurrentIcon size={18} strokeWidth={1.8} />
        <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div className="theme-popover" role="menu">
          {Object.entries(themes).map(([key, value]) => {
            const Icon = value.icon
            return (
              <button
                type="button"
                role="menuitem"
                className={`theme-option ${theme === key ? 'is-selected' : ''}`}
                key={key}
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{value.label}</span>
                {theme === key && <span className="option-check">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProgressRing({ value, size = 82 }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" aria-label={`${value} درصد پیشرفت`} role="img">
        <circle className="ring-track" cx="40" cy="40" r={radius} />
        <circle
          className="ring-value"
          cx="40"
          cy="40"
          r={radius}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <span>{value}<small>٪</small></span>
    </div>
  )
}

function StatusPill({ children, tone = 'neutral' }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('darullfonon-theme') || 'light')
  const [active, setActive] = useState('home')
  const [learningView, setLearningView] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('darullfonon-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const pageTitle = useMemo(() => navItems.find((item) => item.id === active)?.label || 'خانه', [active])

  function navigate(id) {
    setActive(id)
    if (id !== 'learning') setLearningView('overview')
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (id !== 'home' && id !== 'learning') setToast(`بخش ${navItems.find((item) => item.id === id)?.label} به‌زودی در دسترس است.`)
  }

  function openLearningView(view) {
    setActive('learning')
    setLearningView(view)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (active === 'master') return <MasterView onExit={() => navigate('home')} />

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="site-header">
        <div className="header-inner">
          <button className="mobile-menu-button" type="button" aria-label="باز کردن منو" onClick={() => setMenuOpen(true)}>
            <Menu size={21} />
          </button>
          <button className="brand-button" type="button" onClick={() => navigate('home')} aria-label="بازگشت به خانه">
            <Brand />
          </button>
          <nav className="desktop-nav" aria-label="ناوبری اصلی">
            {[...navItems.slice(0, 3), { id: 'library', label: 'کتابخانه', icon: Library }, navItems[3], navItems[4]].map((item) => (
              <button key={item.id} type="button" className={active === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button className="search-button" type="button" onClick={() => setToast('جست‌وجوی سراسری به‌زودی فعال می‌شود.')}>
              <Search size={18} strokeWidth={1.8} />
              <span>جست‌وجو</span>
            </button>
            <ThemeMenu theme={theme} onChange={setTheme} />
            <button className="profile-button" type="button" onClick={() => navigate('profile')}>
              <span className="avatar">ن</span>
              <span className="profile-name">نیما</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-drawer-layer" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside className="mobile-drawer" role="dialog" aria-label="منوی اصلی" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-top">
              <Brand compact />
              <button className="icon-button" type="button" aria-label="بستن منو" onClick={() => setMenuOpen(false)}><X size={20} /></button>
            </div>
            <div className="drawer-user">
              <span className="avatar avatar-large">ن</span>
              <div><strong>سلام نیما</strong><span>به مسیر یادگیری‌ات خوش آمدی</span></div>
            </div>
            <nav className="drawer-nav">
              {navItems.map((item) => {
                const Icon = item.icon
                return <button type="button" className={active === item.id ? 'active' : ''} key={item.id} onClick={() => navigate(item.id)}><Icon size={19} /><span>{item.label}</span><ChevronLeft size={16} /></button>
              })}
              <button type="button" onClick={() => setToast('کتابخانه در منوی منابع قرار دارد.')}><Library size={19} /><span>منابع و کتابخانه</span><ChevronLeft size={16} /></button>
            </nav>
            <div className="drawer-footer"><span>دارالفنون</span><button type="button" onClick={() => navigate('master')}>پنل Master</button></div>
          </aside>
        </div>
      )}

      <main>
        {active === 'home' ? (
          <>
            <section className="hero-section page-container">
              <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-line" />مسیر آرام یادگیری</div>
                <h1>دانش خود را <em>بساز.</em></h1>
                <p className="hero-lead">مسیر یادگیری اقتصاد، بازارهای مالی و رفتار مالی؛ با قدم‌هایی روشن، محتوایی قابل اعتماد و همراهی که همیشه می‌داند قدم بعدی چیست.</p>
                <div className="hero-actions">
                  <button className="primary-button" type="button" onClick={() => navigate('learning')}><span>شروع یادگیری</span><ArrowLeft size={18} /></button>
                  <button className="text-button" type="button" onClick={() => setToast('راهنمای دارالفنون به‌زودی آماده می‌شود.')}><Play size={16} fill="currentColor" /><span>آشنایی با دارالفنون</span></button>
                </div>
                <div className="hero-note"><span className="note-mark">✦</span><span>یادگیری ماندگار، با یک قدم کوچک شروع می‌شود.</span></div>
              </div>
              <div className="hero-art" aria-label="تصویر تزئینی معماری ایرانی" role="img">
                <div className="art-halo" />
                <div className="art-arch arch-back"><span /></div>
                <div className="art-arch arch-front"><span className="arch-star">✦</span><span className="arch-sill" /></div>
                <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
                <span className="art-label label-top">دانش</span><span className="art-label label-bottom">آرامش · دقت · رشد</span>
              </div>
            </section>

            <section className="continue-section page-container">
              <div className="section-heading compact-heading">
                <div><span className="section-kicker">ادامه مسیر تو</span><h2>جایی که متوقف شدی</h2></div>
                <button className="quiet-link" type="button" onClick={() => navigate('learning')}>همه دوره‌ها <ArrowLeft size={15} /></button>
              </div>
              <article className="continue-card">
                <div className="continue-icon"><span>₿</span></div>
                <div className="continue-info"><StatusPill tone="active">در حال یادگیری</StatusPill><h3>مبانی کریپتو</h3><p>فصل ۶ · درس ۳ — کیف پول و امنیت دارایی</p><div className="progress-bar"><span style={{ width: '48%' }} /></div><div className="progress-meta"><span>۴۸٪ تکمیل شده</span><span>حدود ۱۲ دقیقه باقی مانده</span></div></div>
                <div className="continue-cta"><ProgressRing value={48} size={86} /><button className="primary-button small-button" type="button" onClick={() => openLearningView('lesson')}>ادامه <ArrowLeft size={16} /></button></div>
              </article>
            </section>

            <section className="learning-paths page-container">
              <div className="section-heading"><div><span className="section-kicker">مسیرهای پیشنهادی</span><h2>از کجا شروع کنیم؟</h2></div><button className="circle-arrow" type="button" aria-label="مشاهده مسیرها" onClick={() => navigate('learning')}><ArrowLeft size={18} /></button></div>
              <div className="faculty-grid">
                {faculties.map((faculty, index) => <button className={`faculty-card tone-${faculty.tone}`} key={faculty.title} type="button" onClick={() => navigate('learning')}><div className="faculty-top"><span className="faculty-index">۰{index + 1}</span><span className="faculty-icon">{faculty.icon}</span></div><div><h3>{faculty.title}</h3><p>{faculty.caption}</p></div><span className="faculty-link">مشاهده مسیر <ArrowLeft size={15} /></span></button>)}
              </div>
            </section>

            <section className="focus-section page-container">
              <div className="focus-card">
                <div className="focus-content"><div className="eyebrow"><span className="eyebrow-line" />این هفته در دارالفنون</div><h2>سرمایه‌گذاری خوب،<br /><em>از شناخت خودت</em> شروع می‌شود.</h2><p>قبل از اینکه بازار را تحلیل کنی، سبک تصمیم‌گیری خودت را بشناس. یک خودارزیابی کوتاه، نقطه شروعی برای ساختن مسیر شخصی توست.</p><button className="outline-button" type="button" onClick={() => navigate('lab')}>شروع خودارزیابی <ArrowLeft size={17} /></button></div>
                <div className="focus-visual"><div className="focus-compass"><Compass size={74} strokeWidth={1} /><span>شناخت</span></div><div className="focus-orbit focus-orbit-a" /><div className="focus-orbit focus-orbit-b" /><span className="focus-visual-note">۱۲ دقیقه برای<br /><strong>شناخت بهتر</strong></span></div>
              </div>
            </section>

            <section className="resources-section page-container">
              <div className="section-heading"><div><span className="section-kicker">برای کشف بیشتر</span><h2>همراهان مسیر یادگیری</h2></div><button className="quiet-link" type="button" onClick={() => setToast('همه منابع به‌زودی در دسترس است.')}>مشاهده همه <ArrowLeft size={15} /></button></div>
              <div className="resource-grid">{resources.map((resource) => { const Icon = resource.icon; return <button className="resource-card" type="button" key={resource.title} onClick={() => setToast(`${resource.type} «${resource.title}» به‌زودی آماده است.`)}><span className="resource-icon"><Icon size={19} strokeWidth={1.7} /></span><div className="resource-copy"><span>{resource.type}</span><h3>{resource.title}</h3><p>{resource.detail}</p></div><ArrowUpLeft className="resource-arrow" size={17} /></button> })}</div>
            </section>

            <section className="achievement-section page-container">
              <div className="achievement-card"><div className="achievement-medal"><Trophy size={27} strokeWidth={1.5} /><span>۵</span></div><div><span className="section-kicker">ویترین پیشرفت</span><h2>هر قدم تو، بخشی از داستان توست.</h2><p>پیشرفت‌هایت را ببین، مسیر بعدی را پیدا کن و با آرامش ادامه بده.</p></div><button className="outline-button" type="button" onClick={() => navigate('profile')}>مشاهده دستاوردها <ArrowLeft size={17} /></button></div>
            </section>
          </>
        ) : active === 'learning' ? (
          <LearningViews subview={learningView} onSubview={openLearningView} onBack={() => openLearningView('overview')} theme={theme} onTheme={setTheme} />
        ) : ['knowledge', 'library', 'lab', 'profile'].includes(active) ? (
          <StudentViews active={active} onGo={navigate} />
        ) : (
          <section className="placeholder-page page-container">
            <div className="placeholder-mark"><Sparkles size={25} /></div>
            <span className="section-kicker">دارالفنون</span>
            <h1>{pageTitle}</h1>
            <p>این بخش در مرحله بعدی ساخت MVP با همان زبان بصری و تجربه روان تکمیل می‌شود.</p>
            <button className="primary-button" type="button" onClick={() => navigate('home')}>بازگشت به خانه <ArrowLeft size={18} /></button>
          </section>
        )}
      </main>

      <footer className="site-footer"><div className="page-container footer-inner"><Brand compact /><span>دانش، وقتی ماندگار می‌شود که ساخته شود.</span><div className="footer-meta"><span>دارالفنون · نسخه آزمایشی ۱.۰</span><button type="button" onClick={() => navigate('master')}>ورود به پنل Master <ArrowLeft size={13} /></button></div></div></footer>

      <nav className="mobile-bottom-nav" aria-label="ناوبری موبایل">{navItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={active === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon size={19} strokeWidth={active === item.id ? 2.2 : 1.7} /><span>{item.label}</span></button> })}<button type="button" onClick={() => setMenuOpen(true)}><MoreHorizontal size={19} /><span>بیشتر</span></button></nav>

      {toast && <div className="toast" role="status"><CircleHelp size={17} /><span>{toast}</span><button type="button" aria-label="بستن پیام" onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)

export default App
