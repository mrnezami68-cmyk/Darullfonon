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
import { getChapter, getCourse, getCourses, getLesson, getProgress, getQuiz, saveProgress, submitQuiz } from './api'
import { ApiState, useApiResource } from './useApiResource'

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

function PageCrumb({ children, onBack }) {
  return <div className="page-crumb"><button type="button" onClick={onBack}><ArrowRight size={15} /> بازگشت</button><span>/</span><span>{children}</span></div>
}

function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>
}

function LearningOverview({ onSubview }) {
  const { data: courses, loading, error, reload } = useApiResource(getCourses, [])
  const { data: progress } = useApiResource(getProgress, [])
  const activeCourse = courses?.find((course) => course.slug === 'crypto-basics')
  const studiedCount = progress?.filter((item) => ['Studied', 'Passed'].includes(item.status)).length || 0
  const progressValue = Math.min(100, Math.max(34, studiedCount * 12))
  return <div className="learning-page page-container"><div className="learning-topbar"><div><span className="section-kicker">آموزش دارالفنون</span><h1 className="inner-page-title">مسیر خودت را پیدا کن.</h1><p className="inner-page-lead">دانش را مرحله‌به‌مرحله بساز؛ هر موضوع با یک مسیر روشن، از مقدماتی تا پیشرفته.</p></div><div className="learning-stat"><span>پیشرفت کلی</span><strong>{progressValue}٪</strong><div className="mini-progress"><span style={{ width: `${progressValue}%` }} /></div></div></div><ApiState loading={loading} error={error} onRetry={reload}>{<><div className="learning-feature"><div className="feature-symbol">₿</div><div className="feature-copy"><StatusBadge tone="active">ادامه مسیر</StatusBadge><h2>{activeCourse?.title || 'مبانی کریپتو'}</h2><p>فصل ۰۳ · درس ۰۳ — نگهداری امن دارایی</p><div className="feature-progress"><span style={{ width: '48%' }} /></div></div><button className="primary-button" type="button" onClick={() => onSubview('lesson')}>ادامه درس <ArrowLeft size={17} /></button></div><div className="view-heading"><div><span className="section-kicker">هشت حوزه برای رشد</span><h2>یک موضوع را انتخاب کن</h2></div><button className="filter-button" type="button"><BarChart3 size={16} /> مرتب‌سازی <ChevronLeft size={14} /></button></div><div className="topic-grid">{topics.map((topic) => <button type="button" key={topic.title} className="topic-card" onClick={() => onSubview('course')}><div className="topic-head"><span className={`topic-symbol topic-${topic.className}`}>{topic.icon}</span>{topic.progress > 0 ? <span className="topic-percent">{topic.progress}٪</span> : <span className="topic-percent muted">شروع نشده</span>}</div><h3>{topic.title}</h3><p>{topic.description}</p><div className="topic-progress"><span style={{ width: `${topic.progress}%` }} /></div><span className="topic-bottom">{topic.progress > 0 ? 'ادامه مسیر' : 'مشاهده دوره‌ها'} <ArrowLeft size={14} /></span></button>)}</div></>}</ApiState></div>
}

