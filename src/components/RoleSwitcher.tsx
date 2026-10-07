import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  BookOpen,
  Sparkles,
  Award,
  ChevronDown,
  Check,
  PenTool,
  Info,
  KeyRound,
  Lock,
  LogOut,
  Settings2,
  History,
} from 'lucide-react';
import { UserRoleType, ClassMetadata, Student, UserAccount } from '../types/discipline';
import { getRolePermissionBadge } from '../utils/permissions';

interface RoleSwitcherProps {
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  metadata: ClassMetadata;
  students: Student[];
  accounts: UserAccount[];
  currentAccountId: string;
  onOpenRoleRemarks: () => void;
  onOpenAuthModal: () => void;
  onOpenAccountManager: () => void;
  onOpenScoreAuditLog?: () => void;
  onLogout?: () => void;
}

export interface RoleInfo {
  id: UserRoleType;
  title: string;
  shortTitle: string;
  assignee: string;
  badgeColor: string;
  textColor: string;
  bgColor: string;
  icon: string;
  description: string;
  permissions: string[];
}

export function getRoleInfoList(metadata: ClassMetadata, students: Student[]): RoleInfo[] {
  // Tìm tên 6 nhóm trưởng từ cấu hình lớp hoặc danh sách học sinh
  const getLeaderName = (groupId: number, fallback: string) => {
    if (metadata.groupLeaders && metadata.groupLeaders[groupId]) {
      return metadata.groupLeaders[groupId];
    }
    const leader = students.find(
      (s) => s.groupId === groupId && s.isLeader && s.role !== 'Lớp trưởng' && !s.role?.includes('Lớp phó')
    );
    return leader ? leader.name : fallback;
  };

  return [
    {
      id: 'gvcn',
      title: 'Giáo viên Chủ nhiệm',
      shortTitle: 'GVCN',
      assignee: metadata.homeroomTeacher,
      badgeColor: 'border-purple-300 text-purple-700 bg-purple-50',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-600',
      icon: '👑',
      description: 'Toàn quyền quản trị, duyệt báo cáo thi đua tuần, quản lý tài khoản & chỉ đạo lớp.',
      permissions: ['Toàn quyền hệ thống', 'Phê duyệt sổ nề nếp', 'Cấu hình học sinh & nhóm', 'Quản lý tài khoản'],
    },
    {
      id: 'lopTruong',
      title: 'Lớp trưởng',
      shortTitle: 'Lớp trưởng',
      assignee: metadata.monitorName,
      badgeColor: 'border-indigo-300 text-indigo-700 bg-indigo-50',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-600',
      icon: '🎖️',
      description: 'Bao quát toàn lớp: được nhập mọi học sinh cả 6 nhóm, viết nhận xét chung tuần.',
      permissions: ['Tổng kết nề nếp toàn lớp', 'Ghi nhận mọi vi phạm cả 6 nhóm', 'Đánh giá thi đua 6 nhóm'],
    },
    {
      id: 'lopPhoHocTap',
      title: 'Lớp phó Học tập',
      shortTitle: 'LP Học tập',
      assignee: metadata.academicViceMonitorName || 'Nguyễn Thảo Linh',
      badgeColor: 'border-blue-300 text-blue-700 bg-blue-50',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-600',
      icon: '📚',
      description: 'Chuyên trách học tập: chỉ nhập KTB/KLB, phát biểu (+1đ), điểm tốt (+2đ), truy bài 15p.',
      permissions: ['Ghi nhận KTB/KLB/KSB', 'Cộng điểm tốt & phát biểu', 'Truy bài 15p đầu giờ'],
    },
    {
      id: 'lopPhoLaoDong',
      title: 'Lớp phó Lao động',
      shortTitle: 'LP Lao động',
      assignee: metadata.laborViceMonitorName || 'Bùi Quang Khải',
      badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-600',
      icon: '🧹',
      description: 'Chuyên trách vệ sinh: chỉ nhập trực VS bẩn, xả rác, không tham gia VS, tài sản lớp.',
      permissions: ['Ghi nhận trực VS bẩn', 'Xả rác / Hư hỏng tài sản', 'Vệ sinh 15p đầu giờ'],
    },
    {
      id: 'lopPhoTratTu',
      title: 'Lớp phó Trật tự',
      shortTitle: 'LP Trật tự',
      assignee: metadata.disciplineViceMonitorName || metadata.viceMonitorName || 'Lê Hoàng Yến Nhi',
      badgeColor: 'border-amber-300 text-amber-700 bg-amber-50',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-600',
      icon: '🛡️',
      description: 'Chuyên trách kỷ luật: chỉ nhập đi trễ, nghỉ học, bỏ tiết, đồng phục, mất trật tự, học trái buổi.',
      permissions: ['Ghi nhận chuyên cần & đi trễ', 'Đồng phục & khăn quàng', 'Điểm danh học trái buổi'],
    },
    {
      id: 'nhomTruong1',
      title: 'Nhóm trưởng 1',
      shortTitle: 'Nhóm trưởng 1',
      assignee: getLeaderName(1, 'Nguyễn Văn An'),
      badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-600',
      icon: '🚩',
      description: 'Nhóm trưởng 1: Phụ trách theo dõi và chấm điểm các học sinh thuộc Nhóm 1.',
      permissions: ['Chấm điểm học sinh Nhóm 1', 'Nhận xét tuần Nhóm 1'],
    },
    {
      id: 'nhomTruong2',
      title: 'Nhóm trưởng 2',
      shortTitle: 'Nhóm trưởng 2',
      assignee: getLeaderName(2, 'Đặng Ngọc Mai'),
      badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-600',
      icon: '🚩',
      description: 'Nhóm trưởng 2: Chỉ được nhập các học sinh thuộc Nhóm 2.',
      permissions: ['Chỉ nhập học sinh Nhóm 2', 'Nhận xét tuần Nhóm 2'],
    },
    {
      id: 'nhomTruong3',
      title: 'Nhóm trưởng 3',
      shortTitle: 'Nhóm trưởng 3',
      assignee: getLeaderName(3, 'Ngô Hồng Phúc'),
      badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-600',
      icon: '🚩',
      description: 'Nhóm trưởng 3: Chỉ được nhập các học sinh thuộc Nhóm 3.',
      permissions: ['Chỉ nhập học sinh Nhóm 3', 'Nhận xét tuần Nhóm 3'],
    },
    {
      id: 'nhomTruong4',
      title: 'Nhóm trưởng 4',
      shortTitle: 'Nhóm trưởng 4',
      assignee: getLeaderName(4, 'Phạm Thanh Tùng'),
      badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-600',
      icon: '🚩',
      description: 'Nhóm trưởng 4: Chỉ được nhập các học sinh thuộc Nhóm 4.',
      permissions: ['Chỉ nhập học sinh Nhóm 4', 'Nhận xét tuần Nhóm 4'],
    },
    {
      id: 'nhomTruong5',
      title: 'Nhóm trưởng 5',
      shortTitle: 'Nhóm trưởng 5',
      assignee: getLeaderName(5, 'Hoàng Kim Cúc'),
      badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-600',
      icon: '🚩',
      description: 'Nhóm trưởng 5: Chỉ được nhập các học sinh thuộc Nhóm 5.',
      permissions: ['Chỉ nhập học sinh Nhóm 5', 'Nhận xét tuần Nhóm 5'],
    },
    {
      id: 'nhomTruong6',
      title: 'Nhóm trưởng 6',
      shortTitle: 'Nhóm trưởng 6',
      assignee: getLeaderName(6, 'Đào Thu Hiền'),
      badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-600',
      icon: '🚩',
      description: 'Nhóm trưởng 6: Chỉ được nhập các học sinh thuộc Nhóm 6.',
      permissions: ['Chỉ nhập học sinh Nhóm 6', 'Nhận xét tuần Nhóm 6'],
    },
  ];
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  metadata,
  students,
  accounts,
  currentAccountId,
  onOpenRoleRemarks,
  onOpenAuthModal,
  onOpenAccountManager,
  onOpenScoreAuditLog,
  onLogout,
}) => {
  const roles = getRoleInfoList(metadata, students);
  const activeRole = roles.find((r) => r.id === currentRole);
  const activeAccount = accounts.find((a) => a.id === currentAccountId) || accounts.find((a) => a.role === currentRole);
  const badge = getRolePermissionBadge(currentRole, activeAccount?.assignedGroupIds);
  const isLoggedIn = currentRole !== 'guest' && !!activeAccount;

  return (
    <div className="w-full bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2.5 text-xs text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Khu vực thẻ trạng thái tài khoản & Phân quyền */}
        <div className="flex items-center flex-wrap gap-2.5 min-w-0">
          {/* Thẻ Trạng thái đăng nhập (Xanh lá cây - Green khi ĐÃ ĐĂNG NHẬP) */}
          {isLoggedIn && activeAccount ? (
            <div
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-900 font-bold px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs transition-colors"
              title={`Đã đăng nhập thành công: ${activeAccount.title} (@${activeAccount.username})`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-base shrink-0">{activeAccount.avatarIcon || activeRole?.icon || '👤'}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-600 font-bold text-xs">
                  {activeAccount.role === 'gvcn' ? 'Giáo viên:' : 'Học sinh đăng nhập:'}
                </span>
                <strong className="text-emerald-950 font-black text-xs sm:text-sm bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                  {activeAccount.displayName}
                </strong>
                <span className="text-xs font-bold text-slate-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  {activeAccount.title}
                </span>
                <span className="text-emerald-700 font-mono text-[11px] hidden md:inline">
                  (@{activeAccount.username})
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                Đã đăng nhập
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
              <span className="text-amber-500">🔒</span>
              <span className="font-extrabold text-amber-800">Chưa đăng nhập</span>
              <span className="text-amber-700 font-normal hidden sm:inline">(Chế độ chỉ xem)</span>
            </div>
          )}

          {/* Thẻ Badge quyền hạn chuyên trách */}
          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Quyền:</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badge.badgeColor}`}>
              {badge.badgeText}
            </span>
            <span className="text-slate-600 text-[11px] truncate max-w-xs hidden xl:inline">
              {badge.scopeText}
            </span>
          </div>
        </div>

        {/* Nhóm thẻ/nút chức năng quản lý tài khoản & phân quyền */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Nút "Đổi Tài Khoản" (Màu Vàng / Cam - Yellow/Amber) hoặc Đăng nhập */}
          {isLoggedIn ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 rounded-xl font-black transition-all cursor-pointer shadow-xs border border-amber-500/40 hover:scale-[1.02]"
              title="Đổi sang tài khoản cán sự khác hoặc GVCN"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-950" />
              <span>Đổi Tài Khoản</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black transition-all cursor-pointer shadow-xs border border-amber-500/40 hover:scale-[1.02]"
              title="Đăng nhập tài khoản bằng tên đăng nhập và mật khẩu"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-950" />
              <span>Đăng Nhập Tài Khoản</span>
            </button>
          )}

          {/* Nút "Đăng Xuất" (Màu Đỏ / Hồng đậm - Red/Rose) */}
          {isLoggedIn && onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-300 rounded-xl font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
              title="Đăng xuất tài khoản (quay về chế độ chỉ xem)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Đăng Xuất</span>
              <span className="sm:hidden">Thoát</span>
            </button>
          )}

          {/* Nút Quản lý tài khoản: CHỈ HIỂN THỊ VỚI GVCN (Màu Tím - Purple) */}
          {currentRole === 'gvcn' && (
            <button
              onClick={onOpenAccountManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold transition-colors cursor-pointer shadow-2xs"
              title="Cài đặt tên đăng nhập, mật khẩu và phân quyền các tài khoản (Dành riêng cho GVCN)"
            >
              <Settings2 className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Quản lý MK</span>
            </button>
          )}

          {/* Nút Nhật ký chỉnh sửa điểm: CHỈ HIỂN THỊ VỚI GVCN */}
          {currentRole === 'gvcn' && onOpenScoreAuditLog && (
            <button
              onClick={onOpenScoreAuditLog}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-colors cursor-pointer shadow-2xs"
              title="Nhật ký chỉnh sửa điểm nề nếp (Chỉ dành riêng cho GVCN)"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Nhật ký sửa điểm</span>
            </button>
          )}

          {/* Nút Nhập Nhận Xét & Báo Cáo Tuần */}
          <button
            onClick={onOpenRoleRemarks}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Sổ Nhận Xét 6 Nhóm</span>
            <span className="sm:hidden">Nhận Xét</span>
          </button>
        </div>
      </div>
    </div>
  );
};

