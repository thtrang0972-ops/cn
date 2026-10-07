import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Search,
  ShieldCheck,
  Lock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  Student,
  StudentWeeklyRecord,
  UserRoleType,
  UserAccount,
  CalculatedStudentScore,
} from '../types/discipline';
import { CRITERIA_LIST, CriterionMeta, calculateStudentScore, getClassificationColor } from '../utils/scoring';
import {
  canEditStudent,
  canEditCriterion,
  getRolePermissionBadge,
} from '../utils/permissions';

interface AdjustScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudent?: Student | null;
  records: Record<string, StudentWeeklyRecord>;
  currentRole?: UserRoleType;
  assignedGroupIds?: number[];
  currentAccount?: UserAccount;
  currentWeekName: string;
  onSaveAdjustment: (
    studentId: string,
    updatedRecord: StudentWeeklyRecord,
    adjustmentReason?: string
  ) => void;
}

export const AdjustScoreModal: React.FC<AdjustScoreModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudent,
  records,
  currentRole = 'gvcn',
  assignedGroupIds,
  currentAccount,
  currentWeekName,
  onSaveAdjustment,
}) => {
  // Danh sách nhóm được phép nhập theo quyền
  const getAllowedGroups = (): number[] => {
    if (currentRole === 'gvcn' || currentRole === 'lopTruong') {
      return [1, 2, 3, 4, 5, 6];
    }
    if (
      currentRole === 'lopPhoHocTap' ||
      currentRole === 'lopPhoLaoDong' ||
      currentRole === 'lopPhoTratTu'
    ) {
      return [1, 2, 3, 4, 5, 6];
    }
    if (currentRole.startsWith('nhomTruong')) {
      if (assignedGroupIds && assignedGroupIds.length > 0) return assignedGroupIds;
      const g = parseInt(currentRole.replace('nhomTruong', ''), 10);
      return [g];
    }
    return [1, 2, 3, 4, 5, 6];
  };

  const allowedGroups = getAllowedGroups();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'activeItems' | 'allItems'>('activeItems');

  // Bản sao tạm của record đang điều chỉnh
  const [draftRecord, setDraftRecord] = useState<StudentWeeklyRecord | null>(null);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string>('');

  // Lọc học sinh được phép
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (currentRole.startsWith('nhomTruong') && !allowedGroups.includes(s.groupId)) {
        return false;
      }
      if (groupFilter !== 'ALL' && s.groupId !== groupFilter) {
        return false;
      }
      if (
        searchTerm.trim() &&
        !s.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
        !s.stt.toString().includes(searchTerm.trim())
      ) {
        return false;
      }
      return true;
    });
  }, [students, currentRole, allowedGroups, groupFilter, searchTerm]);

  // Khởi tạo student được chọn khi mở modal
  useEffect(() => {
    if (!isOpen) {
      setSavedSuccessMsg('');
      return;
    }

    let targetStudent: Student | undefined;
    if (initialStudent && eligibleStudents.some((s) => s.id === initialStudent.id)) {
      targetStudent = initialStudent;
    } else if (eligibleStudents.length > 0) {
      targetStudent = eligibleStudents[0];
    }

    if (targetStudent) {
      setSelectedStudentId(targetStudent.id);
      loadStudentDraft(targetStudent.id);
    }
  }, [isOpen, initialStudent]);

  // Khi đổi học sinh trong dropdown
  const handleSelectStudent = (sId: string) => {
    setSelectedStudentId(sId);
    loadStudentDraft(sId);
  };

  const loadStudentDraft = (sId: string) => {
    const orig = records[sId] || {
      studentId: sId,
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
      note: '',
    };
    setDraftRecord({ ...orig });
    setAdjustmentReason('');
  };

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const originalRecord = selectedStudentId ? records[selectedStudentId] : undefined;

  const origCalculated = currentStudent
    ? calculateStudentScore(currentStudent, originalRecord)
    : null;
  const draftCalculated = currentStudent && draftRecord
    ? calculateStudentScore(currentStudent, draftRecord)
    : null;

  const isStudentEditable = currentStudent
    ? canEditStudent(currentRole, currentStudent.groupId, assignedGroupIds)
    : false;

  // Danh sách các tiêu chí hiện đang có điểm (> 0) trong draft
  const activeCriteriaList = CRITERIA_LIST.filter((crit) => {
    if (!draftRecord) return false;
    const val = draftRecord[crit.key];
    return typeof val === 'number' && val > 0;
  });

  // Thay đổi giá trị của 1 tiêu chí
  const handleCriterionDelta = (
    key: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>,
    delta: number
  ) => {
    if (!draftRecord || !isStudentEditable) return;
    if (!canEditCriterion(currentRole, key)) return;

    const currentVal = Number(draftRecord[key] || 0);
    const newVal = Math.max(0, currentVal + delta);
    setDraftRecord({
      ...draftRecord,
      [key]: newVal,
    });
  };

  // Đặt về 0 (xóa nhầm)
  const handleResetCriterion = (key: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>) => {
    if (!draftRecord || !isStudentEditable) return;
    if (!canEditCriterion(currentRole, key)) return;

    setDraftRecord({
      ...draftRecord,
      [key]: 0,
    });
  };

  // Khôi phục lại dữ liệu ban đầu trước khi sửa trong modal
  const handleResetAllToOriginal = () => {
    if (selectedStudentId) {
      loadStudentDraft(selectedStudentId);
    }
  };

  // Lưu điều chỉnh
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftRecord || !selectedStudentId || !isStudentEditable) return;

    // Cập nhật note nếu có lý do điều chỉnh
    const updated = { ...draftRecord };
    if (adjustmentReason.trim()) {
      const reasonPrefix = `[Điều chỉnh: ${adjustmentReason.trim()}]`;
      if (updated.note) {
        if (!updated.note.includes(reasonPrefix)) {
          updated.note = `${reasonPrefix} ${updated.note}`.trim();
        }
      } else {
        updated.note = reasonPrefix;
      }
    }

    onSaveAdjustment(selectedStudentId, updated, adjustmentReason.trim());

    setSavedSuccessMsg(`Đã cập nhật điểm nề nếp cho ${currentStudent?.name || 'học sinh'}!`);
    setTimeout(() => {
      setSavedSuccessMsg('');
      onClose();
    }, 900);
  };

  const badge = getRolePermissionBadge(currentRole, assignedGroupIds);

  const quickReasonPresets = [
    'Cho điểm nhầm tiết học',
    'Nhầm tên học sinh cùng nhóm',
    'Học sinh đã bổ sung bài tập',
    'Cờ đỏ đính chính lại lỗi',
    'Cộng bù điểm phát biểu / điểm tốt',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-['Be_Vietnam_Pro',sans-serif]">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Điều Chỉnh & Sửa Điểm Nhầm
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  Khắc phục ghi nhầm
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cho phép tăng, giảm, hoàn tác hoặc xóa điểm cộng/trừ khi cán sự hoặc giáo viên lỡ nhập nhầm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo lưu thành công */}
        {savedSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Body Modal */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto flex-1 p-5 space-y-4 text-xs">
            {/* Thanh chọn học sinh & bộ lọc */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Chọn học sinh cần điều chỉnh điểm:</span>
                </label>

                {/* Nhóm lọc */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Nhóm:</span>
                  <button
                    type="button"
                    onClick={() => setGroupFilter('ALL')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      groupFilter === 'ALL'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {[1, 2, 3, 4, 5, 6].map((g) => {
                    const isAllowed = allowedGroups.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        disabled={!isAllowed}
                        onClick={() => setGroupFilter(g)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          !isAllowed
                            ? 'opacity-30 bg-slate-200 text-slate-400 cursor-not-allowed'
                            : groupFilter === g
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        N{g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ô tìm kiếm + Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên/STT..."
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full py-2 px-3 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {eligibleStudents.length === 0 ? (
                      <option value="">(Không tìm thấy học sinh phù hợp)</option>
                    ) : (
                      eligibleStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          STT {s.stt}. {s.name} (Nhóm {s.groupId} {s.role ? `· ${s.role}` : ''})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Thẻ So Sánh Điểm Cũ vs Điểm Mới sau điều chỉnh */}
            {currentStudent && origCalculated && draftCalculated && (
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 p-4 rounded-xl border border-amber-300/80 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      {currentStudent.stt}
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{currentStudent.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        Nhóm {currentStudent.groupId} · {currentStudent.role || 'Học sinh'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    {/* Điểm cũ */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block leading-none">Điểm hiện tại</span>
                      <strong className="text-sm font-black text-slate-700 font-mono">
                        {origCalculated.finalScore}đ
                      </strong>
                    </div>

                    <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />

                    {/* Điểm mới */}
                    <div className="text-left">
                      <span className="text-[10px] text-emerald-600 font-bold block leading-none">
                        Sau điều chỉnh
                      </span>
                      <strong className="text-base font-black text-emerald-700 font-mono">
                        {draftCalculated.finalScore}đ
                      </strong>
                    </div>

                    {/* Độ lệch */}
                    {draftCalculated.finalScore !== origCalculated.finalScore && (
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                          draftCalculated.finalScore > origCalculated.finalScore
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {draftCalculated.finalScore > origCalculated.finalScore ? '+' : ''}
                        {draftCalculated.finalScore - origCalculated.finalScore}đ
                      </span>
                    )}
                  </div>
                </div>

                {/* Chi tiết cộng trừ */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-slate-200/80 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Điểm chuẩn:</span>
                    <strong className="font-bold text-slate-800">100đ</strong>
                  </div>
                  <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    <span className="text-emerald-700 block text-[10px]">Tổng điểm cộng:</span>
                    <strong className="font-black text-emerald-800">+{draftCalculated.totalBonus}đ</strong>
                  </div>
                  <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                    <span className="text-rose-700 block text-[10px]">Tổng điểm trừ:</span>
                    <strong className="font-black text-rose-800">-{draftCalculated.totalPenalty}đ</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs chuyển đổi giữa "Các mục đang có điểm" và "Toàn bộ 17 tiêu chí" */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('activeItems')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'activeItems'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Các mục đang có điểm ({activeCriteriaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('allItems')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'allItems'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Tất cả tiêu chí ({CRITERIA_LIST.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetAllToOriginal}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                title="Khôi phục lại như cũ trước khi mở sửa"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hoàn tác như cũ</span>
              </button>
            </div>

            {/* KHU VỰC 1: CÁC MỤC ĐANG CÓ ĐIỂM (Dễ sửa và xóa nhầm nhất) */}
            {activeTab === 'activeItems' && (
              <div className="space-y-2.5">
                {activeCriteriaList.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                    <p className="font-bold text-slate-700">Học sinh này hiện chưa có điểm cộng hoặc điểm trừ nào!</p>
                    <p className="text-[11px] mt-1">
                      Bấm vào tab <strong>"Tất cả tiêu chí"</strong> ở trên để thêm hoặc điều chỉnh bất kỳ mục nào.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Bấm nút <strong>[-]</strong> để giảm bớt số lần, hoặc bấm <strong>"Về 0"</strong> để xóa lỗi/điểm ghi nhầm:
                    </p>
                    {activeCriteriaList.map((crit) => {
                      const count = draftRecord ? Number(draftRecord[crit.key] || 0) : 0;
                      const isAllowed = canEditCriterion(currentRole, crit.key);

                      return (
                        <div
                          key={crit.key}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            crit.isBonus
                              ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400'
                              : 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  crit.isBonus
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-rose-200 text-rose-900'
                                }`}
                              >
                                {crit.code}
                              </span>
                              <h5 className="font-bold text-xs text-slate-900 truncate">
                                {crit.name}
                              </h5>
                              <span className="text-[11px] text-slate-500 font-normal">
                                ({crit.isBonus ? `+${crit.points}đ/lần` : `${crit.points}đ/lần`})
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                              {crit.description}
                            </p>
                          </div>

                          {/* Bộ điều khiển tăng giảm & xóa về 0 */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Nút giảm [-] */}
                            <button
                              type="button"
                              disabled={!isAllowed || count <= 0}
                              onClick={() => handleCriterionDelta(crit.key, -1)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Giảm 1 lần (sửa nhầm)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            {/* Số lần hiện tại */}
                            <span className="w-8 text-center font-mono font-black text-sm text-slate-900">
                              {count}
                            </span>

                            {/* Nút tăng [+] */}
                            <button
                              type="button"
                              disabled={!isAllowed}
                              onClick={() => handleCriterionDelta(crit.key, 1)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Tăng 1 lần"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút Xóa lỗi về 0 một chạm */}
                            <button
                              type="button"
                              disabled={!isAllowed || count === 0}
                              onClick={() => handleResetCriterion(crit.key)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-900 border border-rose-300 font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Xóa mục này về 0 (đã ghi nhầm)"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Về 0</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* KHU VỰC 2: TẤT CẢ TIÊU CHÍ */}
            {activeTab === 'allItems' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-semibold">
                  Tất cả tiêu chí thi đua (Điều chỉnh số lần tùy ý):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {CRITERIA_LIST.map((crit) => {
                    const count = draftRecord ? Number(draftRecord[crit.key] || 0) : 0;
                    const isAllowed = canEditCriterion(currentRole, crit.key);

                    return (
                      <div
                        key={crit.key}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          count > 0
                            ? crit.isBonus
                              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300/40'
                              : 'bg-rose-50 border-rose-300 ring-1 ring-rose-300/40'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-800 truncate">{crit.name}</p>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              crit.isBonus ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {crit.points > 0 ? `+${crit.points}đ` : `${crit.points}đ`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={!isAllowed || count <= 0}
                            onClick={() => handleCriterionDelta(crit.key, -1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs">{count}</span>
                          <button
                            type="button"
                            disabled={!isAllowed}
                            onClick={() => handleCriterionDelta(crit.key, 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nhập Lý Do Điều Chỉnh (Ghi chú để minh bạch) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Lý do điều chỉnh (Để lưu lại minh bạch trong sổ nề nếp):
              </label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="VD: Cán sự nhập nhầm tên học sinh, đã kiểm tra lại..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />

              {/* Gợi ý lý do nhanh */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Gợi ý nhanh:</span>
                {quickReasonPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAdjustmentReason(preset)}
                    className="text-[10px] bg-white hover:bg-amber-100/70 text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Đóng lại
            </button>

            <button
              type="submit"
              disabled={!isStudentEditable || !currentStudent}
              className={`px-5 py-2.5 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isStudentEditable && currentStudent
                  ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border border-amber-600/40 hover:scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Lưu Điều Chỉnh Điểm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
