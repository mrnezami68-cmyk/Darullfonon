# پرامپت اجرایی طراحی و ساخت MVP دارالفنون

**نسخه:** 1.0  
**وضعیت:** آماده اجرا پس از تأیید نهایی  
**زبان رابط:** فارسی، RTL  
**محصول:** سامانه آموزشی، دانشنامه، کتابخانه و خودارزیابی «دارالفنون»

---

## پرامپت

تو یک تیم محصول کامل شامل Product Designer، UX Designer، UI Designer و Frontend Engineer هستی. وظیفه تو طراحی و ساخت یک MVP واقعی، قابل استفاده و Responsive برای سامانه «دارالفنون» است.

دارالفنون باید حس ترکیبی زیر را منتقل کند:

> کتابخانه ایرانی + مدرسه مدرن + اپلیکیشن آموزشی حرفه‌ای

محصول نباید شبیه LMS سنتی، داشبورد مالی خشک یا اپلیکیشن بازی‌گونه باشد.

---

## 1. منابع قطعی

این موارد منبع حقیقت محصول هستند و نباید در اجرا نقض شوند:

1. سند معماری اطلاعات IA نسخه 1.0 دارالفنون
2. سند UX/UI Blueprint نسخه 1.0 دارالفنون
3. تصمیم‌های نهایی بازبینی:
   - کتابخانه در Mobile Bottom Navigation آیتم اصلی نیست و از منوی ثانویه / منابع در دسترس است.
   - Reading Mode یک حالت مستقل مطالعه است، نه صرفاً نسخه‌ای از Light Mode.
   - Master در MVP دارای CRUD واقعی برای محتوای اصلی است.
   - Certificate در MVP فقط UI و Preview دارد؛ تولید PDF و Image به فاز بعد منتقل می‌شود.

اگر بین زیبایی بصری و خوانایی، سرعت یا وضوح مسیر یادگیری تعارضی ایجاد شد، خوانایی و وضوح مسیر یادگیری اولویت دارند.

---

## 2. محدوده MVP

### فضای Student

این صفحات و جریان‌ها را بساز:

- Home
- Learning overview
- Faculty / Topic
- Course detail
- Chapter detail
- Lesson / Reading view
- Educational Quiz
- Quiz result
- Knowledge base overview
- Glossary entry
- Library overview
- Library resource detail
- Laboratory overview
- Self-assessment introduction
- Self-assessment flow
- Self-assessment result
- Profile dashboard
- My courses
- Achievements
- Certificates preview
- Learning progress

### فضای Master

این صفحات و جریان‌ها را بساز:

- Master dashboard
- Users
- Faculties
- Courses
- Levels
- Chapters
- Lessons
- Quizzes
- Question Bank
- Self Assessments
- Glossary
- Content Relations
- Library resources
- Medals
- Achievements
- Certificates preview/templates
- Settings پایه

### خارج از محدوده MVP

موارد زیر را فعلاً پیاده‌سازی نکن، مگر به‌صورت placeholder واضح:

- پرداخت و اشتراک
- شبکه اجتماعی و پیام‌رسانی
- پخش زنده
- Drag & Drop کامل ساختار آموزشی
- Permissionهای پیچیده چندنقشی
- Analytics عمیق و گزارش‌های سازمانی
- تولید واقعی PDF یا Image برای Certificate
- Knowledge Graph بصری
- جست‌وجوی سراسری کامل؛ فقط جایگاه و UI اولیه آن قابل نمایش است.

---

## 3. Navigation و App Shell

### Desktop Student Navigation

Navigation اصلی شامل این موارد باشد:

- خانه
- آموزش
- دانشنامه
- کتابخانه
- آزمایشگاه
- پروفایل

Theme switcher و دسترسی ورود / پروفایل در Header قرار بگیرد.

### Mobile Student Navigation

Bottom Navigation پنج آیتم داشته باشد:

- خانه
- آموزش
- دانشنامه
- آزمایشگاه
- پروفایل

کتابخانه از یک منوی ثانویه با عنوان «منابع» یا «بیشتر» در دسترس باشد و در صفحات Home، Learning و Knowledge نیز CTA واضح داشته باشد. کاربر برای رسیدن به کتابخانه نباید مجبور به جست‌وجوی پنهان شود.