function CourseDetail({ onSubview, onBack }) {
  const { data, loading, error, reload } = useApiResource(() => getCourse('crypto-basics'), [])
  const course = data?.course
  const chapterStatus = (index) => index < 2 ? { status: 'passed', label: 'تکمیل شده' } : index === 2 ? { status: 'active', label: 'در حال یادگیری' } : { status: 'locked', label: 'قفل شده' }
  return <div className="course-page page-container"><PageCrumb onBack={onBack}>آموزش / کریپتو</PageCrumb><ApiState loading={loading} error={error} onRetry={reload}><><section className="course-hero"><div className="course-hero-copy"><StatusBadge tone="active">در حال یادگیری</StatusBadge><h1 className="inner-page-title">{course?.title}</h1><p className="inner-page-lead">{course?.summary}</p><div className="course-meta-row"><span><Clock3 size={15} /> ۶ ساعت و ۲۰ دقیقه</span><span><BookOpen size={15} /> {course?.lesson_count || 24} درس</span><span><Target size={15} /> مقدماتی</span></div></div><div className="course-progress-card"><div className="course-progress-top"><span>پیشرفت دوره</span><strong>۴۸٪</strong></div><div className="course-progress-large"><span style={{ width: '48%' }} /></div><p>۱۲ درس از {course?.lesson_count || 24} درس</p><button className="primary-button small-button" type="button" onClick={() => onSubview('lesson')}>ادامه یادگیری <ArrowLeft size={15} /></button></div></section><section className="course-body"><div className="course-content"><div className="view-heading"><div><span className="section-kicker">نقشه مسیر</span><h2>از مفهوم تا تصمیم</h2></div><span className="course-level">سطح مقدماتی <span>🥉</span></span></div><div className="chapter-list">{data?.chapters?.map((chapter, index) => { const state = chapterStatus(index); return <button type="button" key={chapter.id} className={`chapter-row chapter-${state.status}`} onClick={() => state.status !== 'locked' && onSubview(index === 2 ? 'chapter' : 'course')}><span className="chapter-number">{String(index + 1).padStart(2, '0')}</span><span className="chapter-main"><strong>{chapter.title}</strong><small>{chapter.lesson_count || 0} درس · {chapter.summary}</small></span><span className="chapter-status">{state.status === 'passed' ? <Check size={16} /> : state.status === 'active' ? <Play size={13} fill="currentColor" /> : <LockKeyhole size={15} />}<span>{state.label}</span></span><ChevronLeft size={16} className="chapter-arrow" /></button> })}</div></div><aside className="course-aside"><div className="aside-card"><span className="aside-icon"><Award size={20} /></span><span className="section-kicker">مدال این مسیر</span><h3>برنز کریپتو</h3><p>با تکمیل سطح مقدماتی و قبولی آزمون نهایی فعال می‌شود.</p><div className="medal-track"><span className="medal-dot done" /><span /><span /><span /></div></div><div className="aside-card quiet-aside"><span className="aside-icon"><CircleHelp size={19} /></span><h3>پیشنهاد دارالفنون</h3><p>بعد از این دوره، «مدیریت ریسک» قدم بعدی خوبی برای توست.</p><button className="quiet-link" type="button" onClick={() => onSubview('course')}>مشاهده پیشنهاد <ArrowLeft size={14} /></button></div></aside></section></></ApiState></div>
}

function ChapterPage({ onSubview, onBack }) {
  const { data, loading, error, reload } = useApiResource(() => getChapter('chapter-crypto-03'), [])
  const lessons = data?.lessons || []
  const lessonStatus = (index) => index < 2 ? 'done' : index === 2 ? 'current' : 'locked'
  return <div className="chapter-page page-container"><PageCrumb onBack={onBack}>مبانی کریپتو / فصل ۰۳</PageCrumb><ApiState loading={loading} error={error} onRetry={reload}><><section className="chapter-heading-card"><div><StatusBadge tone="active">در حال یادگیری</StatusBadge><h1 className="inner-page-title">{data?.chapter?.title}</h1><p className="inner-page-lead">{data?.chapter?.summary}</p></div><div className="chapter-summary"><strong>۲۵٪</strong><span>پیشرفت فصل</span><div className="mini-progress"><span style={{ width: '25%' }} /></div></div></section><div className="chapter-layout"><section><div className="view-heading"><div><span className="section-kicker">{lessons.length || 4} قدم کوتاه</span><h2>درس‌های فصل</h2></div><span className="muted-caption">حدود {data?.chapter?.estimated_minutes || 38} دقیقه</span></div><div className="lesson-list">{lessons.map((lesson, index) => { const status = lessonStatus(index); return <button type="button" key={lesson.id} className={`lesson-row lesson-${status}`} onClick={() => status !== 'locked' && onSubview('lesson')}><span className="lesson-number">{index + 1}</span><span className="lesson-row-icon">{status === 'done' ? <Check size={15} /> : status === 'locked' ? <LockKeyhole size={14} /> : <Play size={13} fill="currentColor" />}</span><span className="lesson-row-copy"><strong>{lesson.title}</strong><small>{lesson.reading_minutes} دقیقه مطالعه</small></span><span className="lesson-row-status">{status === 'done' ? 'مطالعه شده' : status === 'current' ? 'ادامه' : 'قفل'}</span><ChevronLeft size={15} /></button> })}</div></section><aside className="chapter-goal"><span className="aside-icon"><Target size={20} /></span><span className="section-kicker">هدف یادگیری</span><h3>امنیت، قبل از سرعت</h3><p>{data?.chapter?.objective}</p><div className="goal-divider" /><span className="muted-caption">آزمون فصل بعد از تکمیل همه درس‌ها باز می‌شود.</span></aside></div></></ApiState></div>
}

