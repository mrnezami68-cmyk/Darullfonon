-- Purpose: minimal L1 learning/content model for the Darullfonon vertical slice.
-- Risk: fresh schema only; no existing production data is altered.
-- Validation: apply with `wrangler d1 migrations apply darullfonon --local`.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS faculties (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL REFERENCES faculties(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Beginner',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  lesson_count INTEGER NOT NULL DEFAULT 0 CHECK (lesson_count >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  medal TEXT NOT NULL DEFAULT 'Bronze',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  estimated_minutes INTEGER NOT NULL DEFAULT 0 CHECK (estimated_minutes >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  reading_minutes INTEGER NOT NULL DEFAULT 0 CHECK (reading_minutes >= 0),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  time_limit_minutes INTEGER NOT NULL DEFAULT 10 CHECK (time_limit_minutes >= 0),
  attempts_allowed INTEGER NOT NULL DEFAULT 0 CHECK (attempts_allowed >= 0),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  options_json TEXT NOT NULL DEFAULT '[]',
  correct_option TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS glossary_entries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  term TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  simple_definition TEXT NOT NULL DEFAULT '',
  expert_definition TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_resources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  level TEXT NOT NULL DEFAULT 'All',
  resource_type TEXT NOT NULL DEFAULT 'Article',
  access_type TEXT NOT NULL DEFAULT 'LegalLink',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_relations (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (source_type, source_id, relation_type, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('InProgress', 'Studied', 'Passed', 'NeedsReview')),
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_courses_faculty_status ON courses (faculty_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_levels_course_order ON levels (course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_chapters_course_order ON chapters (course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_status ON lessons (chapter_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_status ON questions (quiz_id, status);
CREATE INDEX IF NOT EXISTS idx_glossary_category_status ON glossary_entries (category, status);
CREATE INDEX IF NOT EXISTS idx_library_category_status ON library_resources (category, status);
CREATE INDEX IF NOT EXISTS idx_relations_source ON content_relations (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress (user_id, updated_at);

INSERT OR IGNORE INTO faculties (id, slug, title, summary, status) VALUES
  ('faculty-macro', 'macro-economics', 'اقتصاد کلان', 'از تصویر بزرگ اقتصاد شروع کن.', 'Published'),
  ('faculty-market', 'financial-markets', 'بازارهای مالی', 'بورس، فارکس و کریپتو را با مسیر روشن یاد بگیر.', 'Published'),
  ('faculty-behavior', 'analysis-and-behavior', 'تحلیل و رفتار', 'تصمیم‌های دقیق‌تر با ذهن آرام‌تر.', 'Published');

INSERT OR IGNORE INTO courses (id, faculty_id, slug, title, summary, level, status, duration_minutes, lesson_count, sort_order) VALUES
  ('course-crypto-basics', 'faculty-market', 'crypto-basics', 'مبانی کریپتو', 'یک مسیر آرام و کاربردی برای شناخت دارایی‌های دیجیتال، امنیت و تصمیم‌گیری آگاهانه.', 'Beginner', 'Published', 380, 24, 1),
  ('course-macro-basics', 'faculty-macro', 'macro-basics', 'اقتصاد برای تصمیم‌گیری', 'مفاهیم پایه اقتصاد کلان برای خواندن بهتر جهان اطراف.', 'Beginner', 'Published', 260, 18, 2),
  ('course-fundamental-analysis', 'faculty-behavior', 'fundamental-analysis', 'شروع تحلیل بنیادی', 'ارزش را پشت نمودار پیدا کن.', 'Intermediate', 'Review', 330, 21, 3);

INSERT OR IGNORE INTO levels (id, course_id, title, medal, sort_order) VALUES
  ('level-crypto-beginner', 'course-crypto-basics', 'مقدماتی', 'Bronze', 1),
  ('level-crypto-intermediate', 'course-crypto-basics', 'متوسط', 'Silver', 2),
  ('level-crypto-advanced', 'course-crypto-basics', 'پیشرفته', 'Gold', 3);

INSERT OR IGNORE INTO chapters (id, course_id, level_id, title, summary, objective, estimated_minutes, sort_order) VALUES
  ('chapter-crypto-01', 'course-crypto-basics', 'level-crypto-beginner', 'آشنایی با دارایی‌های دیجیتال', 'از مفهوم دارایی دیجیتال شروع کن.', 'تفاوت دارایی دیجیتال و سنتی را توضیح بدهی.', 35, 1),
  ('chapter-crypto-02', 'course-crypto-basics', 'level-crypto-beginner', 'شبکه و تراکنش', 'زیرساخت انتقال ارزش را بفهم.', 'مفهوم شبکه و تراکنش را توضیح بدهی.', 45, 2),
  ('chapter-crypto-03', 'course-crypto-basics', 'level-crypto-beginner', 'کیف پول و امنیت دارایی', 'امنیت، قبل از سرعت.', 'یک چک‌لیست امنیتی شخصی بسازی.', 38, 3),
  ('chapter-crypto-04', 'course-crypto-basics', 'level-crypto-beginner', 'صرافی‌ها و خرید امن', 'آگاهانه وارد بازار شو.', 'مراحل خرید امن را بشناسی.', 55, 4),
  ('chapter-crypto-05', 'course-crypto-basics', 'level-crypto-beginner', 'ساختن سبد دارایی', 'تصمیم‌ها را با هدف هماهنگ کن.', 'اصول ساده تنوع‌بخشی را بفهمی.', 48, 5);

INSERT OR IGNORE INTO lessons (id, chapter_id, slug, title, summary, body, reading_minutes, status, sort_order) VALUES
  ('lesson-crypto-03-01', 'chapter-crypto-03', 'what-is-wallet', 'کیف پول چیست؟', 'کیف پول را با یک تشبیه ساده بشناس.', 'کیف پول ابزار مدیریت دسترسی به دارایی دیجیتال است.', 8, 'Published', 1),
  ('lesson-crypto-03-02', 'chapter-crypto-03', 'private-key-and-recovery', 'کلید خصوصی و عبارت بازیابی', 'مهم‌ترین اطلاعات دسترسی به دارایی.', 'کلید خصوصی و عبارت بازیابی باید همیشه خصوصی و آفلاین نگهداری شوند.', 10, 'Published', 2),
  ('lesson-crypto-03-03', 'chapter-crypto-03', 'secure-asset-storage', 'نگهداری امن دارایی', 'امنیت دارایی دیجیتال به عادت‌های کوچک و پیوسته وابسته است.', 'در بازارهای دیجیتال، مسئولیت نگهداری دارایی تا حد زیادی با خود ماست. پیش از هر تصمیم، مسیر دسترسی و نگهداری را بشناس.', 12, 'Published', 3),
  ('lesson-crypto-03-04', 'chapter-crypto-03', 'security-checklist', 'چک‌لیست امنیتی', 'قبل از هر تراکنش این موارد را مرور کن.', 'یک چک‌لیست کوتاه امنیتی برای استفاده روزانه بساز.', 8, 'Published', 4);

INSERT OR IGNORE INTO quizzes (id, chapter_id, title, passing_score, time_limit_minutes, attempts_allowed, status) VALUES
  ('quiz-crypto-03', 'chapter-crypto-03', 'آزمون فصل ۰۳', 70, 10, 0, 'Published');

INSERT OR IGNORE INTO questions (id, quiz_id, prompt, options_json, correct_option, explanation, difficulty, status) VALUES
  ('question-crypto-03-01', 'quiz-crypto-03', 'کدام گزینه برای نگهداری بلندمدت دارایی مناسب‌تر است؟', '["کیف پول سخت‌افزاری","ارسال عبارت بازیابی برای دوست","ذخیره در گالری تلفن","استفاده از رمز عبور ساده"]', '0', 'کیف پول سخت‌افزاری برای نگهداری بلندمدت کنترل بیشتری ایجاد می‌کند.', 'Easy', 'Published'),
  ('question-crypto-03-02', 'quiz-crypto-03', 'عبارت بازیابی را کجا باید نگهداری کرد؟', '["در یک دفتر امن و آفلاین","در بخش یادداشت عمومی تلفن","در پیام‌رسان","در ایمیل کاری"]', '0', 'نسخه آفلاین و امن، ریسک دسترسی ناخواسته را کم می‌کند.', 'Easy', 'Published');

INSERT OR IGNORE INTO glossary_entries (id, slug, term, full_name, simple_definition, expert_definition, category, status) VALUES
  ('glossary-cpi', 'cpi', 'CPI', 'Consumer Price Index', 'شاخصی برای اندازه‌گیری تغییرات سطح عمومی قیمت کالاها و خدمات.', 'یکی از شاخص‌های کلیدی سنجش تورم مصرف‌کننده.', 'اقتصاد', 'Published'),
  ('glossary-inflation', 'inflation', 'تورم', 'Inflation', 'افزایش پیوسته و عمومی سطح قیمت‌ها در یک بازه زمانی.', 'کاهش قدرت خرید پول در اثر افزایش عمومی سطح قیمت‌ها.', 'اقتصاد', 'Published'),
  ('glossary-interest-rate', 'interest-rate', 'نرخ بهره', 'Interest Rate', 'هزینه استفاده از پول یا بازدهی نگهداری آن در یک دوره مشخص.', 'متغیری کلیدی در سیاست پولی و ارزش‌گذاری دارایی‌ها.', 'اقتصاد', 'Published'),
  ('glossary-dxy', 'dxy', 'DXY', 'US Dollar Index', 'شاخصی برای سنجش ارزش دلار آمریکا در برابر سبدی از ارزها.', 'شاخص قدرت نسبی دلار آمریکا در برابر ارزهای منتخب.', 'بازارها', 'Published');

INSERT OR IGNORE INTO library_resources (id, slug, title, author, summary, category, level, resource_type, access_type, status) VALUES
  ('library-fundamental-guide', 'fundamental-analysis-guide', 'راهنمای شروع تحلیل بنیادی', 'کتابخانه دارالفنون', 'یک شروع آرام برای فهم ارزش پشت نمودار.', 'تحلیل', 'Beginner', 'Article', 'Downloadable', 'Published'),
  ('library-economic-cycles', 'economic-cycles', 'شناخت چرخه‌های اقتصادی', 'مرکز محتوای دارالفنون', 'چرخه‌ها را ببین تا خبرها را بهتر بفهمی.', 'اقتصاد', 'Intermediate', 'Handout', 'Downloadable', 'Published'),
  ('library-risk-checklist', 'risk-management-checklist', 'چک‌لیست مدیریت ریسک', 'دارالفنون', 'برگه‌ای برای قبل از تصمیم‌های مهم.', 'ریسک', 'All', 'Worksheet', 'LegalLink', 'Published');

INSERT OR IGNORE INTO content_relations (id, source_type, source_id, relation_type, target_type, target_id) VALUES
  ('relation-lesson-wallet', 'Lesson', 'lesson-crypto-03-03', 'related_to', 'Glossary', 'glossary-cpi'),
  ('relation-lesson-library', 'Lesson', 'lesson-crypto-03-03', 'read_more', 'Library', 'library-risk-checklist');
