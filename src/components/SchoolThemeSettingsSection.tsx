import React, { useState, useEffect } from 'react';
import {
  PRESET_SCHOOL_THEMES,
  DEFAULT_THEME_COLOR,
  applySchoolTheme,
  getStoredThemeColor,
  isValidHexColor,
  generateThemeShades,
  SchoolThemePreset,
} from '../utils/themeManager';
import {
  Palette,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Smartphone,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface SchoolThemeSettingsSectionProps {
  onThemeChanged?: (color: string) => void;
  compact?: boolean;
}

export const SchoolThemeSettingsSection: React.FC<SchoolThemeSettingsSectionProps> = ({
  onThemeChanged,
  compact = false,
}) => {
  const [currentColor, setCurrentColor] = useState<string>(() => getStoredThemeColor());
  const [customHex, setCustomHex] = useState<string>(() => getStoredThemeColor());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = (e: any) => {
      const newColor = e.detail?.color || getStoredThemeColor();
      setCurrentColor(newColor);
      setCustomHex(newColor);
    };
    window.addEventListener('school-theme-updated', handleSync);
    return () => window.removeEventListener('school-theme-updated', handleSync);
  }, []);

  const handleSelectPreset = (preset: SchoolThemePreset) => {
    const res = applySchoolTheme(preset.primaryColor);
    if (res.success) {
      setCurrentColor(preset.primaryColor);
      setCustomHex(preset.primaryColor);
      setToastMessage(`✓ থিম কালার "${preset.nameBn}" (${preset.primaryColor}) এ সফলভাবে আপডেট হয়েছে!`);
      if (onThemeChanged) onThemeChanged(preset.primaryColor);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleApplyCustomHex = (hex: string) => {
    let clean = hex.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!isValidHexColor(clean)) {
      setToastMessage('⚠️ অনুগ্রহ করে একটি সঠিক হেক্স কালার কোড লিখুন (যেমন: #065f46)');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    const res = applySchoolTheme(clean);
    if (res.success) {
      setCurrentColor(clean);
      setCustomHex(clean);
      setToastMessage(`✓ কাস্টম প্রাইমারি কালার ${clean} সফলভাবে অ্যাপে কার্যকর হয়েছে!`);
      if (onThemeChanged) onThemeChanged(clean);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleResetDefault = () => {
    applySchoolTheme(DEFAULT_THEME_COLOR);
    setCurrentColor(DEFAULT_THEME_COLOR);
    setCustomHex(DEFAULT_THEME_COLOR);
    setToastMessage('✓ আনন্দ পাঠশালার মূল ডিফল্ট পান্না সবুজ (#065f46) রঙে রিস্টোর করা হয়েছে।');
    if (onThemeChanged) onThemeChanged(DEFAULT_THEME_COLOR);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentShades = generateThemeShades(currentColor);
  const activePreset = PRESET_SCHOOL_THEMES.find(
    (p) => p.primaryColor.toLowerCase() === currentColor.toLowerCase()
  );

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-colors duration-300"
            style={{ backgroundColor: currentColor }}
          >
            <Palette className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border text-slate-800"
                style={{ backgroundColor: currentShades.light, borderColor: currentShades.border }}
              >
                Tailwind CSS `--theme-color` অটোমেশন
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                meta[name=&quot;theme-color&quot;] synced
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              স্কুল থিম ও অ্যাপ কালার সেটিংস (School Theme)
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              অ্যাডমিন প্যানেল থেকে স্কুলের প্রধান ব্র্যান্ড কালার নির্ধারণ করুন। এটি পরিবর্তন করলে ওয়েবসাইটের মেটা ট্যাগ, সিএসএস ভেরিয়েবল এবং বাটন ও অ্যাকসেন্ট তাৎক্ষণিক লাইভ আপডেট হবে।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefault}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          title="ডিফল্ট পান্না সবুজ রঙে রিস্টোর করুন"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ডিফল্ট থিম</span>
        </button>
      </div>

      {/* Active Theme Status Indicator */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        style={{ backgroundColor: currentShades.light, borderColor: currentShades.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full shadow-inner border-2 border-white shrink-0"
            style={{ backgroundColor: currentColor }}
          />
          <div>
            <span className="font-bold text-slate-900">
              বর্তমান সক্রিয় রঙ:{' '}
              <span className="font-mono" style={{ color: currentColor }}>
                {currentColor}
              </span>
              {activePreset && ` (${activePreset.nameBn})`}
            </span>
            <div className="text-[11px] text-slate-600 font-mono mt-0.5">
              CSS: --theme-color: {currentColor}; | RGB: ({currentShades.rgbString})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-1 shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>PWA & Browser Tab: {currentColor}</span>
          </span>
        </div>
      </div>

      {/* Preset Theme Palettes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>কেজি ও প্লে-স্কুল প্রি-সেট কালার প্যালেট</span>
          </h4>
          <span className="text-[11px] text-slate-400">ক্লিক করে তাৎক্ষণিক সক্রিয় করুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SCHOOL_THEMES.map((preset) => {
            const isSelected = currentColor.toLowerCase() === preset.primaryColor.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex items-start gap-3 group ${
                  isSelected
                    ? 'border-2 shadow-sm ring-2 ring-offset-1'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: preset.primaryColor,
                        backgroundColor: preset.lightBg,
                        boxShadow: `0 4px 12px ${preset.primaryColor}20`,
                      }
                    : {}
                }
              >
                {/* Color preview circle */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: preset.primaryColor }}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {preset.nameBn}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                      {preset.primaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9.5px] font-bold px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor: `${preset.primaryColor}15`,
                        color: preset.primaryColor,
                      }}
                    >
                      {preset.badgeBn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight line-clamp-1">
                    {preset.descriptionBn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Picker Section */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>কাস্টম হেক্স কালার পিকার (Custom Hex & Color Wheel)</span>
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          {/* HTML5 color picker widget */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <input
              type="color"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                handleApplyCustomHex(e.target.value);
              }}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
              title="কালার পিকার খুলুন"
            />
            <span className="text-xs font-semibold text-slate-600">কালার পিকার হুইল</span>
          </div>

          {/* Hex Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              placeholder="#065f46"
              className="w-36 px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs uppercase"
            />
            <button
              type="button"
              onClick={() => handleApplyCustomHex(customHex)}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition cursor-pointer"
              style={{ backgroundColor: currentColor }}
            >
              প্রয়োগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Live UI Component Preview */}
      <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>লাইভ প্রিভিউ: নতুন থিম কালারে বাটন ও অ্যাকসেন্ট কেমন দেখাবে</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-600 font-bold">● লাইভ কার্যকর</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Solid Primary Button */}
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            style={{ backgroundColor: currentColor }}
          >
            <span>প্রধান অ্যাকশন বাটন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Soft Tint Button */}
          <button
            type="button"
            className="px-4 py-2 rounded-xl font-bold text-xs border transition-all"
            style={{
              backgroundColor: currentShades.light,
              color: currentColor,
              borderColor: currentShades.border,
            }}
          >
            <span>সেকেন্ডারি সফট ব্যাজ</span>
          </button>

          {/* Outline Button */}
          <button
            type="button"
            className="px-4 py-2 rounded-xl font-bold text-xs border-2 transition-all bg-white"
            style={{
              color: currentColor,
              borderColor: currentColor,
            }}
          >
            <span>আউটলাইন স্টাইল</span>
          </button>

          {/* Live Meta Tag Info Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono">
            <span>&lt;meta name=&quot;theme-color&quot; content=&quot;{currentColor}&quot;&gt;</span>
          </div>
        </div>

        {/* Full 50..950 Tailwind Shades Spectrum preview */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>জেনারেটেড টেইলউইন্ড শেডস প্যালেট (Tailwind CSS 50 — 950):</span>
            <span className="font-mono text-[10px]">dynamic CSS vars</span>
          </div>
          <div className="grid grid-cols-11 gap-1 text-center font-mono text-[9px]">
            {[
              { shade: '50', color: currentShades.s50, textDark: true },
              { shade: '100', color: currentShades.s100, textDark: true },
              { shade: '200', color: currentShades.s200, textDark: true },
              { shade: '300', color: currentShades.s300, textDark: true },
              { shade: '400', color: currentShades.s400, textDark: false },
              { shade: '500', color: currentShades.s500, textDark: false },
              { shade: '600', color: currentShades.s600, textDark: false },
              { shade: '700', color: currentShades.s700, textDark: false },
              { shade: '800', color: currentShades.s800, textDark: false },
              { shade: '900', color: currentShades.s900, textDark: false },
              { shade: '950', color: currentShades.s950, textDark: false },
            ].map((s) => (
              <div
                key={s.shade}
                className="rounded-lg p-1.5 shadow-2xs border border-black/10 flex flex-col items-center justify-between min-h-[46px]"
                style={{ backgroundColor: s.color, color: s.textDark ? '#0f172a' : '#ffffff' }}
                title={`${s.shade}: ${s.color}`}
              >
                <span className="font-bold">{s.shade}</span>
                <span className="text-[7.5px] opacity-80 leading-none truncate w-full">{s.color}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