### Master Navigation

Master فضای جداگانه با App Shell مستقل داشته باشد:

- داشبورد
- کاربران
- آموزش
  - دانشکده‌ها
  - دوره‌ها
  - سطوح
  - فصل‌ها
  - درس‌ها
- آزمون‌ها
  - Quizها
  - Question Bank
  - Self Assessments
- دانشنامه
  - Glossary
  - Content Relations
- کتابخانه
- Gamification
  - مدال‌ها
  - Achievementها
- گواهی‌ها
- تحلیل
- تنظیمات

Student و Master از نظر تجربه و Navigation با یکدیگر مخلوط نشوند.

---

## 4. Home و حالت‌های کاربر

Home برای کاربر مهمان و کاربر واردشده دو حالت داشته باشد.

### کاربر مهمان

نمایش بده:

- Header ساده
- Hero با عنوان «دانش خود را بساز.»
- زیرعنوان «مسیر یادگیری اقتصاد، بازارهای مالی و رفتار مالی.»
- CTA «شروع یادگیری»
- مسیرهای آموزشی
- معرفی دانشنامه، کتابخانه و آزمایشگاه
- Footer

### کاربر واردشده

همان Home با اطلاعات شخصی‌سازی‌شده تکمیل شود:

- Continue Learning در جایگاه برجسته
- دوره فعلی، فصل و درس آخر
- Progress کلی
- مدال‌ها و Achievementهای اخیر
- Next Step مشخص

Hero نباید شلوغ شود و فقط یک نشانه معماری ایرانی ظریف در قاب یا پس‌زمینه داشته باشد.

---

## 5. Learning و ساختار دوره

ساختار آموزشی را کاملاً سلسله‌مراتبی و قابل فهم نمایش بده:

`Faculty → Course → Level → Chapter → Lesson → Quiz`

در صفحه Learning، موضوعات زیر را به‌صورت کارت یا فهرست نمایش بده:

- اقتصاد کلان
- بورس
- فارکس
- کریپتو
- تحلیل بنیادی
- تحلیل تکنیکال
- مدیریت ریسک
- روان‌شناسی معامله‌گری

### Course card

هر کارت دوره شامل این موارد باشد:

- عنوان
- توضیح کوتاه
- سطح
- زمان پیشنهادی
- Progress
- آخرین مرحله
- CTA متناسب با وضعیت

CTAها:

- دوره شروع نشده: «شروع دوره»
- دوره شروع شده: «ادامه دوره»
- دوره تکمیل شده: «مشاهده دوره»
- دوره قفل: «ابتدا مرحله قبلی را تکمیل کنید»

### Course detail

نمایش بده:

- Breadcrumb
- عنوان و توضیح
- سطح
- تعداد فصل و درس
- زمان پیشنهادی
- Progress کاربر
- مدال مرتبط
- وضعیت Certificate
- CTA اصلی
- فهرست فصل‌ها و آزمون‌ها

وضعیت فصل‌ها و درس‌ها با آیکون، Label و رنگ نمایش داده شود:

- Locked
- In Progress
- Studied
- Passed
- Needs Review

رنگ به‌تنهایی نباید وضعیت را منتقل کند.

### Chapter detail

نمایش بده:

- عنوان فصل
- هدف یادگیری
- تعداد درس
- زمان پیشنهادی
- Progress
- فهرست درس‌ها
- Quiz فصل
- Next Step

فصل قفل‌شده باید دلیل قفل بودن و مسیر باز شدن آن را توضیح دهد.

---

## 6. Lesson و Reading Mode

Lesson مهم‌ترین محیط مطالعه است و باید کم‌مزاحمت‌ترین صفحه محصول باشد.

ساختار:

- Breadcrumb
- عنوان درس
- زمان مطالعه
- خلاصه
- محتوای اصلی
- نکات مهم
- اصطلاحات مرتبط
- منابع
- مطالب مرتبط
- CTA انتهایی
- درس بعدی

در پایین صفحه، Next Step بر اساس وضعیت کاربر تغییر کند:

