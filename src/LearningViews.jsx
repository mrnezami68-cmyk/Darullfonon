import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  CircleHelp,
  Clock3,
  FileText,
  LockKeyhole,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'

const topics = [
  { title: 'اقتصاد کلان', description: 'از تصویر بزرگ اقتصاد شروع کن', progress: 30, icon: '↗', className: 'ink' },
  { title: 'بورس', description: 'منطق بازار و سرمایه‌گذاری', progress: 15, icon: '◫', className: 'blue' },
  { title: 'فارکس', description: 'شناخت بازار ارزهای جهانی', progress: 20, icon: '↔', className: 'teal' },
  { title: 'کریپتو', description: 'دارایی‌های دیجیتال را بفهم', progress: 72, icon: '₿', className: 'gold' },
  { title: 'تحلیل بنیادی', description: 'ارزش را پشت نمودار پیدا کن', progress: 50, icon: '⌁', className: 'purple' },
  { title: 'تحلیل تکنیکال', description: 'زبان رفتار قیمت', progress: 0, icon: '⌗', className: 'sand' },
  { title: 'مدیریت ریسک', description: 'اول از سرمایه‌ات مراقبت کن', progress: 0, icon: '◇', className: 'rose' },
  { title: 'روان‌شناسی معامله‌گری', description: 'ذهن آرام، تصمیم دقیق', progress: 18, icon: '✦', className: 'slate' },
]

const chapters = [
  { number: '۰۱', title: 'آشنایی با دارایی‌های دیجیتال', meta: '۴ درس · ۳۵ دقیقه', status: 'passed', label: 'تکمیل شده' },
  { number: '۰۲', title: 'شبکه و تراکنش', meta: '۵ درس · ۴۵ دقیقه', status: 'passed', label: 'تکمیل شده' },
  { number: '۰۳', title: 'کیف پول و امنیت دارایی', meta: '۴ درس · ۳۸ دقیقه', status: 'active', label: 'در حال یادگیری' },
  { number: '۰۴', title: 'صرافی‌ها و خرید امن', meta: '۶ درس · ۵۵ دقیقه', status: 'locked', label: 'قفل شده' },
  { number: '۰۵', title: 'ساختن سبد دارایی', meta: '۵ درس · ۴۸ دقیقه', status: 'locked', label: 'قفل شده' },
]

const lessonItems = [
  { title: 'کیف پول چیست؟', meta: '۸ دقیقه مطالعه', status: 'done' },
  { title: 'کلید خصوصی و عبارت بازیابی', meta: '۱۰ دقیقه مطالعه', status: 'done' },
  { title: 'نگهداری امن دارایی', meta: '۱۲ دقیقه مطالعه', status: 'current' },
  { title: 'چک‌لیست امنیتی', meta: '۸ دقیقه مطالعه', status: 'locked' },
]

function PersianNumber({ children }) {
  return <span className="persian-number">{children}</span>
}

function PageCrumb({ children, onBack }) {
  return <div className="page-crumb"><button type="button" onClick={onBack}><ArrowRight size={15} /> بازگشت</button><span>/</span><span>{children}</span></div>
}

