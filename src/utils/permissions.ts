import { UserRoleType, StudentWeeklyRecord, MorningDutyType } from '../types/discipline';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

// Danh mục tiêu chí chuyên trách của từng lớp phó
export const ACADEMIC_CRITERIA_KEYS = ['ktbKlbKsb', 'diemTot', 'phatBieu'] as const;

export const LABOR_CRITERIA_KEYS = ['khongThamGiaVS', 'xaRac', 'trucVSBan', 'huHongTS'] as const;

export const DISCIPLINE_CRITERIA_KEYS = [
  'diTre',
  'nghiCP',
  'nghiKP',
  'boTiet',
  'khongDongPhuc2',
  'khongDongPhuc5',
  'matTratTu',
  'noiTuc',
  'dungDienThoai',
  'voLeGV',
] as const;

/**
 * Kiểm tra xem vai trò hiện tại có được phép chỉnh sửa học sinh thuộc nhóm nào
 */
export function canEditStudent(
  role: UserRoleType,
  studentGroupId: number,
  assignedGroupIds?: number[]
): boolean {
  if (role === 'guest') {
    return false; // Chưa đăng nhập thì không được sửa
  }

  if (role === 'gvcn' || role === 'lopTruong') {
    return true; // GVCN và Lớp trưởng bao quát toàn lớp
  }

  // 3 Lớp phó được quản lý học sinh toàn lớp nhưng giới hạn theo mặt chuyên trách
  if (role === 'lopPhoHocTap' || role === 'lopPhoLaoDong' || role === 'lopPhoTratTu') {
    return true;
  }

  // 6 Nhóm trưởng: chỉ được nhập học sinh thuộc nhóm mình quản lý (nhóm nào chấm nhóm đó)
  if (role.startsWith('nhomTruong')) {
    if (assignedGroupIds && assignedGroupIds.length > 0) {
      return assignedGroupIds.includes(studentGroupId);
    }
    const defaultGroup = parseInt(role.replace('nhomTruong', ''), 10);
    return studentGroupId === defaultGroup;
  }

  return true;
}

/**
 * Kiểm tra xem vai trò hiện tại có được phép ghi nhận/sửa tiêu chí nề nếp này không
 */
export function canEditCriterion(
  role: UserRoleType,
  criterionKey: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>
): boolean {
  if (role === 'guest') {
    return false;
  }

  if (role === 'gvcn' || role === 'lopTruong') {
    return true; // Toàn quyền hoặc bao quát
  }

  // Nhóm trưởng được chấm tất cả các tiêu chí cho học sinh nhóm mình
  if (role.startsWith('nhomTruong')) {
    return true;
  }

  // Lớp phó Học tập
  if (role === 'lopPhoHocTap') {
    return (ACADEMIC_CRITERIA_KEYS as readonly string[]).includes(criterionKey);
  }

  // Lớp phó Lao động
  if (role === 'lopPhoLaoDong') {
    return (LABOR_CRITERIA_KEYS as readonly string[]).includes(criterionKey);
  }

  // Lớp phó Trật tự
  if (role === 'lopPhoTratTu') {
    return (DISCIPLINE_CRITERIA_KEYS as readonly string[]).includes(criterionKey);
  }

  return true;
}

/**
 * Kiểm tra chi tiết 1 ô điểm trong bảng sổ nề nếp
 */
export function checkCellPermission(
  role: UserRoleType,
  studentGroupId: number,
  criterionKey: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>,
  assignedGroupIds?: number[]
): PermissionCheckResult {
  // 1. Kiểm tra quyền học sinh / nhóm
  if (role === 'guest') {
    return {
      allowed: false,
      reason: 'Vui lòng đăng nhập tài khoản để chỉnh sửa nề nếp',
    };
  }

  const studentAllowed = canEditStudent(role, studentGroupId, assignedGroupIds);
  if (!studentAllowed) {
    const defaultGroup = assignedGroupIds?.join(', ') || role.replace('nhomTruong', '');
    return {
      allowed: false,
      reason: `Tài khoản của bạn chỉ được phép nhập học sinh Nhóm ${defaultGroup}`,
    };
  }

  // 2. Kiểm tra quyền tiêu chí chuyên trách
  const criterionAllowed = canEditCriterion(role, criterionKey);
  if (!criterionAllowed) {
    if (role === 'lopPhoHocTap') {
      return {
        allowed: false,
        reason: 'Lớp phó Học tập chỉ được nhập: KTB/KLB/KSB, Điểm tốt (9-10) và Phát biểu',
      };
    }
    if (role === 'lopPhoLaoDong') {
      return {
        allowed: false,
        reason: 'Lớp phó Lao động chỉ được nhập: Vệ sinh, Xả rác, Trực nhật bẩn, Hư hỏng tài sản',
      };
    }
    if (role === 'lopPhoTratTu') {
      return {
        allowed: false,
        reason: 'Lớp phó Trật tự chỉ được nhập: Chuyên cần, Đi trễ, Đồng phục, Trật tự, Học trái buổi',
      };
    }
    return {
      allowed: false,
      reason: 'Bạn không có quyền sửa tiêu chí này',
    };
  }

  return { allowed: true };
}

