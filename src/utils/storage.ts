import {
  Student,
  StudentWeeklyRecord,
  WeekInfo,
  ClassMetadata,
  MorningDutyRecord,
  AfternoonRecord,
  UserRoleType,
  WeeklyRemarksStore,
  UserAccount,
  ScoreAdjustmentLog,
} from '../types/discipline';
import {
  INITIAL_METADATA,
  INITIAL_STUDENTS,
  INITIAL_WEEKS,
  INITIAL_WEEK4_RECORDS,
  INITIAL_MORNING_DUTY_RECORDS,
  INITIAL_AFTERNOON_RECORDS,
  INITIAL_WEEKLY_REMARKS,
  INITIAL_ACCOUNTS,
} from '../data/initialData';

const STORAGE_KEYS = {
  METADATA: 'thcs_nene_metadata_v1',
  STUDENTS: 'thcs_nene_students_v1',
  WEEKS: 'thcs_nene_weeks_v1',
  CURRENT_WEEK_ID: 'thcs_nene_current_week_id_v1',
  RECORDS: 'thcs_nene_weekly_records_v1',
  MORNING_DUTY: 'thcs_nene_morning_duty_v1',
  AFTERNOON: 'thcs_nene_afternoon_v1',
  CURRENT_USER_ROLE: 'thcs_nene_user_role_v1',
  WEEKLY_REMARKS: 'thcs_nene_weekly_remarks_v1',
  ACCOUNTS: 'thcs_nene_accounts_v1',
  CURRENT_ACCOUNT_ID: 'thcs_nene_current_acc_id_v1',
  SCORE_LOGS: 'thcs_nene_score_adjustment_logs_v1',
  CLEARED_BY_USER: 'thcs_nene_cleared_by_user_v3',
};

export interface AppState {
  metadata: ClassMetadata;
  students: Student[];
  weeks: WeekInfo[];
  currentWeekId: number;
  currentUserRole: UserRoleType;
  currentAccountId: string;
  accounts: UserAccount[];
  weeklyRecords: Record<number, Record<string, StudentWeeklyRecord>>;
  morningDutyRecords: MorningDutyRecord[];
  afternoonRecords: AfternoonRecord[];
  weeklyRemarks: Record<number, WeeklyRemarksStore>;
  scoreLogs: ScoreAdjustmentLog[];
}

