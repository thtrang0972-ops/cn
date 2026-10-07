import React, { useState } from 'react';
import {
  X,
  PenTool,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Users,
  Shield,
  Copy,
  Check,
  Save,
  Crown,
  Lock,
  Wand2,
} from 'lucide-react';
import {
  UserRoleType,
  WeeklyRemarksStore,
  GroupWeeklyRemark,
  ClassMetadata,
  Student,
  WeekInfo,
} from '../types/discipline';
import { getRoleInfoList } from './RoleSwitcher';

interface RoleRemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRoleType;
  onSelectRole?: (role: UserRoleType) => void;
  metadata: ClassMetadata;
  students: Student[];
  currentWeek: WeekInfo;
  weeklyRemarks: Record<number, WeeklyRemarksStore>;
  onUpdateRemarks: (weekId: number, updated: WeeklyRemarksStore) => void;
}

export const RoleRemarksModal: React.FC<RoleRemarksModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  metadata,
  students,
  currentWeek,
  weeklyRemarks,
  onUpdateRemarks,
}) => {
  // Helper lấy tên nhóm trưởng thực tế từ cấu hình hoặc danh sách học sinh
  const getLeaderName = (groupId: number, fallback: string) => {
    if (metadata.groupLeaders && metadata.groupLeaders[groupId]) {
      return metadata.groupLeaders[groupId];
    }
    const leader = students.find(
      (s) => s.groupId === groupId && s.isLeader && s.role !== 'Lớp trưởng' && !s.role?.includes('Lớp phó')
    );
    return leader ? leader.name : fallback;
  };

  // Lấy dữ liệu nhận xét của tuần hiện tại
  const defaultStore: WeeklyRemarksStore = {
    groupRemarks: {
      1: { groupId: 1, leaderName: getLeaderName(1, 'Nguyễn Văn An'), pros: '', cons: '', exemplaryStudent: '', remindStudent: '', selfRating: 'Tốt', updatedAt: '' },
      2: { groupId: 2, leaderName: getLeaderName(2, 'Đặng Ngọc Mai'), pros: '', cons: '', exemplaryStudent: '', remindStudent: '', selfRating: 'Tốt', updatedAt: '' },
      3: { groupId: 3, leaderName: getLeaderName(3, 'Ngô Hồng Phúc'), pros: '', cons: '', exemplaryStudent: '', remindStudent: '', selfRating: 'Tốt', updatedAt: '' },
      4: { groupId: 4, leaderName: getLeaderName(4, 'Phạm Thanh Tùng'), pros: '', cons: '', exemplaryStudent: '', remindStudent: '', selfRating: 'Khá', updatedAt: '' },
      5: { groupId: 5, leaderName: getLeaderName(5, 'Hoàng Kim Cúc'), pros: '', cons: '', exemplaryStudent: '', remindStudent: '', selfRating: 'Đạt', updatedAt: '' },
      6: { groupId: 6, leaderName: getLeaderName(6, 'Đào Thu Hiền'), pros: '', cons: '', exemplaryStudent: '', remindStudent: '', selfRating: 'Chưa đạt', updatedAt: '' },
    },
    officerRemarks: {
      academicRemark: { authorName: metadata.academicViceMonitorName || 'Nguyễn Thảo Linh', rating: 'Khá', content: '', updatedAt: '' },
      laborRemark: { authorName: metadata.laborViceMonitorName || 'Bùi Quang Khải', rating: 'Khá', content: '', updatedAt: '' },
      disciplineRemark: { authorName: metadata.disciplineViceMonitorName || metadata.viceMonitorName || 'Lê Hoàng Yến Nhi', rating: 'Khá', content: '', updatedAt: '' },
      monitorRemark: { authorName: metadata.monitorName || 'Trần Gia Hưng', generalSummary: '', updatedAt: '' },
      teacherAdvice: { teacherName: metadata.homeroomTeacher || 'Cô Nguyễn Thị Thuỳ Trang', isApproved: false, advice: '', updatedAt: '' },
    },
  };

  const currentStore = weeklyRemarks[currentWeek.id] || defaultStore;

  // Local state form để lưu chỉnh sửa
  const [formData, setFormData] = useState<WeeklyRemarksStore>(JSON.parse(JSON.stringify(currentStore)));
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tab đang chọn
  const getInitialTab = (): string => {
    if (currentRole.startsWith('nhomTruong')) {
      const gNum = currentRole.replace('nhomTruong', '');
      return `group-${gNum}`;
    }
    if (currentRole === 'lopPhoHocTap') return 'academic';
    if (currentRole === 'lopPhoLaoDong') return 'labor';
    if (currentRole === 'lopPhoTratTu') return 'discipline';
    if (currentRole === 'lopTruong') return 'monitor';
    return 'teacher';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  if (!isOpen) return null;

  // Quyền hạn kiểm tra xem vai trò hiện tại có được sửa mục này không
  const canEditSection = (section: string): boolean => {
    if (currentRole === 'gvcn' || currentRole === 'lopTruong') return true;
    if (section.startsWith('group-')) {
      const gNum = section.replace('group-', '');
      return currentRole === `nhomTruong${gNum}`;
    }
    if (section === 'academic') return currentRole === 'lopPhoHocTap';
    if (section === 'labor') return currentRole === 'lopPhoLaoDong';
    if (section === 'discipline') return currentRole === 'lopPhoTratTu';
    return false;
  };

  const handleSave = () => {
    onUpdateRemarks(currentWeek.id, formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Copy biên bản nhận xét sinh hoạt lớp
  const handleCopyMinute = () => {
    const text = `📝 BIÊN BẢN NHẬN XÉT & BÁO CÁO NỀ NẾP TUẦN ${currentWeek.id}
Lớp ${metadata.className} · Năm học ${metadata.academicYear} · GVCN: ${metadata.homeroomTeacher}

1. BÁO CÁO CỦA 6 NHÓM TRƯỞNG:
${[1, 2, 3, 4, 5, 6]
  .map((g) => {
    const r = formData.groupRemarks[g];
    return `• Nhóm ${g} (${r?.leaderName || `Nhóm trưởng ${g}`}):
   - Ưu điểm: ${r?.pros || 'Chưa ghi nhận'}
   - Hạn chế: ${r?.cons || 'Không có'}
   - Tuyên dương: ${r?.exemplaryStudent || 'Cả nhóm'} | Cần nhắc nhở: ${r?.remindStudent || 'Không có'}
   - Tự xếp loại: ${r?.selfRating || 'Tốt'}`;
  })
  .join('\n')}

2. BÁO CÁO CỦA LỚP PHÓ HỌC TẬP (${formData.officerRemarks.academicRemark.authorName}):
- Xếp loại: ${formData.officerRemarks.academicRemark.rating}
- Nội dung: ${formData.officerRemarks.academicRemark.content || 'Nề nếp học tập ổn định.'}

3. BÁO CÁO CỦA LỚP PHÓ LAO ĐỘNG (${formData.officerRemarks.laborRemark.authorName}):
- Xếp loại: ${formData.officerRemarks.laborRemark.rating}
- Nội dung: ${formData.officerRemarks.laborRemark.content || 'Vệ sinh phòng học đảm bảo.'}

4. BÁO CÁO CỦA LỚP PHÓ TRẬT TỰ (${formData.officerRemarks.disciplineRemark.authorName}):
- Xếp loại: ${formData.officerRemarks.disciplineRemark.rating}
- Nội dung: ${formData.officerRemarks.disciplineRemark.content || 'Chấp hành nghiêm quy chế nề nếp.'}

5. TỔNG KẾT CỦA LỚP TRƯỞNG (${formData.officerRemarks.monitorRemark.authorName}):
${formData.officerRemarks.monitorRemark.generalSummary || 'Lớp thực hiện tốt phong trào thi đua tuần.'}

6. PHÊ DUYỆT & LỜI DẶN CỦA GVCN (${metadata.homeroomTeacher}):
${formData.officerRemarks.teacherAdvice.advice || 'GVCN đồng ý với kết quả thi đua và nhận xét của ban cán sự.'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tự động tổng hợp nhận xét của GVCN từ báo cáo của 6 Nhóm & Ban Cán Sự
  const handleAutoGenerateTeacherAdvice = () => {
    const parts: string[] = [];
    parts.push(`1. ĐÁNH GIÁ CHUNG VỀ NỀ NẾP TUẦN NÀY:`);

    if (formData.officerRemarks.monitorRemark.generalSummary?.trim()) {
      parts.push(`- Theo báo cáo tổng hợp của Lớp trưởng: ${formData.officerRemarks.monitorRemark.generalSummary.trim()}`);
    } else {
      parts.push(`- Nề nếp thi đua toàn lớp duy trì tốt, các bạn có ý thức tự giác và tham gia tích cực các hoạt động.`);
    }

    // Tổng hợp học sinh tiêu biểu và nhắc nhở từ 6 nhóm
    const exemplaryList: string[] = [];
    const remindList: string[] = [];
    [1, 2, 3, 4, 5, 6].forEach((g) => {
      const gr = formData.groupRemarks[g];
      if (gr?.exemplaryStudent?.trim()) {
        exemplaryList.push(`${gr.exemplaryStudent.trim()} (Nhóm ${g})`);
      }
      if (gr?.remindStudent?.trim()) {
        remindList.push(`${gr.remindStudent.trim()} (Nhóm ${g})`);
      }
    });

    if (exemplaryList.length > 0) {
      parts.push(`- Tuyên dương các học sinh gương mẫu, đạt nhiều điểm tốt: ${exemplaryList.join(', ')}.`);
    }

    // Tổng hợp báo cáo từ Ban Cán Sự
    parts.push(`2. NHẬN XÉT CÁC MẶT CHUYÊN TRÁCH BAN CÁN SỰ:`);
    if (formData.officerRemarks.academicRemark.content?.trim()) {
      parts.push(`- Về Học tập: ${formData.officerRemarks.academicRemark.content.trim()}`);
    }
    if (formData.officerRemarks.laborRemark.content?.trim()) {
      parts.push(`- Về Lao động - Trực nhật: ${formData.officerRemarks.laborRemark.content.trim()}`);
    }
    if (formData.officerRemarks.disciplineRemark.content?.trim()) {
      parts.push(`- Về Kỷ luật - Nề nếp: ${formData.officerRemarks.disciplineRemark.content.trim()}`);
    }

    if (remindList.length > 0) {
      parts.push(`- Nhắc nhở các bạn còn vi phạm: ${remindList.join(', ')} cần nghiêm túc chấn chỉnh, không tái diễn.`);
    }

    // Phương hướng tuần tới
    parts.push(`3. PHƯƠNG HƯỚNG VÀ KẾ HOẠCH TUẦN TIẾP THEO:`);
    parts.push(`- Trao phần thưởng thi đua cho nhóm xếp hạng 1 trong tiết Sinh hoạt lớp.`);
    parts.push(`- Nhóm trưởng 6 nhóm tiếp tục đôn đốc 15 phút đầu giờ, kiểm tra khăn quàng đỏ và đồng phục.`);
    parts.push(`- Tổ trực nhật vệ sinh sạch sẽ lớp học, lau bảng và đổ rác đúng giờ.`);

    const generated = parts.join('\n');
    setFormData((prev) => ({
      ...prev,
      officerRemarks: {
        ...prev.officerRemarks,
        teacherAdvice: {
          ...prev.officerRemarks.teacherAdvice,
          advice: generated,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sổ Báo Cáo & Nhận Xét Nề Nếp Tuần (Ban Cán Sự & 6 Nhóm)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentWeek.name} · Phân quyền cho 6 Nhóm trưởng, Lớp trưởng, LP Học tập, LP Lao động, LP Trật tự
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMinute}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép biên bản'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs phân quyền */}
        <div className="flex items-center gap-1 overflow-x-auto px-6 border-b border-slate-200 bg-slate-50/40 scrollbar-none shrink-0 py-2 text-xs font-semibold">
          {/* 6 Nhóm trưởng */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 shrink-0">
            {[1, 2, 3, 4, 5, 6].map((g) => {
              const tabId = `group-${g}`;
              const isSelected = activeTab === tabId;
              const hasPerm = canEditSection(tabId);
              return (
                <button
                  key={g}
                  onClick={() => setActiveTab(tabId)}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : hasPerm
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>🚩</span>
                  <span>Nhóm {g}</span>
                </button>
              );
            })}
          </div>

          {/* 3 Lớp phó */}
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'academic'
                ? 'bg-blue-600 text-white shadow-xs'
                : canEditSection('academic')
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📚</span>
            <span>LP Học tập</span>
          </button>

          <button
            onClick={() => setActiveTab('labor')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'labor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : canEditSection('labor')
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🧹</span>
            <span>LP Lao động</span>
          </button>

          <button
            onClick={() => setActiveTab('discipline')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'discipline'
                ? 'bg-amber-600 text-white shadow-xs'
                : canEditSection('discipline')
                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🛡️</span>
            <span>LP Trật tự</span>
          </button>

          {/* Lớp trưởng */}
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'monitor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : canEditSection('monitor')
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🎖️</span>
            <span>Lớp trưởng</span>
          </button>

          {/* GVCN */}
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'teacher'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <span>👑</span>
            <span>GVCN Phê Duyệt</span>
          </button>
        </div>

        {/* Nội dung form theo Tab */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Báo cáo của 6 Nhóm trưởng */}
          {activeTab.startsWith('group-') && (() => {
            const gNum = parseInt(activeTab.replace('group-', ''), 10);
            const actualLeaderName = getLeaderName(gNum, `Nhóm trưởng ${gNum}`);
            const r = formData.groupRemarks[gNum] || {
              groupId: gNum,
              leaderName: actualLeaderName,
              pros: '',
              cons: '',
              exemplaryStudent: '',
              remindStudent: '',
              selfRating: 'Tốt',
              updatedAt: '',
            };
            const displayLeader = r.leaderName && !r.leaderName.startsWith('Nhóm trưởng') ? r.leaderName : actualLeaderName;
            const isEditable = canEditSection(activeTab);

            return (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>🚩</span>
                      Báo Cáo & Nhận Xét Của Nhóm Trưởng {gNum}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Học sinh báo cáo: <strong className="text-slate-900 font-bold">{displayLeader}</strong> (Nhóm trưởng Nhóm {gNum})
                    </p>
                  </div>

                  {!isEditable && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Chỉ Nhóm trưởng {gNum}, Lớp trưởng & GVCN có quyền sửa</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ưu điểm */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Ưu điểm trong tuần của nhóm
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isEditable}
                      value={r.pros}
                      onChange={(e) => {
                        const newRemarks = { ...formData.groupRemarks };
                        newRemarks[gNum] = { ...r, pros: e.target.value };
                        setFormData({ ...formData, groupRemarks: newRemarks });
                      }}
                      placeholder="VD: Cả nhóm đi học đầy đủ, đúng giờ, chuẩn bị bài tốt môn Toán, bạn Linh phát biểu hăng hái..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
                    />
                  </div>

                  {/* Tồn tại / Lỗi vi phạm */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Tồn tại, hạn chế & vi phạm của nhóm
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isEditable}
                      value={r.cons}
                      onChange={(e) => {
                        const newRemarks = { ...formData.groupRemarks };
                        newRemarks[gNum] = { ...r, cons: e.target.value };
                        setFormData({ ...formData, groupRemarks: newRemarks });
                      }}
                      placeholder="VD: Bạn Nam quên khăn quàng thứ 2, bạn Khải còn mất trật tự trong tiết Sinh..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      3. Đề xuất Tuyên dương bạn tiêu biểu
                    </label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={r.exemplaryStudent}
                      onChange={(e) => {
                        const newRemarks = { ...formData.groupRemarks };
                        newRemarks[gNum] = { ...r, exemplaryStudent: e.target.value };
                        setFormData({ ...formData, groupRemarks: newRemarks });
                      }}
                      placeholder="VD: Trần Bảo Anh"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">
                      4. Bạn cần nhắc nhở / rèn luyện
                    </label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={r.remindStudent}
                      onChange={(e) => {
                        const newRemarks = { ...formData.groupRemarks };
                        newRemarks[gNum] = { ...r, remindStudent: e.target.value };
                        setFormData({ ...formData, groupRemarks: newRemarks });
                      }}
                      placeholder="VD: Phạm Đức Dũng"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5. Nhóm tự đánh giá xếp loại
                    </label>
                    <select
                      disabled={!isEditable}
                      value={r.selfRating}
                      onChange={(e) => {
                        const newRemarks = { ...formData.groupRemarks };
                        newRemarks[gNum] = {
                          ...r,
                          selfRating: e.target.value as 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt',
                        };
                        setFormData({ ...formData, groupRemarks: newRemarks });
                      }}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Tốt">Tốt (Xuất sắc)</option>
                      <option value="Khá">Khá</option>
                      <option value="Đạt">Đạt</option>
                      <option value="Chưa đạt">Chưa đạt</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Báo cáo Lớp phó Học tập */}
          {activeTab === 'academic' && (() => {
            const ar = formData.officerRemarks.academicRemark;
            const isEditable = canEditSection('academic');

            return (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      <span>📚</span>
                      Nhận Xét & Báo Cáo Chuyên Môn Của Lớp Phó Học Tập
                    </h4>
                    <p className="text-xs text-slate-500">
                      Học sinh phụ trách: <strong className="text-slate-900 font-bold">{metadata.academicViceMonitorName || 'Nguyễn Thảo Linh'}</strong> (Lớp phó Học tập)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Xếp loại học tập tuần:</span>
                    <select
                      disabled={!isEditable}
                      value={ar.rating}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          officerRemarks: {
                            ...formData.officerRemarks,
                            academicRemark: {
                              ...ar,
                              rating: e.target.value as any,
                            },
                          },
                        });
                      }}
                      className="text-xs font-bold p-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg"
                    >
                      <option value="Tốt">Tốt</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cần cố gắng">Cần cố gắng</option>
                    </select>
                  </div>
                </div>

                {!isEditable && (
                  <div className="flex items-center p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Chỉ Lớp phó Học tập, Lớp trưởng & GVCN có quyền sửa nhận xét này.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhận xét chi tiết về tình hình học tập, kiểm tra bài 15p đầu giờ & điểm số
                  </label>
                  <textarea
                    rows={5}
                    disabled={!isEditable}
                    value={ar.content}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        officerRemarks: {
                          ...formData.officerRemarks,
                          academicRemark: {
                            ...ar,
                            content: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder="Ghi nhận về: Số lượng điểm tốt đạt được, tình hình làm bài tập về nhà trong giờ truy bài 15p, các bạn tích cực phát biểu, và các bạn còn bị điểm kém/KTB/quên soạn bài..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            );
          })()}

          {/* Báo cáo Lớp phó Lao động */}
          {activeTab === 'labor' && (() => {
            const lr = formData.officerRemarks.laborRemark;
            const isEditable = canEditSection('labor');

            return (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                      <span>🧹</span>
                      Nhận Xét & Báo Cáo Vệ Sinh Của Lớp Phó Lao Động
                    </h4>
                    <p className="text-xs text-slate-500">
                      Học sinh phụ trách: <strong className="text-slate-900 font-bold">{metadata.laborViceMonitorName || 'Bùi Quang Khải'}</strong> (Lớp phó Lao động)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Đánh giá vệ sinh:</span>
                    <select
                      disabled={!isEditable}
                      value={lr.rating}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          officerRemarks: {
                            ...formData.officerRemarks,
                            laborRemark: {
                              ...lr,
                              rating: e.target.value as any,
                            },
                          },
                        });
                      }}
                      className="text-xs font-bold p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg"
                    >
                      <option value="Tốt">Tốt (Sạch sẽ)</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cần cố gắng">Chưa sạch / Cần chấn chỉnh</option>
                    </select>
                  </div>
                </div>

                {!isEditable && (
                  <div className="flex items-center p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Chỉ Lớp phó Lao động, Lớp trưởng & GVCN có quyền sửa nhận xét này.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhận xét trực nhật các nhóm, vệ sinh bảng đen, bàn giáo viên, sọt rác & tài sản
                  </label>
                  <textarea
                    rows={5}
                    disabled={!isEditable}
                    value={lr.content}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        officerRemarks: {
                          ...formData.officerRemarks,
                          laborRemark: {
                            ...lr,
                            content: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder="Ghi nhận về: Nhóm nào trực nhật sạch, nhóm nào còn để bảng bẩn hoặc quên đổ rác, tình trạng bàn ghế và hộc bàn của lớp..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            );
          })()}

          {/* Báo cáo Lớp phó Trật tự */}
          {activeTab === 'discipline' && (() => {
            const dr = formData.officerRemarks.disciplineRemark;
            const isEditable = canEditSection('discipline');

            return (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <span>🛡️</span>
                      Nhận Xét Kỷ Luật & Chuyên Cần Của Lớp Phó Trật Tự
                    </h4>
                    <p className="text-xs text-slate-500">
                      Học sinh phụ trách: <strong className="text-slate-900 font-bold">{metadata.disciplineViceMonitorName || metadata.viceMonitorName || 'Lê Hoàng Yến Nhi'}</strong> (Lớp phó Trật tự)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Đánh giá kỷ luật:</span>
                    <select
                      disabled={!isEditable}
                      value={dr.rating}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          officerRemarks: {
                            ...formData.officerRemarks,
                            disciplineRemark: {
                              ...dr,
                              rating: e.target.value as any,
                            },
                          },
                        });
                      }}
                      className="text-xs font-bold p-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg"
                    >
                      <option value="Tốt">Tốt</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cần cố gắng">Cần cố gắng</option>
                    </select>
                  </div>
                </div>

                {!isEditable && (
                  <div className="flex items-center p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Chỉ Lớp phó Trật tự, Lớp trưởng & GVCN có quyền sửa nhận xét này.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhận xét về chuyên cần, đi trễ, khăn quàng đỏ, đồng phục và nề nếp học trái buổi
                  </label>
                  <textarea
                    rows={5}
                    disabled={!isEditable}
                    value={dr.content}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        officerRemarks: {
                          ...formData.officerRemarks,
                          disciplineRemark: {
                            ...dr,
                            content: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder="Ghi nhận về: Tình hình đi học đúng giờ, số bạn quên khăn quàng đỏ, chấp hành giờ giải lao, việc tham gia các buổi học trái buổi (thể dục, tin học)..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            );
          })()}

          {/* Báo cáo tổng kết Lớp trưởng */}
          {activeTab === 'monitor' && (() => {
            const mr = formData.officerRemarks.monitorRemark;
            const isEditable = canEditSection('monitor');

            return (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                      <span>🎖️</span>
                      Báo Cáo Tổng Hợp Tuần Của Lớp Trưởng
                    </h4>
                    <p className="text-xs text-slate-500">
                      Học sinh phụ trách: <strong className="text-slate-900 font-bold">{metadata.monitorName || 'Trần Gia Hưng'}</strong> (Lớp trưởng)
                    </p>
                  </div>
                </div>

                {!isEditable && (
                  <div className="flex items-center p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Chỉ Lớp trưởng & GVCN có quyền sửa báo cáo tổng hợp này.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Báo cáo tổng kết tình hình thi đua toàn lớp & kiến nghị với Giáo viên chủ nhiệm
                  </label>
                  <textarea
                    rows={5}
                    disabled={!isEditable}
                    value={mr.generalSummary}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        officerRemarks: {
                          ...formData.officerRemarks,
                          monitorRemark: {
                            ...mr,
                            generalSummary: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder="Tổng hợp toàn diện về thi đua 6 nhóm, đánh giá nhóm xếp hạng nhất nhì, nhóm cần khắc phục, kiến nghị tuyên dương học sinh xuất sắc..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            );
          })()}

          {/* Phê duyệt & Lời dặn của GVCN */}
          {activeTab === 'teacher' && (() => {
            const tr = formData.officerRemarks.teacherAdvice;
            const isEditable = canEditSection('teacher');

            return (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                      <span>👑</span>
                      Nhận Xét, Phê Duyệt & Phương Hướng Của Giáo Viên Chủ Nhiệm
                    </h4>
                    <p className="text-xs text-slate-500">
                      Giáo viên chủ nhiệm: <strong className="text-slate-800">{metadata.homeroomTeacher}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={tr.isApproved}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            officerRemarks: {
                              ...formData.officerRemarks,
                              teacherAdvice: {
                                ...tr,
                                isApproved: e.target.checked,
                              },
                            },
                          });
                        }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-purple-900">
                        {tr.isApproved ? 'Đã phê duyệt kết quả tuần' : 'Chưa duyệt'}
                      </span>
                    </label>
                  </div>
                </div>

                {!isEditable && (
                  <div className="flex items-center p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      <span>Chỉ Giáo viên chủ nhiệm (GVCN) có quyền phê duyệt & chỉ đạo tuần mới.</span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <label className="text-xs font-bold text-slate-700">
                      Nhận xét của GVCN & Kế hoạch, phương hướng tuần mới cho tiết Sinh hoạt lớp
                    </label>

                    {isEditable && (
                      <button
                        type="button"
                        onClick={handleAutoGenerateTeacherAdvice}
                        className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Tự động phân tích báo cáo từ 6 nhóm và các mặt của Ban cán sự để soạn lời dặn tổng kết"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Tự động nhận xét theo báo cáo tuần</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={6}
                    disabled={!isEditable}
                    value={tr.advice}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        officerRemarks: {
                          ...formData.officerRemarks,
                          teacherAdvice: {
                            ...tr,
                            advice: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder="Lời dặn của GVCN đối với lớp: Trao phần thưởng cho nhóm xếp hạng 1, xử lý học sinh vi phạm nghiêm trọng theo nội quy của lớp, phương hướng trọng tâm học tập cho tuần tới... (hoặc bấm Tự động nhận xét ở trên)"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-mono"
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {saveSuccess && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu nhận xét thành công!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Nhận Xét Tuần</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