function LearningOverview({ onSubview }) {
  return (
    <div className="learning-page page-container">
      <div className="learning-topbar"><div><span className="section-kicker">آموزش دارالفنون</span><h1 className="inner-page-title">مسیر خودت را پیدا کن.</h1><p className="inner-page-lead">دانش را مرحله‌به‌مرحله بساز؛ هر موضوع با یک مسیر روشن، از مقدماتی تا پیشرفته.</p></div><div className="learning-stat"><span>پیشرفت کلی</span><strong>۳۴٪</strong><div className="mini-progress"><span style={{ width: '34%' }} /></div></div></div>
      <div className="learning-feature"><div className="feature-symbol">₿</div><div className="feature-copy"><StatusBadge tone="active">ادامه مسیر</StatusBadge><h2>مبانی کریپتو</h2><p>فصل ۶ · درس ۳ — کیف پول و امنیت دارایی</p><div className="feature-progress"><span style={{ width: '48%' }} /></div></div><button className="primary-button" type="button" onClick={() => onSubview('lesson')}>ادامه درس <ArrowLeft size={17} /></button></div>
      <div className="view-heading"><div><span className="section-kicker">هشت حوزه برای رشد</span><h2>یک موضوع را انتخاب کن</h2></div><button className="filter-button" type="button"><BarChart3 size={16} /> مرتب‌سازی <ChevronLeft size={14} /></button></div>
      <div className="topic-grid">{topics.map((topic) => <button type="button" key={topic.title} className="topic-card" onClick={() => onSubview('course')}><div className="topic-head"><span className={`topic-symbol topic-${topic.className}`}>{topic.icon}</span>{topic.progress > 0 ? <span className="topic-percent">{topic.progress}٪</span> : <span className="topic-percent muted">شروع نشده</span>}</div><h3>{topic.title}</h3><p>{topic.description}</p><div className="topic-progress"><span style={{ width: `${topic.progress}%` }} /></div><span className="topic-bottom">{topic.progress > 0 ? 'ادامه مسیر' : 'مشاهده دوره‌ها'} <ArrowLeft size={14} /></span></button>)}</div>
    </div>
  )
}

function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>
}

function CourseDetail({ onSubview, onBack }) {
  return (
    <div className="course-page page-container">
      <PageCrumb onBack={onBack}>آموزش / کریپتو</PageCrumb>
      <section className="course-hero"><div className="course-hero-copy"><StatusBadge tone="active">در حال یادگیری</StatusBadge><h1 className="inner-page-title">مبانی کریپتو</h1><p className="inner-page-lead">یک مسیر آرام و کاربردی برای شناخت دارایی‌های دیجیتال، امنیت و تصمیم‌گیری آگاهانه.</p><div className="course-meta-row"><span><Clock3 size={15} /> ۶ ساعت و ۲۰ دقیقه</span><span><BookOpen size={15} /> ۲۴ درس</span><span><Target size={15} /> مقدماتی</span></div></div><div className="course-progress-card"><div className="course-progress-top"><span>پیشرفت دوره</span><strong>۴۸٪</strong></div><div className="course-progress-large"><span style={{ width: '48%' }} /></div><p>۱۲ درس از ۲۴ درس</p><button className="primary-button small-button" type="button" onClick={() => onSubview('lesson')}>ادامه یادگیری <ArrowLeft size={15} /></button></div></section>
      <section className="course-body"><div className="course-content"><div className="view-heading"><div><span className="section-kicker">نقشه مسیر</span><h2>از مفهوم تا تصمیم</h2></div><span className="course-level">سطح مقدماتی <span>🥉</span></span></div><div className="chapter-list">{chapters.map((chapter, index) => <button type="button" key={chapter.number} className={`chapter-row chapter-${chapter.status}`} onClick={() => chapter.status !== 'locked' && onSubview(index === 2 ? 'chapter' : 'course')}><span className="chapter-number">{chapter.number}</span><span className="chapter-main"><strong>{chapter.title}</strong><small>{chapter.meta}</small></span><span className="chapter-status">{chapter.status === 'passed' ? <Check size={16} /> : chapter.status === 'active' ? <Play size={13} fill="currentColor" /> : <LockKeyhole size={15} />}<span>{chapter.label}</span></span><ChevronLeft size={16} className="chapter-arrow" /></button>)}</div></div><aside className="course-aside"><div className="aside-card"><span className="aside-icon"><Award size={20} /></span><span className="section-kicker">مدال این مسیر</span><h3>برنز کریپتو</h3><p>با تکمیل سطح مقدماتی و قبولی آزمون نهایی فعال می‌شود.</p><div className="medal-track"><span className="medal-dot done" /><span /><span /><span /></div></div><div className="aside-card quiet-aside"><span className="aside-icon"><CircleHelp size={19} /></span><h3>پیشنهاد دارالفنون</h3><p>بعد از این دوره، «مدیریت ریسک» قدم بعدی خوبی برای توست.</p><button className="quiet-link" type="button" onClick={() => onSubview('course')}>مشاهده پیشنهاد <ArrowLeft size={14} /></button></div></aside></section>
    </div>
  )
}