export function loadAppState(): AppState {
  try {
    const rawMeta = localStorage.getItem(STORAGE_KEYS.METADATA);
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const rawWeeks = localStorage.getItem(STORAGE_KEYS.WEEKS);
    const rawWeekId = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_ID);
    const rawRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const rawMorning = localStorage.getItem(STORAGE_KEYS.MORNING_DUTY);
    const rawAfternoon = localStorage.getItem(STORAGE_KEYS.AFTERNOON);
    const rawRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    const rawRemarks = localStorage.getItem(STORAGE_KEYS.WEEKLY_REMARKS);
    const rawAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const rawAccountId = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT_ID);

    const metadata: ClassMetadata = rawMeta ? JSON.parse(rawMeta) : INITIAL_METADATA;
    if (metadata.homeroomTeacher === 'Cô Nguyễn Thị Mai Phương' || metadata.homeroomTeacher?.includes('Mai Phương') || !metadata.homeroomTeacher) {
      metadata.homeroomTeacher = 'Cô Nguyễn Thị Thuỳ Trang';
    }
    // Cập nhật tên trường thành Trường TH và THCS Phước Hưng
    if (!metadata.schoolName || metadata.schoolName.includes('Lê Quý Đôn') || metadata.schoolName.includes('TH & THCS')) {
      metadata.schoolName = 'Trường TH và THCS Phước Hưng';
    }
    // Cập nhật lớp 9A3 theo yêu cầu người dùng
    if (!metadata.className || metadata.className === '8A1') {
      metadata.className = '9A3';
      metadata.grade = 9;
    }
    if ((metadata as any).treasurerName) {
      delete (metadata as any).treasurerName;
    }

    // Theo yêu cầu người dùng: xoá hết danh sách học sinh mẫu để người dùng tự đưa danh sách của mình lên
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_BY_USER);
    let students: Student[] = [];
    if (!isCleared) {
      // Đánh dấu đã xóa danh sách mẫu để đưa danh sách mới lên
      localStorage.setItem(STORAGE_KEYS.CLEARED_BY_USER, 'true');
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      students = [];
    } else if (rawStudents) {
      try {
        students = JSON.parse(rawStudents);
      } catch {
        students = [];
      }
    }

    let weeks: WeekInfo[] = rawWeeks ? JSON.parse(rawWeeks) : INITIAL_WEEKS;
    if (!weeks || weeks.length < INITIAL_WEEKS.length) {
      weeks = INITIAL_WEEKS;
    } else {
      // Luôn đồng bộ ngày tháng năm chuẩn (Thứ 2 đến Chủ nhật) từ INITIAL_WEEKS
      weeks = INITIAL_WEEKS.map((initW) => {
        const found = weeks.find((w) => w.id === initW.id);
        return found ? { ...found, startDate: initW.startDate, endDate: initW.endDate } : initW;
      });
    }
    let currentAccountId: string = rawAccountId !== null ? rawAccountId : 'acc-gvcn';
    if (currentAccountId === 'acc-thuquy') currentAccountId = 'acc-gvcn';
    let currentUserRole: UserRoleType = rawRole ? (rawRole as UserRoleType) : 'gvcn';
    if ((currentUserRole as string) === 'thuQuy') currentUserRole = 'gvcn';
    let accounts: UserAccount[] = rawAccounts ? JSON.parse(rawAccounts) : INITIAL_ACCOUNTS;

    // Loại bỏ hoàn toàn tài khoản Thủ quỹ theo yêu cầu người dùng
    accounts = accounts.filter(
      (a) =>
        (a.role as string) !== 'thuQuy' &&
        a.id !== 'acc-thuquy' &&
        !a.username.toLowerCase().includes('thuquy') &&
        !a.title.toLowerCase().includes('thủ quỹ') &&
        !a.title.toLowerCase().includes('thủ quỷ')
    );

    // Luôn đồng bộ tên học sinh đại diện cho từng tài khoản cán sự và 6 nhóm trưởng
    accounts = syncAccountsWithRosterAndMeta(accounts, metadata, students);
    const weeklyRemarks: Record<number, WeeklyRemarksStore> = rawRemarks
      ? JSON.parse(rawRemarks)
      : INITIAL_WEEKLY_REMARKS;
    
    // Đảm bảo tên nhóm trưởng trong weeklyRemarks khớp đúng với chức vụ (tránh trùng tên Lớp trưởng / Lớp phó)
    Object.values(weeklyRemarks).forEach((w) => {
      if (w.groupRemarks) {
        if (w.groupRemarks[2]?.leaderName === 'Trần Gia Hưng') {
          w.groupRemarks[2].leaderName = metadata.groupLeaders?.[2] || 'Đặng Ngọc Mai';
        }
        if (w.groupRemarks[3]?.leaderName === 'Lê Hoàng Yến Nhi') {
          w.groupRemarks[3].leaderName = metadata.groupLeaders?.[3] || 'Ngô Hồng Phúc';
        }
      }
    });

    // Đảm bảo teacherGroupNotes tuần 4 có dữ liệu mẫu sẵn sàng
    if (!weeklyRemarks[4]?.teacherGroupNotes || Object.keys(weeklyRemarks[4].teacherGroupNotes).length === 0) {
      if (!weeklyRemarks[4]) {
        weeklyRemarks[4] = INITIAL_WEEKLY_REMARKS[4];
      } else {
        weeklyRemarks[4].teacherGroupNotes = INITIAL_WEEKLY_REMARKS[4]?.teacherGroupNotes;
      }
    }

    // Đồng bộ tên GVCN trong lời dặn nếu cần
    Object.values(weeklyRemarks).forEach((w) => {
      if (w.officerRemarks?.teacherAdvice?.teacherName?.includes('Mai Phương')) {
        w.officerRemarks.teacherAdvice.teacherName = 'Cô Nguyễn Thị Thuỳ Trang (GVCN)';
      }
    });
    
    let weeklyRecords: Record<number, Record<string, StudentWeeklyRecord>> = {};
    if (rawRecords) {
      try {
        weeklyRecords = JSON.parse(rawRecords);
      } catch {
        weeklyRecords = {};
      }
    }

    const morningDutyRecords: MorningDutyRecord[] = rawMorning
      ? JSON.parse(rawMorning)
      : [];

    const afternoonRecords: AfternoonRecord[] = rawAfternoon
      ? JSON.parse(rawAfternoon)
      : [];

    const scoreLogs = loadScoreLogs();

    return {
      metadata,
      students,
      weeks,
      currentWeekId: rawWeekId ? Number(rawWeekId) : 4,
      currentUserRole,
      currentAccountId,
      accounts,
      weeklyRecords,
      morningDutyRecords,
      afternoonRecords,
      weeklyRemarks,
      scoreLogs,
    };
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu từ localStorage, khởi tạo rỗng cho người dùng:', err);
    return {
      metadata: INITIAL_METADATA,
      students: [],
      weeks: INITIAL_WEEKS,
      currentWeekId: 4,
      currentUserRole: 'gvcn',
      currentAccountId: 'acc-gvcn',
      accounts: INITIAL_ACCOUNTS,
      weeklyRecords: {},
      morningDutyRecords: [],
      afternoonRecords: [],
      weeklyRemarks: INITIAL_WEEKLY_REMARKS,
      scoreLogs: [],
    };
  }
}