- «ادامه مطالعه»
- «تکمیل درس‌های باقی‌مانده»
- «شروع آزمون»
- «رفتن به فصل بعد»
- «دریافت گواهی»

### Reading Mode

Reading Mode یک حالت مستقل مطالعه باشد و در Lesson، Glossary و Library قابل فعال‌سازی باشد.

ویژگی‌ها:

- پس‌زمینه گرم و آرام
- ستون متن با عرض محدود
- Line Height بیشتر
- حداقل عناصر جانبی
- حذف تزئینات پررنگ
- حذف انیمیشن‌های غیرضروری
- کنترل اندازه متن
- کنترل فاصله خطوط
- حفظ دسترسی به Breadcrumb و Next Step

Reading Mode نباید Navigation حیاتی یا وضعیت پیشرفت را پنهان کند. انتخاب Theme و تنظیمات مطالعه در مرورگر یا پروفایل ذخیره شود.

---

## 7. Quiz آموزشی

Quiz را از Self Assessment کاملاً جدا طراحی کن.

### Quiz introduction

نمایش بده:

- عنوان
- فصل مرتبط
- تعداد سؤال
- زمان احتمالی
- حدنصاب
- تعداد تلاش مجاز، در صورت وجود
- CTA «شروع آزمون»

### Quiz flow

- یک سؤال در هر مرحله یا گروه‌بندی خوانا
- گزینه‌های قابل لمس
- نمایش Progress آزمون
- امکان بازبینی قبل از ارسال، در صورت مناسب بودن جریان
- جلوگیری از ارسال ناخواسته

### Quiz result

نمایش بده:

- نمره
- حدنصاب
- قبول / رد
- نقاط ضعف یا موضوعات نیازمند مرور
- مرور درس‌ها
- مشاهده پاسخ‌ها
- تلاش مجدد

در صورت قبولی، پیام واضح «فصل بعدی برای شما باز شد» نمایش بده. در صورت رد، مسیر مرور و تلاش مجدد را برجسته کن.

---

## 8. دانشنامه و Glossary

دانشنامه باید حس مرجع حرفه‌ای و آرام داشته باشد.

### Knowledge overview

- عنوان «دانشنامه دارالفنون»
- توضیح کوتاه
- جست‌وجوی مفهوم یا اصطلاح
- دسته‌بندی‌ها
- اصطلاحات منتخب یا اخیر

دسته‌ها:

- اقتصاد
- بورس
- فارکس
- کریپتو
- تحلیل بنیادی
- تحلیل تکنیکال
- مدیریت ریسک
- روان‌شناسی

### Glossary entry

ساختار:

- عنوان اصطلاح
- نام کامل
- تعریف ساده
- تعریف تخصصی
- چرا مهم است؟
- مثال
- ارتباط با بازارها
- درس‌های مرتبط
- اصطلاحات مرتبط
- منابع

ارتباط با درس‌ها و مطالب مرتبط باید CTA و لینک واقعی داشته باشد، نه متن تزئینی.

---

## 9. Library

کتابخانه مستقل از آموزش باشد، اما با Lesson، Glossary و Course ارتباط داشته باشد.

هر Resource card شامل:

- جلد یا آیکون
- عنوان
- نویسنده
- موضوع
- سطح
- نوع منبع
- توضیح کوتاه
- «مشاهده»
- «دریافت» در صورت مجاز بودن

فیلترها:

- موضوع
- نوع
- سطح

منابعی که مجوز انتشار یا ارائه مستقیم ندارند نباید دکمه دریافت فعال داشته باشند. به‌جای آن، لینک قانونی یا توضیح دسترسی نمایش بده.

---

## 10. Laboratory و Self Assessment

آزمایشگاه از فضای آموزش متمایز باشد و روی شناخت رفتار و تحلیل خود تمرکز کند.

دسته‌ها:

- شخصیت مالی
- ریسک‌پذیری
- تحمل زیان
- استرس
- رفتار معاملاتی
- ظرفیت یادگیری
- آمادگی معامله‌گری

### Assessment introduction

- عنوان
- توضیح هدف
- تعداد سؤال
- زمان تقریبی
- اطلاع‌رسانی درباره ذخیره نتیجه
- CTA «شروع آزمون»

