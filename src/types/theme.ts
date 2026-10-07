export type ThemeId =
  | 'sapphire'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'ocean'
  | 'midnight';

export type BackgroundPresetId =
  | 'deep-gradient'
  | 'grid'
  | 'classroom'
  | 'paper'
  | 'pure'
  | 'midnight';

export interface BackgroundPreset {
  id: BackgroundPresetId;
  name: string;
  subtitle: string;
  description: string;
  className: string;
  previewBg: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'pure',
    name: 'Nền Trắng Sáng Thanh Thoát (Mặc định)',
    subtitle: 'Nền trắng sáng, sạch đẹp, dễ nhìn & chuẩn mực',
    description: 'Nền trắng sáng phẳng thanh thoát, tối ưu độ sáng và tương phản để theo dõi danh sách nề nếp thi đua rõ nét.',
    className: 'bg-white text-slate-900',
    previewBg: 'bg-white border border-slate-300',
  },
  {
    id: 'grid',
    name: 'Lưới Vi Điểm Dịu Mắt (Chuẩn hiện đại)',
    subtitle: 'Êm mắt, chống lóa, bảng biểu nổi bật rõ ràng',
    description: 'Nền xám slate nhạt có vi điểm êm dịu, độ tương phản tối ưu giúp đọc bảng số liệu lâu không bị mỏi mắt.',
    className: 'bg-pattern-grid text-slate-900',
    previewBg: 'bg-slate-100',
  },
  {
    id: 'classroom',
    name: 'Phòng Học Thông Minh (Chuyển sắc)',
    subtitle: 'Gradient thanh nhã, tạo không gian thoáng đãng',
    description: 'Chuyển sắc êm ái từ ánh xanh lam học đường đến nền slate dịu mát, tạo cảm giác sinh động và tươi sáng.',
    className: 'bg-pattern-classroom text-slate-900',
    previewBg: 'bg-gradient-to-b from-blue-100 to-slate-100',
  },
  {
    id: 'paper',
    name: 'Giấy Ấm Chống Mỏi (Warm Paper)',
    subtitle: 'Tông be ấm tự nhiên như trang vở học sinh',
    description: 'Nền ngả màu be ấm áp dịu nhẹ, hạn chế ánh sáng xanh, cực kỳ thân thiện với mắt khi theo dõi sổ sách lâu.',
    className: 'bg-pattern-paper text-slate-900',
    previewBg: 'bg-amber-100/60',
  },
  {
    id: 'deep-gradient',
    name: 'Trắng Ngà Tinh Khôi',
    subtitle: 'Nền sáng dịu nhẹ, hài hòa thanh điều hướng',
    description: 'Nền trắng tinh khôi dịu mắt, tương phản chuẩn mực làm nổi bật nội dung.',
    className: 'bg-white text-slate-900',
    previewBg: 'bg-white border border-slate-200',
  },
  {
    id: 'midnight',
    name: 'Xám Nhạt Chống Chói',
    subtitle: 'Tông xám êm dịu, nhẹ nhàng cho mắt',
    description: 'Nền xám sáng tối giản, hài hòa với mọi bảng biểu nề nếp.',
    className: 'bg-slate-50 text-slate-900',
    previewBg: 'bg-slate-100',
  },
];

