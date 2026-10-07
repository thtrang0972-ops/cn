import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  UserCheck,
  Flame,
  ShieldAlert,
  FileSpreadsheet,
  Gift,
} from 'lucide-react';
import { GroupSummary, Student, StudentWeeklyRecord } from '../types/discipline';
import { getClassificationColor } from '../utils/scoring';

interface GroupCompetitionViewProps {
  groups: GroupSummary[];
  currentWeekName: string;
  onSelectStudent: (student: Student) => void;
  onQuickRecordStudent: (student: Student) => void;
  onOpenAdjustScore?: (student?: Student) => void;
  onOpenImportRoster?: () => void;
  teacherGroupNotes?: Record<number, string>;
  onOpenTeacherNotesModal?: () => void;
}

export const GroupCompetitionView: React.FC<GroupCompetitionViewProps> = ({
  groups,
  currentWeekName,
  onSelectStudent,
  onQuickRecordStudent,
  onOpenAdjustScore,
  onOpenImportRoster,
  teacherGroupNotes,
  onOpenTeacherNotesModal,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(groups[0]?.groupId || 1);

  // Nhóm có rank = 1, 2, 3
  const top1 = groups.find((g) => g.rank === 1);
  const top2 = groups.find((g) => g.rank === 2);
  const top3 = groups.find((g) => g.rank === 3);

  // Nhóm được chọn để xem chi tiết
  const activeGroup = groups.find((g) => g.groupId === selectedGroupId) || groups[0];
  const activeGroupNote = teacherGroupNotes?.[activeGroup?.groupId]?.trim();

  const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);

  // Tính các danh hiệu thi đua đặc biệt
  const bestDisciplineGroup = [...groups].sort((a, b) => a.totalPenalty - b.totalPenalty)[0];
  const mostActiveGroup = [...groups].sort((a, b) => b.totalBonus - a.totalBonus)[0];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          title: 'HẠNG NHẤT · NHẬN PHẦN THƯỞNG',
          bg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/25',
          border: 'border-amber-400',
          textColor: 'text-amber-700',
          icon: Trophy,
        };
      case 2:
        return {
          title: 'HẠNG NHÌ · CỜ VÀNG',
          bg: 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-sm',
          border: 'border-slate-300',
          textColor: 'text-slate-700',
          icon: Medal,
        };
      case 3:
        return {
          title: 'HẠNG BA · CỜ ĐỒNG',
          bg: 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-sm',
          border: 'border-amber-600',
          textColor: 'text-amber-900',
          icon: Award,
        };
      default:
        return {
          title: `HẠNG ${rank}`,
          bg: 'bg-slate-100 text-slate-700 border border-slate-200',
          border: 'border-slate-200',
          textColor: 'text-slate-600',
          icon: Award,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Thông báo danh sách trống */}
      {totalMembers === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Chưa có danh sách học sinh trong 6 nhóm thi đua
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Danh sách học sinh mẫu đã được xóa sạch. Hãy tải file Excel danh sách lớp của bạn lên để hệ thống tự động phân chia 6 nhóm và tính điểm thi đua tuần!
          </p>
          {onOpenImportRoster && (
            <button
              type="button"
              onClick={onOpenImportRoster}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Nạp danh sách học sinh từ file Excel</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner: Kết quả thi đua tuần - Nền trắng sáng, viền tinh tế */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Bảng Xếp Hạng Thi Đua 6 Nhóm</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Kết Quả Thi Đua Nề Nếp · {currentWeekName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xếp hạng dựa trên Điểm trung bình nề nếp (Điểm chuẩn 100 - Điểm vi phạm + Điểm cộng)
            </p>
          </div>

          {/* Quick stats highlights */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800">Hăng hái nhất</p>
                <p className="text-xs font-black text-emerald-950">{mostActiveGroup?.groupName} (+{mostActiveGroup?.totalBonus}đ)</p>
              </div>
            </div>

            <div className="px-3 py-2 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-800">Nề nếp tốt nhất</p>
                <p className="text-xs font-black text-blue-950">{bestDisciplineGroup?.groupName} (-{bestDisciplineGroup?.totalPenalty}đ)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Podium Top 3 - Thẻ nền trắng sáng, thanh thoát */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Top 2 */}
          {top2 && (
            <div
              onClick={() => setSelectedGroupId(top2.groupId)}
              className={`cursor-pointer rounded-2xl p-4.5 border transition-all ${
                selectedGroupId === top2.groupId
                  ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5 text-slate-500" />
                  Hạng 2 · Cờ Vàng
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  2
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{top2.groupName}</h3>
              <p className="text-xs text-slate-500 mb-3">Nhóm trưởng: {top2.leaderName}</p>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Điểm TB thi đua</span>
                <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                  {top2.averageScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </span>
              </div>
            </div>
          )}

          {/* Top 1 - Champion */}
          {top1 && (
            <div
              onClick={() => setSelectedGroupId(top1.groupId)}
              className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all relative overflow-hidden ${
                selectedGroupId === top1.groupId
                  ? 'border-amber-500 ring-3 ring-amber-400/30 bg-gradient-to-b from-amber-50 via-white to-amber-50/40 shadow-lg'
                  : 'border-amber-400 hover:border-amber-500 bg-gradient-to-b from-amber-50/60 to-white shadow-sm'
              }`}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-xs tracking-wider">
                <Trophy className="w-3 h-3 text-white" />
                <span>QUÁN QUÂN TUẦN</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  Hạng 1 · Nhận Phần Thưởng
                </span>
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  1
                </span>
              </div>

              <h3 className="text-xl font-black text-amber-950">{top1.groupName}</h3>
              <p className="text-xs text-amber-800/80 mb-3">Nhóm trưởng: {top1.leaderName}</p>

              <div className="flex items-baseline justify-between pt-2 border-t border-amber-300">
                <span className="text-xs font-bold text-amber-800">Điểm TB thi đua</span>
                <span className="text-2xl font-black font-mono text-amber-900 tabular-nums">
                  {top1.averageScore} <span className="text-xs font-normal text-amber-700">/ 100</span>
                </span>
              </div>
            </div>
          )}

          {/* Top 3 */}
          {top3 && (
            <div
              onClick={() => setSelectedGroupId(top3.groupId)}
              className={`cursor-pointer rounded-2xl p-4.5 border transition-all ${
                selectedGroupId === top3.groupId
                  ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wide flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-orange-600" />
                  Hạng 3 · Cờ Đồng
                </span>
                <span className="w-7 h-7 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  3
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{top3.groupName}</h3>
              <p className="text-xs text-slate-500 mb-3">Nhóm trưởng: {top3.leaderName}</p>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Điểm TB thi đua</span>
                <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                  {top3.averageScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Bảng tổng hợp 6 nhóm (Left) + Chi tiết thành viên nhóm đang chọn (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột 1: Danh sách xếp hạng cả 6 nhóm */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Bảng Tổng Sắp 6 Nhóm</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                {groups.length} nhóm
              </span>
            </h3>
            <span className="text-xs text-blue-600 font-medium">Bấm để xem học sinh</span>
          </div>

          <div className="space-y-2.5">
            {groups.map((group) => {
              const badge = getRankBadge(group.rank);
              const isSelected = selectedGroupId === group.groupId;
              const groupNote = teacherGroupNotes?.[group.groupId]?.trim();
              return (
                <div
                  key={group.groupId}
                  onClick={() => setSelectedGroupId(group.groupId)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${badge.bg}`}
                      >
                        {group.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{group.groupName}</h4>
                          {group.rank <= 3 && (
                            <span className={`text-[10px] font-bold ${badge.textColor}`}>
                              {group.rank === 1 ? '🥇 Nhất' : group.rank === 2 ? '🥈 Nhì' : '🥉 Ba'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {group.memberCount} học sinh · Nhóm trưởng: <strong className="text-slate-700">{group.leaderName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black font-mono text-slate-900 tabular-nums">
                        {group.averageScore}
                        <span className="text-[10px] font-normal text-slate-500"> đ</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] justify-end">
                        <span className="text-rose-600 font-bold font-mono tabular-nums">
                          -{group.totalPenalty}đ
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-emerald-600 font-bold font-mono tabular-nums">
                          +{group.totalBonus}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ghi chú thi đua */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5 shadow-2xs">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              Quy chế thi đua tuần:
            </p>
            <div className="text-amber-900 leading-relaxed text-[11px] space-y-1">
              <p className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold shrink-0">•</span>
                <span>Nhóm xếp hạng 1 nhận được phần thưởng.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold shrink-0">•</span>
                <span>Nhóm có học sinh vi phạm nghiêm trọng sẽ bị xử lý theo nội quy của lớp.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cột 2: Chi tiết học sinh của Nhóm đang chọn */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-slate-900">
            {/* Header chi tiết nhóm */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold">
                    Hạng {activeGroup.rank}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{activeGroup.groupName}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Nhóm trưởng: <strong className="text-slate-800">{activeGroup.leaderName}</strong> · Sĩ số: {activeGroup.memberCount} học sinh
                </p>
              </div>

              {/* Tỉ lệ xếp loại trong nhóm */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                  {activeGroup.goodCount} Tốt
                </span>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 font-bold">
                  {activeGroup.fairCount} Khá
                </span>
                {activeGroup.passCount > 0 && (
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                    {activeGroup.passCount} Đạt
                  </span>
                )}
                {activeGroup.failCount > 0 && (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 font-bold">
                    {activeGroup.failCount} Chưa đạt
                  </span>
                )}
              </div>
            </div>

            {/* Lời dặn / Ghi chú phản hồi của GVCN cho nhóm này */}
            {activeGroupNote ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">👩‍🏫</span>
                  <div>
                    <span className="text-xs font-black text-amber-900 block uppercase tracking-wider">
                      Ghi chú phản hồi của GVCN ({activeGroup.groupName}):
                    </span>
                    <p className="text-xs leading-relaxed text-amber-900 italic mt-0.5">
                      "{activeGroupNote}"
                    </p>
                  </div>
                </div>
                {onOpenTeacherNotesModal && (
                  <button
                    type="button"
                    onClick={onOpenTeacherNotesModal}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors shrink-0 cursor-pointer"
                  >
                    Sửa lời dặn
                  </button>
                )}
              </div>
            ) : onOpenTeacherNotesModal ? (
              <div
                onClick={onOpenTeacherNotesModal}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-500 hover:text-emerald-700 transition-colors text-xs flex items-center justify-between cursor-pointer group"
                title="Bấm để viết nhận xét của GVCN cho nhóm này"
              >
                <span className="flex items-center gap-2">
                  <span>✍️</span>
                  <span>Chưa có ghi chú của GVCN cho nhóm này vào cuối tuần.</span>
                </span>
                <span className="font-bold text-emerald-600 text-[11px] group-hover:underline">
                  + Thêm ghi chú GVCN
                </span>
              </div>
            ) : null}

            {/* Bảng danh sách thành viên trong nhóm */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
                    <th className="py-2.5 px-3 w-10">STT</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Vai trò</th>
                    <th className="py-2.5 px-2 text-center text-rose-600">Trừ</th>
                    <th className="py-2.5 px-2 text-center text-emerald-600">Cộng</th>
                    <th className="py-2.5 px-3 text-right">Tổng điểm</th>
                    <th className="py-2.5 px-3 text-center">Xếp loại</th>
                    <th className="py-2.5 px-2 text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeGroup.students.map((calc, idx) => {
                    const clsColor = getClassificationColor(calc.classification);
                    return (
                      <tr key={calc.student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => onSelectStudent(calc.student)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors cursor-pointer"
                          >
                            {calc.student.name}
                          </button>
                          {calc.record.note && (
                            <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                              {calc.record.note}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {calc.student.role || 'Thành viên'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-600 tabular-nums">
                          {calc.totalPenalty > 0 ? `-${calc.totalPenalty}` : '0'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-600 tabular-nums">
                          {calc.totalBonus > 0 ? `+${calc.totalBonus}` : '0'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 tabular-nums text-sm">
                          {calc.finalScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${clsColor.badge}`}
                          >
                            {calc.classification}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onQuickRecordStudent(calc.student)}
                              className="px-2 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                              title="Ghi nhận nề nếp hoặc vi phạm mới"
                            >
                              Ghi nhận
                            </button>
                            {onOpenAdjustScore && (
                              <button
                                onClick={() => onOpenAdjustScore(calc.student)}
                                className="px-1.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-400 text-amber-900 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                                title="Điều chỉnh hoặc sửa lại điểm/lỗi ghi nhầm"
                              >
                                Sửa điểm
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tóm tắt chỉ số nhóm */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Điểm trung bình</span>
                <span className="text-base font-black font-mono text-slate-900 tabular-nums">
                  {activeGroup.averageScore}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[11px] text-rose-700 block font-medium">Tổng điểm trừ</span>
                <span className="text-base font-black font-mono text-rose-700 tabular-nums">
                  -{activeGroup.totalPenalty}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block font-medium">Tổng điểm cộng</span>
                <span className="text-base font-black font-mono text-emerald-700 tabular-nums">
                  +{activeGroup.totalBonus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