### Assessment result

نتیجه فقط عدد نباشد و شامل این موارد باشد:

- امتیاز کلی
- ابعاد اصلی
- نقاط قوت
- نقاط قابل بهبود
- تفسیر انسانی و قابل فهم
- توصیه‌های آموزشی
- لینک به Course، Chapter یا Lesson پیشنهادی

نتیجه در Profile ذخیره شود. Quiz آموزشی و Assessment رفتاری از نظر رنگ، Label، مسیر و زبان رابط از یکدیگر متمایز بمانند.

---

## 11. Profile و Learning Passport

Profile مانند Learning Passport طراحی شود.

نمایش بده:

- نام کاربر
- Progress کلی
- Continue Learning
- زمان کل یادگیری
- روزهای فعال
- دوره‌های تکمیل‌شده
- آزمون‌های موفق
- مدال‌ها
- Achievementها
- Certificateها
- نتایج Assessment

صفحات فرعی:

- `/profile`
- `/profile/courses`
- `/profile/progress`
- `/profile/achievements`
- `/profile/certificates`
- `/profile/assessments`

مدال‌های قفل‌شده نیز نمایش داده شوند تا مسیر آینده کاربر مشخص باشد.

---

## 12. Certificate Preview

Certificate از نظر بصری از صفحات عادی متمایز باشد و شامل این موارد شود:

- قاب حرفه‌ای
- هندسه ایرانی بسیار ظریف
- فضای سفید
- تایپوگرافی رسمی
- نام کاربر
- نام دوره
- مدت یادگیری
- تاریخ
- Certificate ID
- امضای نمایشی
- توضیح روشن درباره غیرآکادمیک بودن گواهی

در MVP دکمه «مشاهده پیش‌نمایش» فعال باشد. دکمه PDF یا Image باید به‌صورت «به‌زودی» یا Disabled واضح نمایش داده شود و وانمود به تولید فایل واقعی نکند.

---

## 13. Master و مدیریت محتوا

Master باید کاربردی، سریع و متراکم‌تر از Student باشد. تزئینات ایرانی در Master حداقلی باشند.

CRUD واقعی برای موارد زیر فراهم کن:

- Faculty
- Course
- Level
- Chapter
- Lesson
- Quiz
- Question
- Self Assessment
- Glossary entry
- Library resource
- Content Relation
- Medal
- Achievement

### Content editor

Editor درس حداقل این فیلدها را داشته باشد:

- عنوان
- خلاصه
- محتوای Rich Text
- تصویر
- ویدئو یا لینک ویدئو
- فایل
- اصطلاحات مرتبط
- درس‌های مرتبط
- منابع
- وضعیت انتشار

### Content status

وضعیت محتوا:

`Draft → Review → Published → Archived`

انتقال وضعیت باید از طریق کنترل واضح انجام شود و وضعیت فعلی همیشه در فهرست و صفحه جزئیات قابل مشاهده باشد.

### Question Bank

هر سؤال شامل این موارد باشد:

- متن سؤال
- گزینه‌ها
- پاسخ صحیح
- توضیح پاسخ
- موضوع
- سطح
- فصل مرتبط
- درجه سختی
- وضعیت انتشار

### Content Relations

ارتباط‌های زیر را پشتیبانی کن:

- Lesson ↔ Glossary
- Lesson ↔ Lesson
- Lesson ↔ Library
- Glossary ↔ Glossary
- Course ↔ Course
- Lesson ↔ Assessment

---

## 14. Visual Design System

هویت ایرانی باید در جزئیات دیده شود، نه در تزئینات سنگین.

### رنگ‌های پایه پیشنهادی

این مقادیر به‌عنوان Default اجرایی استفاده شوند و در همه Themeها با Tokenهای جداگانه تعریف شوند:

#### Light

- Background: `#F7F5EF`
- Surface: `#FFFFFF`
- Text: `#172033`
- Muted text: `#657084`
- Primary / Lapis: `#163B6D`
- Secondary / Turquoise: `#238C89`
- Accent / Gold: `#C5963A`
- Border: `#DDE2E8`

#### Dark

