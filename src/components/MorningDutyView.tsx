import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Filter,
  User,
} from 'lucide-react';
import {
  Student,
  MorningDutyRecord,
  MorningDutyType,
  GroupSummary,
  UserRoleType,
  UserAccount,
} from '../types/discipline';
import { canRecordMorningDuty, getRolePermissionBadge } from '../utils/permissions';
import { formatDateVN } from '../utils/date';
import { Lock } from 'lucide-react';

interface MorningDutyViewProps {
  students: Student[];
  records: MorningDutyRecord[];
  currentWeekId: number;
  currentWeekName: string;
  currentRole?: UserRoleType;
  assignedGroupIds?: number[];
  currentAccount?: UserAccount;
  onAddMorningRecord: (rec: Omit<MorningDutyRecord, 'id' | 'createdAt'>) => void;
  onDeleteMorningRecord: (id: string) => void;
}

const MORNING_VIOLATION_TYPES: {
  type: MorningDutyType;
  label: string;
  points: number;
  category: string;
}[] = [
  {
    type: 'truyBai',
    label: 'Chưa học bài / Chưa làm bài tập về nhà (KTB/KLB)',
    points: -2,
    category: 'Học tập 15p',
  },
  {
    type: 'khanQuangPhuHieu',
    label: 'Quên khăn quàng đỏ / Không đeo phù hiệu',
    points: -2,
    category: 'Tác phong Đội',
  },
  {
    type: 'dongPhuc',
    label: 'Sai đồng phục / Đi dép lê không quai hậu',
    points: -2,
    category: 'Tác phong',
  },
  {
    type: 'diTre15p',
    label: 'Đến lớp sau trống 15 phút đầu giờ (Đi trễ)',
    points: -2,
    category: 'Chuyên cần',
  },
  {
    type: 'veSinhLop',
    label: 'Bảng chưa lau / Bàn ghế xộc xệch / Rác hộc bàn',
    points: -2,
    category: 'Vệ sinh',
  },
  {
    type: 'matTratTu15p',
    label: 'Gây ồn ào, mất trật tự trong giờ truy bài',
    points: -2,
    category: 'Kỷ luật',
  },
  {
    type: 'khac',
    label: 'Vi phạm khác trong 15 phút đầu giờ',
    points: -2,
    category: 'Khác',
  },
];

