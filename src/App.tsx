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
      current
