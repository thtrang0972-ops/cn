import React from 'react';
import {
  Calendar,
  FileSpreadsheet,
  PlusCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { WeekInfo, ClassMetadata, UserRoleType } from '../types/discipline';
import { formatWeekDateRangeVN } from '../utils/date';

interface QuickActionBarProps {
  weeks: WeekInfo[];
  currentWeekId: number;
  metadata: ClassMetadata;
  currentRole?: UserRoleType;
  onSelectWeek: (weekId: number) => void;
  onOpenQuickEntry: () => void;
  onOpenAdjustScore?: () => void;
  onOpenImportRoster: () => void;
  onOpenTeacherNotesModal?: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  weeks,
  currentWeekId,
  metadata,
  currentRole = 'gvcn',
  onSelectWeek,
  onOpenQuickEntry,
  onOpenAdjustScore,
  onOpenImportRoster,
  onOpenTeacherNotesModal,
}) => {
  const currentWeekIndex = weeks.findIndex((w) => w.id === currentWeekId);
  const currentWeek = weeks[currentWeekIndex >= 0 ? currentWeekIndex : 0] || weeks[0];

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      onSelectWeek(weeks[currentWeekIndex - 1].id);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      onSelectWeek(weeks[currentWeekIndex + 1].id);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm mb-5 text-slate-800 relative z-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Cột 1: Chọn Tuần gọn gàng, bề ngang cố định, KHÔNG BAO GIỜ CHE KHUẤT CÁC NÚT KHÁC */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {/* Nút lùi 1 tuần */}
            <button
              type="button"
              onClick={handlePrevWeek}
              disabled={currentWeekIndex <= 0}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              title="Chuyển về tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dropdown chọn Tuần gọn gàng, độ rộng xác định w-28 đến w-32 */}
            <div className="relative">
              <select
                value={currentWeekId}
                onChange={(e) => onSelectWeek(Number(e.target.value))}
                aria-label="Chọn tuần học"
                className="appearance-none bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs font-black py-1.5 pl-7 pr-6 w-28 sm:w-32 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                {weeks.map((w) => {
                  const baseName = w.name.replace(/\s*\([^)]*\)\s*/g, '').trim();
                  const isCurrent = w.id === 4;
                  return (
                    <option key={w.id} value={w.id} className="bg-white text-slate-800 font-bold">
                      {baseName} {isCurrent ? '★' : ''}
                    </option>
                  );
                })}
              </select>
              <Calendar className="w-3.5 h-3.5 text-blue-600 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Nút tiến 1 tuần */}
            <button
              type="button"
              onClick={handleNextWeek}
              disabled={currentWeekIndex >= weeks.length - 1}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              title="Chuyển sang tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Nhãn nhanh ngày của tuần riêng biệt, không đè nút */}
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl hidden sm:inline-block shrink-0">
            {formatWeekDateRangeVN(currentWeek.startDate, currentWeek.endDate)}
          </span>
        </div>

        {/* Cột 2: Các nút hành động chính - Nằm độc lập, thoáng đãng, tuyệt đối không bị che khuất */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0 relative z-30">
          {/* Nút Ghi Điểm Nhanh (Chấm Điểm Nhanh) - Màu xanh lá cây to rõ nhất */}
          <button
            type="button"
            onClick={onOpenQuickEntry}
            title="Mở cửa sổ chấm điểm nhanh nề nếp hoặc ghi nhận vi phạm cho học sinh"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg shadow-emerald-950/25 border border-emerald-400/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ring-2 ring-emerald-400/40"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-white animate-pulse" />
            <span>Ghi Điểm Nhanh</span>
          </button>

          {/* Nút Điều Chỉnh Điểm (Khắc phục khi cho điểm cộng/trừ bị nhầm) */}
          {onOpenAdjustScore && (
            <button
              type="button"
              onClick={onOpenAdjustScore}
              title="Điều chỉnh, tăng giảm hoặc xóa điểm cộng/trừ khi bị cho nhầm"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md hover:shadow-lg shadow-amber-950/20 border border-amber-600/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ring-1 ring-amber-400/50"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0 text-slate-950" />
              <span>Điều Chỉnh Điểm</span>
            </button>
          )}

          {/* Nút Nhập/Xuất Excel */}
          <button
            type="button"
            onClick={onOpenImportRoster}
            title="Nhập / Xuất danh sách học sinh & 6 nhóm từ file Excel"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-slate-600" />
            <span className="hidden sm:inline">Nhập/Xuất Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>

          {/* Nút Ghi Chú 6 Nhóm */}
          {onOpenTeacherNotesModal && (
            <button
              type="button"
              onClick={onOpenTeacherNotesModal}
              title="Ghi chú nhận xét ngắn gọn cho 6 nhóm thi đua cuối mỗi tuần"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shadow-2xs"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
              <span className="hidden sm:inline">Ghi Chú 6 Nhóm</span>
              <span className="sm:hidden">Ghi Chú</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