function LessonPage({ onSubview, onBack, theme, onTheme }) {
  const { data: lesson, loading, error, reload } = useApiResource(() => getLesson('secure-asset-storage'), [])
  const [reading, setReading] = useState(theme === 'reading')
  const [previousTheme, setPreviousTheme] = useState(theme === 'reading' ? 'light' : theme)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  function toggleReading() { const next = !reading; if (next) setPreviousTheme(theme === 'reading' ? 'light' : theme); setReading(next); onTheme(next ? 'reading' : previousTheme) }
  async function completeLesson() { setSaving(true); setSaveError(''); try { await saveProgress(lesson.id, 'Studied'); onSubview('quiz') } catch (apiError) { setSaveError(apiError.message || 'ثبت پیشرفت انجام نشد.') } finally { setSaving(false) } }
  return <div className={`lesson-page ${reading ? 'lesson-reading' : ''}`}><div className="lesson-topbar page-container"><PageCrumb onBack={onBack}>مبانی کریپتو / فصل ۰۳ / درس ۰۳</PageCrumb><div className="lesson-actions"><span><Clock3 size={15} /> {lesson?.reading_minutes || 12} دقیقه مطالعه</span><button className={`reading-toggle ${reading ? 'active' : ''}`} type="button" onClick={toggleReading}><BookOpen size={15} /> {reading ? 'خروج از حالت مطالعه' : 'حالت مطالعه'}</button></div></div><ApiState loading={loading} error={error} onRetry={reload}><div className="lesson-layout page-container"><article className="lesson-article"><div className="lesson-kicker">فصل ۰۳ · درس ۰۳</div><h1>{lesson?.title}</h1><p className="lesson-intro">{lesson?.summary}</p><div className="lesson-rule" /><h2>چرا امنیت از انتخاب دارایی مهم‌تر است؟</h2><p>در بازارهای دیجیتال، مسئولیت نگهداری دارایی تا حد زیادی با خود ماست. این استقلال فرصت بزرگی ایجاد می‌کند؛ اما یعنی باید پیش از هر تصمیم، مسیر دسترسی و نگهداری را بشناسیم.</p><div className="lesson-callout"><ShieldCheck size={21} /><div><strong>قاعده طلایی</strong><p>هرگز عبارت بازیابی خود را در پیام‌رسان، ایمیل یا فضای ابری ذخیره نکن.</p></div></div><h2>سه لایه محافظت</h2><p>{lesson?.body || 'یک روش امن معمولاً از سه لایه تشکیل می‌شود: انتخاب ابزار مناسب، نگهداری آفلاین اطلاعات حساس و داشتن یک برنامه روشن برای زمان از دست رفتن دسترسی.'}</p><ol className="lesson-list-numbered"><li><strong>ابزار را بر اساس نیاز انتخاب کن.</strong><span>کیف پول گرم برای استفاده روزانه و کیف پول سخت‌افزاری برای نگهداری بلندمدت مناسب‌تر است.</span></li><li><strong>اطلاعات حساس را آفلاین نگه دار.</strong><span>پشتیبان‌گیری کاغذی امن، بهتر از یک عکس در گالری تلفن است.</span></li><li><strong>پیش از وقوع مسئله تمرین کن.</strong><span>بدان اگر تلفن یا دستگاهت در دسترس نبود، قدم بعدی دقیقاً چیست.</span></li></ol><div className="lesson-tags"><span>اصطلاحات مرتبط</span><button type="button">کیف پول</button><button type="button">کلید خصوصی</button><button type="button">عبارت بازیابی</button></div><div className="lesson-source"><FileText size={17} /><div><strong>منبع و مطالعه بیشتر</strong><span>راهنمای امنیت دارایی‌های دیجیتال · دارالفنون</span></div></div>{saveError && <div className="inline-error" role="alert">{saveError}</div>}<div className="lesson-footer-cta"><div><span className="section-kicker">قدم بعدی</span><strong>آزمون فصل ۰۳</strong><span>بعد از ثبت مطالعه · ۱۰ دقیقه</span></div><button className="primary-button" type="button" disabled={saving} onClick={completeLesson}>{saving ? 'در حال ثبت...' : 'تکمیل درس و ادامه'} <ArrowLeft size={17} /></button></div></article><aside className="lesson-aside"><div className="lesson-map"><span className="section-kicker">مسیر فصل</span><h3>کیف پول و امنیت دارایی</h3>{['کیف پول چیست؟', 'کلید خصوصی و عبارت بازیابی', lesson?.title || 'نگهداری امن دارایی', 'چک‌لیست امنیتی'].map((title, index) => <div className={`map-item ${index < 2 ? 'done' : index === 2 ? 'current' : 'locked'}`} key={title}><span>{index < 2 ? <Check size={13} /> : index === 2 ? <span className="map-current" /> : <span />}</span><p>{title}</p></div>)}</div><div className="lesson-side-note"><Sparkles size={16} /><span>یادداشت کن، فقط نخوان.</span></div></aside></div></ApiState></div>
}

