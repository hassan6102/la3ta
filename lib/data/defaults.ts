import type {ServiceCategory, SiteSettings} from '@/lib/types'

/**
 * Temporary content used until Firestore is connected (Phase 2).
 * Fallback content used when Firebase Admin is not configured (or a read fails), and as the
 * source for the one-time catalog import from the admin dashboard.
 * - WhatsApp number is a PLACEHOLDER. Set the real one in Admin > Settings.
 * - No street address is invented.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  studioName: {ar: 'SIRA — سير', en: 'SIRA — سير'},
  location: {ar: 'الخانكة، القليوبية، مصر', en: 'Al Khanka, Qalyubia, Egypt'},
  whatsappNumber: '200000000000',
  whatsappIsPlaceholder: true,
  defaultCurrency: 'EGP',
  builderEnabled: true,
}

/** Phase 1 service catalog (names only, no prices). Imported into Firestore from Admin > Services; prices are entered there. */
export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'photography',
    order: 1,
    active: true,
    name: {ar: 'التصوير الفوتوغرافي', en: 'Photography'},
    description: {
      ar: 'صور احترافية تدّيك حضور قوي قدّام طلابك.',
      en: 'Professional photos that give you a strong presence with your students.',
    },
    items: [
      {id: 'teacher-photography', name: {ar: 'تصوير احترافي للمدرّس', en: 'Teacher professional photography'}},
      {id: 'studio-photography', name: {ar: 'تصوير داخل الاستوديو', en: 'Studio photography'}},
      {id: 'profile-photos', name: {ar: 'صور البروفايل', en: 'Profile photos'}},
      {id: 'promo-photography', name: {ar: 'تصوير ترويجي', en: 'Promotional photography'}},
    ],
  },
  {
    id: 'video',
    order: 2,
    active: true,
    name: {ar: 'إنتاج الفيديو', en: 'Video production'},
    description: {
      ar: 'تسجيل محاضراتك وكورساتك وفيديوهاتك بجودة عالية.',
      en: 'High-quality recording of your lectures, courses and videos.',
    },
    items: [
      {id: 'lecture-recording', name: {ar: 'تسجيل المحاضرات', en: 'Lecture recording'}},
      {id: 'course-recording', name: {ar: 'تسجيل الكورسات', en: 'Course recording'}},
      {id: 'educational-videos', name: {ar: 'فيديوهات تعليمية', en: 'Educational videos'}},
      {id: 'youtube-videos', name: {ar: 'فيديوهات يوتيوب', en: 'YouTube videos'}},
      {id: 'reels', name: {ar: 'ريلز', en: 'Reels'}},
      {id: 'shorts', name: {ar: 'شورتس', en: 'Shorts'}},
      {id: 'tiktok', name: {ar: 'فيديوهات تيك توك', en: 'TikTok videos'}},
      {id: 'promo-videos', name: {ar: 'فيديوهات ترويجية', en: 'Promotional videos'}},
    ],
  },
  {
    id: 'editing',
    order: 3,
    active: true,
    name: {ar: 'المونتاج', en: 'Video editing'},
    description: {
      ar: 'مونتاج نضيف يخلّي المحتوى بتاعك واضح وممتع.',
      en: 'Clean editing that keeps your content clear and engaging.',
    },
    items: [
      {id: 'basic-editing', name: {ar: 'مونتاج أساسي', en: 'Basic editing'}},
      {id: 'pro-editing', name: {ar: 'مونتاج احترافي', en: 'Professional editing'}},
      {id: 'lecture-editing', name: {ar: 'مونتاج المحاضرات', en: 'Lecture editing'}},
      {id: 'shorts-editing', name: {ar: 'مونتاج الشورتس والريلز', en: 'Shorts and Reels editing'}},
      {id: 'subtitles', name: {ar: 'ترجمة (Subtitles)', en: 'Subtitles'}},
      {id: 'motion-graphics', name: {ar: 'موشن جرافيك', en: 'Motion graphics'}},
      {id: 'intro-outro', name: {ar: 'مقدمة وخاتمة', en: 'Intro and outro'}},
      {id: 'color-correction', name: {ar: 'تصحيح الألوان', en: 'Color correction'}},
      {id: 'audio-enhancement', name: {ar: 'تحسين الصوت', en: 'Audio enhancement'}},
    ],
  },
  {
    id: 'design',
    order: 4,
    active: true,
    name: {ar: 'التصميم', en: 'Design'},
    description: {
      ar: 'تصميمات تخلّي قنواتك وصفحاتك شكلها احترافي.',
      en: 'Designs that make your channels and pages look professional.',
    },
    items: [
      {id: 'thumbnails', name: {ar: 'صور مصغّرة ليوتيوب', en: 'YouTube thumbnails'}},
      {id: 'social-posts', name: {ar: 'بوستات السوشيال ميديا', en: 'Social media posts'}},
      {id: 'instagram', name: {ar: 'تصميمات إنستجرام', en: 'Instagram designs'}},
      {id: 'facebook', name: {ar: 'تصميمات فيسبوك', en: 'Facebook designs'}},
      {id: 'stories', name: {ar: 'ستوريز', en: 'Stories'}},
      {id: 'posters', name: {ar: 'بوسترات', en: 'Posters'}},
      {id: 'educational-graphics', name: {ar: 'جرافيكس تعليمية', en: 'Educational graphics'}},
      {id: 'course-covers', name: {ar: 'أغلفة كورسات', en: 'Course covers'}},
      {id: 'worksheets', name: {ar: 'تصميم PDF وأوراق عمل', en: 'PDF and worksheet design'}},
    ],
  },
]
