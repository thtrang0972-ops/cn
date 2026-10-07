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

import type {
  Student,
  StudentWeeklyRecord,
  MorningDutyRecord,
  AfternoonRecord,
  WeekInfo,
  ClassMetadata,
  UserRoleType,
  WeeklyRemarksStore,
  UserAccount,
} from './types/discipline';
import {
  loadAppState,
  saveAppState,
  resetToInitialData,
  type AppState,
} from './utils/storage';
import { calculateGroupSummaries } from './utils/scoring';

// ============================================================================
// CẤU HÌNH ĐỒNG BỘ ĐÁM MÂY FIREBASE (PROJECT: trang-9618d)
// ============================================================================
const CANDIDATE_URLS = [
  'https://trang-9618d-default-rtdb.asia-southeast1.firebasedatabase.app',
  'https://trang-9618d-default-rtdb.firebaseio.com',
];

let activeFirebaseUrl = CANDIDATE_URLS[0];
let isSyncingFromCloud = false;
let lastSyncedTimestamp = 0;

async function resolveFirebaseUrl(): Promise<string> {
  for (const url of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${url}/cn_nenep_data.json`, { method: 'GET' });
      if (res.ok) {
        activeFirebaseUrl = url;
        return url;
      }
    } catch {
      // Thử link tiếp theo
    }
  }
  return activeFirebaseUrl;
}

async function syncToCloud(stateToSync: AppState) {
  if (isSyncingFromCloud || !stateToSync) return;
  try {
    const now = Date.now();
    lastSyncedTimestamp = now;

    // Không đẩy phiên đăng nhập cá nhân đè lên máy người khác
    const { currentUserRole, currentAccountId, ...sharedData } = stateToSync;

    const payload = {
      appData: sharedData,
      updatedAt: now,
    };

    await fetch(`${activeFirebaseUrl}/cn_nenep_data.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Lỗi lưu đám mây Firebase (trang-9618d):', err);
  }
}

