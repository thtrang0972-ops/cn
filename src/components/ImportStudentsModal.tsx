import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  ClipboardList,
  Sparkles,
  Users,
  Check,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Crown,
  ChevronDown,
} from 'lucide-react';
import { Student } from '../types/discipline';
import {
  RawImportStudent,
  GroupAllocationStrategy,
  downloadSampleExcelTemplate,
  parseExcelOrCsvFile,
  parsePastedStudentText,
  allocateStudentsTo6Groups,
} from '../utils/excelImport';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudents: Student[];
  onApplyNewRoster: (newStudents: Student[]) => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  currentStudents,
  onApplyNewRoster,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [rawStudents, setRawStudents] = useState<RawImportStudent[]>([]);
  const [allocationStrategy, setAllocationStrategy] =
    useState<GroupAllocationStrategy>('genderBalanced');
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Khi có rawStudents hoặc thay đổi chiến lược phân chia, tự động cập nhật preview
  const recalculatePreview = (
    rawList: RawImportStudent[],
    strategy: GroupAllocationStrategy
  ) => {
    if (rawList.length === 0) {
      setPreviewStudents([]);
      return;
    }
    const allocated = allocateStudentsTo6Groups(rawList, strategy);
    setPreviewStudents(allocated);
  };

  // Xử lý upload file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setUploadedFileName(file.name);

    try {
      const parsed = await parseExcelOrCsvFile(file);
      if (parsed.length === 0) {
        setErrorMsg('Không tìm thấy danh sách học sinh hợp lệ trong file. Vui lòng kiểm tra lại cấu trúc file.');
        setRawStudents([]);
        setPreviewStudents([]);
      } else {
        setRawStudents(parsed);
        // Kiểm tra xem trong file có sẵn cột nhóm 1-6 không
        const hasExistingGroups = parsed.some((s) => s.groupId && s.groupId >= 1 && s.groupId <= 6);
        const strategyToUse = hasExistingGroups ? 'keepExisting' : allocationStrategy;
        if (hasExistingGroups) {
          setAllocationStrategy('keepExisting');
        }
        recalculatePreview(parsed, strategyToUse);
      }
    } catch (err: any) {
      setErrorMsg(`Lỗi khi đọc file: ${err?.message || 'Định dạng file không được hỗ trợ.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý dán văn bản
  const handleParsePastedText = () => {
    if (!pasteText.trim()) {
      setErrorMsg('Vui lòng dán danh sách học sinh vào ô bên dưới.');
      return;
    }

    setErrorMsg(null);
    const parsed = parsePastedStudentText(pasteText);
    if (parsed.length === 0) {
      setErrorMsg('Không tìm thấy họ tên học sinh hợp lệ từ văn bản dán.');
      setRawStudents([]);
      setPreviewStudents([]);
    } else {
      setRawStudents(parsed);
      recalculatePreview(parsed, allocationStrategy);
    }
  };

  // Đổi chiến lược phân chia nhóm
  const handleStrategyChange = (newStrategy: GroupAllocationStrategy) => {
    setAllocationStrategy(newStrategy);
    if (rawStudents.length > 0) {
      recalculatePreview(rawStudents, newStrategy);
    }
  };

  // Chuyển nhóm cho 1 học sinh trong preview
  const handleChangeStudentGroup = (studentId: string, newGroupId: number) => {
    setPreviewStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, groupId: newGroupId } : s))
    );
  };

  // Chỉ định nhóm trưởng
  const handleSetLeader = (studentId: string, groupId: number) => {
    setPreviewStudents((prev) =>
      prev.map((s) => {
        if (s.groupId === groupId) {
          if (s.id === studentId) {
            return { ...s, isLeader: true, role: `Nhóm trưởng ${groupId}` };
          } else if (s.isLeader) {
            return { ...s, isLeader: false, role: 'Học sinh' };
          }
        }
        return s;
      })
    );
  };

  // Xác nhận áp dụng
  const handleApply = () => {
    if (previewStudents.length === 0) return;
    onApplyNewRoster(previewStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập Danh Sách Học Sinh & Phân Chia 6 Nhóm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập file Excel từ máy tính hoặc dán danh sách để hệ thống tự động chia nhóm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút Tải file Excel mẫu */}
            <button
              onClick={downloadSampleExcelTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs"
              title="Tải về file Excel mẫu có định dạng chuẩn THCS"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Excel mẫu</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Tab chọn cách nhập: Upload File vs Dán Text */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải lên file Excel / CSV</span>
              </button>
              <button
                onClick={() => setInputMode('paste')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  inputMode === 'paste'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Dán danh sách văn bản (Copy & Paste)</span>
              </button>
            </div>

            {rawStudents.length > 0 && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Đã nhận diện: {rawStudents.length} học sinh
              </span>
            )}
          </div>

          {/* Khung nhập liệu tương ứng */}
          {inputMode === 'upload' ? (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  {uploadedFileName
                    ? `File đã chọn: ${uploadedFileName}`
                    : 'Bấm vào đây để chọn file Excel (.xlsx, .xls, .csv)'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ file xuất từ VnEdu, SMAS, Google Sheets hoặc theo file Excel mẫu của trường
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Dán danh sách học sinh vào đây... (Ví dụ:&#10;1. Nguyễn Văn An - Nam&#10;2. Trần Bảo Anh - Nữ&#10;3. Lê Minh Châu - Nam...)"
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Phân tích & Chia vào 6 nhóm</span>
                </button>
              </div>
            </div>
          )}

          {/* Thông báo lỗi nếu có */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Phần Chọn Chiến Lược Phân Chia 6 Nhóm */}
          {previewStudents.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Thuật toán phân chia vào 6 nhóm (Nhóm 1 đến Nhóm 6)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Chọn cách phân bổ học sinh vào 6 nhóm sao cho phù hợp với thi đua lớp
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  <select
                    value={allocationStrategy}
                    onChange={(e) =>
                      handleStrategyChange(e.target.value as GroupAllocationStrategy)
                    }
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="genderBalanced">⚖️ Cân bằng giới tính Nam / Nữ</option>
                    <option value="roundRobin">🔄 Chia vòng tròn (1, 2, 3, 4, 5, 6...)</option>
                    <option value="sequential">📊 Chia theo thứ tự khối STT</option>
                    <option value="keepExisting">📑 Giữ nguyên nhóm theo file Excel</option>
                    <option value="random">🎲 Chia ngẫu nhiên</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bảng Xem Trước Phân Bổ 6 Nhóm (Preview 6 Groups Grid) */}
          {previewStudents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Xem trước phân bổ 6 Nhóm ({previewStudents.length} học sinh)
                </h4>
                <span className="text-[11px] text-slate-500">
                  💡 Bấm vào huy hiệu để đổi nhóm hoặc chọn Nhóm trưởng
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((g) => {
                  const members = previewStudents.filter((s) => s.groupId === g);
                  const maleCount = members.filter((s) => s.gender === 'Nam').length;
                  const femaleCount = members.filter((s) => s.gender === 'Nữ').length;

                  return (
                    <div
                      key={g}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 flex flex-col justify-between"
                    >
                      {/* Tiêu đề nhóm */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {g}
                          </span>
                          <span className="text-xs font-bold text-slate-900">Nhóm {g}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 font-mono">
                          {members.length} HS ({maleCount} Nam · {femaleCount} Nữ)
                        </span>
                      </div>

                      {/* Danh sách học sinh trong nhóm */}
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {members.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 text-xs transition-colors"
                          >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {s.isLeader ? (
                                <span title="Nhóm trưởng">
                                  <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetLeader(s.id, g)}
                                  className="text-slate-300 hover:text-amber-500 shrink-0"
                                  title="Bấm để chọn làm Nhóm trưởng"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <span className="font-medium text-slate-800 truncate" title={s.name}>
                                {s.name}
                              </span>
                              <span
                                className={`text-[10px] px-1 rounded shrink-0 ${
                                  s.gender === 'Nam'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-pink-100 text-pink-700'
                                }`}
                              >
                                {s.gender}
                              </span>
                            </div>

                            {/* Dropdown đổi nhóm */}
                            <select
                              value={s.groupId}
                              onChange={(e) =>
                                handleChangeStudentGroup(s.id, Number(e.target.value))
                              }
                              className="text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 cursor-pointer text-slate-600 focus:outline-none"
                              title="Chuyển sang nhóm khác"
                            >
                              {[1, 2, 3, 4, 5, 6].map((targetG) => (
                                <option key={targetG} value={targetG}>
                                  N{targetG}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/70 shrink-0">
          <div className="text-xs text-slate-500">
            {previewStudents.length > 0 ? (
              <span>
                Tổng cộng:{' '}
                <strong className="text-slate-900 font-mono">{previewStudents.length}</strong> học
                sinh đã được phân bổ vào 6 nhóm
              </span>
            ) : (
              <span>Chưa chọn file hoặc danh sách học sinh</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              disabled={previewStudents.length === 0}
              onClick={handleApply}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
                previewStudents.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng danh sách vào lớp học</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