function ChapterPage({ onSubview, onBack }) {
  return (
    <div className="chapter-page page-container">
      <PageCrumb onBack={onBack}>مبانی کریپتو / فصل ۰۳</PageCrumb>
      <section className="chapter-heading-card"><div><StatusBadge tone="active">در حال یادگیری</StatusBadge><h1 className="inner-page-title">فصل ۰۳ — کیف پول و امنیت دارایی</h1><p className="inner-page-lead">در این فصل یاد می‌گیری چطور از دارایی دیجیتال خود آگاهانه و امن نگهداری کنی.</p></div><div className="chapter-summary"><strong>۲۵٪</strong><span>پیشرفت فصل</span><div className="mini-progress"><span style={{ width: '25%' }} /></div></div></section>
      <div className="chapter-layout"><section><div className="view-heading"><div><span className="section-kicker">چهار قدم کوتاه</span><h2>درس‌های فصل</h2></div><span className="muted-caption">حدود ۳۸ دقیقه</span></div><div className="lesson-list">{lessonItems.map((lesson, index) => <button type="button" key={lesson.title} className={`lesson-row lesson-${lesson.status}`} onClick={() => lesson.status !== 'locked' && onSubview('lesson')}><span className="lesson-number">{index + 1}</span><span className="lesson-row-icon">{lesson.status === 'done' ? <Check size={15} /> : lesson.status === 'locked' ? <LockKeyhole size={14} /> : <Play size={13} fill="currentColor" />}</span><span className="lesson-row-copy"><strong>{lesson.title}</strong><small>{lesson.meta}</small></span><span className="lesson-row-status">{lesson.status === 'done' ? 'مطالعه شده' : lesson.status === 'current' ? 'ادامه' : 'قفل'}</span><ChevronLeft size={15} /></button>)}</div></section><aside className="chapter-goal"><span className="aside-icon"><Target size={20} /></span><span className="section-kicker">هدف یادگیری</span><h3>امنیت، قبل از سرعت</h3><p>در پایان این فصل می‌توانی تفاوت کیف پول‌ها را توضیح بدهی و یک چک‌لیست امنیتی شخصی بسازی.</p><div className="goal-divider" /><span className="muted-caption">آزمون فصل بعد از تکمیل همه درس‌ها باز می‌شود.</span></aside></div>
    </div>
  )
}

