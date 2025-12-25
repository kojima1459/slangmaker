/**
 * Skin-specific theme configurations for dynamic UI styling
 * Each skin has a unique color palette that transforms the entire UI
 */

export interface SkinTheme {
  // Background gradient for main container
  bgGradient: string;
  // Accent color name (for Tailwind classes)
  accent: string;
  // Card/section background
  cardBg: string;
  // Border color
  border: string;
  // Button gradient
  buttonGradient: string;
  // Text accent color
  textAccent: string;
}

export const SKIN_THEMES: Record<string, SkinTheme> = {
  // 関西ノリ風 - Warm orange/red tones
  kansai_banter: {
    bgGradient: 'from-orange-50 via-red-50 to-yellow-50',
    accent: 'orange',
    cardBg: 'bg-orange-50/50',
    border: 'border-orange-200',
    buttonGradient: 'from-orange-500 to-red-500',
    textAccent: 'text-orange-600',
  },
  
  // デタッチ文学風 - Cool gray/slate tones
  detached_lit: {
    bgGradient: 'from-slate-50 via-gray-50 to-stone-50',
    accent: 'slate',
    cardBg: 'bg-slate-50/50',
    border: 'border-slate-200',
    buttonGradient: 'from-slate-500 to-gray-600',
    textAccent: 'text-slate-600',
  },
  
  // 意味深セーフ大人風 - Deep purple/rose tones
  suggestive_safe: {
    bgGradient: 'from-rose-50 via-purple-50 to-pink-50',
    accent: 'rose',
    cardBg: 'bg-rose-50/50',
    border: 'border-rose-200',
    buttonGradient: 'from-rose-500 to-purple-500',
    textAccent: 'text-rose-600',
  },
  
  // おじさん構文風 - Warm brown/amber tones
  ojisan_mail: {
    bgGradient: 'from-amber-50 via-yellow-50 to-orange-50',
    accent: 'amber',
    cardBg: 'bg-amber-50/50',
    border: 'border-amber-200',
    buttonGradient: 'from-amber-500 to-orange-500',
    textAccent: 'text-amber-600',
  },
  
  // 詩的エモ風 - Dreamy blue/indigo tones
  poetic_emo: {
    bgGradient: 'from-indigo-50 via-blue-50 to-violet-50',
    accent: 'indigo',
    cardBg: 'bg-indigo-50/50',
    border: 'border-indigo-200',
    buttonGradient: 'from-indigo-500 to-violet-500',
    textAccent: 'text-indigo-600',
  },
  
  // 名言ボット風 - Classic gold/amber tones
  aphorism: {
    bgGradient: 'from-yellow-50 via-amber-50 to-orange-50',
    accent: 'yellow',
    cardBg: 'bg-yellow-50/50',
    border: 'border-yellow-300',
    buttonGradient: 'from-yellow-500 to-amber-500',
    textAccent: 'text-yellow-700',
  },
  
  // 謎の暗号風 - Matrix green/emerald tones
  cryptic_code: {
    bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
    accent: 'emerald',
    cardBg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    buttonGradient: 'from-emerald-500 to-green-600',
    textAccent: 'text-emerald-600',
  },
  
  // 哲学講義風 - Academic brown/stone tones
  philo_lecture: {
    bgGradient: 'from-stone-50 via-amber-50 to-neutral-50',
    accent: 'stone',
    cardBg: 'bg-stone-50/50',
    border: 'border-stone-300',
    buttonGradient: 'from-stone-500 to-amber-600',
    textAccent: 'text-stone-600',
  },
  
  // 論戦系政治家風 - Serious navy/blue tones
  debate_politico: {
    bgGradient: 'from-blue-50 via-slate-50 to-indigo-50',
    accent: 'blue',
    cardBg: 'bg-blue-50/50',
    border: 'border-blue-200',
    buttonGradient: 'from-blue-600 to-indigo-600',
    textAccent: 'text-blue-700',
  },
  
  // 演説ポエム風 - Patriotic red/blue tones
  speech_poem: {
    bgGradient: 'from-red-50 via-white to-blue-50',
    accent: 'red',
    cardBg: 'bg-red-50/30',
    border: 'border-red-200',
    buttonGradient: 'from-red-500 to-blue-500',
    textAccent: 'text-red-600',
  },
  
  // 若者言葉風（Z世代） - Vibrant pink/purple tones
  gen_z_slang: {
    bgGradient: 'from-pink-50 via-purple-50 to-fuchsia-50',
    accent: 'pink',
    cardBg: 'bg-pink-50/50',
    border: 'border-pink-200',
    buttonGradient: 'from-pink-500 to-purple-500',
    textAccent: 'text-pink-600',
  },
  
  // ラップ風 - Urban violet/purple tones
  rap_style: {
    bgGradient: 'from-violet-50 via-purple-50 to-indigo-50',
    accent: 'violet',
    cardBg: 'bg-violet-50/50',
    border: 'border-violet-200',
    buttonGradient: 'from-violet-500 to-purple-600',
    textAccent: 'text-violet-600',
  },
  
  // 学術論文風 - Professional blue/gray tones
  academic_paper: {
    bgGradient: 'from-sky-50 via-blue-50 to-slate-50',
    accent: 'sky',
    cardBg: 'bg-sky-50/50',
    border: 'border-sky-200',
    buttonGradient: 'from-sky-500 to-blue-600',
    textAccent: 'text-sky-700',
  },
  
  // ギャル語風 - Flashy pink/yellow tones
  gyaru_slang: {
    bgGradient: 'from-fuchsia-50 via-pink-50 to-yellow-50',
    accent: 'fuchsia',
    cardBg: 'bg-fuchsia-50/50',
    border: 'border-fuchsia-200',
    buttonGradient: 'from-fuchsia-500 to-pink-500',
    textAccent: 'text-fuchsia-600',
  },
  
  // 敬語過剰風 - Elegant teal/cyan tones
  keigo_excessive: {
    bgGradient: 'from-teal-50 via-cyan-50 to-emerald-50',
    accent: 'teal',
    cardBg: 'bg-teal-50/50',
    border: 'border-teal-200',
    buttonGradient: 'from-teal-500 to-cyan-500',
    textAccent: 'text-teal-600',
  },
};

// Default theme for custom skins or unknown skins
export const DEFAULT_THEME: SkinTheme = {
  bgGradient: 'from-purple-50 via-pink-50 to-orange-50',
  accent: 'purple',
  cardBg: 'bg-purple-50/50',
  border: 'border-purple-200',
  buttonGradient: 'from-purple-600 to-pink-500',
  textAccent: 'text-purple-600',
};

/**
 * Get theme for a given skin key
 * Falls back to default theme for unknown skins (including custom skins)
 */
export function getThemeForSkin(skinKey: string): SkinTheme {
  return SKIN_THEMES[skinKey] || DEFAULT_THEME;
}