- Background: `#0D1726`
- Surface: `#132238`
- Card: `#1A2D47`
- Text: `#F2F4F7`
- Muted text: `#AAB7C8`
- Primary: `#79A9DE`
- Secondary: `#4FC1B7`
- Accent: `#D6AA50`
- Border: `#2A3D57`

#### Reading

- Background: `#F3EBDD`
- Surface: `#FBF7EF`
- Text: `#3D332B`
- Muted text: `#75685D`
- Primary: `#285578`
- Secondary: `#5D8D88`
- Accent: `#AD7C32`
- Border: `#E2D5C3`

#### Functional

- Success: `#2E7D5B`
- Warning: `#B7791F`
- Error: `#B34040`
- Info: `#2C7A9B`

رنگ‌های عملکردی نیز برای Light، Dark و Reading باید از نظر کنتراست مناسب باشند.

### Typography

- فونت اصلی فارسی: Vazirmatn یا فونت فارسی خوانای هم‌تراز با وزن‌های 400، 500، 600 و 700
- Fallback: `system-ui`, `sans-serif`
- Body پایه: 16px با Line Height حداقل 1.75 در متن فارسی
- متن Lesson: حداکثر عرض خوانا، ترجیحاً حدود 680 تا 760px
- H1 و H2 سلسله‌مراتب واضح داشته باشند و از وزن‌های سنگین بیش از حد استفاده نشود.

### Shape و Layout

- Spacing بر پایه مقیاس 4 یا 8px
- Card radius اصلی: 16px
- کنترل‌ها و دکمه‌ها: 10 تا 12px
- Certificate و Hero می‌توانند قاب یا radius متمایز داشته باشند.
- Shadowها نرم و کم‌عمق باشند.
- آیکون‌ها سبک خطی و یکپارچه، ترجیحاً با اندازه و Stroke ثابت باشند.
- نقوش ایرانی فقط در Hero، Certificate، Divider یا وضعیت‌های ویژه استفاده شوند.
- از Background pattern دائمی در صفحات مطالعه استفاده نشود.

### Responsive

طراحی با این اولویت انجام شود:

`Mobile → Tablet → Desktop`

نقاط شکست را بر اساس محتوا تعیین کن، نه صرفاً دستگاه. هیچ جدول، فرم یا Editor نباید در موبایل با عرض شکسته یا اسکرول افقی ناخواسته نمایش داده شود.

---

## 15. Accessibility و Interaction

الزامات قطعی:

- RTL کامل
- کنتراست حداقل WCAG AA
- Focus State واضح
- Keyboard navigation در Desktop
- Touch target مناسب در Mobile
- Label متنی برای وضعیت‌های رنگی
- متن جایگزین برای تصویر
- خطاهای قابل فهم و غیر فنی
- حفظ وضعیت فرم در خطا
- استفاده از `prefers-reduced-motion`
- عدم استفاده از انیمیشن دائمی یا Parallax سنگین

Micro-interaction فقط برای این رویدادها مجاز است:

- تکمیل Lesson
- باز شدن فصل
- Unlock
- دریافت Medal
- تغییر Theme

انیمیشن‌ها کوتاه، هدفمند و قابل حذف باشند.

---

## 16. Empty State و Error State

Empty Stateها باید هم توضیح و هم CTA داشته باشند:

- «هنوز دوره‌ای را شروع نکرده‌اید.» → «مشاهده دوره‌ها»
- «هنوز گواهی‌ای دریافت نکرده‌اید.» → «شروع یک مسیر آموزشی»
- «نتیجه‌ای برای نمایش وجود ندارد.» → تغییر فیلتر یا جست‌وجو

به Student خطای فنی نشان نده. به‌جای آن از پیام‌های انسانی استفاده کن:

- «این بخش در حال حاضر برای شما قابل دسترسی نیست.»
- «ابتدا مرحله قبلی را با موفقیت تکمیل کنید.»
- «اطلاعات با مشکل مواجه شد؛ دوباره تلاش کنید.»

Master می‌تواند جزئیات فنی را فقط در محیط مناسب مدیریت نمایش دهد، اما پیام کاربرمحور باید همیشه وجود داشته باشد.

---

## 17. داده نمایشی و مسیرهای قابل تست