function QuizIntro({ onSubview, onBack }) {
  const { data: quiz, loading, error, reload } = useApiResource(() => getQuiz('quiz-crypto-03'), [])
  return <div className="quiz-intro-page page-container"><PageCrumb onBack={onBack}>مبانی کریپتو / فصل ۰۳</PageCrumb><ApiState loading={loading} error={error} onRetry={reload}><div className="quiz-intro-card"><div className="quiz-emblem"><Target size={35} strokeWidth={1.3} /></div><span className="section-kicker">سنجش دانش</span><h1 className="inner-page-title">{quiz?.title}</h1><p className="inner-page-lead">حالا ببینیم مفاهیم امنیت دارایی را چقدر خوب به خاطر سپرده‌ای.</p><div className="quiz-facts"><span><strong>{quiz?.questions?.length || 2}</strong> سؤال</span><span><strong>{quiz?.time_limit_minutes || 10}</strong> دقیقه</span><span><strong>{quiz?.passing_score || 70}٪</strong> حدنصاب</span></div><div className="quiz-notice"><CircleHelp size={16} /><span>آزمون آموزشی است؛ نتیجه آن فقط برای باز شدن فصل بعد استفاده می‌شود.</span></div><button className="primary-button" type="button" onClick={() => onSubview('quiz-flow')}>شروع آزمون <ArrowLeft size={17} /></button></div></ApiState></div>
}

