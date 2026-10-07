import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Clock,
  SunMoon,
  Sparkles,
  AlertTriangle,
  Check,
  User,
  Filter,
} from 'lucide-react';
import {
  Student,
  StudentWeeklyRecord,
  MorningDutyRecord,
  AfternoonRecord,
  UserRoleType,
  UserAccount,
} from '../types/discipline';
import { CRITERIA_LIST, CriterionMeta } from '../utils/scoring';
import {
  canEditStudent,
  canEditCriterion,
  getRolePermissionBadge,
  ACADEMIC_CRITERIA_KEYS,
  LABOR_CRITERIA_KEYS,
  DISCIPLINE_CRITERIA_KEYS,
} from '../utils/permissions';
import { Lock, ShieldCheck, SlidersHorizontal } from 'lucide-react';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudent?: Student | null;
  currentRole?: UserRoleType;
  assignedGroupIds?: number[];
  currentAccount?: UserAccount;
  currentWeekId: number;
  onApplyViolation: (
    studentId: string,
    field: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>,
    delta: number,
    note?: string,
    context?: 'standard' | 'morning' | 'afternoon',
    contextDetails?: {
      dayOfWeek?: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
      sessionName?: string;
    }
  ) => void;
  onOpenAdjustScore?: (student?: Student) => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudent,
  currentRole = 'gvcn',
  assignedGroupIds,
  currentAccount,
  currentWeekId,
  onApplyViolation,
  onOpenAdjustScore,
}) => {
  // Xác định danh sách nhóm được phép nhập
  const getAllowedGroups = (): number[] => {
    if (currentRole === 'gvcn' || currentRole === 'lopTruong') {
      return [1, 2, 3, 4, 5, 6];
    }
    if (currentRole === 'lopPhoHocTap' || currentRole === 'lopPhoLaoDong' || currentRole === 'lopPhoTratTu') {
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
  const defaultAllowedGroup = allowedGroups[0] || 1;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<number | 'ALL'>('ALL');
  const [selectedKey, setSelectedKey] = useState<
    keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>
  >('ktbKlbKsb');
  const [quantity, setQuantity] = useState<number>(1);
  const [sessionContext, setSessionContext] = useState<'standard' | 'morning' | 'afternoon'>('standard');
  const [dayOfWeek, setDayOfWeek] = useState<
    'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7'
  >('Thứ 2');
  const [sessionDetail, setSessionDetail] = useState('');
  const [note, setNote] = useState('');

  // Lọc tiêu chí theo vai trò
  const availableCriteria = CRITERIA_LIST.filter((crit) => {
    return canEditCriterion(currentRole, crit.key);
  });

  useEffect(() => {
    if (!isOpen) return;

    // Thiết lập nhóm filter ban đầu
    if (currentRole.startsWith('nhomTruong')) {
      setGroupFilter(defaultAllowedGroup);
      const studentInGroup = students.find((s) => s.groupId === defaultAllowedGroup);
      if (studentInGroup) {
        setSelectedStudentId(studentInGroup.id);
      }
    } else if (initialStudent) {
      setSelectedStudentId(initialStudent.id);
      setGroupFilter(initialStudent.groupId);
    } else {
      setGroupFilter('ALL');
      if (students.length > 0) {
        setSelectedStudentId(students[0].id);
      }
    }

    // Thiết lập tiêu chí mặc định theo vai trò
    if (currentRole === 'lopPhoHocTap') {
      setSelectedKey('ktbKlbKsb');
    } else if (currentRole === 'lopPhoLaoDong') {
      setSelectedKey('trucVSBan');
    } else if (currentRole === 'lopPhoTratTu') {
      setSelectedKey('diTre');
    } else if (availableCriteria.length > 0 && !availableCriteria.some((c) => c.key === selectedKey)) {
      setSelectedKey(availableCriteria[0].key);
    }
  }, [initialStudent, currentRole, isOpen]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentCriterion = CRITERIA_LIST.find((c) => c.key === selectedKey);

  // Kiểm tra quyền hạn đối với học sinh đang chọn
  const isStudentAllowed = currentStudent
    ? canEditStudent(currentRole, currentStudent.groupId, assignedGroupIds)
    : false;

  const isCriterionAllowed = canEditCriterion(currentRole, selectedKey);
  const canSubmit = isStudentAllowed && isCriterionAllowed && !!selectedStudentId;

  const filteredStudents = students.filter((s) => {
    // Nếu là nhóm trưởng thì chỉ lọc trong các nhóm được phân công
    if (currentRole.startsWith('nhomTruong') && !allowedGroups.includes(s.groupId)) {
      return false;
    }
    if (groupFilter !== 'ALL' && s.groupId !== groupFilter) {
      return false;
    }
    return true;
  });

  const badge = getRolePermissionBadge(currentRole, assignedGroupIds);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedStudentId) return;

    onApplyViolation(
      selectedStudentId,
      selectedKey,
      quantity,
      note.trim() || undefined,
      sessionContext,
      {
        dayOfWeek,
        sessionName: sessionDetail.trim() || undefined,
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Cố định ở trên) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Ghi Nhận Nề Nếp & Vi Phạm
              </h3>
              <p className="text-[11px] text-slate-500">
                Tuần {currentWeekId} · Quy chế thi đua chuẩn cấp THCS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body + Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Form Body (Cuộn mượt mà bên trong, không bao giờ tràn màn hình) */}
          <div className="overflow-y-auto flex-1 p-5 space-y-3.5 text-xs">
            {/* Permission Info Banner */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                {currentAccount ? (
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span>{currentAccount.role === 'gvcn' ? 'Giáo viên:' : 'Học sinh chấm điểm:'}</span>
                    <strong className="text-indigo-950 font-black text-xs sm:text-sm bg-white px-2 py-0.5 rounded border border-indigo-200">
                      {currentAccount.displayName}
                    </strong>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.badgeColor}`}>
                      {currentAccount.title}
                    </span>
                  </span>
                ) : (
                  <>
                    <span>Quyền nhập:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.badgeColor}`}>
                      {badge.badgeText}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{badge.scopeText}</span>
            </div>

            {/* Banner gợi ý điều chỉnh nếu đã cho nhầm */}
            {onOpenAdjustScore && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-900 font-semibold text-[11px]">
                    Lỡ cho điểm cộng hoặc điểm trừ bị nhầm?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdjustScore(currentStudent || undefined);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  Sửa / Điều Chỉnh →
                </button>
              </div>
            )}

            {/* Lọc nhanh theo nhóm & chọn học sinh */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Học sinh được ghi nhận</label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-medium">Nhóm:</span>
                  {[1, 2, 3, 4, 5, 6].map((g) => {
                    const isGroupAllowed = allowedGroups.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        disabled={!isGroupAllowed}
                        onClick={() => {
                          setGroupFilter(g);
                          const firstInGroup = students.find((s) => s.groupId === g);
                          if (firstInGroup) setSelectedStudentId(firstInGroup.id);
                        }}
                        title={!isGroupAllowed ? `Bạn chỉ được quyền nhập Nhóm ${allowedGroups.join(', ')}` : undefined}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                          !isGroupAllowed
                            ? 'opacity-30 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : groupFilter === g
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        N{g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {filteredStudents.length === 0 ? (
                  <option value="">(Không có học sinh phù hợp trong nhóm này)</option>
                ) : (
                  filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stt}. {s.name} (Nhóm {s.groupId} - {s.role || 'Học sinh'})
                    </option>
                  ))
                )}
              </select>

              {/* Cảnh báo nếu học sinh nằm ngoài quyền */}
              {!isStudentAllowed && currentStudent && (
                <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>
                    <strong>Không được phép:</strong> Bạn chỉ được nhập học sinh thuộc <strong>Nhóm {allowedGroups.join(', ')}</strong>. Học sinh này thuộc Nhóm {currentStudent.groupId}.
                  </span>
                </div>
              )}
            </div>

            {/* Chọn ngữ cảnh: Chính khóa, 15p đầu giờ, hay Trái buổi */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Thời điểm / Buổi ghi nhận
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionContext('standard')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                    sessionContext === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-2xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold">Chính khóa</span>
                  <span className="text-[10px] text-slate-500">Tiết học trên lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionContext('morning')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                    sessionContext === 'morning'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-2xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    15p đầu giờ
                  </span>
                  <span className="text-[10px] text-slate-500">Truy bài & tác phong</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionContext('afternoon')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                    sessionContext === 'afternoon'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-2xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    <SunMoon className="w-3 h-3 text-amber-600" />
                    Trái buổi
                  </span>
                  <span className="text-[10px] text-slate-500">Thể dục / Tin học</span>
                </button>
              </div>
            </div>

            {/* Chọn thứ nếu là 15p hoặc trái buổi */}
            {sessionContext !== 'standard' && (
              <div className="grid grid-cols-2 gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Ngày trong tuần
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) =>
                      setDayOfWeek(
                        e.target.value as 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7'
                      )
                    }
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                  >
                    <option value="Thứ 2">Thứ 2</option>
                    <option value="Thứ 3">Thứ 3</option>
                    <option value="Thứ 4">Thứ 4</option>
                    <option value="Thứ 5">Thứ 5</option>
                    <option value="Thứ 6">Thứ 6</option>
                    <option value="Thứ 7">Thứ 7</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {sessionContext === 'morning' ? 'Nội dung kiểm tra' : 'Môn trái buổi'}
                  </label>
                  <input
                    type="text"
                    value={sessionDetail}
                    onChange={(e) => setSessionDetail(e.target.value)}
                    placeholder={
                      sessionContext === 'morning' ? 'VD: Truy bài môn Văn...' : 'VD: Thể dục chiều...'
                    }
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Chọn Tiêu chí đánh giá */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Hành vi nề nếp / Tiêu chí điểm ({availableCriteria.length} tiêu chí khả dụng)
                </label>
                {availableCriteria.length < CRITERIA_LIST.length && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Lọc theo quyền chuyên trách
                  </span>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                {availableCriteria.map((crit) => {
                  const isSelected = selectedKey === crit.key;
                  return (
                    <div
                      key={crit.key}
                      onClick={() => setSelectedKey(crit.key)}
                      className={`p-2 rounded-lg cursor-pointer border flex items-center justify-between transition-all ${
                        isSelected
                          ? crit.isBonus
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs flex items-center gap-1.5">
                          <span>{crit.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({crit.categoryLabel})</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal line-clamp-1">
                          {crit.description}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded tabular-nums shrink-0 ${
                          crit.isBonus
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {crit.points > 0 ? `+${crit.points}đ` : `${crit.points}đ`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Số lần & Ghi chú */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số lần</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold p-2 bg-white border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú chi tiết</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Tiết 2 Sinh học, quên sách..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tóm tắt điểm thay đổi */}
            {currentCriterion && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-medium ${
                  currentCriterion.isBonus
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span>
                  {currentStudent?.name} ({currentCriterion.name} × {quantity} lần)
                </span>
                <span className="font-bold font-mono text-sm tabular-nums">
                  {currentCriterion.isBonus ? '+' : ''}
                  {currentCriterion.points * quantity} điểm
                </span>
              </div>
            )}
          </div>

          {/* Footer (Cố định ở dưới, luôn nhìn thấy nút bấm) */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-200 bg-slate-50/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                canSubmit
                  ? 'text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer'
                  : 'text-slate-400 bg-slate-200 cursor-not-allowed'
              }`}
            >
              {!canSubmit && <Lock className="w-3.5 h-3.5" />}
              <span>Lưu Ghi Nhận</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