// Tự động phát hiện và loại bỏ các bản ghi nhật ký sửa điểm bị trùng lặp
export function deduplicateScoreLogs(logs: ScoreAdjustmentLog[]): ScoreAdjustmentLog[] {
  const seen = new Set<string>();
  return logs.filter((log) => {
    // Coi là trùng nếu cùng tuần, cùng học sinh, cùng tiêu chí, cùng điểm cũ & mới trong khoảng thời gian sát nhau
    const roundedTime = log.timestamp
      ? Math.floor(new Date(log.timestamp).getTime() / 60000)
      : 0;
    const key = `${log.weekId}-${log.studentId}-${log.criterionKey}-${log.oldValue}-${log.newValue}-${roundedTime}`;
    if (seen.has(key)) {
      return false; // Bỏ bớt bản ghi trùng!
    }
    seen.add(key);
    return true;
  });
}

export function loadScoreLogs(): ScoreAdjustmentLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORE_LOGS);
    if (!raw) return [];
    const parsed: ScoreAdjustmentLog[] = JSON.parse(raw);
    const deduped = deduplicateScoreLogs(parsed);
    if (deduped.length !== parsed.length) {
      saveScoreLogs(deduped);
    }
    return deduped;
  } catch {
    return [];
  }
}

export function saveScoreLogs(logs: ScoreAdjustmentLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Không thể lưu nhật ký điểm:', e);
  }
}

export function addScoreAdjustmentLog(
  log: Omit<ScoreAdjustmentLog, 'id' | 'timestamp'>
): ScoreAdjustmentLog[] {
  const current = loadScoreLogs();
  const now = Date.now();

  // Ngăn chặn ghi trùng bản ghi nếu vừa thêm cùng học sinh + tiêu chí + giá trị trong 3 giây
  const isDuplicate = current.some((c) => {
    const diff = c.timestamp ? now - new Date(c.timestamp).getTime() : 999999;
    return (
      diff < 3000 &&
      c.weekId === log.weekId &&
      c.studentId === log.studentId &&
      c.criterionKey === log.criterionKey &&
      c.oldValue === log.oldValue &&
      c.newValue === log.newValue
    );
  });

  if (isDuplicate) {
    return current;
  }

  const newEntry: ScoreAdjustmentLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...current];
  saveScoreLogs(updated);
  return updated;
}

export function deleteScoreAdjustmentLog(logId: string): ScoreAdjustmentLog[] {
  try {
    const current = loadScoreLogs();
    const updated = current.filter((l) => l.id !== logId);
    saveScoreLogs(updated);
    return updated;
  } catch (e) {
    console.error('Lỗi khi xóa bản ghi nhật ký điểm:', e);
    return [];
  }
}

export function clearAllScoreLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SCORE_LOGS);
  } catch (e) {
    console.error('Lỗi khi xóa nhật ký điểm:', e);
  }
}

