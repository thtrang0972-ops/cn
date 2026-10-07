import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GroupCompetitionView } from './components/GroupCompetitionView';
import { WeeklyScoreTable } from './components/WeeklyScoreTable';
import { MorningDutyView } from './components/MorningDutyView';
import { AfternoonSessionView } from './components/AfternoonSessionView';
import { ReportStatsView } from './components/ReportStatsView';
import { QuickEntryModal } from './components/QuickEntryModal';
import { ClassRosterModal } from './components/ClassRosterModal';
import { PrintReportView } from './components/PrintReportView';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import { RoleSwitcher } from './components/RoleSwitcher';
import { RoleRemarksModal } from './components/RoleRemarksModal';
import { ClassSettingsModal } from './components/ClassSettingsModal';
import { AuthModal } from './components/AuthModal';
import { AccountManagerModal } from './components/AccountManagerModal';
import { ThemeTemplateModal } from './components/ThemeTemplateModal';
import { QuickActionBar } from './components/QuickActionBar';
import { OverviewStatsBar } from './components/OverviewStatsBar';
import { TeacherGroupNotesModal } from './components/TeacherGroupNotesModal';
import { AdjustScoreModal } from './components/AdjustScoreModal';
import { ScoreAuditLogModal } from './components/ScoreAuditLogModal';
import {
  COLOR_THEMES,
  ThemeId,
  BACKGROUND_PRESETS,
  BackgroundPresetId,
} from './types/theme';

