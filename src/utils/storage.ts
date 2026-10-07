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
  METADATA: 'cn_nene_metadata_v1',
  STUDENTS: 'cn_nene_students_v1',
  WEEKS: 'cn_nene_weeks_v1',
  CURRENT_WEEK_ID: 'cn_nene_current_week_id_v1',
  RECORDS: 'cn_nene_weekly_records_v1',
  MORNING_DUTY: 'cn_nene_morning_duty_v1',
  AFTERNOON: 'cn_nene_afternoon_v1',
  CURRENT_USER_ROLE: 'cn_nene_user_role_v1',
  WEEKLY_REMARKS: 'cn_nene_weekly_remarks_v1',
  ACCOUNTS: 'cn_nene_accounts_v1',
  CURRENT_ACCOUNT_ID: 'cn_nene_current_acc_id_v1',
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

    const students: Student[] = rawStudents ? JSON.parse(rawStudents) : INITIAL_STUDENTS;
    const weeks: WeekInfo[] = rawWeeks ? JSON.parse(rawWeeks) : INITIAL_WEEKS;
    const currentWeekId: number = rawWeekId ? JSON.parse(rawWeekId) : 4;
    const currentUserRole: UserRoleType = rawRole ? (rawRole as UserRoleType) : 'gvcn';
    const accounts: UserAccount[] = rawAccounts ? JSON.parse(rawAccounts) : INITIAL_ACCOUNTS;
    // Cập nhật tên GVCN và quyền nhóm 1 nếu lưu từ phiên trước
    accounts.forEach((acc) => {
      if (acc.id === 'acc-gvcn' && (acc.displayName?.includes('Mai Phương') || !acc.displayName)) {
        acc.displayName = 'Cô Nguyễn Thị Thuỳ Trang';
      }
      if (acc.id === 'acc-nhom1') {
        acc.assignedGroupIds = [2];
      }
    });

    const currentAccountId: string = rawAccountId !== null ? rawAccountId : 'acc-gvcn';
    const weeklyRemarks: Record<number, WeeklyRemarksStore> = rawRemarks
      ? JSON.parse(rawRemarks)
      : INITIAL_WEEKLY_REMARKS;
    
    // Đồng bộ tên GVCN trong lời dặn nếu cần
    Object.values(weeklyRemarks).forEach((w) => {
      if (w.officerRemarks?.teacherAdvice?.teacherName?.includes('Mai Phương')) {
        w.officerRemarks.teacherAdvice.teacherName = 'Cô Nguyễn Thị Thuỳ Trang (GVCN)';
      }
    });
    
    let weeklyRecords: Record<number, Record<string, StudentWeeklyRecord>> = {};
    if (rawRecords) {
      weeklyRecords = JSON.parse(rawRecords);
    } else {
      // Seed tuần 4 mặc định
      weeklyRecords[4] = INITIAL_WEEK4_RECORDS;
      // Khởi tạo sơ bộ cho tuần 3 để so sánh
      const week3Rec: Record<string, StudentWeeklyRecord> = {};
      for (const s of INITIAL_STUDENTS) {
        week3Rec[s.id] = {
          studentId: s.id,
          diTre: s.groupId === 5 ? 1 : 0,
          nghiCP: 0,
          nghiKP: 0,
          boTiet: 0,
          ktbKlbKsb: s.groupId === 6 ? 1 : 0,
          khongDongPhuc2: 0,
          diemTot: s.groupId <= 2 ? 2 : 1,
          phatBieu: 2,
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
      }
      weeklyRecords[3] = week3Rec;
    }

    const morningDutyRecords: MorningDutyRecord[] = rawMorning
      ? JSON.parse(rawMorning)
      : INITIAL_MORNING_DUTY_RECORDS;

    const afternoonRecords: AfternoonRecord[] = rawAfternoon
      ? JSON.parse(rawAfternoon)
      : INITIAL_AFTERNOON_RECORDS;

    return {
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
    };
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu từ localStorage, sử dụng dữ liệu mặc định:', err);
    return {
      metadata: INITIAL_METADATA,
      students: INITIAL_STUDENTS,
      weeks: INITIAL_WEEKS,
      currentWeekId: 4,
      currentUserRole: 'gvcn',
      currentAccountId: 'acc-gvcn',
      accounts: INITIAL_ACCOUNTS,
      weeklyRecords: { 4: INITIAL_WEEK4_RECORDS },
      morningDutyRecords: INITIAL_MORNING_DUTY_RECORDS,
      afternoonRecords: INITIAL_AFTERNOON_RECORDS,
      weeklyRemarks: INITIAL_WEEKLY_REMARKS,
    };
  }
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
  } catch (err) {
    console.error('Không thể lưu state vào localStorage:', err);
  }
}

export function resetToInitialData(): AppState {
  localStorage.clear();
  return {
    metadata: INITIAL_METADATA,
    students: INITIAL_STUDENTS,
    weeks: INITIAL_WEEKS,
    currentWeekId: 4,
    currentUserRole: 'gvcn',
    currentAccountId: 'acc-gvcn',
    accounts: INITIAL_ACCOUNTS,
    weeklyRecords: { 4: INITIAL_WEEK4_RECORDS },
    morningDutyRecords: INITIAL_MORNING_DUTY_RECORDS,
    afternoonRecords: INITIAL_AFTERNOON_RECORDS,
    weeklyRemarks: INITIAL_WEEKLY_REMARKS,
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
