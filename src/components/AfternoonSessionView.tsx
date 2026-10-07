import React, { useState, useEffect } from 'react';
import {
  SunMoon,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Dumbbell,
  Laptop,
  Users,
} from 'lucide-react';
import {
  Student,
  AfternoonRecord,
  AfternoonSessionType,
  AfternoonViolationType,
  UserRoleType,
  UserAccount,
} from '../types/discipline';
import { canRecordAfternoon } from '../utils/permissions';
import { formatDateVN } from '../utils/date';
import { Lock, ShieldCheck } from 'lucide-react';

interface AfternoonSessionViewProps {
  students: Student[];
  records: AfternoonRecord[];
  currentWeekId: number;
  currentWeekName: string;
  currentRole?: UserRoleType;
  assignedGroupIds?: number[];
  currentAccount?: UserAccount;
  onAddAfternoonRecord: (rec: Omit<AfternoonRecord, 'id' | 'createdAt'>) => void;
  onDeleteAfternoonRecord: (id: string) => void;
}

const AFTERNOON_SUBJECTS: {
  type: AfternoonSessionType;
  label: string;
  icon: any;
}[] = [
  { type: 'TheDuc', label: 'Thể dục sân bãi', icon: Dumbbell },
  { type: 'TinHoc', label: 'Tin học thực hành máy', icon: Laptop },
  { type: 'PhuDao', label: 'Phụ đạo củng cố kiến thức', icon: BookOpen },
  { type: 'HDTN', label: 'Hoạt động trải nghiệm & HN', icon: Users },
  { type: 'BoiDuong', label: 'Bồi dưỡng học sinh giỏi', icon: BookOpen },
  { type: 'GDDP', label: 'Giáo dục địa phương', icon: BookOpen },
  { type: 'Khac', label: 'Hoạt động trái buổi khác', icon: SunMoon },
];

const AFTERNOON_VIOLATIONS: {
  type: AfternoonViolationType;
  label: string;
  points: number;
}[] = [
  { type: 'vangKP', label: 'Vắng học không phép trái buổi', points: -4 },
  { type: 'vangCP', label: 'Vắng học có phép', points: -2 },
  { type: 'boTiet', label: 'Bỏ tiết / trốn về sớm giữa buổi', points: -2 },
  { type: 'diTre', label: 'Đi trễ buổi học chiều (>15 phút)', points: -2 },
  { type: 'khongDongPhuc', label: 'Không mặc đúng đồng phục Thể dục / quy định', points: -2 },
  { type: 'khongMangDungCu', label: 'Không mang giày ba-ta / sách vở / dụng cụ thực hành', points: -2 },
  { type: 'matTratTu', label: 'Mất trật tự trong phòng máy / sân thể thao', points: -2 },
  { type: 'khac', label: 'Vi phạm quy chế trái buổi khác', points: -2 },
];

