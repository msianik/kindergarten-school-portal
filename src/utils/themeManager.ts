/**
 * School Theme & App Primary Color Manager for Ananda Pathshala
 * Controls dynamic site-wide CSS variables, document root properties,
 * and the HTML <meta name="theme-color"> tag.
 */

export interface SchoolThemePreset {
  id: string;
  nameBn: string;
  nameEn: string;
  primaryColor: string;
  lightBg: string;
  borderTint: string;
  badgeBn: string;
  descriptionBn: string;
}

export interface ThemeShades {
  primary: string;
  hover: string;
  light: string;
  border: string;
  rgbString: string;
  s50: string;
  s100: string;
  s200: string;
  s300: string;
  s400: string;
  s500: string;
  s600: string;
  s700: string;
  s800: string;
  s900: string;
  s950: string;
}

export const DEFAULT_THEME_COLOR = '#065f46'; // Emerald Green (Ananda Pathshala Classic)

export const SCHOOL_THEME_STORAGE_KEY = 'ananda_school_theme_color';

export const PRESET_SCHOOL_THEMES: SchoolThemePreset[] = [
  {
    id: 'emerald',
    nameBn: 'পান্না সবুজ (ডিফল্ট ক্লাসিক)',
    nameEn: 'Emerald Green',
    primaryColor: '#065f46',
    lightBg: '#ecfdf5',
    borderTint: '#a7f3d0',
    badgeBn: 'মূল ব্র্যান্ড কালার',
    descriptionBn: 'আনন্দ পাঠশালার মূল পরিচিতি ও শিশুদের শান্ত পরিবেশবান্ধব ক্লাসিক থিম।',
  },
  {
    id: 'teal',
    nameBn: 'টিয়াল ও সামুদ্রিক নীল',
    nameEn: 'Montessori Teal',
    primaryColor: '#0f766e',
    lightBg: '#f0fdfa',
    borderTint: '#99f6e4',
    badgeBn: 'মন্টেসরি প্রশান্তি',
    descriptionBn: 'মনোযোগ ও প্রজ্ঞার প্রতীক, লার্নিং ও প্রাক-প্রাথমিক ক্লাসরুমের জন্য আদর্শ।',
  },
  {
    id: 'blue',
    nameBn: 'রাজকীয় নীল (একাডেমিক ট্রাস্ট)',
    nameEn: 'Royal Blue',
    primaryColor: '#1d4ed8',
    lightBg: '#eff6ff',
    borderTint: '#bfdbfe',
    badgeBn: 'একাডেমিক শ্রেষ্ঠত্ব',
    descriptionBn: 'আধুনিক স্মার্ট স্কুল ও আনুষ্ঠানিক পরিচালনা পর্ষদের আস্থার নীল থিম।',
  },
  {
    id: 'indigo',
    nameBn: 'ইন্ডিগো বেগুনি (সৃজনশীলতা)',
    nameEn: 'Creative Indigo',
    primaryColor: '#4338ca',
    lightBg: '#eef2ff',
    borderTint: '#c7d2fe',
    badgeBn: 'সৃজনশীল পাঠদান',
    descriptionBn: 'চিত্রাঙ্কন, ক্রাফট ও ডিজিটাল ডায়রির সাথে মানানসই সৃষ্টিশীল রঙ।',
  },
  {
    id: 'amber',
    nameBn: 'উষ্ণ অম্বর (স্বর্ণালী পাঠশালা)',
    nameEn: 'Warm Amber Gold',
    primaryColor: '#92400e',
    lightBg: '#fffbeb',
    borderTint: '#fde68a',
    badgeBn: 'উজ্জ্বল প্রজ্ঞা',
    descriptionBn: 'বাঙালিয়ানার মাটির উষ্ণতা ও আনন্দদায়ক প্রাতঃকালীন শৈশব স্মৃতি।',
  },
  {
    id: 'rose',
    nameBn: 'রুবি রোজ (প্রাণবন্ত শৈশব)',
    nameEn: 'Ruby Rose',
    primaryColor: '#be123c',
    lightBg: '#fff1f2',
    borderTint: '#fecdd3',
    badgeBn: 'উচ্ছ্বল আনন্দ',
    descriptionBn: 'ছোট শিশুদের চপলতা, খেলাধুলা ও চাইল্ড-ফ্রেন্ডলি এনার্জি।',
  },
  {
    id: 'purple',
    nameBn: 'মায়াময় পার্পল (প্লেফুল মেধা)',
    nameEn: 'Playful Purple',
    primaryColor: '#6b21a8',
    lightBg: '#faf5ff',
    borderTint: '#e9d5ff',
    badgeBn: 'কল্পনার জগৎ',
    descriptionBn: 'শিশুদের কল্পনার গল্প, ছড়া ও সাংস্কৃতিক পাঠশালার রঙিন ভাব।',
  },
  {
    id: 'forest',
    nameBn: 'চিরসবুজ অরণ্য (প্রকৃতির পাঠ)',
    nameEn: 'Forest Pine',
    primaryColor: '#15803d',
    lightBg: '#f0fdf4',
    borderTint: '#bbf7d0',
    badgeBn: 'সবুজ কানন',
    descriptionBn: 'কুষ্টিয়ার মুক্ত বাতাস ও স্কুলের প্রাকৃতিক উন্মুক্ত খেলার পরিবেশ।',
  },
  {
    id: 'orange',
    nameBn: 'সূর্যমুখী কমলা (উজ্জ্বল প্রভাত)',
    nameEn: 'Sunflower Orange',
    primaryColor: '#c2410c',
    lightBg: '#fff7ed',
    borderTint: '#fed7aa',
    badgeBn: 'প্রভাতী কিরণ',
    descriptionBn: 'সকালের রোদ, আনন্দময় আগমন ও শিশুদের উচ্ছ্বসিত উপস্থিতি।',
  },
];

