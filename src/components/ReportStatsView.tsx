import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  Sparkles,
  PieChart,
  Users,
  ShieldAlert,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import {
  GroupSummary,
  Student,
  StudentWeeklyRecord,
  WeekInfo,
  ClassMetadata,
  GroupWeeklyRemark,
  OfficerWeeklyRemarks,
} from '../types/discipline';
import { CRITERIA_LIST, calculateStudentScore, getClassificationColor } from '../utils/scoring';
import { formatDateVN, formatWeekDateRangeVN } from '../utils/date';
import {
  generateAutoTeacherRemarkForGroup,
  generateAutoTeacherRemarksForAllGroups,
} from '../utils/autoRemarks';

interface ReportStatsViewProps {
  groups: GroupSummary[];
  students: Student[];
  records: Record<string, StudentWeeklyRecord>;
  currentWeek: WeekInfo;
  metadata: ClassMetadata;
  onOpenPrint: () => void;
  teacherGroupNotes?: Record<number, string>;
  groupRemarks?: Record<number, GroupWeeklyRemark>;
  officerRemarks?: OfficerWeeklyRemarks;
  onOpenTeacherNotesModal?: () => void;
  onSaveTeacherGroupNotes?: (notes: Record<number, string>) => void;
}

export const ReportStatsView: React.FC<ReportStatsViewProps> = ({
  groups,
  students,
  records,
  currentWeek,
  metadata,
  onOpenPrint,
  teacherGroupNotes,
  groupRemarks = {},
  officerRemarks,
  onOpenTeacherNotesModal,
  onSaveTeacherGroupNotes,
}) => {
  const [copied, setCopied] = useState(false);
  const [autoGenSuccess, setAutoGenSuccess] = useState<string | null>(null);

  // Xử lý tự động tạo nhận xét cả 6 nhóm theo báo cáo
  const handleAutoGenerateAllNotes = () => {
    if (!onSaveTeacherGroupNotes) return;
    const generated = generateAutoTeacherRemarksForAllGroups({
      groups,
      groupRemarks,
      officerRemarks,
      students,
      records,
    });
    onSaveTeacherGroupNotes(generated);
    setAutoGenSuccess('Đã tự động tạo nhận xét theo báo cáo tuần cho cả 6 nhóm thành công!');
    setTimeout(() => setAutoGenSuccess(null), 3000);
  };

  // Xử lý tự động tạo nhận xét cho 1 nhóm
  const handleAutoGenerateSingleGroup = (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSaveTeacherGroupNotes) return;
    const group = groups.find((g) => g.groupId === groupId) || {
      groupId,
      groupName: `Nhóm ${groupId}`,
      leaderName: groupRemarks[groupId]?.leaderName || `Nhóm trưởng ${groupId}`,
      studentCount: 7,
      averageScore: 100,
      totalBonus: 0,
      totalPenalty: 0,
      rank: groupId,
      topStudents: [],
      studentsNeedingImprovement: [],
    };
    const note = generateAutoTeacherRemarkForGroup({
      group,
      groupRemark: groupRemarks[groupId],
      officerRemarks,
      students,
      records,
    });
    const updated = {
      ...(teacherGroupNotes || {}),
      [groupId]: note,
    };
    onSaveTeacherGroupNotes(updated);
    setAutoGenSuccess(`Đã tạo nhận xét tự động cho Nhóm ${groupId}!`);
    setTimeout(() => setAutoGenSuccess(null), 2500);
  };

  // Tính điểm cho tất cả học sinh
  const allCalculated = students.map((s) => calculateStudentScore(s, records[s.id]));

  // Thống kê phân loại
  const totalStudents = students.length;
  const goodList = allCalculated.filter((c) => c.classification === 'Tốt');
  const fairList = allCalculated.filter((c) => c.classification === 'Khá');
  const passList = allCalculated.filter((c) => c.classification === 'Đạt');
  const failList = allCalculated.filter((c) => c.classification === 'Chưa đạt');

  const goodPercent = totalStudents ? Math.round((goodList.length / totalStudents) * 100) : 0;
  const fairPercent = totalStudents ? Math.round((fairList.length / totalStudents) * 100) : 0;
  const passPercent = totalStudents ? Math.round((passList.length / totalStudents) * 100) : 0;
  const failPercent = totalStudents ? Math.round((failList.length / totalStudents) * 100) : 0;

  // Thống kê Top vi phạm nhiều nhất
  const violationCounts: { name: string; count: number; points: number }[] = [];
  for (const crit of CRITERIA_LIST) {
    if (!crit.isBonus) {
      let count = 0;
      for (const rec of Object.values(records)) {
        count += Number(rec[crit.key] || 0);
      }
      if (count > 0) {
        violationCounts.push({
          name: crit.name,
          count,
          points: count * Math.abs(crit.points),
        });
      }
    }
  }
  violationCounts.sort((a, b) => b.count - a.count);

  // Top học sinh tiêu biểu (Điểm cao nhất, điểm tốt nhiều nhất)
  const topExemplary = [...allCalculated]
    .filter((c) => c.totalBonus > 0 || c.finalScore >= 95)
    .sort((a, b) => b.finalScore - a.finalScore || b.totalBonus - a.totalBonus)
    .slice(0, 5);

  // Danh sách cần lưu ý / rèn luyện (Điểm dưới 80 hoặc bị trừ nhiều điểm)
  const needAttention = [...allCalculated]
    .filter((c) => c.finalScore < 80 || c.totalPenalty >= 4)
    .sort((a, b) => a.finalScore - b.finalScore || b.totalPenalty - a.totalPenalty);

  // Mẫu văn bản báo cáo GVCN
  const reportText = `📋 BÁO CÁO TỔNG KẾT NỀ NẾP ${currentWeek.name.replace(/\s*\([^)]*\)\s*/g, '').toUpperCase()} - LỚP ${metadata.className}
Năm học: ${metadata.academicYear} · GVCN: ${metadata.homeroomTeacher}
Thời gian: Từ ngày ${formatDateVN(currentWeek.startDate)} đến ngày ${formatDateVN(currentWeek.endDate)}

1. SĨ SỐ VÀ KẾT QUẢ XẾP LOẠI TOÀN LỚP (Sĩ số: ${totalStudents} HS):
• Loại Tốt (90-100đ): ${goodList.length}/${totalStudents} HS (${goodPercent}%)
• Loại Khá (80-89đ): ${fairList.length}/${totalStudents} HS (${fairPercent}%)
• Loại Đạt (70-79đ): ${passList.length}/${totalStudents} HS (${passPercent}%)
• Loại Chưa đạt (<70đ): ${failList.length}/${totalStudents} HS (${failPercent}%)

2. KẾT QUẢ THI ĐUA 6 NHÓM:
${groups
  .map(
    (g) =>
      `• Hạng ${g.rank}: ${g.groupName} - Điểm TB: ${g.averageScore}đ (${g.goodCount} Tốt, -${g.totalPenalty}đ vi phạm, +${g.totalBonus}đ cộng)${
        g.rank === 1 ? ' [Nhận phần thưởng tuần]' : ''
      }`
  )
  .join('\n')}

3. VI PHẠM CẦN LƯU Ý TRONG TUẦN:
${
  violationCounts.length > 0
    ? violationCounts
        .slice(0, 5)
        .map((v) => `• ${v.name}: ${v.count} lượt (Trừ tổng ${v.points}đ)`)
        .join('\n')
    : '• Không có vi phạm đáng kể trong tuần.'
}

4. TUYÊN DƯƠNG HỌC SINH TIÊU BIỂU:
${topExemplary
  .map((h) => `• ${h.student.name} (Nhóm ${h.student.groupId}): ${h.finalScore}đ (+${h.totalBonus}đ cộng)`)
  .join('\n')}

5. DANH SÁCH CẦN PHỐI HỢP RÈN LUYỆN:
${
  needAttention.length > 0
    ? needAttention
        .map((h) => `• ${h.student.name} (Nhóm ${h.student.groupId}): ${h.finalScore}đ (Trừ -${h.totalPenalty}đ - ${h.record.note || 'Cần chú ý nề nếp'})`)
        .join('\n')
    : '• Không có học sinh thuộc diện cảnh báo nề nếp.'
}${
  teacherGroupNotes && Object.values(teacherGroupNotes).some((n) => n?.trim())
    ? `\n\n6. GHI CHÚ PHẢN HỒI CỦA GVCN CHO TỪNG NHÓM THI ĐUA:\n` +
      groups
        .map(
          (g) =>
            `• ${g.groupName} (Hạng ${g.rank} · Điểm TB ${g.averageScore}đ): ${
              teacherGroupNotes[g.groupId] || 'Đạt yêu cầu nề nếp tuần.'
            }`
        )
        .join('\n')
    : ''
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Báo Cáo Tổng Hợp</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Thống Kê Nề Nếp & Thi Đua · {currentWeek.name.replace(/\s*\([^)]*\)\s*/g, '')} ({formatWeekDateRangeVN(currentWeek.startDate, currentWeek.endDate)})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích tỷ lệ xếp loại, top vi phạm nề nếp, và danh sách khen thưởng/nhắc nhở
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép báo cáo Zalo</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu A4</span>
            </button>
          </div>
        </div>

        {/* 4 Chỉ số KPI nề nếp tuần */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Xếp loại Tốt (≥90đ)</span>
              <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums">{goodPercent}%</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-2 font-mono tabular-nums">
              {goodList.length} <span className="text-xs font-normal text-emerald-700">/ {totalStudents} HS</span>
            </div>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${goodPercent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Xếp loại Khá (80-89đ)</span>
              <span className="text-xs font-bold text-blue-700 font-mono tabular-nums">{fairPercent}%</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-2 font-mono tabular-nums">
              {fairList.length} <span className="text-xs font-normal text-blue-700">/ {totalStudents} HS</span>
            </div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${fairPercent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">Xếp loại Đạt (70-79đ)</span>
              <span className="text-xs font-bold text-amber-700 font-mono tabular-nums">{passPercent}%</span>
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-2 font-mono tabular-nums">
              {passList.length} <span className="text-xs font-normal text-amber-700">/ {totalStudents} HS</span>
            </div>
            <div className="w-full bg-amber-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${passPercent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">Chưa đạt (&lt;70đ)</span>
              <span className="text-xs font-bold text-rose-700 font-mono tabular-nums">{failPercent}%</span>
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-2 font-mono tabular-nums">
              {failList.length} <span className="text-xs font-normal text-rose-700">/ {totalStudents} HS</span>
            </div>
            <div className="w-full bg-rose-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full" style={{ width: `${failPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC GHI CHÚ PHẢN HỒI CỦA GVCN CHO 6 NHÓM THI ĐUA */}
      <div className="bg-slate-900/75 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-5 shadow-xl text-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>👩‍🏫</span>
              <span>Ý Kiến Phản Hồi Cuối Tuần Của GVCN</span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">
              Ghi Chú Của Giáo Viên Chủ Nhiệm Cho 6 Nhóm Thi Đua · {currentWeek.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Lời dặn dò, khen ngợi và chấn chỉnh nề nếp cho từng nhóm nhằm tăng tính tương tác & phản hồi kịp thời
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onSaveTeacherGroupNotes && (
              <button
                type="button"
                onClick={handleAutoGenerateAllNotes}
                className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:from-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-950/40 border border-teal-300/40 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
                title="Tự động tạo nhận xét theo báo cáo tuần cho toàn bộ 6 nhóm"
              >
                <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Tự Động Nhận Xét 6 Nhóm</span>
              </button>
            )}

            {onOpenTeacherNotesModal && (
              <button
                type="button"
                onClick={onOpenTeacherNotesModal}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white rounded-xl text-xs font-bold shadow-md border border-slate-600 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
                title="Mở biểu mẫu nhập/chỉnh sửa ghi chú cho cả 6 nhóm"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Ghi Chú & Sửa Lời Dặn</span>
              </button>
            )}
          </div>
        </div>

        {/* Thông báo khi tự động tạo nhận xét thành công */}
        {autoGenSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{autoGenSuccess}</span>
          </div>
        )}

        {/* 6 Thẻ Ghi Chú Phản Hồi Của Từng Nhóm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {groups.map((g) => {
            const note = teacherGroupNotes?.[g.groupId]?.trim();
            const grReport = groupRemarks[g.groupId];
            return (
              <div
                key={g.groupId}
                onClick={onOpenTeacherNotesModal}
                className="p-4 rounded-xl bg-slate-800/70 hover:bg-slate-800/90 border border-slate-700/70 hover:border-emerald-400/50 transition-all cursor-pointer space-y-2 group shadow-sm"
                title="Bấm để chỉnh sửa ghi chú của GVCN cho nhóm này"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {g.groupId}
                    </span>
                    <span className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                      {g.groupName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Hạng {g.rank} · {g.averageScore}đ
                  </span>
                </div>

                <div className="text-xs">
                  {note ? (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/25 text-amber-200">
                      <span className="font-bold text-amber-300 text-[10px] block mb-0.5 uppercase tracking-wide">
                        Lời dặn GVCN (theo báo cáo):
                      </span>
                      <p className="text-[11px] leading-relaxed text-amber-100 italic">
                        "{note}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-dashed border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors text-[11px] flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span>✍️</span>
                        <span className="truncate">Chưa có nhận xét riêng</span>
                      </div>
                      {onSaveTeacherGroupNotes && (
                        <button
                          type="button"
                          onClick={(e) => handleAutoGenerateSingleGroup(g.groupId, e)}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded shadow-xs shrink-0 cursor-pointer"
                          title="Tự động nhận xét theo báo cáo cho nhóm này"
                        >
                          ⚡ Tự động tạo
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                  <span>Nhóm trưởng: <strong className="text-slate-300">{g.leaderName}</strong></span>
                  <span className="text-emerald-400 font-medium group-hover:underline">Chỉnh sửa →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Top Vi Phạm & Tuyên Dương / Nhắc Nhở */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top các vi phạm phổ biến nhất */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Các Lỗi Vi Phạm Nề Nếp Phổ Biến Nhất
            </h3>
            <span className="text-xs text-slate-400">Số lượt ghi nhận</span>
          </div>

          {violationCounts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Lớp không có lỗi vi phạm nào trong tuần.
            </p>
          ) : (
            <div className="space-y-3">
              {violationCounts.slice(0, 6).map((v, idx) => {
                const maxCount = violationCounts[0].count;
                const widthPercent = Math.max(10, Math.round((v.count / maxCount) * 100));
                return (
                  <div key={v.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {idx + 1}. {v.name}
                      </span>
                      <span className="font-mono text-rose-600 font-semibold tabular-nums">
                        {v.count} lượt <span className="text-slate-400 text-[10px]">(-{v.points}đ)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tuyên dương học sinh tiêu biểu */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Tuyên Dương Học Sinh Xuất Sắc & Gương Mẫu
            </h3>
            <span className="text-xs text-emerald-700 font-semibold">Tiêu biểu tuần</span>
          </div>

          <div className="space-y-2.5">
            {topExemplary.map((calc, idx) => (
              <div
                key={calc.student.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{calc.student.name}</h4>
                    <p className="text-[10px] text-slate-500">
                      Nhóm {calc.student.groupId} · {calc.student.role || 'Học sinh'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-700 tabular-nums">
                    {calc.finalScore} điểm
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    +{calc.totalBonus}đ cộng khen thưởng
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Học sinh cần phối hợp nhắc nhở */}
      {needAttention.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Danh Sách Học Sinh Cần Chấn Chỉnh Nề Nếp & Phối Hợp Gia Đình
            </h3>
            <span className="text-xs text-rose-600 font-semibold font-mono tabular-nums">
              {needAttention.length} học sinh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {needAttention.map((calc) => (
              <div
                key={calc.student.id}
                className="p-3 rounded-lg bg-rose-50/40 border border-rose-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{calc.student.name}</span>
                  <span className="text-xs font-mono font-bold text-rose-700 tabular-nums">
                    {calc.finalScore}đ ({calc.classification})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span>Nhóm {calc.student.groupId}</span>
                  <span>·</span>
                  <span className="text-rose-600 font-medium">Bị trừ -{calc.totalPenalty}đ</span>
                </div>
                {calc.record.note && (
                  <p className="text-[10px] text-slate-500 bg-white p-1.5 rounded border border-rose-100 italic">
                    {calc.record.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Khung xem trước bản báo cáo Zalo */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Nội dung báo cáo tuần gửi GVCN / Nhóm phụ huynh
          </h3>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép toàn bộ</span>
          </button>
        </div>
        <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-300 max-h-60 overflow-y-auto">
          {reportText}
        </pre>
      </div>
    </div>
  );
};