export const AfternoonSessionView: React.FC<AfternoonSessionViewProps> = ({
  students,
  records,
  currentWeekId,
  currentWeekName,
  currentRole = 'gvcn',
  assignedGroupIds,
  currentAccount,
  onAddAfternoonRecord,
  onDeleteAfternoonRecord,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');

  // Lọc học sinh được quyền điểm danh trái buổi
  const eligibleStudents = students.filter((s) => {
    return canRecordAfternoon(currentRole, s.groupId, assignedGroupIds).allowed;
  });

  // Form state
  const [studentId, setStudentId] = useState(eligibleStudents[0]?.id || students[0]?.id || '');

  useEffect(() => {
    if (eligibleStudents.length > 0 && !eligibleStudents.some((s) => s.id === studentId)) {
      setStudentId(eligibleStudents[0].id);
    }
  }, [eligibleStudents, studentId]);
  const [dayOfWeek, setDayOfWeek] = useState<
    'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7'
  >('Thứ 3');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [subject, setSubject] = useState<AfternoonSessionType>('TheDuc');
  const [sessionName, setSessionName] = useState('Thể dục chiều Tiết 1-2');
  const [violationType, setViolationType] = useState<AfternoonViolationType>('diTre');
  const [note, setNote] = useState('');
  const [recordedBy, setRecordedBy] = useState(
    currentAccount ? `${currentAccount.displayName} (${currentAccount.title})` : 'Lớp phó Kỷ luật / GV bộ môn'
  );

  useEffect(() => {
    if (currentAccount) {
      setRecordedBy(`${currentAccount.displayName} (${currentAccount.title})`);
    }
  }, [currentAccount]);
  const [permError, setPermError] = useState<string | null>(null);

  // Lọc theo tuần hiện tại và môn
  const weekRecords = records.filter((r) => r.weekId === currentWeekId);
  const filteredRecords = weekRecords.filter((r) => {
    if (selectedSubjectFilter !== 'ALL' && r.subject !== selectedSubjectFilter) return false;
    return true;
  });

  // Thống kê theo nhóm
  const groupStats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  weekRecords.forEach((r) => {
    if (groupStats[r.groupId] !== undefined) {
      groupStats[r.groupId]++;
    }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPermError(null);
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const check = canRecordAfternoon(currentRole, st.groupId, assignedGroupIds);
    if (!check.allowed) {
      setPermError(check.reason || 'Bạn không có quyền điểm danh học sinh nhóm này');
      return;
    }

    const matchedSubject = AFTERNOON_SUBJECTS.find((s) => s.type === subject);
    const matchedVio = AFTERNOON_VIOLATIONS.find((v) => v.type === violationType);

    onAddAfternoonRecord({
      weekId: currentWeekId,
      date,
      dayOfWeek,
      sessionName: sessionName.trim() || 'Buổi chiều',
      subject,
      subjectLabel: matchedSubject ? matchedSubject.label : 'Trái buổi',
      studentId: st.id,
      studentName: st.name,
      groupId: st.groupId,
      violationType,
      violationLabel: matchedVio ? matchedVio.label : 'Vi phạm trái buổi',
      penaltyPoints: matchedVio ? matchedVio.points : -2,
      note: note.trim() || undefined,
      recordedBy: recordedBy.trim() || 'Ban cán sự',
    });

    setNote('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
              <SunMoon className="w-4 h-4" />
              <span>Chuyên Đề Học Trái Buổi THCS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Quản Lý Nề Nếp & Điểm Danh Học Trái Buổi · {currentWeekName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi các buổi chiều Thể dục, Tin học máy tính, Phụ đạo, Hoạt động trải nghiệm
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {currentAccount && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {currentAccount.role === 'gvcn' ? 'Giáo viên:' : 'Học sinh điểm danh:'}{' '}
                  <strong className="text-amber-950 font-black">{currentAccount.displayName}</strong>{' '}
                  <span className="text-amber-700 font-bold">({currentAccount.title})</span>
                </span>
              </div>
            )}
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isFormOpen ? 'Đóng biểu mẫu' : 'Ghi nhận trái buổi'}</span>
            </button>
          </div>
        </div>

        {/* Tổng quan nề nếp trái buổi 6 nhóm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map((g) => {
            const count = groupStats[g];
            return (
              <div
                key={g}
                className={`p-3 rounded-lg border text-center transition-all ${
                  count === 0
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : count === 1
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}
              >
                <div className="text-xs font-bold">Nhóm {g}</div>
                <div className="text-xl font-bold font-mono my-1 tabular-nums">
                  {count} <span className="text-[11px] font-normal">vi phạm</span>
                </div>
                <div className="text-[10px]">
                  {count === 0 ? (
                    <span className="text-emerald-700 font-semibold">Đủ sĩ số 100%</span>
                  ) : (
                    <span className="text-rose-600 font-medium">Bị trừ điểm</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form ghi nhận trái buổi */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <SunMoon className="w-4 h-4 text-amber-600" />
              Ghi Nhận Điểm Danh & Nề Nếp Học Trái Buổi
            </h3>
            <span className="text-xs text-amber-800 font-medium">Tự động liên kết vào Bảng điểm tuần</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Thứ trong tuần */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày học trái buổi
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) =>
                  setDayOfWeek(
                    e.target.value as 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7'
                  )
                }
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Thứ 2">Thứ 2 Chiều</option>
                <option value="Thứ 3">Thứ 3 Chiều (Thể dục)</option>
                <option value="Thứ 4">Thứ 4 Chiều (Phụ đạo)</option>
                <option value="Thứ 5">Thứ 5 Chiều (Tin học)</option>
                <option value="Thứ 6">Thứ 6 Chiều (HĐTN)</option>
                <option value="Thứ 7">Thứ 7 Chiều (Bồi dưỡng)</option>
              </select>
            </div>

            {/* Môn học trái buổi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Môn / Hoạt động
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  const val = e.target.value as AfternoonSessionType;
                  setSubject(val);
                  const matched = AFTERNOON_SUBJECTS.find((s) => s.type === val);
                  if (matched) setSessionName(matched.label);
                }}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {AFTERNOON_SUBJECTS.map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Học sinh */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Học sinh vi phạm / Vắng ({eligibleStudents.length} học sinh trong quyền)
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {eligibleStudents.length === 0 ? (
                  <option value="">(Không có học sinh trong quyền)</option>
                ) : (
                  eligibleStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stt}. {s.name} (Nhóm {s.groupId})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Loại vi phạm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hành vi vi phạm
              </label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value as AfternoonViolationType)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {AFTERNOON_VIOLATIONS.map((v) => (
                  <option key={v.type} value={v.type}>
                    {v.label} ({v.points}đ)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chi tiết buổi học / Tiết
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="VD: Thể dục Tiết 1-2 Chiều, Tin học thực hành..."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú / Người phát hiện
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Tập trung muộn 15p, thiếu giày thể thao..."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {permError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{permError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors"
            >
              Lưu Vi Phạm Trái Buổi
            </button>
          </div>
        </form>
      )}

      {/* Danh sách ghi nhận trái buổi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Nhật Ký Học Trái Buổi ({filteredRecords.length} lượt ghi nhận)
            </h3>
          </div>

          {/* Lọc theo môn học */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedSubjectFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                selectedSubjectFilter === 'ALL'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả các môn
            </button>
            {AFTERNOON_SUBJECTS.slice(0, 4).map((s) => (
              <button
                key={s.type}
                onClick={() => setSelectedSubjectFilter(s.type)}
                className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  selectedSubjectFilter === s.type
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Không có vi phạm học trái buổi</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Toàn bộ học sinh tham gia đầy đủ các buổi học thể dục, thực hành tin học và phụ đạo buổi chiều.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-4 w-12">STT</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-4">Buổi học</th>
                  <th className="py-2.5 px-4">Học sinh vi phạm</th>
                  <th className="py-2.5 px-3">Nhóm</th>
                  <th className="py-2.5 px-4">Lỗi vi phạm</th>
                  <th className="py-2.5 px-3 text-center text-rose-600">Trừ</th>
                  <th className="py-2.5 px-4">Ghi nhận bởi</th>
                  <th className="py-2.5 px-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">{r.dayOfWeek}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDateVN(r.date)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{r.sessionName}</span>
                      <span className="text-[10px] text-slate-500">{r.subjectLabel}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.studentName}</div>
                      {r.note && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">{r.note}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Nhóm {r.groupId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {r.violationLabel}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-600 tabular-nums">
                      {r.penaltyPoints}đ
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {r.recordedBy}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteAfternoonRecord(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Xóa biên bản này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