export function syncAccountsWithRosterAndMeta(
  accounts: UserAccount[],
  metadata: ClassMetadata,
  students: Student[]
): UserAccount[] {
  const DEFAULT_LEADER_NAMES: Record<number, string> = {
    1: 'Nguyễn Văn An',
    2: 'Đặng Ngọc Mai',
    3: 'Ngô Hồng Phúc',
    4: 'Phạm Thanh Tùng',
    5: 'Hoàng Kim Cúc',
    6: 'Đào Thu Hiền',
  };

  return accounts.map((acc) => {
    const updated = { ...acc };
    if (updated.id === 'acc-gvcn' || updated.role === 'gvcn') {
      updated.displayName = metadata.homeroomTeacher || 'Cô Nguyễn Thị Thuỳ Trang';
    } else if (updated.role === 'lopTruong') {
      updated.displayName = metadata.monitorName || 'Trần Gia Hưng';
    } else if (updated.role === 'lopPhoHocTap') {
      updated.displayName = metadata.academicViceMonitorName || 'Nguyễn Thảo Linh';
    } else if (updated.role === 'lopPhoLaoDong') {
      updated.displayName = metadata.laborViceMonitorName || 'Bùi Quang Khải';
    } else if (updated.role === 'lopPhoTratTu') {
      updated.displayName = metadata.disciplineViceMonitorName || metadata.viceMonitorName || 'Lê Hoàng Yến Nhi';
    } else if (updated.role.startsWith('nhomTruong')) {
      const groupNum = parseInt(updated.role.replace('nhomTruong', ''), 10);
      if (!isNaN(groupNum)) {
        updated.assignedGroupIds = [groupNum];
        // 1. Ưu tiên tên cấu hình trong metadata.groupLeaders nếu có
        // 2. Tìm học sinh trong nhóm được đánh dấu isLeader và không kiêm nhiệm Lớp trưởng / Lớp phó
        // 3. Sử dụng tên mặc định chuẩn
        const explicitLeader = metadata.groupLeaders?.[groupNum];
        const studentLeader = students.find(
          (s) => s.groupId === groupNum && s.isLeader && s.role !== 'Lớp trưởng' && !s.role?.includes('Lớp phó')
        );
        const fallbackName = DEFAULT_LEADER_NAMES[groupNum] || `Nhóm trưởng ${groupNum}`;

        updated.displayName = explicitLeader || (studentLeader ? studentLeader.name : fallbackName);
        updated.description = `Nhóm trưởng ${groupNum}: Phụ trách theo dõi và chấm điểm các học sinh thuộc Nhóm ${groupNum}.`;
      }
    }
    return updated;
  });
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(state.metadata));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(state.students));
    localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(state.weeks));
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_ID, JSON.stringify(state.currentWeekId));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, state.currentUserRole);
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT_ID, state.currentAccountId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(state.accounts));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(state.weeklyRecords));
    localStorage.setItem(STORAGE_KEYS.MORNING_DUTY, JSON.stringify(state.morningDutyRecords));
    localStorage.setItem(STORAGE_KEYS.AFTERNOON, JSON.stringify(state.afternoonRecords));
    localStorage.setItem(STORAGE_KEYS.WEEKLY_REMARKS, JSON.stringify(state.weeklyRemarks));
    if (state.scoreLogs) {
      saveScoreLogs(state.scoreLogs);
    }
  } catch (err) {
    console.error('Không thể lưu state vào localStorage:', err);
  }
}

export function resetToInitialData(): AppState {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEYS.CLEARED_BY_USER, 'true');
  return {
    metadata: INITIAL_METADATA,
    students: [],
    weeks: INITIAL_WEEKS,
    currentWeekId: 4,
    currentUserRole: 'gvcn',
    currentAccountId: 'acc-gvcn',
    accounts: INITIAL_ACCOUNTS,
    weeklyRecords: {},
    morningDutyRecords: [],
    afternoonRecords: [],
    weeklyRemarks: INITIAL_WEEKLY_REMARKS,
    scoreLogs: [],
  };
}

export function exportBackupJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `NeNep_Lop_${state.metadata.className}_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