function LessonPage({ onSubview, onBack, theme, onTheme }) {
  const [reading, setReading] = useState(theme === 'reading')
  const [previousTheme, setPreviousTheme] = useState(theme === 'reading' ? 'light' : theme)
  function toggleReading() {
    const next = !reading
    if (next) setPreviousTheme(theme === 'reading' ? 'light' : theme)
    setReading(next)
    onTheme(next ? 'reading' : previousTheme)
  }
  return (
    <div className={`lesson-page ${reading ? 'lesson-reading' : ''}`}>
      <div className="lesson-topbar page-container"><PageCrumb onBack={onBack}>مبانی کریپتو / فصل ۰۳ / درس ۰۳</PageCrumb><div className="lesson-actions"><span><Clock3 size={15} /> ۱۲ دقیقه مطالعه</span><button className={`reading-toggle ${reading ? 'active' : ''}`} type="button" onClick={toggleReading}><BookOpen size={15} /> {reading ? 'خروج از حالت مطالعه' : 'حالت مطالعه'}</button></div></div>
      <div className="lesson-layout page-container"><article className="lesson-article"><div className="lesson-kicker">فصل ۰۳ · درس ۰۳</div><h1>نگهداری امن دارایی</h1><p className="lesson-intro">امنیت دارایی دیجیتال، بیشتر از آنکه به ابزار وابسته باشد، به عادت‌های کوچک و پیوسته ما وابسته است.</p><div className="lesson-rule" /><h2>چرا امنیت از انتخاب دارایی مهم‌تر است؟</h2><p>در بازارهای دیجیتال، مسئولیت نگهداری دارایی تا حد زیادی با خود ماست. این استقلال فرصت بزرگی ایجاد می‌کند؛ اما یعنی باید پیش از هر تصمیم، مسیر دسترسی و نگهداری را بشناسیم.</p><div className="lesson-callout"><ShieldCheck size={21} /><div><strong>قاعده طلایی</strong><p>هرگز عبارت بازیابی خود را در پیام‌رسان، ایمیل یا فضای ابری ذخیره نکن.</p></div></div><h2>سه لایه محافظت</h2><p>یک روش امن معمولاً از سه لایه تشکیل می‌شود: انتخاب ابزار مناسب، نگهداری آفلاین اطلاعات حساس و داشتن یک برنامه روشن برای زمان از دست رفتن دسترسی.</p><ol className="lesson-list-numbered"><li><strong>ابزار را بر اساس نیاز انتخاب کن.</strong><span>کیف پول گرم برای استفاده روزانه و کیف پول سخت‌افزاری برای نگهداری بلندمدت مناسب‌تر است.</span></li><li><strong>اطلاعات حساس را آفلاین نگه دار.</strong><span>پشتیبان‌گیری کاغذی امن، بهتر از یک عکس در گالری تلفن است.</span></li><li><strong>پیش از وقوع مسئله تمرین کن.</strong><span>بدان اگر تلفن یا دستگاهت در دسترس نبود، قدم بعدی دقیقاً چیست.</span></li></ol><div className="lesson-tags"><span>اصطلاحات مرتبط</span><button type="button">کیف پول</button><button type="button">کلید خصوصی</button><button type="button">عبارت بازیابی</button></div><div className="lesson-source"><FileText size={17} /><div><strong>منبع و مطالعه بیشتر</strong><span>راهنمای امنیت دارایی‌های دیجیتال · دارالفنون</span></div></div><div className="lesson-footer-cta"><div><span className="section-kicker">قدم بعدی</span><strong>چک‌لیست امنیتی</strong><span>درس بعدی · ۸ دقیقه</span></div><button className="primary-button" type="button" onClick={() => onSubview('quiz')}>تکمیل درس و ادامه <ArrowLeft size={17} /></button></div></article><aside className="lesson-aside"><div className="lesson-map"><span className="section-kicker">مسیر فصل</span><h3>کیف پول و امنیت دارایی</h3>{lessonItems.map((lesson, index) => <div className={`map-item ${lesson.status}`} key={lesson.title}><span>{lesson.status === 'done' ? <Check size={13} /> : index === 2 ? <span className="map-current" /> : <span />}</span><p>{lesson.title}</p></div>)}</div><div className="lesson-side-note"><Sparkles size={16} /><span>یادداشت کن، فقط نخوان.</span></div></aside></div>
    </div>
  )
}

function QuizIntro({ onSubview, onBack }) {
  return <div className="quiz-intro-page page-container"><PageCrumb onBack={onBack}>مبانی کریپتو / فصل ۰۳</PageCrumb><div className="quiz-intro-card"><div className="quiz-emblem"><Target size={35} strokeWidth={1.3} /></div><span className="section-kicker">سنجش دانش</span><h1 className="inner-page-title">آزمون فصل ۰۳</h1><p className="inner-page-lead">حالا ببینیم مفاهیم امنیت دارایی را چقدر خوب به خاطر سپرده‌ای.</p><div className="quiz-facts"><span><strong>۸</strong> سؤال</span><span><strong>۱۰</strong> دقیقه</span><span><strong>۷۰٪</strong> حدنصاب</span></div><div className="quiz-notice"><CircleHelp size={16} /><span>آزمون آموزشی است؛ نتیجه آن فقط برای باز شدن فصل بعد استفاده می‌شود.</span></div><button className="primary-button" type="button" onClick={() => onSubview('quiz-flow')}>شروع آزمون <ArrowLeft size={17} /></button></div></div>
}

