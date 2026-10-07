import React, { useState } from 'react';
import { X, Palette, Check, Sparkles, Image, Eye, Layout, Monitor } from 'lucide-react';
import {
  ColorTheme,
  COLOR_THEMES,
  ThemeId,
  BackgroundPreset,
  BACKGROUND_PRESETS,
  BackgroundPresetId,
} from '../types/theme';

interface ThemeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  currentBgPresetId: BackgroundPresetId;
  onSelectTheme: (themeId: ThemeId) => void;
  onSelectBgPreset: (presetId: BackgroundPresetId) => void;
}

export const ThemeTemplateModal: React.FC<ThemeTemplateModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  currentBgPresetId,
  onSelectTheme,
  onSelectBgPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'background'>('theme');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Tùy Chỉnh Giao Diện & Hình Nền (Background)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết kế đẹp mắt, êm dịu, bảo vệ mắt và nâng cao độ dễ đọc cho Lớp 9A3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Màu Sắc vs Kiểu Nền) */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Mẫu Màu Sắc (6 Theme)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Kiểu Nền Background Dịu Mắt (5 Mẫu)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'theme' ? (
            /* TAB 1: THEMES */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COLOR_THEMES.map((theme) => {
                const isActive = currentThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 hover:shadow-sm'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Đang chọn</span>
                      </div>
                    )}

                    <div>
                      {/* Color Swatches Strip */}
                      <div className="flex items-center gap-1.5 mb-3">
                        {theme.swatches.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-lg shadow-2xs border border-white/50 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: color }}
                            title={`Mã màu ${color}`}
                          />
                        ))}
                        <div
                          className={`flex-1 h-6 rounded-lg bg-gradient-to-r ${theme.primaryGradient} shadow-2xs opacity-90`}
                        />
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        {theme.name}
                        {theme.isDark && (
                          <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-slate-700">
                            Dark
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-semibold text-indigo-700/80 mt-0.5">
                        {theme.subtitle}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-white font-bold text-[10px] bg-gradient-to-r ${theme.badgeGradient}`}>
                          Lớp 9A3
                        </span>
                        <span className={`px-2 py-0.5 rounded text-white font-semibold text-[10px] ${theme.buttonRecord.split(' ')[0]}`}>
                          + Ghi nhận
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Áp dụng &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TAB 2: BACKGROUND PRESETS */
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Mẹo chống mỏi mắt:</strong> Hình nền được thiết kế với độ sáng quang học chuẩn, giúp các ô dữ liệu và họ tên học sinh nổi bật rõ nét, đọc lâu không bị lóa hay căng thẳng mắt.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BACKGROUND_PRESETS.map((preset) => {
                  const isSelected = currentBgPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onSelectBgPreset(preset.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Preview Box */}
                        <div
                          className={`w-full h-14 rounded-lg mb-3 border border-slate-300/80 relative overflow-hidden flex items-center justify-center p-2 ${preset.className}`}
                        >
                          <div className="bg-white/95 rounded-md px-3 py-1 shadow-xs border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Bảng nề nếp Lớp 9A3</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {preset.name}
                          </h4>
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {preset.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-end">
                        <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                          {isSelected ? 'Đã kích hoạt' : 'Chọn hình nền này →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips Info Box */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold text-amber-950">Ghi nhớ tự động:</strong> Mọi lựa chọn giao diện và hình nền được lưu trữ trực tiếp trên thiết bị của bạn. Bạn có thể tự do phối màu theo sở thích bất kỳ lúc nào.
            </div>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Màu:{' '}
            <strong className="text-slate-800 font-bold">
              {COLOR_THEMES.find((t) => t.id === currentThemeId)?.name}
            </strong>{' '}
            · Nền:{' '}
            <strong className="text-slate-800 font-bold">
              {BACKGROUND_PRESETS.find((p) => p.id === currentBgPresetId)?.name}
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Đóng Hộp Thoại
          </button>
        </div>
      </div>
    </div>
  );
};
