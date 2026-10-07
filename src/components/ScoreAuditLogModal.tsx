import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  User,
  Users,
} from 'lucide-react';
import { ScoreAdjustmentLog, UserRoleType, WeekInfo, Student } from '../types/discipline';

interface ScoreAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ScoreAdjustmentLog[];
  currentRole: UserRoleType;
  currentWeekId: number;
  weeks: WeekInfo[];
  students: Student[];
  onClearLogs?: () => void;
  onDeleteLog?: (logId: string) => void;
  onDeduplicateLogs?: () => void;
}

export const ScoreAuditLogModal: React.FC<ScoreAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  currentRole,
  currentWeekId,
  weeks,
  students,
  onClearLogs,
  onDeleteLog,
  onDeduplicateLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'BONUS' | 'PENALTY'>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // BẢO MẬT: Chỉ Giáo viên chủ nhiệm mới có quyền xem nhật ký này
  if (currentRole !== 'gvcn') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Quyền Riêng Tư Của Giáo Viên Chủ Nhiệm
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
              Nhật ký chỉnh sửa điểm nề nếp chứa thông tin giám sát nhạy cảm và được bảo mật tuyệt đối.
              Chỉ tài khoản <strong>Giáo viên chủ nhiệm (GVCN)</strong> mới có quyền truy cập khu vực này.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đã hiểu và Đóng
          </button>
        </div>
      </div>
    );
  }

  // Lọc danh sách nhật ký
  const filteredLogs = logs.filter((log) => {
    // Lọc theo tuần
    if (selectedWeekFilter !== 'ALL' && log.weekId !== selectedWeekFilter) {
      return false;
    }

    // Lọc theo loại (cộng hay trừ)
    if (selectedTypeFilter === 'BONUS' && log.delta <= 0) {
      return false;
    }
    if (selectedTypeFilter === 'PENALTY' && log.delta >= 0) {
      return false;
    }

    // Tìm kiếm theo tên học sinh, lý do, người sửa
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = log.studentName.toLowerCase().includes(q);
      const matchReason = log.reason.toLowerCase().includes(q);
      const matchEditor = log.editorName.toLowerCase().includes(q);
      const matchCrit = log.criterionLabel.toLowerCase().includes(q);
      return matchName || matchReason || matchEditor || matchCrit;
    }

    return true;
  });

  // Thống kê nhanh
  const totalEdits = logs.length;
  const bonusEdits = logs.filter((l) => l.delta > 0).length;
  const penaltyEdits = logs.filter((l) => l.delta < 0).length;
  const uniqueStudents = new Set(logs.map((l) => l.studentId)).size;

  // Xuất file CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'STT',
      'Thời gian',
      'Tuần',
      'Tên học sinh',
      'Nhóm',
      'Tiêu chí',
      'Điểm cũ',
      'Điểm mới',
      'Thay đổi',
      'Lý do điều chỉnh',
      'Người sửa',
      'Chức vụ',
    ];

    const rows = logs.map((log, index) => [
      index + 1,
      log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '',
      `Tuần ${log.weekId}`,
      `"${log.studentName.replace(/"/g, '""')}"`,
      `Nhóm ${log.groupId}`,
      `"${log.criterionLabel.replace(/"/g, '""')}"`,
      log.oldValue,
      log.newValue,
      log.delta > 0 ? `+${log.delta}` : log.delta,
      `"${log.reason.replace(/"/g, '""')}"`,
      `"${log.editorName.replace(/"/g, '""')}"`,
      `"${log.editorRole.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nhat_Ky_Sua_Diem_Ne_Nep_GVCN_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center font-black shadow-md shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Nhật Ký Chỉnh Sửa Điểm Nề Nếp
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Chỉ GVCN thấy
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Ghi nhận minh bạch mọi thao tác sửa điểm, hủy điểm nhầm, cộng/trừ bổ sung của từng học sinh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thống kê nhanh số liệu */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-5 sm:px-6 py-3 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tổng lượt sửa</p>
              <p className="text-lg font-black text-slate-900 font-mono mt-0.5">{totalEdits}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Tăng / Thêm điểm</p>
              <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">{bonusEdits}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Giảm / Hủy phạt</p>
              <p className="text-lg font-black text-rose-600 font-mono mt-0.5">{penaltyEdits}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Số HS liên quan</p>
              <p className="text-lg font-black text-indigo-600 font-mono mt-0.5">{uniqueStudents}</p>
            </div>
          </div>
        </div>

        {/* Thanh công cụ lọc & tìm kiếm */}
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, lý do, người sửa..."
              className="w-full text-xs font-semibold py-2 pl-8 pr-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Lọc tuần */}
            <select
              value={selectedWeekFilter}
              onChange={(e) => setSelectedWeekFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="text-xs font-bold py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs text-slate-800"
            >
              <option value="ALL">Mọi tuần</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  Tuần {w.id}
                </option>
              ))}
            </select>

            {/* Lọc loại thay đổi */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
              className="text-xs font-bold py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs text-slate-800"
            >
              <option value="ALL">Tất cả thay đổi</option>
              <option value="BONUS">Điểm tăng (+)</option>
              <option value="PENALTY">Điểm giảm (-)</option>
            </select>

            {/* Nút bỏ bớt mục trùng lặp */}
            {onDeduplicateLogs && logs.length > 1 && (
              <button
                type="button"
                onClick={onDeduplicateLogs}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
                title="Tự động rà soát và loại bỏ các bản ghi nhật ký sửa điểm bị trùng lặp"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Bỏ bớt mục trùng</span>
              </button>
            )}

            {/* Xuất file CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Xuất file Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Nội dung bảng lịch sử cuộn mượt mà */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[220px]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Chưa có nhật ký chỉnh sửa nào</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {logs.length === 0
                  ? 'Khi có bất kỳ ai điều chỉnh, thêm hoặc bớt điểm nề nếp bị nhầm, hệ thống sẽ tự động lưu vết tại đây cho GVCN.'
                  : 'Không tìm thấy bản ghi nào phù hợp với bộ lọc hiện tại.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const isBonus = log.delta > 0;
                const dateStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'Gần đây';

                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    {/* Thông tin học sinh & thời gian */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm shadow-2xs ${
                          isBonus
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isBonus ? '+' : '−'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {log.studentName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Nhóm {log.groupId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Tuần {log.weekId}
                          </span>
                        </div>

                        {/* Tiêu chí và biến động */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-slate-700">
                          <span className="font-bold text-slate-800">{log.criterionLabel}:</span>
                          <div className="flex items-center gap-1 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            <span>{log.oldValue}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={isBonus ? 'text-emerald-700' : 'text-rose-700'}>
                              {log.newValue}
                            </span>
                          </div>
                          <span
                            className={`font-black text-[11px] px-1.5 py-0.2 rounded ${
                              isBonus
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isBonus ? `+${log.delta}` : log.delta}
                          </span>
                        </div>

                        {/* Lý do chỉnh sửa */}
                        <p className="text-[11px] text-slate-600 mt-1 italic flex items-center gap-1">
                          <span className="font-semibold not-italic text-slate-500">Lý do:</span>
                          <span>"{log.reason || 'Điều chỉnh điểm'}"</span>
                        </p>
                      </div>
                    </div>

                    {/* Người thực hiện, ngày giờ & Nút xóa bản ghi bị trùng */}
                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex items-center sm:items-end justify-between sm:justify-center gap-3">
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-indigo-600" />
                          {log.editorName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {log.editorRole && `(${log.editorRole}) · `}
                          {dateStr}
                        </span>
                      </div>

                      {/* Nút xóa 1 bản ghi (giúp người dùng bỏ bớt bản ghi bị trùng) */}
                      {onDeleteLog && (
                        <div>
                          {deletingId === log.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteLog(log.id);
                                  setDeletingId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                title="Xác nhận xóa bản ghi này"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(log.id)}
                              title="Bỏ bớt bản ghi này (nếu bị trùng lặp)"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            {onClearLogs && logs.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-700 font-bold">Xác nhận xóa hết nhật ký?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClearLogs();
                        setConfirmClear(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Xóa vĩnh viễn
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa toàn bộ nhật ký</span>
                  </button>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
