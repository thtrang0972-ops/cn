import React from 'react';
import {
  Users,
  Crown,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Award,
  ShieldAlert,
} from 'lucide-react';
import { Student, StudentWeeklyRecord, ClassMetadata } from '../types/discipline';
import { calculateStudentScore } from '../utils/scoring';

interface OverviewStatsBarProps {
  students: Student[];
  records: Record<string, StudentWeeklyRecord>;
  currentWeekName: string;
  metadata: ClassMetadata;
  onOpenQuickEntry?: () => void;
}

export const OverviewStatsBar: React.FC<OverviewStatsBarProps> = ({
  students,
  records,
  currentWeekName,
  metadata,
  onOpenQuickEntry,
}) => {
  // Tính điểm & số liệu nề nếp của toàn bộ học sinh
  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  const calculated = students.map((s) => calculateStudentScore(s, records[s.id]));

  // Điểm trung bình nề nếp cả lớp
  const avgScore =
    totalStudents > 0
      ? (calculated.reduce((sum, c) => sum + c.finalScore, 0) / totalStudents).toFixed(1)
      : '100.0';

  // Lượt khen thưởng (Điểm tốt + Phát biểu)
  const totalBonusCount = calculated.reduce(
    (sum, c) => sum + (c.record.diemTot || 0) + (c.record.phatBieu || 0),
    0
  );
  const totalBonusPoints = calculated.reduce((sum, c) => sum + c.totalBonus, 0);

  // Lượt vi phạm (Tổng tất cả lỗi trừ điểm)
  const totalPenaltyCount = calculated.reduce((sum, c) => {
    const r = c.record;
    const errors =
      (r.diTre || 0) +
      (r.nghiCP || 0) +
      (r.nghiKP || 0) +
      (r.boTiet || 0) +
      (r.ktbKlbKsb || 0) +
      (r.khongDongPhuc2 || 0) +
      (r.matTratTu || 0) +
      (r.khongThamGiaVS || 0) +
      (r.noiTuc || 0) +
      (r.xaRac || 0) +
      (r.trucVSBan || 0) +
      (r.huHongTS || 0) +
      (r.voLeGV || 0) +
      (r.dungDienThoai || 0);
    return sum + errors;
  }, 0);
  const totalPenaltyPoints = calculated.reduce((sum, c) => sum + c.totalPenalty, 0);

  // Xếp loại danh hiệu chung lớp
  const numAvg = parseFloat(avgScore);
  let classHonor = 'Xuất sắc';
  if (numAvg < 80) classHonor = 'Cần cố gắng';
  else if (numAvg < 90) classHonor = 'Khá';
  else if (numAvg < 95) classHonor = 'Tiên tiến';

  return (
    <div className="w-full mb-5">
      {/* Tiêu đề khu vực thống kê */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Thống Kê Tổng Quan Nề Nếp
          </h2>
        </div>
        <span className="text-[11px] text-slate-600 font-semibold">
          Lớp {metadata.className || '9A3'} · Sĩ số {totalStudents} học sinh · 6 Nhóm
        </span>
      </div>

      {/* Grid 4 Thẻ Thống Kê Dạng Khối Nổi Bật (Big Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Thẻ 1: Sĩ số lớp */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-sky-100 hover:border-sky-300 shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              Sĩ Số Lớp
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              6 Nhóm
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
              {totalStudents}
            </span>
            <span className="text-xs font-bold text-sky-700">Học sinh</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span>Nam: <strong className="text-sky-700 font-semibold">{maleCount}</strong></span>
            <span>·</span>
            <span>Nữ: <strong className="text-pink-600 font-semibold">{femaleCount}</strong></span>
            <span>·</span>
            <span className="text-emerald-600 font-medium">100% Có mặt</span>
          </div>
        </div>

        {/* Thẻ 2: Điểm trung bình nề nếp */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-amber-200 hover:border-amber-300 shadow-sm transition-all group ring-1 ring-amber-400/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
              Điểm TB Nề Nếp
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1">
              👑 {classHonor}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight tabular-nums">
              {avgScore}
            </span>
            <span className="text-xs font-bold text-amber-700">/ 100đ</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span className="text-slate-600">Điểm chuẩn: 100đ</span>
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              Thi đua xuất sắc
            </span>
          </div>
        </div>

        {/* Thẻ 3: Lượt khen thưởng */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-emerald-100 hover:border-emerald-300 shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              Lượt Khen Thưởng
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{totalBonusPoints}đ
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight tabular-nums">
              +{totalBonusCount}
            </span>
            <span className="text-xs font-bold text-emerald-700">Lượt</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span className="text-slate-600">Phát biểu & Điểm 9, 10</span>
            <span className="text-emerald-700 font-bold">Tích cực</span>
          </div>
        </div>

        {/* Thẻ 4: Lượt vi phạm */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-rose-100 hover:border-rose-300 shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:shake transition-transform" />
              Lượt Vi Phạm
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              -{totalPenaltyPoints}đ
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tracking-tight tabular-nums">
              {totalPenaltyCount > 0 ? `-${totalPenaltyCount}` : '0'}
            </span>
            <span className="text-xs font-bold text-rose-700">Lượt</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span className="text-slate-600">
              {totalPenaltyCount === 0 ? 'Không có vi phạm' : 'Cần rèn luyện thêm'}
            </span>
            <span className="text-rose-700 font-bold">
              {totalPenaltyCount === 0 ? '✓ Tốt' : 'Nhắc nhở'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
