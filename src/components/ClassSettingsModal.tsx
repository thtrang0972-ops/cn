import React, { useState, useEffect } from 'react';
import {
  X,
  School,
  Save,
  CheckCircle2,
  Calendar,
  GraduationCap,
  User,
  Users,
  Sparkles,
} from 'lucide-react';
import { ClassMetadata } from '../types/discipline';

interface ClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ClassMetadata;
  onUpdateMetadata: (meta: ClassMetadata) => void;
}

export const ClassSettingsModal: React.FC<ClassSettingsModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onUpdateMetadata,
}) => {
  const [schoolName, setSchoolName] = useState(metadata.schoolName || 'Trường TH và THCS Phước Hưng');
  const [className, setClassName] = useState(metadata.className || '9A3');
  const [grade, setGrade] = useState<number>(metadata.grade || 9);
  const [semester, setSemester] = useState<1 | 2>(metadata.semester || 1);
  const [academicYear, setAcademicYear] = useState(metadata.academicYear || '2026 - 2027');
  const [homeroomTeacher, setHomeroomTeacher] = useState(metadata.homeroomTeacher || 'Cô Nguyễn Thị Thuỳ Trang');
  const [monitorName, setMonitorName] = useState(metadata.monitorName || 'Trần Gia Hưng');
  const [academicViceMonitorName, setAcademicViceMonitorName] = useState(metadata.academicViceMonitorName || 'Nguyễn Thảo Linh');
  const [laborViceMonitorName, setLaborViceMonitorName] = useState(metadata.laborViceMonitorName || 'Bùi Quang Khải');
  const [disciplineViceMonitorName, setDisciplineViceMonitorName] = useState(
    metadata.disciplineViceMonitorName || metadata.viceMonitorName || 'Lê Hoàng Yến Nhi'
  );

  // 6 Nhóm trưởng phụ trách các nhóm
  const [leader1, setLeader1] = useState(metadata.groupLeaders?.[1] || 'Nguyễn Văn An');
  const [leader2, setLeader2] = useState(metadata.groupLeaders?.[2] || 'Đặng Ngọc Mai');
  const [leader3, setLeader3] = useState(metadata.groupLeaders?.[3] || 'Ngô Hồng Phúc');
  const [leader4, setLeader4] = useState(metadata.groupLeaders?.[4] || 'Phạm Thanh Tùng');
  const [leader5, setLeader5] = useState(metadata.groupLeaders?.[5] || 'Hoàng Kim Cúc');
  const [leader6, setLeader6] = useState(metadata.groupLeaders?.[6] || 'Đào Thu Hiền');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever modal opens or metadata updates
  useEffect(() => {
    if (isOpen) {
      setSchoolName(metadata.schoolName || 'Trường TH và THCS Phước Hưng');
      setClassName(metadata.className || '9A3');
      setGrade(metadata.grade || 9);
      setSemester(metadata.semester || 1);
      setAcademicYear(metadata.academicYear || '2026 - 2027');
      setHomeroomTeacher(metadata.homeroomTeacher || 'Cô Nguyễn Thị Thuỳ Trang');
      setMonitorName(metadata.monitorName || 'Trần Gia Hưng');
      setAcademicViceMonitorName(metadata.academicViceMonitorName || 'Nguyễn Thảo Linh');
      setLaborViceMonitorName(metadata.laborViceMonitorName || 'Bùi Quang Khải');
      setDisciplineViceMonitorName(
        metadata.disciplineViceMonitorName || metadata.viceMonitorName || 'Lê Hoàng Yến Nhi'
      );
      setLeader1(metadata.groupLeaders?.[1] || 'Nguyễn Văn An');
      setLeader2(metadata.groupLeaders?.[2] || 'Đặng Ngọc Mai');
      setLeader3(metadata.groupLeaders?.[3] || 'Ngô Hồng Phúc');
      setLeader4(metadata.groupLeaders?.[4] || 'Phạm Thanh Tùng');
      setLeader5(metadata.groupLeaders?.[5] || 'Hoàng Kim Cúc');
      setLeader6(metadata.groupLeaders?.[6] || 'Đào Thu Hiền');
      setSavedSuccess(false);
    }
  }, [isOpen, metadata]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMetadata({
      schoolName: schoolName.trim(),
      className: className.trim(),
      grade,
      semester,
      academicYear: academicYear.trim(),
      homeroomTeacher: homeroomTeacher.trim(),
      monitorName: monitorName.trim(),
      academicViceMonitorName: academicViceMonitorName.trim(),
      laborViceMonitorName: laborViceMonitorName.trim(),
      disciplineViceMonitorName: disciplineViceMonitorName.trim(),
      viceMonitorName: disciplineViceMonitorName.trim(),
      groupLeaders: {
        1: leader1.trim() || 'Nguyễn Văn An',
        2: leader2.trim() || 'Đặng Ngọc Mai',
        3: leader3.trim() || 'Ngô Hồng Phúc',
        4: leader4.trim() || 'Phạm Thanh Tùng',
        5: leader5.trim() || 'Hoàng Kim Cúc',
        6: leader6.trim() || 'Đào Thu Hiền',
      },
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const applyGradePreset = (g: number) => {
    setGrade(g);
    // Auto update class prefix if user has default like 8A1 -> 6A1
    if (/^[6-9][A-Za-z0-9]+$/.test(className)) {
      setClassName(`${g}${className.slice(1)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center shadow-md font-bold shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Cài Đặt Trường, Lớp, Năm Học & GVCN</span>
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Cập nhật đồng bộ trên thanh tiêu đề, sổ nề nếp tuần và phiếu in A4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Nhóm 1: Thông tin trường học & Năm học */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                1. Thông Tin Trường Học & Năm Học
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Bắt buộc</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên trường THCS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="VD: Trường TH và THCS Phước Hưng"
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                <span>Gợi ý nhanh:</span>
                {['TH và THCS Phước Hưng', 'THCS Phước Hưng', 'THCS Lê Quý Đôn', 'THCS Nguyễn Du'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSchoolName(`Trường ${s}`)}
                    className="px-2 py-0.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 rounded text-[10px] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Năm học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="VD: 2026 - 2027"
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  {['2025 - 2026', '2026 - 2027'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr)}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-indigo-100 text-slate-700 rounded text-[10px]"
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Học kỳ
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value={1}>Học kỳ I</option>
                  <option value={2}>Học kỳ II</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Thông tin lớp & Giáo viên chủ nhiệm */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                2. Lớp Học & Giáo Viên Chủ Nhiệm (GVCN)
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Bắt buộc</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khối cấp THCS
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[6, 7, 8, 9].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => applyGradePreset(g)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        grade === g
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      K{g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên lớp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="VD: 8A1, 9A2..."
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  {[`${grade}A1`, `${grade}A2`, `${grade}A3`, `${grade}A4`].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassName(cls)}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-indigo-100 text-slate-700 rounded text-[10px]"
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ tên Giáo viên chủ nhiệm (GVCN) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  placeholder="VD: Cô Nguyễn Thị Thuỳ Trang"
                  className="w-full text-xs font-bold p-2.5 pl-9 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs text-slate-900"
                />
                <User className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Nhóm 3: Ban Cán Sự Lớp & 6 Nhóm Trưởng */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                3. Ban Cán Sự Lớp & 6 Nhóm Trưởng
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Khớp chức vụ & đồng bộ tài khoản</span>
            </div>

            {/* A. Ban cán sự lớp */}
            <div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">
                A. Ban Cán Sự Lớp (4 Vị Trí Phụ Trách Toàn Lớp):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    🎖️ Lớp trưởng
                  </label>
                  <input
                    type="text"
                    value={monitorName}
                    onChange={(e) => setMonitorName(e.target.value)}
                    placeholder="Họ tên Lớp trưởng"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📚 Lớp phó Học tập
                  </label>
                  <input
                    type="text"
                    value={academicViceMonitorName}
                    onChange={(e) => setAcademicViceMonitorName(e.target.value)}
                    placeholder="Họ tên LP Học tập"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    🧹 Lớp phó Lao động
                  </label>
                  <input
                    type="text"
                    value={laborViceMonitorName}
                    onChange={(e) => setLaborViceMonitorName(e.target.value)}
                    placeholder="Họ tên LP Lao động"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    🛡️ Lớp phó Trật tự
                  </label>
                  <input
                    type="text"
                    value={disciplineViceMonitorName}
                    onChange={(e) => setDisciplineViceMonitorName(e.target.value)}
                    placeholder="Họ tên LP Trật tự"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* B. 6 Nhóm trưởng */}
            <div className="pt-2 border-t border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>B. 6 Nhóm Trưởng (Theo Dõi & Chấm Điểm 6 Nhóm):</span>
                <span className="text-[10px] text-sky-700 lowercase font-semibold">tài khoản nhom1 → nhom6</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-sky-900 mb-1">
                    🚩 Nhóm trưởng 1
                  </label>
                  <input
                    type="text"
                    value={leader1}
                    onChange={(e) => setLeader1(e.target.value)}
                    placeholder="Tên Nhóm trưởng 1"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-900 mb-1">
                    🚩 Nhóm trưởng 2
                  </label>
                  <input
                    type="text"
                    value={leader2}
                    onChange={(e) => setLeader2(e.target.value)}
                    placeholder="Tên Nhóm trưởng 2"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-900 mb-1">
                    🚩 Nhóm trưởng 3
                  </label>
                  <input
                    type="text"
                    value={leader3}
                    onChange={(e) => setLeader3(e.target.value)}
                    placeholder="Tên Nhóm trưởng 3"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-900 mb-1">
                    🚩 Nhóm trưởng 4
                  </label>
                  <input
                    type="text"
                    value={leader4}
                    onChange={(e) => setLeader4(e.target.value)}
                    placeholder="Tên Nhóm trưởng 4"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-900 mb-1">
                    🚩 Nhóm trưởng 5
                  </label>
                  <input
                    type="text"
                    value={leader5}
                    onChange={(e) => setLeader5(e.target.value)}
                    placeholder="Tên Nhóm trưởng 5"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-900 mb-1">
                    🚩 Nhóm trưởng 6
                  </label>
                  <input
                    type="text"
                    value={leader6}
                    onChange={(e) => setLeader6(e.target.value)}
                    placeholder="Tên Nhóm trưởng 6"
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {savedSuccess ? (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã lưu cài đặt trường lớp thành công!
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">
                Bấm lưu để cập nhật toàn bộ hệ thống
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-md transition-all cursor-pointer hover:shadow-indigo-200"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cài Đặt</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