export default function App() {
  // Load state an toàn: nếu loadAppState bị null thì dùng resetToInitialData
  const [appState, setAppState] = useState<AppState>(() => loadAppState() || resetToInitialData());
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

  // Lưu vào localStorage và tự động đẩy lên Firebase
  useEffect(() => {
    if (!appState) return;
    saveAppState(appState);
    if (!isSyncingFromCloud) {
      const timeout = setTimeout(() => {
        syncToCloud(appState);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [appState]);

  // Kích hoạt đồng bộ 2 chiều từ Firebase
  useEffect(() => {
    const pullFromCloud = async () => {
      try {
        const res = await fetch(`${activeFirebaseUrl}/cn_nenep_data.json`);
        if (!res.ok) return;
        const cloudData = await res.json();

        if (!cloudData || !cloudData.appData) {
          await syncToCloud(loadAppState() || resetToInitialData());
          return;
        }

        if (cloudData.updatedAt && cloudData.updatedAt > lastSyncedTimestamp) {
          lastSyncedTimestamp = cloudData.updatedAt;
          isSyncingFromCloud = true;

          const remote = cloudData.appData;
          setAppState((prev) => {
            const safePrev = prev || resetToInitialData();
            const merged: AppState = {
              ...safePrev,
              metadata: remote.metadata || safePrev.metadata,
              students: Array.isArray(remote.students) ? remote.students : safePrev.students || [],
              weeks: Array.isArray(remote.weeks) ? remote.weeks : safePrev.weeks || [],
              currentWeekId: remote.currentWeekId ?? safePrev.currentWeekId,
              accounts: Array.isArray(remote.accounts) ? remote.accounts : safePrev.accounts || [],
              weeklyRecords: remote.weeklyRecords || safePrev.weeklyRecords || {},
              morningDutyRecords: Array.isArray(remote.morningDutyRecords) ? remote.morningDutyRecords : [],
              afternoonRecords: Array.isArray(remote.afternoonRecords) ? remote.afternoonRecords : [],
              weeklyRemarks: remote.weeklyRemarks || safePrev.weeklyRemarks || {},
            };
            saveAppState(merged);
            return merged;
          });

          setTimeout(() => {
            isSyncingFromCloud = false;
          }, 400);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu từ Firebase (trang-9618d):', err);
      }
    };

    resolveFirebaseUrl().then(() => {
      pullFromCloud();
    });

    const timer = setInterval(() => {
      if (!isSyncingFromCloud) {
        pullFromCloud();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Phân rã state an toàn (Tránh lỗi Cannot destructure property)
  const {
    metadata = {} as ClassMetadata,
    students = [],
    weeks = [],
    currentWeekId = 1,
    currentUserRole = 'guest',
    currentAccountId = '',
    accounts = [],
    weeklyRecords = {},
    morningDutyRecords = [],
    afternoonRecords = [],
    weeklyRemarks = {},
  } = appState || {};

  // Tài khoản đang đăng nhập
  const currentAccount =
    currentUserRole === 'guest' || !currentAccountId
      ? undefined
      : accounts.find((a) => a.id === currentAccountId) ||
        accounts.find((a) => a.role === currentUserRole);

  const handleLogout = () => {
    setAppState((prev) => ({
      ...(prev || resetToInitialData()),
      currentUserRole: 'guest',
      currentAccountId: '',
    }));
  };

  // Lấy dữ liệu tuần hiện tại an toàn
  const currentWeek: WeekInfo = weeks.find((w) => w.id === currentWeekId) ||
    weeks[0] || { id: 1, name: 'Tuần 1', startDate: '', endDate: '' };
  
  const currentRecords = weeklyRecords[currentWeekId] || {};

  // Tính kết quả thi đua 6 nhóm (Có bọc Try/Catch chống crash)
  let groups: any[] = [];
  try {
    groups = calculateGroupSummaries(students, currentRecords);
  } catch (error) {
    console.error("Lỗi tính toán groups (calculateGroupSummaries):", error);
  }

  const handleSelectRole = (newRole: UserRoleType) => {
    const matched = accounts.find((a) => a.role === newRole);
    setAppState((prev) => ({
      ...(prev || resetToInitialData()),
      currentUserRole: newRole,
      currentAccountId: matched ? matched.id : (prev?.currentAccountId || ''),
    }));
  };

  const handleLogin = (accountId: string) => {
    const matched = accounts.find((a) => a.id === accountId);
    if (matched) {
      setAppState((prev) => ({
        ...(prev || resetToInitialData()),
        currentAccountId: matched.id,
        currentUserRole: matched.role,
      }));
    }
  };

  const handleUpdateAccounts = (newAccounts: UserAccount[]) => {
    setAppState((prev) => ({
      ...(prev || resetToInitialData()),
      accounts: newAccounts,
    }));
  };

  const handleSelectWeek = (weekId: number) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      return {
        ...safePrev,
        currentWeekId: weekId,
        weeklyRecords: {
          ...safePrev.weeklyRecords,
          [weekId]: safePrev.weeklyRecords[weekId] || {},
        },
      };
    });
  };

  const handleUpdateRecord = (
    studentId: string,
    updatedFields: Partial<StudentWeeklyRecord>
  ) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const weekRecs = { ...(safePrev.weeklyRecords[safePrev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[studentId] || {
        studentId,
        diTre: 0, nghiCP: 0, nghiKP: 0, boTiet: 0, ktbKlbKsb: 0,
        khongDongPhuc2: 0, diemTot: 0, phatBieu: 0, khongDongPhuc5: 0,
        matTratTu: 0, khongThamGiaVS: 0, noiTuc: 0, xaRac: 0,
        trucVSBan: 0, huHongTS: 0, voLeGV: 0, dungDienThoai: 0,
      };

      weekRecs[studentId] = {
        ...currentStudentRec,
        ...updatedFields,
      };

      return {
        ...safePrev,
        weeklyRecords: {
          ...safePrev.weeklyRecords,
          [safePrev.currentWeekId]: weekRecs,
        },
      };
    });
  };

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

    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const weekRecs = { ...(safePrev.weeklyRecords[safePrev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[studentId] || {
        studentId,
        diTre: 0, nghiCP: 0, nghiKP: 0, boTiet: 0, ktbKlbKsb: 0,
        khongDongPhuc2: 0, diemTot: 0, phatBieu: 0, khongDongPhuc5: 0,
        matTratTu: 0, khongThamGiaVS: 0, noiTuc: 0, xaRac: 0,
        trucVSBan: 0, huHongTS: 0, voLeGV: 0, dungDienThoai: 0,
      };

      const currentVal = Number(currentStudentRec[field] || 0);
      const newVal = Math.max(0, currentVal + delta);

      weekRecs[studentId] = {
        ...currentStudentRec,
        [field]: newVal,
        note: note
          ? currentStudentRec.note
            ? `${currentStudentRec.note}; ${note}`
            : note
          : currentStudentRec.note,
      };

      let newMorning = [...(safePrev.morningDutyRecords || [])];
      let newAfternoon = [...(safePrev.afternoonRecords || [])];

      if (context === 'morning') {
        const morningRec: MorningDutyRecord = {
          id: `md-${Date.now()}`,
          weekId: safePrev.currentWeekId,
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

      if (context === 'afternoon') {
        const afternoonRec: AfternoonRecord = {
          id: `an-${Date.now()}`,
          weekId: safePrev.currentWeekId,
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
        ...safePrev,
        weeklyRecords: {
          ...safePrev.weeklyRecords,
          [safePrev.currentWeekId]: weekRecs,
        },
        morningDutyRecords: newMorning,
        afternoonRecords: newAfternoon,
      };
    });
  };

  const handleAddMorningRecord = (rec: Omit<MorningDutyRecord, 'id' | 'createdAt'>) => {
    const newRecord: MorningDutyRecord = {
      ...rec,
      id: `md-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const weekRecs = { ...(safePrev.weeklyRecords[safePrev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[rec.studentId] || {
        studentId: rec.studentId,
        diTre: 0, nghiCP: 0, nghiKP: 0, boTiet: 0, ktbKlbKsb: 0,
        khongDongPhuc2: 0, diemTot: 0, phatBieu: 0, khongDongPhuc5: 0,
        matTratTu: 0, khongThamGiaVS: 0, noiTuc: 0, xaRac: 0,
        trucVSBan: 0, huHongTS: 0, voLeGV: 0, dungDienThoai: 0,
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
        ...safePrev,
        weeklyRecords: {
          ...safePrev.weeklyRecords,
          [safePrev.currentWeekId]: weekRecs,
        },
        morningDutyRecords: [newRecord, ...(safePrev.morningDutyRecords || [])],
      };
    });
  };

  const handleDeleteMorningRecord = (id: string) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      return {
        ...safePrev,
        morningDutyRecords: (safePrev.morningDutyRecords || []).filter((r) => r.id !== id),
      };
    });
  };

  const handleAddAfternoonRecord = (rec: Omit<AfternoonRecord, 'id' | 'createdAt'>) => {
    const newRecord: AfternoonRecord = {
      ...rec,
      id: `an-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const weekRecs = { ...(safePrev.weeklyRecords[safePrev.currentWeekId] || {}) };
      const currentStudentRec: StudentWeeklyRecord = weekRecs[rec.studentId] || {
        studentId: rec.studentId,
        diTre: 0, nghiCP: 0, nghiKP: 0, boTiet: 0, ktbKlbKsb: 0,
        khongDongPhuc2: 0, diemTot: 0, phatBieu: 0, khongDongPhuc5: 0,
        matTratTu: 0, khongThamGiaVS: 0, noiTuc: 0, xaRac: 0,
        trucVSBan: 0, huHongTS: 0, voLeGV: 0, dungDienThoai: 0,
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
        ...safePrev,
        weeklyRecords: {
          ...safePrev.weeklyRecords,
          [safePrev.currentWeekId]: weekRecs,
        },
        afternoonRecords: [newRecord, ...(safePrev.afternoonRecords || [])],
      };
    });
  };

  const handleDeleteAfternoonRecord = (id: string) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      return {
        ...safePrev,
        afternoonRecords: (safePrev.afternoonRecords || []).filter((r) => r.id !== id),
      };
    });
  };

  const handleUpdateMetadata = (newMeta: ClassMetadata) => {
    setAppState((prev) => ({ ...(prev || resetToInitialData()), metadata: newMeta }));
  };

  const handleAddStudent = (data: Omit<Student, 'id' | 'stt'>) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const newStt = (safePrev.students || []).length + 1;
      const newStudent: Student = {
        ...data,
        id: `hs-${Date.now()}`,
        stt: newStt,
      };
      return {
        ...safePrev,
        students: [...(safePrev.students || []), newStudent],
      };
    });
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      return {
        ...safePrev,
        students: (safePrev.students || []).map((s) => (s.id === id ? { ...s, ...updated } : s)),
      };
    });
  };

  const handleDeleteStudent = (id: string) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const remaining = (safePrev.students || []).filter((s) => s.id !== id);
      const renumbered = remaining.map((s, idx) => ({ ...s, stt: idx + 1 }));
      return {
        ...safePrev,
        students: renumbered,
      };
    });
  };

  const handleResetData = () => {
    const initial = resetToInitialData();
    setAppState(initial);
    syncToCloud(initial);
  };

  const handleApplyNewRoster = (newStudents: Student[]) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      const newWeeklyRecords = { ...safePrev.weeklyRecords };
      const currentWeekRecs: Record<string, StudentWeeklyRecord> = {};

      newStudents.forEach((s) => {
        const existingRec = safePrev.weeklyRecords[safePrev.currentWeekId]?.[s.id];
        currentWeekRecs[s.id] = existingRec || {
          studentId: s.id,
          diTre: 0, nghiCP: 0, nghiKP: 0, boTiet: 0, ktbKlbKsb: 0,
          khongDongPhuc2: 0, diemTot: 0, phatBieu: 0, khongDongPhuc5: 0,
          matTratTu: 0, khongThamGiaVS: 0, noiTuc: 0, xaRac: 0,
          trucVSBan: 0, huHongTS: 0, voLeGV: 0, dungDienThoai: 0,
        };
      });

      newWeeklyRecords[safePrev.currentWeekId] = currentWeekRecs;

      return {
        ...safePrev,
        students: newStudents,
        weeklyRecords: newWeeklyRecords,
      };
    });
  };

  const handleUpdateRemarks = (weekId: number, updated: WeeklyRemarksStore) => {
    setAppState((prev) => {
      const safePrev = prev || resetToInitialData();
      return {
        ...safePrev,
        weeklyRemarks: {
          ...safePrev.weeklyRemarks,
          [weekId]: updated,
        },
      };
    });
  };

  const handleSelectStudentForQuickEntry = (student: Student) => {
    setQuickEntryStudent(student);
    setIsQuickEntryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Header bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        weeks={weeks}
        currentWeekId={currentWeekId}
        currentAccount={currentAccount}
        onSelectWeek={handleSelectWeek}
        onOpenQuickEntry={() => {
          setQuickEntryStudent(null);
          setIsQuickEntryOpen(true);
        }}
        onOpenClassRoster={() => setIsClassRosterOpen(true)}
        onOpenImportRoster={() => setIsImportModalOpen(true)}
        onOpenSettings={() => setIsClassSettingsOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
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
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'competition' && (
          <GroupCompetitionView
            groups={groups}
            currentWeekName={currentWeek.name}
            onSelectStudent={handleSelectStudentForQuickEntry}
            onQuickRecordStudent={handleSelectStudentForQuickEntry}
            onOpenImportRoster={() => setIsImportModalOpen(true)}
          />
        )}

        {activeTab === 'weeklyTable' && (
          <WeeklyScoreTable
            students={students}
            records={currentRecords}
            currentWeekName={currentWeek.name}
            currentRole={currentUserRole}
            assignedGroupIds={currentAccount?.assignedGroupIds}
            onUpdateRecord={handleUpdateRecord}
            onQuickRecordStudent={handleSelectStudentForQuickEntry}
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
        currentWeekId={currentWeekId}
        onApplyViolation={handleApplyViolation}
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
    </div>
  );
}
