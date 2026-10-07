import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Edit2,
  HelpCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Student,
  StudentWeeklyRecord,
  CalculatedStudentScore,
  ScoreClassification,
  UserRoleType,
  UserAccount,
} from '../types/discipline';
import { CRITERIA_LIST, getClassificationColor } from '../utils/scoring';
import {
  checkCellPermission,
  canEditStudent,
  canEditCriterion,
  getRolePermissionBadge,
} from '../utils/permissions';
import { Lock, ShieldCheck } from 'lucide-react';

interface WeeklyScoreTableProps {
  students: Student[];
  records: Record<string, StudentWeeklyRecord>;
  currentWeekName: string;
  currentRole?: UserRoleType;
  assignedGroupIds?: number[];
  currentAccount?: UserAccount;
  onUpdateRecord: (studentId: string, updatedFields: Partial<StudentWeeklyRecord>) => void;
  onQuickRecordStudent: (student: Student) => void;
  onOpenQuickEntry?: () => void;
  onOpenAdjustScore?: (student?: Student) => void;
}

export const WeeklyScoreTable: React.FC<WeeklyScoreTableProps> = ({
  students,
  records,
  currentWeekName,
  currentRole = 'gvcn',
  assignedGroupIds,
  currentAccount,
  onUpdateRecord,
  onQuickRecordStudent,
  onOpenQuickEntry,
  onOpenAdjustScore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'ALL'>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<ScoreClassification | 'ALL'>('ALL');
  const [activeCellEdit, setActiveCellEdit] = useState<{
    studentId: string;
    field: keyof StudentWeeklyRecord;
  } | null>(null);

  // Khi đăng nhập tài khoản Nhóm trưởng: tự động lọc đúng nhóm của mình để chấm điểm
  useEffect(() => {
    if (currentRole.startsWith('nhomTruong')) {
      const gNum = assignedGroupIds?.[0] || parseInt(currentRole.replace('nhomTruong', ''), 10);
      if (gNum && !isNaN(gNum)) {
        setSelectedGroupFilter(gNum);
      }
    }
  }, [currentRole, assignedGroupIds]);

  // Tính điểm cho tất cả học sinh
  const calculatedList: CalculatedStudentScore[] = students.map((s) => {
    const rec = records[s.id] || {
      studentId: s.id,
      diTre: 0,
      nghiCP: 0,
      nghiKP: 0,
      boTiet: 0,
      ktbKlbKsb: 0,
      khongDongPhuc2: 0,
      diemTot: 0,
      phatBieu: 0,
      khongDongPhuc5: 0,
      matTratTu: 0,
      khongThamGiaVS: 0,
      noiTuc: 0,
      xaRac: 0,
      trucVSBan: 0,
      huHongTS: 0,
      voLeGV: 0,
      dungDienThoai: 0,
    };

    let totalPenalty = 0;
    let totalBonus = 0;

    for (const c of CRITERIA_LIST) {
      const count = rec[c.key] || 0;
      if (c.isBonus) {
        totalBonus += count * c.points;
      } else {
        totalPenalty += count * Math.abs(c.points);
      }
    }

    const netChange = totalBonus - totalPenalty;
    const finalScore = Math.max(0, 100 - totalPenalty + totalBonus);

    let classification: ScoreClassification = 'Chưa đạt';
    if (finalScore >= 90) classification = 'Tốt';
    else if (finalScore >= 80) classification = 'Khá';
    else if (finalScore >= 70) classification = 'Đạt';

    return {
      student: s,
      record: rec,
      baseScore: 100,
      totalPenalty,
      totalBonus,
      netChange,
      finalScore,
      classification,
    };
  });

  // Lọc
  const filteredList = calculatedList.filter((item) => {
    if (selectedGroupFilter !== 'ALL' && item.student.groupId !== selectedGroupFilter) {
      return false;
    }
    if (selectedClassFilter !== 'ALL' && item.classification !== selectedClassFilter) {
      return false;
    }
    if (
      searchTerm.trim() &&
      !item.student.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    ) {
      return false;
    }
    return true;
  });

  // Thay đổi số lần trực tiếp
  const handleCellDelta = (
    studentId: string,
    field: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>,
    delta: number
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const perm = checkCellPermission(currentRole, student.groupId, field, assignedGroupIds);
    if (!perm.allowed) return;

    const currentVal = Number(records[studentId]?.[field] || 0);
    const newVal = Math.max(0, currentVal + delta);
    onUpdateRecord(studentId, { [field]: newVal });
  };

  // Xuất file CSV tiếng Việt chuẩn
  const exportToCSV = () => {
    const headers = [
      'STT',
      'Họ tên học sinh',
      'Nhóm',
      'Đi trễ (-2)',
      'Nghỉ CP (-2)',
      'Nghỉ KP (-4)',
      'Bỏ tiết (-2)',
      'KTB/KLB/KSB (-2)',
      'Không đồng phục (-2)',
      'Điểm tốt (+2)',
      'Phát biểu (+1)',
      'Mất trật tự (-2)',
      'Không tham gia VS (-2)',
      'Nói tục (-2)',
      'Xả rác (-2)',
      'Trực VS bẩn (-2)',
      'Hư hỏng TS (-5)',
      'Vô lễ GV (-5)',
      'Sử dụng ĐT (-10)',
      'Điểm chuẩn',
      'Điểm trừ/cộng',
      'Tổng điểm còn lại',
      'Xếp loại',
      'Ghi chú',
    ];

    const rows = filteredList.map((c, idx) => [
      idx + 1,
      `"${c.student.name}"`,
      `"Nhóm ${c.student.groupId}"`,
      c.record.diTre,
      c.record.nghiCP,
      c.record.nghiKP,
      c.record.boTiet,
      c.record.ktbKlbKsb,
      c.record.khongDongPhuc2,
      c.record.diemTot,
      c.record.phatBieu,
      c.record.matTratTu,
      c.record.khongThamGiaVS,
      c.record.noiTuc,
      c.record.xaRac,
      c.record.trucVSBan,
      c.record.huHongTS,
      c.record.voLeGV,
      c.record.dungDienThoai,
      100,
      c.netChange,
      c.finalScore,
      `"${c.classification}"`,
      `"${c.record.note || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `So_Theo_Doi_Ne_Nep_${currentWeekName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Banner thông báo quyền hạn tài khoản */}
      {(() => {
        const badge = getRolePermissionBadge(currentRole, assignedGroupIds);
        return (
          <div className="bg-blue-50 border border-blue-200 text-slate-900 rounded-xl p-3 px-4 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {currentAccount ? (
                  <>
                    {currentAccount.role === 'gvcn' ? 'Giáo viên:' : 'Học sinh chấm điểm:'}{' '}
                    <strong className="text-blue-950 font-black text-xs sm:text-sm bg-white px-2 py-0.5 rounded border border-blue-200">
                      {currentAccount.displayName}
                    </strong>{' '}
                    <span className="text-blue-800 font-bold bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">
                      ({currentAccount.title})
                    </span>
                  </>
                ) : (
                  <>
                    Phân quyền tài khoản: <strong className="text-blue-800 font-bold">{badge.badgeText}</strong>
                  </>
                )}
              </span>
              <span className="text-slate-600 hidden sm:inline">— {badge.scopeText}</span>
            </div>
            {currentRole !== 'gvcn' && currentRole !== 'lopTruong' && (
              <span className="text-[11px] text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Các cột/học sinh ngoài quyền hạn được tự động khóa</span>
              </span>
            )}
          </div>
        );
      })()}

      {/* Top Filter and Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Sổ Theo Dõi Thi Đua Nề Nếp Hàng Tuần
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng bảng điểm chuẩn quy định THCS · Bấm vào ô số để tăng/giảm nhanh vi phạm
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên học sinh..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 transition-colors"
              />
            </div>

            {/* Filter by Group */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedGroupFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  selectedGroupFilter === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cả 6 nhóm
              </button>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGroupFilter(g)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    selectedGroupFilter === g
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  N{g}
                </button>
              ))}
            </div>

            {/* Filter by Classification */}
            <select
              value={selectedClassFilter}
              onChange={(e) =>
                setSelectedClassFilter(e.target.value as ScoreClassification | 'ALL')
              }
              aria-label="Lọc theo xếp loại"
              className="px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Mọi xếp loại</option>
              <option value="Tốt">Tốt (90 - 100)</option>
              <option value="Khá">Khá (80 - 89)</option>
              <option value="Đạt">Đạt (70 - 79)</option>
              <option value="Chưa đạt">Chưa đạt (&lt; 70)</option>
            </select>

            {/* Nút Điều Chỉnh Điểm Nhầm */}
            {onOpenAdjustScore && (
              <button
                type="button"
                onClick={() => onOpenAdjustScore()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 border border-amber-500/50 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Điều chỉnh, tăng giảm hoặc xóa điểm cộng/trừ khi bị cho nhầm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-950" />
                <span>Điều Chỉnh Điểm Nhầm</span>
              </button>
            )}

            {/* Export CSV button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Matching User's Image */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Row 1 Header */}
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center select-none">
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-10">
                  STT
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 min-w-[150px] text-left">
                  Họ tên học sinh
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-12 text-rose-700">
                  Đi trễ
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th colSpan={2} className="p-1 border-r border-slate-300 text-rose-700">
                  Nghỉ học
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-12 text-rose-700">
                  Bỏ tiết
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-16 text-rose-700">
                  KTB KLB KSB
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 text-rose-700">
                  Không đồng phục
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-18 text-emerald-700 bg-emerald-50/60">
                  Điểm tốt +2
                  <span className="block text-[10px] font-normal text-emerald-600">Phát biểu +1</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-12 text-rose-700">
                  Mất trật tự
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 text-rose-700">
                  Không tham gia VS
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 text-rose-700">
                  Nói tục, chửi thề
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 text-rose-700">
                  Xả rác trong lớp
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-12 text-rose-700">
                  Trực VS bẩn
                  <span className="block text-[10px] font-normal text-slate-500">-2</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-12 text-rose-700">
                  Hư hỏng TS
                  <span className="block text-[10px] font-normal text-slate-500">-5</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-12 text-rose-700">
                  Vô lễ GV
                  <span className="block text-[10px] font-normal text-slate-500">-5</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 text-rose-700">
                  Sử dụng điện thoại
                  <span className="block text-[10px] font-normal text-slate-500">-10</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 bg-slate-200 font-bold text-slate-900">
                  Điểm chuẩn
                  <span className="block text-[10px] font-normal">100</span>
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 text-slate-700">
                  Điểm trừ/cộng
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-14 bg-indigo-50 text-indigo-900 font-bold">
                  Tổng điểm còn lại
                </th>
                <th rowSpan={2} className="p-2 w-18 text-slate-800">
                  Xếp loại
                </th>
              </tr>

              {/* Row 2 Sub-header for CP / KP */}
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-center select-none text-[11px]">
                <th className="p-1 border-r border-slate-300 w-11 text-rose-700">
                  CP <span className="font-normal text-[10px]">-2</span>
                </th>
                <th className="p-1 border-r border-slate-300 w-11 text-rose-700">
                  KP <span className="font-normal text-[10px]">-4</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={23} className="py-12 px-4 text-center text-slate-500 bg-slate-50/50">
                    <p className="font-extrabold text-sm text-slate-800">
                      {students.length === 0 ? 'Danh sách học sinh đang trống' : 'Không có học sinh nào phù hợp'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {students.length === 0
                        ? 'Toàn bộ danh sách mẫu đã được xóa. Hãy bấm "Nhập/Xuất Excel" ở phía trên để nạp file danh sách của lớp bạn lên.'
                        : 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bộ lọc nhóm / xếp loại.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                const rec = item.record;
                const clsColor = getClassificationColor(item.classification);

                return (
                  <tr
                    key={item.student.id}
                    className="hover:bg-indigo-50/30 transition-colors font-medium text-slate-800"
                  >
                    {/* STT */}
                    <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-400 tabular-nums">
                      {index + 1}
                    </td>

                    {/* Họ tên học sinh */}
                    <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1">
                        <div>
                          <span className="font-semibold text-slate-900">{item.student.name}</span>
                          <span className="ml-1.5 text-[10px] text-indigo-700 font-medium bg-indigo-50 px-1 py-0.5 rounded">
                            N{item.student.groupId}
                          </span>
                        </div>
                        {canEditStudent(currentRole, item.student.groupId, assignedGroupIds) ? (
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => onQuickRecordStudent(item.student)}
                              title="Ghi nhận vi phạm/khen thưởng"
                              className="text-slate-300 hover:text-indigo-600 p-0.5 rounded cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            {onOpenAdjustScore && (
                              <button
                                onClick={() => onOpenAdjustScore(item.student)}
                                title={`Điều chỉnh điểm khi cho nhầm cho ${item.student.name}`}
                                className="text-slate-300 hover:text-amber-600 p-0.5 rounded cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3 h-3 text-amber-500 hover:text-amber-600" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span title="Không có quyền ghi nhận học sinh nhóm này" className="p-0.5 text-slate-300">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Đi trễ */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'diTre', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.diTre}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'diTre', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'diTre', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Nghỉ CP */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'nghiCP', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.nghiCP}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'nghiCP', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'nghiCP', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Nghỉ KP */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'nghiKP', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.nghiKP}
                            isDanger={rec.nghiKP > 0}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'nghiKP', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'nghiKP', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Bỏ tiết */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'boTiet', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.boTiet}
                            isDanger={rec.boTiet > 0}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'boTiet', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'boTiet', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* KTB KLB KSB */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'ktbKlbKsb', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.ktbKlbKsb}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'ktbKlbKsb', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'ktbKlbKsb', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Không đồng phục -2 */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'khongDongPhuc2', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.khongDongPhuc2}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'khongDongPhuc2', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'khongDongPhuc2', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Điểm tốt / Phát biểu */}
                    {(() => {
                      const pDiemTot = checkCellPermission(currentRole, item.student.groupId, 'diemTot', assignedGroupIds);
                      const pPhatBieu = checkCellPermission(currentRole, item.student.groupId, 'phatBieu', assignedGroupIds);
                      const isBothDisabled = !pDiemTot.allowed && !pPhatBieu.allowed;

                      return (
                        <td className={`p-1 border-r border-slate-200 text-center font-mono tabular-nums ${isBothDisabled ? 'bg-slate-50/50 opacity-50' : 'bg-emerald-50/30'}`}>
                          <div className="flex items-center justify-center gap-1 text-[11px]">
                            {pDiemTot.allowed ? (
                              <span className="inline-flex items-center gap-0.5 group/dt relative">
                                {rec.diemTot > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCellDelta(item.student.id, 'diemTot', -1);
                                    }}
                                    className="w-3.5 h-3.5 text-[9px] bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-bold cursor-pointer hidden group-hover/dt:inline-flex items-center justify-center"
                                    title="Giảm 1 lần điểm tốt (sửa nhầm)"
                                  >
                                    -
                                  </button>
                                )}
                                <span
                                  title="Điểm tốt (+2đ) - Bấm để tăng"
                                  className="font-bold text-emerald-700 cursor-pointer hover:underline"
                                  onClick={() => handleCellDelta(item.student.id, 'diemTot', 1)}
                                >
                                  {rec.diemTot > 0 ? `${rec.diemTot}đt` : '-'}
                                </span>
                              </span>
                            ) : (
                              <span title={pDiemTot.reason || 'Không có quyền'} className="text-slate-400 cursor-not-allowed">
                                {rec.diemTot > 0 ? `${rec.diemTot}đt` : '-'}
                              </span>
                            )}
                            <span className="text-slate-300">/</span>
                            {pPhatBieu.allowed ? (
                              <span className="inline-flex items-center gap-0.5 group/pb relative">
                                {rec.phatBieu > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCellDelta(item.student.id, 'phatBieu', -1);
                                    }}
                                    className="w-3.5 h-3.5 text-[9px] bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-bold cursor-pointer hidden group-hover/pb:inline-flex items-center justify-center"
                                    title="Giảm 1 lần phát biểu (sửa nhầm)"
                                  >
                                    -
                                  </button>
                                )}
                                <span
                                  title="Phát biểu (+1đ) - Bấm để tăng"
                                  className="text-emerald-600 cursor-pointer hover:underline"
                                  onClick={() => handleCellDelta(item.student.id, 'phatBieu', 1)}
                                >
                                  {rec.phatBieu > 0 ? `${rec.phatBieu}pb` : '-'}
                                </span>
                              </span>
                            ) : (
                              <span title={pPhatBieu.reason || 'Không có quyền'} className="text-slate-400 cursor-not-allowed">
                                {rec.phatBieu > 0 ? `${rec.phatBieu}pb` : '-'}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })()}

                    {/* Mất trật tự */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'matTratTu', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.matTratTu}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'matTratTu', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'matTratTu', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Không tham gia VS */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'khongThamGiaVS', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.khongThamGiaVS}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'khongThamGiaVS', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'khongThamGiaVS', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Nói tục, chửi thề */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'noiTuc', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.noiTuc}
                            isDanger={rec.noiTuc > 0}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'noiTuc', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'noiTuc', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Xả rác */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'xaRac', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.xaRac}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'xaRac', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'xaRac', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Trực VS bẩn */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'trucVSBan', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.trucVSBan}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'trucVSBan', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'trucVSBan', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Hư hỏng tài sản */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'huHongTS', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.huHongTS}
                            isDanger={rec.huHongTS > 0}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'huHongTS', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'huHongTS', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Vô lễ GV */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'voLeGV', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.voLeGV}
                            isDanger={rec.voLeGV > 0}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'voLeGV', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'voLeGV', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Dùng điện thoại */}
                    {(() => {
                      const p = checkCellPermission(currentRole, item.student.groupId, 'dungDienThoai', assignedGroupIds);
                      return (
                        <td className="p-1 border-r border-slate-200 text-center font-mono tabular-nums">
                          <NumberCell
                            value={rec.dungDienThoai}
                            isDanger={rec.dungDienThoai > 0}
                            disabled={!p.allowed}
                            disabledReason={p.reason}
                            onIncrement={() => handleCellDelta(item.student.id, 'dungDienThoai', 1)}
                            onDecrement={() => handleCellDelta(item.student.id, 'dungDienThoai', -1)}
                          />
                        </td>
                      );
                    })()}

                    {/* Điểm chuẩn */}
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold text-slate-500 tabular-nums">
                      100
                    </td>

                    {/* Điểm trừ / cộng */}
                    <td className="p-2 border-r border-slate-200 text-center font-mono tabular-nums font-semibold">
                      {item.netChange > 0 ? (
                        <span className="text-emerald-600">+{item.netChange}</span>
                      ) : item.netChange < 0 ? (
                        <span className="text-rose-600">{item.netChange}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Tổng điểm còn lại */}
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900 bg-indigo-50/40 tabular-nums text-sm">
                      {item.finalScore}
                    </td>

                    {/* Xếp loại */}
                    <td className="p-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] border ${clsColor.badge}`}
                      >
                        {item.classification}
                      </span>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Chân trang quy định xếp loại (Exact Quote from user image) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-medium text-slate-700">
            <span className="font-bold text-slate-900">Quy định xếp loại tuần:</span> Tổng điểm: từ{' '}
            <span className="font-semibold text-emerald-700">90 điểm đến 100</span>, xếp loại{' '}
            <span className="font-bold text-emerald-700">Tốt</span>. Tổng điểm: từ{' '}
            <span className="font-semibold text-blue-700">80 điểm đến 89 điểm</span>, xếp loại{' '}
            <span className="font-bold text-blue-700">Khá</span>. Từ{' '}
            <span className="font-semibold text-amber-700">70 điểm đến 79</span>, xếp loại{' '}
            <span className="font-bold text-amber-700">Đạt</span>. Dưới{' '}
            <span className="font-semibold text-rose-700">70</span> xếp loại{' '}
            <span className="font-bold text-rose-700">Chưa đạt</span>.
          </div>

          <div className="text-xs text-slate-500 font-mono shrink-0">
            Hiển thị: {filteredList.length} / {students.length} học sinh
          </div>
        </div>
      </div>
    </div>
  );
};