export interface ColorTheme {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  swatches: string[]; // [primary, secondary, accent, bg]
  primaryGradient: string;
  secondaryGradient: string;
  badgeGradient: string;
  headerBg: string;
  tabActiveBg: string;
  tabActiveText: string;
  highlightText: string;
  buttonRecord: string;
  buttonImport: string;
  bodyBg: string;
  cardBorder: string;
  isDark?: boolean;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'sapphire',
    name: 'Xanh Sapphire Học Đường',
    subtitle: 'Chuẩn mực & Sang trọng (Mặc định)',
    description: 'Phối màu xanh hoàng gia kết hợp vàng kim truyền thống THCS. Thanh lịch, trang trọng và uy tín.',
    swatches: ['#2563eb', '#4f46e5', '#059669', '#f59e0b'],
    primaryGradient: 'from-indigo-600 to-blue-600',
    secondaryGradient: 'from-indigo-950 via-slate-900 to-indigo-900',
    badgeGradient: 'from-indigo-600 to-blue-600',
    headerBg: 'bg-white',
    tabActiveBg: 'bg-white',
    tabActiveText: 'text-indigo-700',
    highlightText: 'text-indigo-600',
    buttonRecord: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white',
    buttonImport: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
    bodyBg: 'bg-pattern-grid text-slate-900',
    cardBorder: 'border-slate-200',
    isDark: false,
  },
  {
    id: 'emerald',
    name: 'Xanh Ngọc Bích / Hiện Đại',
    subtitle: 'Tươi mới & Tràn đầy sinh lực',
    description: 'Phối màu xanh ngọc lục bảo kết hợp xanh bạc hà. Đem lại cảm giác tươi mát, thân thiện và năng động cho lớp học.',
    swatches: ['#059669', '#0d9488', '#10b981', '#34d399'],
    primaryGradient: 'from-emerald-600 to-teal-600',
    secondaryGradient: 'from-emerald-950 via-teal-900 to-slate-900',
    badgeGradient: 'from-emerald-600 to-teal-600',
    headerBg: 'bg-white',
    tabActiveBg: 'bg-white',
    tabActiveText: 'text-emerald-700',
    highlightText: 'text-emerald-600',
    buttonRecord: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
    buttonImport: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white',
    bodyBg: 'bg-pattern-grid text-slate-900',
    cardBorder: 'border-emerald-200/80',
    isDark: false,
  },
  {
    id: 'amber',
    name: 'Cam Hổ Phách / Nhiệt Huyết',
    subtitle: 'Năng động, Thi đua sôi nổi & Ấm áp',
    description: 'Tông màu cam hổ phách, vàng nắng rực rỡ và đỏ thi đua. Khích lệ tinh thần phấn đấu, cạnh tranh lành mạnh giữa 6 nhóm.',
    swatches: ['#d97706', '#ea580c', '#e11d48', '#fbbf24'],
    primaryGradient: 'from-amber-600 to-orange-600',
    secondaryGradient: 'from-amber-950 via-orange-950 to-slate-900',
    badgeGradient: 'from-amber-600 to-orange-600',
    headerBg: 'bg-white',
    tabActiveBg: 'bg-white',
    tabActiveText: 'text-amber-800',
    highlightText: 'text-amber-700',
    buttonRecord: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white',
    buttonImport: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
    bodyBg: 'bg-pattern-paper text-slate-900',
    cardBorder: 'border-amber-200/80',
    isDark: false,
  },
  {
    id: 'violet',
    name: 'Tím Lavender / Quý Phái',
    subtitle: 'Sáng tạo, Tinh tế & Nghệ thuật',
    description: 'Gam màu tím oải hương kết hợp hồng đào dịu mắt. Hiện đại, trẻ trung, rất phù hợp với môi trường sư phạm thân thiện.',
    swatches: ['#7c3aed', '#9333ea', '#c026d3', '#a855f7'],
    primaryGradient: 'from-purple-600 to-indigo-600',
    secondaryGradient: 'from-purple-950 via-indigo-950 to-slate-900',
    badgeGradient: 'from-purple-600 to-indigo-600',
    headerBg: 'bg-white',
    tabActiveBg: 'bg-white',
    tabActiveText: 'text-purple-700',
    highlightText: 'text-purple-600',
    buttonRecord: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white',
    buttonImport: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white',
    bodyBg: 'bg-pattern-grid text-slate-900',
    cardBorder: 'border-purple-200/80',
    isDark: false,
  },
  {
    id: 'ocean',
    name: 'Đại Dương Tri Thức / Deep Ocean',
    subtitle: 'Sâu lắng, Rộng mở & Hiện đại',
    description: 'Phối màu xanh lam biển sâu kết hợp xanh cyan thanh khiết. Tạo cảm giác tĩnh tâm, rõ ràng và tập trung cao độ.',
    swatches: ['#0284c7', '#0369a1', '#0891b2', '#38bdf8'],
    primaryGradient: 'from-sky-600 to-cyan-600',
    secondaryGradient: 'from-sky-950 via-slate-900 to-cyan-950',
    badgeGradient: 'from-sky-600 to-cyan-600',
    headerBg: 'bg-white',
    tabActiveBg: 'bg-white',
    tabActiveText: 'text-sky-700',
    highlightText: 'text-sky-600',
    buttonRecord: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white',
    buttonImport: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
    bodyBg: 'bg-pattern-classroom text-slate-900',
    cardBorder: 'border-sky-200/80',
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Dạ Kim Huyền Bí / Midnight Gold',
    subtitle: 'Chế độ tương phản cao & Dịu mắt ban đêm',
    description: 'Nền xám chì sâu thẳm phối viền vàng kim và xanh Sapphire phản quang. Cực kỳ bắt mắt, sang trọng và giảm mỏi mắt.',
    swatches: ['#0f172a', '#1e293b', '#f59e0b', '#38bdf8'],
    primaryGradient: 'from-indigo-500 to-blue-500',
    secondaryGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    badgeGradient: 'from-amber-400 to-amber-600',
    headerBg: 'bg-slate-900 text-white',
    tabActiveBg: 'bg-slate-800 text-amber-300',
    tabActiveText: 'text-amber-300 font-bold',
    highlightText: 'text-amber-400',
    buttonRecord: 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md',
    buttonImport: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md',
    bodyBg: 'bg-pattern-midnight text-slate-100',
    cardBorder: 'border-slate-800',
    isDark: true,
  },
];