برای اینکه MVP در اولین اجرا قابل ارزیابی باشد، داده نمایشی واقعی و فارسی ایجاد کن، نه Placeholderهای بی‌معنا.

حداقل داده پیشنهادی:

- 3 Faculty
- حداقل 1 Course کامل با Level، Chapter، Lesson و Quiz
- چند Course قفل‌شده یا شروع‌نشده
- حداقل 6 Glossary entry، از جمله CPI، تورم و نرخ بهره
- حداقل 6 Library resource با انواع و سطوح مختلف
- حداقل 4 Self Assessment
- چند Medal و Achievement
- یک کاربر با Progress میانی، مثلاً 48٪
- یک کاربر بدون Course برای نمایش Empty State
- نمونه نتیجه Quiz قبول‌شده و ردشده
- نمونه نتیجه Assessment با توصیه آموزشی
- نمونه Certificate Preview

این مسیرها باید بدون بن‌بست قابل تست باشند:

1. Home → Learning → Course → Chapter → Lesson → Quiz → Result → Unlock
2. Home → Continue Learning → آخرین Lesson
3. Knowledge → Glossary entry → Lesson مرتبط
4. Library → Resource detail → Related content
5. Lab → Assessment → Result → Course پیشنهادی
6. Profile → Certificate Preview
7. Master → Create Lesson → Preview → Publish
8. Master → Question Bank → افزودن سؤال به Quiz

---

## 18. معیارهای پذیرش

MVP زمانی قابل قبول است که:

- تمام صفحات اصلی Student و Master قابل دسترسی باشند.
- Navigation در Mobile و Desktop روشن و بدون بن‌بست باشد.
- کتابخانه در موبایل از مسیر ثانویه اما واضح قابل دسترسی باشد.
- کاربر بتواند یک Course را از ابتدا تا نتیجه Quiz طی کند.
- Unlock فصل بعد در مسیر آموزشی قابل مشاهده باشد.
- Continue Learning از Home و Profile کار کند.
- Lesson در Reading Mode خوانا و کم‌مزاحمت باشد.
- Quiz و Assessment در UI و نتیجه با یکدیگر اشتباه نشوند.
- داده‌ها در Refresh از بین نروند، یا اگر محیط نمونه است، روش ذخیره‌سازی آن شفاف باشد.
- Master بتواند محتوای اصلی را ایجاد، ویرایش، مشاهده، فیلتر و Archive کند.
- روابط بین Lesson، Glossary و Library قابل مشاهده و قابل مدیریت باشند.
- Empty، Loading، Error و Locked State برای مسیرهای اصلی وجود داشته باشند.
- هیچ قابلیت غیرواقعی مانند Download PDF فعال بدون پیاده‌سازی نمایش داده نشود.
- RTL، Responsive و Accessibility در کل محصول یکپارچه باشند.

---

## 19. ترتیب اجرای ساخت

به این ترتیب اجرا کن:

1. App Shell، RTL، Themeها و Design Tokens
2. Navigation و Responsive layout
3. Home و Learning
4. Course، Chapter و Lesson
5. Quiz و Unlock flow
6. Knowledge و Glossary
7. Library
8. Laboratory و Assessment
9. Profile و Certificate Preview
10. Master dashboard و CRUD محتوا
11. Content Relations
12. Empty، Loading، Error و Accessibility pass
13. بازبینی نهایی مسیرهای پذیرش

پیش از کامل‌شدن جریان‌های اصلی، روی تزئینات، انیمیشن‌های ویژه یا جزئیات فرعی تمرکز نکن.

---

## خروجی مورد انتظار

یک MVP فارسی، RTL، Mobile First، آرام، حرفه‌ای و قابل تست بساز که هویت ایرانی را در جزئیات ظریف نشان دهد و مسیر یادگیری را در هر لحظه برای کاربر روشن نگه دارد.

از تولید صفحه‌های تزئینی بدون جریان واقعی خودداری کن. هر صفحه باید هدف، وضعیت، CTA و مسیر بعدی مشخص داشته باشد.

تا زمانی که این معیارهای پذیرش برآورده نشده‌اند، قابلیت‌های فرعی جدید اضافه نکن.