export const PRESET_SHADES: Record<string, {
  s50: string;
  s100: string;
  s200: string;
  s300: string;
  s400: string;
  s500: string;
  s600: string;
  s700: string;
  s800: string;
  s900: string;
  s950: string;
}> = {
  emerald: {
    s50: '#ecfdf5',
    s100: '#d1fae5',
    s200: '#a7f3d0',
    s300: '#6ee7b7',
    s400: '#34d399',
    s500: '#10b981',
    s600: '#059669',
    s700: '#047857',
    s800: '#065f46',
    s900: '#064e3b',
    s950: '#022c22',
  },
  teal: {
    s50: '#f0fdfa',
    s100: '#ccfbf1',
    s200: '#99f6e4',
    s300: '#5eead4',
    s400: '#2dd4bf',
    s500: '#14b8a6',
    s600: '#0d9488',
    s700: '#0f766e',
    s800: '#115e59',
    s900: '#134e4a',
    s950: '#042f2e',
  },
  blue: {
    s50: '#eff6ff',
    s100: '#dbeafe',
    s200: '#bfdbfe',
    s300: '#93c5fd',
    s400: '#60a5fa',
    s500: '#3b82f6',
    s600: '#2563eb',
    s700: '#1d4ed8',
    s800: '#1e40af',
    s900: '#1e3a8a',
    s950: '#172554',
  },
  indigo: {
    s50: '#eef2ff',
    s100: '#e0e7ff',
    s200: '#c7d2fe',
    s300: '#a5b4fc',
    s400: '#818cf8',
    s500: '#6366f1',
    s600: '#4f46e5',
    s700: '#4338ca',
    s800: '#3730a3',
    s900: '#312e81',
    s950: '#1e1b4b',
  },
  amber: {
    s50: '#fffbeb',
    s100: '#fef3c7',
    s200: '#fde68a',
    s300: '#fcd34d',
    s400: '#fbbf24',
    s500: '#f59e0b',
    s600: '#d97706',
    s700: '#b45309',
    s800: '#92400e',
    s900: '#78350f',
    s950: '#451a03',
  },
  rose: {
    s50: '#fff1f2',
    s100: '#ffe4e6',
    s200: '#fecdd3',
    s300: '#fda4af',
    s400: '#fb7185',
    s500: '#f43f5e',
    s600: '#e11d48',
    s700: '#be123c',
    s800: '#9f1239',
    s900: '#881337',
    s950: '#4c0519',
  },
  purple: {
    s50: '#faf5ff',
    s100: '#f3e8ff',
    s200: '#e9d5ff',
    s300: '#d8b4fe',
    s400: '#c084fc',
    s500: '#a855f7',
    s600: '#9333ea',
    s700: '#7e22ce',
    s800: '#6b21a8',
    s900: '#581c87',
    s950: '#3b0764',
  },
  forest: {
    s50: '#f0fdf4',
    s100: '#dcfce7',
    s200: '#bbf7d0',
    s300: '#86efac',
    s400: '#4ade80',
    s500: '#22c55e',
    s600: '#16a34a',
    s700: '#15803d',
    s800: '#166534',
    s900: '#14532d',
    s950: '#052e16',
  },
  orange: {
    s50: '#fff7ed',
    s100: '#ffedd5',
    s200: '#fed7aa',
    s300: '#fdba74',
    s400: '#fb923c',
    s500: '#f97316',
    s600: '#ea580c',
    s700: '#c2410c',
    s800: '#9a3412',
    s900: '#7c2d12',
    s950: '#431407',
  },
};

/**
 * Converts a hex color (#rrggbb or #rgb) to RGB components
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Validates a hex color code
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

/**
 * Helper to blend a color with a target (0=black, 255=white)
 */
function blend(r: number, g: number, b: number, target: number, weight: number): string {
  const red = Math.min(255, Math.max(0, Math.round(r * (1 - weight) + target * weight)));
  const green = Math.min(255, Math.max(0, Math.round(g * (1 - weight) + target * weight)));
  const blue = Math.min(255, Math.max(0, Math.round(b * (1 - weight) + target * weight)));
  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
}