function QuizFlow({ onSubview }) {
  const [question, setQuestion] = useState(0)
  const [selected, setSelected] = useState(null)
  const questions = [
    { title: 'کدام گزینه برای نگهداری بلندمدت دارایی مناسب‌تر است؟', options: ['کیف پول سخت‌افزاری', 'ارسال عبارت بازیابی برای دوست', 'ذخیره در گالری تلفن', 'استفاده از رمز عبور ساده'] },
    { title: 'عبارت بازیابی را کجا باید نگهداری کرد؟', options: ['در یک دفتر امن و آفلاین', 'در بخش یادداشت عمومی تلفن', 'در پیام‌رسان', 'در ایمیل کاری'] },
    { title: 'اولین قدم در برنامه امنیتی چیست؟', options: ['شناخت مسیر دسترسی', 'خرید سریع دارایی', 'اشتراک‌گذاری کلید خصوصی', 'نادیده گرفتن پشتیبان‌گیری'] },
  ]
  const current = questions[question]
  function next() {
    if (question === questions.length - 1) onSubview('quiz-result')
    else { setQuestion((value) => value + 1); setSelected(null) }
  }
  return <div className="quiz-flow-page page-container"><div className="quiz-flow-top"><span>آزمون فصل ۰۳</span><span>{question + 1} از {questions.length}</span></div><div className="quiz-progress"><span style={{ width: `${((question + 1) / questions.length) * 100}%` }} /></div><div className="quiz-question-card"><span className="question-number">سؤال {question + 1}</span><h1>{current.title}</h1><div className="quiz-options">{current.options.map((option, index) => <button type="button" className={selected === index ? 'selected' : ''} key={option} onClick={() => setSelected(index)}><span className="option-letter">{['الف', 'ب', 'ج', 'د'][index]}</span><span>{option}</span>{selected === index && <Check size={17} />}</button>)}</div><div className="quiz-bottom"><button className="text-button" type="button" onClick={() => onSubview('lesson')}><ArrowRight size={15} /> خروج از آزمون</button><button className="primary-button" type="button" disabled={selected === null} onClick={next}>{question === questions.length - 1 ? 'ثبت پاسخ‌ها' : 'سؤال بعد'} <ArrowLeft size={17} /></button></div></div></div>
}

function QuizResult({ onSubview }) {
  return <div className="quiz-result-page page-container"><div className="result-card"><div className="result-seal"><Trophy size={34} strokeWidth={1.3} /><span>✓</span></div><span className="section-kicker">نتیجه آزمون</span><h1>آفرین، فصل بعد برایت باز شد.</h1><p>با مرور درست و قدم‌های پیوسته، مسیرت را ادامه دادی.</p><div className="result-score"><strong>۸۲<small>٪</small></strong><span>نمره تو</span></div><div className="result-lines"><div><span>حدنصاب قبولی</span><strong>۷۰٪</strong></div><div><span>پاسخ‌های درست</span><strong>۷ از ۸</strong></div></div><div className="result-actions"><button className="primary-button" type="button" onClick={() => onSubview('course')}>رفتن به فصل بعد <ArrowLeft size={17} /></button><button className="outline-button" type="button" onClick={() => onSubview('lesson')}><RotateCcw size={15} /> مرور درس‌ها</button></div></div></div>
}

export default function LearningViews({ subview, onSubview, onBack, theme, onTheme }) {
  if (subview === 'course') return <CourseDetail onSubview={onSubview} onBack={() => onSubview('overview')} />
  if (subview === 'chapter') return <ChapterPage onSubview={onSubview} onBack={() => onSubview('course')} />
  if (subview === 'lesson') return <LessonPage onSubview={onSubview} onBack={() => onSubview('chapter')} theme={theme} onTheme={onTheme} />
  if (subview === 'quiz') return <QuizIntro onSubview={onSubview} onBack={() => onSubview('lesson')} />
  if (subview === 'quiz-flow') return <QuizFlow onSubview={onSubview} />
  if (subview === 'quiz-result') return <QuizResult onSubview={onSubview} />
  return <LearningOverview onSubview={onSubview} />
}