/**
 * Quyền nhập vi phạm 15 phút đầu giờ
 */
export function canRecordMorningDuty(
  role: UserRoleType,
  violationType: MorningDutyType,
  studentGroupId: number,
  assignedGroupIds?: number[]
): PermissionCheckResult {
  if (role === 'guest') {
    return { allowed: false, reason: 'Vui lòng đăng nhập tài khoản để ghi nhận vi phạm' };
  }

  if (role === 'gvcn' || role === 'lopTruong') return { allowed: true };

  // Nhóm trưởng: chỉ ghi nhận học sinh nhóm mình
  if (role.startsWith('nhomTruong')) {
    const isStudentOk = canEditStudent(role, studentGroupId, assignedGroupIds);
    if (!isStudentOk) {
      return {
        allowed: false,
        reason: `Nhóm trưởng chỉ được ghi nhận học sinh Nhóm ${assignedGroupIds?.join(', ')}`,
      };
    }
    return { allowed: true };
  }

  // Lớp phó Học tập: chỉ ghi nhận truy bài
  if (role === 'lopPhoHocTap') {
    if (violationType === 'truyBai') return { allowed: true };
    return {
      allowed: false,
      reason: 'Lớp phó Học tập chỉ được ghi nhận vi phạm Truy bài 15p đầu giờ',
    };
  }

  // Lớp phó Lao động: chỉ ghi nhận vệ sinh
  if (role === 'lopPhoLaoDong') {
    if (violationType === 'veSinhLop') return { allowed: true };
    return {
      allowed: false,
      reason: 'Lớp phó Lao động chỉ được ghi nhận vi phạm Vệ sinh phòng học',
    };
  }

  // Lớp phó Trật tự: khăn quàng, phù hiệu, đồng phục, đi trễ, mất trật tự
  if (role === 'lopPhoTratTu') {
    if (
      violationType === 'khanQuangPhuHieu' ||
      violationType === 'dongPhuc' ||
      violationType === 'diTre15p' ||
      violationType === 'matTratTu15p'
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Lớp phó Trật tự chỉ ghi nhận: Đồng phục, Khăn quàng, Đi trễ, Trật tự 15p',
    };
  }

  return { allowed: true };
}

/**
 * Quyền nhập học trái buổi
 */
export function canRecordAfternoon(
  role: UserRoleType,
  studentGroupId: number,
  assignedGroupIds?: number[]
): PermissionCheckResult {
  if (role === 'guest') {
    return {
      allowed: false,
      reason: 'Vui lòng đăng nhập tài khoản để điểm danh học trái buổi',
    };
  }

  if (role === 'gvcn' || role === 'lopTruong' || role === 'lopPhoTratTu') {
    return { allowed: true };
  }

  if (role.startsWith('nhomTruong')) {
    const isStudentOk = canEditStudent(role, studentGroupId, assignedGroupIds);
    if (!isStudentOk) {
      return {
        allowed: false,
        reason: `Nhóm trưởng chỉ được điểm danh học sinh Nhóm ${assignedGroupIds?.join(', ')}`,
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Chuyên trách điểm danh học trái buổi do Lớp phó Trật tự, Lớp trưởng & GVCN phụ trách',
  };
}

/**
 * Tóm tắt mô tả quyền hạn
 */
export function getRolePermissionBadge(
  role: UserRoleType,
  assignedGroupIds?: number[]
): {
  badgeText: string;
  badgeColor: string;
  scopeText: string;
} {
  switch (role) {
    case 'guest':
      return {
        badgeText: 'Chưa đăng nhập',
        badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
        scopeText: 'Chế độ chỉ xem. Vui lòng đăng nhập tài khoản để nhập dữ liệu',
      };
    case 'gvcn':
      return {
        badgeText: 'Toàn quyền',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        scopeText: 'Toàn quyền duyệt sổ, quản lý lớp, tài khoản & báo cáo',
      };
    case 'lopTruong':
      return {
        badgeText: 'Bao quát lớp',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        scopeText: 'Được nhập mọi học sinh cả 6 nhóm & mọi tiêu chí thi đua',
      };
    case 'lopPhoHocTap':
      return {
        badgeText: 'Chuyên trách Học tập',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        scopeText: 'Chỉ nhập mặt học tập: KTB/KLB/KSB, Điểm tốt (9-10), Phát biểu, Truy bài',
      };
    case 'lopPhoLaoDong':
      return {
        badgeText: 'Chuyên trách Lao động',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        scopeText: 'Chỉ nhập mặt lao động: Vệ sinh bẩn, Xả rác, Trực nhật, Tài sản',
      };
    case 'lopPhoTratTu':
      return {
        badgeText: 'Chuyên trách Trật tự',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        scopeText: 'Chỉ nhập mặt kỷ luật: Đi trễ, Khăn quàng, Đồng phục, Trật tự, Trái buổi',
      };
    default: {
      const gNum = assignedGroupIds?.join(', ') || role.replace('nhomTruong', '');
      return {
        badgeText: `Phụ trách Nhóm ${gNum}`,
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        scopeText: `Chỉ được nhập điểm & nhận xét cho học sinh thuộc Nhóm ${gNum}`,
      };
    }
  }
}