// Ô tương tác số lần vi phạm với hover tăng/giảm nhanh
interface NumberCellProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isDanger?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

const NumberCell: React.FC<NumberCellProps> = ({
  value,
  onIncrement,
  onDecrement,
  isDanger = false,
  disabled = false,
  disabledReason,
}) => {
  return (
    <div
      title={disabled ? (disabledReason || 'Bạn không có quyền sửa ô này') : undefined}
      className={`group relative flex items-center justify-center min-w-[28px] h-7 ${
        disabled ? 'cursor-not-allowed opacity-50 bg-slate-50/50' : 'cursor-pointer hover:bg-slate-100/60'
      }`}
    >
      <span
        className={`font-semibold text-xs ${
          value > 0
            ? isDanger
              ? 'text-rose-700 font-bold bg-rose-100/80 px-1 rounded'
              : 'text-rose-600'
            : 'text-slate-300'
        }`}
      >
        {value > 0 ? value : '-'}
      </span>

      {/* Quick +/- hover controls: chỉ hiện khi có quyền chỉnh sửa */}
      {!disabled && (
        <div className="hidden group-hover:flex items-center gap-0.5 absolute -top-2 bg-slate-900 text-white rounded shadow-md z-20 px-1 py-0.5 text-[10px]">
          {value > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDecrement();
              }}
              className="hover:text-rose-300 p-0.5 cursor-pointer"
              title="Giảm 1 lần"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIncrement();
            }}
            className="hover:text-emerald-300 p-0.5 cursor-pointer"
            title="Tăng 1 lần vi phạm"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
};