export const MorningDutyView: React.FC<MorningDutyViewProps> = ({
  students,
  records,
  currentWeekId,
  currentWeekName,
  currentRole = 'gvcn',
  assignedGroupIds,
  currentAccount,
  onAddMorningRecord,
  onDeleteMorningRecord,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Học sinh được phép ghi nhận
  const eligibleStudents = students.filter((s) => {
    if (currentRole === 'gvcn' || currentRole === 'lopTruong') return true;
    if (currentRole === 'lopPhoHocTap' || currentRole === 'lopPhoLaoDong' || currentRole === 'lopPhoTratTu') return true;
    if (currentRole.startsWith('nhomTruong')) {
      if (assignedGroupIds && assignedGroupIds.length > 0) return assignedGroupIds.includes(s.groupId);
      const g = parseInt(currentRole.replace('nhomTruong', ''), 10);
      return s.groupId === g;
    }
    return true;
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
  >('Thứ 2');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [violationType, setViolationType] = useState<MorningDutyType>('truyBai');
  const [note, setNote] = useState('');
  const [recordedBy, setRecordedBy] = useState(
    currentAccount ? `${currentAccount.displayName} (${currentAccount.title})` : 'Đội Sao đỏ / Ban cán sự'
  );

  useEffect(() => {
    if (currentAccount) {
      setRecordedBy(`${currentAccount.displayName} (${currentAccount.title})`);
    }
  }, [currentAccount]);
  const [permError, setPermError] = useState<string | null>(null);

  // Lọc danh sách theo tuần hiện tại và ngày
  const weekRecords = records.filter((r) => r.weekId === currentWeekId);
  const filteredRecords = weekRecords.filter((r) => {
    if (selectedDay !== 'ALL' && r.dayOfWeek !== selectedDay) return false;
    return true;
  });

  // Thống kê vi phạm 15 phút đầu giờ theo nhóm
  const groupViolationsCount: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  weekRecords.forEach((r) => {
    if (groupViolationsCount[r.groupId] !== undefined) {
      groupViolationsCount[r.groupId]++;
    }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPermError(null);
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const check = canRecordMorningDuty(currentRole, violationType, st.groupId, assignedGroupIds);
    if (!check.allowed) {
      setPermError(check.reason || 'Bạn không có quyền ghi nhận vi phạm này');
      return;
    }

    const matchedViolation = MORNING_VIOLATION_TYPES.find((v) => v.type === violationType);
    const label = matchedViolation ? matchedViolation.label : 'Vi phạm 15 phút đầu giờ';
    const penalty = matchedViolation ? matchedViolation.points : -2;

    onAddMorningRecord({
      weekId: currentWeekId,
      date,
      dayOfWeek,
      studentId: st.id,
      studentName: st.name,
      groupId: st.groupId,
      violationType,
      violationLabel: label,
      penaltyPoints: penalty,
      note: note.trim() || undefined,
      recordedBy: recordedBy.trim() || 'Cờ đỏ',
    });

    setNote('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner Giới thiệu chức năng 15p đầu giờ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Chuyên Đề Nề Nếp THCS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Theo Dõi & Ghi Nhận 15 Phút Đầu Giờ · {currentWeekName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra truy bài kiến thức, khăn quàng đỏ, tác phong đồng phục, vệ sinh phòng học trước tiết 1
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {currentAccount && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {currentAccount.role === 'gvcn' ? 'Giáo viên:' : 'Học sinh trực nề nếp:'}{' '}
                  <strong className="text-blue-950 font-black">{currentAccount.displayName}</strong>{' '}
                  <span className="text-blue-700 font-bold">({currentAccount.title})</span>
                </span>
              </div>
            )}
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isFormOpen ? 'Đóng biểu mẫu' : 'Ghi nhận 15p đầu giờ'}</span>
            </button>
          </div>
        </div>

        {/* Thống kê vi phạm 15 phút đầu giờ theo 6 nhóm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map((g) => {
            const count = groupViolationsCount[g];
            return (
              <div
                key={g}
                className={`p-3 rounded-lg border text-center transition-all ${
                  count === 0
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : count <= 2
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}
              >
                <div className="text-xs font-bold">Nhóm {g}</div>
                <div className="text-xl font-bold font-mono my-1 tabular-nums">
                  {count} <span className="text-[11px] font-normal">lỗi</span>
                </div>
                <div className="text-[10px]">
                  {count === 0 ? (
                    <span className="text-emerald-700 font-semibold">Xuất sắc 100%</span>
                  ) : (
                    <span className="text-rose-600 font-medium">-{count * 2} điểm</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form thêm ghi nhận nhanh */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Ghi Nhận Vi Phạm 15 Phút Đầu Giờ (Đội Cờ Đỏ / Sao Đỏ)
            </h3>
            <span className="text-xs text-indigo-700 font-medium">Tự động liên kết vào Bảng điểm tuần</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Thứ trong tuần */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày trong tuần
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) =>
                  setDayOfWeek(
                    e.target.value as 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7'
                  )
                }
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Thứ 2">Thứ 2 (Chào cờ đầu tuần)</option>
                <option value="Thứ 3">Thứ 3</option>
                <option value="Thứ 4">Thứ 4</option>
                <option value="Thứ 5">Thứ 5</option>
                <option value="Thứ 6">Thứ 6</option>
                <option value="Thứ 7">Thứ 7 (Sinh hoạt cuối tuần)</option>
              </select>
            </div>

            {/* Học sinh vi phạm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Học sinh vi phạm ({eligibleStudents.length} học sinh trong quyền)
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Nội dung vi phạm 15p */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lỗi vi phạm 15p
              </label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value as MorningDutyType)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MORNING_VIOLATION_TYPES.map((v) => (
                  <option key={v.type} value={v.type}>
                    {v.label} ({v.points}đ)
                  </option>
                ))}
              </select>
            </div>

            {/* Người ghi nhận */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người kiểm tra / Cờ đỏ
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="VD: Cờ đỏ Nhóm 1, Lớp phó..."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú chi tiết (nếu có)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Quên khăn quàng, chưa làm 2 bài tập Đại số trang 45..."
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
            >
              Lưu Vi Phạm 15 Phút
            </button>
          </div>
        </form>
      )}

      {/* Danh sách vi phạm 15 phút đầu giờ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Thanh công cụ lọc ngày */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Biên Bản Ghi Nhận 15 Phút Đầu Giờ ({filteredRecords.length} biên bản)
            </h3>
          </div>

          {/* Lọc theo ngày trong tuần */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto scrollbar-none">
            {['ALL', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                  selectedDay === d
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d === 'ALL' ? 'Tất cả các ngày' : d}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Không có vi phạm 15 phút đầu giờ</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Toàn bộ học sinh trong lớp chấp hành nghiêm túc quy chế truy bài, khăn quàng đỏ, đồng phục và vệ sinh phòng học.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-4 w-12">STT</th>
                  <th className="py-2.5 px-3 w-24">Buổi / Ngày</th>
                  <th className="py-2.5 px-4">Học sinh vi phạm</th>
                  <th className="py-2.5 px-3">Nhóm</th>
                  <th className="py-2.5 px-4">Nội dung vi phạm 15p</th>
                  <th className="py-2.5 px-3 text-center text-rose-600">Trừ</th>
                  <th className="py-2.5 px-4">Người kiểm tra</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
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
                      <div className="font-semibold text-slate-900">{r.studentName}</div>
                      {r.note && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">{r.note}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Nhóm {r.groupId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
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
                        onClick={() => onDeleteMorningRecord(r.id)}
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