import {
  Student,
  StudentWeeklyRecord,
  MorningDutyRecord,
  AfternoonRecord,
  WeekInfo,
  ClassMetadata,
  UserRoleType,
  WeeklyRemarksStore,
  UserAccount,
  ScoreAdjustmentLog,
} from './types/discipline';
import {
  loadAppState,
  saveAppState,
  resetToInitialData,
  syncAccountsWithRosterAndMeta,
  AppState,
  loadScoreLogs,
  saveScoreLogs,
  deduplicateScoreLogs,
  addScoreAdjustmentLog,
  deleteScoreAdjustmentLog,
  clearAllScoreLogs,
} from './utils/storage';
import { calculateGroupSummaries, calculateStudentScore, CRITERIA_LIST } from './utils/scoring';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('competition');

  // Modals state
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryStudent, setQuickEntryStudent] = useState<Student | null>(null);
  const [isClassRosterOpen, setIsClassRosterOpen] = useState(false);
  const [isClassSettingsOpen, setIsClassSettingsOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRoleRemarksOpen, setIsRoleRemarksOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTeacherNotesModalOpen, setIsTeacherNotesModalOpen] = useState(false);
  const [isAdjustScoreOpen, setIsAdjustScoreOpen] = useState(false);
  const [adjustScoreStudent, setAdjustScoreStudent] = useState<Student | null>(null);
  const [isScoreAuditLogOpen, setIsScoreAuditLogOpen] = useState(false);
  const [scoreLogs, setScoreLogs] = useState<ScoreAdjustmentLog[]>(() => loadScoreLogs());

  // Thông báo đăng nhập thành công hiển thị tên học sinh nổi bật
  const [loginNotice, setLoginNotice] = useState<{
    displayName: string;
    title: string;
    avatar: string;
    isStudent: boolean;
  } | null>(null);

  // Theme template state (lưu vào localStorage để duy trì lựa chọn)
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('app_theme_id');
      if (saved && COLOR_THEMES.some((t) => t.id === saved)) {
        return saved as ThemeId;
      }
    } catch (e) {
      // ignore
    }
    return 'sapphire';
  });

  const currentTheme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];

  // Background Preset state (mặc định nền trắng sáng, không để màu xanh dương)
  const [bgPresetId, setBgPresetId] = useState<BackgroundPresetId>(() => {
    try {
      const saved = localStorage.getItem('app_bg_preset_id');
      if (saved && saved !== 'deep-gradient' && saved !== 'midnight' && BACKGROUND_PRESETS.some((p) => p.id === saved)) {
        return saved as BackgroundPresetId;
      }
    } catch (e) {
      // ignore
    }
    return 'pure'; // Mặc định: Nền Trắng Sáng dễ nhìn, không để màu xanh dương
  });

  const currentBgPreset =
    BACKGROUND_PRESETS.find((p) => p.id === bgPresetId) || BACKGROUND_PRESETS[0];

  const handleSelectTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    try {
      localStorage.setItem('app_theme_id', newThemeId);
    } catch (e) {
      // ignore
    }
  };

  const handleSelectBgPreset = (newPresetId: BackgroundPresetId) => {
    setBgPresetId(newPresetId);
    try {
      localStorage.setItem('app_bg_preset_id', newPresetId);
    } catch (e) {
      // ignore
    }
  };

  // Auto save to localStorage when appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const {
    metadata,
    students,
    weeks,
    currentWeekId,
    currentUserRole,
    currentAccountId,
    accounts,
    weeklyRecords,
    morningDutyRecords,
    afternoonRecords,
    weeklyRemarks,
  } = appState;

  // Tài khoản đang đăng nhập (hoặc undefined nếu đã đăng xuất)
  const currentAccount =
    currentUserRole === 'guest' || !currentAccountId
      ? undefined
      : accounts.find((a) => a.id === currentAccountId) ||
        accounts.find((a) => a.role === currentUserRole);

  // Đăng xuất tất cả các tài khoản (chuyển về chế độ chỉ xem)
  const handleLogout = () => {
    setAppState((prev) => ({
      ...prev,
      currentUserRole: 'guest',
      currentAccountId: '',
    }));
  };

  // Lấy dữ liệu tuần hiện tại
  const currentWeek = weeks.find((w) => w.id === currentWeekId) || weeks[0];
  const currentRecords = weeklyRecords[currentWeekId] || {};

  // Tính kết quả thi đua 6 nhóm
  const groups = calculateGroupSummaries(students, currentRecords);

  // Chọn vai trò nhanh (đồng bộ tài khoản)
  const handleSelectRole = (newRole: UserRoleType) => {
    const matched = accounts.find((a) => a.role === newRole);
    setAppState((prev) => ({
      ...prev,
      currentUserRole: newRole,
      currentAccountId: matched ? matched.id : prev.currentAccountId,
    }));
    if (matched && newRole !== 'guest') {
      setLoginNotice({
        displayName: matched.displayName,
        title: matched.title,
        avatar: matched.avatarIcon,
        isStudent: matched.role !== 'gvcn',
      });
      setTimeout(() => setLoginNotice(null), 4000);
    }
  };

  // Đăng nhập bằng tài khoản cụ thể
  const handleLogin = (accountId: string) => {
    const matched = accounts.find((a) => a.id === accountId);
    if (matched) {
      setAppState((prev) => ({
        ...prev,
        currentAccountId: matched.id,
        currentUserRole: matched.role,
      }));
      setLoginNotice({
        displayName: matched.displayName,
        title: matched.title,
        avatar: matched.avatarIcon,
        isStudent: matched.role !== 'gvcn',
      });
      setTimeout(() => setLoginNotice(null), 4000);
    }
  };

  // Cập nhật danh sách tài khoản (đổi mật khẩu, gán nhóm, đổi học sinh phụ trách)
  const handleUpdateAccounts = (newAccounts: UserAccount[]) => {
    setAppState((prev) => {
      const updatedMeta = { ...prev.metadata };
      const updatedLeaders = { ...(updatedMeta.groupLeaders || {}) };

      newAccounts.forEach((acc) => {
        if (acc.role === 'gvcn') {
          updatedMeta.homeroomTeacher = acc.displayName;
        } else if (acc.role === 'lopTruong') {
          updatedMeta.monitorName = acc.displayName;
        } else if (acc.role === 'lopPhoHocTap') {
          updatedMeta.academicViceMonitorName = acc.displayName;
        } else if (acc.role === 'lopPhoLaoDong') {
          updatedMeta.laborViceMonitorName = acc.displayName;
        } else if (acc.role === 'lopPhoTratTu') {
          updatedMeta.disciplineViceMonitorName = acc.displayName;
          updatedMeta.viceMonitorName = acc.displayName;
        } else if (acc.role.startsWith('nhomTruong')) {
          const g = parseInt(acc.role.replace('nhomTruong', ''), 10);
          if (!isNaN(g)) {
            updatedLeaders[g] = acc.displayName;
          }
        }
      });
      updatedMeta.groupLeaders = updatedLeaders;

      return {
        ...prev,
        metadata: updatedMeta,
        accounts: newAccounts,
      };
    });
  };

  // Chọn tuần
  const handleSelectWeek = (weekId: number) => {
    setAppState((prev) => ({
      ...prev,
      currentWeekId: weekId,
      // Nếu tuần chưa có records thì khởi tạo
      weeklyRecords: {
        ...prev.weeklyRecords,
        [weekId]: prev.weeklyRecords[weekId] || {},
      },
    }));
  };

  // Cập nhật điểm/vi phạm trực tiếp của 1 học sinh trong tuần hiện tại
  const handleUpdateRecord = (
    studentId: string,
    updatedFields: Partial<StudentWeeklyRecord>
  ) => {
    setAppState((prev) => {
      const weekRecs = { ...(prev.weeklyRecords[prev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[studentId] || {
        studentId,
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

      weekRecs[studentId] = {
        ...currentStudentRec,
        ...updatedFields,
      };

      return {
        ...prev,
        weeklyRecords: {
          ...prev.weeklyRecords,
          [prev.currentWeekId]: weekRecs,
        },
      };
    });
  };

  // Thêm vi phạm từ Quick Entry Modal
  const handleApplyViolation = (
    studentId: string,
    field: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>,
    delta: number,
    note?: string,
    context?: 'standard' | 'morning' | 'afternoon',
    contextDetails?: {
      dayOfWeek?: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
      sessionName?: string;
    }
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    // Cập nhật bảng tuần
    setAppState((prev) => {
      const weekRecs = { ...(prev.weeklyRecords[prev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[studentId] || {
        studentId,
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

      const currentVal = Number(currentStudentRec[field] || 0);
      const newVal = Math.max(0, currentVal + delta);

      weekRecs[studentId] = {
        ...currentStudentRec,
        [field]: newVal,
        note: note ? (currentStudentRec.note ? `${currentStudentRec.note}; ${note}` : note) : currentStudentRec.note,
      };

      let newMorning = [...prev.morningDutyRecords];
      let newAfternoon = [...prev.afternoonRecords];

      // Nếu chọn 15p đầu giờ -> tự động ghi vào Morning Duty
      if (context === 'morning') {
        const morningRec: MorningDutyRecord = {
          id: `md-${Date.now()}`,
          weekId: prev.currentWeekId,
          date: new Date().toISOString().slice(0, 10),
          dayOfWeek: contextDetails?.dayOfWeek || 'Thứ 2',
          studentId: student.id,
          studentName: student.name,
          groupId: student.groupId,
          violationType: 'khac',
          violationLabel: note || String(field),
          penaltyPoints: -2,
          note: note,
          recordedBy: 'Ban cán sự / Cờ đỏ',
          createdAt: new Date().toISOString(),
        };
        newMorning.unshift(morningRec);
      }

      // Nếu chọn trái buổi -> tự động ghi vào Afternoon
      if (context === 'afternoon') {
        const afternoonRec: AfternoonRecord = {
          id: `an-${Date.now()}`,
          weekId: prev.currentWeekId,
          date: new Date().toISOString().slice(0, 10),
          dayOfWeek: contextDetails?.dayOfWeek || 'Thứ 3',
          sessionName: contextDetails?.sessionName || 'Học trái buổi',
          subject: 'Khac',
          subjectLabel: 'Trái buổi',
          studentId: student.id,
          studentName: student.name,
          groupId: student.groupId,
          violationType: 'khac',
          violationLabel: note || String(field),
          penaltyPoints: -2,
          note: note,
          recordedBy: 'Ban cán sự',
          createdAt: new Date().toISOString(),
        };
        newAfternoon.unshift(afternoonRec);
      }

      return {
        ...prev,
        weeklyRecords: {
          ...prev.weeklyRecords,
          [prev.currentWeekId]: weekRecs,
        },
        morningDutyRecords: newMorning,
        afternoonRecords: newAfternoon,
      };
    });
  };

  // Thêm ghi nhận 15p đầu giờ
  const handleAddMorningRecord = (rec: Omit<MorningDutyRecord, 'id' | 'createdAt'>) => {
    const newRecord: MorningDutyRecord = {
      ...rec,
      id: `md-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => {
      // Tự động đồng bộ vào bảng nề nếp tuần
      const weekRecs = { ...(prev.weeklyRecords[prev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[rec.studentId] || {
        studentId: rec.studentId,
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

      if (rec.violationType === 'khanQuangPhuHieu') {
        currentStudentRec.khongDongPhuc2 = (currentStudentRec.khongDongPhuc2 || 0) + 1;
      } else if (rec.violationType === 'truyBai') {
        currentStudentRec.ktbKlbKsb = (currentStudentRec.ktbKlbKsb || 0) + 1;
      } else if (rec.violationType === 'diTre15p') {
        currentStudentRec.diTre = (currentStudentRec.diTre || 0) + 1;
      } else if (rec.violationType === 'veSinhLop') {
        currentStudentRec.trucVSBan = (currentStudentRec.trucVSBan || 0) + 1;
      } else if (rec.violationType === 'matTratTu15p') {
        currentStudentRec.matTratTu = (currentStudentRec.matTratTu || 0) + 1;
      } else {
        currentStudentRec.khongDongPhuc2 = (currentStudentRec.khongDongPhuc2 || 0) + 1;
      }

      if (rec.note) {
        currentStudentRec.note = currentStudentRec.note
          ? `${currentStudentRec.note}; 15p: ${rec.note}`
          : `15p: ${rec.note}`;
      }

      weekRecs[rec.studentId] = currentStudentRec;

      return {
        ...prev,
        weeklyRecords: {
          ...prev.weeklyRecords,
          [prev.currentWeekId]: weekRecs,
        },
        morningDutyRecords: [newRecord, ...prev.morningDutyRecords],
      };
    });
  };

  const handleDeleteMorningRecord = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      morningDutyRecords: prev.morningDutyRecords.filter((r) => r.id !== id),
    }));
  };

  // Thêm ghi nhận học trái buổi
  const handleAddAfternoonRecord = (rec: Omit<AfternoonRecord, 'id' | 'createdAt'>) => {
    const newRecord: AfternoonRecord = {
      ...rec,
      id: `an-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => {
      // Tự động đồng bộ vào bảng tuần
      const weekRecs = { ...(prev.weeklyRecords[prev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[rec.studentId] || {
        studentId: rec.studentId,
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

      if (rec.violationType === 'vangKP') {
        currentStudentRec.nghiKP = (currentStudentRec.nghiKP || 0) + 1;
      } else if (rec.violationType === 'vangCP') {
        currentStudentRec.nghiCP = (currentStudentRec.nghiCP || 0) + 1;
      } else if (rec.violationType === 'boTiet') {
        currentStudentRec.boTiet = (currentStudentRec.boTiet || 0) + 1;
      } else if (rec.violationType === 'diTre') {
        currentStudentRec.diTre = (currentStudentRec.diTre || 0) + 1;
      } else if (rec.violationType === 'khongDongPhuc') {
        currentStudentRec.khongDongPhuc2 = (currentStudentRec.khongDongPhuc2 || 0) + 1;
      } else if (rec.violationType === 'matTratTu') {
        currentStudentRec.matTratTu = (currentStudentRec.matTratTu || 0) + 1;
      }

      if (rec.note) {
        currentStudentRec.note = currentStudentRec.note
          ? `${currentStudentRec.note}; Trái buổi: ${rec.note}`
          : `Trái buổi: ${rec.note}`;
      }

      weekRecs[rec.studentId] = currentStudentRec;

      return {
        ...prev,
        weeklyRecords: {
          ...prev.weeklyRecords,
          [prev.currentWeekId]: weekRecs,
        },
        afternoonRecords: [newRecord, ...prev.afternoonRecords],
      };
    });
  };

  const handleDeleteAfternoonRecord = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      afternoonRecords: prev.afternoonRecords.filter((r) => r.id !== id),
    }));
  };

  // Quản lý lớp & học sinh
  const handleUpdateMetadata = (newMeta: ClassMetadata) => {
    setAppState((prev) => ({
      ...prev,
      metadata: newMeta,
      accounts: syncAccountsWithRosterAndMeta(prev.accounts, newMeta, prev.students),
    }));
  };

  const handleAddStudent = (data: Omit<Student, 'id' | 'stt'>) => {
    setAppState((prev) => {
      const newStt = prev.students.length + 1;
      const newStudent: Student = {
        ...data,
        id: `hs-${Date.now()}`,
        stt: newStt,
      };
      const updatedStudents = [...prev.students, newStudent];
      return {
        ...prev,
        students: updatedStudents,
        accounts: syncAccountsWithRosterAndMeta(prev.accounts, prev.metadata, updatedStudents),
      };
    });
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    setAppState((prev) => {
      const updatedStudents = prev.students.map((s) => (s.id === id ? { ...s, ...updated } : s));
      return {
        ...prev,
        students: updatedStudents,
        accounts: syncAccountsWithRosterAndMeta(prev.accounts, prev.metadata, updatedStudents),
      };
    });
  };

  const handleDeleteStudent = (id: string) => {
    setAppState((prev) => {
      const remaining = prev.students.filter((s) => s.id !== id);
      const renumbered = remaining.map((s, idx) => ({ ...s, stt: idx + 1 }));
      return {
        ...prev,
        students: renumbered,
        accounts: syncAccountsWithRosterAndMeta(prev.accounts, prev.metadata, renumbered),
      };
    });
  };

  const handleResetData = () => {
    const initial = resetToInitialData();
    setAppState(initial);
  };

  const handleApplyNewRoster = (newStudents: Student[]) => {
    setAppState((prev) => {
      // Đồng bộ nạp danh sách học sinh mới
      const newWeeklyRecords = { ...prev.weeklyRecords };
      const currentWeekRecs: Record<string, StudentWeeklyRecord> = {};

      newStudents.forEach((s) => {
        const existingRec = prev.weeklyRecords[prev.currentWeekId]?.[s.id];
        currentWeekRecs[s.id] = existingRec || {
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
      });

      newWeeklyRecords[prev.currentWeekId] = currentWeekRecs;

      return {
        ...prev,
        students: newStudents,
        weeklyRecords: newWeeklyRecords,
        accounts: syncAccountsWithRosterAndMeta(prev.accounts, prev.metadata, newStudents),
      };
    });
  };

  const handleUpdateRemarks = (weekId: number, updated: WeeklyRemarksStore) => {
    setAppState((prev) => ({
      ...prev,
      weeklyRemarks: {
        ...prev.weeklyRemarks,
        [weekId]: updated,
      },
    }));
  };

  const currentTeacherGroupNotes = weeklyRemarks[currentWeekId]?.teacherGroupNotes || {};
  const currentWeeklyRemarks = weeklyRemarks[currentWeekId];

  const handleSaveTeacherGroupNotes = (updatedNotes: Record<number, string>) => {
    setAppState((prev) => {
      const weekStore = prev.weeklyRemarks[prev.currentWeekId] || {
        groupRemarks: {},
        officerRemarks: {
          academicRemark: { authorName: '', rating: 'Khá', content: '' },
          laborRemark: { authorName: '', rating: 'Khá', content: '' },
          disciplineRemark: { authorName: '', rating: 'Khá', content: '' },
          monitorRemark: { authorName: '', generalSummary: '' },
          teacherAdvice: { teacherName: '', isApproved: true, advice: '' },
        },
        teacherGroupNotes: {},
      };

      const updatedGroupRemarks = { ...(weekStore.groupRemarks || {}) };
      [1, 2, 3, 4, 5, 6].forEach((g) => {
        if (updatedGroupRemarks[g]) {
          updatedGroupRemarks[g] = {
            ...updatedGroupRemarks[g],
            teacherNote: updatedNotes[g] || '',
          };
        }
      });

      return {
        ...prev,
        weeklyRemarks: {
          ...prev.weeklyRemarks,
          [prev.currentWeekId]: {
            ...weekStore,
            teacherGroupNotes: updatedNotes,
            groupRemarks: updatedGroupRemarks,
          },
        },
      };
    });
  };

  const handleSelectStudentForQuickEntry = (student: Student) => {
    setQuickEntryStudent(student);
    setIsQuickEntryOpen(true);
  };

  const handleOpenAdjustScore = (student?: Student) => {
    setAdjustScoreStudent(student || null);
    setIsAdjustScoreOpen(true);
  };

  const handleSaveAdjustment = (
    studentId: string,
    updatedRecord: StudentWeeklyRecord,
    adjustmentReason?: string
  ) => {
    // Tự động ghi nhật ký chỉnh sửa điểm cho Giáo viên chủ nhiệm theo dõi
    const oldRec = currentRecords[studentId];
    const targetStudent = students.find((s) => s.id === studentId);
    if (targetStudent && oldRec) {
      for (const crit of CRITERIA_LIST) {
        const oldVal = Number((oldRec as any)[crit.key] || 0);
        const newVal = Number((updatedRecord as any)[crit.key] || 0);
        if (oldVal !== newVal) {
          const deltaDiff = newVal - oldVal;
          const scoreDelta = crit.isBonus
            ? deltaDiff * crit.points
            : -deltaDiff * Math.abs(crit.points);

          const updatedLogs = addScoreAdjustmentLog({
            weekId: currentWeekId,
            weekName: currentWeek.name,
            studentId: targetStudent.id,
            studentName: targetStudent.name,
            groupId: targetStudent.groupId,
            criterionKey: crit.key,
            criterionLabel: crit.name,
            oldValue: oldVal,
            newValue: newVal,
            delta: scoreDelta,
            reason: adjustmentReason?.trim() || 'Điều chỉnh điểm nề nếp',
            editorName: currentAccount
              ? currentAccount.displayName
              : metadata.homeroomTeacher || 'Cô Nguyễn Thị Thuỳ Trang',
            editorRole: currentAccount ? currentAccount.title : 'GVCN',
            editorAccountId: currentAccountId,
          });
          setScoreLogs(updatedLogs);
        }
      }
    }
    handleUpdateRecord(studentId, updatedRecord);
  };

  const handleClearAllStudents = () => {
    setAppState((prev) => ({
      ...prev,
      students: [],
    }));
  };

  const handleClearScoreLogs = () => {
    clearAllScoreLogs();
    setScoreLogs([]);
  };

  const handleDeleteScoreLog = (logId: string) => {
    const updated = deleteScoreAdjustmentLog(logId);
    setScoreLogs(updated);
  };

  const handleDeduplicateLogs = () => {
    const deduped = deduplicateScoreLogs(scoreLogs);
    saveScoreLogs(deduped);
    setScoreLogs(deduped);
  };

  return (
    <div className={`min-h-screen ${currentBgPreset.className} flex flex-col font-['Be_Vietnam_Pro',sans-serif] transition-colors duration-200`}>
      {/* Floating Login Notification Toast - Hiển thị tên học sinh nổi bật khi đăng nhập */}
      {loginNotice && (
        <div className="fixed top-14 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
          <div className="bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400/80 backdrop-blur-md flex items-center gap-3 ring-4 ring-emerald-500/20">
            <span className="text-2xl shrink-0">{loginNotice.avatar || '👤'}</span>
            <div className="min-w-0">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {loginNotice.isStudent ? 'Học sinh đăng nhập thành công:' : 'Đăng nhập thành công:'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-amber-300">
                  {loginNotice.displayName}
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40">
                  {loginNotice.title}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLoginNotice(null)}
              className="text-slate-400 hover:text-white p-1 ml-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-sm font-bold"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        students={students}
        weeks={weeks}
        currentWeekId={currentWeekId}
        currentAccount={currentAccount}
        currentTheme={currentTheme}
        onSelectStudent={handleSelectStudentForQuickEntry}
        onOpenQuickEntry={() => {
          setQuickEntryStudent(null);
          setIsQuickEntryOpen(true);
        }}
        onOpenClassRoster={() => setIsClassRosterOpen(true)}
        onOpenSettings={() => setIsClassSettingsOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Role Switcher Bar */}
      <RoleSwitcher
        currentRole={currentUserRole}
        onSelectRole={handleSelectRole}
        metadata={metadata}
        students={students}
        accounts={accounts}
        currentAccountId={currentAccountId}
        onOpenRoleRemarks={() => setIsRoleRemarksOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAccountManager={() => setIsAccountManagerOpen(true)}
        onOpenScoreAuditLog={() => setIsScoreAuditLogOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Banner thông báo khi danh sách học sinh đang trống để người dùng đưa danh sách lên */}
        {students.length === 0 && (
          <div className="mb-5 p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl shadow-xl border border-indigo-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                📋
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Danh sách học sinh đang trống</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40">
                    Sẵn sàng nạp danh sách của bạn
                  </span>
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Bạn có thể nạp file Excel danh sách lớp của bạn lên để hệ thống tự động chia 6 nhóm thi đua hoặc thêm từng học sinh.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <span>Nạp file Excel danh sách</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClassRosterOpen(true)}
                className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <span>Quản lý danh sách lớp</span>
              </button>
            </div>
          </div>
        )}

        {/* Khu vực thao tác nhanh (Chuyển chế độ xem, Excel, Chấm điểm nhanh) */}
        <QuickActionBar
          weeks={weeks}
          currentWeekId={currentWeekId}
          metadata={metadata}
          currentRole={currentUserRole}
          onSelectWeek={handleSelectWeek}
          onOpenQuickEntry={() => {
            setQuickEntryStudent(null);
            setIsQuickEntryOpen(true);
          }}
          onOpenAdjustScore={() => handleOpenAdjustScore()}
          onOpenImportRoster={() => setIsImportModalOpen(true)}
          onOpenTeacherNotesModal={() => setIsTeacherNotesModalOpen(true)}
        />

        {/* Khu vực thống kê (4 thẻ tổng quan số liệu lớn nổi bật) */}
        <OverviewStatsBar
          students={students}
          records={currentRecords}
          currentWeekName={currentWeek.name}
          metadata={metadata}
          onOpenQuickEntry={() => {
            setQuickEntryStudent(null);
            setIsQuickEntryOpen(true);
          }}
        />

        {activeTab === 'competition' && (
          <GroupCompetitionView
            groups={groups}
            currentWeekName={currentWeek.name}
            onSelectStudent={handleSelectStudentForQuickEntry}
            onQuickRecordStudent={handleSelectStudentForQuickEntry}
            onOpenAdjustScore={handleOpenAdjustScore}
            onOpenImportRoster={() => setIsImportModalOpen(true)}
            teacherGroupNotes={currentTeacherGroupNotes}
            onOpenTeacherNotesModal={() => setIsTeacherNotesModalOpen(true)}
          />
        )}

        {activeTab === 'weeklyTable' && (
          <WeeklyScoreTable
            students={students}
            records={currentRecords}
            currentWeekName={currentWeek.name}
            currentRole={currentUserRole}
            assignedGroupIds={currentAccount?.assignedGroupIds}
            currentAccount={currentAccount}
            onUpdateRecord={handleUpdateRecord}
            onQuickRecordStudent={handleSelectStudentForQuickEntry}
            onOpenAdjustScore={handleOpenAdjustScore}
          />
        )}

        {activeTab === 'morningDuty' && (
          <MorningDutyView
            students={students}
            records={morningDutyRecords}
            currentWeekId={currentWeekId}
            currentWeekName={currentWeek.name}
            currentRole={currentUserRole}
            assignedGroupIds={currentAccount?.assignedGroupIds}
            currentAccount={currentAccount}
            onAddMorningRecord={handleAddMorningRecord}
            onDeleteMorningRecord={handleDeleteMorningRecord}
          />
        )}

        {activeTab === 'afternoon' && (
          <AfternoonSessionView
            students={students}
            records={afternoonRecords}
            currentWeekId={currentWeekId}
            currentWeekName={currentWeek.name}
            currentRole={currentUserRole}
            assignedGroupIds={currentAccount?.assignedGroupIds}
            currentAccount={currentAccount}
            onAddAfternoonRecord={handleAddAfternoonRecord}
            onDeleteAfternoonRecord={handleDeleteAfternoonRecord}
          />
        )}

        {activeTab === 'reports' && (
          <ReportStatsView
            groups={groups}
            students={students}
            records={currentRecords}
            currentWeek={currentWeek}
            metadata={metadata}
            onOpenPrint={() => setIsPrintOpen(true)}
            teacherGroupNotes={currentTeacherGroupNotes}
            groupRemarks={currentWeeklyRemarks?.groupRemarks}
            officerRemarks={currentWeeklyRemarks?.officerRemarks}
            onOpenTeacherNotesModal={() => setIsTeacherNotesModalOpen(true)}
            onSaveTeacherGroupNotes={handleSaveTeacherGroupNotes}
          />
        )}
      </main>

      {/* Modals */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => {
          setIsQuickEntryOpen(false);
          setQuickEntryStudent(null);
        }}
        students={students}
        initialStudent={quickEntryStudent}
        currentRole={currentUserRole}
        assignedGroupIds={currentAccount?.assignedGroupIds}
        currentAccount={currentAccount}
        currentWeekId={currentWeekId}
        onApplyViolation={handleApplyViolation}
        onOpenAdjustScore={handleOpenAdjustScore}
      />

      <ClassRosterModal
        isOpen={isClassRosterOpen}
        onClose={() => setIsClassRosterOpen(false)}
        students={students}
        metadata={metadata}
        onUpdateMetadata={handleUpdateMetadata}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        onResetData={handleResetData}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onClearAllStudents={handleClearAllStudents}
      />

      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentStudents={students}
        onApplyNewRoster={handleApplyNewRoster}
      />

      <PrintReportView
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        metadata={metadata}
        currentWeek={currentWeek}
        students={students}
        records={currentRecords}
        groups={groups}
        remarks={weeklyRemarks[currentWeekId]}
      />

      <RoleRemarksModal
        isOpen={isRoleRemarksOpen}
        onClose={() => setIsRoleRemarksOpen(false)}
        currentRole={currentUserRole}
        onSelectRole={handleSelectRole}
        metadata={metadata}
        students={students}
        currentWeek={currentWeek}
        weeklyRemarks={weeklyRemarks}
        onUpdateRemarks={handleUpdateRemarks}
      />

      <ClassSettingsModal
        isOpen={isClassSettingsOpen}
        onClose={() => setIsClassSettingsOpen(false)}
        metadata={metadata}
        onUpdateMetadata={handleUpdateMetadata}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        accounts={accounts}
        currentAccountId={currentAccountId}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAccountManager={() => setIsAccountManagerOpen(true)}
      />

      <AccountManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
        metadata={metadata}
        accounts={accounts}
        currentRole={currentUserRole}
        onUpdateAccounts={handleUpdateAccounts}
        onSelectAccount={handleLogin}
      />

      {/* Cửa sổ chọn Giao diện Theme & Mẫu màu sắc & Hình Nền */}
      <ThemeTemplateModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={themeId}
        currentBgPresetId={bgPresetId}
        onSelectTheme={handleSelectTheme}
        onSelectBgPreset={handleSelectBgPreset}
      />

      {/* Cửa sổ Nhập ghi chú phản hồi của GVCN cho 6 nhóm thi đua cuối tuần */}
      <TeacherGroupNotesModal
        isOpen={isTeacherNotesModalOpen}
        onClose={() => setIsTeacherNotesModalOpen(false)}
        currentWeekName={currentWeek.name}
        currentWeekId={currentWeekId}
        groups={groups}
        teacherGroupNotes={currentTeacherGroupNotes}
        groupRemarks={currentWeeklyRemarks?.groupRemarks}
        officerRemarks={currentWeeklyRemarks?.officerRemarks}
        students={students}
        records={currentRecords}
        onSaveTeacherGroupNotes={handleSaveTeacherGroupNotes}
      />

      {/* Cửa sổ Điều Chỉnh Điểm khi cho điểm cộng/trừ bị nhầm */}
      <AdjustScoreModal
        isOpen={isAdjustScoreOpen}
        onClose={() => {
          setIsAdjustScoreOpen(false);
          setAdjustScoreStudent(null);
        }}
        students={students}
        initialStudent={adjustScoreStudent}
        records={currentRecords}
        currentRole={currentUserRole}
        assignedGroupIds={currentAccount?.assignedGroupIds}
        currentAccount={currentAccount}
        currentWeekName={currentWeek.name}
        onSaveAdjustment={handleSaveAdjustment}
      />

      {/* Cửa sổ Nhật Ký Chỉnh Sửa Điểm - Chỉ Giáo viên chủ nhiệm thấy */}
      <ScoreAuditLogModal
        isOpen={isScoreAuditLogOpen}
        onClose={() => setIsScoreAuditLogOpen(false)}
        logs={scoreLogs}
        currentRole={currentUserRole}
        currentWeekId={currentWeekId}
        weeks={weeks}
        students={students}
        onClearLogs={handleClearScoreLogs}
        onDeleteLog={handleDeleteScoreLog}
        onDeduplicateLogs={handleDeduplicateLogs}
      />
    </div>
  );
}