function QuizFlow({ onSubview, onComplete }) {
  const { data: quiz, loading, error, reload } = useApiResource(() => getQuiz('quiz-crypto-03'), [])
  const [question, setQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const questions = quiz?.questions || []
  const current = questions[question]
  const selected = current ? answers[current.id] : null
  function choose(index) { if (current) setAnswers((value) => ({ ...value, [current.id]: index })) }
  async function next() {
    if (question < questions.length - 1) { setQuestion((value) => value + 1); return }
    setSubmitting(true); setSubmitError('')
    try { const result = await submitQuiz(quiz.id, answers); onComplete(result) } catch (apiError) { setSubmitError(apiError.message || 'ثبت پاسخ‌ها انجام نشد.') } finally { setSubmitting(false) }
  }
  return <div className="quiz-flow-page page-container"><ApiState loading={loading} error={error} onRetry={reload}>{current && <><div className="quiz-flow-top"><span>{quiz.title}</span><span>{question + 1} از {questions.length}</span></div><div className="quiz-progress"><span style={{ width: `${((question + 1) / questions.length) * 100}%` }} /></div><div className="quiz-question-card"><span className="question-number">سؤال {question + 1}</span><h1>{current.prompt}</h1><div className="quiz-options">{current.options.map((option, index) => <button type="button" className={selected === index ? 'selected' : ''} key={option} onClick={() => choose(index)}><span className="option-letter">{['الف', 'ب', 'ج', 'د'][index]}</span><span>{option}</span>{selected === index && <Check size={17} />}</button>)}</div>{submitError && <div className="inline-error" role="alert">{submitError}</div>}<div className="quiz-bottom"><button className="text-button" type="button" onClick={() => onSubview('lesson')}><ArrowRight size={15} /> خروج از آزمون</button><button className="primary-button" type="button" disabled={selected === undefined || submitting} onClick={next}>{submitting ? 'در حال ثبت...' : question === questions.length - 1 ? 'ثبت پاسخ‌ها' : 'سؤال بعد'} <ArrowLeft size={17} /></button></div></div></>}</ApiState></div>
}

function QuizResult({ onSubview, result }) {
  const score = result?.score ?? 82
  const passed = result?.passed ?? true
  return <div className="quiz-result-page page-container"><div className="result-card"><div className="result-seal"><Trophy size={34} strokeWidth={1.3} /><span>{passed ? '✓' : '!'}</span></div><span className="section-kicker">نتیجه آزمون</span><h1>{passed ? 'آفرین، فصل بعد برایت باز شد.' : 'این بار یک مرور کوتاه لازم است.'}</h1><p>{passed ? 'با مرور درست و قدم‌های پیوسته، مسیرت را ادامه دادی.' : 'نقاط ضعف را مرور کن و دوباره با آرامش تلاش کن.'}</p><div className="result-score"><strong>{score}<small>٪</small></strong><span>نمره تو</span></div><div className="result-lines"><div><span>حدنصاب قبولی</span><strong>{result?.passingScore ?? 70}٪</strong></div><div><span>پاسخ‌های درست</span><strong>{result ? `${result.correct} از ${result.total}` : '۷ از ۸'}</strong></div></div><div className="result-actions">{passed ? <button className="primary-button" type="button" onClick={() => onSubview('course')}>رفتن به فصل بعد <ArrowLeft size={17} /></button> : <button className="primary-button" type="button" onClick={() => onSubview('quiz')}>تلاش مجدد <ArrowLeft size={17} /></button>}<button className="outline-button" type="button" onClick={() => onSubview('lesson')}><RotateCcw size={15} /> مرور درس‌ها</button></div></div></div>
}

export default function LearningViews({ subview, onSubview, onBack, theme, onTheme }) {
  const [quizResult, setQuizResult] = useState(null)
  if (subview === 'course') return <CourseDetail onSubview={onSubview} onBack={() => onSubview('overview')} />
  if (subview === 'chapter') return <ChapterPage onSubview={onSubview} onBack={() => onSubview('course')} />
  if (subview === 'lesson') return <LessonPage onSubview={onSubview} onBack={() => onSubview('chapter')} theme={theme} onTheme={onTheme} />
  if (subview === 'quiz') return <QuizIntro onSubview={onSubview} onBack={() => onSubview('lesson')} />
  if (subview === 'quiz-flow') return <QuizFlow onSubview={onSubview} onComplete={(result) => { setQuizResult(result); onSubview('quiz-result') }} />
  if (subview === 'quiz-result') return <QuizResult onSubview={onSubview} result={quizResult} />
  return <LearningOverview onSubview={onSubview} />
}