/**
 * Generates all Tailwind-compatible shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
 * for a given hex color or preset.
 */
export function generateThemeShades(hex: string): ThemeShades {
  const cleanHex = hex.trim().toLowerCase();
  const matchedPreset = PRESET_SCHOOL_THEMES.find(
    (p) => p.primaryColor.toLowerCase() === cleanHex || p.id === cleanHex
  );

  const rgb = hexToRgb(cleanHex) || hexToRgb(DEFAULT_THEME_COLOR)!;
  const { r, g, b } = rgb;

  let shadesPalette: {
    s50: string;
    s100: string;
    s200: string;
    s300: string;
    s400: string;
    s500: string;
    s600: string;
    s700: string;
    s800: string;
    s900: string;
    s950: string;
  };

  if (matchedPreset && PRESET_SHADES[matchedPreset.id]) {
    shadesPalette = PRESET_SHADES[matchedPreset.id];
  } else {
    // Dynamically compute shades for custom colors
    shadesPalette = {
      s50: blend(r, g, b, 255, 0.94),
      s100: blend(r, g, b, 255, 0.86),
      s200: blend(r, g, b, 255, 0.72),
      s300: blend(r, g, b, 255, 0.54),
      s400: blend(r, g, b, 255, 0.35),
      s500: blend(r, g, b, 255, 0.15),
      s600: cleanHex,
      s700: blend(r, g, b, 0, 0.15),
      s800: blend(r, g, b, 0, 0.32),
      s900: blend(r, g, b, 0, 0.50),
      s950: blend(r, g, b, 0, 0.70),
    };
  }

  return {
    primary: cleanHex,
    hover: shadesPalette.s700,
    light: shadesPalette.s50,
    border: shadesPalette.s200,
    rgbString: `${r}, ${g}, ${b}`,
    ...shadesPalette,
  };
}

/**
 * Retrieves the currently saved school theme color from localStorage or returns default
 */
export function getStoredThemeColor(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SCHOOL_THEME_STORAGE_KEY);
      if (stored && isValidHexColor(stored)) {
        return stored;
      }
    } catch {}
  }
  return DEFAULT_THEME_COLOR;
}

/**
 * Applies the given theme color site-wide:
 * 1. Updates <meta name="theme-color" content="..."> tag
 * 2. Updates documentElement CSS variables:
 *    --theme-50 .. --theme-950, --theme-color, --theme-color-hover, --theme-color-light, --theme-color-border, --theme-color-rgb
 * 3. Saves to localStorage
 * 4. Dispatches a custom event for real-time reactivity
 */
export function applySchoolTheme(hexColor: string): { success: boolean; color: string; shades: ThemeShades } {
  if (!isValidHexColor(hexColor)) {
    const defaultShades = generateThemeShades(DEFAULT_THEME_COLOR);
    return { success: false, color: DEFAULT_THEME_COLOR, shades: defaultShades };
  }

  const cleanHex = hexColor.trim();
  const shades = generateThemeShades(cleanHex);

  if (typeof document !== 'undefined') {
    // 1. Update <meta name="theme-color">
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', cleanHex);

    // 2. Update CSS Variables on documentElement
    const root = document.documentElement;
    root.style.setProperty('--theme-50', shades.s50);
    root.style.setProperty('--theme-100', shades.s100);
    root.style.setProperty('--theme-200', shades.s200);
    root.style.setProperty('--theme-300', shades.s300);
    root.style.setProperty('--theme-400', shades.s400);
    root.style.setProperty('--theme-500', shades.s500);
    root.style.setProperty('--theme-600', shades.s600);
    root.style.setProperty('--theme-700', shades.s700);
    root.style.setProperty('--theme-800', shades.s800);
    root.style.setProperty('--theme-900', shades.s900);
    root.style.setProperty('--theme-950', shades.s950);

    // Standard theme variables
    root.style.setProperty('--theme-color', cleanHex);
    root.style.setProperty('--theme-color-hover', shades.hover);
    root.style.setProperty('--theme-color-light', shades.light);
    root.style.setProperty('--theme-color-border', shades.border);
    root.style.setProperty('--theme-color-rgb', shades.rgbString);
    root.style.setProperty('--color-primary', cleanHex);
    root.style.setProperty('--primary-theme', cleanHex);
  }

  // 3. Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SCHOOL_THEME_STORAGE_KEY, cleanHex);
      window.dispatchEvent(
        new CustomEvent('school-theme-updated', {
          detail: {
            color: cleanHex,
            shades,
          },
        })
      );
    } catch {}
  }

  return { success: true, color: cleanHex, shades };
}

/**
 * Initializes the theme immediately upon application startup
 */
export function initSchoolTheme(): string {
  const color = getStoredThemeColor();
  applySchoolTheme(color);
  return color;
}
